import { useState, useMemo, useEffect } from 'react';
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

const PAGE_SIZE = 20;

function formatDateForDisplay(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const mon = months[d.getMonth()];
  const yy = String(d.getFullYear()).slice(2);
  return `${day.toString().padStart(2, '0')}-${mon}-${yy}`;
}

function toDateKey(iso: string): number {
  return new Date(iso).getTime();
}

function parseDateInput(s: string): string {
  // "01-May-24" -> "2024-05-01"
  const parts = s.split('-');
  if (parts.length !== 3) return s;
  const months: Record<string, string> = {
    Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
    Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
  };
  const mon = months[parts[1]] ?? '01';
  const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
  return `${year}-${mon}-${parts[0].padStart(2, '0')}`;
}

function refPrefix(type: string): string {
  const m: Record<string, string> = {
    Sales: 'S', Purchase: 'P', Receipt: 'R', Payment: 'Pay', Journal: 'J', Contra: 'C',
  };
  return m[type] ?? 'V';
}

export function DayBookView() {
  const mockData = useAppStore((s) => s.mockData);
  const reportDayBookVouchers = useAppStore((s) => s.reportDayBookVouchers);
  const companyName = useAppStore((s) => s.companyName);
  const openVoucherViewer = useAppStore((s) => s.openVoucherViewer);
  const activeView = useAppStore((s) => s.activeView);

  const [dateFrom, setDateFrom] = useState('01-May-24');
  const [dateTo, setDateTo] = useState('31-May-24');
  const [filterVoucherType, setFilterVoucherType] = useState<string>('');

  useReportData(activeView === 'day-book' ? 'day-book' : '', {
    dateFrom,
    dateTo,
    voucherTypeFilter: filterVoucherType || undefined,
  });
  const [page, setPage] = useState(1);
  const [selectedRowIndex, setSelectedRowIndex] = useState(0);

  const rows = useMemo(() => {
    if (reportDayBookVouchers?.length) {
      return reportDayBookVouchers;
    }
    const fromTs = toDateKey(parseDateInput(dateFrom));
    const toTs = toDateKey(parseDateInput(dateTo));
    const sorted = [...mockData.vouchers].sort(
      (a, b) => toDateKey(a.date) - toDateKey(b.date)
    );
    let filtered = sorted.filter((v) => {
      const ts = toDateKey(v.date);
      return ts >= fromTs && ts <= toTs;
    });
    if (filterVoucherType) {
      filtered = filtered.filter((v) => v.type === filterVoucherType);
    }
    let running = 0;
    return filtered.map((v) => {
      const isDebitSide = ['Sales', 'Receipt'].includes(v.type);
      const debit = isDebitSide ? v.amount : 0;
      const credit = isDebitSide ? 0 : v.amount;
      running = running + debit - credit;
      const narration =
        v.type === 'Sales'
          ? `Sold goods to ${v.party} IGST 18%`
          : v.type === 'Journal'
            ? 'GST adjustment'
            : `${v.type} - ${v.party}`;
      return {
        ...v,
        dateFormatted: formatDateForDisplay(v.date),
        ref: `${refPrefix(v.type)}/${v.id}`,
        narration,
        debit,
        credit,
        balance: running,
      };
    });
  }, [reportDayBookVouchers, mockData.vouchers, dateFrom, dateTo]);

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

  const selectedVoucherId = paginatedRows[selectedRowIndex]?.id;
  useEffect(() => setSelectedRowIndex(0), [page, filterVoucherType, dateFrom, dateTo]);
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedRowIndex((i) => (i < paginatedRows.length - 1 ? i + 1 : i));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedRowIndex((i) => (i > 0 ? i - 1 : 0));
        return;
      }
      if (e.key === 'Enter' && selectedVoucherId != null) {
        e.preventDefault();
        openVoucher(selectedVoucherId);
        return;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [paginatedRows.length, selectedVoucherId]);

  return (
    <div className="flex h-full overflow-hidden flex-col lg:flex-row">
      <aside className="hidden lg:flex w-[260px] min-w-[260px] flex-shrink-0 border-r border-[#D0D0D0] bg-[#E8E8E8] flex-col">
        <div className="border-b border-[#D0D0D0] bg-[#D0D0D0] px-2 py-1.5 text-[11px] font-bold">
          Day Book
        </div>
        <ScrollArea className="flex-1 p-1 text-[10px]">
          <p className="px-2 py-1 text-[#333]">
            ↑↓ Select row · Enter Open voucher. Filter by date and voucher type.
          </p>
        </ScrollArea>
      </aside>
      <div className="flex-1 min-w-0 flex flex-col bg-white overflow-auto p-3 sm:p-4">
        <div className="text-[14px] font-bold text-[#7F1D1D] mb-4">
          Day Book
        </div>

        {/* Filters: Date, Voucher Type, Company */}
        <div className="flex flex-wrap items-center gap-4 mb-3 text-[10px]">
          <label className="flex items-center gap-2">
            <span className="font-semibold text-[#333]">From</span>
            <input
              type="text"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              placeholder="DD-Mon-YY"
              className="border border-[#D0D0D0] bg-white px-2 py-1 w-24 min-h-[44px] sm:min-h-0 touch-manipulation"
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="font-semibold text-[#333]">To</span>
            <input
              type="text"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              placeholder="DD-Mon-YY"
              className="border border-[#D0D0D0] bg-white px-2 py-1 w-24 min-h-[44px] sm:min-h-0 touch-manipulation"
            />
          </label>
          <label className="flex items-center gap-2">
            <span className="font-semibold text-[#333]">Voucher Type</span>
            <select
              value={filterVoucherType}
              onChange={(e) => setFilterVoucherType(e.target.value)}
              className="border border-[#D0D0D0] bg-white px-2 py-1 w-36 min-h-[44px] sm:min-h-0 touch-manipulation"
            >
              <option value="">All</option>
              <option value="Sales">Sales</option>
              <option value="Purchase">Purchase</option>
              <option value="Receipt">Receipt</option>
              <option value="Payment">Payment</option>
              <option value="Journal">Journal</option>
              <option value="Contra">Contra</option>
              <option value="GST Sales">GST Sales</option>
              <option value="GST Purchase">GST Purchase</option>
            </select>
          </label>
          <span className="text-[#666]">Company: {companyName}</span>
        </div>

        <div className="border border-[#D0D0D0] flex-1 min-h-0 flex flex-col overflow-x-auto">
          <ScrollArea className="flex-1">
            <Table className="min-w-[500px]">
              <TableHeader>
                <TableRow className="bg-[#DC2626] hover:bg-[#DC2626]">
                  <TableHead className="border-[#D0D0D0] text-white text-[10px] w-24">
                    Date
                  </TableHead>
                  <TableHead className="border-[#D0D0D0] text-white text-[10px] min-w-[180px]">
                    Particulars
                  </TableHead>
                  <TableHead className="border-[#D0D0D0] text-white text-[10px] w-24">
                    Voucher Type
                  </TableHead>
                  <TableHead className="border-[#D0D0D0] text-white text-[10px] w-20">
                    Voucher No
                  </TableHead>
                  <TableHead className="border-[#D0D0D0] text-right text-white text-[10px] w-24">
                    Debit ₹
                  </TableHead>
                  <TableHead className="border-[#D0D0D0] text-right text-white text-[10px] w-24">
                    Credit ₹
                  </TableHead>
                  <TableHead className="border-[#D0D0D0] text-right text-white text-[10px] w-28">
                    Balance
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedRows.map((r, idx) => {
                  const isSelected = idx === selectedRowIndex;
                  return (
                  <TableRow
                    key={r.id}
                    className={`cursor-pointer ${isSelected ? 'bg-[#FFD700]' : 'hover:bg-[#E8E8E8]'}`}
                    onClick={() => { setSelectedRowIndex(idx); openVoucher(r.id); }}
                  >
                    <TableCell className="border-[#D0D0D0] p-1 text-[10px]">
                      {r.dateFormatted}
                    </TableCell>
                    <TableCell className="border-[#D0D0D0] p-1 text-[10px]">
                      {r.narration}
                    </TableCell>
                    <TableCell className="border-[#D0D0D0] p-1 text-[10px]">
                      {r.type}
                    </TableCell>
                    <TableCell className="border-[#D0D0D0] p-1 text-[10px]">
                      {r.ref}
                    </TableCell>
                    <TableCell className="border-[#D0D0D0] p-1 text-right text-[10px]">
                      {r.debit > 0 ? `₹${r.debit.toLocaleString('en-IN')}` : ''}
                    </TableCell>
                    <TableCell className="border-[#D0D0D0] p-1 text-right text-[10px]">
                      {r.credit > 0 ? `₹${r.credit.toLocaleString('en-IN')}` : ''}
                    </TableCell>
                    <TableCell className="border-[#D0D0D0] p-1 text-right text-[10px]">
                      {r.balance >= 0
                        ? `₹${r.balance.toLocaleString('en-IN')} Dr`
                        : `₹${Math.abs(r.balance).toLocaleString('en-IN')} Cr`}
                    </TableCell>
                  </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </ScrollArea>

          {/* Pagination */}
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
