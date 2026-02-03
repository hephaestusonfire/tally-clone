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

export function VoucherViewerModal() {
  const mockData = useAppStore((s) => s.mockData);
  const voucherViewerIds = useAppStore((s) => s.voucherViewerIds);
  const voucherViewerCurrentId = useAppStore((s) => s.voucherViewerCurrentId);
  const closeVoucherViewer = useAppStore((s) => s.closeVoucherViewer);
  const voucherViewerPrev = useAppStore((s) => s.voucherViewerPrev);
  const voucherViewerNext = useAppStore((s) => s.voucherViewerNext);

  const isOpen = voucherViewerIds.length > 0 && voucherViewerCurrentId != null;
  const voucher = isOpen
    ? mockData.vouchers.find((v) => v.id === voucherViewerCurrentId)
    : null;
  const currentIndex = voucherViewerCurrentId != null
    ? voucherViewerIds.indexOf(voucherViewerCurrentId)
    : -1;
  const hasPrev = currentIndex > 0;
  const hasNext = currentIndex >= 0 && currentIndex < voucherViewerIds.length - 1;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#808080]/70 text-[11px]">
      <div className="flex w-full max-w-lg flex-col border border-[#D0D0D0] bg-white shadow-lg">
        <div className="border-b border-[#D0D0D0] bg-[#DC2626] px-3 py-2 text-[12px] font-bold text-white flex items-center justify-between">
          <span>Voucher - {voucher?.type ?? ''}</span>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 h-7 px-2 text-[10px] disabled:opacity-50"
              onClick={voucherViewerPrev}
              disabled={!hasPrev}
            >
              Prev
            </Button>
            <span className="text-[10px] text-white/90">
              {currentIndex + 1} / {voucherViewerIds.length}
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 h-7 px-2 text-[10px] disabled:opacity-50"
              onClick={voucherViewerNext}
              disabled={!hasNext}
            >
              Next
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-white hover:bg-white/20 h-7 px-2 text-[10px]"
              onClick={closeVoucherViewer}
            >
              Close
            </Button>
          </div>
        </div>
        <div className="p-4">
          {voucher ? (
            <div className="space-y-3">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#E8E8E8] hover:bg-[#E8E8E8]">
                    <TableHead className="border-[#D0D0D0] p-1.5 text-[10px] w-28">
                      Field
                    </TableHead>
                    <TableHead className="border-[#D0D0D0] p-1.5 text-[10px]">
                      Value
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  <TableRow>
                    <TableCell className="border-[#D0D0D0] p-1.5 text-[10px] font-medium">
                      Date
                    </TableCell>
                    <TableCell className="border-[#D0D0D0] p-1.5 text-[10px]">
                      {voucher.date}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="border-[#D0D0D0] p-1.5 text-[10px] font-medium">
                      Voucher No
                    </TableCell>
                    <TableCell className="border-[#D0D0D0] p-1.5 text-[10px]">
                      {voucher.id}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="border-[#D0D0D0] p-1.5 text-[10px] font-medium">
                      Type
                    </TableCell>
                    <TableCell className="border-[#D0D0D0] p-1.5 text-[10px]">
                      {voucher.type}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="border-[#D0D0D0] p-1.5 text-[10px] font-medium">
                      Party / Ledger
                    </TableCell>
                    <TableCell className="border-[#D0D0D0] p-1.5 text-[10px]">
                      {voucher.party}
                    </TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="border-[#D0D0D0] p-1.5 text-[10px] font-medium">
                      Amount (₹)
                    </TableCell>
                    <TableCell className="border-[#D0D0D0] p-1.5 text-[10px]">
                      ₹ {voucher.amount.toLocaleString('en-IN')}
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </div>
          ) : (
            <p className="text-[10px] text-gray-500">Voucher not found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
