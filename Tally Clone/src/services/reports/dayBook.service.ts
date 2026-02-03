/**
 * Day Book report logic.
 * Fetches vouchers by date range, calculates totals.
 * Returns data in format consumable by DayBookView UI.
 */

import { supabase } from '../../supabaseClient';

export interface DayBookVoucherRow {
  id: number;
  date: string;
  type: string;
  party: string;
  amount: number;
  dateFormatted: string;
  ref: string;
  narration: string;
  debit: number;
  credit: number;
  balance: number;
}

function formatDateForDisplay(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const mon = months[d.getMonth()];
  const yy = String(d.getFullYear()).slice(2);
  return `${day.toString().padStart(2, '0')}-${mon}-${yy}`;
}

function refPrefix(type: string): string {
  const m: Record<string, string> = {
    Sales: 'S', Purchase: 'P', Receipt: 'R', Payment: 'Pay', Journal: 'J', Contra: 'C',
  };
  return m[type] ?? 'V';
}

function getVoucherTotal(entries: { amount: number; dr_cr: string }[]): number {
  return entries.reduce((s, e) => s + (e.dr_cr === 'DR' ? e.amount : -e.amount), 0);
}

function isDebitSide(type: string): boolean {
  return ['Sales', 'Receipt', 'GST Sales'].includes(type);
}

/** Fetch vouchers in date range with ledger entries, suitable for Day Book UI */
export async function getDayBookVouchers(
  company_id: number,
  dateFrom: string,
  dateTo: string,
  voucherTypeFilter?: string
): Promise<DayBookVoucherRow[]> {
  const fromDate = new Date(dateFrom);
  const toDate = new Date(dateTo);

  const { data: vouchers, error: vErr } = await supabase
    .from('vouchers')
    .select(`
      voucher_id,
      voucher_date,
      voucher_number,
      party_ledger_id,
      narration,
      voucher_types ( voucher_name )
    `)
    .eq('company_id', company_id)
    .gte('voucher_date', fromDate.toISOString().slice(0, 10))
    .lte('voucher_date', toDate.toISOString().slice(0, 10))
    .order('voucher_date', { ascending: true })
    .order('voucher_id', { ascending: true });

  if (vErr) throw vErr;
  if (!vouchers?.length) return [];

  const partyIds = [...new Set((vouchers ?? []).map((v) => v.party_ledger_id).filter(Boolean))];
  const ledgerMap = new Map<number, string>();
  if (partyIds.length) {
    const { data: ledgers } = await supabase
      .from('ledgers')
      .select('ledger_id, ledger_name')
      .in('ledger_id', partyIds);
    for (const l of ledgers ?? []) {
      ledgerMap.set(l.ledger_id, l.ledger_name ?? '');
    }
  }

  const voucherIds = vouchers.map((v) => v.voucher_id ?? (v as { id?: number }).id).filter(Boolean);
  const { data: entries, error: eErr } = await supabase
    .from('voucher_ledger_entries')
    .select('voucher_id, amount, dr_cr')
    .in('voucher_id', voucherIds);

  if (eErr) throw eErr;

  const entriesByVoucher = new Map<number, { amount: number; dr_cr: string }[]>();
  for (const e of entries ?? []) {
    const vid = e.voucher_id;
    if (!entriesByVoucher.has(vid)) entriesByVoucher.set(vid, []);
    entriesByVoucher.get(vid)!.push({ amount: e.amount, dr_cr: e.dr_cr });
  }

  let running = 0;
  const rows: DayBookVoucherRow[] = [];

  for (const v of vouchers) {
    const vid = v.voucher_id ?? (v as { id?: number }).id;
    if (!vid) continue;

    const typeName = (v.voucher_types as { voucher_name?: string } | null)?.voucher_name ?? 'Journal';
    if (voucherTypeFilter && typeName !== voucherTypeFilter) continue;

    const vEntries = entriesByVoucher.get(vid) ?? [];
    const amount = Math.abs(getVoucherTotal(vEntries)) || 0;
    const isDebit = isDebitSide(typeName);
    const debit = isDebit ? amount : 0;
    const credit = isDebit ? 0 : amount;
    running = running + debit - credit;

    const partyLedgerId = v.party_ledger_id;
    const partyName = (partyLedgerId ? ledgerMap.get(partyLedgerId) : null) ?? (partyLedgerId ? `Ledger ${partyLedgerId}` : '—');
    const narration = v.narration || `${typeName} - ${partyName}`;

    rows.push({
      id: vid,
      date: v.voucher_date,
      type: typeName,
      party: partyName,
      amount,
      dateFormatted: formatDateForDisplay(v.voucher_date),
      ref: `${refPrefix(typeName)}/${vid}`,
      narration,
      debit,
      credit,
      balance: running,
    });
  }

  return rows;
}

/** Calculate total debit and credit for Day Book summary */
export function getDayBookTotals(rows: DayBookVoucherRow[]): { totalDebit: number; totalCredit: number } {
  let totalDebit = 0;
  let totalCredit = 0;
  for (const r of rows) {
    totalDebit += r.debit;
    totalCredit += r.credit;
  }
  return { totalDebit, totalCredit };
}
