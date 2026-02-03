import { useState, useMemo } from 'react';
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
import { Button } from '../ui/button';

const PAGE_SIZE = 10;

function formatDateForDisplay(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const mon = months[d.getMonth()];
  const yy = String(d.getFullYear()).slice(2);
  return `${day.toString().padStart(2, '0')}-${mon}-${yy}`;
}

function refPrefix(type: string): string {
  const m: Record<string, string> = {
    Sales: 'S', Purchase: 'P', Receipt: 'R', Payment: 'Pay', Journal: 'J', Contra: 'C',
  };
  return m[type] ?? 'V';
}

export function VoucherRegisterView() {
  const mockData = useAppStore((s) => s.mockData);
  const openVoucherViewer = useAppStore((s) => s.openVoucherViewer);

  const [page, setPage] = useState(1);

  const rows = useMemo(() => {
    return [...mockData.vouchers].sort(
      (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [mockData.vouchers]);

  const totalCount = rows.length;
  const paginatedRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return rows.slice(start, start + PAGE_SIZE);
  }, [rows, page]);
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const startItem = totalCount === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const endItem = Math.min(page * PAGE_SIZE, totalCount);
  const voucherIds = rows.map((r) => r.id);

  const openVoucher = (voucherId: number) => {
    if (voucherIds.length) openVoucherViewer(voucherIds, voucherId);
  };

  return (
    <div className="flex h-full overflow-hidden flex-col lg:flex-row">
      <aside className="hidden lg:flex w-[260px] min-w-[260px] flex-shrink-0 border-r border-[#D0D0D0] bg-[#E8E8E8] flex-col">
        <div className="border-b border-[#D0D0D0] bg-[#D0D0D0] px-2 py-1.5 text-[11px] font-bold">
          Voucher Register
        </div>
        <ScrollArea className="flex-1 p-1 text-[10px]">
          <p className="px-2 py-1 text-[#333]">
            All vouchers by date. Click a row to open voucher.
          </p>
        </ScrollArea>
      </aside>
      <div className="flex-1 min-w-0 flex flex-col bg-white overflow-auto p-3 sm:p-4">
        <div className="text-[14px] font-bold text-[#7F1D1D] mb-4">
          Voucher Register
        </div>
        <div className="border border-[#D0D0D0] flex-1 min-h-0 flex flex-col overflow-x-auto">
          <ScrollArea className="flex-1">
            <Table className="min-w-[500px]">
              <TableHeader>
                <TableRow className="bg-[#DC2626] hover:bg-[#DC2626]">
                  <TableHead className="border-[#D0D0D0] text-white text-[10px] w-24">
                    Date
                  </TableHead>
                  <TableHead className="border-[#D0D0D0] text-white text-[10px] w-14">
                    Ref
                  </TableHead>
                  <TableHead className="border-[#D0D0D0] text-white text-[10px] w-24">
                    Type
                  </TableHead>
                  <TableHead className="border-[#D0D0D0] text-white text-[10px] min-w-[140px]">
                    Party / Ledger
                  </TableHead>
                  <TableHead className="border-[#D0D0D0] text-right text-white text-[10px] w-28">
                    Amount (₹)
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRows.map((v) => (
                  <TableRow
                    key={v.id}
                    className="cursor-pointer hover:bg-[#E8E8E8]"
                    onClick={() => openVoucher(v.id)}
                  >
                    <TableCell className="border-[#D0D0D0] p-1 text-[10px]">
                      {formatDateForDisplay(v.date)}
                    </TableCell>
                    <TableCell className="border-[#D0D0D0] p-1 text-[10px]">
                      {refPrefix(v.type)}/{v.id}
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
                ))}
              </TableBody>
            </Table>
          </ScrollArea>
          <div className="flex items-center justify-between px-2 py-1.5 border-t border-[#D0D0D0] bg-[#F5F5F5] text-[10px]">
            <span className="text-[#333]">
              {startItem}-{endItem} of {totalCount}
            </span>
            <div className="flex gap-1">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-6 px-2 text-[10px] border-[#D0D0D0]"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page <= 1}
              >
                Previous
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-6 px-2 text-[10px] border-[#D0D0D0]"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
              >
                Next
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
