import * as React from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  MASTER_CATEGORIES_ALTER,
  getVisibleItems,
  hasMoreItems,
  type MasterItem,
} from '../../store/masterCreation';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

export function ListOfMastersPopup() {
  const isOpen = useAppStore((s) => s.listOfMastersPopupOpen);
  const setListOfMastersPopupOpen = useAppStore((s) => s.setListOfMastersPopupOpen);
  const setActiveView = useAppStore((s) => s.setActiveView);
  const setMasterAlterationOpenTo = useAppStore((s) => s.setMasterAlterationOpenTo);
  const toggleCompanyModal = useAppStore((s) => s.toggleCompanyModal);
  const isGstEnabled = useAppStore((s) => s.isGstEnabled);

  const showInactive = useAppStore((s) => s.showInactive);
  const setShowInactive = useAppStore((s) => s.setShowInactive);
  const [showMore, setShowMore] = React.useState<Record<string, boolean>>({});
  const [expanded, setExpanded] = React.useState<Set<string>>(() =>
    new Set(MASTER_CATEGORIES_ALTER.map((c) => c.id))
  );
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const itemRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const categoriesFiltered = React.useMemo(() => {
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

  const flatItems: { catId: string; item: MasterItem }[] = React.useMemo(() => {
    const out: { catId: string; item: MasterItem }[] = [];
    categoriesFiltered.forEach((cat) => {
      if (!expanded.has(cat.id)) return;
      const visible = getVisibleItems(cat.items, showMore[cat.id] ?? true, showInactive);
      visible.forEach((item) => out.push({ catId: cat.id, item }));
    });
    return out;
  }, [categoriesFiltered, expanded, showMore, showInactive]);

  const selectedItem = flatItems[selectedIndex];

  const openMasterList = React.useCallback(() => {
    if (!selectedItem?.item.id) return;
    const formType = selectedItem.item.formType;
    if (formType === 'stock-item') {
      setActiveView('list-of-stock-items');
      setListOfMastersPopupOpen(false);
      return;
    }
    if (formType === 'stock-category') {
      setActiveView('list-of-stock-categories');
      setListOfMastersPopupOpen(false);
      return;
    }
    setMasterAlterationOpenTo(selectedItem.item.id);
    setActiveView('master-alteration');
    setListOfMastersPopupOpen(false);
  }, [selectedItem, setMasterAlterationOpenTo, setActiveView, setListOfMastersPopupOpen]);

  React.useEffect(() => {
    if (!isOpen) return;
    setSelectedIndex(0);
  }, [isOpen]);

  React.useEffect(() => {
    setSelectedIndex((i) => (i >= flatItems.length ? Math.max(0, flatItems.length - 1) : i));
  }, [flatItems.length]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setListOfMastersPopupOpen(false);
        return;
      }
      if (e.key === 'Enter' && selectedItem) {
        e.preventDefault();
        openMasterList();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => (i < flatItems.length - 1 ? i + 1 : 0));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => (i > 0 ? i - 1 : flatItems.length - 1));
        return;
      }
      if (e.key === 'F3') {
        e.preventDefault();
        toggleCompanyModal();
        return;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, flatItems.length, selectedItem, openMasterList, setListOfMastersPopupOpen, toggleCompanyModal]);

  React.useEffect(() => {
    const el = itemRefs.current[selectedIndex];
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selectedIndex]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div
        className="bg-[#E8E8E8] border border-[#D0D0D0] min-w-[400px] max-w-[480px] max-h-[85vh] flex flex-col shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="list-of-masters-title"
      >
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#D0D0D0] bg-[#E0E0E0]">
          <h2 id="list-of-masters-title" className="text-[14px] font-bold text-[#7F1D1D]">
            List of Masters
          </h2>
          <div className="flex items-center gap-3">
            <Button
              size="sm"
              variant="outline"
              className="text-[10px] h-7"
              onClick={toggleCompanyModal}
            >
              Change Company
            </Button>
            <label className="flex items-center gap-1.5 cursor-pointer text-[10px]">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="border border-[#808080]"
              />
              Show Inactive
            </label>
          </div>
        </div>

        <ScrollArea className="flex-1 p-2">
          <div className="space-y-0.5">
            {categoriesFiltered.map((cat) => {
              const isCatExpanded = expanded.has(cat.id);
              const showMoreCat = showMore[cat.id] ?? true;
              const visible = getVisibleItems(cat.items, showMoreCat, showInactive);
              const hasMore = hasMoreItems(cat.items, showMoreCat, showInactive);
              return (
                <div key={cat.id}>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 text-[12px] font-bold text-[#7F1D1D] hover:underline border border-transparent hover:border-[#D0D0D0] rounded"
                    onClick={() =>
                      setExpanded((s) => {
                        const next = new Set(s);
                        if (next.has(cat.id)) next.delete(cat.id);
                        else next.add(cat.id);
                        return next;
                      })
                    }
                  >
                    {isCatExpanded ? '▼' : '▶'} {cat.label}
                  </button>
                  {isCatExpanded && (
                    <div className="pl-4 pb-1">
                      {visible.map((item) => {
                        const idx = flatItems.findIndex(
                          (f) => f.item.id === item.id && f.catId === cat.id
                        );
                        const isSelected = flatItems[selectedIndex]?.item.id === item.id
                          && flatItems[selectedIndex]?.catId === cat.id;
                        return (
                          <button
                            key={item.id}
                            ref={(el) => {
                              if (idx >= 0) itemRefs.current[idx] = el;
                            }}
                            type="button"
                            className={`tally-list-item w-full text-left px-3 py-1.5 text-[11px] rounded border border-transparent hover:border-[#D0D0D0] ${
                              isSelected ? 'tally-selected font-medium bg-[#E0E0E0] border-[#D0D0D0]' : ''
                            } ${item.inactive ? 'text-gray-500 italic' : ''}`}
                            data-selected={isSelected ? 'true' : undefined}
                            onClick={() => {
                              setSelectedIndex(idx);
                              if (item.id && item.formType) {
                                if (item.formType === 'stock-item') {
                                  setActiveView('list-of-stock-items');
                                  setListOfMastersPopupOpen(false);
                                } else if (item.formType === 'stock-category') {
                                  setActiveView('list-of-stock-categories');
                                  setListOfMastersPopupOpen(false);
                                } else {
                                  setMasterAlterationOpenTo(item.id);
                                  setActiveView('master-alteration');
                                  setListOfMastersPopupOpen(false);
                                }
                              }
                            }}
                            onDoubleClick={() => {
                              if (item.id && item.formType) {
                                if (item.formType === 'stock-item') {
                                  setActiveView('list-of-stock-items');
                                  setListOfMastersPopupOpen(false);
                                } else if (item.formType === 'stock-category') {
                                  setActiveView('list-of-stock-categories');
                                  setListOfMastersPopupOpen(false);
                                } else {
                                  setMasterAlterationOpenTo(item.id);
                                  setActiveView('master-alteration');
                                  setListOfMastersPopupOpen(false);
                                }
                              }
                            }}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                      {hasMore && (
                        <button
                          type="button"
                          className="w-full text-left px-3 py-1 text-[10px] text-[#DC2626] hover:underline"
                          onClick={() =>
                            setShowMore((s) => ({ ...s, [cat.id]: !showMoreCat }))
                          }
                        >
                          {showMoreCat ? 'Show Less' : 'Show More'}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>

        <div className="px-3 py-2 border-t border-[#D0D0D0] bg-[#F5F5F5] text-[10px] text-gray-600">
          ↑↓ Move · Enter Open master list · Esc Close (return to Chart of Accounts)
        </div>
      </div>
    </div>
  );
}
