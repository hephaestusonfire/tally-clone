import { useAppStore } from '../../store/useAppStore';
import { Button } from '../ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { ScrollArea } from '../ui/scroll-area';

export function GstRatesView() {
  const gstRates = useAppStore((s) => s.gstRates);
  const openGstRateModal = useAppStore((s) => s.openGstRateModal);

  return (
    <div className="flex h-full flex-col overflow-auto pr-4">
      <div className="p-3">
        <div className="border border-[#D0D0D0] bg-white">
          <ScrollArea className="max-h-[calc(100vh-220px)]">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#DC2626] hover:bg-[#DC2626]">
                  <TableHead className="border-[#D0D0D0] text-white">
                    Rate Name
                  </TableHead>
                  <TableHead className="w-20 border-[#D0D0D0] text-right text-white">
                    % Rate
                  </TableHead>
                  <TableHead className="border-[#D0D0D0] text-white">
                    Tax Type
                  </TableHead>
                  <TableHead className="border-[#D0D0D0] text-white">
                    Applicable Ledgers
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {gstRates.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="border-[#D0D0D0] p-1 text-[10px]">
                      {r.rateName}
                    </TableCell>
                    <TableCell className="border-[#D0D0D0] p-1 text-right text-[10px]">
                      {r.ratePercent}%
                    </TableCell>
                    <TableCell className="border-[#D0D0D0] p-1 text-[10px]">
                      {r.taxType}
                    </TableCell>
                    <TableCell className="border-[#D0D0D0] p-1 text-[10px]">
                      {r.applicableLedgers.join(', ')}
                    </TableCell>
                  </TableRow>
                ))}
                {gstRates.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="border-[#D0D0D0] text-center text-[10px] text-gray-500 bg-[#F5F5F5] py-4"
                    >
                      No GST rates. Press F12 to add.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </div>
      <div className="mt-auto pt-2">
        <Button
          variant="outline"
          size="sm"
          className="bg-[#E8E8E8] text-[11px]"
          onClick={openGstRateModal}
        >
          F12: GST Rate Configuration
        </Button>
      </div>
    </div>
  );
}
