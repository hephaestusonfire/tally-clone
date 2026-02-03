import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { ScrollArea } from '../ui/scroll-area';

const MOCK_MESSAGES = [
  { id: 1, date: '2025-01-28 10:30', from: '+91 98765 43210', type: 'Report', status: 'Sent', preview: 'Balance Sheet as on 31-Dec-2024' },
  { id: 2, date: '2025-01-28 09:15', from: '+91 91234 56789', type: 'Voucher', status: 'Delivered', preview: 'Sales voucher #12' },
  { id: 3, date: '2025-01-27 16:45', from: '+91 98765 43210', type: 'Report', status: 'Read', preview: 'P&L A/c for Jan 2025' },
  { id: 4, date: '2025-01-27 14:00', from: '+91 87654 32109', type: 'Reminder', status: 'Sent', preview: 'Payment reminder for INV-101' },
];

export function WhatsappManageInboxView() {
  return (
    <div className="flex flex-col h-full overflow-hidden p-4">
      <div className="font-bold text-[14px] text-[#7F1D1D] mb-3">WhatsApp Inbox</div>
      <div className="border border-[#D0D0D0] bg-white flex-1 min-h-0 flex flex-col">
        <ScrollArea className="flex-1">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#DC2626] hover:bg-[#DC2626]">
                <TableHead className="border-[#D0D0D0] text-white text-[10px] w-32">Date</TableHead>
                <TableHead className="border-[#D0D0D0] text-white text-[10px] w-36">From</TableHead>
                <TableHead className="border-[#D0D0D0] text-white text-[10px] w-24">Type</TableHead>
                <TableHead className="border-[#D0D0D0] text-white text-[10px] w-24">Status</TableHead>
                <TableHead className="border-[#D0D0D0] text-white text-[10px]">Preview</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {MOCK_MESSAGES.map((m) => (
                <TableRow key={m.id} className="hover:bg-[#FEF2F2]">
                  <TableCell className="border-[#D0D0D0] p-1.5 text-[11px]">{m.date}</TableCell>
                  <TableCell className="border-[#D0D0D0] p-1.5 text-[11px]">{m.from}</TableCell>
                  <TableCell className="border-[#D0D0D0] p-1.5 text-[11px]">{m.type}</TableCell>
                  <TableCell className="border-[#D0D0D0] p-1.5 text-[11px]">{m.status}</TableCell>
                  <TableCell className="border-[#D0D0D0] p-1.5 text-[11px]">{m.preview}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
}
