import * as React from 'react';
import {
  useAppStore,
  type StockGroup,
  type StockGroupHsnsacDetails,
} from '../../store/useAppStore';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

const HSN_SAC_DETAILS_OPTIONS: StockGroupHsnsacDetails[] = [
  'As per Company',
  'As per Stock Group',
  'Set at Group level',
];

const TAXABILITY_OPTIONS = ['Taxable', 'Exempt', 'Nil Rated', 'Non-GST'];

const SOURCE_OF_DETAILS_OPTIONS = ['Company', 'Stock Group'];

const DEFAULT_UNDER = 'Primary';

export function StockGroupCreationView() {
  const stockGroups = useAppStore((s) => s.stockGroups);
  const stockGroupFormEditingId = useAppStore((s) => s.stockGroupFormEditingId);
  const setStockGroupFormEditingId = useAppStore((s) => s.setStockGroupFormEditingId);
  const addStockGroup = useAppStore((s) => s.addStockGroup);
  const updateStockGroup = useAppStore((s) => s.updateStockGroup);
  const deleteStockGroup = useAppStore((s) => s.deleteStockGroup);
  const isStockGroupNameUnique = useAppStore((s) => s.isStockGroupNameUnique);
  const canDeleteStockGroup = useAppStore((s) => s.canDeleteStockGroup);
  const wouldCreateCircularStockGroup = useAppStore((s) => s.wouldCreateCircularStockGroup);
  const setActiveView = useAppStore((s) => s.setActiveView);

  const [name, setName] = React.useState('');
  const [alias, setAlias] = React.useState('');
  const [under, setUnder] = React.useState(DEFAULT_UNDER);
  const [addQuantities, setAddQuantities] = React.useState(true);
  const [hsnsac, setHsnsac] = React.useState('');
  const [hsnsacDetails, setHsnsacDetails] = React.useState<StockGroupHsnsacDetails>('As per Company');
  const [gstRate, setGstRate] = React.useState('');
  const [taxabilityType, setTaxabilityType] = React.useState('Taxable');
  const [sourceOfDetails, setSourceOfDetails] = React.useState('Company');
  const [error, setError] = React.useState<string | null>(null);
  const nameInputRef = React.useRef<HTMLInputElement>(null);

  const editing = React.useMemo(
    () =>
      stockGroupFormEditingId != null
        ? stockGroups.find((g) => g.id === stockGroupFormEditingId) ?? null
        : null,
    [stockGroupFormEditingId, stockGroups]
  );
  const isAlter = !!editing;

  React.useEffect(() => {
    if (editing) {
      setName(editing.name);
      setAlias(editing.alias ?? '');
      setUnder(editing.under);
      setAddQuantities(editing.addQuantities);
      setHsnsac(editing.hsnsac ?? '');
      setHsnsacDetails(editing.hsnsacDetails ?? 'As per Company');
      setGstRate(editing.gstRate != null ? String(editing.gstRate) : '');
      setTaxabilityType(editing.taxabilityType ?? 'Taxable');
      setSourceOfDetails(editing.sourceOfDetails ?? 'Company');
    } else {
      setName('');
      setAlias('');
      setUnder(DEFAULT_UNDER);
      setAddQuantities(true);
      setHsnsac('');
      setHsnsacDetails('As per Company');
      setGstRate('');
      setTaxabilityType('Taxable');
      setSourceOfDetails('Company');
    }
    setError(null);
    setTimeout(() => nameInputRef.current?.focus(), 0);
  }, [editing?.id]);

  const handleQuit = () => {
    setStockGroupFormEditingId(null);
    setActiveView(isAlter ? 'master-alteration' : 'master-creation');
  };

  const handleAccept = () => {
    setError(null);
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Name is required');
      nameInputRef.current?.focus();
      return;
    }
    if (!isStockGroupNameUnique(trimmedName, editing?.id)) {
      setError('Stock Group name must be unique');
      nameInputRef.current?.focus();
      return;
    }
    const parentName = under.trim() || DEFAULT_UNDER;
    const parentExists = stockGroups.some((g) => g.name === parentName);
    if (!parentExists) {
      setError('Parent stock group (Under) must exist');
      return;
    }
    if (wouldCreateCircularStockGroup(trimmedName, parentName, editing?.id)) {
      setError('Under would create a circular hierarchy');
      return;
    }
    const gstRateNum = gstRate.trim() === '' ? undefined : Number(gstRate);
    if (gstRate.trim() !== '' && (gstRateNum == null || !Number.isFinite(gstRateNum) || gstRateNum < 0 || gstRateNum > 100)) {
      setError('GST Rate % must be between 0 and 100');
      return;
    }
    const payload: Omit<StockGroup, 'id'> = {
      name: trimmedName,
      alias: alias.trim() || undefined,
      under: parentName,
      addQuantities,
      hsnsac: hsnsac.trim() || undefined,
      hsnsacDetails,
      gstRate: gstRateNum,
      taxabilityType: taxabilityType || undefined,
      sourceOfDetails: sourceOfDetails || undefined,
    };
    if (editing) {
      updateStockGroup({ ...editing, ...payload });
    } else {
      addStockGroup(payload);
    }
    handleQuit();
  };

  const handleDelete = () => {
    if (!editing) return;
    if (!canDeleteStockGroup(editing.id)) {
      setError('Cannot delete: Stock Items exist under this group or it has child groups');
      return;
    }
    deleteStockGroup(editing.id);
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
        return;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [editing, name, under]);

  const allowDelete = isAlter && editing && canDeleteStockGroup(editing.id);
  const stockGroupNames = React.useMemo(() => stockGroups.map((g) => g.name).filter(Boolean), [stockGroups]);

  return (
    <div className="flex h-full overflow-hidden bg-white">
      <ScrollArea className="flex-1 min-w-0 p-4">
        <div className="text-[14px] font-bold text-[#7F1D1D] mb-4">
          {isAlter ? 'Stock Group Alteration' : 'Stock Group Creation'}
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
              placeholder="Stock group name"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-600 mb-1">Alias</label>
            <input
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              className="border border-[#D0D0D0] px-2 py-1.5 w-full"
              placeholder="Optional alias"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-600 mb-1">Under *</label>
            <select
              value={under}
              onChange={(e) => setUnder(e.target.value)}
              className="border border-[#D0D0D0] px-2 py-1.5 w-full bg-white"
            >
              {stockGroupNames.map((gName) => (
                <option key={gName} value={gName}>
                  {gName}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-600 mb-1">Should quantities of items be added?</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="addQuantities"
                  checked={addQuantities}
                  onChange={() => setAddQuantities(true)}
                />
                Yes
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="addQuantities"
                  checked={!addQuantities}
                  onChange={() => setAddQuantities(false)}
                />
                No
              </label>
            </div>
            <p className="text-[10px] text-gray-500 mt-0.5">Quantity tracking is enabled only when units exist for items.</p>
          </div>

          <div className="border-t border-[#E0E0E0] pt-3 mt-2">
            <div className="text-[10px] font-semibold text-gray-700 mb-2">Statutory Details</div>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-medium text-gray-600 mb-1">HSN/SAC</label>
                <input
                  type="text"
                  value={hsnsac}
                  onChange={(e) => setHsnsac(e.target.value)}
                  className="border border-[#D0D0D0] px-2 py-1.5 w-32"
                  placeholder="e.g. 998313"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-600 mb-1">HSN/SAC Details</label>
                <select
                  value={hsnsacDetails}
                  onChange={(e) => setHsnsacDetails(e.target.value as StockGroupHsnsacDetails)}
                  className="border border-[#D0D0D0] px-2 py-1.5 bg-white"
                >
                  {HSN_SAC_DETAILS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-gray-500 mt-0.5">Child items inherit HSN/GST unless overridden at item level.</p>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-600 mb-1">Taxability Type</label>
                <select
                  value={taxabilityType}
                  onChange={(e) => setTaxabilityType(e.target.value)}
                  className="border border-[#D0D0D0] px-2 py-1.5 bg-white"
                >
                  {TAXABILITY_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-600 mb-1">GST Rate (%)</label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.01}
                  value={gstRate}
                  onChange={(e) => setGstRate(e.target.value)}
                  className="border border-[#D0D0D0] px-2 py-1.5 w-24"
                  placeholder="e.g. 18"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-600 mb-1">Source of details</label>
                <select
                  value={sourceOfDetails}
                  onChange={(e) => setSourceOfDetails(e.target.value)}
                  className="border border-[#D0D0D0] px-2 py-1.5 bg-white"
                >
                  {SOURCE_OF_DETAILS_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
            </div>
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
