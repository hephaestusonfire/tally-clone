import * as React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import {
  useAppStore,
  type Ledger,
  type StockGroup,
  type StockCategory,
  type StockItem,
  type InventoryUnit,
  type Godown,
  type Group,
  type Currency,
  type VoucherTypeMaster,
  type CreditLimitRecord,
  type GstRegistration,
  type GstClassification,
  type ScenarioMaster,
  GROUP_DISPLAY_ORDER,
} from '../../store/useAppStore';
import {
  MASTER_CATEGORIES_ALTER,
  getVisibleItems,
  hasMoreItems,
  type MasterItem,
} from '../../store/masterCreation';
import { MasterFormModal } from '../modals/MasterFormModal';

type AlterPhase = 'master-type' | 'record-list';

export function MasterAlterationView() {
  const toggleCompanyModal = useAppStore((s) => s.toggleCompanyModal);
  const setActiveView = useAppStore((s) => s.setActiveView);
  const setGroupFormEditingId = useAppStore((s) => s.setGroupFormEditingId);
  const setLedgerFormEditingId = useAppStore((s) => s.setLedgerFormEditingId);
  const setCurrencyFormEditingId = useAppStore((s) => s.setCurrencyFormEditingId);
  const setVoucherTypeFormEditingId = useAppStore((s) => s.setVoucherTypeFormEditingId);
  const setCreditLimitFormEditingId = useAppStore((s) => s.setCreditLimitFormEditingId);
  const setStockGroupFormEditingId = useAppStore((s) => s.setStockGroupFormEditingId);
  const setStockCategoryFormEditingId = useAppStore((s) => s.setStockCategoryFormEditingId);
  const setStockItemFormEditingId = useAppStore((s) => s.setStockItemFormEditingId);
  const setUnitFormEditingId = useAppStore((s) => s.setUnitFormEditingId);
  const setGodownFormEditingId = useAppStore((s) => s.setGodownFormEditingId);
  const setGstRegistrationFormEditingId = useAppStore((s) => s.setGstRegistrationFormEditingId);
  const setGstClassificationFormEditingId = useAppStore((s) => s.setGstClassificationFormEditingId);
  const ledgers = useAppStore((s) => s.mockData.ledgers);
  const stockGroups = useAppStore((s) => s.stockGroups);
  const stockCategories = useAppStore((s) => s.stockCategories);
  const stockItems = useAppStore((s) => s.stockItems);
  const inventoryUnits = useAppStore((s) => s.inventoryUnits);
  const godowns = useAppStore((s) => s.godowns);
  const gstRegistrations = useAppStore((s) => s.gstRegistrations);
  const gstClassifications = useAppStore((s) => s.gstClassifications);
  const groups = useAppStore((s) => s.groups);
  const currencies = useAppStore((s) => s.currencies);
  const voucherTypes = useAppStore((s) => s.voucherTypes);
  const creditLimits = useAppStore((s) => s.creditLimits);
  const scenarios = useAppStore((s) => s.scenarios);
  const isGstEnabled = useAppStore((s) => s.isGstEnabled);
  const masterAlterationOpenTo = useAppStore((s) => s.masterAlterationOpenTo);
  const setMasterAlterationOpenTo = useAppStore((s) => s.setMasterAlterationOpenTo);
  const updateGroup = useAppStore((s) => s.updateGroup);
  const deleteGroup = useAppStore((s) => s.deleteGroup);
  const canDeleteGroup = useAppStore((s) => s.canDeleteGroup);
  const isPredefinedGroup = useAppStore((s) => s.isPredefinedGroup);
  const updateLedger = useAppStore((s) => s.updateLedger);
  const deleteLedger = useAppStore((s) => s.deleteLedger);
  const canDeleteLedger = useAppStore((s) => s.canDeleteLedger);

  const categoriesAlterFiltered = React.useMemo(() => {
    const gstOn = isGstEnabled();
    return MASTER_CATEGORIES_ALTER.map((cat) => ({
      ...cat,
      items: gstOn
        ? cat.items
        : cat.items.filter(
            (i) => i.formType !== 'gst-registration' && i.formType !== 'gst-classification'
          ),
    }));
  }, [isGstEnabled]);

  const [expandAll, setExpandAll] = React.useState(false);
  const [showMore, setShowMore] = React.useState<Record<string, boolean>>({});
  const showInactive = useAppStore((s) => s.showInactive);
  const setShowInactive = useAppStore((s) => s.setShowInactive);
  const [expanded, setExpanded] = React.useState<Set<string>>(
    () => new Set(MASTER_CATEGORIES_ALTER.map((c) => c.id))
  );

  const [phase, setPhase] = React.useState<AlterPhase>('master-type');
  const [selectedMasterType, setSelectedMasterType] = React.useState<MasterItem | null>(null);
  const [selectedTypeIndex, setSelectedTypeIndex] = React.useState(0);
  const [selectedRecordIndex, setSelectedRecordIndex] = React.useState(0);
  const [listError, setListError] = React.useState<string | null>(null);
  const [alterForm, setAlterForm] = React.useState<{
    master: MasterItem;
    existingLedger?: Ledger | null;
    existingStockGroup?: StockGroup | null;
  } | null>(null);

  const flatItems: { catId: string; item: MasterItem }[] = React.useMemo(() => {
    const out: { catId: string; item: MasterItem }[] = [];
    categoriesAlterFiltered.forEach((cat) => {
      if (!expanded.has(cat.id)) return;
      const showMoreCat = expandAll ? true : showMore[cat.id] ?? false;
      const visible = getVisibleItems(cat.items, showMoreCat, showInactive);
      visible.forEach((item) => out.push({ catId: cat.id, item }));
    });
    return out;
  }, [expanded, showMore, showInactive, expandAll, categoriesAlterFiltered]);

  // When opening from List of Masters popup: expand all and jump to that master type's record list
  React.useEffect(() => {
    if (!masterAlterationOpenTo) return;
    setExpanded(new Set(categoriesAlterFiltered.map((c) => c.id)));
    setShowMore(
      categoriesAlterFiltered.reduce<Record<string, boolean>>(
        (acc, c) => ({ ...acc, [c.id]: true }),
        {}
      )
    );
    setExpandAll(true);
  }, [masterAlterationOpenTo, categoriesAlterFiltered]);

  React.useEffect(() => {
    if (!masterAlterationOpenTo || flatItems.length === 0) return;
    const idx = flatItems.findIndex((f) => f.item.id === masterAlterationOpenTo);
    if (idx < 0) {
      setMasterAlterationOpenTo(null);
      return;
    }
    setSelectedTypeIndex(idx);
    setSelectedMasterType(flatItems[idx].item);
    setPhase('record-list');
    setSelectedRecordIndex(0);
    setMasterAlterationOpenTo(null);
  }, [masterAlterationOpenTo, flatItems, setMasterAlterationOpenTo]);

  const toggleCategory = (id: string) => {
    setExpanded((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleShowMore = (catId: string) => {
    setShowMore((s) => ({ ...s, [catId]: !s[catId] }));
  };

  const handleExpandAll = () => {
    setExpanded(new Set(MASTER_CATEGORIES_ALTER.map((c) => c.id)));
    setShowMore(MASTER_CATEGORIES_ALTER.reduce<Record<string, boolean>>((acc, c) => ({ ...acc, [c.id]: true }), {}));
    setExpandAll(true);
  };

  const handleShowLess = () => {
    setShowMore(MASTER_CATEGORIES_ALTER.reduce<Record<string, boolean>>((acc, c) => ({ ...acc, [c.id]: false }), {}));
    setExpandAll(false);
  };

  const getRecordsForType = React.useCallback(
    (
      item: MasterItem
    ): (
      | Ledger
      | StockGroup
      | StockCategory
      | StockItem
      | InventoryUnit
      | Godown
      | Group
      | Currency
      | VoucherTypeMaster
      | CreditLimitRecord
      | ScenarioMaster
      | GstRegistration
      | GstClassification
    )[] => {
    if (item.formType === 'ledger') {
      return showInactive ? ledgers : ledgers.filter((l) => !l.inactive);
    }
    if (item.formType === 'stock-group') {
      return showInactive ? stockGroups : stockGroups.filter((g) => !g.inactive);
    }
    if (item.formType === 'group') {
      return showInactive ? groups : groups.filter((g) => !g.inactive);
    }
    if (item.formType === 'currency') {
      return showInactive ? currencies : currencies.filter((c) => !c.inactive);
    }
    if (item.formType === 'voucher-type') {
      return showInactive ? voucherTypes : voucherTypes.filter((v) => !v.inactive);
    }
    if (item.formType === 'credit-limits') {
      return showInactive ? creditLimits : creditLimits.filter((c) => !c.inactive);
    }
    if (item.formType === 'scenario') {
      return showInactive ? scenarios : scenarios.filter((s) => !s.inactive);
    }
    if (item.formType === 'stock-category') {
      return showInactive ? stockCategories : stockCategories.filter((c) => !c.inactive);
    }
    if (item.formType === 'stock-item') {
      return showInactive ? stockItems : stockItems.filter((i) => !i.inactive);
    }
    if (item.formType === 'unit') {
      return showInactive ? inventoryUnits : inventoryUnits.filter((u) => !u.inactive);
    }
    if (item.formType === 'godown') {
      return showInactive ? godowns : godowns.filter((g) => !g.inactive);
    }
    if (item.formType === 'gst-registration') {
      return showInactive ? gstRegistrations : gstRegistrations.filter((r) => r.active);
    }
    if (item.formType === 'gst-classification') {
      return gstClassifications;
    }
    return [];
  },
  [
    showInactive,
    ledgers,
    stockGroups,
    stockCategories,
    stockItems,
    inventoryUnits,
    godowns,
    groups,
    currencies,
    voucherTypes,
    creditLimits,
    scenarios,
    gstRegistrations,
    gstClassifications,
  ]);

  const recordList = React.useMemo(() => {
    if (phase !== 'record-list' || !selectedMasterType) return [];
    return getRecordsForType(selectedMasterType);
  }, [phase, selectedMasterType, getRecordsForType]);

  /** List of Groups: sort by Tally hierarchy; other masters use recordList as-is */
  const displayList = React.useMemo(() => {
    if (selectedMasterType?.formType !== 'group' || !Array.isArray(recordList)) return recordList;
    const list = recordList as Group[];
    return [...list].sort((a, b) => {
      const ia = GROUP_DISPLAY_ORDER.indexOf(a.name);
      const ib = GROUP_DISPLAY_ORDER.indexOf(b.name);
      if (ia >= 0 && ib >= 0) return ia - ib;
      if (ia >= 0) return -1;
      if (ib >= 0) return 1;
      return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    });
  }, [selectedMasterType?.formType, recordList]);

  React.useEffect(() => {
    if (displayList.length > 0 && selectedRecordIndex >= displayList.length) {
      setSelectedRecordIndex(displayList.length - 1);
    }
  }, [displayList.length, selectedRecordIndex]);

  const handleSelectMasterType = (item: MasterItem) => {
    const records = getRecordsForType(item);
    if (records.length > 0) {
      setSelectedMasterType(item);
      setSelectedRecordIndex(0);
      setPhase('record-list');
    }
  };

  const handleSelectRecord = (
    record:
      | Ledger
      | StockGroup
      | StockCategory
      | StockItem
      | InventoryUnit
      | Godown
      | Group
      | Currency
      | VoucherTypeMaster
      | CreditLimitRecord
      | ScenarioMaster
      | GstRegistration
      | GstClassification
  ) => {
    if (!selectedMasterType) return;
    if (selectedMasterType.formType === 'group') {
      setGroupFormEditingId((record as Group).id);
      setActiveView('group-creation');
      setPhase('master-type');
      setSelectedMasterType(null);
      return;
    }
    if (selectedMasterType.formType === 'ledger') {
      setLedgerFormEditingId((record as Ledger).id);
      setActiveView('ledger-creation');
      setPhase('master-type');
      setSelectedMasterType(null);
      return;
    }
    if (selectedMasterType.formType === 'currency') {
      setCurrencyFormEditingId((record as Currency).id);
      setActiveView('currency-creation');
      setPhase('master-type');
      setSelectedMasterType(null);
      return;
    }
    if (selectedMasterType.formType === 'voucher-type') {
      setVoucherTypeFormEditingId((record as VoucherTypeMaster).id);
      setActiveView('voucher-type-creation');
      setPhase('master-type');
      setSelectedMasterType(null);
      return;
    }
    if (selectedMasterType.formType === 'credit-limits') {
      setCreditLimitFormEditingId((record as CreditLimitRecord).id);
      setActiveView('credit-limits-creation');
      setPhase('master-type');
      setSelectedMasterType(null);
      return;
    }
    if (selectedMasterType.formType === 'scenario') {
      useAppStore.getState().setScenarioFormEditingId((record as ScenarioMaster).id);
      setActiveView('scenario-creation');
      setPhase('master-type');
      setSelectedMasterType(null);
      return;
    }
    if (selectedMasterType.formType === 'stock-group') {
      setStockGroupFormEditingId((record as StockGroup).id);
      setActiveView('stock-group-creation');
      setPhase('master-type');
      setSelectedMasterType(null);
      return;
    }
    if (selectedMasterType.formType === 'stock-category') {
      setStockCategoryFormEditingId((record as StockCategory).id);
      setActiveView('stock-category-creation');
      setPhase('master-type');
      setSelectedMasterType(null);
      return;
    }
    if (selectedMasterType.formType === 'stock-item') {
      setStockItemFormEditingId((record as StockItem).id);
      setActiveView('stock-item-creation');
      setPhase('master-type');
      setSelectedMasterType(null);
      return;
    }
    if (selectedMasterType.formType === 'unit') {
      setUnitFormEditingId((record as InventoryUnit).id);
      setActiveView('unit-creation');
      setPhase('master-type');
      setSelectedMasterType(null);
      return;
    }
    if (selectedMasterType.formType === 'godown') {
      setGodownFormEditingId((record as Godown).id);
      setActiveView('godown-creation');
      setPhase('master-type');
      setSelectedMasterType(null);
      return;
    }
    if (selectedMasterType.formType === 'gst-registration') {
      setGstRegistrationFormEditingId((record as GstRegistration).id);
      setActiveView('gst-registration-creation');
      setPhase('master-type');
      setSelectedMasterType(null);
      return;
    }
    if (selectedMasterType.formType === 'gst-classification') {
      setGstClassificationFormEditingId((record as GstClassification).id);
      setActiveView('gst-classification-creation');
      setPhase('master-type');
      setSelectedMasterType(null);
      return;
    }
    setPhase('master-type');
    setSelectedMasterType(null);
  };

  const handleBackFromRecordList = () => {
    setPhase('master-type');
    setSelectedMasterType(null);
  };

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (alterForm) {
        if (e.key === 'Escape') setAlterForm(null);
        return;
      }
      if (phase === 'record-list') {
        if (e.key === 'Escape' || (e.key === 'q' && !e.ctrlKey && !e.metaKey && !e.altKey)) {
          e.preventDefault();
          handleBackFromRecordList();
          return;
        }
        if (selectedMasterType?.formType === 'group') {
          const target = displayList[selectedRecordIndex] as Group | undefined;
          if (e.key === 'c' && !e.ctrlKey && !e.metaKey && !e.altKey) {
            e.preventDefault();
            setGroupFormEditingId(null);
            setActiveView('group-creation');
            setPhase('master-type');
            setSelectedMasterType(null);
            return;
          }
          if (e.key === 'd' && !e.ctrlKey && !e.metaKey && !e.altKey && target) {
            e.preventDefault();
            if (canDeleteGroup(target.id)) {
              deleteGroup(target.id);
              setListError(null);
              setSelectedRecordIndex((i) => (i >= displayList.length - 1 ? Math.max(0, displayList.length - 2) : i));
            } else {
              setListError(
                isPredefinedGroup(target.name)
                  ? 'Cannot delete: Primary group'
                  : 'Cannot delete: group has child groups or ledgers'
              );
            }
            return;
          }
          if (e.key === 'r' && !e.ctrlKey && !e.metaKey && !e.altKey && target) {
            e.preventDefault();
            if (!isPredefinedGroup(target.name)) {
              updateGroup({ ...target, inactive: true });
              setListError(null);
            } else {
              setListError('Cannot remove: Primary group');
            }
            return;
          }
          if (e.key === 'u' && !e.ctrlKey && !e.metaKey && !e.altKey && target) {
            e.preventDefault();
            updateGroup({ ...target, inactive: false });
            return;
          }
        }
        if (selectedMasterType?.formType === 'ledger') {
          const target = displayList[selectedRecordIndex] as Ledger | undefined;
          if (e.key === 'c' && !e.ctrlKey && !e.metaKey && !e.altKey) {
            e.preventDefault();
            setLedgerFormEditingId(null);
            setActiveView('ledger-creation');
            setPhase('master-type');
            setSelectedMasterType(null);
            return;
          }
          if (e.key === 'd' && !e.ctrlKey && !e.metaKey && !e.altKey && target) {
            e.preventDefault();
            if (canDeleteLedger(target.id)) {
              deleteLedger(target.id);
              setSelectedRecordIndex((i) => (i >= displayList.length - 1 ? Math.max(0, displayList.length - 2) : i));
            }
            return;
          }
          if (e.key === 'r' && !e.ctrlKey && !e.metaKey && !e.altKey && target) {
            e.preventDefault();
            updateLedger({ ...target, inactive: true });
            return;
          }
          if (e.key === 'u' && !e.ctrlKey && !e.metaKey && !e.altKey && target) {
            e.preventDefault();
            updateLedger({ ...target, inactive: false });
            return;
          }
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedRecordIndex((i) => (i < displayList.length - 1 ? i + 1 : 0));
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedRecordIndex((i) => (i > 0 ? i - 1 : displayList.length - 1));
          return;
        }
        if (e.key === 'Enter' && displayList[selectedRecordIndex]) {
          e.preventDefault();
          handleSelectRecord(displayList[selectedRecordIndex] as Ledger | StockGroup | StockCategory | StockItem | InventoryUnit | Godown | Group | Currency | VoucherTypeMaster | CreditLimitRecord | GstRegistration | GstClassification);
          return;
        }
        // Space: Select only (do not alter) — List of Ledgers / List of Groups
        if (e.key === ' ' && phase === 'record-list' && (selectedMasterType?.formType === 'ledger' || selectedMasterType?.formType === 'group')) {
          e.preventDefault();
          return;
        }
      }
      if (phase === 'master-type') {
        if (e.key === 'Escape') {
          e.preventDefault();
          setActiveView('chart-of-accounts');
          return;
        }
        if (e.key === 'F3') {
          e.preventDefault();
          toggleCompanyModal();
          return;
        }
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          setSelectedTypeIndex((i) => (i < flatItems.length - 1 ? i + 1 : 0));
          return;
        }
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          setSelectedTypeIndex((i) => (i > 0 ? i - 1 : flatItems.length - 1));
          return;
        }
        if (e.key === 'Enter' && flatItems[selectedTypeIndex]) {
          e.preventDefault();
          handleSelectMasterType(flatItems[selectedTypeIndex].item);
          return;
        }
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [phase, flatItems, selectedTypeIndex, displayList, selectedRecordIndex, alterForm, toggleCompanyModal, selectedMasterType?.formType, updateGroup, deleteGroup, canDeleteGroup, isPredefinedGroup, updateLedger, deleteLedger, canDeleteLedger, setGroupFormEditingId, setLedgerFormEditingId, setActiveView]);

  React.useEffect(() => {
    if (phase === 'master-type' && flatItems[selectedTypeIndex]) {
      const el = document.querySelector(`[data-alter-type-index="${selectedTypeIndex}"]`);
      el?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [phase, selectedTypeIndex, flatItems.length]);

  const isListOfGroups = phase === 'record-list' && selectedMasterType?.formType === 'group';
  const isListOfLedgers = phase === 'record-list' && selectedMasterType?.formType === 'ledger';

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 min-w-0 flex flex-col bg-white overflow-auto p-4">
        {isListOfGroups ? (
          <>
            <div className="text-[14px] font-bold text-[#7F1D1D] mb-1">
              Chart of Accounts
            </div>
            <div className="text-[11px] font-semibold text-gray-700 mb-4">
              List of Groups
            </div>
          </>
        ) : isListOfLedgers ? (
          <>
            <div className="text-[14px] font-bold text-[#7F1D1D] mb-1">
              Chart of Accounts
            </div>
            <div className="text-[11px] font-semibold text-gray-700 mb-4">
              List of Ledgers
            </div>
          </>
        ) : (
          <div className="text-[14px] font-bold text-[#7F1D1D] mb-4">
            Master Alteration
          </div>
        )}
        <div className="flex flex-wrap items-center gap-3 mb-3 text-[10px]">
          <button
            type="button"
            className="px-2 py-1 border border-[#D0D0D0] rounded bg-white hover:bg-[#FEF2F2]"
            onClick={handleExpandAll}
          >
            Expand All
          </button>
          <button
            type="button"
            className="px-2 py-1 border border-[#D0D0D0] rounded bg-white hover:bg-[#FEF2F2]"
            onClick={handleShowLess}
          >
            Show Less
          </button>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="border border-[#D0D0D0]"
            />
            Show Inactive
          </label>
          <span className="text-gray-500">F3: Change Company</span>
        </div>

        {phase === 'record-list' && selectedMasterType ? (
          <div className="flex flex-col flex-1 min-h-0 border border-[#D0D0D0] rounded">
            {!isListOfGroups && !isListOfLedgers && (
              <div className="px-3 py-2 border-b border-[#D0D0D0] bg-[#F5F5F5] font-semibold text-[11px] text-[#7F1D1D]">
                Select {selectedMasterType.label} to Alter
              </div>
            )}
            {listError && (isListOfGroups || isListOfLedgers) && (
              <div className="px-3 py-2 bg-amber-50 border-b border-amber-200 text-[11px] text-amber-800">
                {listError}
              </div>
            )}
            {displayList.length === 0 ? (
              <div className="p-4 text-[11px] text-gray-500">No {selectedMasterType.label}s to alter. Esc to go back.</div>
            ) : (
            <ScrollArea className="flex-1">
              <div className="p-2 space-y-0.5">
                {displayList.map((record, i) => {
                  const isSelected = i === selectedRecordIndex;
                  const isInactive =
                    ('inactive' in record && (record as { inactive?: boolean }).inactive) ||
                    ('active' in record && !(record as GstRegistration).active);
                  return (
                    <button
                      key={record.id}
                      type="button"
                      className={`tally-list-item w-full text-left px-3 py-2 text-[11px] rounded ${
                        isSelected ? 'tally-selected font-medium' : ''
                      } ${isInactive ? 'text-gray-500 italic' : ''}`}
                      data-selected={isSelected ? 'true' : undefined}
                      onClick={() => handleSelectRecord(record as Ledger | StockGroup | StockCategory | StockItem | InventoryUnit | Godown | Group | Currency | VoucherTypeMaster | CreditLimitRecord | GstRegistration | GstClassification)}
                    >
                      {selectedMasterType?.formType === 'ledger' && 'under' in record && 'name' in record
                        ? `${(record as Ledger).name} | ${(record as Ledger).under}`
                        : 'symbol' in record && 'formalName' in record && !('type' in record)
                        ? `${(record as Currency).symbol} - ${(record as Currency).formalName}`
                        : 'ledgerName' in record || 'groupName' in record
                        ? `${(record as CreditLimitRecord).ledgerName ?? (record as CreditLimitRecord).groupName ?? ''} (Limit: ${(record as CreditLimitRecord).amount})`
                        : 'symbol' in record && 'type' in record && ((record as InventoryUnit).type === 'simple' || (record as InventoryUnit).type === 'compound')
                        ? (record as InventoryUnit).type === 'compound'
                          ? `${(record as InventoryUnit).symbol} (1 = ${(record as InventoryUnit).conversion} ${(record as InventoryUnit).baseUnit})`
                          : (record as InventoryUnit).symbol
                        : 'state' in record && 'registrationType' in record
                        ? `${(record as GstRegistration).state}${(record as GstRegistration).isDefault ? ' (Default)' : ''}`
                        : 'name' in record && 'hsnsacDetails' in record
                        ? (record as GstClassification).name
                        : 'name' in record && record.name
                      }
                      {isInactive && ' (Inactive)'}
                    </button>
                  );
                })}
              </div>
            </ScrollArea>
            )}
            <div className="px-2 py-1 border-t border-[#D0D0D0] text-[10px] text-gray-500 flex flex-wrap items-center gap-x-4 gap-y-1">
              {isListOfGroups ? (
                <>
                  <span>Enter: Alter</span>
                  <span>Space: Select only</span>
                  <span>C: Create</span>
                  <span>D: Delete (no children/ledgers)</span>
                  <span>R: Remove Line (mark inactive)</span>
                  <span>U: Restore Line</span>
                  <span>Q: Quit</span>
                  <span className="text-gray-400">Primary: cannot remove or delete</span>
                </>
              ) : isListOfLedgers ? (
                <>
                  <span>Enter: Alter</span>
                  <span>Space: Select only</span>
                  <span>C: Create Master</span>
                  <span>D: Delete</span>
                  <span>R: Remove Line</span>
                  <span>U: Restore Line</span>
                  <span>Q: Quit</span>
                </>
              ) : (
                <>Esc: Back · ↑↓: Move · Enter: Alter</>
              )}
            </div>
          </div>
        ) : (
          <ScrollArea className="flex-1 border border-[#D0D0D0] rounded">
            <div className="p-2 space-y-1">
              {categoriesAlterFiltered.map((cat) => {
                const isExpanded = expanded.has(cat.id);
                const catShowMore = expandAll || (showMore[cat.id] ?? false);
                const visible = getVisibleItems(cat.items, catShowMore, showInactive);
                const hasMore = hasMoreItems(cat.items, catShowMore, showInactive);
                return (
                  <div key={cat.id}>
                    <button
                      type="button"
                      className="tally-list-item w-full text-left px-3 py-2 font-semibold text-[#7F1D1D] flex items-center gap-1 text-[11px]"
                      onClick={() => toggleCategory(cat.id)}
                    >
                      {isExpanded ? (
                        <ChevronDown className="w-3 h-3 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-3 h-3 flex-shrink-0" />
                      )}
                      {cat.label}
                    </button>
                    {isExpanded && (
                      <div className="pl-5">
                        {visible.map((item) => {
                          const idx = flatItems.findIndex((f) => f.item.id === item.id && f.catId === cat.id);
                          const isSelected = flatItems[selectedTypeIndex]?.item.id === item.id && flatItems[selectedTypeIndex]?.catId === cat.id;
                          const hasRecords = getRecordsForType(item).length > 0;
                          return (
                            <button
                              key={item.id}
                              data-alter-type-index={idx}
                              type="button"
                              className={`tally-list-item w-full text-left px-3 py-1.5 text-[11px] rounded ${
                                isSelected ? 'tally-selected font-medium' : ''
                              } ${item.inactive ? 'text-gray-500' : ''} ${!hasRecords && item.formType !== 'placeholder' ? 'opacity-80' : ''}`}
                              data-selected={isSelected ? 'true' : undefined}
                              onClick={() => handleSelectMasterType(item)}
                            >
                              {item.label}
                            </button>
                          );
                        })}
                        {hasMore && (
                          <button
                            type="button"
                            className="w-full text-left px-3 py-1 text-[10px] text-[#DC2626] hover:underline"
                            onClick={() => toggleShowMore(cat.id)}
                          >
                            {catShowMore ? 'Show Less' : 'Show More'}
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        )}
      </div>
      {alterForm && (
        <MasterFormModal
          mode="alter"
          master={alterForm.master}
          existingLedger={alterForm.existingLedger ?? null}
          existingStockGroup={alterForm.existingStockGroup ?? null}
          onClose={() => setAlterForm(null)}
        />
      )}
    </div>
  );
}
