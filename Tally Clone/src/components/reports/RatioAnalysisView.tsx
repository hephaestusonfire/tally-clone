import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { ScrollArea } from '../ui/scroll-area';

const RATIOS = [
  { name: 'Current Ratio', value: '2.15', formula: 'Current Assets / Current Liabilities' },
  { name: 'Quick Ratio', value: '1.82', formula: 'Quick Assets / Current Liabilities' },
  { name: 'Debt-Equity Ratio', value: '0.40', formula: 'Total Debt / Net Worth' },
  { name: 'Gross Profit %', value: '37.50%', formula: 'Gross Profit / Sales × 100' },
  { name: 'Net Profit %', value: '16.67%', formula: 'Net Profit / Sales × 100' },
  { name: 'ROE %', value: '18.50%', formula: 'Net Profit / Equity × 100' },
];

export function RatioAnalysisView() {
  return (
    <div className="flex h-full overflow-hidden flex-col lg:flex-row">
      <aside className="hidden lg:flex w-[260px] min-w-[260px] flex-shrink-0 border-r border-[#D0D0D0] bg-[#E8E8E8] flex-col">
        <div className="border-b border-[#D0D0D0] bg-[#D0D0D0] px-2 py-1.5 text-[11px] font-bold">
          Ratios
        </div>
        <ScrollArea className="flex-1 p-1 text-[10px]">
          <ul className="space-y-0.5">
            {RATIOS.map((r) => (
              <li key={r.name}>
                <button
                  type="button"
                  className="w-full text-left px-2 py-1.5 hover:bg-[#D0D0D0] rounded-sm"
                >
                  {r.name} | {r.value}
                </button>
              </li>
            ))}
          </ul>
        </ScrollArea>
      </aside>
      <div className="flex-1 min-w-0 flex flex-col bg-white overflow-auto p-3 sm:p-4">
        <div className="text-[14px] font-bold text-[#7F1D1D] mb-4">
          Ratio Analysis
        </div>
        <div className="border border-[#D0D0D0] overflow-x-auto">
          <Table className="min-w-[280px]">
            <TableHeader>
              <TableRow className="bg-[#DC2626] hover:bg-[#DC2626]">
                <TableHead className="border-[#D0D0D0] text-white text-[10px]">
                  Ratio
                </TableHead>
                <TableHead className="w-24 border-[#D0D0D0] text-center text-white text-[10px]">
                  Value
                </TableHead>
                <TableHead className="border-[#D0D0D0] text-white text-[10px]">
                  Formula
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {RATIOS.map((r) => (
                <TableRow key={r.name}>
                  <TableCell className="border-[#D0D0D0] p-1 text-[10px]">
                    {r.name}
                  </TableCell>
                  <TableCell className="border-[#D0D0D0] p-1 text-center text-[10px] font-semibold">
                    {r.value}
                  </TableCell>
                  <TableCell className="border-[#D0D0D0] p-1 text-[10px] text-gray-600">
                    {r.formula}
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
