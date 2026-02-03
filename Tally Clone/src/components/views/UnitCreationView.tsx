import * as React from 'react';
import {
  useAppStore,
  type InventoryUnit,
  type InventoryUnitType,
} from '../../store/useAppStore';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

const UQC_DEFAULT = 'Not Applicable';
/** Tally/GST-compliant Unit Quantity Codes (UQC) for GSTR-1 */
const UQC_OPTIONS = [
  UQC_DEFAULT,
  'NOS',  // Numbers
  'KGS',  // Kilograms
  'LTR',  // Litres
  'MTR',  // Metres
  'HUR',  // Hours
  'PCS',  // Pieces
  'SET',  // Set
  'DOZ',  // Dozen
  'BOX',  // Box
  'BAG',  // Bag
  'BAL',  // Ball
  'BOU',  // Billion Units
  'CAR',  // Carat
  'CGM',  // Centigram
  'CTN',  // Carton
  'CEN',  // Centimetre
  'CKG',  // Cubic metre
  'CTM',  // Cubic centimetre
  'DPC',  // Dozen piece
  'DZN',  // Dozen
  'GGK',  // Gross kilogram
  'GMS',  // Gram
  'GRS',  // Gross
  'GYD',  // Gross yard
  'KLR',  // Kilolitre
  'KME',  // Kilometre
  'MLT',  // Millilitre
  'MGM',  // Milligram
  'PAK',  // Pack
  'PAIR', // Pair
  'PRS',  // Pairs
  'QTL',  // Quintal
  'ROL',  // Roll
  'SQM',  // Square metre
  'SQF',  // Square foot
  'TNE',  // Tonne (metric ton)
  'TUB',  // Tub
  'UMS',  // Unit of measurement
  'OTH',  // Other
];

