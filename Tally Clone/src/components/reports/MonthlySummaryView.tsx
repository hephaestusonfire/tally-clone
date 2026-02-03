import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { ScrollArea } from '../ui/scroll-area';

const MONTHLY_ROWS = [
  { month: 'Apr 2024', sales: 135000, purchase: 82000, receipts: 98000, payments: 75000 },
  { month: 'May 2024', sales: 148000, purchase: 90000, receipts: 105000, payments: 88000 },
  { month: 'Jun 2024', sales: 162000, purchase: 95000, receipts: 118000, payments: 92000 },
];

export function MonthlySummaryView() {
  return (
    <div className="flex h-full overflow-hidden flex-col lg:flex-row">
      <aside className="hidden lg:flex w-[260px] min-w-[260px] flex-shrink-0 border-r border-[#D0D0D0] bg-[#E8E8E8] flex-col">
        <div className="border-b border-[#D0D0D0] bg-[#D0D0D0] px-2 py-1.5 text-[11px] font-bold">
          Summary
        </div>
        <ScrollArea className="flex-1 p-1 text-[10px]">
          <ul className="space-y-0.5">
            <li className="font-semibold px-2 py-1">Sales</li>
            <li className="font-semibold px-2 py-1">Purchase</li>
            <li className="font-semibold px-2 py-1">Receipts</li>
            <li className="font-semibold px-2 py-1">Payments</li>
          </ul>
        </ScrollArea>
      </aside>
      <div className="flex-1 min-w-0 flex flex-col bg-white overflow-auto p-3 sm:p-4">
        <div className="text-[14px] font-bold text-[#7F1D1D] mb-4">
          Monthly Summary
        </div>
        <div className="border border-[#D0D0D0] overflow-x-auto">
          <Table className="min-w-[400px]">
            <TableHeader>
              <TableRow className="bg-[#DC2626] hover:bg-[#DC2626]">
                <TableHead className="border-[#D0D0D0] text-white text-[10px]">
                  Month
                </TableHead>
                <TableHead className="w-28 border-[#D0D0D0] text-right text-white text-[10px]">
                  Sales (₹)
                </TableHead>
                <TableHead className="w-28 border-[#D0D0D0] text-right text-white text-[10px]">
                  Purchase (₹)
                </TableHead>
                <TableHead className="w-28 border-[#D0D0D0] text-right text-white text-[10px]">
                  Receipts (₹)
                </TableHead>
                <TableHead className="w-28 border-[#D0D0D0] text-right text-white text-[10px]">
                  Payments (₹)
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MONTHLY_ROWS.map((r) => (
                <TableRow key={r.month}>
                  <TableCell className="border-[#D0D0D0] p-1 text-[10px]">
                    {r.month}
                  </TableCell>
                  <TableCell className="border-[#D0D0D0] p-1 text-right text-[10px]">
                    ₹{r.sales.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell className="border-[#D0D0D0] p-1 text-right text-[10px]">
                    ₹{r.purchase.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell className="border-[#D0D0D0] p-1 text-right text-[10px]">
                    ₹{r.receipts.toLocaleString('en-IN')}
                  </TableCell>
                  <TableCell className="border-[#D0D0D0] p-1 text-right text-[10px]">
                    ₹{r.payments.toLocaleString('en-IN')}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
