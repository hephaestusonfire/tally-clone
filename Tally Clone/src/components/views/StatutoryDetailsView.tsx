import * as React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { ScrollArea } from '../ui/scroll-area';

export interface StatutoryDetailsItem {
  id: string;
  label: string;
  view: string;
}

const STATUTORY_DETAILS_ITEMS: StatutoryDetailsItem[] = [
  { id: 'company-gst', label: 'Company GST Details', view: 'company-gst-details-creation' },
  { id: 'pan-cin', label: 'PAN / CIN Details', view: 'pan-cin-details-creation' },
];

export function StatutoryDetailsView() {
  const setActiveView = useAppStore((s) => s.setActiveView);
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const itemRefs = React.useRef<(HTMLButtonElement | null)[]>([]);

  const handleSelect = (item: StatutoryDetailsItem) => {
    setActiveView(item.view as ReturnType<typeof useAppStore.getState>['activeView']);
  };

  React.useEffect(() => {
    itemRefs.current[selectedIndex]?.focus();
  }, [selectedIndex]);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setActiveView('master-creation');
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => (i < STATUTORY_DETAILS_ITEMS.length - 1 ? i + 1 : 0));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => (i > 0 ? i - 1 : STATUTORY_DETAILS_ITEMS.length - 1));
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        const item = STATUTORY_DETAILS_ITEMS[selectedIndex];
        if (item) handleSelect(item);
        return;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedIndex]);

  return (
    <div className="flex h-full overflow-hidden bg-white">
      <ScrollArea className="flex-1 min-w-0 p-4">
        <div className="text-[14px] font-bold text-[#7F1D1D] mb-4">
          Create – Statutory Details
        </div>
        <p className="text-[10px] text-gray-600 mb-3">
          Select an item to open its creation screen. No data stored at this level.
        </p>
        <div className="space-y-0.5 max-w-xl">
          {STATUTORY_DETAILS_ITEMS.map((item, i) => (
            <button
              key={item.id}
              ref={(el) => { itemRefs.current[i] = el; }}
              type="button"
              className={`tally-list-item w-full text-left px-3 py-2.5 text-[11px] rounded border border-transparent hover:border-[#D0D0D0] ${
                i === selectedIndex ? 'tally-selected font-medium border-[#D0D0D0] bg-[#E8E8E8]' : ''
              }`}
              data-selected={i === selectedIndex ? 'true' : undefined}
              onClick={() => handleSelect(item)}
            >
              {item.label}
            </button>
          ))}
        </div>
        <p className="text-[10px] text-gray-500 mt-4">
          Esc: List of Masters · ↑↓: Move · Enter: Open
        </p>
      </ScrollArea>
    </div>
  );
}
