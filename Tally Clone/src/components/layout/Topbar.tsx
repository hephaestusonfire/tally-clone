import * as React from 'react';
import ReactDOM from 'react-dom';
import { X, ChevronDown, ChevronLeft, ChevronRight, Menu } from 'lucide-react';
import { useAppStore } from '../../store/useAppStore';
import { DropdownMenu, DropdownMenuItem } from '../ui/dropdown-menu';
import { PrintMenu } from '../PrintMenu';
import { ShareMenu } from '../ShareMenu';
import { GATEWAY_SECTIONS, type GatewayItem } from '../views/GatewayView';

function getTitle(view: string): string {
  if (view === 'gateway') return 'Gateway of Tally';
  if (view === 'sales') return 'Sales';
  if (view === 'vouchers') return 'Accounting Voucher Creation';
  if (view === 'purchase') return 'Purchase';
  if (view === 'payment') return 'Payment';
  if (view === 'receipt') return 'Receipt';
  if (view === 'journal') return 'Journal';
  if (view === 'masters') return 'Ledger Alteration';
  if (view === 'reports') return 'Display More Reports';
  if (view === 'trial-balance') return 'Trial Balance';
  if (view === 'balance-sheet') return 'Balance Sheet';
  if (view === 'profit-loss') return 'Profit & Loss A/c';
  if (view === 'cash-flow') return 'Cash Flow';
  if (view === 'ratio-analysis') return 'Ratio Analysis';
  if (view === 'monthly-summary') return 'Monthly Summary';
  if (view === 'day-book') return 'Day Book';
  if (view === 'voucher-register') return 'Voucher Register';
  if (view === 'ledger-vouchers') return 'Ledger Vouchers';
  if (view === 'tax-ledgers') return 'Tax Ledgers';
  if (view === 'gst-rates') return 'GST Rates';
  if (view === 'stock-groups' || view === 'stock-items') return 'Stock Masters';
  if (view === 'master-creation') return 'Create Master';
  if (view === 'master-alteration') return 'Master Alteration';
  if (view === 'group-creation') return 'Group Creation';
  if (view === 'ledger-creation') return 'Ledger Creation';
  if (view === 'currency-creation') return 'Currency Creation';
  if (view === 'voucher-type-creation') return 'Voucher Type Creation';
  if (view === 'credit-limits-creation') return 'Credit Limits';
  if (view === 'scenario-creation') return 'Scenario Creation';
  if (view === 'stock-group-creation') return 'Stock Group Creation';
  if (view === 'stock-category-creation') return 'Stock Category Creation';
  if (view === 'stock-item-creation') return 'Stock Item Creation';
  if (view === 'units-list') return 'Units of Measure';
  if (view === 'unit-creation') return 'Unit Creation';
  if (view === 'godown-creation') return 'Godown Creation';
  if (view === 'gst-registration-creation') return 'GST Registration Creation';
  if (view === 'gst-classification-creation') return 'GST Classification Creation';
  if (view === 'statutory-details') return 'Create – Statutory Details';
  if (view === 'company-gst-details-creation') return 'Create – Company GST Details';
  if (view === 'pan-cin-details-creation') return 'Create – PAN / CIN Details';
  if (view === 'chart-of-accounts') return 'Chart of Accounts';
  if (view === 'multiple-ledgers') return 'Multiple Ledgers';
  if (view === 'cost-centres') return 'Cost Centres';
  if (view === 'cost-centre-creation') return 'Cost Centre Creation';
  if (view === 'currencies-list') return 'Currencies';
  if (view === 'list-of-stock-items') return 'Chart of Accounts – List of Stock Items';
  if (view === 'list-of-stock-categories') return 'Chart of Accounts – List of Stock Categories';
  if (view === 'dashboard') return 'Dashboard';
  if (view === 'whatsapp-inbox') return 'WhatsApp Inbox';
  if (view === 'whatsapp-numbers') return 'WhatsApp Nos.';
  return 'Gateway of Tally';
}

