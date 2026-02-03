import * as React from 'react';
import { useAppStore } from '../../store/useAppStore';

export interface GatewayItem {
  id: string;
  label: string;
  view: string;
  /** For voucher types: set accountingVoucherTypeId when opening vouchers */
  voucherTypeId?: number;
}

export interface GatewaySection {
  title: string;
  items: GatewayItem[];
}

export const GATEWAY_SECTIONS: GatewaySection[] = [
  {
    title: 'Masters',
    items: [
      { id: 'create', label: 'Create', view: 'master-creation' },
      { id: 'alter', label: 'Alter', view: 'master-alteration' },
      { id: 'coa', label: 'Chart of Accounts', view: 'chart-of-accounts' },
    ],
  },
  {
    title: 'Transactions',
    items: [
      { id: 'vouchers', label: 'Vouchers', view: 'vouchers' },
      { id: 'daybook', label: 'Day Book', view: 'day-book' },
    ],
  },
  {
    title: 'Utilities',
    items: [
      { id: 'banking', label: 'Banking', view: 'banking' },
      { id: 'capital', label: 'Capital', view: 'capital-loan' },
    ],
  },
  {
    title: 'Reports',
    items: [
      { id: 'bs', label: 'Balance Sheet', view: 'balance-sheet' },
      { id: 'pl', label: 'Profit & Loss', view: 'profit-loss' },
      { id: 'stock-summary', label: 'Stock Summary', view: 'stock-summary' },
      { id: 'ratio', label: 'Ratio Analysis', view: 'ratio-analysis' },
      { id: 'dashboard', label: 'Dashboard', view: 'dashboard' },
    ],
  },
  {
    title: 'Quit',
    items: [{ id: 'quit', label: 'Quit', view: '__quit__' }],
  },
];

const FLATTENED_ITEMS: { sectionTitle: string; item: GatewayItem }[] = [];
GATEWAY_SECTIONS.forEach((sec) => {
  sec.items.forEach((item) => FLATTENED_ITEMS.push({ sectionTitle: sec.title, item }));
});

export function GatewayView() {
  const setActiveView = useAppStore((s) => s.setActiveView);
  const setAccountingVoucherTypeId = useAppStore((s) => s.setAccountingVoucherTypeId);
  const setQuitConfirmOpen = useAppStore((s) => s.setQuitConfirmOpen);
  const setMasterAlterationOpenTo = useAppStore((s) => s.setMasterAlterationOpenTo);

  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const listRef = React.useRef<HTMLDivElement>(null);

  const selectAndAct = (idx: number) => {
    const { item } = FLATTENED_ITEMS[idx];
    if (item.view === '__quit__') {
      setQuitConfirmOpen(true);
      return;
    }
    if (item.voucherTypeId != null) {
      setAccountingVoucherTypeId(item.voucherTypeId);
    }
    if (item.id === 'alter') {
      setMasterAlterationOpenTo('ledger');
    }
    setActiveView(item.view);
  };

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => (i < FLATTENED_ITEMS.length - 1 ? i + 1 : 0));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => (i > 0 ? i - 1 : FLATTENED_ITEMS.length - 1));
        return;
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        selectAndAct(selectedIndex);
        return;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedIndex]);

  React.useEffect(() => {
    listRef.current?.querySelector(`[data-index="${selectedIndex}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [selectedIndex]);

  return (
    <div className="flex h-full flex-col overflow-auto bg-[#FEF2F2] p-6" ref={listRef}>
      <div className="mb-4 text-[14px] font-bold text-[#7F1D1D]">
        Gateway of Tally
      </div>
      <div className="flex flex-col gap-6">
        {GATEWAY_SECTIONS.map((section) => (
          <div key={section.title}>
            <div className="mb-1 text-[11px] font-bold text-[#7F1D1D]">
              {section.title}
            </div>
            <ul className="space-y-0">
              {section.items.map((item) => {
                const flatIdx = FLATTENED_ITEMS.findIndex((f) => f.item.id === item.id && f.sectionTitle === section.title);
                const isSelected = flatIdx >= 0 && selectedIndex === flatIdx;
                return (
                  <li key={item.id}>
                    <button
                      type="button"
                      data-index={flatIdx}
                      className={`w-full text-left px-3 py-1.5 text-[12px] border-l-4 ${
                        isSelected
                          ? 'bg-[#FFD700] border-[#7F1D1D] font-semibold text-[#7F1D1D]'
                          : 'border-transparent hover:bg-[#FEE2E2] text-[#333]'
                      }`}
                      onClick={() => {
                        setSelectedIndex(flatIdx);
                        selectAndAct(flatIdx);
                      }}
                      onFocus={() => setSelectedIndex(flatIdx)}
                    >
                      {item.label}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </div>
      <div className="mt-6 text-[10px] text-[#666] border-t border-[#D0D0D0] pt-3">
        ↑↓ Select · Enter Open · Esc Back
      </div>
    </div>
  );
}
