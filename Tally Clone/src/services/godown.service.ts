import { supabase } from '../supabaseClient';

export async function createGodown(payload: {
  company_id: number;
  godown_name: string;
  parent_godown_id?: number;
}) {
  const { data, error } = await supabase
    .from('godowns')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getGodowns(company_id: number) {
  const { data, error } = await supabase
    .from('godowns')
    .select('*')
    .eq('company_id', company_id)
    .order('godown_name');
  if (error) throw error;
  return data ?? [];
}
