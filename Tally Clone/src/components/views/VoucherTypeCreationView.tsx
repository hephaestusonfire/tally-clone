import * as React from 'react';
import {
  useAppStore,
  type VoucherTypeMaster,
  type VoucherNumberingMethod,
} from '../../store/useAppStore';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

const CORE_VOUCHER_TYPES = [
  'Sales',
  'Purchase',
  'Payment',
  'Receipt',
  'Journal',
  'Contra',
  'Debit Note',
  'Credit Note',
];

const NUMBERING_METHODS: VoucherNumberingMethod[] = [
  'Automatic',
  'Manual',
  'Automatic (Manual Override)',
];

export function VoucherTypeCreationView() {
  const voucherTypes = useAppStore((s) => s.voucherTypes);
  const voucherTypeFormEditingId = useAppStore((s) => s.voucherTypeFormEditingId);
  const setVoucherTypeFormEditingId = useAppStore((s) => s.setVoucherTypeFormEditingId);
  const addVoucherType = useAppStore((s) => s.addVoucherType);
  const updateVoucherType = useAppStore((s) => s.updateVoucherType);
  const deleteVoucherType = useAppStore((s) => s.deleteVoucherType);
  const isVoucherTypeNameUnique = useAppStore((s) => s.isVoucherTypeNameUnique);
  const canDeleteVoucherType = useAppStore((s) => s.canDeleteVoucherType);
  const setActiveView = useAppStore((s) => s.setActiveView);

  const [name, setName] = React.useState('');
  const [alias, setAlias] = React.useState('');
  const [coreType, setCoreType] = React.useState(CORE_VOUCHER_TYPES[0]);
  const [abbreviation, setAbbreviation] = React.useState('');
  const [active, setActive] = React.useState(true);
  const [numberingMethod, setNumberingMethod] =
    React.useState<VoucherNumberingMethod>('Automatic');
  const [retainOriginalNumber, setRetainOriginalNumber] = React.useState(false);
  const [showUnusedNumbers, setShowUnusedNumbers] = React.useState(false);
  const [useEffectiveDates, setUseEffectiveDates] = React.useState(false);
  const [allowZeroValued, setAllowZeroValued] = React.useState(false);
  const [optionalByDefault, setOptionalByDefault] = React.useState(false);
  const [allowNarration, setAllowNarration] = React.useState(true);
  const [narrationPerLedger, setNarrationPerLedger] = React.useState(false);
  const [enableGst, setEnableGst] = React.useState(false);
  const [printAfterSave, setPrintAfterSave] = React.useState(false);
  const [whatsappAfterSave, setWhatsappAfterSave] = React.useState(false);
  const [allowClasses, setAllowClasses] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const nameInputRef = React.useRef<HTMLInputElement>(null);

  const editing = React.useMemo(
    () =>
      voucherTypeFormEditingId != null
        ? voucherTypes.find((v) => v.id === voucherTypeFormEditingId) ?? null
        : null,
    [voucherTypeFormEditingId, voucherTypes],
  );
  const isAlter = !!editing;

  React.useEffect(() => {
    if (editing) {
      setName(editing.name);
      setAlias(editing.alias ?? '');
      setCoreType(editing.coreType);
      setAbbreviation(editing.abbreviation ?? '');
      setActive(editing.active);
      setNumberingMethod(editing.numberingMethod);
      setRetainOriginalNumber(editing.retainOriginalNumber);
      setShowUnusedNumbers(editing.showUnusedNumbers);
      setUseEffectiveDates(editing.useEffectiveDates);
      setAllowZeroValued(editing.allowZeroValued);
      setOptionalByDefault(editing.optionalByDefault);
      setAllowNarration(editing.allowNarration);
      setNarrationPerLedger(editing.narrationPerLedger);
      setPrintAfterSave(editing.printAfterSave);
      setWhatsappAfterSave(editing.whatsappAfterSave);
      setAllowClasses(editing.allowClasses);
    } else {
      setName('');
      setAlias('');
      setCoreType(CORE_VOUCHER_TYPES[0]);
      setAbbreviation('');
      setActive(true);
      setNumberingMethod('Automatic');
      setRetainOriginalNumber(false);
      setShowUnusedNumbers(false);
      setUseEffectiveDates(false);
      setAllowZeroValued(false);
      setOptionalByDefault(false);
      setAllowNarration(true);
      setNarrationPerLedger(false);
      setEnableGst(false);
      setPrintAfterSave(false);
      setWhatsappAfterSave(false);
      setAllowClasses(false);
    }
    setError(null);
    setTimeout(() => nameInputRef.current?.focus(), 0);
  }, [editing?.id]);

  const handleQuit = () => {
    setVoucherTypeFormEditingId(null);
    setActiveView('master-creation');
  };

  const handleAccept = () => {
    setError(null);
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Name is required');
      nameInputRef.current?.focus();
      return;
    }
    if (!isVoucherTypeNameUnique(trimmedName, editing?.id)) {
      setError('Voucher Type name must be unique');
      nameInputRef.current?.focus();
      return;
    }

    const payload: Omit<VoucherTypeMaster, 'id'> = {
      name: trimmedName,
      alias: alias.trim() || undefined,
      coreType,
      abbreviation: abbreviation.trim() || undefined,
      active,
      numberingMethod,
      retainOriginalNumber,
      showUnusedNumbers,
      useEffectiveDates,
      allowZeroValued,
      optionalByDefault,
      allowNarration,
      narrationPerLedger,
      enableGst,
      printAfterSave,
      whatsappAfterSave,
      allowClasses,
      classes: editing?.classes ?? [],
    };

    if (editing) {
      updateVoucherType({ ...editing, ...payload });
    } else {
      addVoucherType(payload);
    }
    handleQuit();
  };

  const handleDelete = () => {
    if (!editing) return;
    if (!canDeleteVoucherType(editing.id)) {
      setError('Cannot delete: voucher type is used in vouchers');
      return;
    }
    deleteVoucherType(editing.id);
    handleQuit();
  };

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleQuit();
        return;
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        handleAccept();
        return;
      }
      if (e.key === 'd' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
        e.preventDefault();
        handleDelete();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [editing, name, alias, coreType, abbreviation, numberingMethod]);

  const allowDelete = isAlter && editing && canDeleteVoucherType(editing.id);

  return (
    <div className="flex h-full overflow-hidden bg-white">
      <ScrollArea className="flex-1 min-w-0 p-4">
        <div className="text-[14px] font-bold text-[#7F1D1D] mb-4">
          {isAlter ? 'Voucher Type Alteration' : 'Voucher Type Creation'}
        </div>

        <div className="space-y-3 max-w-xl text-[11px]">
          <div>
            <label className="block text-[10px] font-medium text-gray-600 mb-1">Name *</label>
            <input
              ref={nameInputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-[#D0D0D0] px-2 py-1.5 w-full"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-600 mb-1">Alias</label>
            <input
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              className="border border-[#D0D0D0] px-2 py-1.5 w-full"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-600 mb-1">Select type of voucher</label>
            <select
              value={coreType}
              onChange={(e) => setCoreType(e.target.value)}
              className="border border-[#D0D0D0] px-2 py-1.5 bg-white"
            >
              {CORE_VOUCHER_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-600 mb-1">Abbreviation</label>
            <input
              type="text"
              value={abbreviation}
              onChange={(e) => setAbbreviation(e.target.value)}
              className="border border-[#D0D0D0] px-2 py-1.5 w-32"
            />
          </div>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={active}
              onChange={(e) => setActive(e.target.checked)}
            />
            Activate this Voucher Type
          </label>

          <div className="border-t border-[#E0E0E0] pt-3 mt-2">
            <div className="text-[10px] font-semibold text-gray-700 mb-2">Voucher Numbering</div>
            <div className="space-y-2">
              <div className="flex flex-wrap gap-3 items-center">
                <span className="text-[10px] text-gray-600">Method of numbering:</span>
                <select
                  value={numberingMethod}
                  onChange={(e) =>
                    setNumberingMethod(e.target.value as VoucherNumberingMethod)
                  }
                  className="border border-[#D0D0D0] px-2 py-1.5 bg-white text-[11px]"
                >
                  {NUMBERING_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enableGst}
                  onChange={(e) => setEnableGst(e.target.checked)}
                />
                Enable GST
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={retainOriginalNumber}
                  onChange={(e) => setRetainOriginalNumber(e.target.checked)}
                />
                Retain original voucher number behavior
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={showUnusedNumbers}
                  onChange={(e) => setShowUnusedNumbers(e.target.checked)}
                />
                Show unused voucher numbers
              </label>
            </div>
          </div>

          <div className="border-t border-[#E0E0E0] pt-3 mt-2">
            <div className="text-[10px] font-semibold text-gray-700 mb-2">Voucher Behavior</div>
            <div className="space-y-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={useEffectiveDates}
                  onChange={(e) => setUseEffectiveDates(e.target.checked)}
                />
                Use effective dates
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowZeroValued}
                  onChange={(e) => setAllowZeroValued(e.target.checked)}
                />
                Allow zero-valued transactions
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={optionalByDefault}
                  onChange={(e) => setOptionalByDefault(e.target.checked)}
                />
                Make voucher type optional by default
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowNarration}
                  onChange={(e) => setAllowNarration(e.target.checked)}
                />
                Allow narration in voucher
              </label>
              <div className="flex flex-wrap gap-2 items-center">
                <span className="text-[10px] text-gray-600">Use common narration:</span>
                <select
                  value={narrationPerLedger ? 'No' : 'Yes'}
                  onChange={(e) => setNarrationPerLedger(e.target.value === 'No')}
                  className="border border-[#D0D0D0] px-2 py-1 bg-white text-[11px]"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                <span className="text-[10px] text-gray-500">Yes = one narration per voucher; No = per ledger</span>
              </div>
            </div>
          </div>

          <div className="border-t border-[#E0E0E0] pt-3 mt-2">
            <div className="text-[10px] font-semibold text-gray-700 mb-2">Printing &amp; Sharing</div>
            <div className="space-y-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={printAfterSave}
                  onChange={(e) => setPrintAfterSave(e.target.checked)}
                />
                Print voucher after saving
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={whatsappAfterSave}
                  onChange={(e) => setWhatsappAfterSave(e.target.checked)}
                />
                WhatsApp voucher after saving
              </label>
            </div>
          </div>

          <div className="border-t border-[#E0E0E0] pt-3 mt-2">
            <div className="text-[10px] font-semibold text-gray-700 mb-2">Voucher Classes</div>
            <label className="flex items-center gap-2 cursor-pointer mb-1">
              <input
                type="checkbox"
                checked={allowClasses}
                onChange={(e) => setAllowClasses(e.target.checked)}
              />
              Allow Voucher Classes
            </label>
            {allowClasses && (
              <p className="text-[10px] text-gray-500">
                Classes can pre-define ledger allocations and control entry behavior.
                (Placeholder: class configuration UI not implemented yet.)
              </p>
            )}
          </div>

          {error && <p className="text-[10px] text-red-600">{error}</p>}
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            className="bg-[#DC2626] text-white hover:bg-[#B91C1C] text-[11px]"
            onClick={handleAccept}
          >
            Accept (Ctrl+A)
          </Button>
          <Button size="sm" variant="outline" onClick={handleQuit}>
            Quit (Esc)
          </Button>
          {allowDelete && (
            <Button
              size="sm"
              variant="outline"
              className="text-red-700 border-red-300"
              onClick={handleDelete}
            >
              Delete (D)
            </Button>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

