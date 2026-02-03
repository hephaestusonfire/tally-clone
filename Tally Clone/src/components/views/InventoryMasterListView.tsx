import * as React from 'react';
import {
  useAppStore,
  type StockItem,
  type StockCategory,
} from '../../store/useAppStore';
import { useGatewayStore } from '../../store/useGatewayStore';

const ROW_HEIGHT = 28;
const OVERSCAN = 15;

export type InventoryListType = 'stock-items' | 'stock-categories';

interface InventoryMasterListViewProps {
  listType: InventoryListType;
}

export function InventoryMasterListView({ listType }: InventoryMasterListViewProps) {
  const stockItems = useAppStore((s) => s.stockItems) ?? [];
  const stockGroups = useAppStore((s) => s.stockGroups) ?? [];
  const stockCategories = useAppStore((s) => s.stockCategories) ?? [];
  const showInactive = useAppStore((s) => s.showInactive);
  const setShowInactive = useAppStore((s) => s.setShowInactive);
  const date = useAppStore((s) => s.date);
  const financialPeriodStart = useAppStore((s) => s.financialPeriodStart);
  const financialPeriodEnd = useAppStore((s) => s.financialPeriodEnd);
  const setActiveView = useAppStore((s) => s.setActiveView);
  const setListOfMastersPopupOpen = useAppStore((s) => s.setListOfMastersPopupOpen);
  const setStockItemFormEditingId = useAppStore((s) => s.setStockItemFormEditingId);
  const setStockCategoryFormEditingId = useAppStore((s) => s.setStockCategoryFormEditingId);
  const updateStockItem = useAppStore((s) => s.updateStockItem);
  const updateStockCategory = useAppStore((s) => s.updateStockCategory);
  const deleteStockItem = useAppStore((s) => s.deleteStockItem);
  const deleteStockCategory = useAppStore((s) => s.deleteStockCategory);
  const canDeleteStockItem = useAppStore((s) => s.canDeleteStockItem);
  const canDeleteStockCategory = useAppStore((s) => s.canDeleteStockCategory);
  const toggleCompanyModal = useAppStore((s) => s.toggleCompanyModal);
  const openDateModal = useGatewayStore((s) => s.openDateModal);

  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [listError, setListError] = React.useState<string | null>(null);
  const [filterName, setFilterName] = React.useState('');
  const [filterStockGroup, setFilterStockGroup] = React.useState('');
  const [filterStockCategory, setFilterStockCategory] = React.useState('');
  const [showFilter, setShowFilter] = React.useState(false);
  const [scrollTop, setScrollTop] = React.useState(0);
  const [containerHeight, setContainerHeight] = React.useState(400);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  const isStockItems = listType === 'stock-items';

  const filteredList = React.useMemo(() => {
    const nameLower = filterName.trim().toLowerCase();
    const groupLower = filterStockGroup.trim().toLowerCase();
    const catLower = filterStockCategory.trim().toLowerCase();

    if (isStockItems) {
      let list: StockItem[] = showInactive ? [...stockItems] : stockItems.filter((i) => !i.inactive);
      if (nameLower) list = list.filter((i) => i.name.toLowerCase().includes(nameLower));
      if (groupLower) list = list.filter((i) => i.under.toLowerCase().includes(groupLower));
      if (catLower) list = list.filter((i) => (i.categoryName ?? '').toLowerCase().includes(catLower));
      return list.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    } else {
      let list: StockCategory[] = showInactive ? [...stockCategories] : stockCategories.filter((c) => !c.inactive);
      if (nameLower) list = list.filter((c) => c.name.toLowerCase().includes(nameLower));
      if (groupLower) list = list.filter((c) => c.under.toLowerCase().includes(groupLower));
      return list.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));
    }
  }, [
    isStockItems,
    stockItems,
    stockCategories,
    showInactive,
    filterName,
    filterStockGroup,
    filterStockCategory,
  ]);

  const selectedRecord = filteredList[selectedIndex] ?? null;

  React.useEffect(() => {
    if (selectedIndex >= filteredList.length) setSelectedIndex(Math.max(0, filteredList.length - 1));
  }, [filteredList.length, selectedIndex]);

  React.useEffect(() => {
    const t = setTimeout(() => setListError(null), 4000);
    return () => clearTimeout(t);
  }, [listError]);

  const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - OVERSCAN);
  const endIndex = Math.min(
    filteredList.length,
    startIndex + Math.ceil(containerHeight / ROW_HEIGHT) + OVERSCAN * 2
  );
  const visibleSlice = filteredList.slice(startIndex, endIndex);

  const handleScroll = React.useCallback((e: React.UIEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    setScrollTop(el.scrollTop);
    if (containerHeight !== el.clientHeight) setContainerHeight(el.clientHeight);
  }, [containerHeight]);

  React.useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setContainerHeight(el.clientHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  React.useEffect(() => {
    const cont = scrollRef.current;
    if (!cont || filteredList.length === 0) return;
    const targetTop = selectedIndex * ROW_HEIGHT;
    const viewHeight = cont.clientHeight;
    if (targetTop < cont.scrollTop || targetTop + ROW_HEIGHT > cont.scrollTop + viewHeight) {
      cont.scrollTop = Math.max(0, targetTop - Math.floor(viewHeight / 2) + Math.floor(ROW_HEIGHT / 2));
    }
  }, [selectedIndex, filteredList.length]);

  const handleBack = React.useCallback(() => {
    setListOfMastersPopupOpen(true);
    setActiveView('chart-of-accounts');
  }, [setListOfMastersPopupOpen, setActiveView]);

  const handleAlter = React.useCallback(() => {
    if (!selectedRecord) return;
    if (isStockItems) {
      setStockItemFormEditingId((selectedRecord as StockItem).id);
      setActiveView('stock-item-creation');
    } else {
      setStockCategoryFormEditingId((selectedRecord as StockCategory).id);
      setActiveView('stock-category-creation');
    }
  }, [selectedRecord, isStockItems, setStockItemFormEditingId, setStockCategoryFormEditingId, setActiveView]);

  const handleCreate = React.useCallback(() => {
    if (isStockItems) {
      setStockItemFormEditingId(null);
      setActiveView('stock-item-creation');
    } else {
      setStockCategoryFormEditingId(null);
      setActiveView('stock-category-creation');
    }
  }, [isStockItems, setStockItemFormEditingId, setStockCategoryFormEditingId, setActiveView]);

  const handleDelete = React.useCallback(() => {
    if (!selectedRecord) return;
    if (isStockItems) {
      const item = selectedRecord as StockItem;
      if (!canDeleteStockItem(item.id)) {
        setListError('Cannot delete: Stock Item is used in vouchers.');
        return;
      }
      deleteStockItem(item.id);
      setListError(null);
      setSelectedIndex((i) => (i >= filteredList.length - 1 ? Math.max(0, filteredList.length - 2) : i));
    } else {
      const cat = selectedRecord as StockCategory;
      if (!canDeleteStockCategory(cat.id)) {
        setListError('Cannot delete: Stock Category has child items or categories.');
        return;
      }
      deleteStockCategory(cat.id);
      setListError(null);
      setSelectedIndex((i) => (i >= filteredList.length - 1 ? Math.max(0, filteredList.length - 2) : i));
    }
  }, [selectedRecord, isStockItems, canDeleteStockItem, canDeleteStockCategory, deleteStockItem, deleteStockCategory, filteredList.length]);

  const handleRemoveLine = React.useCallback(() => {
    if (!selectedRecord) return;
    if (isStockItems) {
      updateStockItem({ ...(selectedRecord as StockItem), inactive: true });
      setListError(null);
    } else {
      updateStockCategory({ ...(selectedRecord as StockCategory), inactive: true });
      setListError(null);
    }
  }, [selectedRecord, isStockItems, updateStockItem, updateStockCategory]);

  const handleRestoreLine = React.useCallback(() => {
    if (!selectedRecord) return;
    if (isStockItems) {
      updateStockItem({ ...(selectedRecord as StockItem), inactive: false });
      setListError(null);
    } else {
      updateStockCategory({ ...(selectedRecord as StockCategory), inactive: false });
      setListError(null);
    }
  }, [selectedRecord, isStockItems, updateStockItem, updateStockCategory]);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target?.tagName)) return;

      if (e.key === 'Escape') {
        e.preventDefault();
        if (showFilter) setShowFilter(false);
        else handleBack();
        return;
      }
      if (e.key === 'q' || e.key === 'Q') {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          handleBack();
          return;
        }
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => (i < filteredList.length - 1 ? i + 1 : 0));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => (i > 0 ? i - 1 : filteredList.length - 1));
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        handleAlter();
        return;
      }
      if (e.key === 'c' || e.key === 'C') {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          handleCreate();
          return;
        }
      }
      if (e.key === 'd' || e.key === 'D') {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          handleDelete();
          return;
        }
      }
      if (e.key === 'r' || e.key === 'R') {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          handleRemoveLine();
          return;
        }
      }
      if (e.key === 'u' || e.key === 'U') {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          handleRestoreLine();
          return;
        }
      }
      if (e.key === 'f' || e.key === 'F') {
        if (!e.ctrlKey && !e.metaKey && !e.altKey) {
          e.preventDefault();
          setShowFilter((s) => !s);
          return;
        }
      }
      if (e.key === 'F2') {
        e.preventDefault();
        openDateModal();
        return;
      }
      if (e.key === 'F3') {
        e.preventDefault();
        toggleCompanyModal();
        return;
      }
      if (e.key === 'F5') {
        e.preventDefault();
        setActiveView('list-of-stock-items');
        return;
      }
      if (e.key === 'F10') {
        e.preventDefault();
        handleBack();
        return;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [
    showFilter,
    handleBack,
    filteredList.length,
    handleAlter,
    handleCreate,
    handleDelete,
    handleRemoveLine,
    handleRestoreLine,
    openDateModal,
    toggleCompanyModal,
    setActiveView,
  ]);

  const subTitle = isStockItems ? 'List of Stock Items' : 'List of Stock Categories';
  const periodLabel = `${financialPeriodStart ?? ''} to ${financialPeriodEnd ?? ''}`.trim() || date;

  const stockGroupsCount = stockGroups.length;
  const stockItemsCount = stockItems.length;
  const stockCategoriesCount = stockCategories.length;

  const footerCountText = isStockItems
    ? `${stockGroupsCount} Stock Group(s) and ${stockItemsCount} Stock Item(s)`
    : `${stockCategoriesCount} Stock Categor${stockCategoriesCount === 1 ? 'y' : 'ies'} and ${stockItemsCount} Stock Item(s)`;

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-white rounded border border-[#D0D0D0]">
      <div className="flex-shrink-0 px-4 pt-3 pb-2 flex items-start justify-between gap-4">
        <div>
          <div className="text-[14px] font-bold text-[#7F1D1D] mb-0.5">
            Chart of Accounts
          </div>
          <div className="text-[11px] font-semibold text-gray-700 mb-2">
            {subTitle}
          </div>
          <div className="flex items-center gap-3 text-[10px] mb-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="border border-[#D0D0D0]"
              />
              Show Inactive
            </label>
            <button
              type="button"
              className="px-2 py-1 border border-[#D0D0D0] rounded bg-white hover:bg-[#E8E8E8] text-[10px]"
              onClick={() => setShowFilter((s) => !s)}
            >
              F: Apply Filter
            </button>
          </div>
          {showFilter && (
            <div className="flex flex-wrap items-center gap-3 py-2 border border-[#E0E0E0] rounded px-3 bg-[#F9F9F9] text-[10px]">
              <label className="flex items-center gap-1">
                <span>Name</span>
                <input
                  type="text"
                  value={filterName}
                  onChange={(e) => setFilterName(e.target.value)}
                  className="border border-[#D0D0D0] px-2 py-1 w-40"
                  placeholder="Filter by name"
                />
              </label>
              {isStockItems && (
                <>
                  <label className="flex items-center gap-1">
                    <span>Stock Group</span>
                    <select
                      value={filterStockGroup}
                      onChange={(e) => setFilterStockGroup(e.target.value)}
                      className="border border-[#D0D0D0] px-2 py-1 bg-white min-w-[120px]"
                    >
                      <option value="">-- All --</option>
                      {stockGroups.map((g) => (
                        <option key={g.id} value={g.name}>
                          {g.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex items-center gap-1">
                    <span>Stock Category</span>
                    <select
                      value={filterStockCategory}
                      onChange={(e) => setFilterStockCategory(e.target.value)}
                      className="border border-[#D0D0D0] px-2 py-1 bg-white min-w-[120px]"
                    >
                      <option value="">-- All --</option>
                      {stockCategories.map((c) => (
                        <option key={c.id} value={c.name}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </label>
                </>
              )}
              {!isStockItems && (
                <label className="flex items-center gap-1">
                  <span>Under</span>
                  <select
                    value={filterStockGroup}
                    onChange={(e) => setFilterStockGroup(e.target.value)}
                    className="border border-[#D0D0D0] px-2 py-1 bg-white min-w-[120px]"
                  >
                    <option value="">-- All --</option>
                    {Array.from(new Set(stockCategories.map((c) => c.under))).sort().map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </div>
          )}
        </div>
        <div className="text-[10px] text-gray-600 whitespace-nowrap pt-6">
          Period: {periodLabel}
        </div>
      </div>

      {listError && (
        <div className="flex-shrink-0 px-4 py-1.5 bg-amber-50 border-b border-amber-200 text-[11px] text-amber-800">
          {listError}
        </div>
      )}

      <div
        ref={scrollRef}
        className="flex-1 min-h-0 overflow-auto px-4"
        onScroll={handleScroll}
        style={{ overflowAnchor: 'none' }}
      >
        <div style={{ height: filteredList.length * ROW_HEIGHT, position: 'relative' }}>
          {filteredList.length === 0 ? (
            <div className="absolute inset-0 flex items-center justify-center text-[11px] text-gray-500">
              {isStockItems ? 'No Stock Items.' : 'No Stock Categories.'} Press C to Create.
            </div>
          ) : (
            <div
              style={{
                position: 'absolute',
                top: startIndex * ROW_HEIGHT,
                left: 0,
                right: 0,
              }}
            >
              {visibleSlice.map((record, sliceIdx) => {
                const globalIndex = startIndex + sliceIdx;
                const isSelected = globalIndex === selectedIndex;
                const inactive = 'inactive' in record && !!(record as StockItem & StockCategory).inactive;
                const id = record.id;
                const name = record.name;
                const under = 'under' in record ? (record as StockItem).under : (record as StockCategory).under;
                const categoryName = 'categoryName' in record ? (record as StockItem).categoryName : undefined;

                return (
                  <button
                    key={id}
                    type="button"
                    className={`tally-list-item w-full text-left flex items-center gap-2 px-2 border border-transparent hover:border-[#D0D0D0] text-[11px] ${
                      isSelected ? 'tally-selected font-medium bg-[#E8E8E8] border-[#D0D0D0]' : ''
                    } ${inactive ? 'text-gray-500 italic' : ''}`}
                    style={{ height: ROW_HEIGHT }}
                    data-selected={isSelected ? 'true' : undefined}
                    onClick={() => setSelectedIndex(globalIndex)}
                    onDoubleClick={() => {
                      setSelectedIndex(globalIndex);
                      handleAlter();
                    }}
                  >
                    <span className="truncate flex-1">{name}</span>
                    {under && (
                      <span className="text-[10px] text-gray-500 truncate max-w-[180px]" title={under}>
                        {under}
                      </span>
                    )}
                    {categoryName && (
                      <span className="text-[10px] text-gray-400 truncate max-w-[120px]" title={categoryName}>
                        {categoryName}
                      </span>
                    )}
                    {inactive && <span className="text-[10px] text-gray-400">(Inactive)</span>}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <div className="flex-shrink-0 px-4 py-1.5 border-t border-[#E0E0E0] flex flex-wrap items-center justify-between gap-2 text-[10px] text-gray-600 bg-[#F5F5F5]">
        <span>{footerCountText}</span>
        <span className="flex flex-wrap items-center gap-x-4 gap-y-0">
          <span>Enter: Alter</span>
          <span>Space: Select only</span>
          <span>C: Create Master</span>
          <span>D: Delete</span>
          <span>R: Remove Line</span>
          <span>U: Restore Line</span>
          <span>Q: Quit</span>
        </span>
      </div>
    </div>
  );
}
