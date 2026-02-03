import * as React from 'react';
import { ChevronDown, ChevronRight, Search } from 'lucide-react';
import { cn } from '../../lib/utils';
import { usePrintStore } from '../../store/usePrintStore';
import { ScrollArea } from '../ui/scroll-area';

const INITIAL_VISIBLE_ITEMS = 5;

export function PrintReportSelectorModal() {
  const isOpen = usePrintStore((s) => s.printReportOpen);
  const close = usePrintStore((s) => s.closePrintReport);
  const getReportCategories = usePrintStore((s) => s.getReportCategories);
  const setExpandAll = usePrintStore((s) => s.setExpandAll);
  const expandAll = usePrintStore((s) => s.expandAll);
  const showMore = usePrintStore((s) => s.showMore);
  const setShowMore = usePrintStore((s) => s.setShowMore);
  const executePrint = usePrintStore((s) => s.executePrint);

  const [search, setSearch] = React.useState('');
  const [expanded, setExpanded] = React.useState<Set<string>>(new Set(getReportCategories().map((c) => c.id)));
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const categories = getReportCategories();
  const filteredCategories = React.useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.trim().toLowerCase();
    return categories
      .map((cat) => ({
        ...cat,
        items: cat.items.filter((i) => i.label.toLowerCase().includes(q)),
      }))
      .filter((cat) => cat.items.length > 0);
  }, [categories, search]);

  const flatList = React.useMemo(() => {
    const list: { type: 'category' | 'item'; id: string; label: string; view?: string }[] = [];
    filteredCategories.forEach((cat) => {
      const isExpanded = expanded.has(cat.id);
      list.push({ type: 'category', id: cat.id, label: cat.label });
      if (isExpanded) {
        const items = showMore ? cat.items : cat.items.slice(0, INITIAL_VISIBLE_ITEMS);
        items.forEach((i) => list.push({ type: 'item', id: i.id, label: i.label, view: i.view }));
      }
    });
    return list;
  }, [filteredCategories, expanded, showMore]);

  const selectableItems = flatList.filter((x): x is { type: 'item'; id: string; label: string; view: string } => x.type === 'item');
  const currentItem = selectableItems[selectedIndex];

  React.useEffect(() => {
    if (isOpen) {
      setExpanded(new Set(getReportCategories().map((c) => c.id)));
      setSelectedIndex(0);
      setSearch('');
    }
  }, [isOpen, getReportCategories]);

  React.useEffect(() => {
    setSelectedIndex(0);
  }, [search, expanded, showMore]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      close();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => (i < selectableItems.length - 1 ? i + 1 : 0));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => (i > 0 ? i - 1 : selectableItems.length - 1));
      return;
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      const item = selectableItems[selectedIndex];
      if (item?.view) {
        executePrint(item.view);
        close();
      }
      return;
    }
  };

  const toggleCategory = (id: string) => {
    setExpanded((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleExpandAll = () => {
    const nextExpandAll = !expandAll;
    setExpandAll(nextExpandAll);
    setExpanded(nextExpandAll ? new Set(filteredCategories.map((c) => c.id)) : new Set());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#808080]/60 text-[11px]">
      <div
        className="flex w-full max-w-lg max-h-[85vh] flex-col border border-[#D0D0D0] bg-white shadow-lg rounded-sm overflow-hidden"
        onKeyDown={handleKeyDown}
      >
        <div className="border-b border-[#D0D0D0] bg-[#FFD700] px-4 py-2 text-[12px] font-bold text-[#7F1D1D]">
          Print Report
        </div>
        <div className="p-2 border-b border-[#D0D0D0] flex items-center gap-2">
          <Search className="w-4 h-4 text-gray-500 flex-shrink-0" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search reports..."
            className="flex-1 min-w-0 border border-[#D0D0D0] px-2 py-1.5 text-[11px] rounded"
          />
        </div>
        <div className="flex items-center gap-4 px-3 py-2 border-b border-[#D0D0D0] bg-[#F5F5F5] text-[10px]">
          <button
            type="button"
            className="text-[#DC2626] hover:underline font-medium"
            onClick={handleExpandAll}
          >
            {expandAll ? 'Collapse All' : 'Expand All'}
          </button>
          <button
            type="button"
            className="text-[#DC2626] hover:underline font-medium"
            onClick={() => setShowMore(!showMore)}
          >
            {showMore ? 'Show Less' : 'Show More'}
          </button>
        </div>
        <ScrollArea className="flex-1 min-h-0 p-2">
          <div className="space-y-0.5">
            {filteredCategories.map((cat) => {
              const isExpanded = expanded.has(cat.id);
              return (
                <div key={cat.id}>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-1.5 hover:bg-[#FEF2F2] font-semibold text-[#7F1D1D] flex items-center gap-1"
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
                      {(showMore ? cat.items : cat.items.slice(0, INITIAL_VISIBLE_ITEMS)).map((item) => {
                        const isSelected = currentItem?.id === item.id;
                        return (
                          <button
                            key={item.id}
                            type="button"
                            className={cn(
                              'w-full text-left px-3 py-1.5 text-[11px] hover:bg-[#FEF2F2]',
                              isSelected && 'bg-[#FEF2F2] font-medium'
                            )}
                            onClick={() => {
                              if (item.view) {
                                executePrint(item.view);
                                close();
                              }
                            }}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                      {!showMore && cat.items.length > INITIAL_VISIBLE_ITEMS && (
                        <button
                          type="button"
                          className="w-full text-left px-3 py-1 text-[10px] text-[#DC2626] hover:underline"
                          onClick={() => setShowMore(true)}
                        >
                          Show more ({cat.items.length - INITIAL_VISIBLE_ITEMS} more)
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </ScrollArea>
        <div className="flex justify-end gap-2 px-4 py-2 border-t border-[#D0D0D0] bg-[#F5F5F5]">
          <button
            type="button"
            className="text-[11px] text-gray-600 hover:underline"
            onClick={close}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
