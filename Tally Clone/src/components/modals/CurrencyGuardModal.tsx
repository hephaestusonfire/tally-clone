import * as React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../ui/button';

interface CurrencyGuardModalProps {
  onCreateNew: () => void;
  onAlterExisting: () => void;
  onClose: () => void;
}

export function CurrencyGuardModal({ onCreateNew, onAlterExisting, onClose }: CurrencyGuardModalProps) {
  const getBaseCurrency = useAppStore((s) => s.getBaseCurrency);
  const base = getBaseCurrency();

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        onCreateNew();
      }
      if (e.key === 'a' || e.key === 'A') {
        e.preventDefault();
        onAlterExisting();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onCreateNew, onAlterExisting, onClose]);

  if (!base) return null;

  const symbol = base.symbol || '₹';
  const message = `Currency ${symbol} exists by default for the Company.\nDo you want to alter Currency ${symbol} or create a new Currency?`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 text-[11px]" role="dialog" aria-modal="true" aria-labelledby="currency-guard-title">
      <div className="flex w-full max-w-md flex-col border border-[#D0D0D0] bg-white shadow-lg rounded-sm overflow-hidden">
        <div id="currency-guard-title" className="border-b border-[#D0D0D0] bg-[#FFD700] px-4 py-2 text-[12px] font-bold text-[#7F1D1D]">
          Currency
        </div>
        <div className="p-4 whitespace-pre-line text-[11px] text-gray-800">
          {message}
        </div>
        <div className="flex justify-end gap-2 px-4 py-2 border-t border-[#D0D0D0] bg-[#F5F5F5]">
          <Button size="sm" variant="outline" onClick={onClose}>
            Cancel (Esc)
          </Button>
          <Button size="sm" variant="outline" className="border-[#DC2626] text-[#DC2626]" onClick={onAlterExisting}>
            A: Alter Existing
          </Button>
          <Button size="sm" className="bg-[#DC2626] text-white hover:bg-[#B91C1C]" onClick={onCreateNew}>
            C: Create New
          </Button>
        </div>
      </div>
    </div>
  );
}
