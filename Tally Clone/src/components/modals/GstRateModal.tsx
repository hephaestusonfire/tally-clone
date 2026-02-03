import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

const TAX_TYPE_OPTIONS = ['IGST 18%', 'CGST 9%', 'SGST 9%', 'IGST 12%', 'CGST 6%', 'SGST 6%'];

const APPLICABLE_LEDGER_OPTIONS = [
  'Output GST',
  'Input GST',
  'Output CGST',
  'Input CGST',
  'Output SGST',
  'Input SGST',
  'Sales Accounts',
  'Purchase Accounts',
];

export function GstRateModal() {
  const isOpen = useAppStore((s) => s.isGstRateModalOpen);
  const close = useAppStore((s) => s.closeGstRateModal);
  const addGstRate = useAppStore((s) => s.addGstRate);

  const [rateName, setRateName] = useState('');
  const [ratePercent, setRatePercent] = useState(18);
  const [taxType, setTaxType] = useState('IGST 18%');
  const [applicableLedgers, setApplicableLedgers] = useState<string[]>([]);

  if (!isOpen) return null;

  const handleAccept = () => {
    addGstRate({
      rateName: rateName || taxType,
      ratePercent,
      taxType,
      applicableLedgers,
    });
    setRateName('');
    setRatePercent(18);
    setTaxType('IGST 18%');
    setApplicableLedgers([]);
    close();
  };

  const toggleLedger = (name: string) => {
    setApplicableLedgers((prev) =>
      prev.includes(name) ? prev.filter((l) => l !== name) : [...prev, name],
    );
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#808080]/60 text-[11px]">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col rounded-none border border-[#D0D0D0] bg-white shadow-none">
        <div className="border-b border-[#D0D0D0] bg-[#DC2626] px-3 py-2 text-[14px] font-bold text-white">
          GST Rate Configuration
        </div>
        <div className="flex-1 overflow-auto p-3 space-y-3">
          <div className="grid grid-cols-[100px_1fr] gap-2 items-center text-[10px]">
            <label className="font-semibold">Rate Name</label>
            <input
              type="text"
              className="border border-[#D0D0D0] bg-white px-2 py-1 text-[10px]"
              value={rateName}
              onChange={(e) => setRateName(e.target.value)}
              placeholder="e.g. IGST 18%"
            />
            <label className="font-semibold">% Rate</label>
            <input
              type="number"
              className="border border-[#D0D0D0] bg-white px-2 py-1 text-[10px] text-right w-20"
              value={ratePercent}
              onChange={(e) => setRatePercent(Number(e.target.value) || 0)}
            />
            <label className="font-semibold">Tax Type</label>
            <select
              className="border border-[#D0D0D0] bg-white px-2 py-1 text-[10px]"
              value={taxType}
              onChange={(e) => setTaxType(e.target.value)}
            >
              {TAX_TYPE_OPTIONS.map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-semibold mb-1 text-[10px]">
              Applicable Ledgers
            </label>
            <ScrollArea className="h-32 border border-[#D0D0D0] bg-[#F5F5F5] p-1">
              <ul className="space-y-0.5 text-[10px]">
                {APPLICABLE_LEDGER_OPTIONS.map((name) => (
                  <li key={name}>
                    <label className="flex cursor-pointer items-center gap-2 hover:bg-[#E0E0E0] px-1 py-0.5">
                      <input
                        type="checkbox"
                        checked={applicableLedgers.includes(name)}
                        onChange={() => toggleLedger(name)}
                        className="h-3 w-3 border border-[#D0D0D0]"
                      />
                      <span>{name}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          </div>
        </div>
        <div className="flex justify-end gap-2 border-t border-[#D0D0D0] bg-[#F5F5F5] px-3 py-2">
          <Button
            size="sm"
            className="bg-[#DC2626] text-white hover:bg-[#B91C1C]"
            onClick={handleAccept}
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
