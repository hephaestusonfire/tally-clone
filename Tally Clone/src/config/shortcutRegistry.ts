/**
 * Centralized keyboard shortcut registry.
 * Tally Prime–style: global, context-aware, role-aware, conflict-free.
 * Design: ESC never saves; Ctrl+A always accept; F-keys same logical role.
 */

export type ShortcutCategory =
  | 'global'
  | 'function-keys'
  | 'gateway'
  | 'master'
  | 'voucher'
  | 'inventory'
  | 'gst'
  | 'config'
  | 'reports'
  | 'special'
  | 'plugin';

export type UserRole = 'admin' | 'accountant' | 'viewer';

export interface ShortcutDef {
  id: string;
  keys: string;
  label: string;
  category: ShortcutCategory;
  /** When set, shortcut only applies in these views. Empty = global. */
  contexts?: string[];
  /** When set, shortcut only available for these roles. Empty = all roles. */
  roles?: UserRole[];
  /** Plugin namespace for future extensibility */
  plugin?: string;
}

/** Normalize key for comparison: Ctrl+A, Alt+F, F2, Escape */
export function normalizeKeyCombo(keys: string): string {
  return keys
    .replace(/\s+/g, '')
    .split('+')
    .map((p) => (p.length === 1 ? p.toUpperCase() : p))
    .join('+');
}

