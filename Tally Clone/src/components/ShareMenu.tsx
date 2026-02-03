import * as React from 'react';
import ReactDOM from 'react-dom';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from '../lib/utils';
import { useWhatsAppStore } from '../store/useWhatsAppStore';
import { useShareStore } from '../store/useShareStore';
import { useAppStore } from '../store/useAppStore';

function MenuRow({
  children,
  onClick,
  hotkey,
  className,
  onMouseEnter,
  submenu,
}: {
  children: React.ReactNode;
  onClick?: () => void;
  hotkey?: string;
  className?: string;
  onMouseEnter?: () => void;
  submenu?: React.ReactNode;
}) {
  const [showSub, setShowSub] = React.useState(false);
  const hasSub = Boolean(submenu);
  return (
    <div
      className="relative"
      onMouseEnter={() => {
        onMouseEnter?.();
        if (hasSub) setShowSub(true);
      }}
      onMouseLeave={() => hasSub && setShowSub(false)}
    >
      <button
        type="button"
        onClick={hasSub ? undefined : onClick}
        className={cn(
          'w-full text-left px-3 py-1.5 hover:bg-[#FEF2F2] text-[11px] flex items-center justify-between gap-4',
          className
        )}
      >
        <span>{children}</span>
        <span className="flex items-center gap-1 flex-shrink-0">
          {hotkey && <span className="text-[10px] text-gray-500">{hotkey}</span>}
          {hasSub && <ChevronRight className="w-3 h-3" />}
        </span>
      </button>
      {hasSub && showSub && (
        <div className="absolute left-full top-0 ml-0 min-w-[200px] bg-[#FEF2F2] border border-[#D0D0D0] shadow z-30 text-[11px] py-1">
          {submenu}
        </div>
      )}
    </div>
  );
}