export function UnitCreationView() {
  const inventoryUnits = useAppStore((s) => s.inventoryUnits);
  const unitFormEditingId = useAppStore((s) => s.unitFormEditingId);
  const setUnitFormEditingId = useAppStore((s) => s.setUnitFormEditingId);
  const addInventoryUnit = useAppStore((s) => s.addInventoryUnit);
  const updateInventoryUnit = useAppStore((s) => s.updateInventoryUnit);
  const deleteInventoryUnit = useAppStore((s) => s.deleteInventoryUnit);
  const isUnitSymbolUnique = useAppStore((s) => s.isUnitSymbolUnique);
  const canDeleteInventoryUnit = useAppStore((s) => s.canDeleteInventoryUnit);
  const canAlterInventoryUnit = useAppStore((s) => s.canAlterInventoryUnit);
  const setActiveView = useAppStore((s) => s.setActiveView);

  const [type, setType] = React.useState<InventoryUnitType>('simple');
  const [symbol, setSymbol] = React.useState('');
  const [formalName, setFormalName] = React.useState('');
  const [baseUnit, setBaseUnit] = React.useState('');
  const [conversion, setConversion] = React.useState('');
  const [uqc, setUqc] = React.useState(UQC_DEFAULT);
  const [decimalPlaces, setDecimalPlaces] = React.useState(0);
  const [inactive, setInactive] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [moreDetailsOverlayOpen, setMoreDetailsOverlayOpen] = React.useState(false);
  const [showMoreInOverlay, setShowMoreInOverlay] = React.useState(false);
  const [showInactiveInOverlay, setShowInactiveInOverlay] = React.useState(false);
  const [quitConfirmOpen, setQuitConfirmOpen] = React.useState(false);
  const symbolInputRef = React.useRef<HTMLInputElement>(null);
  const initialSnapshotRef = React.useRef<Record<string, unknown> | null>(null);
  const moreDetailsOverlayRef = React.useRef<HTMLDivElement>(null);

  const editing = React.useMemo(
    () =>
      unitFormEditingId != null
        ? inventoryUnits.find((u) => u.id === unitFormEditingId) ?? null
        : null,
    [unitFormEditingId, inventoryUnits]
  );
  const isAlter = !!editing;
  const alterLocked = isAlter && editing && !canAlterInventoryUnit(editing.id);
  const uqcLocked = alterLocked;
  const decimalPlacesLocked = alterLocked;

  React.useEffect(() => {
    if (editing) {
      setType(editing.type);
      setSymbol(editing.symbol);
      setFormalName(editing.formalName ?? '');
      setBaseUnit(editing.baseUnit ?? '');
      setConversion(editing.conversion != null ? String(editing.conversion) : '');
      setUqc(editing.uqc ?? UQC_DEFAULT);
      setDecimalPlaces(editing.decimalPlaces ?? 0);
      setInactive(editing.inactive ?? false);
      initialSnapshotRef.current = {
        type: editing.type,
        symbol: editing.symbol,
        formalName: editing.formalName ?? '',
        baseUnit: editing.baseUnit ?? '',
        conversion: editing.conversion,
        uqc: editing.uqc ?? UQC_DEFAULT,
        decimalPlaces: editing.decimalPlaces ?? 0,
        inactive: editing.inactive ?? false,
      };
    } else {
      setType('simple');
      setSymbol('');
      setFormalName('');
      setBaseUnit('');
      setConversion('');
      setUqc(UQC_DEFAULT);
      setDecimalPlaces(0);
      setInactive(false);
      initialSnapshotRef.current = {
        type: 'simple',
        symbol: '',
        formalName: '',
        baseUnit: '',
        conversion: '',
        uqc: UQC_DEFAULT,
        decimalPlaces: 0,
        inactive: false,
      };
    }
    setError(null);
    setQuitConfirmOpen(false);
    setTimeout(() => symbolInputRef.current?.focus(), 0);
  }, [editing?.id]);

  const hasUnsavedChanges = React.useMemo(() => {
    const s = initialSnapshotRef.current;
    if (!s) return false;
    return (
      s.type !== type ||
      s.symbol !== symbol ||
      s.formalName !== formalName ||
      s.baseUnit !== baseUnit ||
      (s.conversion as number | undefined) !== (conversion === '' ? undefined : Number(conversion)) ||
      s.uqc !== uqc ||
      (s.decimalPlaces as number) !== decimalPlaces ||
      s.inactive !== inactive
    );
  }, [type, symbol, formalName, baseUnit, conversion, uqc, decimalPlaces, inactive]);

  const handleQuit = () => {
    setQuitConfirmOpen(false);
    setUnitFormEditingId(null);
    setActiveView('units-list');
  };

  const handleAccept = () => {
    setError(null);
    const trimmedSymbol = symbol.trim();
    if (!trimmedSymbol) {
      setError('Symbol is required');
      symbolInputRef.current?.focus();
      return;
    }
    if (!isUnitSymbolUnique(trimmedSymbol, editing?.id)) {
      setError('Unit symbol must be unique');
      symbolInputRef.current?.focus();
      return;
    }
    if (type === 'compound') {
      if (!baseUnit.trim()) {
        setError('Second Unit (base unit) is required for compound unit');
        return;
      }
      const baseExists = inventoryUnits.some(
        (u) => u.symbol.trim().toLowerCase() === baseUnit.trim().toLowerCase()
      );
      if (!baseExists) {
        setError('Second Unit must be an existing unit');
        return;
      }
      const conv = Number(conversion);
      if (!Number.isFinite(conv) || conv <= 0) {
        setError('Conversion must be a positive number (e.g. 1 Box = 10 Nos)');
        return;
      }
    }
    const dec = Math.floor(Number(decimalPlaces));
    if (dec < 0 || dec > 10) {
      setError('Number of Decimal Places must be between 0 and 10');
      return;
    }
    const payload: Omit<InventoryUnit, 'id'> = {
      type,
      symbol: trimmedSymbol,
      formalName: type === 'simple' ? (formalName.trim() || undefined) : undefined,
      baseUnit: type === 'compound' ? baseUnit.trim() : undefined,
      conversion: type === 'compound' ? Number(conversion) : undefined,
      uqc: uqc === UQC_DEFAULT ? undefined : uqc,
      decimalPlaces: dec,
      inactive,
    };
    if (editing?.uqcHistory) (payload as InventoryUnit).uqcHistory = editing.uqcHistory;
    if (editing) {
      updateInventoryUnit({ ...editing, ...payload });
    } else {
      addInventoryUnit(payload);
    }
    handleQuit();
  };

  const handleDelete = () => {
    if (!editing) return;
    if (!canDeleteInventoryUnit(editing.id)) {
      setError('Cannot delete: Unit is used in stock items');
      return;
    }
    deleteInventoryUnit(editing.id);
    handleQuit();
  };

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (moreDetailsOverlayOpen) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setMoreDetailsOverlayOpen(false);
          return;
        }
        if (e.key === 'i' || e.key === 'I') {
          const target = e.target as HTMLElement;
          if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
          e.preventDefault();
          setMoreDetailsOverlayOpen(false);
          return;
        }
        return;
      }
      if (quitConfirmOpen) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        if (hasUnsavedChanges) {
          setQuitConfirmOpen(true);
        } else {
          handleQuit();
        }
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
        return;
      }
      if (e.key === 'i' || e.key === 'I') {
        const target = e.target as HTMLElement;
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
        e.preventDefault();
        setMoreDetailsOverlayOpen(true);
        return;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [editing, symbol, moreDetailsOverlayOpen, quitConfirmOpen, hasUnsavedChanges]);

  React.useEffect(() => {
    if (!moreDetailsOverlayOpen || !moreDetailsOverlayRef.current) return;
    const el = moreDetailsOverlayRef.current;
    const focusable = el.querySelectorAll<HTMLElement>(
      'input:not([disabled]):not([readOnly]), select, textarea, button[type="button"]'
    );
    const first = focusable[0];
    if (first) setTimeout(() => first.focus(), 0);
  }, [moreDetailsOverlayOpen]);

  const allowDelete = isAlter && editing && canDeleteInventoryUnit(editing.id);
  const simpleUnitSymbols = React.useMemo(
    () => inventoryUnits.filter((u) => u.type === 'simple').map((u) => u.symbol),
    [inventoryUnits]
  );

  return (
    <div className="flex h-full overflow-hidden bg-white">
      <ScrollArea className="flex-1 min-w-0 p-4">
        <div className="text-[14px] font-bold text-[#7F1D1D] mb-4">
          {isAlter ? 'Unit Alteration' : 'Unit Creation'}
        </div>

        <p className="text-[10px] text-gray-600 mb-3">
          Units are company-scoped. Compound units auto-compute conversions (e.g. 1 Box = 10 Nos). Cannot alter Type or Decimal Places once used in stock items.
        </p>

        <div className="space-y-4 max-w-xl text-[11px]">
          <div>
            <label className="block text-[10px] font-medium text-gray-600 mb-1">Type</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="unitType"
                  checked={type === 'simple'}
                  onChange={() => setType('simple')}
                  disabled={alterLocked}
                />
                Simple
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="unitType"
                  checked={type === 'compound'}
                  onChange={() => setType('compound')}
                  disabled={alterLocked}
                />
                Compound
              </label>
            </div>
            {alterLocked && (
              <p className="text-[10px] text-amber-700 mt-0.5">
                Unit type cannot be changed when unit is used in stock items.
              </p>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-medium text-gray-600 mb-1">
              {type === 'compound' ? 'First Unit (Symbol) *' : 'Symbol *'}
            </label>
            <input
              ref={symbolInputRef}
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              disabled={alterLocked}
              className="border border-[#D0D0D0] px-2 py-1.5 w-40 disabled:bg-gray-100"
              placeholder={type === 'compound' ? 'e.g. Box, Dozen, Roll' : 'e.g. Nos, Kg, Ltr'}
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium text-gray-600 mb-1">Formal Name</label>
            <input
              type="text"
              value={formalName}
              onChange={(e) => setFormalName(e.target.value)}
              className="border border-[#D0D0D0] px-2 py-1.5 w-full"
              placeholder="e.g. Numbers, Kilogram"
            />
          </div>

          <div>
            <label className="block text-[10px] font-medium text-gray-600 mb-1">Unit Quantity Code (UQC)</label>
            <select
              value={uqc}
              onChange={(e) => setUqc(e.target.value)}
              disabled={uqcLocked}
              className="border border-[#D0D0D0] px-2 py-1.5 w-full bg-white disabled:bg-gray-100"
            >
              {UQC_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
            {uqcLocked && (
              <p className="text-[10px] text-amber-700 mt-0.5">UQC cannot be changed when unit is used in stock items.</p>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-medium text-gray-600 mb-1">Number of Decimal Places</label>
            <input
              type="number"
              min={0}
              max={10}
              step={1}
              value={decimalPlaces}
              onChange={(e) => setDecimalPlaces(Number(e.target.value) || 0)}
              disabled={decimalPlacesLocked}
              className="border border-[#D0D0D0] px-2 py-1.5 w-20 disabled:bg-gray-100"
            />
            {decimalPlacesLocked && (
              <p className="text-[10px] text-amber-700 mt-0.5">Decimal places cannot be changed when unit is used in stock items.</p>
            )}
          </div>

          {type === 'compound' && (
            <div className="border-t border-[#E0E0E0] pt-3 space-y-3">
              <div className="text-[10px] font-semibold text-gray-700">Compound: First Unit = Conversion × Second Unit (e.g. 1 Box = 10 Nos)</div>
              <div>
                <label className="block text-[10px] font-medium text-gray-600 mb-1">Second Unit (base unit) *</label>
                <select
                  value={baseUnit}
                  onChange={(e) => setBaseUnit(e.target.value)}
                  className="border border-[#D0D0D0] px-2 py-1.5 w-full bg-white"
                >
                  <option value="">-- Select unit --</option>
                  {simpleUnitSymbols.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-600 mb-1">Conversion *</label>
                <input
                  type="number"
                  min={0.0001}
                  step={0.01}
                  value={conversion}
                  onChange={(e) => setConversion(e.target.value)}
                  className="border border-[#D0D0D0] px-2 py-1.5 w-28"
                  placeholder="e.g. 10"
                />
                <p className="text-[10px] text-gray-500 mt-0.5">e.g. 1 Box = 10 Nos → enter 10</p>
              </div>
            </div>
          )}

          <label className="flex items-center gap-2 cursor-pointer text-[10px]">
            <input type="checkbox" checked={inactive} onChange={(e) => setInactive(e.target.checked)} />
            Inactive
          </label>

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

      <aside className="hidden lg:flex w-[200px] min-w-[200px] flex-col border-l border-[#D0D0D0] bg-[#F0F0F0] p-2">
        <div className="text-[10px] font-bold text-[#7F1D1D] mb-2">Context Keys</div>
        <div className="space-y-1 text-[10px]">
          <button
            type="button"
            className="tally-list-item w-full text-left px-2 py-1.5 rounded border border-transparent hover:border-[#D0D0D0]"
            onClick={() => setMoreDetailsOverlayOpen((o) => !o)}
          >
            I: More Details
          </button>
        </div>
      </aside>

      {moreDetailsOverlayOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="more-details-title"
          style={{ pointerEvents: 'auto' }}
        >
          <div
            ref={moreDetailsOverlayRef}
            className="bg-white border border-[#D0D0D0] rounded shadow-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col"
            onClick={(e) => e.stopPropagation()}
            tabIndex={-1}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault();
                setMoreDetailsOverlayOpen(false);
                return;
              }
              const el = moreDetailsOverlayRef.current;
              if (!el) return;
              const focusable = el.querySelectorAll<HTMLElement>(
                'input:not([disabled]):not([readOnly]), select, textarea, button[type="button"]'
              );
              const list = Array.from(focusable);
              const idx = list.indexOf(document.activeElement as HTMLElement);
              if (e.key === 'ArrowDown' && idx < list.length - 1) {
                e.preventDefault();
                list[idx + 1].focus();
              } else if (e.key === 'ArrowUp' && idx > 0) {
                e.preventDefault();
                list[idx - 1].focus();
              } else if (e.key === 'ArrowDown' && idx === -1 && list.length > 0) {
                e.preventDefault();
                list[0].focus();
              } else if (e.key === 'ArrowUp' && idx <= 0 && list.length > 0) {
                e.preventDefault();
                list[list.length - 1].focus();
              }
            }}
          >
            <div className="px-4 py-2 border-b border-[#D0D0D0] bg-[#F5F5F5] flex items-center justify-between gap-2">
              <h2 className="font-semibold text-[12px] text-[#7F1D1D]" id="more-details-title">
                More Details
              </h2>
              <div className="flex items-center gap-3 text-[10px]">
                <button
                  type="button"
                  className="px-2 py-1 border border-[#D0D0D0] rounded hover:bg-[#E8E8E8]"
                  onClick={() => setShowMoreInOverlay((s) => !s)}
                >
                  {showMoreInOverlay ? 'Show Less' : 'Show More'}
                </button>
                <label className="flex items-center gap-1 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showInactiveInOverlay}
                    onChange={(e) => setShowInactiveInOverlay(e.target.checked)}
                  />
                  Show Inactive
                </label>
              </div>
            </div>
            <ScrollArea className="flex-1 p-4 text-[11px] overflow-y-auto">
              <h3 className="text-[10px] font-semibold text-gray-700 mb-3">List of Unit Details</h3>
              <div className="space-y-4">
                <section>
                  <h4 className="text-[10px] font-semibold text-gray-700 mb-2">General Details</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Symbol</label>
                      <input
                        type="text"
                        value={symbol}
                        onChange={(e) => setSymbol(e.target.value)}
                        disabled={alterLocked}
                        className="border border-[#D0D0D0] px-2 py-1 w-full text-[11px] disabled:bg-gray-100"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Formal Name</label>
                      <input
                        type="text"
                        value={formalName}
                        onChange={(e) => setFormalName(e.target.value)}
                        className="border border-[#D0D0D0] px-2 py-1 w-full text-[11px]"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Number of Decimal Places</label>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        step={1}
                        value={decimalPlaces}
                        onChange={(e) => setDecimalPlaces(Number(e.target.value) || 0)}
                        disabled={decimalPlacesLocked}
                        className="border border-[#D0D0D0] px-2 py-1 w-20 text-[11px] disabled:bg-gray-100"
                      />
                    </div>
                  </div>
                </section>

                <section className="border-t border-[#E0E0E0] pt-3">
                  <h4 className="text-[10px] font-semibold text-gray-700 mb-2">Statutory Details</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Unit Quantity Code (UQC)</label>
                      <select
                        value={uqc}
                        onChange={(e) => setUqc(e.target.value)}
                        disabled={uqcLocked}
                        className="border border-[#D0D0D0] px-2 py-1 w-full bg-white text-[11px] disabled:bg-gray-100"
                      >
                        {UQC_OPTIONS.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                      {uqcLocked && (
                        <p className="text-[9px] text-amber-700 mt-0.5">Editable only when unit is not used in stock items.</p>
                      )}
                    </div>
                    {showInactiveInOverlay && editing?.uqcHistory && editing.uqcHistory.length > 0 && (
                      <div>
                        <label className="block text-[10px] font-medium text-gray-500 mb-0.5">Unit Quantity Code (UQC) – History</label>
                        <ul className="text-[9px] text-gray-500 list-disc list-inside space-y-0.5 opacity-80">
                          {editing.uqcHistory.map((h, i) => (
                            <li key={i}>
                              {h.effectiveFrom ?? '—'} | {h.uqc}
                            </li>
                          ))}
                        </ul>
                        <p className="text-[9px] text-gray-500 mt-0.5">Read-only. Reference only.</p>
                      </div>
                    )}
                  </div>
                </section>

                {showInactiveInOverlay && (
                  <section className="border-t border-[#E0E0E0] pt-3">
                    <h4 className="text-[10px] font-semibold text-gray-500 mb-2">Inactive (reference only)</h4>
                    <label className="flex items-center gap-2 text-[10px] text-gray-500 opacity-80">
                      <input type="checkbox" checked={inactive} readOnly disabled className="opacity-70" />
                      Inactive
                    </label>
                  </section>
                )}
              </div>
            </ScrollArea>
            <div className="px-4 py-2 border-t border-[#D0D0D0] bg-[#F5F5F5] flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setMoreDetailsOverlayOpen(false)}>
                Close (Esc)
              </Button>
            </div>
          </div>
        </div>
      )}

      {quitConfirmOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="quit-confirm-title"
        >
          <div className="bg-white border border-[#D0D0D0] rounded shadow-lg p-4 max-w-sm mx-4">
            <h2 id="quit-confirm-title" className="font-semibold text-[12px] text-[#7F1D1D] mb-2">
              Quit ?
            </h2>
            <p className="text-[11px] text-gray-600 mb-4">Discard unsaved changes and return?</p>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setQuitConfirmOpen(false)}>
                No
              </Button>
              <Button size="sm" className="bg-[#DC2626] text-white hover:bg-[#B91C1C]" onClick={handleQuit}>
                Yes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