/** All shortcuts in the application. Order: more specific context first when resolving. */
export const SHORTCUT_REGISTRY: ShortcutDef[] = [
  // —— 1️⃣ GLOBAL (available everywhere) ——
  { id: 'global-new', keys: 'Ctrl+N', label: 'Create new item (context-aware)', category: 'global' },
  { id: 'global-accept', keys: 'Ctrl+A', label: 'Accept / Save', category: 'global' },
  { id: 'global-save', keys: 'Ctrl+S', label: 'Save (same as Accept)', category: 'global' },
  { id: 'global-quit', keys: 'Ctrl+Q', label: 'Quit current screen', category: 'global' },
  { id: 'global-cancel', keys: 'Ctrl+C', label: 'Cancel / Close without saving', category: 'global' },
  { id: 'global-export', keys: 'Ctrl+E', label: 'Export', category: 'global' },
  { id: 'global-import', keys: 'Ctrl+I', label: 'Import', category: 'global', contexts: ['gateway', 'reports', 'balance-sheet', 'profit-loss', 'trial-balance'] },
  { id: 'global-print', keys: 'Ctrl+P', label: 'Print', category: 'global' },
  { id: 'global-multiselect', keys: 'Ctrl+M', label: 'Multi-select mode', category: 'global' },
  { id: 'global-find', keys: 'Ctrl+F', label: 'Find', category: 'global' },
  { id: 'global-find-advanced', keys: 'Alt+F', label: 'Advanced find (masters + vouchers)', category: 'global' },
  { id: 'global-back', keys: 'Escape', label: 'Back / Previous screen', category: 'global' },
  { id: 'global-gateway', keys: 'Ctrl+Escape', label: 'Gateway (Home)', category: 'global' },

  // —— 2️⃣ FUNCTION KEYS ——
  { id: 'f1-help', keys: 'F1', label: 'Help / Product Help', category: 'function-keys' },
  { id: 'f2-date', keys: 'F2', label: 'Change Date', category: 'function-keys' },
  { id: 'f3-company', keys: 'F3', label: 'Change Company', category: 'function-keys' },
  { id: 'f4-contra', keys: 'F4', label: 'Contra Voucher', category: 'function-keys' },
  { id: 'f5-payment', keys: 'F5', label: 'Payment Voucher', category: 'function-keys' },
  { id: 'f6-receipt', keys: 'F6', label: 'Receipt Voucher', category: 'function-keys' },
  { id: 'f7-journal', keys: 'F7', label: 'Journal Voucher', category: 'function-keys' },
  { id: 'f8-sales', keys: 'F8', label: 'Sales Voucher', category: 'function-keys' },
  { id: 'f9-purchase', keys: 'F9', label: 'Purchase Voucher', category: 'function-keys' },
  { id: 'f10-other-voucher', keys: 'F10', label: 'Other Vouchers', category: 'function-keys' },
  { id: 'f11-features', keys: 'F11', label: 'Features / Company Features', category: 'function-keys' },
  { id: 'f12-configure', keys: 'F12', label: 'Configure (context-sensitive)', category: 'function-keys' },

  // —— 3️⃣ GATEWAY ——
  { id: 'gateway-go', keys: 'G', label: 'Go To', category: 'gateway', contexts: ['gateway'] },
  { id: 'gateway-company', keys: 'K', label: 'Company', category: 'gateway', contexts: ['gateway'] },
  { id: 'gateway-data', keys: 'Y', label: 'Data', category: 'gateway', contexts: ['gateway'] },
  { id: 'gateway-exchange', keys: 'Z', label: 'Exchange', category: 'gateway', contexts: ['gateway'] },
  { id: 'gateway-banking', keys: 'B', label: 'Banking', category: 'gateway', contexts: ['gateway'] },
  { id: 'gateway-display-reports', keys: 'D', label: 'Display Reports', category: 'gateway', contexts: ['gateway'] },
  { id: 'gateway-masters', keys: 'M', label: 'Masters', category: 'gateway', contexts: ['gateway'] },

  // —— 4️⃣ MASTER CREATION / ALTERATION ——
  { id: 'master-create', keys: 'Alt+C', label: 'Create master on-the-fly', category: 'master', contexts: ['vouchers', 'sales', 'ledger-creation', 'master-creation', 'chart-of-accounts'] },
  { id: 'master-alter', keys: 'Ctrl+Enter', label: 'Alter selected master', category: 'master', contexts: ['master-alteration', 'chart-of-accounts', 'ledger-creation'] },
  { id: 'master-delete', keys: 'Ctrl+D', label: 'Delete master', category: 'master', contexts: ['master-alteration', 'chart-of-accounts'], roles: ['admin'] },
  { id: 'master-open', keys: 'Ctrl+O', label: 'Open master', category: 'master', contexts: ['master-alteration', 'chart-of-accounts'] },
  { id: 'master-ledger-list', keys: 'Ctrl+L', label: 'Ledger List', category: 'master', contexts: ['vouchers', 'sales', 'master-alteration', 'chart-of-accounts'] },
  { id: 'master-inventory-list', keys: 'Ctrl+I', label: 'Inventory List', category: 'master', contexts: ['master-alteration', 'stock-groups', 'stock-items', 'inventory'] },

  // —— 5️⃣ VOUCHER ENTRY ——
  { id: 'voucher-duplicate', keys: 'Alt+2', label: 'Duplicate Voucher', category: 'voucher', contexts: ['vouchers', 'sales'] },
  { id: 'voucher-add', keys: 'Alt+A', label: 'Add voucher', category: 'voucher', contexts: ['vouchers', 'sales'] },
  { id: 'voucher-delete', keys: 'Alt+D', label: 'Delete voucher', category: 'voucher', contexts: ['vouchers', 'sales'], roles: ['admin', 'accountant'] },
  { id: 'voucher-cancel', keys: 'Alt+X', label: 'Cancel voucher', category: 'voucher', contexts: ['vouchers', 'sales'] },
  { id: 'voucher-alter', keys: 'Ctrl+Enter', label: 'Alter voucher', category: 'voucher', contexts: ['day-book', 'voucher-register', 'ledger-vouchers'] },
  { id: 'voucher-type', keys: 'Ctrl+V', label: 'Change Voucher Type', category: 'voucher', contexts: ['vouchers', 'sales'] },
  { id: 'voucher-type-h', keys: 'Ctrl+H', label: 'Change Voucher Type', category: 'voucher', contexts: ['vouchers', 'sales'] },
  { id: 'voucher-insert-line', keys: 'Alt+N', label: 'Insert line', category: 'voucher', contexts: ['vouchers', 'sales'] },
  { id: 'voucher-remove-line', keys: 'Alt+R', label: 'Remove line', category: 'voucher', contexts: ['vouchers', 'sales'] },

  // —— 6️⃣ INVENTORY / ITEM ENTRY (context: item grid) ——
  { id: 'inventory-item-list', keys: 'Ctrl+I', label: 'Item List', category: 'inventory', contexts: ['vouchers', 'sales'] },
  { id: 'inventory-unit-list', keys: 'Ctrl+U', label: 'Unit List', category: 'inventory', contexts: ['vouchers', 'sales', 'stock-items'] },
  { id: 'inventory-godown-list', keys: 'Ctrl+G', label: 'Godown List', category: 'inventory', contexts: ['vouchers', 'sales'] },
  { id: 'inventory-hsn-lookup', keys: 'Ctrl+H', label: 'HSN/SAC lookup', category: 'inventory', contexts: ['gst-rates', 'tax-ledgers'] },
  { id: 'inventory-quantity-mode', keys: 'Alt+Q', label: 'Quantity mode', category: 'inventory', contexts: ['vouchers', 'sales'] },
  { id: 'inventory-rate-mode', keys: 'Alt+R', label: 'Rate mode', category: 'inventory', contexts: ['vouchers', 'sales'] },

  // —— 7️⃣ GST / TAX ——
  { id: 'gst-details', keys: 'Alt+G', label: 'GST Details', category: 'gst', contexts: ['vouchers', 'sales', 'gst-rates'] },
  { id: 'gst-hsn-details', keys: 'Alt+H', label: 'HSN/SAC Details', category: 'gst', contexts: ['vouchers', 'sales', 'gst-rates'] },
  { id: 'gst-tax-breakdown', keys: 'Alt+T', label: 'Tax Breakdown', category: 'gst', contexts: ['vouchers', 'sales', 'tax-ledgers'] },
  { id: 'gst-tax-analysis', keys: 'Ctrl+T', label: 'GST Tax Analysis', category: 'gst', contexts: ['vouchers', 'sales', 'tax-ledgers', 'gst-rates'] },
  { id: 'gst-eway', keys: 'Alt+E', label: 'E-Way Bill', category: 'gst', contexts: ['vouchers', 'sales'] },

  // —— 8️⃣ VOUCHER CONFIG (F12 context) ——
  { id: 'config-close', keys: 'Escape', label: 'Close Configuration', category: 'config', contexts: ['config'] },
  { id: 'config-open', keys: 'F12', label: 'Open Configuration', category: 'config' },
  { id: 'config-show-all', keys: 'Ctrl+F12', label: 'Show All Configurations', category: 'config' },
  { id: 'config-buyer', keys: 'Alt+B', label: 'Buyer Details', category: 'config', contexts: ['config'] },
  { id: 'config-order-dispatch', keys: 'Alt+O', label: 'Order / Dispatch', category: 'config', contexts: ['config'] },
  { id: 'config-export-details', keys: 'Alt+X', label: 'Export Details', category: 'config', contexts: ['config'] },
  { id: 'config-stock', keys: 'Alt+S', label: 'Stock Settings', category: 'config', contexts: ['config'] },
  { id: 'config-tax', keys: 'Alt+T', label: 'Tax Settings', category: 'config', contexts: ['config'] },

  // —— 9️⃣ REPORTS & DRILL-DOWN ——
  { id: 'reports-drilldown', keys: 'Enter', label: 'Drill-down', category: 'reports', contexts: ['trial-balance', 'balance-sheet', 'profit-loss', 'day-book', 'stock-summary', 'receivables-payables', 'dashboard'] },
  { id: 'reports-expand', keys: 'Space', label: 'Expand / Collapse', category: 'reports', contexts: ['trial-balance', 'balance-sheet', 'profit-loss', 'stock-summary'] },
  { id: 'reports-detailed', keys: 'Alt+F1', label: 'Detailed View', category: 'reports', contexts: ['trial-balance', 'balance-sheet', 'profit-loss'] },
  { id: 'reports-condensed', keys: 'Ctrl+F1', label: 'Condensed View', category: 'reports', contexts: ['trial-balance', 'balance-sheet', 'profit-loss'] },
  { id: 'reports-gst-analysis', keys: 'Alt+A', label: 'GST Analysis', category: 'reports', contexts: ['vouchers', 'sales', 'tax-ledgers'] },
  { id: 'reports-stock-summary', keys: 'Alt+S', label: 'Stock Summary', category: 'reports', contexts: ['vouchers', 'sales', 'stock-summary'] },
  { id: 'reports-ledger', keys: 'Alt+L', label: 'Ledger Report', category: 'reports', contexts: ['ledger-vouchers', 'chart-of-accounts'] },
  { id: 'reports-balance-sheet', keys: 'Alt+B', label: 'Balance Sheet', category: 'reports', contexts: ['gateway', 'balance-sheet'] },
  { id: 'reports-pl', keys: 'Alt+P', label: 'Profit & Loss', category: 'reports', contexts: ['gateway', 'profit-loss'] },

  // —— 🔟 SPECIAL ——
  { id: 'special-calculator', keys: 'Ctrl+K', label: 'Calculator', category: 'special' },
  { id: 'special-refresh', keys: 'Ctrl+R', label: 'Refresh', category: 'special' },
  { id: 'special-recompute', keys: 'Ctrl+Shift+R', label: 'Recompute balances', category: 'special', roles: ['admin'] },
  { id: 'share-menu', keys: 'Alt+M', label: 'Share menu', category: 'global' },
  { id: 'line-colors', keys: 'C', label: 'Line colours', category: 'global', contexts: ['gateway'] },
];

