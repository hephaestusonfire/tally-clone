import { supabase } from '../supabaseClient';

export async function createStockItem(payload: {
  company_id: number;
  stock_group_id: number;
  unit_id: number;
  item_name: string;
  hsn_sac?: string;
  gst_rate?: number;
  opening_qty?: number;
  opening_rate?: number;
  is_service?: boolean;
}) {
  const { data, error } = await supabase
    .from('stock_items')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getStockItems(company_id: number) {
  const { data, error } = await supabase
    .from('stock_items')
    .select('*, stock_groups(group_name), units(symbol)')
    .eq('company_id', company_id)
    .order('item_name');
  if (error) throw error;
  return data ?? [];
}
