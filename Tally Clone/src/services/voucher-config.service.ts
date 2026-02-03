import { supabase } from '../supabaseClient';

export async function saveVoucherConfig(payload: {
  voucher_type_id: number;
  buyer_details?: boolean;
  bill_wise?: boolean;
  tax_inclusive?: boolean;
}) {
  const { error } = await supabase
    .from('voucher_configurations')
    .insert(payload);

  if (error) throw error;
}
