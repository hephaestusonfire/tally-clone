import * as React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useReportData } from '../../hooks/useReportData';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { ScrollArea } from '../ui/scroll-area';

const SALES_GROUPS = new Set(['Sales Accounts']);
const PURCHASE_GROUPS = new Set(['Purchase Accounts']);
const DIRECT_EXPENSE_GROUPS = new Set(['Direct Expenses']);
const INDIRECT_INCOME_GROUPS = new Set(['Direct Incomes', 'Indirect Incomes']);
const INDIRECT_EXPENSE_GROUPS = new Set(['Indirect Expenses']);

function aggregateByGroup(
  ledgers: { name: string; under: string; amount: number; id?: number }[],
  groupSet: Set<string>
): { name: string; amount: number; ledgers: { name: string; amount: number; id?: number }[] }[] {
  const byGroup = new Map<string, { amount: number; ledgers: { name: string; amount: number; id?: number }[] }>();
  for (const l of ledgers) {
    if (!groupSet.has(l.under)) continue;
    const cur = byGroup.get(l.under) ?? { amount: 0, ledgers: [] };
    cur.amount += l.amount;
    cur.ledgers.push({ name: l.name, amount: l.amount, id: l.id });
    byGroup.set(l.under, cur);
  }
  return Array.from(byGroup.entries()).map(([name, v]) => ({
    name,
    amount: v.amount,
    ledgers: v.ledgers,
  }));
}

