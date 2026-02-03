import * as React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { useGatewayStore } from '../../store/useGatewayStore';
import { Button } from '../ui/button';

function toDDMMYYYY(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  const day = d.getDate();
  const month = d.getMonth() + 1;
  const year = d.getFullYear();
  return `${day.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${year}`;
}

function fromDDMMYYYY(s: string): string {
  const parts = s.split('-');
  if (parts.length !== 3) return '';
  const [dd, mm, yyyy] = parts;
  const year = yyyy.length === 2 ? `20${yyyy}` : yyyy;
  return `${year}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
}

export function ChangeDateModal() {
  const isOpen = useGatewayStore((s) => s.isDateModalOpen);
  const close = useGatewayStore((s) => s.closeDateModal);
  const date = useAppStore((s) => s.date);
  const setDate = useAppStore((s) => s.setDate);
  const activeView = useAppStore((s) => s.activeView);
  const setAccountingVoucherDate = useAppStore((s) => s.setAccountingVoucherDate);
  const financialPeriodStart = useAppStore((s) => s.financialPeriodStart);
  const financialPeriodEnd = useAppStore((s) => s.financialPeriodEnd);

  const [value, setValue] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (isOpen) {
      const iso = date.includes('-') ? date : fromDDMMYYYY(date) || '2024-05-31';
      setValue(toDDMMYYYY(iso) || '31-05-2024');
      setError(null);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [isOpen, date]);

  const handleAccept = () => {
    const iso = fromDDMMYYYY(value);
    if (!iso) {
      setError('Enter date as DD-MM-YYYY');
      return;
    }
    const d = new Date(iso);
    const start = new Date(financialPeriodStart);
    const end = new Date(financialPeriodEnd);
    if (d < start || d > end) {
      setError(`Date must be between ${toDDMMYYYY(financialPeriodStart)} and ${toDDMMYYYY(financialPeriodEnd)}`);
      return;
    }
    const display = `${d.getDate()} ${['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]} ${String(d.getFullYear()).slice(2)}`;
    setDate(display);
    if (activeView === 'vouchers') setAccountingVoucherDate(iso);
    close();
  };

  React.useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.ctrlKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        handleAccept();
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAccept();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, value, financialPeriodStart, financialPeriodEnd]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#808080]/60 text-[11px]">
      <div className="flex w-full max-w-sm flex-col border border-[#D0D0D0] bg-white shadow-lg rounded-sm overflow-hidden">
        <div className="border-b border-[#D0D0D0] bg-[#FFD700] px-4 py-2 text-[12px] font-bold text-[#7F1D1D]">
          Change Current Date
        </div>
        <div className="p-4 space-y-3">
          <label className="block">
            <span className="block text-[10px] font-medium text-gray-600 mb-1">Current Date (DD-MM-YYYY)</span>
            <input
              ref={inputRef}
              type="text"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="31-05-2024"
              className="border border-[#D0D0D0] px-2 py-1 w-full"
            />
          </label>
          {error && <p className="text-[10px] text-red-600">{error}</p>}
          <p className="text-[10px] text-gray-500">
            Financial period: {toDDMMYYYY(financialPeriodStart)} to {toDDMMYYYY(financialPeriodEnd)}
          </p>
        </div>
        <div className="flex justify-end gap-2 px-4 py-2 border-t border-[#D0D0D0] bg-[#F5F5F5]">
          <Button size="sm" variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button size="sm" className="bg-[#DC2626] text-white hover:bg-[#B91C1C]" onClick={handleAccept}>
            Accept (Ctrl+A)
          </Button>
        </div>
      </div>
    </div>
  );
}
