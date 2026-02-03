# Keyboard Shortcuts (Tally Prime–style)

Centralized registry: `src/config/shortcutRegistry.ts`. Handlers: `src/config/shortcutHandlers.ts`.  
All screens are fully operable via keyboard; no shortcut conflicts globally; context-aware; F-keys same logical role.

## Design rules (mandatory)

- **ESC** never saves.
- **Ctrl+A** always means Accept.
- Every screen is fully operable via keyboard.
- Shortcuts are context-aware (view / config modal).
- Role-based: Admin / Accountant / Viewer (see `userRole` in app store).
- Plugin shortcuts can be registered via `registerPluginShortcuts(namespace, shortcuts)`.

---

## 1. Global (available everywhere)

| Shortcut   | Action                          |
|-----------|-----------------------------------|
| Ctrl+N    | Create new item (context-aware)   |
| Ctrl+A    | Accept / Save                    |
| Ctrl+Q    | Quit current screen              |
| Ctrl+C    | Cancel / Close without saving    |
| Ctrl+E    | Export                           |
| Ctrl+I    | Import (reports / gateway)       |
| Ctrl+P    | Print                            |
| Ctrl+M    | Multi-select mode                |
| Ctrl+F    | Find                             |
| Alt+F     | Advanced find (masters + vouchers)|
| Escape    | Back / Previous screen           |
| Ctrl+Escape | Gateway (Home)                 |
| Alt+M     | Share menu                       |

---

## 2. Function keys (primary navigation)

| Key  | Action                          |
|------|----------------------------------|
| F1   | Help / Product Help              |
| F2   | Change Date                      |
| F3   | Change Company                   |
| F4   | Contra Voucher                   |
| F5   | Payment Voucher                  |
| F6   | Receipt Voucher                  |
| F7   | Journal Voucher                  |
| F8   | Sales Voucher                    |
| F9   | Purchase Voucher                 |
| F10  | Other Vouchers                   |
| F11  | Features / Company Features      |
| F12  | Configure (context-sensitive)    |

---

## 3. Gateway (home screen)

| Shortcut | Action            |
|----------|-------------------|
| G        | Go To             |
| K        | Company           |
| Y        | Data              |
| Z        | Exchange          |
| B        | Banking           |
| D        | Display Reports   |
| M        | Masters           |
| C        | Line colours      |

---

## 4. Master creation / alteration

| Shortcut   | Action                    | Context              |
|------------|---------------------------|----------------------|
| Alt+C      | Create master on-the-fly  | Vouchers, CoA, etc.  |
| Ctrl+Enter | Alter selected master    | Alter, CoA           |
| Ctrl+D     | Delete master             | Alter, CoA (Admin)   |
| Ctrl+O     | Open master               | Alter, CoA           |
| Ctrl+L     | Ledger List               | Vouchers, Alter, CoA |
| Ctrl+I     | Inventory List            | Alter, Stock         |

---

## 5. Voucher entry (accounting)

| Shortcut   | Action               |
|------------|----------------------|
| Alt+2      | Duplicate Voucher    |
| Alt+A      | Add voucher          |
| Alt+D      | Delete voucher       |
| Alt+X      | Cancel voucher       |
| Ctrl+Enter | Alter voucher        |
| Ctrl+L     | Ledger List          |
| Ctrl+V / Ctrl+H | Change Voucher Type |
| Alt+N      | Insert line          |
| Alt+R      | Remove line          |

---

## 6. Inventory / item entry

| Shortcut | Action         |
|----------|----------------|
| Ctrl+I   | Item List      |
| Ctrl+U   | Unit List      |
| Ctrl+G   | Godown List    |
| Ctrl+H   | HSN/SAC lookup |
| Alt+Q    | Quantity mode  |
| Alt+R    | Rate mode      |

---

## 7. GST / tax

| Shortcut | Action            |
|----------|-------------------|
| Alt+G    | GST Details       |
| Alt+H    | HSN/SAC Details   |
| Alt+T    | Tax Breakdown     |
| Ctrl+T   | GST Tax Analysis  |
| Alt+E    | E-Way Bill        |

---

## 8. Voucher configuration (F12)

| Shortcut   | Action                  |
|------------|-------------------------|
| F12        | Open Configuration      |
| Ctrl+F12   | Show All Configurations |
| Alt+B      | Buyer Details           |
| Alt+O      | Order / Dispatch        |
| Alt+X      | Export Details          |
| Alt+S      | Stock Settings          |
| Alt+T      | Tax Settings            |

---

## 9. Reports & drill-down

| Shortcut   | Action            |
|------------|-------------------|
| Enter      | Drill-down        |
| Space      | Expand / Collapse |
| Alt+F1     | Detailed View     |
| Ctrl+F1    | Condensed View    |
| Alt+A      | GST Analysis      |
| Alt+S      | Stock Summary     |
| Alt+L      | Ledger Report     |
| Alt+B      | Balance Sheet     |
| Alt+P      | Profit & Loss     |

---

## 10. Special

| Shortcut      | Action               |
|---------------|----------------------|
| Ctrl+K        | Calculator           |
| Ctrl+R        | Refresh              |
| Ctrl+Shift+R  | Recompute balances   |

---

## UI integration

- **Status bar**: Shows shortcuts for current context (from registry).
- **Tooltips**: Use `<ShortcutBadge actionId="global-accept" />` or `useShortcutHint('global-accept')`.
- **Role**: Set `userRole` in app store (`admin` | `accountant` | `viewer`). Admin-only shortcuts (e.g. Delete master, Recompute) are filtered by role.
- **Plugins**: `registerPluginShortcuts('my-plugin', [{ id: 'my-action', keys: 'Ctrl+Shift+X', label: 'My action', category: 'plugin', plugin: 'my-plugin' }])`. Handlers must be wired in `shortcutHandlers.ts` or via a plugin API.
