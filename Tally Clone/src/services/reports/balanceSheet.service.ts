/**
 * Balance Sheet report logic.
 * Aggregates ASSETS vs LIABILITIES + CAPITAL.
 * Ensures totals always balance.
 */

import { supabase } from '../../supabaseClient';

export interface BalanceSheetGroup {
  name: string;
  amount: number;
  ledgers: { id: number; name: string; amount: number }[];
}

export interface BalanceSheetResult {
  assetGroups: BalanceSheetGroup[];
  liabilityGroups: BalanceSheetGroup[];
  totalAssets: number;
  totalLiabilities: number;
  netProfit: number;
  balanced: boolean;
}

/** Get ledger balances (opening + movements) as of asOnDate */
async function getLedgerBalances(
  company_id: number,
  asOnDate: string
): Promise<Map<number, { balance: number; type: 'DR' | 'CR' }>> {
  const { data: ledgers } = await supabase
    .from('ledgers')
    .select('ledger_id, opening_balance, opening_balance_type')
    .eq('company_id', company_id);

  const { data: entries } = await supabase
    .from('voucher_ledger_entries')
    .select('voucher_id, ledger_id, amount, dr_cr');

  const { data: vouchers } = await supabase
    .from('vouchers')
    .select('voucher_id, voucher_date, company_id')
    .eq('company_id', company_id);

  const validVoucherIds = new Set(
    (vouchers ?? [])
      .filter((v) => (v.voucher_date ?? '') <= asOnDate)
      .map((v) => v.voucher_id ?? (v as { id?: number }).id)
  );

  const balMap = new Map<number, { balance: number; type: 'DR' | 'CR' }>();
  for (const l of ledgers ?? []) {
    const lid = l.ledger_id ?? (l as { id?: number }).id;
    const ob = l.opening_balance ?? 0;
    const obType = l.opening_balance_type === 'CR' ? 'CR' : 'DR';
    let balance = obType === 'DR' ? ob : -ob;
    balMap.set(lid, { balance, type: balance >= 0 ? 'DR' : 'CR' });
  }

  const entryList = (entries ?? []).filter((e) => validVoucherIds.has((e as { voucher_id: number }).voucher_id));
  for (const e of entryList) {
    const lid = (e as { ledger_id: number }).ledger_id;
    const amt = (e as { amount: number }).amount ?? 0;
    const drCr = (e as { dr_cr: string }).dr_cr;
    const cur = balMap.get(lid) ?? { balance: 0, type: 'DR' as const };
    cur.balance += drCr === 'DR' ? amt : -amt;
    cur.type = cur.balance >= 0 ? 'DR' : 'CR';
    balMap.set(lid, cur);
  }

  return balMap;
}

/** Get Balance Sheet data as on date */
export async function getBalanceSheetData(
  company_id: number,
  asOnDate: string,
  netProfitFromPL = 0
): Promise<BalanceSheetResult> {
  const balMap = await getLedgerBalances(company_id, asOnDate);

  const { data: ledgers } = await supabase
    .from('ledgers')
    .select(`
      ledger_id,
      ledger_name,
      group_id,
      ledger_groups ( group_name, nature )
    `)
    .eq('company_id', company_id);

  const assetNatures = new Set(['ASSETS']);
  const liabilityNatures = new Set(['LIABILITIES', 'CAPITAL']);

  const assetGroups = new Map<string, { amount: number; ledgers: { id: number; name: string; amount: number }[] }>();
  const liabilityGroups = new Map<string, { amount: number; ledgers: { id: number; name: string; amount: number }[] }>();

  for (const l of ledgers ?? []) {
    const lid = l.ledger_id ?? (l as { id?: number }).id;
    const g = l.ledger_groups;
    const groupObj = Array.isArray(g) ? g[0] : g;
    const groupName = (groupObj as { group_name?: string })?.group_name ?? '';
    const nature = (groupObj as { nature?: string })?.nature ?? '';

    const bal = balMap.get(lid);
    if (!bal || Math.abs(bal.balance) < 0.01) continue;

    const amount = Math.abs(bal.balance);
    const entry = { id: lid, name: l.ledger_name ?? '', amount };

    if (assetNatures.has(nature)) {
      const cur = assetGroups.get(groupName) ?? { amount: 0, ledgers: [] };
      cur.amount += amount;
      cur.ledgers.push(entry);
      assetGroups.set(groupName, cur);
    } else if (liabilityNatures.has(nature)) {
      const cur = liabilityGroups.get(groupName) ?? { amount: 0, ledgers: [] };
      cur.amount += amount;
      cur.ledgers.push(entry);
      liabilityGroups.set(groupName, cur);
    }
  }

  const assetSections: BalanceSheetGroup[] = Array.from(assetGroups.entries()).map(([name, v]) => ({
    name,
    amount: v.amount,
    ledgers: v.ledgers,
  }));
  const liabilitySections: BalanceSheetGroup[] = Array.from(liabilityGroups.entries()).map(([name, v]) => ({
    name,
    amount: v.amount,
    ledgers: v.ledgers,
  }));

  const totalAssets = assetSections.reduce((s, i) => s + i.amount, 0);
  const totalLiabilitiesBeforePL = liabilitySections.reduce((s, i) => s + i.amount, 0);
  const totalLiabilities = totalLiabilitiesBeforePL + netProfitFromPL;
  const balanced = Math.abs(totalAssets - totalLiabilities) < 1;

  return {
    assetGroups: assetSections,
    liabilityGroups: liabilitySections,
    totalAssets,
    totalLiabilities,
    netProfit: netProfitFromPL,
    balanced,
  };
}
