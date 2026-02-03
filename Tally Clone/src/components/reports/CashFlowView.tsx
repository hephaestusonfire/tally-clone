import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { ScrollArea } from '../ui/scroll-area';

// Section 1: Cash Generated from Operations (Sales, Purchases, etc.)
const CASH_FROM_OPERATIONS = [
  { name: 'Sales', amount: 148000 },
  { name: 'Purchases', amount: -90000 },
  { name: 'Operating Expenses', amount: -18000 },
  { name: 'Depreciation', amount: -15000 },
];

// Section 2: Cash from Investing
const CASH_FROM_INVESTING = [
  { name: 'Purchase of Fixed Assets', amount: -50000 },
  { name: 'Sale of Investments', amount: 20000 },
];

// Section 3: Cash from Financing
const CASH_FROM_FINANCING = [
  { name: 'Loan Received', amount: 100000 },
  { name: 'Loan Repayment', amount: -30000 },
  { name: 'Drawings', amount: -20000 },
];

function formatAmount(amount: number): string {
  const abs = Math.abs(amount);
  const formatted = abs.toLocaleString('en-IN');
  return amount < 0 ? `(₹${formatted})` : `₹${formatted}`;
}

export function CashFlowView() {
  const opsTotal = CASH_FROM_OPERATIONS.reduce((s, i) => s + i.amount, 0);
  const invTotal = CASH_FROM_INVESTING.reduce((s, i) => s + i.amount, 0);
  const finTotal = CASH_FROM_FINANCING.reduce((s, i) => s + i.amount, 0);
  const netChange = opsTotal + invTotal + finTotal;

  return (
    <div className="flex h-full overflow-hidden flex-col lg:flex-row">
      <aside className="hidden lg:flex w-[260px] min-w-[260px] flex-shrink-0 border-r border-[#D0D0D0] bg-[#E8E8E8] flex-col">
        <div className="border-b border-[#D0D0D0] bg-[#D0D0D0] px-2 py-1.5 text-[11px] font-bold">
          Sections
        </div>
        <ScrollArea className="flex-1 p-1 text-[10px]">
          <ul className="space-y-0.5">
            <li className="font-semibold px-2 py-1">Cash Generated from Operations</li>
            <li className="font-semibold px-2 py-1">Cash from Investing</li>
            <li className="font-semibold px-2 py-1">Cash from Financing</li>
            <li className="font-semibold px-2 py-1">Net Change in Cash</li>
          </ul>
        </ScrollArea>
      </aside>
      <div className="flex-1 min-w-0 flex flex-col bg-white overflow-auto p-3 sm:p-4">
        <div className="text-[14px] font-bold text-[#7F1D1D] mb-4">
          Cash Flow Statement
        </div>
        <div className="border border-[#D0D0D0] overflow-x-auto">
          <Table className="min-w-[280px]">
            <TableHeader>
              <TableRow className="bg-[#DC2626] hover:bg-[#DC2626]">
                <TableHead className="border-[#D0D0D0] text-white text-[10px]">
                  Particulars
                </TableHead>
                <TableHead className="w-32 border-[#D0D0D0] text-right text-white text-[10px]">
                  Amount (₹)
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {/* Section 1: Cash Generated from Operations */}
              <TableRow className="bg-[#E8E8E8]">
                <TableCell className="border-[#D0D0D0] p-1 text-[10px] font-bold">
                  Cash Generated from Operations
                </TableCell>
                <TableCell className="border-[#D0D0D0] p-1" />
              </TableRow>
              {CASH_FROM_OPERATIONS.map((i) => (
                <TableRow key={i.name}>
                  <TableCell className="border-[#D0D0D0] p-1 pl-4 text-[10px]">
                    {i.name}
                  </TableCell>
                  <TableCell className="border-[#D0D0D0] p-1 text-right text-[10px]">
                    {formatAmount(i.amount)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-[#E8E8E8] font-bold">
                <TableCell className="border-[#D0D0D0] p-1 text-[10px]">
                  Net Cash from Operations
                </TableCell>
                <TableCell className="border-[#D0D0D0] p-1 text-right text-[10px]">
                  {formatAmount(opsTotal)}
                </TableCell>
              </TableRow>

              {/* Section 2: Cash from Investing */}
              <TableRow className="bg-[#E8E8E8]">
                <TableCell className="border-[#D0D0D0] p-1 text-[10px] font-bold">
                  Cash from Investing
                </TableCell>
                <TableCell className="border-[#D0D0D0] p-1" />
              </TableRow>
              {CASH_FROM_INVESTING.map((i) => (
                <TableRow key={i.name}>
                  <TableCell className="border-[#D0D0D0] p-1 pl-4 text-[10px]">
                    {i.name}
                  </TableCell>
                  <TableCell className="border-[#D0D0D0] p-1 text-right text-[10px]">
                    {formatAmount(i.amount)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-[#E8E8E8] font-bold">
                <TableCell className="border-[#D0D0D0] p-1 text-[10px]">
                  Net Cash from Investing
                </TableCell>
                <TableCell className="border-[#D0D0D0] p-1 text-right text-[10px]">
                  {formatAmount(invTotal)}
                </TableCell>
              </TableRow>

              {/* Section 3: Cash from Financing */}
              <TableRow className="bg-[#E8E8E8]">
                <TableCell className="border-[#D0D0D0] p-1 text-[10px] font-bold">
                  Cash from Financing
                </TableCell>
                <TableCell className="border-[#D0D0D0] p-1" />
              </TableRow>
              {CASH_FROM_FINANCING.map((i) => (
                <TableRow key={i.name}>
                  <TableCell className="border-[#D0D0D0] p-1 pl-4 text-[10px]">
                    {i.name}
                  </TableCell>
                  <TableCell className="border-[#D0D0D0] p-1 text-right text-[10px]">
                    {formatAmount(i.amount)}
                  </TableCell>
                </TableRow>
              ))}
              <TableRow className="bg-[#E8E8E8] font-bold">
                <TableCell className="border-[#D0D0D0] p-1 text-[10px]">
                  Net Cash from Financing
                </TableCell>
                <TableCell className="border-[#D0D0D0] p-1 text-right text-[10px]">
                  {formatAmount(finTotal)}
                </TableCell>
              </TableRow>

              {/* Section 4: Net Change in Cash */}
              <TableRow className="bg-[#DC2626] text-white font-bold">
                <TableCell className="border-[#D0D0D0] p-1 text-[10px]">
                  Net Change in Cash
                </TableCell>
                <TableCell className="border-[#D0D0D0] p-1 text-right text-[10px]">
                  {formatAmount(netChange)}
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
