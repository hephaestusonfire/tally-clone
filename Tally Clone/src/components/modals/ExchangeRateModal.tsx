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

export function ExchangeRateModal() {
  const isOpen = useAppStore((s) => s.isExchangeRateModalOpen);
  const close = useAppStore((s) => s.closeExchangeRateModal);
  const exchangeRates = useAppStore((s) => s.exchangeRates);
  const updateExchangeRate = useAppStore((s) => s.updateExchangeRate);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#808080]/60 text-[11px]">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-none border border-[#D0D0D0] bg-white shadow-none">
        <div className="border-b border-[#D0D0D0] bg-[#DC2626] px-3 py-2 text-[14px] font-bold text-white">
          Exchange Rate Configuration
        </div>
        <div className="flex-1 overflow-auto p-3">
          <div className="border border-[#D0D0D0] bg-white">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#DC2626] hover:bg-[#DC2626]">
                  <TableHead className="border-[#D0D0D0] text-white text-[10px]">
                    Currency
                  </TableHead>
                  <TableHead className="w-32 border-[#D0D0D0] text-right text-white text-[10px]">
                    Rate (per INR)
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {exchangeRates.map((r) => (
                  <TableRow key={r.id}>
                    <TableCell className="border-[#D0D0D0] p-1 text-[10px]">
                      {r.currency}
                    </TableCell>
                    <TableCell className="border-[#D0D0D0] p-1 text-right">
                      <input
                        type="number"
                        step="0.01"
                        className="w-full border border-[#D0D0D0] bg-white px-1 py-0.5 text-right text-[10px]"
                        value={r.rate}
                        onChange={(e) =>
                          updateExchangeRate({
                            ...r,
                            rate: Number(e.target.value) || 0,
                          })
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-[#D0D0D0] bg-[#F5F5F5] px-3 py-2">
          <Button
            size="sm"
            className="bg-[#DC2626] text-white hover:bg-[#B91C1C]"
            onClick={close}
          >
            Accept
          </Button>
          <Button size="sm" variant="outline" onClick={close}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
