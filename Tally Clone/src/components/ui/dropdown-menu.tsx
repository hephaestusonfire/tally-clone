import * as React from 'react';
import ReactDOM from 'react-dom';
import { ChevronDown } from 'lucide-react';
import { cn } from '../../lib/utils';

interface DropdownMenuProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export function DropdownMenu({ label, children, className }: DropdownMenuProps) {
  const [open, setOpen] = React.useState(false);
  const [dropdownRect, setDropdownRect] = React.useState<{ top: number; left: number } | null>(null);
  const triggerRef = React.useRef<HTMLButtonElement>(null);

  const toggle = React.useCallback(() => {
    const next = !open;
    setOpen(next);
    if (next && triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setDropdownRect({ top: r.bottom + 2, left: Math.max(8, r.right - 160) });
    } else {
      setDropdownRect(null);
    }
  }, [open]);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        const el = document.querySelector('[data-reports-dropdown]');
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
    <div
      className={cn(
        'relative inline-flex items-center text-white text-[11px]',
        className,
      )}
    >
      <button
        ref={triggerRef}
        type="button"
        className="inline-flex items-center gap-1 min-h-[40px] sm:min-h-0 px-2 sm:px-0 touch-manipulation"
        onClick={toggle}
      >
        <span>{label}</span>
        <ChevronDown className="w-3 h-3" />
      </button>
      {open && dropdownRect && typeof document !== 'undefined' && document.body &&
        ReactDOM.createPortal(
          <>
            <div className="fixed inset-0 z-[9998]" aria-hidden onClick={() => { setOpen(false); setDropdownRect(null); }} />
            <div
              data-reports-dropdown
              className="fixed min-w-[160px] bg-white text-black border border-tallyBorder shadow-lg text-[11px] z-[9999] py-1 rounded-sm"
              style={{ top: dropdownRect.top, left: dropdownRect.left }}
              onMouseDown={(e) => e.stopPropagation()}
            >
              {React.Children.map(children, (child) =>
                React.isValidElement(child) && typeof child.type !== 'string'
                  ? React.cloneElement(child as React.ReactElement<{ onClick?: (e: React.MouseEvent) => void }>, {
                      onClick: (e: React.MouseEvent) => {
                        (child.props as { onClick?: (e: React.MouseEvent) => void }).onClick?.(e);
                        setOpen(false);
                        setDropdownRect(null);
                      },
                    })
                  : child,
              )}
            </div>
          </>,
          document.body
        )
      }
    </div>
  );
}

interface DropdownMenuItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export function DropdownMenuItem({
  className,
  children,
  ...props
}: DropdownMenuItemProps) {
  return (
    <button
      type="button"
      className={cn(
        'w-full text-left px-3 py-3 sm:py-1 hover:bg-[#FEF2F2] text-[11px] min-h-[44px] sm:min-h-0 touch-manipulation',
        className,
      )}
      {...props}
    >
      {children}
    </button>
  );
}

