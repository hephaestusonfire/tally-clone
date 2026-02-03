import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { useAppStore } from '../../store/useAppStore';
import { useGatewayStore } from '../../store/useGatewayStore';
import { CoAListRightPanel } from './CoAListRightPanel';

const alterItems = [
  'Cash in Hand (2)',
  'Sundry Debtors',
  'Sundry Creditors',
  'Bank Accounts',
  'Sales Accounts',
  'Purchase Accounts',
  'Current Assets',
  'Current Liabilities',
  'Capital Accounts',
  'Duties & Taxes',
];

export function RightPanel() {
  const activeView = useAppStore((s) => s.activeView);
  const toggleCompanyModal = useAppStore((s) => s.toggleCompanyModal);
  const openDateModal = useGatewayStore((s) => s.openDateModal);
  const openLineColorModal = useGatewayStore((s) => s.openLineColorModal);
  const openDashboardConfig = useAppStore((s) => s.openDashboardConfig);
  const openExportModal = useAppStore((s) => s.openExportModal);

  const isCoAListView =
    activeView === 'list-of-stock-items' || activeView === 'list-of-stock-categories';

  const isGateway =
    activeView === 'gateway' ||
    activeView === 'dashboard' ||
    activeView === 'chart-of-accounts' ||
    activeView === 'multiple-ledgers' ||
    activeView === 'cost-centres' ||
    activeView === 'cost-centre-creation' ||
    activeView === 'currencies-list' ||
    activeView === 'master-creation' ||
    activeView === 'master-alteration' ||
    activeView === 'group-creation' ||
    activeView === 'ledger-creation' ||
    activeView === 'currency-creation' ||
    activeView === 'voucher-type-creation' ||
    activeView === 'credit-limits-creation' ||
    activeView === 'scenario-creation' ||
    activeView === 'stock-group-creation' ||
    activeView === 'stock-category-creation' ||
    activeView === 'stock-item-creation' ||
    activeView === 'units-list' ||
    activeView === 'unit-creation' ||
    activeView === 'godown-creation' ||
    activeView === 'gst-registration-creation' ||
    activeView === 'gst-classification-creation' ||
    activeView === 'statutory-details' ||
    activeView === 'company-gst-details-creation' ||
    activeView === 'pan-cin-details-creation';

  if (isCoAListView) {
    return <CoAListRightPanel />;
  }

  if (isGateway) {
    const isDashboard = activeView === 'dashboard';
    return (
      <aside className="hidden 2xl:flex w-[320px] min-w-[320px] max-w-[320px] h-full border-l border-tallyBorder bg-[#E8E8E8]">
        <div className="flex flex-col h-full w-full">
          <div className="p-2 border-b border-tallyBorder">
            <span className="text-[11px] font-bold text-[#7F1D1D]">
              {isDashboard ? 'Dashboard' : 'Gateway Utilities'}
            </span>
          </div>
          {isDashboard && (
            <div className="px-2 py-2 border-b border-tallyBorder space-y-1">
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start bg-white border-[#D0D0D0] text-[11px]"
                onClick={openDashboardConfig}
              >
                F12: Configure Tiles
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start bg-white border-[#D0D0D0] text-[11px]"
                onClick={openExportModal}
              >
                Export
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="w-full justify-start bg-white border-[#D0D0D0] text-[11px]"
                onClick={() => window.print()}
              >
                Print
              </Button>
            </div>
          )}
          <ScrollArea className="flex-1 px-2 py-2 text-[10px] space-y-2">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start bg-white border-[#D0D0D0] text-[11px]"
              onClick={openDateModal}
            >
              F2: Date
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start bg-white border-[#D0D0D0] text-[11px]"
              onClick={toggleCompanyModal}
            >
              F3: Company
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start bg-white border-[#D0D0D0] text-[11px]"
              onClick={openLineColorModal}
            >
              C: Line Color
            </Button>
          </ScrollArea>
          <div className="border-t border-tallyBorder px-2 py-2 space-y-1">
            <Button
              variant="outline"
              size="sm"
              className="w-full bg-[#DC2626] text-white border-none"
            >
              Quit
            </Button>
          </div>
        </div>
      </aside>
    );
  }

  return (
    <aside className="hidden 2xl:flex w-[320px] min-w-[320px] max-w-[320px] h-full border-l border-tallyBorder bg-[#E8E8E8]">
      <div className="flex flex-col h-full w-full">
        <div className="p-2 border-b border-tallyBorder">
          <Button
            variant="subtle"
            size="md"
            className="w-full bg-[#FFD700] text-black border border-tallyBorder"
          >
            Alter
          </Button>
        </div>
        <ScrollArea className="flex-1 px-2 py-1 text-[10px]">
          <ul className="space-y-0.5">
            {alterItems.map((item) => (
              <li key={item}>
                <button
                  type="button"
                  className="w-full text-left px-2 py-1 hover:bg-white"
                >
                  {item}
                </button>
              </li>
            ))}
          </ul>
        </ScrollArea>
        <div className="border-t border-tallyBorder px-2 py-2 space-y-1">
          <Button
            variant="outline"
            size="sm"
            className="w-full bg-[#DC2626] text-white border-none"
          >
            Quit
          </Button>
        </div>
      </div>
    </aside>
  );
}
