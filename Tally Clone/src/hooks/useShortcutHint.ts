import { useMemo } from 'react';
import { useAppStore } from '../store/useAppStore';
import {
  getShortcutHint,
  getShortcutsForContext,
  getEffectiveContext,
  getFullRegistry,
  type UserRole,
} from '../config/shortcutRegistry';

/**
 * Get the key combo hint for an action (for tooltips / buttons).
 * @param actionId - Shortcut action id from registry (e.g. 'global-accept', 'f12-configure')
 */
export function useShortcutHint(actionId: string): string {
  return useMemo(() => getShortcutHint(actionId, getFullRegistry()), [actionId]);
}

/**
 * Get all shortcut hints for the current context (for status bar / help).
 */
export function useShortcutsForCurrentContext(): { keys: string; label: string }[] {
  const activeView = useAppStore((s) => s.activeView);
  const isVoucherConfigOpen = useAppStore((s) => s.isVoucherConfigOpen);
  const userRole = useAppStore((s) => s.userRole) as UserRole;

  return useMemo(() => {
    const context = getEffectiveContext(activeView, isVoucherConfigOpen);
    const list = getShortcutsForContext(context, userRole, getFullRegistry());
    return list.map((s) => ({ keys: s.keys, label: s.label }));
  }, [activeView, isVoucherConfigOpen, userRole]);
}
