/**
 * GST report services: Tax Analysis, HSN/SAC summary, Tax rate-wise breakup.
 * Returns data in formats consumable by existing UI tables.
 */

import { supabase } from '../../supabaseClient';

export interface GstTaxAnalysisRow {
  voucher_id: number;
  voucher_date: string;
  voucher_type: string;
  party_name: string;
  taxable_value: number;
  igst: number;
  cgst: number;
  sgst: number;
  total_tax: number;
  total: number;
}

export interface HsnsacSummaryRow {
  hsn_sac: string;
  description?: string;
  quantity: number;
  taxable_value: number;
  tax_amount: number;
  total_value: number;
}

export interface TaxRateBreakupRow {
  rate_percent: number;
  tax_type: 'IGST' | 'CGST' | 'SGST';
  taxable_value: number;
  tax_amount: number;
  voucher_count: number;
}

/** GST Tax Analysis: voucher-wise tax breakdown */
export async function getGstTaxAnalysis(
  company_id: number,
  dateFrom: string,
  dateTo: string
): Promise<GstTaxAnalysisRow[]> {
  const { data: vouchers } = await supabase
    .from('vouchers')
    .select(`
      voucher_id,
      voucher_date,
      party_ledger_id,
      voucher_types ( voucher_name )
    `)
    .eq('company_id', company_id)
    .gte('voucher_date', dateFrom)
    .lte('voucher_date', dateTo)
    .order('voucher_date');

  if (!vouchers?.length) return [];

  const voucherIds = vouchers.map((v) => v.voucher_id ?? (v as { id?: number }).id).filter(Boolean);
  const { data: ledgerEntries } = await supabase
    .from('voucher_ledger_entries')
    .select('voucher_id, ledger_id, amount, dr_cr')
    .in('voucher_id', voucherIds);

  const { data: taxRows } = await supabase
    .from('voucher_item_taxes')
    .select('voucher_id, ledger_id, amount, tax_rate')
    .in('voucher_id', voucherIds);

  const { data: ledgers } = await supabase
    .from('ledgers')
    .select('ledger_id, ledger_name')
    .eq('company_id', company_id);

  const ledgerMap = new Map((ledgers ?? []).map((l) => [l.ledger_id, l.ledger_name ?? '']));
  const taxByVoucher = new Map<number, { igst: number; cgst: number; sgst: number; taxable: number }>();

  for (const v of vouchers) {
    const vid = v.voucher_id ?? (v as { id?: number }).id;
    taxByVoucher.set(vid, { igst: 0, cgst: 0, sgst: 0, taxable: 0 });
  }

  for (const t of taxRows ?? []) {
    const cur = taxByVoucher.get(t.voucher_id);
    if (!cur) continue;
    const name = ledgerMap.get(t.ledger_id) ?? '';
    const amt = t.amount ?? 0;
    if (name.includes('IGST')) cur.igst += amt;
    else if (name.includes('CGST')) cur.cgst += amt;
    else if (name.includes('SGST')) cur.sgst += amt;
    taxByVoucher.set(t.voucher_id, cur);
  }

  for (const e of ledgerEntries ?? []) {
    const cur = taxByVoucher.get(e.voucher_id);
    if (!cur) continue;
    const name = ledgerMap.get(e.ledger_id) ?? '';
    const amt = e.amount ?? 0;
    if (name.includes('IGST')) cur.igst += amt;
    else if (name.includes('CGST')) cur.cgst += amt;
    else if (name.includes('SGST')) cur.sgst += amt;
    else if (!name.includes('Sales') && !name.includes('Purchase') && e.dr_cr === 'DR') {
      cur.taxable += amt;
    }
    taxByVoucher.set(e.voucher_id, cur);
  }

  const partyIds = [...new Set(vouchers.map((v) => v.party_ledger_id).filter(Boolean))];
  const { data: partyLedgers } = await supabase
    .from('ledgers')
    .select('ledger_id, ledger_name')
    .in('ledger_id', partyIds);
  const partyMap = new Map((partyLedgers ?? []).map((l) => [l.ledger_id, l.ledger_name ?? '']));

  const rows: GstTaxAnalysisRow[] = [];
  for (const v of vouchers) {
    const vid = v.voucher_id ?? (v as { id?: number }).id;
    const tax = taxByVoucher.get(vid) ?? { igst: 0, cgst: 0, sgst: 0, taxable: 0 };
    const totalTax = tax.igst + tax.cgst + tax.sgst;
    if (totalTax < 0.01) continue;
    rows.push({
      voucher_id: vid,
      voucher_date: v.voucher_date,
      voucher_type: (v.voucher_types as { voucher_name?: string })?.voucher_name ?? '',
      party_name: partyMap.get(v.party_ledger_id) ?? `Ledger ${v.party_ledger_id}`,
      taxable_value: tax.taxable,
      igst: tax.igst,
      cgst: tax.cgst,
      sgst: tax.sgst,
      total_tax: totalTax,
      total: tax.taxable + totalTax,
    });
  }
  return rows;
}

