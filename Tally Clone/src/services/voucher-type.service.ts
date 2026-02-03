import { supabase } from '../supabaseClient';

export async function createVoucherType(payload: {
  company_id: number;
  voucher_name: string;
  voucher_category: 'ACCOUNTING' | 'INVENTORY';
  allow_inventory?: boolean;
  allow_gst?: boolean;
}) {
  const { data, error } = await supabase
    .from('voucher_types')
    .insert(payload)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function getVoucherTypes(company_id: number) {
  const { data, error } = await supabase
    .from('voucher_types')
    .select('*')
    .eq('company_id', company_id)
    .order('voucher_name');
  if (error) throw error;
  return data ?? [];
}
