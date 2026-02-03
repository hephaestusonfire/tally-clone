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

function isDebtorLedger(l: { under: string; name: string }): boolean {
  return l.under === 'Current Assets' && /debtor|debtors/i.test(l.name);
}
function isCreditorLedger(l: { under: string; name: string }): boolean {
  return l.under === 'Current Liabilities' && /creditor|creditors/i.test(l.name);
}

export function ReceivablesPayablesView() {
  const mockData = useAppStore((s) => s.mockData);
  const setActiveView = useAppStore((s) => s.setActiveView);
  const setLedgerVouchersLedger = useAppStore((s) => s.setLedgerVouchersLedger);

  const [type, setType] = React.useState<'receivables' | 'payables'>('receivables');
  const [asOnDate, setAsOnDate] = React.useState(() =>
    new Date().toISOString().slice(0, 10)
  );
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const ledgers = React.useMemo(() => {
    return mockData.ledgers.filter((l) =>
      type === 'receivables' ? isDebtorLedger(l) : isCreditorLedger(l)
    );
  }, [mockData.ledgers, type]);

  const rows = React.useMemo(() => {
    return ledgers.map((l) => {
      const balance = l.amount;
      const ageDays = 45;
      const bucket =
        ageDays <= 30 ? '0-30' : ageDays <= 60 ? '31-60' : ageDays <= 90 ? '61-90' : '90+';
      const overdue = ageDays > 0;
      return {
        id: l.id,
        name: l.name,
        outstanding: balance,
        b0_30: bucket === '0-30' ? balance : 0,
        b31_60: bucket === '31-60' ? balance : 0,
        b61_90: bucket === '61-90' ? balance : 0,
        b90plus: bucket === '90+' ? balance : 0,
        overdue,
      };
    });
  }, [ledgers, asOnDate]);

  const totalOutstanding = rows.reduce((s, r) => s + r.outstanding, 0);
  const totalOverdue = rows.filter((r) => r.overdue).reduce((s, r) => s + r.outstanding, 0);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => (i < rows.length - 1 ? i + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => (i > 0 ? i - 1 : rows.length - 1));
      } else if (e.key === 'Enter' && rows[selectedIndex]) {
        e.preventDefault();
        const r = rows[selectedIndex];
        setLedgerVouchersLedger({ id: r.id, name: r.name });
        setActiveView('ledger-vouchers');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setActiveView('gateway');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [rows, selectedIndex, setLedgerVouchersLedger, setActiveView]);

  return (
    <div className="flex h-full flex-col overflow-auto bg-[#FEF2F2] p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-2 flex-wrap">
        <div className="text-[14px] font-bold text-[#7F1D1D]">
          {type === 'receivables' ? 'Receivables (Sundry Debtors)' : 'Payables (Sundry Creditors)'}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="text-[10px]">As on</label>
          <input
            type="date"
            className="border border-[#D0D0D0] px-2 py-1 text-[11px] min-h-[44px] sm:min-h-0 touch-manipulation"
            value={asOnDate}
            onChange={(e) => setAsOnDate(e.target.value)}
          />
          <button
            type="button"
            className={`px-3 py-2 sm:px-2 sm:py-1 text-[11px] border min-h-[44px] sm:min-h-0 touch-manipulation ${type === 'receivables' ? 'bg-[#DC2626] text-white border-[#DC2626]' : 'bg-white border-[#D0D0D0]'}`}
            onClick={() => setType('receivables')}
          >
            Receivables
          </button>
          <button
            type="button"
            className={`px-3 py-2 sm:px-2 sm:py-1 text-[11px] border min-h-[44px] sm:min-h-0 touch-manipulation ${type === 'payables' ? 'bg-[#DC2626] text-white border-[#DC2626]' : 'bg-white border-[#D0D0D0]'}`}
            onClick={() => setType('payables')}
          >
            Payables
          </button>
        </div>
      </div>
      <div className="border border-[#D0D0D0] bg-white flex-1 min-h-0 flex flex-col overflow-x-auto">
        <ScrollArea className="flex-1">
          <Table className="min-w-[520px]">
            <TableHeader>
              <TableRow className="bg-[#DC2626] hover:bg-[#DC2626]">
                <TableHead className="border-[#D0D0D0] text-white text-[11px]">
                  Ledger
                </TableHead>
                <TableHead className="border-[#D0D0D0] text-white text-[11px] w-28 text-right">
                  Outstanding (₹)
                </TableHead>
                <TableHead className="border-[#D0D0D0] text-white text-[11px] w-20 text-right">
                  0-30
                </TableHead>
                <TableHead className="border-[#D0D0D0] text-white text-[11px] w-20 text-right">
                  31-60
                </TableHead>
                <TableHead className="border-[#D0D0D0] text-white text-[11px] w-20 text-right">
                  61-90
                </TableHead>
                <TableHead className="border-[#D0D0D0] text-white text-[11px] w-20 text-right">
                  90+
                </TableHead>
                <TableHead className="border-[#D0D0D0] text-white text-[11px] w-16">
                  Overdue
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((r, idx) => (
                <TableRow
                  key={r.id}
                  className={`cursor-pointer hover:bg-[#FEE2E2] ${idx === selectedIndex ? 'bg-[#FFD700]' : ''} ${r.overdue ? 'bg-red-50' : ''}`}
                  onClick={() => {
                    setLedgerVouchersLedger({ id: r.id, name: r.name });
                    setActiveView('ledger-vouchers');
                  }}
                >
                  <TableCell className="border-[#D0D0D0] p-2 text-[11px]">
                    {r.name}
                  </TableCell>
                  <TableCell className="border-[#D0D0D0] p-2 text-[11px] text-right">
                    ₹ {r.outstanding.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell className="border-[#D0D0D0] p-2 text-[11px] text-right">
                    {r.b0_30 !== 0 ? `₹ ${r.b0_30.toLocaleString('en-IN')}` : '—'}
                  </TableCell>
                  <TableCell className="border-[#D0D0D0] p-2 text-[11px] text-right">
                    {r.b31_60 !== 0 ? `₹ ${r.b31_60.toLocaleString('en-IN')}` : '—'}
                  </TableCell>
                  <TableCell className="border-[#D0D0D0] p-2 text-[11px] text-right">
                    {r.b61_90 !== 0 ? `₹ ${r.b61_90.toLocaleString('en-IN')}` : '—'}
                  </TableCell>
                  <TableCell className="border-[#D0D0D0] p-2 text-[11px] text-right">
                    {r.b90plus !== 0 ? `₹ ${r.b90plus.toLocaleString('en-IN')}` : '—'}
                  </TableCell>
                  <TableCell className="border-[#D0D0D0] p-2 text-[11px]">
                    {r.overdue ? 'Yes' : '—'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
        <div className="border-t border-[#D0D0D0] bg-[#E8E8E8] px-2 py-1.5 flex justify-between text-[11px] font-bold">
          <span>Total Outstanding: ₹ {totalOutstanding.toLocaleString('en-IN')}</span>
          {totalOverdue > 0 && (
            <span className="text-red-700">Overdue: ₹ {totalOverdue.toLocaleString('en-IN')}</span>
          )}
        </div>
      </div>
      <div className="mt-2 text-[10px] text-[#666]">
        ↑↓ Select · Enter Drill-down · Esc Gateway
      </div>
    </div>
  );
}
