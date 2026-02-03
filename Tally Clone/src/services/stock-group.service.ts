import { supabase } from '../supabaseClient';

export async function createStockGroup(payload: {
  company_id: number;
  group_name: string;
  parent_group_id?: number;
}) {
  const { data, error } = await supabase
    .from('stock_groups')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getStockGroups(company_id: number) {
  const { data, error } = await supabase
    .from('stock_groups')
    .select('*')
    .eq('company_id', company_id)
    .order('group_name');
  if (error) throw error;
  return data ?? [];
}
