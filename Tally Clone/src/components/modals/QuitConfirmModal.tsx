import { useAppStore } from '../../store/useAppStore';
import { Button } from '../ui/button';

export function QuitConfirmModal() {
  const open = useAppStore((s) => s.quitConfirmOpen);
  const setQuitConfirmOpen = useAppStore((s) => s.setQuitConfirmOpen);
  const setActiveView = useAppStore((s) => s.setActiveView);

  const handleYes = () => {
    setQuitConfirmOpen(false);
    setActiveView('gateway');
  };

  const handleNo = () => {
    setQuitConfirmOpen(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" role="dialog" aria-modal="true" aria-labelledby="quit-title">
      <div className="bg-white border border-[#D0D0D0] shadow-lg rounded min-w-[280px] max-w-sm">
        <div className="border-b border-[#D0D0D0] bg-[#E8E8E8] px-3 py-2">
          <h2 id="quit-title" className="text-sm font-bold text-[#7F1D1D]">
            Quit
          </h2>
        </div>
        <div className="p-3 text-[11px] text-[#333]">
          Return to Gateway?
        </div>
        <div className="flex justify-end gap-2 border-t border-[#D0D0D0] bg-[#F5F5F5] px-3 py-2">
          <Button type="button" size="sm" variant="outline" className="text-[11px]" onClick={handleNo}>
            No
          </Button>
          <Button type="button" size="sm" className="bg-[#DC2626] text-white hover:bg-[#B91C1C] text-[11px]" onClick={handleYes}>
            Yes
          </Button>
        </div>
      </div>
    </div>
  );
}
