/**
 * Stock movement engine.
 * On Sales: reduce stock. On Purchase: increase stock.
 * Respects godown. Prevents negative stock unless allowed.
 */

import { supabase } from '../supabaseClient';

/** Check if negative stock is allowed for company (from config or default false) */
async function isNegativeStockAllowed(company_id: number): Promise<boolean> {
  try {
    const { data } = await supabase
      .from('voucher_configurations')
      .select('warn_negative_stock')
      .eq('company_id', company_id)
      .maybeSingle();
    return (data as { warn_negative_stock?: boolean })?.warn_negative_stock === false;
  } catch {
    return false;
  }
}

/** Get current stock quantity for an item (opening + purchases - sales) */
export async function getStockQuantity(
  company_id: number,
  stock_item_id: number,
  godown_id?: number | null
): Promise<number> {
  const { data: item } = await supabase
    .from('stock_items')
    .select('opening_qty')
    .eq('company_id', company_id)
    .eq('stock_item_id', stock_item_id)
    .single();

  let qty = (item as { opening_qty?: number })?.opening_qty ?? 0;

  const { data: stockRows } = await supabase
    .from('voucher_stock_items')
    .select('quantity, voucher_id, godown_id')
    .eq('stock_item_id', stock_item_id);
  const voucherIds = [...new Set((stockRows ?? []).map((s) => s.voucher_id))];

  if (!voucherIds.length) return qty;

  const { data: vouchers } = await supabase
    .from('vouchers')
    .select('voucher_id, company_id, voucher_types(voucher_name)')
    .in('voucher_id', voucherIds)
    .eq('company_id', company_id);

  const salesTypes = new Set(['Sales', 'GST Sales', 'Sales Invoice']);
  const purchaseTypes = new Set(['Purchase', 'GST Purchase', 'Purchase Invoice']);

  for (const s of stockRows ?? []) {
    const v = (vouchers ?? []).find((x) => (x.voucher_id ?? (x as { id?: number }).id) === s.voucher_id);
    if (!v) continue;
    const typeName = (v.voucher_types as { voucher_name?: string })?.voucher_name ?? '';
    const q = s.quantity ?? 0;
    if (godown_id != null && (s as { godown_id?: number }).godown_id !== godown_id) continue;
    if (purchaseTypes.has(typeName)) qty += q;
    else if (salesTypes.has(typeName)) qty -= q;
  }
  return qty;
}

/** Validate stock before sales: ensure sufficient quantity. Throws if negative stock not allowed. */
export async function validateStockBeforeSales(
  company_id: number,
  items: { stock_item_id: number; godown_id?: number | null; quantity: number }[]
): Promise<{ valid: boolean; message?: string }> {
  const allowed = await isNegativeStockAllowed(company_id);
  for (const it of items) {
    const available = await getStockQuantity(company_id, it.stock_item_id, it.godown_id);
    if (available < it.quantity && !allowed) {
      const { data: si } = await supabase
        .from('stock_items')
        .select('item_name')
        .eq('stock_item_id', it.stock_item_id)
        .single();
      const name = (si as { item_name?: string })?.item_name ?? 'Item';
      return {
        valid: false,
        message: `Insufficient stock for ${name}. Available: ${available}, Required: ${it.quantity}. Negative stock is not allowed.`,
      };
    }
  }
  return { valid: true };
}
