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
import { Button } from '../ui/button';

// Mock voucher lines for drill-down
const MOCK_DRILL_LINES: { date: string; narration: string; drCr: 'Dr' | 'Cr'; amount: number }[] = [
  { date: '01 May 24', narration: 'Opening', drCr: 'Dr', amount: 120000 },
  { date: '15 May 24', narration: 'Sales', drCr: 'Cr', amount: 25000 },
  { date: '31 May 24', narration: 'Closing', drCr: 'Dr', amount: 150000 },
];

export function TrialBalanceView() {
  const activeView = useAppStore((s) => s.activeView);
  const reportTrialBalanceAccounts = useAppStore((s) => s.reportTrialBalanceAccounts);
  const trialBalanceAccountsMock = useAppStore((s) => s.trialBalanceAccounts);
  const trialBalanceAccounts = reportTrialBalanceAccounts ?? trialBalanceAccountsMock;
  const financialPeriodEnd = useAppStore((s) => s.financialPeriodEnd);

  useReportData(activeView === 'trial-balance' ? 'trial-balance' : '', {
    asOnDate: financialPeriodEnd?.slice(0, 10),
  });
  const drillDownAccount = useAppStore((s) => s.drillDownAccount);
  const setDrillDownAccount = useAppStore((s) => s.setDrillDownAccount);
  const setLedgerVouchersLedger = useAppStore((s) => s.setLedgerVouchersLedger);
  const setActiveView = useAppStore((s) => s.setActiveView);
  const totalDr = trialBalanceAccounts
    .filter((a) => a.type === 'Dr')
    .reduce((s, a) => s + a.amount, 0);
  const totalCr = trialBalanceAccounts
    .filter((a) => a.type === 'Cr')
    .reduce((s, a) => s + a.amount, 0);

  return (
    <div className="flex h-full overflow-hidden flex-col lg:flex-row">
      {/* Left gray panel - account list (hidden on mobile) */}
      <aside className="hidden lg:flex w-[260px] min-w-[260px] flex-shrink-0 border-r border-[#D0D0D0] bg-[#E8E8E8] flex-col">
        <div className="border-b border-[#D0D0D0] bg-[#D0D0D0] px-2 py-1.5 text-[11px] font-bold">
          Accounts
        </div>
        <ScrollArea className="flex-1 p-1 text-[10px]">
          <ul className="space-y-0.5">
            {trialBalanceAccounts.map((a) => (
              <li key={a.id}>
                <button
                  type="button"
                  className="w-full text-left px-2 py-1.5 hover:bg-[#D0D0D0] rounded-sm border-b border-[#D0D0D0]/50 cursor-pointer"
                  onClick={() => setDrillDownAccount(a)}
                >
                  <span className="font-medium">{a.name}</span>
                  <span className="text-[#333] ml-1">
                    | ₹{a.amount.toLocaleString('en-IN')} {a.type}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </aside>

      {/* Main report area + optional drill-down */}
      <div className={`flex-1 min-w-0 flex overflow-hidden flex-col ${drillDownAccount ? 'lg:flex-row' : ''} bg-white`}>
        <div className="flex-1 min-w-0 overflow-auto">
        <div className="p-3 sm:p-4">
          <div className="text-[14px] font-bold text-[#7F1D1D] mb-4">
            Trial Balance
          </div>
          <div className="border border-[#D0D0D0] bg-white overflow-x-auto">
            <Table className="min-w-[400px]">
              <TableHeader>
                <TableRow className="bg-[#DC2626] hover:bg-[#DC2626]">
                  <TableHead className="border-[#D0D0D0] text-white text-[10px] w-8">
                    #
                  </TableHead>
                  <TableHead className="border-[#D0D0D0] text-white text-[10px]">
                    Ledger
                  </TableHead>
                  <TableHead className="border-[#D0D0D0] text-right text-white text-[10px] w-28">
                    Debit (₹)
                  </TableHead>
                  <TableHead className="border-[#D0D0D0] text-right text-white text-[10px] w-28">
                    Credit (₹)
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {trialBalanceAccounts.map((a, idx) => (
                  <TableRow
                    key={a.id}
                    className="cursor-pointer hover:bg-[#E8E8E8]"
                    onClick={() => setDrillDownAccount(a)}
                  >
                    <TableCell className="border-[#D0D0D0] p-1 text-[10px]">
                      {idx + 1}
                    </TableCell>
                    <TableCell className="border-[#D0D0D0] p-1 text-[10px]">
                      {a.name}
                    </TableCell>
                    <TableCell className="border-[#D0D0D0] p-1 text-right text-[10px]">
                      {a.type === 'Dr'
                        ? `₹ ${a.amount.toLocaleString('en-IN')}`
                        : ''}
                    </TableCell>
                    <TableCell className="border-[#D0D0D0] p-1 text-right text-[10px]">
                      {a.type === 'Cr'
                        ? `₹ ${a.amount.toLocaleString('en-IN')}`
                        : ''}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-[#E8E8E8] font-bold">
                  <TableCell
                    colSpan={2}
                    className="border-[#D0D0D0] p-1 text-[10px]"
                  >
                    Total
                  </TableCell>
                  <TableCell className="border-[#D0D0D0] p-1 text-right text-[10px]">
                    ₹ {totalDr.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell className="border-[#D0D0D0] p-1 text-right text-[10px]">
                    ₹ {totalCr.toLocaleString('en-IN')}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>
        </div>
        </div>

        {/* Drill-down panel */}
        {drillDownAccount && (
          <aside className="w-full lg:w-[320px] lg:min-w-[320px] flex-shrink-0 border-t lg:border-t-0 lg:border-l border-[#D0D0D0] bg-[#FFF5F5] flex flex-col">
            <div className="border-b border-[#D0D0D0] bg-[#DC2626] text-white px-3 py-2 text-[11px] font-bold flex items-center justify-between">
              Ledger: {drillDownAccount.name}
              <Button
                variant="ghost"
                size="xs"
                className="text-white hover:bg-white/20 min-h-[44px] sm:min-h-0 h-6 px-2 sm:px-1 touch-manipulation"
                onClick={() => setDrillDownAccount(null)}
              >
                Close
              </Button>
            </div>
            <div className="p-3 flex-1 overflow-auto text-[10px] space-y-3">
              <div className="flex gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="text-[10px] h-7 bg-[#DC2626] text-white hover:bg-[#B91C1C]"
                  onClick={() => {
                    setLedgerVouchersLedger({
                      id: drillDownAccount.id,
                      name: drillDownAccount.name,
                    });
                    setActiveView('ledger-vouchers');
                  }}
                >
                  Ledger Vouchers
                </Button>
              </div>
              <div>
                <span className="font-semibold text-[#7F1D1D]">Balance: </span>
                <span>
                  ₹{drillDownAccount.amount.toLocaleString('en-IN')} {drillDownAccount.type}
                </span>
              </div>
              <div>
                <div className="font-semibold text-[#7F1D1D] mb-1">Vouchers</div>
                <div className="border border-[#D0D0D0] bg-white overflow-x-auto">
                  <Table className="min-w-[280px]">
                    <TableHeader>
                      <TableRow className="bg-[#E8E8E8]">
                        <TableHead className="border-[#D0D0D0] p-1 text-[10px]">Date</TableHead>
                        <TableHead className="border-[#D0D0D0] p-1 text-[10px]">Narration</TableHead>
                        <TableHead className="border-[#D0D0D0] p-1 text-right text-[10px]">{drillDownAccount.type} (₹)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {MOCK_DRILL_LINES.map((line, i) => (
                        <TableRow key={i}>
                          <TableCell className="border-[#D0D0D0] p-1 text-[10px]">{line.date}</TableCell>
                          <TableCell className="border-[#D0D0D0] p-1 text-[10px]">{line.narration}</TableCell>
                          <TableCell className="border-[#D0D0D0] p-1 text-right text-[10px]">
                            {line.drCr === drillDownAccount.type ? `₹${line.amount.toLocaleString('en-IN')}` : ''}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </aside>
        )}
      </div>
    </div>
  );
}
