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

/** Match voucher to ledger: party equals ledger name or ledger name contains party (e.g. Sundry Debtors - Sharma & Co. vs party Sharma & Co.) */
function voucherMatchesLedger(party: string, ledgerName: string): boolean {
  const p = party.trim().toLowerCase();
  const l = ledgerName.trim().toLowerCase();
  return p === l || l.includes(p) || p.includes(l);
}

export function LedgerVouchersView() {
  const mockData = useAppStore((s) => s.mockData);
  const ledgerVouchersLedger = useAppStore((s) => s.ledgerVouchersLedger);
  const setLedgerVouchersLedger = useAppStore((s) => s.setLedgerVouchersLedger);
  const openVoucherViewer = useAppStore((s) => s.openVoucherViewer);

  const selectedLedger = ledgerVouchersLedger;
  const ledgers = mockData.ledgers;

  const reportLedgerVouchers = useAppStore((s) => s.reportLedgerVouchers);
  const activeView = useAppStore((s) => s.activeView);

  useReportData(activeView === 'ledger-vouchers' ? 'ledger-vouchers' : '', {
    ledgerId: selectedLedger?.id,
  });

  const vouchersForLedger = (() => {
    if (selectedLedger && reportLedgerVouchers?.length) {
      return reportLedgerVouchers.map((e) => ({
        id: e.voucher_id,
        date: e.date,
        type: e.voucher_type,
        party: e.narration || '',
        amount: e.debit || e.credit,
      }));
    }
    if (!selectedLedger) return [];
    return mockData.vouchers.filter((v) =>
      voucherMatchesLedger(v.party, selectedLedger.name)
    );
  })();
  const voucherIds = vouchersForLedger.map((v) => v.id).sort((a, b) => a - b);

  const openVoucher = (voucherId: number) => {
    if (voucherIds.length) openVoucherViewer(voucherIds, voucherId);
  };

  return (
    <div className="flex h-full overflow-hidden flex-col lg:flex-row">
      <aside className="w-full lg:w-[260px] lg:min-w-[260px] flex-shrink-0 border-b lg:border-b-0 lg:border-r border-[#D0D0D0] bg-[#E8E8E8] flex flex-col max-h-[40%] lg:max-h-none">
        <div className="border-b border-[#D0D0D0] bg-[#D0D0D0] px-2 py-1.5 text-[11px] font-bold">
          Ledgers
        </div>
        <ScrollArea className="flex-1 p-1 text-[10px]">
          <ul className="space-y-0.5">
            {ledgers.map((l) => (
              <li key={l.id}>
                <button
                  type="button"
                  className={`w-full text-left px-2 py-1.5 rounded-sm border-b border-[#D0D0D0]/50 cursor-pointer ${
                    selectedLedger?.name === l.name
                      ? 'bg-[#DC2626] text-white'
                      : 'hover:bg-[#D0D0D0]'
                  }`}
                  onClick={() => setLedgerVouchersLedger({ id: l.id, name: l.name })}
                >
                  <span className="font-medium">{l.name}</span>
                  <span className="text-[#333] ml-1">
                    | ₹{l.amount.toLocaleString('en-IN')}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </aside>

      <div className="flex-1 min-w-0 flex flex-col bg-white overflow-auto p-3 sm:p-4">
        <div className="text-[14px] font-bold text-[#7F1D1D] mb-4 flex items-center justify-between">
          <span>
            Ledger Vouchers
            {selectedLedger ? ` - ${selectedLedger.name}` : ''}
          </span>
        </div>
        {!selectedLedger ? (
          <p className="text-[11px] text-gray-600">
            Select a ledger from the left to view its vouchers.
          </p>
        ) : (
          <div className="border border-[#D0D0D0] overflow-x-auto">
            <Table className="min-w-[400px]">
              <TableHeader>
                <TableRow className="bg-[#DC2626] hover:bg-[#DC2626]">
                  <TableHead className="border-[#D0D0D0] text-white text-[10px] w-24">
                    Date
                  </TableHead>
                  <TableHead className="border-[#D0D0D0] text-white text-[10px] w-16">
                    No.
                  </TableHead>
                  <TableHead className="border-[#D0D0D0] text-white text-[10px] w-24">
                    Type
                  </TableHead>
                  <TableHead className="border-[#D0D0D0] text-white text-[10px]">
                    Party
                  </TableHead>
                  <TableHead className="border-[#D0D0D0] text-right text-white text-[10px] w-28">
                    Amount (₹)
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vouchersForLedger.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      className="border-[#D0D0D0] p-2 text-[10px] text-gray-500 text-center"
                    >
                      No vouchers found for this ledger.
                    </TableCell>
                  </TableRow>
                ) : (
                  vouchersForLedger.map((v) => (
                    <TableRow
                      key={v.id}
                      className="cursor-pointer hover:bg-[#E8E8E8]"
                      onClick={() => openVoucher(v.id)}
                    >
                      <TableCell className="border-[#D0D0D0] p-1 text-[10px]">
                        {v.date}
                      </TableCell>
                      <TableCell className="border-[#D0D0D0] p-1 text-[10px]">
                        {v.id}
                      </TableCell>
                      <TableCell className="border-[#D0D0D0] p-1 text-[10px]">
                        {v.type}
                      </TableCell>
                      <TableCell className="border-[#D0D0D0] p-1 text-[10px]">
                        {v.party}
                      </TableCell>
                      <TableCell className="border-[#D0D0D0] p-1 text-right text-[10px]">
                        ₹ {v.amount.toLocaleString('en-IN')}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