/** Resolve effective context: activeView or 'config' when config modal open */
export function getEffectiveContext(activeView: string, isConfigOpen: boolean): string {
  if (isConfigOpen) return 'config';
  return activeView;
}

/** Find shortcut by keys + context. Prefer context-specific over global. */
export function findShortcut(
  keyCombo: string,
  context: string,
  role: UserRole,
  registry: ShortcutDef[] = SHORTCUT_REGISTRY
): ShortcutDef | null {
  const normalized = normalizeKeyCombo(keyCombo);
  const withContext = registry.filter(
    (s) => normalizeKeyCombo(s.keys) === normalized && (!s.roles?.length || s.roles.includes(role))
  );
  const exact = withContext.find((s) => s.contexts?.includes(context));
  if (exact) return exact;
  const global = withContext.find((s) => !s.contexts?.length);
  return global ?? null;
}

/** Get shortcut hint for UI tooltips */
export function getShortcutHint(actionId: string, registry: ShortcutDef[] = SHORTCUT_REGISTRY): string {
  const s = registry.find((r) => r.id === actionId);
  return s ? s.keys : '';
}

/** Get all shortcuts for a context (for help / status bar) */
export function getShortcutsForContext(context: string, role: UserRole, registry: ShortcutDef[] = SHORTCUT_REGISTRY): ShortcutDef[] {
  return registry.filter((s) => {
    if (s.roles?.length && !s.roles.includes(role)) return false;
    if (!s.contexts?.length) return true;
    return s.contexts.includes(context);
  });
}

/** Register plugin shortcuts (future) */
const pluginShortcuts: ShortcutDef[] = [];

export function registerPluginShortcuts(namespace: string, shortcuts: ShortcutDef[]): void {
  const withNamespace = shortcuts.map((s) => ({ ...s, plugin: namespace }));
  pluginShortcuts.push(...withNamespace);
}

export function getPluginShortcuts(): ShortcutDef[] {
  return pluginShortcuts;
}

export function getFullRegistry(): ShortcutDef[] {
  return [...SHORTCUT_REGISTRY, ...pluginShortcuts];
}
