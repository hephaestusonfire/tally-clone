/**
 * Profit & Loss report logic.
 * Uses ledger_groups.nature to aggregate INCOME vs EXPENSE.
 * Returns grouped totals for existing P&L UI.
 */

import { supabase } from '../../supabaseClient';

export interface PLGroup {
  name: string;
  amount: number;
  ledgers: { id: number; name: string; amount: number }[];
}

export interface ProfitLossResult {
  incomeGroups: PLGroup[];
  expenseGroups: PLGroup[];
  grossProfit: number;
  netProfit: number;
  totalSales: number;
  totalPurchase: number;
  totalDirectExp: number;
  totalIndirectInc: number;
  totalIndirectExp: number;
  openingStock: number;
  closingStock: number;
}

/** Get ledger balances (opening + movements) as of asOnDate */
async function getLedgerBalances(
  company_id: number,
  asOnDate: string
): Promise<Map<number, { balance: number; type: 'DR' | 'CR' }>> {
  const { data: ledgers } = await supabase
    .from('ledgers')
    .select('ledger_id, opening_balance, opening_balance_type, group_id')
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

/** Get Profit & Loss data for the period */
export async function getProfitLossData(
  company_id: number,
  _periodFrom: string,
  periodTo: string,
  openingStockValue = 0,
  closingStockValue?: number
): Promise<ProfitLossResult> {
  const balMap = await getLedgerBalances(company_id, periodTo);

  const { data: ledgers } = await supabase
    .from('ledgers')
    .select(`
      ledger_id,
      ledger_name,
      group_id,
      ledger_groups ( group_name, nature )
    `)
    .eq('company_id', company_id);

  const incomeNatures = new Set(['INCOME']);
  const expenseNatures = new Set(['EXPENSE']);

  const incomeGroups = new Map<string, { amount: number; ledgers: { id: number; name: string; amount: number }[] }>();
  const expenseGroups = new Map<string, { amount: number; ledgers: { id: number; name: string; amount: number }[] }>();

  const closingStock = closingStockValue ?? openingStockValue;

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

    if (incomeNatures.has(nature)) {
      const cur = incomeGroups.get(groupName) ?? { amount: 0, ledgers: [] };
      cur.amount += amount;
      cur.ledgers.push(entry);
      incomeGroups.set(groupName, cur);
    } else if (expenseNatures.has(nature)) {
      const cur = expenseGroups.get(groupName) ?? { amount: 0, ledgers: [] };
      cur.amount += amount;
      cur.ledgers.push(entry);
      expenseGroups.set(groupName, cur);
    }
  }

  const incomeSections: PLGroup[] = Array.from(incomeGroups.entries()).map(([name, v]) => ({
    name,
    amount: v.amount,
    ledgers: v.ledgers,
  }));
  const expenseSections: PLGroup[] = Array.from(expenseGroups.entries()).map(([name, v]) => ({
    name,
    amount: v.amount,
    ledgers: v.ledgers,
  }));

  const totalSales = incomeSections
    .filter((s) => s.name.toLowerCase().includes('sales'))
    .reduce((s, i) => s + i.amount, 0);
  const totalPurchase = expenseSections
    .filter((s) => s.name.toLowerCase().includes('purchase'))
    .reduce((s, i) => s + i.amount, 0);
  const totalDirectExp = expenseSections
    .filter((s) => s.name.toLowerCase().includes('direct'))
    .reduce((s, i) => s + i.amount, 0);
  const totalIndirectInc = incomeSections
    .filter((s) => !s.name.toLowerCase().includes('sales'))
    .reduce((s, i) => s + i.amount, 0);
  const totalIndirectExp = expenseSections
    .filter((s) => !s.name.toLowerCase().includes('purchase') && !s.name.toLowerCase().includes('direct'))
    .reduce((s, i) => s + i.amount, 0);

  const grossProfit = totalSales + closingStock - (openingStockValue + totalPurchase + totalDirectExp);
  const netProfit = grossProfit + totalIndirectInc - totalIndirectExp;

  return {
    incomeGroups: incomeSections,
    expenseGroups: expenseSections,
    grossProfit,
    netProfit,
    totalSales,
    totalPurchase,
    totalDirectExp,
    totalIndirectInc,
    totalIndirectExp,
    openingStock: openingStockValue,
    closingStock,
  };
}
