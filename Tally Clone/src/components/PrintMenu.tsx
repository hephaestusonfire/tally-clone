import * as React from 'react';
import ReactDOM from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { cn } from '../lib/utils';
import { usePrintStore } from '../store/usePrintStore';

export function PrintMenu() {
  const [open, setOpen] = React.useState(false);
  const [dropdownRect, setDropdownRect] = React.useState<{ top: number; left: number } | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const openPrintReport = usePrintStore((s) => s.openPrintReport);
  const openPrintConfig = usePrintStore((s) => s.openPrintConfig);
  const executePrint = usePrintStore((s) => s.executePrint);

  const toggle = React.useCallback(() => {
    const next = !open;
    setOpen(next);
    if (next && triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setDropdownRect({ top: r.bottom + 2, left: r.right - 180 });
    } else {
      setDropdownRect(null);
    }
  }, [open]);

  const handleCurrent = () => {
    setOpen(false);
    setDropdownRect(null);
    executePrint();
  };

  const handleOthers = () => {
    setOpen(false);
    setDropdownRect(null);
    openPrintReport();
  };

  const handleConfiguration = () => {
    setOpen(false);
    setDropdownRect(null);
    openPrintConfig();
  };

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        const el = document.querySelector('[data-print-menu-dropdown]');
        if (el && !el.contains(e.target as Node)) {
          setOpen(false);
          setDropdownRect(null);
        }
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div className="relative inline-flex items-center text-white text-[11px]">
      <button
        ref={triggerRef}
        type="button"
        className={cn(
          'inline-flex items-center gap-1 px-2 py-1.5 sm:px-1 sm:py-0.5 rounded hover:bg-white/10 min-h-[40px] sm:min-h-0 touch-manipulation',
          open && 'bg-white/10'
        )}
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        }}
      >
        <span>P: Print</span>
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && dropdownRect && typeof document !== 'undefined' && document.body &&
        ReactDOM.createPortal(
          <>
            <div className="fixed inset-0 z-[9998]" aria-hidden onClick={() => { setOpen(false); setDropdownRect(null); }} />
            <div
              data-print-menu-dropdown
              className="fixed min-w-[180px] bg-white text-black border border-[#D0D0D0] shadow-lg text-[11px] py-1 rounded-sm z-[9999]"
              style={{ top: dropdownRect.top, left: dropdownRect.left }}
              role="menu"
              onMouseDown={(e) => e.stopPropagation()}
            >
              <button type="button" className="w-full text-left px-3 py-2 sm:py-1.5 hover:bg-[#FEF2F2] text-[11px] min-h-[44px] sm:min-h-0 touch-manipulation" onClick={handleCurrent}>Current</button>
              <button type="button" className="w-full text-left px-3 py-2 sm:py-1.5 hover:bg-[#FEF2F2] text-[11px] min-h-[44px] sm:min-h-0 touch-manipulation" onClick={handleOthers}>Others</button>
              <button type="button" className="w-full text-left px-3 py-2 sm:py-1.5 hover:bg-[#FEF2F2] text-[11px] min-h-[44px] sm:min-h-0 touch-manipulation" onClick={handleConfiguration}>Configuration</button>
            </div>
          </>,
          document.body
        )
      }
    </div>
  );
}
