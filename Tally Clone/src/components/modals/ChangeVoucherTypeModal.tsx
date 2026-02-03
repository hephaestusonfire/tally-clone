import * as React from 'react';
import { useAppStore, type VoucherTypeMaster, type VoucherTypeMasterClass } from '../../store/useAppStore';
import { Button } from '../ui/button';

function structureKey(typeId: number, classId: number | null): string {
  return `${typeId}-${classId ?? ''}`;
}

export function ChangeVoucherTypeModal() {
  const open = useAppStore((s) => s.changeVoucherTypePopupOpen);
  const setOpen = useAppStore((s) => s.setChangeVoucherTypePopupOpen);
  const voucherTypes = useAppStore((s) => s.voucherTypes);
  const accountingVoucherTypeId = useAppStore((s) => s.accountingVoucherTypeId);
  const accountingVoucherClassId = useAppStore((s) => s.accountingVoucherClassId);
  const accountingVoucherDirty = useAppStore((s) => s.accountingVoucherDirty);
  const setAccountingVoucherTypeId = useAppStore((s) => s.setAccountingVoucherTypeId);
  const setAccountingVoucherClassId = useAppStore((s) => s.setAccountingVoucherClassId);
  const addVoucherClass = useAppStore((s) => s.addVoucherClass);

  const [selectedTypeId, setSelectedTypeId] = React.useState(accountingVoucherTypeId);
  const [selectedClassId, setSelectedClassId] = React.useState<number | null>(accountingVoucherClassId);
  const [pendingAccept, setPendingAccept] = React.useState(false);
  const [createNewClass, setCreateNewClass] = React.useState(false);
  const [newClassName, setNewClassName] = React.useState('');
  const typeRef = React.useRef<HTMLSelectElement>(null);

  const selectedType = voucherTypes.find((v) => v.id === selectedTypeId);
  const classes: VoucherTypeMasterClass[] = selectedType?.allowClasses && selectedType.classes?.length
    ? selectedType.classes
    : [];

  const currentKey = structureKey(accountingVoucherTypeId, accountingVoucherClassId);
  const newKey = structureKey(selectedTypeId, selectedClassId);
  const structureChanges = currentKey !== newKey;

  React.useEffect(() => {
    if (open) {
      setSelectedTypeId(accountingVoucherTypeId);
      const typeForClass = voucherTypes.find((v) => v.id === accountingVoucherTypeId);
      const defaultClassId = accountingVoucherClassId ?? (typeForClass?.allowClasses && typeForClass.classes?.length ? typeForClass.classes[0].id : null);
      setSelectedClassId(defaultClassId);
      setPendingAccept(false);
      setCreateNewClass(false);
      setNewClassName('');
      setTimeout(() => typeRef.current?.focus(), 0);
    }
  }, [open, accountingVoucherTypeId, accountingVoucherClassId, voucherTypes]);

  React.useEffect(() => {
    if (selectedType?.allowClasses && selectedType.classes?.length && selectedClassId === null && !createNewClass) {
      setSelectedClassId(selectedType.classes[0]?.id ?? null);
    }
    if (!selectedType?.allowClasses || !selectedType.classes?.length) {
      setSelectedClassId(null);
    }
  }, [selectedTypeId, selectedType, createNewClass]);

  const handleAccept = () => {
    if (createNewClass && newClassName.trim()) {
      addVoucherClass(selectedTypeId, newClassName.trim());
      const updatedTypes = useAppStore.getState().voucherTypes;
      const updatedType = updatedTypes.find((v) => v.id === selectedTypeId);
      const newClass = updatedType?.classes.find((c) => c.name === newClassName.trim());
      if (newClass) {
        setAccountingVoucherClassId(newClass.id);
      }
      setCreateNewClass(false);
      setNewClassName('');
    } else if (createNewClass && !newClassName.trim()) {
      return;
    } else if (!createNewClass) {
      if (accountingVoucherDirty && structureChanges && !pendingAccept) {
        if (!window.confirm('Voucher structure will change. Entered data may not apply. Switch anyway?')) {
          return;
        }
        setPendingAccept(true);
      }
      setAccountingVoucherTypeId(selectedTypeId);
      setAccountingVoucherClassId(selectedClassId);
    }
    setOpen(false);
  };

  const handleCancel = () => {
    setOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true" aria-labelledby="change-voucher-type-title">
      <div className="bg-white border border-[#D0D0D0] shadow-lg rounded min-w-[320px] max-w-[400px]">
        <div className="border-b border-[#D0D0D0] bg-[#DC2626] px-3 py-2">
          <h2 id="change-voucher-type-title" className="text-sm font-bold text-white">
            Change Voucher Type (Ctrl+H)
          </h2>
        </div>
        <div className="p-3 space-y-3">
          <div>
            <label className="block text-[11px] font-medium text-gray-700 mb-1">Name</label>
            <select
              ref={typeRef}
              className="w-full border border-[#D0D0D0] bg-white px-2 py-1.5 text-[12px]"
              value={selectedTypeId}
              onChange={(e) => {
                setSelectedTypeId(Number(e.target.value));
                setCreateNewClass(false);
                setNewClassName('');
              }}
            >
              {voucherTypes.filter((v) => v.active && !v.inactive).map((vt: VoucherTypeMaster) => (
                <option key={vt.id} value={vt.id}>
                  {vt.name}
                </option>
              ))}
            </select>
          </div>
          {(classes.length > 0 || selectedType?.allowClasses) && (
            <div>
              <label className="block text-[11px] font-medium text-gray-700 mb-1">Class</label>
              <select
                className="w-full border border-[#D0D0D0] bg-white px-2 py-1.5 text-[12px] mb-1"
                value={createNewClass ? '' : (selectedClassId ?? '')}
                onChange={(e) => {
                  if (e.target.value === '__new__') {
                    setCreateNewClass(true);
                    setSelectedClassId(null);
                  } else {
                    setCreateNewClass(false);
                    setSelectedClassId(e.target.value ? Number(e.target.value) : null);
                  }
                }}
              >
                <option value="">Not Applicable</option>
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
                <option value="__new__">+ Create new class</option>
              </select>
              {createNewClass && (
                <input
                  type="text"
                  className="w-full border border-[#D0D0D0] px-2 py-1.5 text-[12px]"
                  placeholder="New class name (e.g. Sales @5%)"
                  value={newClassName}
                  onChange={(e) => setNewClassName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAccept()}
                />
              )}
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 border-t border-[#D0D0D0] bg-[#E8E8E8] px-3 py-2">
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="text-[11px]"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            type="button"
            size="sm"
            className="bg-[#DC2626] text-white hover:bg-[#B91C1C] text-[11px]"
            onClick={handleAccept}
          >
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
