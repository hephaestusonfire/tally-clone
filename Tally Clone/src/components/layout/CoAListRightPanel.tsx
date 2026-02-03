import { Button } from '../ui/button';
import { useAppStore } from '../../store/useAppStore';
import { useGatewayStore } from '../../store/useGatewayStore';

export function CoAListRightPanel() {
  const setActiveView = useAppStore((s) => s.setActiveView);
  const setListOfMastersPopupOpen = useAppStore((s) => s.setListOfMastersPopupOpen);
  const toggleCompanyModal = useAppStore((s) => s.toggleCompanyModal);
  const openDateModal = useGatewayStore((s) => s.openDateModal);

  const handleF10 = () => {
    setListOfMastersPopupOpen(true);
    setActiveView('chart-of-accounts');
  };

  const handleF5 = () => {
    setActiveView('list-of-stock-items');
  };

  const handleQuit = () => {
    setListOfMastersPopupOpen(true);
    setActiveView('chart-of-accounts');
  };

  return (
    <aside className="hidden 2xl:flex w-[320px] min-w-[320px] max-w-[320px] h-full border-l border-tallyBorder bg-[#E8E8E8] flex-col">
      <div className="p-2 border-b border-tallyBorder">
        <span className="text-[11px] font-bold text-[#7F1D1D]">Chart of Accounts – Actions</span>
      </div>
      <div className="flex-1 overflow-auto px-2 py-2 text-[10px] space-y-1.5">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start bg-white border-[#D0D0D0] text-[11px]"
          onClick={openDateModal}
        >
          F2: Period
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
          onClick={handleF5}
        >
          F5: Stock Item View
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start bg-white border-[#D0D0D0] text-[11px]"
          onClick={handleF10}
        >
          F10: Other Masters
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start bg-white border-[#D0D0D0] text-[11px] opacity-80"
          disabled
        >
          B: Basis of Values
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start bg-white border-[#D0D0D0] text-[11px] opacity-80"
          disabled
        >
          H: Change View
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start bg-white border-[#D0D0D0] text-[11px] opacity-80"
          disabled
        >
          J: Exception Reports
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start bg-white border-[#D0D0D0] text-[11px] opacity-80"
          disabled
        >
          L: Save View
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start bg-white border-[#D0D0D0] text-[11px] opacity-80"
          disabled
        >
          F: Apply Filter
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-start bg-white border-[#D0D0D0] text-[11px] opacity-80"
          disabled
        >
          H: Multi-Masters
        </Button>
      </div>
      <div className="border-t border-tallyBorder px-2 py-2 space-y-1">
        <Button
          variant="outline"
          size="sm"
          className="w-full bg-[#DC2626] text-white border-none text-[11px]"
          onClick={handleQuit}
        >
          Q: Quit
        </Button>
      </div>
    </aside>
  );
}
