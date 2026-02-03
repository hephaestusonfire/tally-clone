import * as React from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { ScrollArea } from '../ui/scroll-area';

/** Banking: list bank/cash ledgers, net cash flow (Inflow / Outflow), bank-wise closing. */
export function BankingView() {
  const mockData = useAppStore((s) => s.mockData);
  const companyName = useAppStore((s) => s.companyName);
  const financialPeriodStart = useAppStore((s) => s.financialPeriodStart);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [periodFrom, setPeriodFrom] = React.useState(financialPeriodStart.slice(0, 10));
  const [periodTo, setPeriodTo] = React.useState(() => new Date().toISOString().slice(0, 10));

  const bankLedgers = React.useMemo(() => {
    return mockData.ledgers.filter(
      (l) =>
        l.under === 'Bank Accounts' ||
        l.name.toLowerCase().includes('bank') ||
        l.under === 'Cash-in-hand' ||
        l.name.toLowerCase().includes('cash')
    );
  }, [mockData.ledgers]);

  const cashInflow = React.useMemo(
    () => mockData.vouchers.filter((v) => v.type === 'Receipt').reduce((s, v) => s + v.amount, 0),
    [mockData.vouchers]
  );
  const cashOutflow = React.useMemo(
    () => mockData.vouchers.filter((v) => v.type === 'Payment').reduce((s, v) => s + v.amount, 0),
    [mockData.vouchers]
  );
  const netCashFlow = cashInflow - cashOutflow;

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => (i < bankLedgers.length - 1 ? i + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => (i > 0 ? i - 1 : bankLedgers.length - 1));
      } else if (e.key === 'Escape') {
        e.preventDefault();
        useAppStore.getState().setActiveView('gateway');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [bankLedgers.length]);

  const totalBalance = bankLedgers.reduce((sum, l) => sum + l.amount, 0);

  return (
    <div className="flex h-full flex-col overflow-auto bg-[#FEF2F2] p-4">
      <div className="mb-3 flex items-center justify-between gap-2 flex-wrap">
        <div className="text-[14px] font-bold text-[#7F1D1D]">
          Cash & Bank — {companyName}
        </div>
        <div className="flex items-center gap-2 text-[10px]">
          <label>From</label>
          <input type="date" className="border border-[#D0D0D0] px-2 py-1" value={periodFrom} onChange={(e) => setPeriodFrom(e.target.value)} />
          <label>To</label>
          <input type="date" className="border border-[#D0D0D0] px-2 py-1" value={periodTo} onChange={(e) => setPeriodTo(e.target.value)} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <div className="bg-white border border-[#D0D0D0] px-3 py-2 rounded">
          <div className="text-[10px] text-[#666]">Cash In (Inflow)</div>
          <div className="text-[14px] font-bold text-green-700">₹ {cashInflow.toLocaleString('en-IN')}</div>
        </div>
        <div className="bg-white border border-[#D0D0D0] px-3 py-2 rounded">
          <div className="text-[10px] text-[#666]">Cash Out (Outflow)</div>
          <div className="text-[14px] font-bold text-red-700">₹ {cashOutflow.toLocaleString('en-IN')}</div>
        </div>
        <div className="bg-white border border-[#D0D0D0] px-3 py-2 rounded">
          <div className="text-[10px] text-[#666]">Net Cash Flow</div>
          <div className={`text-[14px] font-bold ${netCashFlow >= 0 ? 'text-green-700' : 'text-red-700'}`}>₹ {netCashFlow.toLocaleString('en-IN')}</div>
        </div>
      </div>
      <div className="text-[11px] font-semibold text-[#7F1D1D] mb-1">Bank-wise closing balances</div>
      <div className="border border-[#D0D0D0] bg-white">
        <ScrollArea className="max-h-[calc(100vh-180px)]">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#DC2626] hover:bg-[#DC2626]">
                <TableHead className="border-[#D0D0D0] text-white text-[11px]">
                  Account
                </TableHead>
                <TableHead className="border-[#D0D0D0] text-white text-[11px]">
                  Under
                </TableHead>
                <TableHead className="w-32 border-[#D0D0D0] text-right text-white text-[11px]">
                  Balance (₹)
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bankLedgers.map((l, idx) => {
                const isSelected = idx === selectedIndex;
                return (
                  <TableRow
                    key={l.id}
                    className={isSelected ? 'bg-[#FFD700]' : ''}
                  >
                    <TableCell className="border-[#D0D0D0] p-2 text-[11px]">
                      {l.name}
                    </TableCell>
                    <TableCell className="border-[#D0D0D0] p-2 text-[11px] text-[#666]">
                      {l.under}
                    </TableCell>
                    <TableCell className="border-[#D0D0D0] p-2 text-right text-[11px]">
                      ₹ {l.amount.toLocaleString('en-IN')}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
        <div className="border-t border-[#D0D0D0] bg-[#E8E8E8] px-2 py-1.5 flex justify-end">
          <span className="text-[11px] font-bold">
            Total: ₹ {totalBalance.toLocaleString('en-IN')}
          </span>
        </div>
      </div>
      <div className="mt-2 text-[10px] text-[#666]">
        ↑↓ Select · Esc Gateway
      </div>
    </div>
  );
}
