/**
 * Ledger report logic.
 * Fetches voucher entries for a ledger, calculates running balance.
 */

import { supabase } from '../../supabaseClient';

export interface LedgerEntryRow {
  date: string;
  voucher_id: number;
  voucher_type: string;
  narration: string;
  debit: number;
  credit: number;
  balance: number;
}

export interface LedgerBalanceResult {
  ledger_id: number;
  ledger_name: string;
  opening_balance: number;
  opening_balance_type: 'DR' | 'CR';
  closing_balance: number;
  closing_balance_type: 'DR' | 'CR';
  entries: LedgerEntryRow[];
}

/** Get opening balance for a ledger (from ledgers table) */
function getOpeningBalance(opening_balance: number | null, opening_balance_type: string | null): { bal: number; type: 'DR' | 'CR' } {
  const ob = opening_balance ?? 0;
  const isCr = opening_balance_type === 'CR';
  return { bal: Math.abs(ob), type: isCr ? 'CR' : 'DR' };
}

/** Fetch all voucher entries for a ledger with running balance */
export async function getLedgerEntries(
  company_id: number,
  ledger_id: number,
  dateFrom?: string,
  dateTo?: string
): Promise<LedgerBalanceResult | null> {
  const { data: ledger, error: lErr } = await supabase
    .from('ledgers')
    .select('ledger_id, ledger_name, opening_balance, opening_balance_type')
    .eq('company_id', company_id)
    .eq('ledger_id', ledger_id)
    .single();

  if (lErr || !ledger) return null;

  const { data: entries, error: eErr } = await supabase
    .from('voucher_ledger_entries')
    .select('voucher_id, amount, dr_cr')
    .eq('ledger_id', ledger_id);

  if (eErr) throw eErr;
  if (!entries?.length) {
    const { bal, type } = getOpeningBalance(ledger.opening_balance, ledger.opening_balance_type);
    return {
      ledger_id: ledger.ledger_id ?? ledger_id,
      ledger_name: ledger.ledger_name ?? '',
      opening_balance: bal,
      opening_balance_type: type,
      closing_balance: bal,
      closing_balance_type: type,
      entries: [],
    };
  }

  const voucherIds = [...new Set(entries.map((e) => e.voucher_id))];
  const { data: vouchers } = await supabase
    .from('vouchers')
    .select('voucher_id, voucher_date, company_id, voucher_types(voucher_name)')
    .in('voucher_id', voucherIds)
    .eq('company_id', company_id);

  const vMap = new Map(
    (vouchers ?? []).map((v) => [
      v.voucher_id ?? (v as { id?: number }).id,
      {
        date: v.voucher_date,
        type: (v.voucher_types as { voucher_name?: string })?.voucher_name ?? 'Journal',
      },
    ])
  );

  let running =
    (ledger.opening_balance_type === 'CR' ? -(ledger.opening_balance ?? 0) : (ledger.opening_balance ?? 0));
  const { bal: openingBal, type: openingType } = getOpeningBalance(
    ledger.opening_balance,
    ledger.opening_balance_type
  );
  running = openingType === 'DR' ? openingBal : -openingBal;

  const merged = entries
    .map((e) => {
      const v = vMap.get(e.voucher_id);
      if (!v) return null;
      if (dateFrom && v.date < dateFrom) return null;
      if (dateTo && v.date > dateTo) return null;
      return { ...e, voucher_date: v.date, voucher_type: v.type };
    })
    .filter(Boolean) as { voucher_id: number; amount: number; dr_cr: string; voucher_date: string; voucher_type: string }[];

  merged.sort((a, b) => a.voucher_date.localeCompare(b.voucher_date) || a.voucher_id - b.voucher_id);

  const entryRows: LedgerEntryRow[] = [];
  for (const e of merged) {
    const amt = e.amount ?? 0;
    const isDr = e.dr_cr === 'DR';
    const debit = isDr ? amt : 0;
    const credit = isDr ? 0 : amt;
    running += debit - credit;
    entryRows.push({
      date: e.voucher_date,
      voucher_id: e.voucher_id,
      voucher_type: e.voucher_type,
      narration: '',
      debit,
      credit,
      balance: running,
    });
  }

  const closingBal = Math.abs(running);
  const closingType: 'DR' | 'CR' = running >= 0 ? 'DR' : 'CR';

  return {
    ledger_id: ledger.ledger_id ?? ledger_id,
    ledger_name: ledger.ledger_name ?? '',
    opening_balance: openingBal,
    opening_balance_type: openingType,
    closing_balance: closingBal,
    closing_balance_type: closingType,
    entries: entryRows,
  };
}

/** Calculate ledger balance: opening + sum(DR) - sum(CR) for entries up to asOnDate */
export async function getLedgerBalance(
  company_id: number,
  ledger_id: number,
  asOnDate: string
): Promise<{ balance: number; type: 'DR' | 'CR' }> {
  const result = await getLedgerEntries(company_id, ledger_id, undefined, asOnDate);
  if (!result) return { balance: 0, type: 'DR' };
  return {
    balance: result.closing_balance,
    type: result.closing_balance_type,
  };
}
