import { useEffect } from 'react';
import { useAppStore } from '../store/useAppStore';
import { useShareStore } from '../store/useShareStore';
import { getKeyCombo } from '../utils/shortcuts';
import {
  findShortcut,
  getEffectiveContext,
  getFullRegistry,
  type UserRole,
} from '../config/shortcutRegistry';
import { getShortcutHandler } from '../config/shortcutHandlers';

/** Whether the event target is an editable field (shortcuts like Ctrl+A may be skipped there). */
function isEditableTarget(target: EventTarget | null): boolean {
  const el = target as HTMLElement;
  if (!el?.tagName) return false;
  const tag = el.tagName.toUpperCase();
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || el.isContentEditable;
}

/** Keys that fire globally even in editable fields (Escape, F-keys, Save). */
const GLOBAL_KEYS_IN_EDITABLE = new Set(['Escape', 'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12']);
/** Save shortcuts that work in editable fields (Ctrl+S, Ctrl+A). */
const SAVE_KEYS_IN_EDITABLE = new Set(['Ctrl+S', 'Ctrl+A']);

export function useKeyboardShortcuts() {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const inEditable = isEditableTarget(event.target);
      const keyCombo = getKeyCombo(event);
      const isFunctionKey = event.key.startsWith('F') && /^F\d+$/.test(event.key);
      const isEscape = event.key === 'Escape';

      if (inEditable) {
        if (isEscape) {
          (target as HTMLInputElement)?.blur?.();
          return;
        }
        if (!GLOBAL_KEYS_IN_EDITABLE.has(event.key) && !isFunctionKey && !SAVE_KEYS_IN_EDITABLE.has(keyCombo)) return;
      }

      const app = useAppStore.getState();
      const share = useShareStore.getState();
      const activeView = app.activeView;
      const isConfigOpen =
        app.isVoucherConfigOpen ||
        share.isShareConfigOpen ||
        share.isEmailConfigModalOpen;
      const context = getEffectiveContext(activeView, isConfigOpen);
      const role: UserRole = app.userRole;
      const registry = getFullRegistry();
      const shortcut = findShortcut(keyCombo, context, role, registry);

      if (shortcut) {
        const action = getShortcutHandler(shortcut.id);
        if (action) {
          event.preventDefault();
          event.stopPropagation();
          action();
          return;
        }
      }

      if (isEscape && !inEditable) {
        event.preventDefault();
        app.setActiveView('gateway');
      }
    };

    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, []);
}
