import * as React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useReportData } from '../../hooks/useReportData';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '../ui/table';
import { ScrollArea } from '../ui/scroll-area';

/** Group names that are liabilities (credit balance). */
const LIABILITY_GROUPS = new Set([
  'Capital Accounts',
  'Capital Account',
  'Secured Loans',
  'Current Liabilities',
  'Reserves & Surplus',
]);

/** Group names that are assets (debit balance). */
const ASSET_GROUPS = new Set([
  'Fixed Assets',
  'Current Assets',
  'Bank Accounts',
  'Cash-in-hand',
  'Deposit Accounts',
  'Loans & Advances',
  'Stock-in-hand',
  'Sundry Debtors',
]);

function aggregateByGroup(
  ledgers: { id: number; name: string; under: string; amount: number }[],
  groupSet: Set<string>
): { name: string; amount: number; ledgers: { id: number; name: string; amount: number }[] }[] {
  const byGroup = new Map<
    string,
    { amount: number; ledgers: { id: number; name: string; amount: number }[] }
  >();
  for (const l of ledgers) {
    if (!groupSet.has(l.under)) continue;
    const cur = byGroup.get(l.under) ?? { amount: 0, ledgers: [] };
    cur.amount += l.amount;
    cur.ledgers.push({ id: l.id, name: l.name, amount: l.amount });
    byGroup.set(l.under, cur);
  }
  return Array.from(byGroup.entries()).map(([name, v]) => ({
    name,
    amount: v.amount,
    ledgers: v.ledgers,
  }));
}

