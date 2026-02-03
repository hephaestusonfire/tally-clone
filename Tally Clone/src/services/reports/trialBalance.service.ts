/**
 * Trial Balance report logic.
 * Aggregates opening balance + DR/CR movements per ledger.
 * Returns data in format consumable by TrialBalanceView UI.
 */

import { supabase } from '../../supabaseClient';

export interface TrialBalanceAccount {
  id: number;
  name: string;
  amount: number;
  type: 'Dr' | 'Cr';
}

export interface TrialBalanceResult {
  accounts: TrialBalanceAccount[];
  totalDr: number;
  totalCr: number;
}

/** Get trial balance as of a given date */
export async function getTrialBalance(
  company_id: number,
  asOnDate: string
): Promise<TrialBalanceResult> {
  const { data: ledgers, error: lErr } = await supabase
    .from('ledgers')
    .select('ledger_id, ledger_name, opening_balance, opening_balance_type')
    .eq('company_id', company_id)
    .order('ledger_name');

  if (lErr) throw lErr;
  if (!ledgers?.length) return { accounts: [], totalDr: 0, totalCr: 0 };

  const { data: entries, error: eErr } = await supabase
    .from('voucher_ledger_entries')
    .select('voucher_id, ledger_id, amount, dr_cr');

  if (eErr) throw eErr;

  const ledgerIds = new Set(ledgers.map((l) => l.ledger_id ?? (l as { id?: number }).id));
  const entryRows = (entries ?? []).filter((e) => ledgerIds.has((e as { ledger_id: number }).ledger_id));
  const voucherIds = [...new Set(entryRows.map((e) => (e as { voucher_id: number }).voucher_id))];

  const { data: vouchers } = await supabase
    .from('vouchers')
    .select('voucher_id, voucher_date, company_id')
    .in('voucher_id', voucherIds)
    .eq('company_id', company_id);

  const validVoucherIds = new Set(
    (vouchers ?? [])
      .filter((v) => (v.voucher_date ?? '') <= asOnDate)
      .map((v) => v.voucher_id ?? (v as { id?: number }).id)
  );

  const entriesByLedger = new Map<number, { dr: number; cr: number }>();
  for (const lid of ledgerIds) entriesByLedger.set(lid, { dr: 0, cr: 0 });

  const validEntries = entryRows.filter((e) => validVoucherIds.has((e as { voucher_id: number }).voucher_id));

  for (const e of validEntries) {
    const lid = (e as { ledger_id: number }).ledger_id;
    const amt = (e as { amount: number }).amount ?? 0;
    const drCr = (e as { dr_cr: string }).dr_cr ?? 'DR';
    const cur = entriesByLedger.get(lid) ?? { dr: 0, cr: 0 };
    if (drCr === 'DR') cur.dr += amt;
    else cur.cr += amt;
    entriesByLedger.set(lid, cur);
  }

  const accounts: TrialBalanceAccount[] = [];
  let totalDr = 0;
  let totalCr = 0;

  for (const l of ledgers) {
    const lid = l.ledger_id ?? (l as { id?: number }).id;
    const openingBal = l.opening_balance ?? 0;
    const openingType = l.opening_balance_type === 'CR' ? 'CR' : 'DR';
    const entryTotals = entriesByLedger.get(lid) ?? { dr: 0, cr: 0 };

    let netDr = openingType === 'DR' ? openingBal : 0;
    let netCr = openingType === 'CR' ? openingBal : 0;
    netDr += entryTotals.dr;
    netCr += entryTotals.cr;

    const balance = netDr - netCr;
    const amount = Math.abs(balance);
    const type: 'Dr' | 'Cr' = balance >= 0 ? 'Dr' : 'Cr';

    if (amount > 0.01) {
      accounts.push({
        id: lid,
        name: l.ledger_name ?? '',
        amount,
        type,
      });
      if (type === 'Dr') totalDr += amount;
      else totalCr += amount;
    }
  }

  return { accounts, totalDr, totalCr };
}
