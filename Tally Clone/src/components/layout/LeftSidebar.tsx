import * as React from 'react';
import { FileText, Globe, Layers, BarChart3, LogOut } from 'lucide-react';
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
    icon: <Layers className="w-3 h-3" />,
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
    icon: <Layers className="w-3 h-3" />,
    view: 'tax-ledgers',
    items: [
      { label: 'Tax Ledgers', view: 'tax-ledgers' },
      { label: 'GST Rates', view: 'gst-rates' },
    ],
  },
  {
    title: 'Inventory Info.',
    icon: <Globe className="w-3 h-3" />,
    view: 'inventory',
    items: [
      { label: 'Stock Groups', view: 'stock-groups' },
      { label: 'Stock Items', view: 'stock-items' },
      { label: 'Units of Measure', view: 'units-list' },
    ],
  },
  {
    title: 'Accounting Vouchers',
    icon: <FileText className="w-3 h-3" />,
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
    icon: <BarChart3 className="w-3 h-3" />,
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

export function LeftSidebar() {
  const activeView = useAppStore((s) => s.activeView);
  const setActiveView = useAppStore((s) => s.setActiveView);
  const isCollapsed = useAppStore((s) => s.isSidebarCollapsed);
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

  // Collapse completely on very small widths
  if (isCollapsed) {
    return null;
  }

  return (
    <aside className="hidden lg:flex w-[220px] min-w-[220px] max-w-[220px] h-full border-r border-tallyBorder bg-gradient-to-b from-white to-[#FFF5F5] shrink-0">
      <div className="flex flex-col h-full w-full">
        <ScrollArea className="flex-1 px-3 pt-3 pb-2 text-[11px]">
          {sectionsFiltered.map((section) => (
            <div key={section.title} className="mb-4">
              <button
                type="button"
                className="flex items-center gap-1 text-[12px] font-bold text-[#7F1D1D] hover:underline"
                onClick={() => setActiveView(section.view)}
              >
                {section.icon}
                <span>{section.title}</span>
              </button>
              <ul className="mt-1 space-y-0.5">
                {section.items.map((item) => (
                  <li key={item.label}>
                    <button
                      type="button"
                      onClick={() => setActiveView(item.view)}
                      className={`tally-list-item w-full text-left pl-5 pr-1 py-0.5 ${
                        activeView === item.view ? 'tally-selected font-semibold' : ''
                      }`}
                      data-selected={activeView === item.view ? 'true' : undefined}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </ScrollArea>
        <div className="border-t border-tallyBorder px-3 py-2 space-y-2">
          <button
            type="button"
            className="w-full inline-flex items-center justify-center gap-1 bg-[#E8E8E8] text-black text-[11px] font-semibold py-1"
          >
            F12: Configure
          </button>
          <button
            type="button"
            className="w-full inline-flex items-center justify-center gap-1 bg-[#DC2626] text-white text-[11px] font-semibold py-1"
            onClick={() => useAppStore.getState().setQuitConfirmOpen(true)}
          >
            <LogOut className="w-3 h-3" />
            <span>Quit</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

