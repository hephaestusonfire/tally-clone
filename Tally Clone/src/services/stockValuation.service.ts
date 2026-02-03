/**
 * Stock valuation: FIFO and Weighted Average Cost.
 * Computed from voucher_stock_items; no persistent storage of calculated balances.
 */

import { supabase } from '../supabaseClient';

export type ValuationMethod = 'FIFO' | 'WEIGHTED_AVG';

/** Get stock balance (qty + value) using selected valuation method */
export async function getStockBalance(
  company_id: number,
  stock_item_id: number,
  asOnDate: string,
  method: ValuationMethod = 'WEIGHTED_AVG',
  godown_id?: number | null
): Promise<{ quantity: number; value: number; avgRate: number }> {
  const { data: item } = await supabase
    .from('stock_items')
    .select('opening_qty, opening_rate')
    .eq('company_id', company_id)
    .eq('stock_item_id', stock_item_id)
    .single();

  let qty = (item as { opening_qty?: number })?.opening_qty ?? 0;
  let value = qty * ((item as { opening_rate?: number })?.opening_rate ?? 0);

  const { data: stockRows } = await supabase
    .from('voucher_stock_items')
    .select('quantity, rate, taxable_value, voucher_id, godown_id')
    .eq('stock_item_id', stock_item_id);

  const voucherIds = [...new Set((stockRows ?? []).map((s) => s.voucher_id))];
  if (!voucherIds.length) {
    const avgRate = qty > 0 ? value / qty : 0;
    return { quantity: qty, value, avgRate };
  }

  const { data: vouchers } = await supabase
    .from('vouchers')
    .select('voucher_id, voucher_date, company_id, voucher_types(voucher_name)')
    .in('voucher_id', voucherIds)
    .eq('company_id', company_id)
    .lte('voucher_date', asOnDate);

  const purchaseTypes = new Set(['Purchase', 'GST Purchase', 'Purchase Invoice']);

  const layers: { qty: number; rate: number; date: string }[] = [];
  if (qty > 0) {
    layers.push({ qty, rate: (item as { opening_rate?: number })?.opening_rate ?? 0, date: '0000-00-00' });
  }

  const sortedRows = (stockRows ?? [])
    .filter((s) => {
      if (godown_id != null && (s as { godown_id?: number }).godown_id !== godown_id) return false;
      const v = (vouchers ?? []).find((x) => (x.voucher_id ?? (x as { id?: number }).id) === s.voucher_id);
      return !!v;
    })
    .map((s) => {
      const v = (vouchers ?? []).find((x) => (x.voucher_id ?? (x as { id?: number }).id) === s.voucher_id);
      const typeName = (v?.voucher_types as { voucher_name?: string })?.voucher_name ?? '';
      const isPurchase = purchaseTypes.has(typeName);
      return {
        qty: isPurchase ? (s.quantity ?? 0) : -(s.quantity ?? 0),
        rate: s.rate ?? (s.taxable_value ?? 0) / Math.max(1, s.quantity ?? 1),
        date: v?.voucher_date ?? '',
      };
    })
    .sort((a, b) => a.date.localeCompare(b.date));

  if (method === 'FIFO') {
    for (const r of sortedRows) {
      if (r.qty > 0) {
        layers.push({ qty: r.qty, rate: r.rate, date: r.date });
      } else {
        let toRemove = -r.qty;
        while (toRemove > 0 && layers.length) {
          const layer = layers[0];
          const take = Math.min(layer.qty, toRemove);
          layer.qty -= take;
          toRemove -= take;
          value -= take * layer.rate;
          qty -= take;
          if (layer.qty <= 0) layers.shift();
        }
      }
    }
    qty = layers.reduce((s, l) => s + l.qty, 0);
    value = layers.reduce((s, l) => s + l.qty * l.rate, 0);
  } else {
    let totalValue = value;
    for (const r of sortedRows) {
      qty += r.qty;
      totalValue += r.qty * r.rate;
      value = totalValue;
    }
  }

  const avgRate = qty > 0 ? value / qty : 0;
  return { quantity: qty, value, avgRate };
}
