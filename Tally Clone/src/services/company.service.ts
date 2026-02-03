import { supabase } from '../supabaseClient';

export async function createCompany(payload: {
  company_name: string;
  state: string;
  financial_year_start: string;
  financial_year_end: string;
  gst_enabled?: boolean;
}) {
  const { data, error } = await supabase
    .from('companies')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('[Supabase] createCompany failed:', error);
    throw error;
  }
  console.info('[Supabase] Company created:', data);
  return data;
}

export async function getCompanies() {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('company_name');

  if (error) throw error;
  return data ?? [];
}

export async function getCompany(company_id: number) {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('company_id', company_id)
    .maybeSingle();
  if (error) throw error;
  return data;
}
