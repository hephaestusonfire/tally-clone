import { supabase } from '../supabaseClient';

export async function createCostCategory(company_id: number, category_name: string) {
  const { error } = await supabase
    .from('cost_categories')
    .insert({ company_id, category_name });

  if (error) throw error;
}

export async function createCostCentre(payload: {
  company_id: number;
  cost_category_id: number;
  centre_name: string;
  parent_centre_id?: number;
}) {
  const { data, error } = await supabase
    .from('cost_centres')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getCostCategories(company_id: number) {
  const { data, error } = await supabase
    .from('cost_categories')
    .select('*')
    .eq('company_id', company_id)
    .order('category_name');
  if (error) throw error;
  return data ?? [];
}

export async function getCostCentres(company_id: number) {
  const { data, error } = await supabase
    .from('cost_centres')
    .select('*')
    .eq('company_id', company_id)
    .order('centre_name');
  if (error) throw error;
  return data ?? [];
}
