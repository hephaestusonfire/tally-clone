/**
 * Verification helpers for QA. Call from browser console or dev tools.
 * Example: import { verifySupabaseConnection } from './utils/verifySupabase'; verifySupabaseConnection();
 */

import { supabase } from '../supabaseClient';
import { getCompanies } from '../services/company.service';
import { getLedgers } from '../services/ledger.service';
import { getVouchers } from '../services/voucher.service';

export async function verifySupabaseConnection(): Promise<{ ok: boolean; message: string }> {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return { ok: false, message: 'Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY' };
  }
  try {
    const { error } = await supabase.from('companies').select('company_id').limit(1);
    if (error) return { ok: false, message: `Supabase error: ${error.message}` };
    return { ok: true, message: 'Supabase connected' };
  } catch (err) {
    return { ok: false, message: String(err) };
  }
}

export async function verifyCompaniesRead(): Promise<{ ok: boolean; count: number; message: string }> {
  try {
    const companies = await getCompanies();
    return { ok: true, count: companies?.length ?? 0, message: `Companies: ${companies?.length ?? 0}` };
  } catch (err) {
    return { ok: false, count: 0, message: String(err) };
  }
}

export async function verifyLedgersRead(companyId: number): Promise<{ ok: boolean; count: number; message: string }> {
  try {
    const ledgers = await getLedgers(companyId);
    return { ok: true, count: ledgers?.length ?? 0, message: `Ledgers: ${ledgers?.length ?? 0}` };
  } catch (err) {
    return { ok: false, count: 0, message: String(err) };
  }
}

export async function verifyVouchersRead(companyId: number): Promise<{ ok: boolean; count: number; message: string }> {
  try {
    const vouchers = await getVouchers(companyId);
    return { ok: true, count: vouchers?.length ?? 0, message: `Vouchers: ${vouchers?.length ?? 0}` };
  } catch (err) {
    return { ok: false, count: 0, message: String(err) };
  }
}