export function BalanceSheetView() {
  const mockData = useAppStore((s) => s.mockData);
  const reportLedgersWithBalance = useAppStore((s) => s.reportLedgersWithBalance);
  const ledgersForBS = reportLedgersWithBalance ?? mockData.ledgers;
  const financialPeriodEnd = useAppStore((s) => s.financialPeriodEnd);
  const setActiveView = useAppStore((s) => s.setActiveView);
  const setLedgerVouchersLedger = useAppStore((s) => s.setLedgerVouchersLedger);
  const activeView = useAppStore((s) => s.activeView);

  const [asOnDate, setAsOnDate] = React.useState(financialPeriodEnd.slice(0, 10));

  useReportData(activeView === 'balance-sheet' ? 'balance-sheet' : '', {
    asOnDate,
  });

  const liabilitySections = React.useMemo(
    () => aggregateByGroup(ledgersForBS, LIABILITY_GROUPS),
    [ledgersForBS]
  );
  const assetSections = React.useMemo(
    () => aggregateByGroup(ledgersForBS, ASSET_GROUPS),
    [ledgersForBS]
  );

  const totalLiabilitiesBeforePL = liabilitySections.reduce((s, i) => s + i.amount, 0);
  const totalAssets = assetSections.reduce((s, i) => s + i.amount, 0);

  const incomeGroups = new Set([
    'Sales Accounts',
    'Direct Incomes',
    'Indirect Incomes',
  ]);
  const expenseGroups = new Set([
    'Purchase Accounts',
    'Direct Expenses',
    'Indirect Expenses',
  ]);
  const totalIncome = mockData.ledgers
    .filter((l) => incomeGroups.has(l.under))
    .reduce((s, l) => s + l.amount, 0);
  const totalExpenses = ledgersForBS
    .filter((l) => expenseGroups.has(l.under))
    .reduce((s, l) => s + l.amount, 0);
  const netProfit = totalIncome - totalExpenses;

  const totalLiabilities = totalLiabilitiesBeforePL + netProfit;

  const tallyOk = Math.abs(totalAssets - totalLiabilities) < 1;

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        useAppStore.getState().setActiveView('gateway');
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="flex h-full overflow-hidden flex-col lg:flex-row">
      <aside className="hidden lg:flex w-[260px] min-w-[260px] flex-shrink-0 border-r border-[#D0D0D0] bg-[#E8E8E8] flex-col">
        <div className="border-b border-[#D0D0D0] bg-[#D0D0D0] px-2 py-1.5 text-[11px] font-bold">
          Sections
        </div>
        <ScrollArea className="flex-1 p-1 text-[10px]">
          <ul className="space-y-0.5">
            <li className="font-semibold px-2 py-1">Liabilities</li>
            {liabilitySections.map((i) => (
              <li key={i.name}>
                <button
                  type="button"
                  className="w-full text-left px-2 py-1.5 hover:bg-[#D0D0D0] rounded-sm"
                >
                  {i.name} | ₹{i.amount.toLocaleString('en-IN')}
                </button>
              </li>
            ))}
            {netProfit !== 0 && (
              <li>
                <button
                  type="button"
                  className="w-full text-left px-2 py-1.5 hover:bg-[#D0D0D0] rounded-sm font-medium"
                >
                  Net P/L | ₹{netProfit.toLocaleString('en-IN')}
                </button>
              </li>
            )}
            <li className="font-semibold px-2 py-1 mt-2">Assets</li>
            {assetSections.map((i) => (
              <li key={i.name}>
                <button
                  type="button"
                  className="w-full text-left px-2 py-1.5 hover:bg-[#D0D0D0] rounded-sm"
                >
                  {i.name} | ₹{i.amount.toLocaleString('en-IN')}
                </button>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </aside>
      <div className="flex-1 min-w-0 flex flex-col bg-white overflow-auto p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
          <div className="text-[14px] font-bold text-[#7F1D1D]">
            Balance Sheet
          </div>
          <div className="flex items-center gap-2 text-[10px]">
            <label>As on</label>
            <input
              type="date"
              className="border border-[#D0D0D0] px-2 py-1 min-h-[44px] sm:min-h-0 touch-manipulation"
              value={asOnDate}
              onChange={(e) => setAsOnDate(e.target.value)}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
          <div className="border border-[#D0D0D0] overflow-x-auto">
            <div className="bg-[#DC2626] text-white px-2 py-1.5 text-[11px] font-bold">
              Liabilities
            </div>
            <Table className="min-w-[240px]">
              <TableBody>
                {liabilitySections.flatMap((g) => [
                  <TableRow key={`g-${g.name}`} className="bg-[#E8E8E8]">
                    <TableCell className="border-[#D0D0D0] p-1 text-[10px] font-semibold">
                      {g.name}
                    </TableCell>
                    <TableCell className="border-[#D0D0D0] p-1 text-right text-[10px]">
                      ₹ {g.amount.toLocaleString('en-IN')}
                    </TableCell>
                  </TableRow>,
                  ...g.ledgers.map((l) => (
                    <TableRow
                      key={l.id}
                      className="cursor-pointer hover:bg-[#FEE2E2]"
                      onClick={() => {
                        setLedgerVouchersLedger({ id: l.id, name: l.name });
                        setActiveView('ledger-vouchers');
                      }}
                    >
                      <TableCell className="border-[#D0D0D0] p-1 pl-4 text-[10px]">
                        {l.name}
                      </TableCell>
                      <TableCell className="border-[#D0D0D0] p-1 text-right text-[10px]">
                        ₹ {l.amount.toLocaleString('en-IN')}
                      </TableCell>
                    </TableRow>
                  )),
                ])}
                {netProfit !== 0 && (
                  <TableRow className="bg-[#E8E8E8] font-bold">
                    <TableCell className="border-[#D0D0D0] p-1 text-[10px]">
                      Net Profit / Loss
                    </TableCell>
                    <TableCell className="border-[#D0D0D0] p-1 text-right text-[10px]">
                      ₹ {netProfit.toLocaleString('en-IN')}
                    </TableCell>
                  </TableRow>
                )}
                <TableRow className="bg-[#E8E8E8] font-bold">
                  <TableCell className="border-[#D0D0D0] p-1 text-[10px]">
                    Total Liabilities
                  </TableCell>
                  <TableCell className="border-[#D0D0D0] p-1 text-right text-[10px]">
                    ₹ {totalLiabilities.toLocaleString('en-IN')}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
          <div className="border border-[#D0D0D0] overflow-x-auto">
            <div className="bg-[#DC2626] text-white px-2 py-1.5 text-[11px] font-bold">
              Assets
            </div>
            <Table className="min-w-[240px]">
              <TableBody>
                {assetSections.flatMap((g) => [
                  <TableRow key={`g-${g.name}`} className="bg-[#E8E8E8]">
                    <TableCell className="border-[#D0D0D0] p-1 text-[10px] font-semibold">
                      {g.name}
                    </TableCell>
                    <TableCell className="border-[#D0D0D0] p-1 text-right text-[10px]">
                      ₹ {g.amount.toLocaleString('en-IN')}
                    </TableCell>
                  </TableRow>,
                  ...g.ledgers.map((l) => (
                    <TableRow
                      key={l.id}
                      className="cursor-pointer hover:bg-[#FEE2E2]"
                      onClick={() => {
                        setLedgerVouchersLedger({ id: l.id, name: l.name });
                        setActiveView('ledger-vouchers');
                      }}
                    >
                      <TableCell className="border-[#D0D0D0] p-1 pl-4 text-[10px]">
                        {l.name}
                      </TableCell>
                      <TableCell className="border-[#D0D0D0] p-1 text-right text-[10px]">
                        ₹ {l.amount.toLocaleString('en-IN')}
                      </TableCell>
                    </TableRow>
                  )),
                ])}
                <TableRow className="bg-[#E8E8E8] font-bold">
                  <TableCell className="border-[#D0D0D0] p-1 text-[10px]">
                    Total Assets
                  </TableCell>
                  <TableCell className="border-[#D0D0D0] p-1 text-right text-[10px]">
                    ₹ {totalAssets.toLocaleString('en-IN')}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
        {tallyOk ? (
          <div className="mt-2 text-[10px] text-green-700 font-medium">
            Tally: Assets = Liabilities (₹ {totalAssets.toLocaleString('en-IN')})
          </div>
        ) : (
          <div className="mt-2 text-[10px] text-red-700 font-medium">
            Mismatch: Assets ₹ {totalAssets.toLocaleString('en-IN')} vs Liabilities ₹ {totalLiabilities.toLocaleString('en-IN')}
          </div>
        )}
        <div className="mt-1 text-[10px] text-[#666]">
          As on {asOnDate} · Click ledger: drill-down · Esc: Gateway
        </div>
      </div>
    </div>
  );
}
