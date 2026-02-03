import * as React from 'react';
import {
  useAppStore,
  type StockItem,
  type StockItemValuationMethod,
  type StockItemDetailsSource,
  type TypeOfSupply,
} from '../../store/useAppStore';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

const VALUATION_METHODS: StockItemValuationMethod[] = ['FIFO', 'Average'];
const TAXABILITY_OPTIONS = ['Taxable', 'Exempt', 'Nil Rated', 'Non-GST'];
const COMMON_UNITS = ['Nos', 'Kg', 'Ltr', 'Hrs', 'Mtr', 'Box', 'Pcs', 'Set', 'Dozen'];
const HSN_SAC_DETAILS_OPTIONS: StockItemDetailsSource[] = [
  'As per Company',
  'As per Stock Group',
  'Set at Stock Item level',
];
const GST_RATE_DETAILS_OPTIONS: StockItemDetailsSource[] = [
  'As per Company',
  'As per Stock Group',
  'Set at Stock Item level',
];
const TYPE_OF_SUPPLY_OPTIONS: TypeOfSupply[] = ['Goods', 'Services'];

export function StockItemCreationView() {
  const stockItems = useAppStore((s) => s.stockItems);
  const stockGroups = useAppStore((s) => s.stockGroups);
  const stockCategories = useAppStore((s) => s.stockCategories);
  const stockItemFormEditingId = useAppStore((s) => s.stockItemFormEditingId);
  const setStockItemFormEditingId = useAppStore((s) => s.setStockItemFormEditingId);
  const addStockItem = useAppStore((s) => s.addStockItem);
  const updateStockItem = useAppStore((s) => s.updateStockItem);
  const deleteStockItem = useAppStore((s) => s.deleteStockItem);
  const isStockItemNameUnique = useAppStore((s) => s.isStockItemNameUnique);
  const canDeleteStockItem = useAppStore((s) => s.canDeleteStockItem);
  const canChangeStockItemUnit = useAppStore((s) => s.canChangeStockItemUnit);
  const canChangeStockItemValuation = useAppStore((s) => s.canChangeStockItemValuation);
  const isGstEnabled = useAppStore((s) => s.isGstEnabled);
  const getStockGroupByName = useAppStore((s) => s.getStockGroupByName);
  const setActiveView = useAppStore((s) => s.setActiveView);

  const [name, setName] = React.useState('');
  const [alias, setAlias] = React.useState('');
  const [partNo, setPartNo] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [under, setUnder] = React.useState('Primary');
  const [categoryName, setCategoryName] = React.useState('');
  const [unit, setUnit] = React.useState('Nos');
  const [allowQuantities, setAllowQuantities] = React.useState(true);
  const [openingQty, setOpeningQty] = React.useState(0);
  const [rate, setRate] = React.useState(0);
  const [hsnsac, setHsnsac] = React.useState('');
  const [hsnsacDetails, setHsnsacDetails] = React.useState<StockItemDetailsSource>('As per Stock Group');
  const [gstApplicable, setGstApplicable] = React.useState(true);
  const [gstRateDetails, setGstRateDetails] = React.useState<StockItemDetailsSource>('As per Stock Group');
  const [taxability, setTaxability] = React.useState('Taxable');
  const [gstRate, setGstRate] = React.useState('');
  const [typeOfSupply, setTypeOfSupply] = React.useState<TypeOfSupply>('Goods');
  const [rateOfDuty, setRateOfDuty] = React.useState('');
  const [valuationMethod, setValuationMethod] = React.useState<StockItemValuationMethod>('FIFO');
  const [costingMethod, setCostingMethod] = React.useState('FIFO');
  const [notes, setNotes] = React.useState('');
  const [languageAlias, setLanguageAlias] = React.useState('');
  const [alternateUnits, setAlternateUnits] = React.useState('');
  const [defaultSalesLedger, setDefaultSalesLedger] = React.useState('');
  const [defaultPurchaseLedger, setDefaultPurchaseLedger] = React.useState('');
  const [marketValuationMethod, setMarketValuationMethod] = React.useState('');
  const [standardBuyingRate, setStandardBuyingRate] = React.useState('');
  const [standardSellingRate, setStandardSellingRate] = React.useState('');
  const [inclusiveOfDutiesAndTaxes, setInclusiveOfDutiesAndTaxes] = React.useState(false);
  const [inactive, setInactive] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [moreDetailsOverlayOpen, setMoreDetailsOverlayOpen] = React.useState(false);
  const [showMoreInOverlay, setShowMoreInOverlay] = React.useState(false);
  const [showInactiveInOverlay, setShowInactiveInOverlay] = React.useState(false);
  const [getHsnsacModalOpen, setGetHsnsacModalOpen] = React.useState(false);
  const [quitConfirmOpen, setQuitConfirmOpen] = React.useState(false);
  const nameInputRef = React.useRef<HTMLInputElement>(null);
  const initialSnapshotRef = React.useRef<Record<string, unknown> | null>(null);
  const moreDetailsOverlayRef = React.useRef<HTMLDivElement>(null);

  const gstEnabled = isGstEnabled();
  const computedValue = React.useMemo(
    () => Math.round(openingQty * rate * 100) / 100,
    [openingQty, rate]
  );

  const editing = React.useMemo(
    () =>
      stockItemFormEditingId != null
        ? stockItems.find((i) => i.id === stockItemFormEditingId) ?? null
        : null,
    [stockItemFormEditingId, stockItems]
  );
  const isAlter = !!editing;
  const unitLocked = isAlter && editing ? !canChangeStockItemUnit(editing.id) : false;
  const valuationLocked = isAlter && editing ? !canChangeStockItemValuation(editing.id) : false;
  const costingLocked = valuationLocked;

  const selectedGroup = React.useMemo(() => getStockGroupByName(under), [getStockGroupByName, under]);
  const inheritedHsnsac = selectedGroup?.hsnsac ?? '';
  const inheritedGstRate = selectedGroup?.gstRate;
  const inheritedTaxability = selectedGroup?.taxabilityType ?? '';

  const effectiveHsnsac =
    hsnsacDetails === 'Set at Stock Item level' ? hsnsac : hsnsacDetails === 'As per Stock Group' ? inheritedHsnsac : '';
  const effectiveSourceOfDetails =
    hsnsacDetails === 'As per Company'
      ? 'Company'
      : hsnsacDetails === 'As per Stock Group'
        ? `Stock Group: ${under}`
        : 'Stock Item level';
  const effectiveGstRate =
    gstRateDetails === 'Set at Stock Item level'
      ? (gstRate.trim() === '' ? undefined : Number(gstRate))
      : gstRateDetails === 'As per Stock Group'
        ? inheritedGstRate
        : undefined;

  React.useEffect(() => {
    if (editing) {
      setName(editing.name);
      setAlias(editing.alias ?? '');
      setPartNo(editing.partNo ?? '');
      setDescription(editing.description ?? '');
      setNotes(editing.notes ?? '');
      setUnder(editing.under);
      setCategoryName(editing.categoryName ?? '');
      setUnit(editing.unit);
      setAllowQuantities(editing.allowQuantities);
      setAlternateUnits(editing.alternateUnits ?? '');
      setOpeningQty(editing.openingQty);
      setRate(editing.rate);
      setHsnsac(editing.hsnsac ?? '');
      setHsnsacDetails(editing.hsnsacDetails ?? (editing.inheritHsnsacFromGroup ? 'As per Stock Group' : 'Set at Stock Item level'));
      setGstApplicable(editing.gstApplicable ?? true);
      setGstRateDetails(editing.gstRateDetails ?? 'As per Stock Group');
      setTaxability(editing.taxability ?? 'Taxable');
      setGstRate(editing.gstRate != null ? String(editing.gstRate) : '');
      setTypeOfSupply(editing.typeOfSupply ?? 'Goods');
      setRateOfDuty(editing.rateOfDuty != null ? String(editing.rateOfDuty) : '');
      setValuationMethod(editing.valuationMethod);
      setCostingMethod(editing.costingMethod ?? editing.valuationMethod);
      setLanguageAlias(editing.languageAlias ?? '');
      setDefaultSalesLedger(editing.defaultSalesLedger ?? '');
      setDefaultPurchaseLedger(editing.defaultPurchaseLedger ?? '');
      setMarketValuationMethod(editing.marketValuationMethod ?? '');
      setStandardBuyingRate(editing.standardBuyingRate != null ? String(editing.standardBuyingRate) : '');
      setStandardSellingRate(editing.standardSellingRate != null ? String(editing.standardSellingRate) : '');
      setInclusiveOfDutiesAndTaxes(editing.inclusiveOfDutiesAndTaxes ?? false);
      setInactive(editing.inactive ?? false);
      initialSnapshotRef.current = {
        name: editing.name,
        alias: editing.alias ?? '',
        partNo: editing.partNo ?? '',
        description: editing.description ?? '',
        notes: editing.notes ?? '',
        under: editing.under,
        categoryName: editing.categoryName ?? '',
        unit: editing.unit,
        allowQuantities: editing.allowQuantities,
        alternateUnits: editing.alternateUnits ?? '',
        openingQty: editing.openingQty,
        rate: editing.rate,
        hsnsac: editing.hsnsac ?? '',
        hsnsacDetails: editing.hsnsacDetails ?? (editing.inheritHsnsacFromGroup ? 'As per Stock Group' : 'Set at Stock Item level'),
        gstApplicable: editing.gstApplicable ?? true,
        gstRateDetails: editing.gstRateDetails ?? 'As per Stock Group',
        taxability: editing.taxability ?? 'Taxable',
        gstRate: editing.gstRate,
        typeOfSupply: editing.typeOfSupply ?? 'Goods',
        rateOfDuty: editing.rateOfDuty,
        valuationMethod: editing.valuationMethod,
        costingMethod: editing.costingMethod ?? editing.valuationMethod,
        languageAlias: editing.languageAlias ?? '',
        defaultSalesLedger: editing.defaultSalesLedger ?? '',
        defaultPurchaseLedger: editing.defaultPurchaseLedger ?? '',
        marketValuationMethod: editing.marketValuationMethod ?? '',
        standardBuyingRate: editing.standardBuyingRate,
        standardSellingRate: editing.standardSellingRate,
        inclusiveOfDutiesAndTaxes: editing.inclusiveOfDutiesAndTaxes ?? false,
        inactive: editing.inactive ?? false,
      };
    } else {
      setName('');
      setAlias('');
      setPartNo('');
      setDescription('');
      setNotes('');
      setUnder('Primary');
      setCategoryName('');
      setUnit('Nos');
      setAllowQuantities(true);
      setAlternateUnits('');
      setOpeningQty(0);
      setRate(0);
      setHsnsac('');
      setHsnsacDetails('As per Stock Group');
      setGstApplicable(true);
      setGstRateDetails('As per Stock Group');
      setTaxability('Taxable');
      setGstRate('');
      setTypeOfSupply('Goods');
      setRateOfDuty('');
      setValuationMethod('FIFO');
      setCostingMethod('FIFO');
      setLanguageAlias('');
      setDefaultSalesLedger('');
      setDefaultPurchaseLedger('');
      setMarketValuationMethod('');
      setStandardBuyingRate('');
      setStandardSellingRate('');
      setInclusiveOfDutiesAndTaxes(false);
      setInactive(false);
      initialSnapshotRef.current = {
        name: '', alias: '', partNo: '', description: '', notes: '', under: 'Primary', categoryName: '', unit: 'Nos',
        allowQuantities: true, alternateUnits: '', openingQty: 0, rate: 0, hsnsac: '', hsnsacDetails: 'As per Stock Group',
        gstApplicable: true, gstRateDetails: 'As per Stock Group', taxability: 'Taxable', gstRate: '', typeOfSupply: 'Goods',
        rateOfDuty: '', valuationMethod: 'FIFO', costingMethod: 'FIFO', languageAlias: '', defaultSalesLedger: '',
        defaultPurchaseLedger: '', marketValuationMethod: '', standardBuyingRate: '', standardSellingRate: '',
        inclusiveOfDutiesAndTaxes: false, inactive: false,
      };
    }
    setError(null);
    setQuitConfirmOpen(false);
    setTimeout(() => nameInputRef.current?.focus(), 0);
  }, [editing?.id]);

  const hasUnsavedChanges = React.useMemo(() => {
    const s = initialSnapshotRef.current;
    if (!s) return false;
    return (
      s.name !== name || s.alias !== alias || s.partNo !== partNo || s.description !== description || s.notes !== notes
      || s.under !== under || s.categoryName !== categoryName || s.unit !== unit || s.allowQuantities !== allowQuantities
      || s.alternateUnits !== alternateUnits || s.openingQty !== openingQty || s.rate !== rate || s.hsnsac !== hsnsac
      || s.hsnsacDetails !== hsnsacDetails || s.gstApplicable !== gstApplicable || s.gstRateDetails !== gstRateDetails
      || s.taxability !== taxability || (s.gstRate as number | undefined) !== (gstRate === '' ? undefined : Number(gstRate))
      || s.typeOfSupply !== typeOfSupply || (s.rateOfDuty as number | undefined) !== (rateOfDuty === '' ? undefined : Number(rateOfDuty))
      || s.valuationMethod !== valuationMethod || s.costingMethod !== costingMethod || s.languageAlias !== languageAlias
      || s.defaultSalesLedger !== defaultSalesLedger || s.defaultPurchaseLedger !== defaultPurchaseLedger
      || s.marketValuationMethod !== marketValuationMethod
      || (s.standardBuyingRate as number | undefined) !== (standardBuyingRate === '' ? undefined : Number(standardBuyingRate))
      || (s.standardSellingRate as number | undefined) !== (standardSellingRate === '' ? undefined : Number(standardSellingRate))
      || s.inclusiveOfDutiesAndTaxes !== inclusiveOfDutiesAndTaxes || s.inactive !== inactive
    );
  }, [name, alias, partNo, description, notes, under, categoryName, unit, allowQuantities, alternateUnits, openingQty, rate, hsnsac, hsnsacDetails, gstApplicable, gstRateDetails, taxability, gstRate, typeOfSupply, rateOfDuty, valuationMethod, costingMethod, languageAlias, defaultSalesLedger, defaultPurchaseLedger, marketValuationMethod, standardBuyingRate, standardSellingRate, inclusiveOfDutiesAndTaxes, inactive]);

  const handleQuit = () => {
    setQuitConfirmOpen(false);
    setStockItemFormEditingId(null);
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
    if (!isStockItemNameUnique(trimmedName, editing?.id)) {
      setError('Stock Item name must be unique');
      nameInputRef.current?.focus();
      return;
    }
    const groupExists = stockGroups.some((g) => g.name === under);
    if (!groupExists) {
      setError('Under (Stock Group) must exist');
      return;
    }
    if (allowQuantities && !unit.trim()) {
      setError('Unit is required when quantity tracking is enabled');
      return;
    }
    const gstRateNum = gstRate.trim() === '' ? undefined : Number(gstRate);
    if (
      gstRate.trim() !== '' &&
      (gstRateNum == null || !Number.isFinite(gstRateNum) || gstRateNum < 0 || gstRateNum > 100)
    ) {
      setError('GST Rate % must be between 0 and 100');
      return;
    }
    const rateOfDutyNum = rateOfDuty.trim() === '' ? undefined : Number(rateOfDuty);
    if (
      rateOfDuty.trim() !== '' &&
      (rateOfDutyNum == null || !Number.isFinite(rateOfDutyNum) || rateOfDutyNum < 0)
    ) {
      setError('Rate of Duty must be a non-negative number');
      return;
    }
    const standardBuyingNum = standardBuyingRate.trim() === '' ? undefined : Number(standardBuyingRate);
    const standardSellingNum = standardSellingRate.trim() === '' ? undefined : Number(standardSellingRate);
    if (standardBuyingRate.trim() !== '' && (standardBuyingNum == null || !Number.isFinite(standardBuyingNum) || standardBuyingNum < 0)) {
      setError('Standard Buying Rate must be a non-negative number');
      return;
    }
    if (standardSellingRate.trim() !== '' && (standardSellingNum == null || !Number.isFinite(standardSellingNum) || standardSellingNum < 0)) {
      setError('Standard Selling Rate must be a non-negative number');
      return;
    }
    const payload: Omit<StockItem, 'id'> = {
      name: trimmedName,
      alias: alias.trim() || undefined,
      partNo: partNo.trim() || undefined,
      under,
      categoryName: categoryName.trim() || undefined,
      unit: unit.trim() || 'Nos',
      allowQuantities,
      openingQty,
      rate,
      value: computedValue,
      description: description.trim() || undefined,
      notes: notes.trim() || undefined,
      languageAlias: languageAlias.trim() || undefined,
      alternateUnits: alternateUnits.trim() || undefined,
      defaultSalesLedger: defaultSalesLedger.trim() || undefined,
      defaultPurchaseLedger: defaultPurchaseLedger.trim() || undefined,
      marketValuationMethod: marketValuationMethod.trim() || undefined,
      standardBuyingRate: standardBuyingNum,
      standardSellingRate: standardSellingNum,
      inclusiveOfDutiesAndTaxes,
      inactive,
      hsnsac: hsnsacDetails === 'Set at Stock Item level' ? (hsnsac.trim() || undefined) : undefined,
      inheritHsnsacFromGroup: hsnsacDetails === 'As per Stock Group',
      hsnsacDetails,
      sourceOfDetails: effectiveSourceOfDetails,
      gstApplicable: gstEnabled ? gstApplicable : undefined,
      gstRateDetails: gstEnabled ? gstRateDetails : undefined,
      taxability: gstRateDetails === 'Set at Stock Item level' ? (taxability || undefined) : (inheritedTaxability || taxability || undefined),
      gstRate: gstRateDetails === 'Set at Stock Item level' ? gstRateNum : (inheritedGstRate ?? gstRateNum),
      typeOfSupply: gstEnabled ? typeOfSupply : undefined,
      rateOfDuty: rateOfDutyNum,
      valuationMethod,
      costingMethod: costingMethod || valuationMethod,
    };
    if (editing?.gstHsnsacHistory) (payload as StockItem).gstHsnsacHistory = editing.gstHsnsacHistory;
    if (editing?.gstRateHistory) (payload as StockItem).gstRateHistory = editing.gstRateHistory;
    if (editing?.componentsList) (payload as StockItem).componentsList = editing.componentsList;
    if (editing) {
      updateStockItem({ ...editing, ...payload });
    } else {
      addStockItem(payload);
    }
    handleQuit();
  };

  const handleDelete = () => {
    if (!editing) return;
    if (!canDeleteStockItem(editing.id)) {
      setError('Cannot delete: Stock item is used in vouchers');
      return;
    }
    deleteStockItem(editing.id);
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
      if (getHsnsacModalOpen) {
        if (e.key === 'Escape' || e.key === 'b' || e.key === 'B') {
          e.preventDefault();
          setGetHsnsacModalOpen(false);
          return;
        }
        return;
      }
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
      if (e.key === 'b' || e.key === 'B') {
        const target = e.target as HTMLElement;
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
        e.preventDefault();
        setGetHsnsacModalOpen(true);
        return;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [editing, name, under, moreDetailsOverlayOpen, getHsnsacModalOpen, hasUnsavedChanges]);

  React.useEffect(() => {
    if (!moreDetailsOverlayOpen || !moreDetailsOverlayRef.current) return;
    const el = moreDetailsOverlayRef.current;
    const focusable = el.querySelectorAll<HTMLElement>('input:not([disabled]):not([readOnly]), select, textarea, button[type="button"]');
    const first = focusable[0];
    if (first) setTimeout(() => first.focus(), 0);
  }, [moreDetailsOverlayOpen]);

  const allowDelete = isAlter && editing && canDeleteStockItem(editing.id);
  const groupNames = React.useMemo(() => stockGroups.map((g) => g.name).filter(Boolean), [stockGroups]);
  const categoryNames = React.useMemo(() => stockCategories.map((c) => c.name).filter(Boolean), [stockCategories]);

  return (
    <div className="flex h-full overflow-hidden bg-white">
      <ScrollArea className="flex-1 min-w-0 p-4">
        <div className="text-[14px] font-bold text-[#7F1D1D] mb-4">
          {isAlter ? 'Stock Item Alteration' : 'Stock Item Creation'}
        </div>

        <div className="space-y-4 max-w-xl text-[11px]">
          <div className="border-t border-[#E0E0E0] pt-3">
            <div className="text-[10px] font-semibold text-gray-700 mb-2">Basic Details</div>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-medium text-gray-600 mb-1">Name *</label>
                <input
                  ref={nameInputRef}
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="border border-[#D0D0D0] px-2 py-1.5 w-full"
                  placeholder="Stock item name"
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
                <label className="block text-[10px] font-medium text-gray-600 mb-1">Part No. (optional)</label>
                <input
                  type="text"
                  value={partNo}
                  onChange={(e) => setPartNo(e.target.value)}
                  className="border border-[#D0D0D0] px-2 py-1.5 w-full"
                  placeholder="Part number"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-600 mb-1">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="border border-[#D0D0D0] px-2 py-1.5 w-full min-h-[60px] resize-y"
                  placeholder="Multi-line description"
                  rows={3}
                />
              </div>
            </div>
          </div>

          <div className="border-t border-[#E0E0E0] pt-3">
            <div className="text-[10px] font-semibold text-gray-700 mb-2">Classification</div>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-medium text-gray-600 mb-1">Under (Stock Group) *</label>
                <select
                  value={under}
                  onChange={(e) => setUnder(e.target.value)}
                  className="border border-[#D0D0D0] px-2 py-1.5 w-full bg-white"
                >
                  {groupNames.map((gName) => (
                    <option key={gName} value={gName}>
                      {gName}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-600 mb-1">Category (optional)</label>
                <select
                  value={categoryName}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="border border-[#D0D0D0] px-2 py-1.5 w-full bg-white"
                >
                  <option value="">-- None --</option>
                  {categoryNames.map((cName) => (
                    <option key={cName} value={cName}>
                      {cName}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-[#E0E0E0] pt-3">
            <div className="text-[10px] font-semibold text-gray-700 mb-2">Units &amp; Quantities</div>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowQuantities}
                  onChange={(e) => setAllowQuantities(e.target.checked)}
                />
                Allow quantities
              </label>
              <div>
                <label className="block text-[10px] font-medium text-gray-600 mb-1">
                  Units {allowQuantities ? '*' : ''}
                </label>
                <select
                  value={unit}
                  onChange={(e) => setUnit(e.target.value)}
                  disabled={unitLocked}
                  className="border border-[#D0D0D0] px-2 py-1.5 bg-white disabled:bg-gray-100"
                >
                  {COMMON_UNITS.map((u) => (
                    <option key={u} value={u}>
                      {u}
                    </option>
                  ))}
                </select>
                {unitLocked && (
                  <p className="text-[10px] text-amber-700 mt-0.5">
                    Unit cannot be changed once item is used in vouchers.
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="border-t border-[#E0E0E0] pt-3">
            <div className="text-[10px] font-semibold text-gray-700 mb-2">Opening Balance</div>
            <div className="flex flex-wrap gap-4 items-end">
              <div>
                <label className="block text-[10px] font-medium text-gray-600 mb-1">Quantity</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={openingQty}
                  onChange={(e) => setOpeningQty(Number(e.target.value) || 0)}
                  className="border border-[#D0D0D0] px-2 py-1.5 w-28"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-600 mb-1">Rate</label>
                <input
                  type="number"
                  min={0}
                  step={0.01}
                  value={rate}
                  onChange={(e) => setRate(Number(e.target.value) || 0)}
                  className="border border-[#D0D0D0] px-2 py-1.5 w-28"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-600 mb-1">Value (auto)</label>
                <input
                  type="text"
                  readOnly
                  value={computedValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  className="border border-[#D0D0D0] px-2 py-1.5 w-28 bg-gray-50"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-[#E0E0E0] pt-3">
            <label className="flex items-center gap-2 cursor-pointer text-[10px]">
              <input type="checkbox" checked={inactive} onChange={(e) => setInactive(e.target.checked)} />
              Inactive
            </label>
          </div>

          <div className="border-t border-[#E0E0E0] pt-3">
            <div className="text-[10px] font-semibold text-gray-700 mb-2">Valuation</div>
            <p className="text-[10px] text-gray-500 mb-2">
              Valuation affects closing stock and P&amp;L. Cannot change once used in vouchers.
            </p>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-medium text-gray-600 mb-1">Valuation Method</label>
                <select
                  value={valuationMethod}
                  onChange={(e) => {
                    const v = e.target.value as StockItemValuationMethod;
                    setValuationMethod(v);
                    setCostingMethod(v);
                  }}
                  disabled={valuationLocked}
                  className="border border-[#D0D0D0] px-2 py-1.5 bg-white disabled:bg-gray-100"
                >
                  {VALUATION_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
                {valuationLocked && (
                  <p className="text-[10px] text-amber-700 mt-0.5">
                    Valuation method cannot be changed once item is used in vouchers.
                  </p>
                )}
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-600 mb-1">Costing Method</label>
                <select
                  value={costingMethod}
                  onChange={(e) => setCostingMethod(e.target.value)}
                  className="border border-[#D0D0D0] px-2 py-1.5 bg-white"
                >
                  {VALUATION_METHODS.map((m) => (
                    <option key={m} value={m}>
                      {m}
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

      <aside className="hidden lg:flex w-[220px] min-w-[220px] flex-col border-l border-[#D0D0D0] bg-[#F0F0F0] p-2">
        <div className="text-[10px] font-bold text-[#7F1D1D] mb-2">Statutory Details</div>
        <ScrollArea className="flex-1">
          <div className="space-y-3 text-[10px]">
            {gstEnabled ? (
              <>
                <div>
                  <div className="font-medium text-gray-700 mb-1">GST Applicability</div>
                  <div className="flex gap-2">
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="gstApplicable"
                        checked={gstApplicable}
                        onChange={() => setGstApplicable(true)}
                      />
                      Applicable
                    </label>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input
                        type="radio"
                        name="gstApplicable"
                        checked={!gstApplicable}
                        onChange={() => setGstApplicable(false)}
                      />
                      Not Applicable
                    </label>
                  </div>
                </div>

                {gstApplicable && (
                  <>
                    <div>
                      <div className="font-medium text-gray-700 mb-1">HSN/SAC Details</div>
                      <select
                        value={hsnsacDetails}
                        onChange={(e) => setHsnsacDetails(e.target.value as StockItemDetailsSource)}
                        className="border border-[#D0D0D0] px-1.5 py-1 w-full bg-white text-[10px]"
                      >
                        {HSN_SAC_DETAILS_OPTIONS.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                      <p className="text-[9px] text-gray-500 mt-0.5">Source of details: {effectiveSourceOfDetails}</p>
                      {hsnsacDetails === 'Set at Stock Item level' && (
                        <div className="mt-1 space-y-1">
                          <input
                            type="text"
                            value={hsnsac}
                            onChange={(e) => setHsnsac(e.target.value)}
                            placeholder="HSN/SAC Code"
                            className="border border-[#D0D0D0] px-1.5 py-1 w-full text-[10px]"
                          />
                          <input
                            type="text"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Description"
                            className="border border-[#D0D0D0] px-1.5 py-1 w-full text-[10px]"
                          />
                        </div>
                      )}
                      {hsnsacDetails !== 'Set at Stock Item level' && (
                        <p className="text-[9px] text-gray-500 mt-0.5">
                          Code: {effectiveHsnsac || '—'} (from group/company)
                        </p>
                      )}
                    </div>

                    <div>
                      <div className="font-medium text-gray-700 mb-1">GST Rate Details</div>
                      <select
                        value={gstRateDetails}
                        onChange={(e) => setGstRateDetails(e.target.value as StockItemDetailsSource)}
                        className="border border-[#D0D0D0] px-1.5 py-1 w-full bg-white text-[10px]"
                      >
                        {GST_RATE_DETAILS_OPTIONS.map((o) => (
                          <option key={o} value={o}>
                            {o}
                          </option>
                        ))}
                      </select>
                      <p className="text-[9px] text-gray-500 mt-0.5">Source: {gstRateDetails}</p>
                      {gstRateDetails === 'Set at Stock Item level' && (
                        <div className="mt-1 space-y-1">
                          <select
                            value={taxability}
                            onChange={(e) => setTaxability(e.target.value)}
                            className="border border-[#D0D0D0] px-1.5 py-1 w-full bg-white text-[10px]"
                          >
                            {TAXABILITY_OPTIONS.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            min={0}
                            max={100}
                            step={0.01}
                            value={gstRate}
                            onChange={(e) => setGstRate(e.target.value)}
                            placeholder="GST Rate %"
                            className="border border-[#D0D0D0] px-1.5 py-1 w-full text-[10px]"
                          />
                          <select
                            value={typeOfSupply}
                            onChange={(e) => setTypeOfSupply(e.target.value as TypeOfSupply)}
                            className="border border-[#D0D0D0] px-1.5 py-1 w-full bg-white text-[10px]"
                          >
                            {TYPE_OF_SUPPLY_OPTIONS.map((t) => (
                              <option key={t} value={t}>
                                {t}
                              </option>
                            ))}
                          </select>
                          <input
                            type="number"
                            min={0}
                            step={0.01}
                            value={rateOfDuty}
                            onChange={(e) => setRateOfDuty(e.target.value)}
                            placeholder="Rate of Duty (optional)"
                            className="border border-[#D0D0D0] px-1.5 py-1 w-full text-[10px]"
                          />
                        </div>
                      )}
                      {gstRateDetails !== 'Set at Stock Item level' && (
                        <p className="text-[9px] text-gray-500 mt-0.5">
                          Rate: {effectiveGstRate != null ? `${effectiveGstRate}%` : '—'} (from group/company)
                        </p>
                      )}
                    </div>
                  </>
                )}
              </>
            ) : (
              <p className="text-[9px] text-gray-500">GST fields are inactive when GST is not enabled for the company.</p>
            )}
        </div>
        </ScrollArea>
        <div className="text-[10px] font-bold text-[#7F1D1D] mt-2 mb-1">Context Keys</div>
        <div className="space-y-1 text-[10px]">
          <button
            type="button"
            className="tally-list-item w-full text-left px-2 py-1.5 rounded border border-transparent hover:border-[#D0D0D0]"
            onClick={() => setMoreDetailsOverlayOpen((o) => !o)}
          >
            I: More Details
          </button>
          <button
            type="button"
            className="tally-list-item w-full text-left px-2 py-1.5 rounded border border-transparent hover:border-[#D0D0D0]"
            onClick={() => setGetHsnsacModalOpen(true)}
          >
            B: Get HSN/SAC Info
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
            className="bg-white border border-[#D0D0D0] rounded shadow-lg max-w-2xl w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col"
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
              const focusable = el.querySelectorAll<HTMLElement>('input:not([disabled]):not([readOnly]), select, textarea, button[type="button"]');
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
                List of Stock Item Details
              </h2>
              <div className="flex items-center gap-3 text-[10px]">
                <button
                  type="button"
                  className="px-2 py-1 border border-[#D0D0D0] rounded hover:bg-[#E8E8E8]"
                  onClick={() => { setShowMoreInOverlay((s) => !s); }}
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
              <div className="space-y-4">
                <section>
                  <h3 className="text-[10px] font-semibold text-gray-700 mb-2">General Details</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Name</label>
                      <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="border border-[#D0D0D0] px-2 py-1 w-full text-[11px]" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Alias</label>
                      <input type="text" value={alias} onChange={(e) => setAlias(e.target.value)} className="border border-[#D0D0D0] px-2 py-1 w-full text-[11px]" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Part Number</label>
                      <input type="text" value={partNo} onChange={(e) => setPartNo(e.target.value)} className="border border-[#D0D0D0] px-2 py-1 w-full text-[11px]" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Description</label>
                      <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="border border-[#D0D0D0] px-2 py-1 w-full text-[11px] min-h-[48px]" rows={2} />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Notes</label>
                      <textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="border border-[#D0D0D0] px-2 py-1 w-full text-[11px] min-h-[48px]" rows={2} />
                    </div>
                    {showMoreInOverlay && (
                      <div>
                        <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Language Alias</label>
                        <input type="text" value={languageAlias} onChange={(e) => setLanguageAlias(e.target.value)} className="border border-[#D0D0D0] px-2 py-1 w-full text-[11px]" />
                      </div>
                    )}
                  </div>
                </section>

                <section className="border-t border-[#E0E0E0] pt-3">
                  <h3 className="text-[10px] font-semibold text-gray-700 mb-2">Inventory Details</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Stock Group</label>
                      <select value={under} onChange={(e) => setUnder(e.target.value)} className="border border-[#D0D0D0] px-2 py-1 w-full bg-white text-[11px]">
                        {groupNames.map((gName) => <option key={gName} value={gName}>{gName}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Stock Category</label>
                      <select value={categoryName} onChange={(e) => setCategoryName(e.target.value)} className="border border-[#D0D0D0] px-2 py-1 w-full bg-white text-[11px]">
                        <option value="">-- None --</option>
                        {categoryNames.map((cName) => <option key={cName} value={cName}>{cName}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Units of Measurement</label>
                      <select value={unit} onChange={(e) => setUnit(e.target.value)} disabled={unitLocked} className="border border-[#D0D0D0] px-2 py-1 w-full bg-white disabled:bg-gray-100 text-[11px]">
                        {COMMON_UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Alternate Units</label>
                      <input type="text" value={alternateUnits} onChange={(e) => setAlternateUnits(e.target.value)} className="border border-[#D0D0D0] px-2 py-1 w-full text-[11px]" placeholder="e.g. Box, Dozen" />
                    </div>
                    {showMoreInOverlay && (
                      <>
                        <div>
                          <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Components List (BoM)</label>
                          <p className="text-[9px] text-gray-500">Read-only. Edit from Bill of Materials.</p>
                          {editing?.componentsList && editing.componentsList.length > 0 ? (
                            <ul className="text-[10px] list-disc list-inside mt-0.5">{editing.componentsList.map((c, i) => <li key={i}>{c.itemName} × {c.qty}</li>)}</ul>
                          ) : (
                            <p className="text-[9px] text-gray-500 italic">No components</p>
                          )}
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Default Ledgers for Invoicing</label>
                          <div className="flex gap-2">
                            <input type="text" value={defaultSalesLedger} onChange={(e) => setDefaultSalesLedger(e.target.value)} className="border border-[#D0D0D0] px-2 py-1 flex-1 text-[11px]" placeholder="Sales" />
                            <input type="text" value={defaultPurchaseLedger} onChange={(e) => setDefaultPurchaseLedger(e.target.value)} className="border border-[#D0D0D0] px-2 py-1 flex-1 text-[11px]" placeholder="Purchase" />
                          </div>
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Costing Method</label>
                          <select value={costingMethod} onChange={(e) => setCostingMethod(e.target.value)} disabled={costingLocked} className="border border-[#D0D0D0] px-2 py-1 w-full bg-white disabled:bg-gray-100 text-[11px]">
                            {VALUATION_METHODS.map((m) => <option key={m} value={m}>{m}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Market Valuation Method</label>
                          <input type="text" value={marketValuationMethod} onChange={(e) => setMarketValuationMethod(e.target.value)} className="border border-[#D0D0D0] px-2 py-1 w-full text-[11px]" placeholder="Optional" />
                        </div>
                      </>
                    )}
                  </div>
                </section>

                <section className="border-t border-[#E0E0E0] pt-3">
                  <h3 className="text-[10px] font-semibold text-gray-700 mb-2">Opening Balance</h3>
                  <div className="flex flex-wrap gap-4 items-end">
                    <div>
                      <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Quantity</label>
                      <input type="number" min={0} step={0.01} value={openingQty} onChange={(e) => setOpeningQty(Number(e.target.value) || 0)} className="border border-[#D0D0D0] px-2 py-1 w-24 text-[11px]" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Rate</label>
                      <input type="number" min={0} step={0.01} value={rate} onChange={(e) => setRate(Number(e.target.value) || 0)} className="border border-[#D0D0D0] px-2 py-1 w-24 text-[11px]" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Value (auto)</label>
                      <input type="text" readOnly value={computedValue.toLocaleString('en-IN', { minimumFractionDigits: 2 })} className="border border-[#D0D0D0] px-2 py-1 w-24 bg-gray-50 text-[11px]" />
                    </div>
                  </div>
                </section>

                <section className="border-t border-[#E0E0E0] pt-3">
                  <h3 className="text-[10px] font-semibold text-gray-700 mb-2">MRP &amp; Pricing Details</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Standard Buying Rate</label>
                      <input type="number" min={0} step={0.01} value={standardBuyingRate} onChange={(e) => setStandardBuyingRate(e.target.value)} className="border border-[#D0D0D0] px-2 py-1 w-28 text-[11px]" placeholder="Optional" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Standard Selling Rate</label>
                      <input type="number" min={0} step={0.01} value={standardSellingRate} onChange={(e) => setStandardSellingRate(e.target.value)} className="border border-[#D0D0D0] px-2 py-1 w-28 text-[11px]" placeholder="Optional" />
                    </div>
                    <p className="text-[9px] text-gray-500">Used for invoice defaults and reporting.</p>
                  </div>
                </section>

                {gstEnabled && (
                  <section className="border-t border-[#E0E0E0] pt-3">
                    <h3 className="text-[10px] font-semibold text-gray-700 mb-2">Statutory Details</h3>
                    <div className="space-y-2">
                      <div>
                        <label className="block text-[10px] font-medium text-gray-600 mb-0.5">GST – HSN/SAC &amp; Related</label>
                        <p className="text-[9px] text-gray-500 mb-0.5">Source of details: {effectiveSourceOfDetails}</p>
                        <input type="text" value={hsnsacDetails === 'Set at Stock Item level' ? hsnsac : effectiveHsnsac} onChange={(e) => hsnsacDetails === 'Set at Stock Item level' && setHsnsac(e.target.value)} readOnly={hsnsacDetails !== 'Set at Stock Item level'} className="border border-[#D0D0D0] px-2 py-1 w-full text-[11px] bg-gray-50 read-only:bg-gray-50" placeholder="HSN/SAC Code" />
                        <input type="text" value={description} onChange={(e) => setDescription(e.target.value)} className="border border-[#D0D0D0] px-2 py-1 w-full text-[11px] mt-1" placeholder="Description" />
                      </div>
                      <div>
                        <label className="block text-[10px] font-medium text-gray-600 mb-0.5">GST – Rate &amp; Related</label>
                        <select value={taxability} onChange={(e) => setTaxability(e.target.value)} className="border border-[#D0D0D0] px-2 py-1 w-full bg-white text-[11px]">
                          {TAXABILITY_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                        <input type="number" min={0} max={100} step={0.01} value={gstRate} onChange={(e) => setGstRate(e.target.value)} className="border border-[#D0D0D0] px-2 py-1 w-20 text-[11px] mt-1" placeholder="GST Rate %" />
                      </div>
                      {editing?.gstHsnsacHistory && editing.gstHsnsacHistory.length > 0 && (
                        <div>
                          <label className="block text-[10px] font-medium text-gray-600 mb-0.5">GST – HSN/SAC Details (History)</label>
                          <ul className="text-[9px] text-gray-500 list-disc list-inside space-y-0.5">
                            {editing.gstHsnsacHistory.map((h, i) => <li key={i}>{h.effectiveFrom ?? '—'} | {h.source} | {h.code} {h.description ? `| ${h.description}` : ''}</li>)}
                          </ul>
                        </div>
                      )}
                      {editing?.gstRateHistory && editing.gstRateHistory.length > 0 && (
                        <div>
                          <label className="block text-[10px] font-medium text-gray-600 mb-0.5">GST – Rate &amp; Related (History)</label>
                          <ul className="text-[9px] text-gray-500 list-disc list-inside space-y-0.5">
                            {editing.gstRateHistory.map((h, i) => <li key={i}>{h.effectiveFrom ?? '—'} | {h.taxability} | {h.ratePercent}%</li>)}
                          </ul>
                        </div>
                      )}
                    </div>
                  </section>
                )}

                <section className="border-t border-[#E0E0E0] pt-3">
                  <h3 className="text-[10px] font-semibold text-gray-700 mb-2">Supply &amp; Tax Behaviour</h3>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Type of Supply</label>
                      <select value={typeOfSupply} onChange={(e) => setTypeOfSupply(e.target.value as TypeOfSupply)} className="border border-[#D0D0D0] px-2 py-1 w-full bg-white text-[11px]">
                        {TYPE_OF_SUPPLY_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                      </select>
                    </div>
                    <label className="flex items-center gap-2 cursor-pointer text-[10px]">
                      <input type="checkbox" checked={inclusiveOfDutiesAndTaxes} onChange={(e) => setInclusiveOfDutiesAndTaxes(e.target.checked)} />
                      Inclusive of Duties &amp; Taxes
                    </label>
                    <div>
                      <label className="block text-[10px] font-medium text-gray-600 mb-0.5">Rate of Duty</label>
                      <input type="number" min={0} step={0.01} value={rateOfDuty} onChange={(e) => setRateOfDuty(e.target.value)} className="border border-[#D0D0D0] px-2 py-1 w-24 text-[11px]" placeholder="Optional" />
                    </div>
                  </div>
                </section>

                {showInactiveInOverlay && (
                  <section className="border-t border-[#E0E0E0] pt-3">
                    <h3 className="text-[10px] font-semibold text-gray-500 mb-2">Inactive (reference only)</h3>
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
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50" role="dialog" aria-modal="true" aria-labelledby="quit-confirm-title">
          <div className="bg-white border border-[#D0D0D0] rounded shadow-lg p-4 max-w-sm mx-4">
            <h2 id="quit-confirm-title" className="font-semibold text-[12px] text-[#7F1D1D] mb-2">Quit?</h2>
            <p className="text-[11px] text-gray-600 mb-4">Discard unsaved changes and return?</p>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setQuitConfirmOpen(false)}>No</Button>
              <Button size="sm" className="bg-[#DC2626] text-white hover:bg-[#B91C1C]" onClick={handleQuit}>Yes</Button>
            </div>
          </div>
        </div>
      )}

      {getHsnsacModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="get-hsnsac-title"
        >
          <div className="bg-white border border-[#D0D0D0] rounded shadow-lg max-w-sm w-full mx-4 p-4">
            <div className="font-semibold text-[12px] text-[#7F1D1D] mb-2" id="get-hsnsac-title">
              Get HSN/SAC Info
            </div>
            <p className="text-[11px] text-gray-600 mb-4">
              API integration placeholder. This action would fetch HSN/SAC description and GST rates from an external service.
            </p>
            <div className="flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setGetHsnsacModalOpen(false)}>
                Close (B or Esc)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
