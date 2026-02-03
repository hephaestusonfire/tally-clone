import { supabase } from '../supabaseClient';

export async function createCurrency(payload: {
  company_id: number;
  symbol: string;
  formal_name: string;
  iso_code?: string;
  is_base?: boolean;
}) {
  const { data, error } = await supabase
    .from('currencies')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getCurrencies(company_id: number) {
  const { data, error } = await supabase
    .from('currencies')
    .select('*')
    .eq('company_id', company_id)
    .order('symbol');
  if (error) throw error;
  return data ?? [];
}
