import * as React from 'react';
import { useShareStore } from '../../store/useShareStore';
import { useShortcutsForCurrentContext } from '../../hooks/useShortcutHint';

const MAX_HINTS = 14;

export function StatusBar() {
  const isEmailConfigOpen = useShareStore((s) => s.isEmailConfigModalOpen);
  const isShareConfigOpen = useShareStore((s) => s.isShareConfigOpen);
  const shortcuts = useShortcutsForCurrentContext();

  const showShareConfigHints = isEmailConfigOpen || isShareConfigOpen;

  const hints = React.useMemo(
    () =>
      showShareConfigHints
        ? [{ keys: 'Q', label: 'Quit' }, { keys: 'A', label: 'Accept' }]
        : shortcuts.slice(0, MAX_HINTS),
    [showShareConfigHints, shortcuts]
  );

  const hintItems = React.useMemo(
    () =>
      hints.map((s, i) => (
        <span key={`${s.keys}-${i}`} className="shrink-0 flex items-center gap-1" title={s.label}>
          {i > 0 && <span className="text-gray-400 mx-1">·</span>}
          <span>{s.keys}</span>
        </span>
      )),
    [hints]
  );

  const carouselContent = React.useMemo(
    () => (
      <>
        <span key="copy1" className="inline-flex items-center gap-1 shrink-0 mr-4">
          {hints.map((s, i) => (
            <span key={`1-${s.keys}-${i}`} className="shrink-0 flex items-center gap-1" title={s.label}>
              {i > 0 && <span className="text-gray-400 mx-1">·</span>}
              <span>{s.keys}</span>
            </span>
          ))}
        </span>
        <span key="copy2" className="inline-flex items-center gap-1 shrink-0 mr-4">
          {hints.map((s, i) => (
            <span key={`2-${s.keys}-${i}`} className="shrink-0 flex items-center gap-1" title={s.label}>
              {i > 0 && <span className="text-gray-400 mx-1">·</span>}
              <span>{s.keys}</span>
            </span>
          ))}
        </span>
      </>
    ),
    [hints]
  );

  return (
    <footer className="h-6 min-h-[24px] sm:min-h-[24px] max-h-[24px] w-full border-t border-[#D0D0D0] bg-[#E8E8E8] flex items-center shrink-0 overflow-hidden">
      <span className="font-semibold text-[#7F1D1D] mr-3 shrink-0 pl-3 text-[10px] hidden sm:inline">Shortcuts:</span>
      {/* Desktop: static list */}
      <div className="hidden sm:flex items-center gap-1 flex-wrap overflow-hidden px-3 text-[10px] text-[#333] flex-1 min-w-0">
        {hintItems}
      </div>
      {/* Mobile: infinite auto-rotating carousel */}
      <div className="sm:hidden flex-1 min-w-0 overflow-hidden relative h-6">
        <div className="footer-carousel-track flex items-center gap-1 absolute left-0 top-0 whitespace-nowrap text-[10px] text-[#333] px-3">
          {carouselContent}
        </div>
      </div>
    </footer>
  );
}