/** HSN/SAC summary: item-wise aggregation */
export async function getHsnsacSummary(
  company_id: number,
  dateFrom: string,
  dateTo: string
): Promise<HsnsacSummaryRow[]> {
  const { data: vouchersForHsnsac } = await supabase
    .from('vouchers')
    .select('voucher_id')
    .eq('company_id', company_id)
    .gte('voucher_date', dateFrom)
    .lte('voucher_date', dateTo);
  const voucherIdsForHsnsac = (vouchersForHsnsac ?? []).map((v) => v.voucher_id ?? (v as { id?: number }).id).filter(Boolean);

  if (!voucherIdsForHsnsac.length) return [];

  const { data: stockItems } = await supabase
    .from('voucher_stock_items')
    .select('stock_item_id, quantity, taxable_value, total_value')
    .in('voucher_id', voucherIdsForHsnsac);

  const itemIds = [...new Set((stockItems ?? []).map((s) => s.stock_item_id))];
  const { data: items } = await supabase
    .from('stock_items')
    .select('stock_item_id, item_name, hsn_sac')
    .in('stock_item_id', itemIds);

  const itemMap = new Map((items ?? []).map((i) => [i.stock_item_id, { name: i.item_name, hsn: i.hsn_sac }]));
  const byHsnsac = new Map<string, { qty: number; taxable: number; total: number; desc?: string }>();

  for (const s of stockItems ?? []) {
    const info = itemMap.get(s.stock_item_id);
    const hsn = info?.hsn ?? 'N/A';
    const cur = byHsnsac.get(hsn) ?? { qty: 0, taxable: 0, total: 0, desc: info?.name };
    cur.qty += s.quantity ?? 0;
    cur.taxable += s.taxable_value ?? 0;
    cur.total += s.total_value ?? 0;
    byHsnsac.set(hsn, cur);
  }

  const { data: taxes } = await supabase
    .from('voucher_item_taxes')
    .select('voucher_id, amount')
    .in('voucher_id', voucherIdsForHsnsac);

  const taxTotal = (taxes ?? []).reduce((s, t) => s + (t.amount ?? 0), 0);
  const rows: HsnsacSummaryRow[] = [];
  for (const [hsn, v] of byHsnsac) {
    rows.push({
      hsn_sac: hsn,
      description: v.desc,
      quantity: v.qty,
      taxable_value: v.taxable,
      tax_amount: 0,
      total_value: v.total,
    });
  }
  if (rows.length && taxTotal > 0) {
    rows[0].tax_amount = taxTotal;
  }
  return rows;
}

/** Tax rate-wise breakup */
export async function getTaxRateBreakup(
  company_id: number,
  dateFrom: string,
  dateTo: string
): Promise<TaxRateBreakupRow[]> {
  const { data: vouchersForTax } = await supabase
    .from('vouchers')
    .select('voucher_id')
    .eq('company_id', company_id)
    .gte('voucher_date', dateFrom)
    .lte('voucher_date', dateTo);
  const voucherIdsForTax = (vouchersForTax ?? []).map((v) => v.voucher_id ?? (v as { id?: number }).id).filter(Boolean);
  if (!voucherIdsForTax.length) return [];

  const { data: taxRows } = await supabase
    .from('voucher_item_taxes')
    .select('voucher_id, ledger_id, amount, tax_rate')
    .in('voucher_id', voucherIdsForTax);

  const { data: ledgers } = await supabase
    .from('ledgers')
    .select('ledger_id, ledger_name')
    .eq('company_id', company_id);

  const ledgerMap = new Map((ledgers ?? []).map((l) => [l.ledger_id, l.ledger_name ?? '']));
  const byRate = new Map<string, { rate: number; type: 'IGST' | 'CGST' | 'SGST'; taxable: number; tax: number; count: number }>();

  for (const t of taxRows ?? []) {
    const name = ledgerMap.get(t.ledger_id) ?? '';
    let type: 'IGST' | 'CGST' | 'SGST' = 'IGST';
    if (name.includes('CGST')) type = 'CGST';
    else if (name.includes('SGST')) type = 'SGST';
    const rate = t.tax_rate ?? 18;
    const key = `${type}-${rate}`;
    const cur = byRate.get(key) ?? { rate, type, taxable: 0, tax: 0, count: 0 };
    cur.tax += t.amount ?? 0;
    cur.taxable += (t.amount ?? 0) / (rate / 100);
    cur.count += 1;
    byRate.set(key, cur);
  }

  return Array.from(byRate.values()).map((v) => ({
    rate_percent: v.rate,
    tax_type: v.type,
    taxable_value: Math.round(v.taxable * 100) / 100,
    tax_amount: v.tax,
    voucher_count: v.count,
  }));
}
