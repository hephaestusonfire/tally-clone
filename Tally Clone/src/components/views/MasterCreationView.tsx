import * as React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { ScrollArea } from '../ui/scroll-area';
import { useAppStore } from '../../store/useAppStore';
import {
  MASTER_CATEGORIES,
  getVisibleItems,
  hasMoreItems,
  type MasterItem,
} from '../../store/masterCreation';
import { MasterCreationFormModal } from '../modals/MasterCreationFormModal';
import { CurrencyGuardModal } from '../modals/CurrencyGuardModal';

export function MasterCreationView() {
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set(MASTER_CATEGORIES.map((c) => c.id)));
  const [showMore, setShowMore] = React.useState<Record<string, boolean>>({});
  const showInactive = useAppStore((s) => s.showInactive);
  const setShowInactive = useAppStore((s) => s.setShowInactive);
  const [selectedMaster, setSelectedMaster] = React.useState<MasterItem | null>(null);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [showCurrencyGuardModal, setShowCurrencyGuardModal] = React.useState(false);
  const itemRefs = React.useRef<Map<number, HTMLButtonElement | null>>(new Map());
  const toggleCompanyModal = useAppStore((s) => s.toggleCompanyModal);
  const getBaseCurrency = useAppStore((s) => s.getBaseCurrency);
  const setCurrencyFormEditingId = useAppStore((s) => s.setCurrencyFormEditingId);
  const isGstEnabled = useAppStore((s) => s.isGstEnabled);

  const flatItems: { catId: string; item: MasterItem }[] = React.useMemo(() => {
    const out: { catId: string; item: MasterItem }[] = [];
    const gstOn = isGstEnabled();
    MASTER_CATEGORIES.forEach((cat) => {
      if (!expanded.has(cat.id)) return;
      let items = cat.items;
      if (!gstOn) {
        items = items.filter(
          (i) => i.formType !== 'gst-registration' && i.formType !== 'gst-classification'
        );
      }
      const visible = getVisibleItems(items, showMore[cat.id] ?? true, showInactive);
      visible.forEach((item) => out.push({ catId: cat.id, item }));
    });
    return out;
  }, [expanded, showMore, showInactive, isGstEnabled]);

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

  const setActiveView = useAppStore((s) => s.setActiveView);

  const handleSelect = (item: MasterItem) => {
    if (!item.formType || item.formType === 'placeholder') return;
    if (item.formType === 'group') {
      setActiveView('group-creation');
      return;
    }
    if (item.formType === 'ledger') {
      setActiveView('ledger-creation');
      return;
    }
    if (item.formType === 'multiple-ledgers') {
      setActiveView('multiple-ledgers');
      return;
    }
    if (item.formType === 'currency') {
      if (getBaseCurrency()) {
        setShowCurrencyGuardModal(true);
      } else {
        setActiveView('currency-creation');
      }
      return;
    }
    if (item.formType === 'voucher-type') {
      setActiveView('voucher-type-creation');
      return;
    }
    if (item.formType === 'credit-limits') {
      setActiveView('credit-limits-creation');
      return;
    }
    if (item.formType === 'scenario') {
      setActiveView('scenario-creation');
      return;
    }
    if (item.formType === 'stock-group') {
      setActiveView('stock-group-creation');
      return;
    }
    if (item.formType === 'stock-category') {
      setActiveView('stock-category-creation');
      return;
    }
    if (item.formType === 'stock-item') {
      setActiveView('stock-item-creation');
      return;
    }
    if (item.formType === 'unit') {
      setActiveView('units-list');
      return;
    }
    if (item.formType === 'godown') {
      setActiveView('godown-creation');
      return;
    }
    if (item.formType === 'gst-registration') {
      setActiveView('gst-registration-creation');
      return;
    }
    if (item.formType === 'gst-classification') {
      setActiveView('gst-classification-creation');
      return;
    }
    if (item.formType === 'statutory-details') {
      setActiveView('statutory-details');
      return;
    }
    setSelectedMaster(item);
  };

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedMaster(null);
      if (e.key === 'F3') {
        e.preventDefault();
        toggleCompanyModal();
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => (i < flatItems.length - 1 ? i + 1 : 0));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => (i > 0 ? i - 1 : flatItems.length - 1));
      }
      if (e.key === 'Enter' && flatItems[selectedIndex]) {
        e.preventDefault();
        handleSelect(flatItems[selectedIndex].item);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [flatItems, selectedIndex, toggleCompanyModal]);

  React.useEffect(() => {
    const el = selectedIndex >= 0 && flatItems[selectedIndex] ? itemRefs.current.get(selectedIndex) : null;
    if (el) el.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [selectedIndex, flatItems.length]);

  return (
    <div className="flex h-full overflow-hidden">
      <div className="flex-1 min-w-0 flex flex-col bg-white overflow-auto p-4">
        <div className="text-[14px] font-bold text-[#7F1D1D] mb-4">
          Create Master
        </div>
        <div className="flex items-center gap-4 mb-3 text-[10px]">
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
        <ScrollArea className="flex-1 border border-[#D0D0D0] rounded">
          <div className="p-2 space-y-1">
            {MASTER_CATEGORIES.map((cat) => {
              const isExpanded = expanded.has(cat.id);
              const catShowMore = showMore[cat.id] ?? true;
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
                        const isSelected = flatItems[selectedIndex]?.item.id === item.id && flatItems[selectedIndex]?.catId === cat.id;
                        return (
                          <button
                            key={item.id}
                            ref={(el) => { if (idx >= 0) itemRefs.current.set(idx, el); }}
                            type="button"
                            className={`tally-list-item w-full text-left px-3 py-1.5 text-[11px] rounded ${
                              isSelected ? 'tally-selected font-medium' : ''
                            } ${item.inactive ? 'text-gray-500' : ''}`}
                            data-selected={isSelected ? 'true' : undefined}
                            onClick={() => handleSelect(item)}
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
      </div>
      {selectedMaster && (
        <MasterCreationFormModal
          master={selectedMaster}
          onClose={() => setSelectedMaster(null)}
        />
      )}
      {showCurrencyGuardModal && (
        <CurrencyGuardModal
          onCreateNew={() => {
            setShowCurrencyGuardModal(false);
            setCurrencyFormEditingId(null);
            setActiveView('currency-creation');
          }}
          onAlterExisting={() => {
            const base = getBaseCurrency();
            if (base) {
              setShowCurrencyGuardModal(false);
              setCurrencyFormEditingId(base.id);
              setActiveView('currency-creation');
            }
          }}
          onClose={() => setShowCurrencyGuardModal(false)}
        />
      )}
    </div>
  );
}
