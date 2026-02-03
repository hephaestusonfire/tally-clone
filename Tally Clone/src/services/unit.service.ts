import { supabase } from '../supabaseClient';

export async function createUnit(payload: {
  company_id: number;
  unit_type: 'SIMPLE' | 'COMPOUND';
  symbol: string;
  formal_name?: string;
  decimal_places: number;
  uqc?: string;
}) {
  const { data, error } = await supabase
    .from('units')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getUnits(company_id: number) {
  const { data, error } = await supabase
    .from('units')
    .select('*')
    .eq('company_id', company_id)
    .order('symbol');
  if (error) throw error;
  return data ?? [];
}
