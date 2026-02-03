import { supabase } from '../supabaseClient';

export async function createLedgerGroup(payload: {
  company_id: number;
  group_name: string;
  nature: 'ASSETS' | 'LIABILITIES' | 'INCOME' | 'EXPENSE';
  parent_group_id?: number;
}) {
  const { data, error } = await supabase
    .from('ledger_groups')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getLedgerGroups(company_id: number) {
  const { data, error } = await supabase
    .from('ledger_groups')
    .select('*')
    .eq('company_id', company_id)
    .order('group_name');
  if (error) throw error;
  return data ?? [];
}