export function ProfitLossView() {
  const mockData = useAppStore((s) => s.mockData);
  const reportLedgersWithBalance = useAppStore((s) => s.reportLedgersWithBalance);
  const ledgersForPL = reportLedgersWithBalance ?? mockData.ledgers;
  const stockItems = useAppStore((s) => s.stockItems);
  const financialPeriodStart = useAppStore((s) => s.financialPeriodStart);
  const financialPeriodEnd = useAppStore((s) => s.financialPeriodEnd);
  const setActiveView = useAppStore((s) => s.setActiveView);
  const setLedgerVouchersLedger = useAppStore((s) => s.setLedgerVouchersLedger);
  const activeView = useAppStore((s) => s.activeView);

  const [periodFrom, setPeriodFrom] = React.useState(financialPeriodStart.slice(0, 10));
  const [periodTo, setPeriodTo] = React.useState(financialPeriodEnd.slice(0, 10));

  useReportData(activeView === 'profit-loss' ? 'profit-loss' : '', {
    periodFrom,
    periodTo,
  });

  const salesSections = React.useMemo(
    () => aggregateByGroup(ledgersForPL, SALES_GROUPS),
    [ledgersForPL]
  );
  const purchaseSections = React.useMemo(
    () => aggregateByGroup(ledgersForPL, PURCHASE_GROUPS),
    [ledgersForPL]
  );
  const directExpSections = React.useMemo(
    () => aggregateByGroup(ledgersForPL, DIRECT_EXPENSE_GROUPS),
    [ledgersForPL]
  );
  const indirectIncSections = React.useMemo(
    () => aggregateByGroup(ledgersForPL, INDIRECT_INCOME_GROUPS),
    [ledgersForPL]
  );
  const indirectExpSections = React.useMemo(
    () => aggregateByGroup(ledgersForPL, INDIRECT_EXPENSE_GROUPS),
    [ledgersForPL]
  );

  const openingStock = React.useMemo(
    () => stockItems.reduce((s, i) => s + (i.openingQty * i.rate || i.value), 0),
    [stockItems]
  );
  const closingStock = openingStock;

  const totalSales = salesSections.reduce((s, i) => s + i.amount, 0);
  const totalPurchase = purchaseSections.reduce((s, i) => s + i.amount, 0);
  const totalDirectExp = directExpSections.reduce((s, i) => s + i.amount, 0);
  const totalIndirectInc = indirectIncSections.reduce((s, i) => s + i.amount, 0);
  const totalIndirectExp = indirectExpSections.reduce((s, i) => s + i.amount, 0);

  const grossProfit = totalSales + closingStock - (openingStock + totalPurchase + totalDirectExp);
  const netProfit = grossProfit + totalIndirectInc - totalIndirectExp;

  const drillDown = React.useCallback(
    (name: string, id: number) => {
      setLedgerVouchersLedger({ id, name });
      setActiveView('ledger-vouchers');
    },
    [setLedgerVouchersLedger, setActiveView]
  );

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') useAppStore.getState().setActiveView('gateway');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="flex h-full overflow-hidden flex-col lg:flex-row">
      <aside className="hidden lg:flex w-[240px] min-w-[240px] flex-shrink-0 border-r border-[#D0D0D0] bg-[#E8E8E8] flex-col">
        <div className="border-b border-[#D0D0D0] bg-[#D0D0D0] px-2 py-1.5 text-[11px] font-bold">
          Sections
        </div>
        <ScrollArea className="flex-1 p-1 text-[10px]">
          <ul className="space-y-0.5">
            <li className="font-semibold px-2 py-1">Opening Stock</li>
            <li className="font-semibold px-2 py-1">Purchase / Direct Exp</li>
            <li className="font-semibold px-2 py-1">Gross Profit (c/f & b/f)</li>
            <li className="font-semibold px-2 py-1 mt-1">Indirect Income / Exp</li>
            <li className="font-semibold px-2 py-1">Net Profit</li>
          </ul>
        </ScrollArea>
      </aside>
      <div className="flex-1 min-w-0 flex flex-col bg-white overflow-auto p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
          <div className="text-[14px] font-bold text-[#7F1D1D]">
            Profit &amp; Loss Account
          </div>
          <div className="flex flex-wrap items-center gap-2 text-[10px]">
            <label>From</label>
            <input
              type="date"
              className="border border-[#D0D0D0] px-2 py-1 min-h-[44px] sm:min-h-0 touch-manipulation"
              value={periodFrom}
              onChange={(e) => setPeriodFrom(e.target.value)}
            />
            <label>To</label>
            <input
              type="date"
              className="border border-[#D0D0D0] px-2 py-1 min-h-[44px] sm:min-h-0 touch-manipulation"
              value={periodTo}
              onChange={(e) => setPeriodTo(e.target.value)}
            />
          </div>
        </div>
        <div className="border border-[#D0D0D0] overflow-x-auto">
          <Table className="min-w-[280px]">
            <TableHeader>
              <TableRow className="bg-[#DC2626] hover:bg-[#DC2626]">
                <TableHead className="border-[#D0D0D0] text-white text-[10px]">
                  Particulars
                </TableHead>
                <TableHead className="w-28 border-[#D0D0D0] text-right text-white text-[10px]">
                  Amount (₹)
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="bg-[#E8E8E8]">
                <TableCell className="border-[#D0D0D0] p-1 text-[10px] font-bold">
                  Opening Stock
                </TableCell>
                <TableCell className="border-[#D0D0D0] p-1 text-right text-[10px]">
                  ₹ {openingStock.toLocaleString('en-IN')}
                </TableCell>
              </TableRow>
              <TableRow className="bg-[#E8E8E8]">
                <TableCell className="border-[#D0D0D0] p-1 text-[10px] font-bold">
                  Purchase Accounts
                </TableCell>
                <TableCell className="border-[#D0D0D0] p-1" />
              </TableRow>
              {purchaseSections.flatMap((g) =>
                g.ledgers.map((l) => (
                  <TableRow
                    key={l.name}
                    className="cursor-pointer hover:bg-[#FEE2E2]"
                    onClick={() => l.id != null && drillDown(l.name, l.id)}
                  >
                    <TableCell className="border-[#D0D0D0] p-1 pl-4 text-[10px]">
                      {l.name}
                    </TableCell>
                    <TableCell className="border-[#D0D0D0] p-1 text-right text-[10px]">
                      ₹ {l.amount.toLocaleString('en-IN')}
                    </TableCell>
                  </TableRow>
                ))
              )}
              <TableRow className="bg-[#E8E8E8]">
                <TableCell className="border-[#D0D0D0] p-1 text-[10px] font-bold">
                  Direct Expenses
                </TableCell>
                <TableCell className="border-[#D0D0D0] p-1" />
              </TableRow>
              {directExpSections.length === 0 ? (
                <TableRow>
                  <TableCell className="border-[#D0D0D0] p-1 pl-4 text-[10px] text-[#888]">
                    —
                  </TableCell>
                  <TableCell className="border-[#D0D0D0] p-1" />
                </TableRow>
              ) : (
                directExpSections.flatMap((g) =>
                  g.ledgers.map((l) => (
                    <TableRow
                      key={l.name}
                      className="cursor-pointer hover:bg-[#FEE2E2]"
                      onClick={() => l.id != null && drillDown(l.name, l.id)}
                    >
                      <TableCell className="border-[#D0D0D0] p-1 pl-4 text-[10px]">
                        {l.name}
                      </TableCell>
                      <TableCell className="border-[#D0D0D0] p-1 text-right text-[10px]">
                        ₹ {l.amount.toLocaleString('en-IN')}
                      </TableCell>
                    </TableRow>
                  ))
                )
              )}
              <TableRow className="bg-[#E8E8E8] font-bold">
                <TableCell className="border-[#D0D0D0] p-1 text-[10px]">
                  Total (Opening Stock + Purchase + Direct Exp)
                </TableCell>
                <TableCell className="border-[#D0D0D0] p-1 text-right text-[10px]">
                  ₹ {(openingStock + totalPurchase + totalDirectExp).toLocaleString('en-IN')}
                </TableCell>
              </TableRow>
              <TableRow className="bg-[#E8E8E8]">
                <TableCell className="border-[#D0D0D0] p-1 text-[10px] font-bold">
                  Sales Accounts
                </TableCell>
                <TableCell className="border-[#D0D0D0] p-1" />
              </TableRow>
              {salesSections.flatMap((g) =>
                g.ledgers.map((l) => (
                  <TableRow
                    key={l.name}
                    className="cursor-pointer hover:bg-[#FEE2E2]"
                    onClick={() => l.id != null && drillDown(l.name, l.id)}
                  >
                    <TableCell className="border-[#D0D0D0] p-1 pl-4 text-[10px]">
                      {l.name}
                    </TableCell>
                    <TableCell className="border-[#D0D0D0] p-1 text-right text-[10px]">
                      ₹ {l.amount.toLocaleString('en-IN')}
                    </TableCell>
                  </TableRow>
                ))
              )}
              <TableRow className="bg-[#E8E8E8]">
                <TableCell className="border-[#D0D0D0] p-1 pl-4 text-[10px]">
                  Closing Stock
                </TableCell>
                <TableCell className="border-[#D0D0D0] p-1 text-right text-[10px]">
                  ₹ {closingStock.toLocaleString('en-IN')}
                </TableCell>
              </TableRow>
              <TableRow className="bg-[#E8E8E8] font-bold">
                <TableCell className="border-[#D0D0D0] p-1 text-[10px]">
                  Total (Sales + Closing Stock)
                </TableCell>
                <TableCell className="border-[#D0D0D0] p-1 text-right text-[10px]">
                  ₹ {(totalSales + closingStock).toLocaleString('en-IN')}
                </TableCell>
              </TableRow>
              <TableRow className="bg-[#DC2626] text-white font-bold">
                <TableCell className="border-[#D0D0D0] p-1 text-[10px]">
                  Gross Profit (c/f)
                </TableCell>
                <TableCell className="border-[#D0D0D0] p-1 text-right text-[10px]">
                  ₹ {grossProfit.toLocaleString('en-IN')}
                </TableCell>
              </TableRow>
              <TableRow className="bg-[#E8E8E8]">
                <TableCell className="border-[#D0D0D0] p-1 text-[10px] font-bold">
                  Gross Profit (b/f)
                </TableCell>
                <TableCell className="border-[#D0D0D0] p-1 text-right text-[10px]">
                  ₹ {grossProfit.toLocaleString('en-IN')}
                </TableCell>
              </TableRow>
              <TableRow className="bg-[#E8E8E8]">
                <TableCell className="border-[#D0D0D0] p-1 text-[10px] font-bold">
                  Indirect Incomes
                </TableCell>
                <TableCell className="border-[#D0D0D0] p-1" />
              </TableRow>
              {indirectIncSections.length === 0 ? (
                <TableRow>
                  <TableCell className="border-[#D0D0D0] p-1 pl-4 text-[10px] text-[#888]">
                    —
                  </TableCell>
                  <TableCell className="border-[#D0D0D0] p-1" />
                </TableRow>
              ) : (
                indirectIncSections.flatMap((g) =>
                  g.ledgers.map((l) => (
                    <TableRow
                      key={l.name}
                      className="cursor-pointer hover:bg-[#FEE2E2]"
                      onClick={() => l.id != null && drillDown(l.name, l.id)}
                    >
                      <TableCell className="border-[#D0D0D0] p-1 pl-4 text-[10px]">
                        {l.name}
                      </TableCell>
                      <TableCell className="border-[#D0D0D0] p-1 text-right text-[10px]">
                        ₹ {l.amount.toLocaleString('en-IN')}
                      </TableCell>
                    </TableRow>
                  ))
                )
              )}
              <TableRow className="bg-[#E8E8E8]">
                <TableCell className="border-[#D0D0D0] p-1 text-[10px] font-bold">
                  Indirect Expenses
                </TableCell>
                <TableCell className="border-[#D0D0D0] p-1" />
              </TableRow>
              {indirectExpSections.flatMap((g) =>
                g.ledgers.map((l) => (
                  <TableRow
                    key={l.name}
                    className="cursor-pointer hover:bg-[#FEE2E2]"
                    onClick={() => l.id != null && drillDown(l.name, l.id)}
                  >
                    <TableCell className="border-[#D0D0D0] p-1 pl-4 text-[10px]">
                      {l.name}
                    </TableCell>
                    <TableCell className="border-[#D0D0D0] p-1 text-right text-[10px]">
                      ₹ {l.amount.toLocaleString('en-IN')}
                    </TableCell>
                  </TableRow>
                ))
              )}
              <TableRow className="bg-[#DC2626] text-white font-bold">
                <TableCell className="border-[#D0D0D0] p-1 text-[10px]">
                  Net Profit (c/f)
                </TableCell>
                <TableCell className="border-[#D0D0D0] p-1 text-right text-[10px]">
                  ₹ {netProfit.toLocaleString('en-IN')}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        <div className="mt-2 text-[10px] text-[#666]">
          Period: {periodFrom} to {periodTo} · Click ledger: drill-down · Esc: Gateway
        </div>
      </div>
    </div>
  );
}
