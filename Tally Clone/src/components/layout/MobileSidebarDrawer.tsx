import * as React from 'react';
import { FileText, Globe, Layers, BarChart3, LogOut, X } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { ScrollArea } from '../ui/scroll-area';

interface NavItem {
  label: string;
  view: string;
}

interface NavSection {
  title: string;
  icon?: React.ReactNode;
  view: string;
  items: NavItem[];
}

const sections: NavSection[] = [
  {
    title: 'Masters',
    icon: <Layers className="w-4 h-4" />,
    view: 'masters',
    items: [
      { label: 'Chart of Accounts', view: 'chart-of-accounts' },
      { label: 'Multiple Ledgers', view: 'multiple-ledgers' },
      { label: 'Cost Centres', view: 'cost-centres' },
      { label: 'Currencies', view: 'currencies-list' },
    ],
  },
  {
    title: 'Statutory Masters',
    icon: <Layers className="w-4 h-4" />,
    view: 'tax-ledgers',
    items: [
      { label: 'Tax Ledgers', view: 'tax-ledgers' },
      { label: 'GST Rates', view: 'gst-rates' },
    ],
  },
  {
    title: 'Inventory Info.',
    icon: <Globe className="w-4 h-4" />,
    view: 'inventory',
    items: [
      { label: 'Stock Groups', view: 'stock-groups' },
      { label: 'Stock Items', view: 'stock-items' },
      { label: 'Units of Measure', view: 'units-list' },
    ],
  },
  {
    title: 'Accounting Vouchers',
    icon: <FileText className="w-4 h-4" />,
    view: 'vouchers',
    items: [
      { label: 'Sales', view: 'sales' },
      { label: 'Purchase', view: 'purchase' },
      { label: 'Payment', view: 'payment' },
      { label: 'Receipt', view: 'receipt' },
      { label: 'Journal', view: 'journal' },
    ],
  },
  {
    title: 'Reports',
    icon: <BarChart3 className="w-4 h-4" />,
    view: 'trial-balance',
    items: [
      { label: 'Trial Balance', view: 'trial-balance' },
      { label: 'Balance Sheet', view: 'balance-sheet' },
      { label: 'Profit & Loss A/c', view: 'profit-loss' },
      { label: 'Cash Flow', view: 'cash-flow' },
      { label: 'Ratio Analysis', view: 'ratio-analysis' },
      { label: 'Monthly Summary', view: 'monthly-summary' },
      { label: 'Day Book', view: 'day-book' },
      { label: 'Voucher Register', view: 'voucher-register' },
      { label: 'Ledger Vouchers', view: 'ledger-vouchers' },
    ],
  },
];

/** Mobile slide-out drawer with same nav as LeftSidebar. Visible only on lg:hidden. */
export function MobileSidebarDrawer() {
  const activeView = useAppStore((s) => s.activeView);
  const setActiveView = useAppStore((s) => s.setActiveView);
  const mobileSidebarOpen = useAppStore((s) => s.mobileSidebarOpen);
  const setMobileSidebarOpen = useAppStore((s) => s.setMobileSidebarOpen);
  const isGstEnabled = useAppStore((s) => s.isGstEnabled);

  const sectionsFiltered = React.useMemo(() => {
    const gstOn = isGstEnabled();
    return sections.map((section) => ({
      ...section,
      items: gstOn
        ? section.items
        : section.items.filter((item) => item.view !== 'gst-rates'),
    }));
  }, [isGstEnabled]);

  const handleSelect = (view: string) => {
    setActiveView(view as Parameters<typeof setActiveView>[0]);
    setMobileSidebarOpen(false);
  };

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && mobileSidebarOpen) {
        setMobileSidebarOpen(false);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [mobileSidebarOpen, setMobileSidebarOpen]);

  if (!mobileSidebarOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-[9998] bg-black/50 lg:hidden"
        role="button"
        tabIndex={0}
        onClick={() => setMobileSidebarOpen(false)}
        onKeyDown={(e) => e.key === 'Enter' && setMobileSidebarOpen(false)}
        aria-label="Close menu"
      />
      <aside
        className="fixed left-0 top-0 bottom-0 z-[9999] w-[280px] max-w-[85vw] bg-white border-r border-[#D0D0D0] shadow-xl lg:hidden flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-[#D0D0D0] bg-[#7F1D1D] text-white">
          <span className="font-bold text-[14px]">Menu</span>
          <button
            type="button"
            onClick={() => setMobileSidebarOpen(false)}
            className="p-2 -m-2 rounded bg-white/20 hover:bg-white/30 touch-manipulation min-h-[44px] min-w-[44px] flex items-center justify-center"
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <ScrollArea className="flex-1 px-4 pt-4 pb-4 text-[13px]">
          {sectionsFiltered.map((section) => (
            <div key={section.title} className="mb-5">
              <button
                type="button"
                className="flex items-center gap-2 text-[14px] font-bold text-[#7F1D1D] mb-2"
                onClick={() => handleSelect(section.view)}
              >
                {section.icon}
                <span>{section.title}</span>
              </button>
              <ul className="space-y-1 pl-6">
                {section.items.map((item) => (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={() => handleSelect(item.view)}
                      className={`w-full text-left py-3 px-3 -mx-3 rounded min-h-[44px] flex items-center touch-manipulation ${
                        activeView === item.view
                          ? 'bg-[#FEE2E2] font-semibold text-[#7F1D1D] border-l-2 border-[#DC2626] pl-4'
                          : 'hover:bg-[#FEF2F2]'
                      }`}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </ScrollArea>
        <div className="border-t border-[#D0D0D0] px-4 py-3 space-y-2">
          <button
            type="button"
            className="w-full min-h-[44px] flex items-center justify-center gap-1 bg-[#E8E8E8] text-black text-[13px] font-semibold rounded touch-manipulation"
          >
            F12: Configure
          </button>
          <button
            type="button"
            className="w-full min-h-[44px] flex items-center justify-center gap-1 bg-[#DC2626] text-white text-[13px] font-semibold rounded touch-manipulation"
            onClick={() => {
              useAppStore.getState().setQuitConfirmOpen(true);
              setMobileSidebarOpen(false);
            }}
          >
            <LogOut className="w-4 h-4" />
            <span>Quit</span>
          </button>
        </div>
      </aside>
    </>
  );
}