export function Topbar() {
  const companyName = useAppStore((s) => s.companyName);
  const date = useAppStore((s) => s.date);
  const activeView = useAppStore((s) => s.activeView);
  const setActiveView = useAppStore((s) => s.setActiveView);
  const setAccountingVoucherTypeId = useAppStore((s) => s.setAccountingVoucherTypeId);
  const setQuitConfirmOpen = useAppStore((s) => s.setQuitConfirmOpen);
  const setMasterAlterationOpenTo = useAppStore((s) => s.setMasterAlterationOpenTo);
  const canGoBack = useAppStore((s) => s.canGoBack);
  const canGoForward = useAppStore((s) => s.canGoForward);
  const goBack = useAppStore((s) => s.goBack);
  const goForward = useAppStore((s) => s.goForward);
  const setMobileSidebarOpen = useAppStore((s) => s.setMobileSidebarOpen);

  const [gatewayOpen, setGatewayOpen] = React.useState(false);
  const gatewayRef = React.useRef<HTMLDivElement>(null);
  const [dropdownRect, setDropdownRect] = React.useState<{ top: number; left: number } | null>(null);

  const onGatewaySelect = React.useCallback(
    (item: GatewayItem) => {
      if (item.view === '__quit__') {
        setQuitConfirmOpen(true);
      } else {
        if (item.voucherTypeId != null) setAccountingVoucherTypeId(item.voucherTypeId);
        if (item.id === 'alter') setMasterAlterationOpenTo('ledger');
        setActiveView(item.view);
      }
      setGatewayOpen(false);
      setDropdownRect(null);
    },
    [setActiveView, setAccountingVoucherTypeId, setQuitConfirmOpen, setMasterAlterationOpenTo]
  );

  const onGatewayToggle = React.useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const next = !gatewayOpen;
    setGatewayOpen(next);
    if (next && gatewayRef.current) {
      const r = gatewayRef.current.getBoundingClientRect();
      setDropdownRect({ top: r.bottom + 2, left: r.left });
    } else {
      setDropdownRect(null);
    }
  }, [gatewayOpen]);

  React.useEffect(() => {
    if (!gatewayOpen) return;
    const handler = (e: MouseEvent) => {
      if (gatewayRef.current && !gatewayRef.current.contains(e.target as Node)) {
        setGatewayOpen(false);
        setDropdownRect(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [gatewayOpen]);

  return (
    <header className="relative z-50 min-h-[44px] sm:min-h-[42px] sm:max-h-[42px] w-full bg-[#7F1D1D] text-white flex flex-wrap items-center justify-center sm:justify-start gap-x-2 sm:gap-x-0 px-2 sm:px-4 py-1 sm:py-0 border-b border-black/40 select-none overflow-visible">
      {/* Left section (priority on mobile): Hamburger + Back/Forward + Gateway + title */}
      <div className="flex items-center justify-center sm:justify-start gap-1 sm:gap-2 flex-1 min-w-0 min-h-[44px] sm:min-h-0 order-1 shrink-0 basis-auto lg:basis-0">
        <button
          type="button"
          onClick={() => setMobileSidebarOpen(true)}
          className="lg:hidden flex items-center justify-center w-10 h-10 sm:w-9 sm:h-9 shrink-0 rounded bg-[#FFD700] text-[#7F1D1D] border border-[#7F1D1D]/30 hover:bg-[#FFE44D] active:scale-95 transition-all touch-manipulation"
          aria-label="Open menu"
          title="Menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-0.5 sm:gap-1 shrink-0">
          <button
            type="button"
            onClick={() => goBack()}
            disabled={!canGoBack()}
            className="flex items-center justify-center w-9 h-9 sm:w-8 sm:h-8 rounded bg-[#FFD700] text-[#7F1D1D] border border-[#7F1D1D]/30 disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:bg-[#FFE44D] active:enabled:scale-95 transition-all touch-manipulation"
            title="Back"
            aria-label="Back to previous page"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={() => goForward()}
            disabled={!canGoForward()}
            className="flex items-center justify-center w-9 h-9 sm:w-8 sm:h-8 rounded bg-[#FFD700] text-[#7F1D1D] border border-[#7F1D1D]/30 disabled:opacity-40 disabled:cursor-not-allowed hover:enabled:bg-[#FFE44D] active:enabled:scale-95 transition-all touch-manipulation"
            title="Forward"
            aria-label="Forward to next page"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
        <span className="w-px h-6 bg-white/50 shrink-0" />
        <div className="relative shrink-0" ref={gatewayRef}>
          <button
            type="button"
            onClick={onGatewayToggle}
            className="flex items-center gap-1 px-3 py-2 sm:px-2 sm:py-1 rounded hover:bg-white/15 text-[12px] font-bold min-h-[40px] sm:min-h-0 touch-manipulation"
            aria-expanded={gatewayOpen}
            aria-haspopup="true"
          >
            Gateway of Tally
            <ChevronDown className={`w-3 h-3 transition-transform shrink-0 ${gatewayOpen ? 'rotate-180' : ''}`} />
          </button>
          {gatewayOpen && dropdownRect && typeof document !== 'undefined' && document.body &&
            ReactDOM.createPortal(
              <div
                className="fixed min-w-[200px] max-h-[70vh] overflow-auto bg-white text-black border border-[#D0D0D0] shadow-lg rounded-sm py-1"
                style={{
                  top: dropdownRect.top,
                  left: dropdownRect.left,
                  zIndex: 9999,
                }}
                onMouseDown={(e) => e.stopPropagation()}
              >
                {GATEWAY_SECTIONS.map((section) => (
                  <div key={section.title} className="py-0.5">
                    <div className="px-3 py-1 text-[10px] font-bold text-[#7F1D1D] uppercase tracking-wide">
                      {section.title}
                    </div>
                    {section.items.map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => onGatewaySelect(item)}
                        className="w-full text-left px-4 py-3 sm:py-1.5 text-[12px] sm:text-[11px] hover:bg-[#FEF2F2] text-[#333] min-h-[44px] sm:min-h-0 touch-manipulation"
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                ))}
              </div>,
              document.body
            )
          }
        </div>
        <span className="w-px h-6 bg-white/70 shrink-0" />
        <span className="font-bold text-[14px] truncate min-w-0">
          {getTitle(activeView)}
        </span>
        <span className="w-px h-6 bg-white/70 shrink-0" />
        <span className="text-[11px] font-semibold truncate min-w-0 hidden sm:inline">
          {companyName}
        </span>
      </div>

      {/* Center tabs - hidden on very small mobile */}
      <div className="hidden sm:flex items-center justify-center gap-2 sm:gap-4 text-[10px] sm:text-[11px] font-bold shrink-0 order-2">
        <button className="pb-0.5 border-b-[3px] border-[#FFD700]">
          {date}
        </button>
        <button className="pb-0.5 border-b-[3px] border-transparent">
          F6: New
        </button>
        <button className="pb-0.5 border-b-[3px] border-transparent">
          Ctrl+A: Accept
        </button>
      </div>

      {/* Right section - secondary on mobile, can wrap */}
      <div className="flex items-center justify-center sm:justify-end gap-2 sm:gap-4 sm:ml-auto pl-2 sm:pl-6 text-[11px] shrink-0 order-3">
        <PrintMenu />
        <span className="w-px h-6 bg-white/70" />
        <ShareMenu />
        <span className="w-px h-6 bg-white/70" />
        <DropdownMenu label="Reports">
          <DropdownMenuItem onClick={() => setActiveView('trial-balance')}>
            Trial Balance
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActiveView('balance-sheet')}>
            Balance Sheet
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActiveView('profit-loss')}>
            Profit &amp; Loss A/c
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActiveView('cash-flow')}>
            Cash Flow
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActiveView('ratio-analysis')}>
            Ratio Analysis
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActiveView('monthly-summary')}>
            Monthly Summary
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActiveView('day-book')}>
            Day Book
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActiveView('voucher-register')}>
            Voucher Register
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setActiveView('ledger-vouchers')}>
            Ledger Vouchers
          </DropdownMenuItem>
        </DropdownMenu>
        <span className="w-px h-6 bg-white/70" />
        <button
          type="button"
          className="w-6 h-6 rounded-full bg-[#CC0000] flex items-center justify-center border border-white text-[12px] font-bold"
        >
          <X className="w-3 h-3" />
        </button>
      </div>
    </header>
  );
}


