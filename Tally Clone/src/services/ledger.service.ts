import { supabase } from '../supabaseClient';

export async function createLedger(payload: {
  company_id: number;
  ledger_name: string;
  group_id: number;
  opening_balance?: number;
  opening_balance_type?: 'DR' | 'CR';
  is_cash?: boolean;
  is_bank?: boolean;
  is_party?: boolean;
}) {
  const { data, error } = await supabase
    .from('ledgers')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getLedgers(company_id: number) {
  const { data, error } = await supabase
    .from('ledgers')
    .select(`
      ledger_id,
      ledger_name,
      opening_balance,
      opening_balance_type,
      group_id,
      is_cash,
      is_bank,
      is_party,
      ledger_groups ( group_id, group_name )
    `)
    .eq('company_id', company_id)
    .order('ledger_name');
  if (error) throw error;
  return data ?? [];
}
