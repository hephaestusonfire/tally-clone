import { useShortcutHint } from '../../hooks/useShortcutHint';
import { cn } from '../../lib/utils';

interface ShortcutBadgeProps {
  actionId: string;
  className?: string;
  /** Show only the keys (default) or "Label (Keys)" */
  showLabel?: boolean;
  label?: string;
}

/**
 * Renders shortcut keys for tooltips / buttons.
 * Use with actionId from shortcut registry (e.g. 'global-accept', 'f12-configure').
 */
export function ShortcutBadge({ actionId, className, showLabel, label }: ShortcutBadgeProps) {
  const keys = useShortcutHint(actionId);
  if (!keys) return null;
  const displayLabel = label ?? (showLabel ? keys : '');
  return (
    <span
      className={cn('text-[10px] text-gray-500 font-mono', className)}
      title={displayLabel ? `${displayLabel} (${keys})` : keys}
    >
      {keys}
      {showLabel && displayLabel && ` — ${displayLabel}`}
    </span>
  );
}