export function ShareMenu() {
  const [open, setOpen] = React.useState(false);
  const shareMenuOpen = useShareStore((s) => s.shareMenuOpen);
  const setShareMenuOpen = useShareStore((s) => s.setShareMenuOpen);
  const openEmailConfig = useShareStore((s) => s.openEmailConfig);
  const openEmailSendCurrent = useShareStore((s) => s.openEmailSendCurrent);
  const openEmailSendOthers = useShareStore((s) => s.openEmailSendOthers);
  const openShareConfig = useShareStore((s) => s.openShareConfig);
  const _openSettings = useWhatsAppStore((s) => s.openSettings);
  const _openNumbers = useWhatsAppStore((s) => s.openNumbers);
  const _openShare = useWhatsAppStore((s) => s.openShare);
  void _openSettings;
  void _openNumbers;
  void _openShare;
  const openRecharge = useWhatsAppStore((s) => s.openRecharge);
  const openRenew = useWhatsAppStore((s) => s.openRenew);
  const openWhatsappSendCurrent = useWhatsAppStore((s) => s.openWhatsappSendCurrent);
  const openWhatsappSendOthers = useWhatsAppStore((s) => s.openWhatsappSendOthers);
  const openSignup = useWhatsAppStore((s) => s.openSignup);
  const setActiveView = useAppStore((s) => s.setActiveView);

  const isOpen = open || shareMenuOpen;

  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const [dropdownRect, setDropdownRect] = React.useState<{ top: number; left: number } | null>(null);

  const closeMenu = React.useCallback(() => {
    setOpen(false);
    setShareMenuOpen(false);
    setDropdownRect(null);
  }, [setShareMenuOpen]);

  const toggle = React.useCallback(() => {
    const next = !open;
    setOpen(next);
    setShareMenuOpen(next);
    if (next && triggerRef.current) {
      const r = triggerRef.current.getBoundingClientRect();
      setDropdownRect({ top: r.bottom + 2, left: Math.max(8, r.right - 220) });
    } else {
      setDropdownRect(null);
    }
  }, [open, setShareMenuOpen]);

  React.useEffect(() => {
    if (shareMenuOpen) {
      setOpen(true);
      if (triggerRef.current) {
        const r = triggerRef.current.getBoundingClientRect();
        setDropdownRect({ top: r.bottom + 2, left: Math.max(8, r.right - 220) });
      }
    }
  }, [shareMenuOpen]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        const el = document.querySelector('[data-share-menu-dropdown]');
        if (el && !el.contains(e.target as Node)) closeMenu();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, closeMenu]);

  return (
    <div className="relative inline-flex items-center text-white text-[11px]">
      <button
        ref={triggerRef}
        type="button"
        id="share-menu-trigger"
        className="inline-flex items-center gap-1 px-2 py-1.5 sm:px-1 sm:py-0.5 hover:bg-white/10 rounded min-h-[40px] sm:min-h-0 touch-manipulation"
        onClick={toggle}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            toggle();
          }
        }}
      >
        <span>M: Share</span>
        <ChevronDown className="w-3 h-3" />
      </button>
      {isOpen && dropdownRect && typeof document !== 'undefined' && document.body &&
        ReactDOM.createPortal(
          <>
            <div className="fixed inset-0 z-[9998]" aria-hidden onClick={closeMenu} />
            <div
              data-share-menu-dropdown
              className="fixed min-w-[220px] max-h-[70vh] overflow-auto bg-[#FEF2F2] text-black border border-[#D0D0D0] shadow-lg text-[11px] py-1 rounded-sm z-[9999]"
              style={{ top: dropdownRect.top, left: dropdownRect.left }}
              role="menu"
              onMouseDown={(e) => e.stopPropagation()}
            >
            {/* E-MAIL */}
            <div className="px-2 py-1 text-[10px] font-bold text-[#7F1D1D] uppercase tracking-wide border-b border-[#D0D0D0] mb-1">
              E-mail
            </div>
            <MenuRow
              hotkey="Ctrl+M"
              onClick={() => { closeMenu(); openEmailSendCurrent(); }}
            >
              CuRrent
            </MenuRow>
            <MenuRow onClick={() => { closeMenu(); openEmailSendOthers(); }}>
              Others
            </MenuRow>
            <MenuRow onClick={() => { closeMenu(); openEmailConfig(); }}>
              Configuration
            </MenuRow>

            {/* WHATSAPP */}
            <div className="px-2 py-1 text-[10px] font-bold text-[#7F1D1D] uppercase tracking-wide border-b border-[#D0D0D0] mt-2 mb-1">
              WhatsApp
            </div>
            <MenuRow onClick={() => { closeMenu(); openWhatsappSendCurrent(); }}>
              Current
            </MenuRow>
            <MenuRow onClick={() => { closeMenu(); openWhatsappSendOthers(); }}>
              Others
            </MenuRow>
            <MenuRow
              submenu={
                <>
                  <MenuRow onClick={() => { closeMenu(); setActiveView('whatsapp-inbox'); }}>
                    Inbox
                  </MenuRow>
                  <MenuRow onClick={() => { closeMenu(); setActiveView('whatsapp-numbers'); }}>
                    WhatsApp Nos.
                  </MenuRow>
                  <MenuRow onClick={() => { closeMenu(); openSignup(); }}>
                    Sign Up for WhatsApp
                  </MenuRow>
                  <MenuRow onClick={() => { closeMenu(); openRecharge(); }}>
                    Recharge Wallet
                  </MenuRow>
                  <MenuRow onClick={() => { closeMenu(); openRenew(); }}>
                    REnew Subscription
                  </MenuRow>
                  <MenuRow onClick={() => { closeMenu(); openShareConfig(); }}>
                    Configuration
                  </MenuRow>
                </>
              }
            >
              Manage
            </MenuRow>
            <MenuRow onClick={() => { closeMenu(); openShareConfig(); }}>
              Configuration
            </MenuRow>
            </div>
          </>,
          document.body
        )
      }
    </div>
  );
}
