/**
 * Inventory report services: Stock Summary, Item-wise movement, Godown-wise stock, Negative stock.
 */

import { supabase } from '../../supabaseClient';
import { getStockBalance } from '../stockValuation.service';
import { getStockQuantity } from '../stockMovement.service';

export interface StockSummaryRow {
  stock_item_id: number;
  item_name: string;
  unit: string;
  opening_qty: number;
  opening_value: number;
  current_qty: number;
  current_value: number;
  valuation_method: string;
}

export interface ItemMovementRow {
  date: string;
  voucher_type: string;
  voucher_id: number;
  quantity: number;
  rate: number;
  value: number;
  movement: 'IN' | 'OUT';
}

export interface GodownWiseStockRow {
  godown_id: number;
  godown_name: string;
  stock_item_id: number;
  item_name: string;
  quantity: number;
  value: number;
}

export interface NegativeStockRow {
  stock_item_id: number;
  item_name: string;
  quantity: number;
}

/** Stock Summary by item */
export async function getStockSummary(
  company_id: number,
  asOnDate: string,
  valuationMethod: 'FIFO' | 'WEIGHTED_AVG' = 'WEIGHTED_AVG'
): Promise<StockSummaryRow[]> {
  const { data: items } = await supabase
    .from('stock_items')
    .select('stock_item_id, item_name, opening_qty, opening_rate, units(symbol)')
    .eq('company_id', company_id)
    .order('item_name');

  const rows: StockSummaryRow[] = [];
  for (const i of items ?? []) {
    const bal = await getStockBalance(company_id, i.stock_item_id, asOnDate, valuationMethod);
    rows.push({
      stock_item_id: i.stock_item_id,
      item_name: i.item_name ?? '',
      unit: (i.units as { symbol?: string })?.symbol ?? 'Nos',
      opening_qty: i.opening_qty ?? 0,
      opening_value: (i.opening_qty ?? 0) * (i.opening_rate ?? 0),
      current_qty: bal.quantity,
      current_value: bal.value,
      valuation_method: valuationMethod,
    });
  }
  return rows;
}

/** Item-wise movement */
export async function getItemWiseMovement(
  company_id: number,
  stock_item_id: number,
  dateFrom: string,
  dateTo: string
): Promise<ItemMovementRow[]> {
  const { data: stockRows } = await supabase
    .from('voucher_stock_items')
    .select('voucher_id, quantity, rate, taxable_value')
    .eq('stock_item_id', stock_item_id);

  const voucherIds = [...new Set((stockRows ?? []).map((s) => s.voucher_id))];
  if (!voucherIds.length) return [];

  const { data: vouchers } = await supabase
    .from('vouchers')
    .select('voucher_id, voucher_date, company_id, voucher_types(voucher_name)')
    .in('voucher_id', voucherIds)
    .eq('company_id', company_id)
    .gte('voucher_date', dateFrom)
    .lte('voucher_date', dateTo);

  const purchaseTypes = new Set(['Purchase', 'GST Purchase', 'Purchase Invoice']);
  const rows: ItemMovementRow[] = [];

  for (const s of stockRows ?? []) {
    const v = (vouchers ?? []).find((x) => (x.voucher_id ?? (x as { id?: number }).id) === s.voucher_id);
    if (!v) continue;
    const typeName = (v.voucher_types as { voucher_name?: string })?.voucher_name ?? '';
    const isIn = purchaseTypes.has(typeName);
    const qty = s.quantity ?? 0;
    const rate = s.rate ?? (s.taxable_value ?? 0) / Math.max(1, qty);
    rows.push({
      date: v.voucher_date,
      voucher_type: typeName,
      voucher_id: v.voucher_id ?? (v as { id?: number }).id ?? 0,
      quantity: qty,
      rate,
      value: qty * rate,
      movement: isIn ? 'IN' : 'OUT',
    });
  }
  rows.sort((a, b) => a.date.localeCompare(b.date));
  return rows;
}

/** Godown-wise stock */
export async function getGodownWiseStock(
  company_id: number,
  asOnDate: string
): Promise<GodownWiseStockRow[]> {
  const { data: godowns } = await supabase
    .from('godowns')
    .select('godown_id, godown_name')
    .eq('company_id', company_id);

  const { data: items } = await supabase
    .from('stock_items')
    .select('stock_item_id, item_name')
    .eq('company_id', company_id);

  const rows: GodownWiseStockRow[] = [];
  for (const g of godowns ?? []) {
    for (const i of items ?? []) {
      const qty = await getStockQuantity(company_id, i.stock_item_id, g.godown_id);
      if (qty <= 0) continue;
      const bal = await getStockBalance(company_id, i.stock_item_id, asOnDate, 'WEIGHTED_AVG', g.godown_id);
      rows.push({
        godown_id: g.godown_id,
        godown_name: g.godown_name ?? '',
        stock_item_id: i.stock_item_id,
        item_name: i.item_name ?? '',
        quantity: bal.quantity,
        value: bal.value,
      });
    }
  }
  return rows;
}

/** Negative stock report */
export async function getNegativeStockReport(
  company_id: number
): Promise<NegativeStockRow[]> {
  const { data: items } = await supabase
    .from('stock_items')
    .select('stock_item_id, item_name')
    .eq('company_id', company_id);

  const rows: NegativeStockRow[] = [];
  for (const i of items ?? []) {
    const qty = await getStockQuantity(company_id, i.stock_item_id);
    if (qty < 0) {
      rows.push({
        stock_item_id: i.stock_item_id,
        item_name: i.item_name ?? '',
        quantity: qty,
      });
    }
  }
  return rows;
}
