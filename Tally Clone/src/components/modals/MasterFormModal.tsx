import * as React from 'react';
import { useAppStore, type Ledger, type StockGroup } from '../../store/useAppStore';
import { Button } from '../ui/button';
import type { MasterItem } from '../../store/masterCreation';

export type MasterFormMode = 'create' | 'alter';

export interface MasterFormModalProps {
  mode: MasterFormMode;
  master: MasterItem;
  /** For alter: existing ledger to edit */
  existingLedger?: Ledger | null;
  /** For alter: existing stock group to edit */
  existingStockGroup?: StockGroup | null;
  onClose: () => void;
}

export function MasterFormModal({
  mode,
  master,
  existingLedger = null,
  existingStockGroup = null,
  onClose,
}: MasterFormModalProps) {
  const addLedger = useAppStore((s) => s.addLedger);
  const updateLedger = useAppStore((s) => s.updateLedger);
  const addStockGroup = useAppStore((s) => s.addStockGroup);
  const updateStockGroup = useAppStore((s) => s.updateStockGroup);

  const [name, setName] = React.useState('');
  const [under, setUnder] = React.useState('');
  const [amount, setAmount] = React.useState(0);
  const [active, setActive] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (mode === 'alter') {
      if (existingLedger) {
        setName(existingLedger.name);
        setUnder(existingLedger.under);
        setAmount(existingLedger.amount);
        setActive(!existingLedger.inactive);
      } else if (existingStockGroup) {
        setName(existingStockGroup.name);
        setUnder(existingStockGroup.under);
        setActive(!existingStockGroup.inactive);
      }
    } else {
      setName('');
      setUnder('');
      setAmount(0);
      setActive(true);
    }
  }, [mode, existingLedger, existingStockGroup]);

  const handleAccept = () => {
    setError(null);
    if (master.formType === 'ledger') {
      if (!name.trim()) {
        setError('Name is required');
        return;
      }
      if (mode === 'alter' && existingLedger) {
        updateLedger({
          ...existingLedger,
          name: name.trim(),
          under: under.trim() || 'Primary',
          amount,
          inactive: !active,
        });
      } else {
        addLedger({ name: name.trim(), under: under.trim() || 'Primary', amount });
      }
      onClose();
    } else if (master.formType === 'stock-group') {
      if (!name.trim()) {
        setError('Name is required');
        return;
      }
      if (mode === 'alter' && existingStockGroup) {
        updateStockGroup({
          ...existingStockGroup,
          name: name.trim(),
          under: under.trim() || 'Primary',
          addQuantities: existingStockGroup.addQuantities ?? true,
          inactive: !active,
        });
      } else {
        addStockGroup({ name: name.trim(), under: under.trim() || 'Primary', addQuantities: true });
      }
      onClose();
    } else {
      onClose();
    }
  };

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.ctrlKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        handleAccept();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [master.id, name, under, amount, active, mode, onClose]);

  const title = mode === 'create' ? `Create ${master.label}` : `Alter ${master.label}`;
  const showActive = mode === 'alter' && (existingLedger || existingStockGroup);

  if (master.formType === 'placeholder' || !master.formType) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#808080]/60 text-[11px]">
        <div className="flex w-full max-w-md flex-col border border-[#D0D0D0] bg-white shadow-lg rounded-sm overflow-hidden">
          <div className="border-b border-[#D0D0D0] bg-[#FFD700] px-4 py-2 text-[12px] font-bold text-[#7F1D1D]">
            {title}
          </div>
          <div className="p-4">
            <p className="text-[11px] text-gray-600">Form for {master.label} is not implemented yet.</p>
          </div>
          <div className="flex justify-end gap-2 px-4 py-2 border-t border-[#D0D0D0] bg-[#F5F5F5]">
            <Button size="sm" variant="outline" onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#808080]/60 text-[11px]">
      <div className="flex w-full max-w-md flex-col border border-[#D0D0D0] bg-white shadow-lg rounded-sm overflow-hidden">
        <div className="border-b border-[#D0D0D0] bg-[#FFD700] px-4 py-2 text-[12px] font-bold text-[#7F1D1D]">
          {title}
        </div>
        <div className="p-4 space-y-3">
          {error && <p className="text-[10px] text-red-600">{error}</p>}
          <label className="block">
            <span className="block text-[10px] font-medium text-gray-600 mb-1">Name</span>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-[#D0D0D0] px-2 py-1 w-full"
              placeholder="Enter name"
            />
          </label>
          <label className="block">
            <span className="block text-[10px] font-medium text-gray-600 mb-1">Under</span>
            <input
              type="text"
              value={under}
              onChange={(e) => setUnder(e.target.value)}
              className="border border-[#D0D0D0] px-2 py-1 w-full"
              placeholder="Primary"
            />
          </label>
          {master.formType === 'ledger' && (
            <label className="block">
              <span className="block text-[10px] font-medium text-gray-600 mb-1">Opening Balance</span>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="border border-[#D0D0D0] px-2 py-1 w-full"
              />
            </label>
          )}
          {showActive && (
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={active}
                onChange={(e) => setActive(e.target.checked)}
                className="border border-[#D0D0D0]"
              />
              <span className="text-[10px] font-medium text-gray-600">Active</span>
            </label>
          )}
        </div>
        <div className="flex justify-end gap-2 px-4 py-2 border-t border-[#D0D0D0] bg-[#F5F5F5]">
          <Button size="sm" variant="outline" onClick={onClose}>
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
