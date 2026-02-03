import { normalizeKeyCombo } from '../config/shortcutRegistry';

export type ShortcutHandler = () => void;

export interface ShortcutMap {
  [combo: string]: ShortcutHandler | undefined;
}

/** Build a normalized key combo from a keyboard event (e.g. Ctrl+A, Alt+F, F2, Escape). */
export function getKeyCombo(event: KeyboardEvent): string {
  const parts: string[] = [];
  if (event.ctrlKey) parts.push('Ctrl');
  if (event.altKey) parts.push('Alt');
  if (event.shiftKey) parts.push('Shift');
  const key = event.key === ' ' ? 'Space' : event.key;
  parts.push(key);
  const combo = parts.join('+');
  return normalizeKeyCombo(combo);
}

export function handleShortcuts(
  event: KeyboardEvent,
  map: ShortcutMap,
): boolean {
  const combo = getKeyCombo(event);
  const handler = map[combo];
  if (handler) {
    event.preventDefault();
    handler();
    return true;
  }
  return false;
}
