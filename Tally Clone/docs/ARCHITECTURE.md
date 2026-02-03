# Tally Prime–Style Accounting & Inventory – Architecture

## 1. Feature Architecture

### 1.1 Core Navigation (Gateway)

```
Gateway (Dashboard)
├── Masters
│   ├── Create / Alter Ledgers
│   ├── Chart of Accounts
│   ├── Stock Items
│   └── Stock Groups
├── Transactions
│   ├── Accounting Vouchers
│   └── Day Book
├── Utilities
│   ├── Banking
│   └── Capital / Loan Section
├── Reports
│   ├── Balance Sheet
│   ├── Profit & Loss Account
│   ├── Stock Summary
│   ├── Ratio Analysis
│   └── Dashboard
└── Quit
```

- **Keyboard-first**: F1–F12, Enter, Esc, Space, ↑↓ for selection.
- **Single central entry point**; every screen reachable from Gateway.

### 1.2 Accounting Vouchers

| Voucher Type | Primary Dr | Primary Cr | Use Case |
|--------------|------------|------------|----------|
| Receipt      | Cash/Bank  | Party/Income | Money received |
| Payment      | Party/Expense | Cash/Bank | Money paid |
| Contra       | Cash/Bank  | Cash/Bank | Transfer between accounts |
| Journal      | Any        | Any       | Adjustments |
| Sales        | Debtors    | Sales + Output GST | Sales invoice |
| Purchase     | Purchase + Input GST | Creditors | Purchase invoice |

**Each voucher**:
- Date (with financial-year validation)
- Voucher number (auto or manual)
- Ledger lines (ledger, Dr/Cr, amount)
- Narration
- Real-time balance preview for selected ledger
- Validation before save: **Total Dr = Total Cr**

### 1.3 Day Book

- **Data**: All vouchers, day-wise.
- **Columns**: Date, Particulars, Voucher Type, Voucher No, Debit Amount, Credit Amount.
- **Filters**: Date range, Voucher type.
- **Action**: Open voucher (e.g. Enter on row) → Voucher viewer / edit.

### 1.4 Profit & Loss Account

**Structure** (auto-generated from ledgers by group/nature):

1. **Opening Stock** (from Stock groups / Inventory)
2. **Purchase** (Purchase Accounts group)
3. **Direct Expenses** (Expenses linked to trading)
4. **Gross Profit / Loss** = (Sales + Closing Stock) − (Opening Stock + Purchase + Direct Expenses)
5. **Indirect Incomes** (Other income groups)
6. **Indirect Expenses** (Other expense groups)
7. **Net Profit / Loss** = Gross P/L + Indirect Incomes − Indirect Expenses

- Period selection (from–to date).
- Drill-down on any line → Ledger vouchers.
- Totals balance by construction (Net P/L carried to Balance Sheet).

### 1.5 Balance Sheet

**Structure**:

- **Liabilities**: Capital, Loans, Current Liabilities (Creditors, etc.), Reserves.
- **Assets**: Fixed Assets, Current Assets (Cash, Bank, Debtors, Stock), Investments.

**Rule**: **Total Assets = Total Liabilities** (including Net P/L on liability side).

- Period filter (as-of date / period end).
- Drill-down to ledger / vouchers.

### 1.6 Stock Summary (Inventory)

- **Masters**: Stock Groups, Stock Items, Units (Nos, Kg, Mtr, Rolls, Pkt, etc.).
- **Report**: Item-wise (or group-wise) stock.
  - Columns: Item/Group, Quantity, Rate, Value.
  - Negative stock highlighted.
  - Views: Monthly summary, Item-wise.
  - Drill-down: Stock movement / stock vouchers (when implemented).

### 1.7 Banking & Capital (Loan Module)

- **TallyCapital-style**:
  - Credit score check (mock or API).
  - Loan eligibility from: Turnover, Profit, Stock value.
  - EMI calculator.
  - Loan application flow (steps).
  - Partner-based lending (API-ready hooks).

---

## 2. Database Schema

### 2.1 Core Tables (Relational Model)

```sql
-- Companies & period
companies (id, name, financial_start, financial_end, base_currency_id, ...)
periods (id, company_id, start_date, end_date, is_locked)

-- Chart of Accounts
groups (id, name, alias, under_group_id, nature, is_system, ...)
ledgers (id, name, alias, group_id, opening_balance, opening_balance_dc, ...)

-- Vouchers (double-entry)
voucher_types (id, name, abbreviation, default_dr_cr_rule, numbering_method, ...)
vouchers (id, company_id, voucher_type_id, date, number, reference, narration, ...)
voucher_lines (id, voucher_id, ledger_id, dr_cr, amount, narration, line_order)

-- Inventory
stock_groups (id, name, under_group_id, add_quantities, ...)
units (id, symbol, formal_name, base_unit_id, conversion_factor, ...)
stock_items (id, name, stock_group_id, unit_id, opening_qty, opening_rate, ...)
godowns (id, name, under_godown_id, ...)
stock_ledgers (id, ledger_id, stock_item_id, godown_id, qty, rate, ...)  -- or movement table

-- Optional: for real-time balance
ledger_balances (ledger_id, period_id, balance, balance_dc)
```

### 2.2 In-App (Zustand) Model (Current)

- **Companies**: `companies[]`, `companyId`, `financialPeriodStart`, `financialPeriodEnd`.
- **Ledgers**: `mockData.ledgers[]` (id, name, under, amount, openingBalanceType).
- **Groups**: `groups[]` (id, name, under, natureOfGroup, ...).
- **Vouchers**: `mockData.vouchers[]` (id, date, type, party, amount, lines[]).
- **Voucher lines**: `VoucherEntryLine[]` (ledgerName, drCr, amount, narration).
- **Stock**: `stockGroups[]`, `stockItems[]`, `inventoryUnits[]`, `godowns[]`.
- **Reports**: Derived from ledgers + vouchers (e.g. Trial Balance, P&L, Balance Sheet).

---

## 3. API Design (REST – for backend integration)

### 3.1 Companies & Periods

- `GET /companies` – list companies
- `GET /companies/:id` – company detail
- `GET /companies/:id/periods` – periods
- `POST /companies/:id/periods` – create period (e.g. lock year)

### 3.2 Ledgers & Groups

- `GET /groups` – tree or flat list
- `GET /ledgers` – filter by group, inactive
- `POST /ledgers`, `PUT /ledgers/:id`, `DELETE /ledgers/:id` (soft delete if used)
- `GET /ledgers/:id/balance?from=&to=` – balance in period

### 3.3 Vouchers

- `GET /vouchers?from=&to=&type=&company_id=` – list (Day Book)
- `GET /vouchers/:id` – single voucher with lines
- `POST /vouchers` – create (body: type_id, date, number?, reference?, narration?, lines[])
- `PUT /vouchers/:id` – update
- `DELETE /vouchers/:id` – delete (or cancel)
- **Validation**: 400 if Dr total ≠ Cr total or invalid ledger/date

### 3.4 Reports

- `GET /reports/day-book?from=&to=&voucher_type=`
- `GET /reports/profit-loss?from=&to=&company_id=`
- `GET /reports/balance-sheet?as_on=&company_id=`
- `GET /reports/stock-summary?as_on=&group_id=&godown_id=`
- `GET /reports/trial-balance?from=&to=`

### 3.5 Stock

- `GET /stock-groups`, `POST /stock-groups`, `PUT /stock-groups/:id`
- `GET /stock-items`, `POST /stock-items`, `PUT /stock-items/:id`
- `GET /units`
- `GET /stock-summary` – aggregated qty, rate, value

### 3.6 Banking / Capital (Loans)

- `POST /loan/eligibility` – body: turnover, profit, stock_value → eligibility, suggested limit
- `POST /loan/emi-calculate` – body: principal, rate, tenure_months → EMI
- `POST /loan/application` – submit application (API-ready for partner)
- `GET /loan/credit-score` – mock or partner API

---

## 4. Core Business Logic

### 4.1 Double-Entry Rule

- Every voucher must have **Σ Dr = Σ Cr**.
- On save: persist `voucher_lines`; optional: update `ledger_balances` or recompute from lines.

### 4.2 Ledger Balance

- **Balance** = Opening balance + Σ(Dr) − Σ(Cr) in period (or all up to date).
- **Display**: Show “Current balance” on voucher screen for selected ledger (from store or API).

### 4.3 Financial Year

- **Date validation**: Voucher date must be within company `financial_start` and `financial_end` (or current open period).
- **Lock**: Optional period lock so no edits after closing.

### 4.4 P&L Calculation

- **Income groups**: e.g. Sales Accounts → sum of ledger credits (or by nature).
- **Expense groups**: Purchase, Direct/Indirect expenses → sum of debits.
- **Gross P/L** = Total Income (trading) − Total Expense (trading); include Opening/Closing Stock if applicable.
- **Net P/L** = Gross P/L + Other Income − Other Expenses.
- **Carry**: Net P/L → Balance Sheet (Capital side).

### 4.5 Balance Sheet

- **Assets**: Sum of ledger balances (Dr − Cr) for asset groups.
- **Liabilities**: Sum of ledger balances (Cr − Dr) for liability groups + Capital + Net P/L.
- **Check**: Total Assets = Total Liabilities.

### 4.6 Stock Value

- **Item value** = Quantity × Rate (opening or weighted average/FIFO if implemented).
- **Stock Summary** = Sum per item or group; highlight negative qty.

### 4.7 Loan Eligibility (Mock / API)

- **Eligibility** = f(turnover, profit, stock_value) e.g. `min(turnover * 0.1, profit * 2, stock_value * 0.5)`.
- **EMI** = P × r × (1+r)^n / ((1+r)^n − 1); P = principal, r = monthly rate, n = months.

---

## 5. UI Flow

### 5.1 Gateway → Screens

| Gateway Item       | Target View / Action                    |
|--------------------|------------------------------------------|
| Create             | Master Creation (Ledger, Group, etc.)    |
| Alter              | Master Alteration (list → alter)         |
| Chart of Accounts  | CoA tree (Groups + Ledgers)              |
| Stock Items        | List of Stock Items                      |
| Stock Groups       | List of Stock Groups / Stock Masters     |
| Accounting Vouchers| Voucher entry (type chosen by F4–F9)     |
| Day Book           | Day Book report (date, type filter)      |
| Banking            | Banking summary / Bank ledgers            |
| Capital / Loan     | Capital & Loan module (eligibility, EMI) |
| Balance Sheet      | Balance Sheet report                     |
| Profit & Loss      | P&L report                               |
| Stock Summary      | Stock Summary report                     |
| Ratio Analysis     | Ratio report                             |
| Dashboard          | Dashboard (KPIs, shortcuts)               |
| Quit               | Quit confirmation → Gateway or exit    |

### 5.2 Voucher Entry Flow

1. Gateway → Accounting Vouchers (or F4–F9).
2. Select type/class if needed (Ctrl+V).
3. Enter date (F2), ledger lines (Dr/Cr), narration.
4. Balance preview updates on ledger change.
5. Ctrl+A → Validate (Dr=Cr, date in FY) → Save; else show error.

### 5.3 Day Book Flow

1. Gateway → Day Book.
2. Set date range and voucher type filter.
3. Rows = vouchers (date, particulars, type, no, dr, cr).
4. Enter on row → Open voucher viewer / edit.

### 5.4 Report Flow (P&L, Balance Sheet)

1. Gateway → Report.
2. Set period (from–to or as-on).
3. View sections and totals; click line → drill-down to ledger/vouchers.

---

## 6. Sample Data & Test Cases

### 6.1 Sample Ledgers (by group)

- **Capital**: Capital Account – Proprietor
- **Current Liabilities**: Sundry Creditors, Outstanding Expenses
- **Bank**: Bank - SBI Current A/c
- **Current Assets**: Cash in Hand, Sundry Debtors, Stock
- **Sales**: Sales - Local, Sales - Interstate
- **Purchase**: Purchase - Local
- **Expenses**: Salary, Rent, Other Expenses
- **Fixed Assets**: Furniture, Equipment

### 6.2 Sample Vouchers

- **Opening**: One journal per ledger with opening balance (Dr or Cr).
- **Sales**: 2–3 sales vouchers (Dr Debtors, Cr Sales + Output GST).
- **Purchase**: 2–3 purchase vouchers (Dr Purchase + Input GST, Cr Creditors).
- **Payment**: 2–3 payment vouchers (Dr Expense, Cr Bank).
- **Receipt**: 2–3 receipt vouchers (Dr Bank, Cr Debtors).
- **Journal**: 1–2 adjustment vouchers.

### 6.3 Test Cases

1. **Voucher save**: Dr ≠ Cr → reject with message.
2. **Voucher date**: Outside FY → reject.
3. **Day Book**: Filter by type → only that type; by date → only in range.
4. **P&L**: Total Income − Total Expenses = Net P/L; same as store-derived.
5. **Balance Sheet**: Total Assets = Total Liabilities after including Net P/L.
6. **Stock Summary**: At least one item; negative qty highlighted.

---

## 7. File / Module Map (Current App)

| Area           | Location / Files |
|----------------|-------------------|
| Gateway        | `components/views/GatewayView.tsx` (exact menu: Create/Alter Ledgers, CoA, Stock Items, Stock Groups, Accounting Vouchers, Day Book, Banking, Capital/Loan, Balance Sheet, P&L Account, Stock Summary, Ratio Analysis, Dashboard, Quit) |
| Vouchers       | `AccountingVoucherView.tsx`, `VoucherRightPanel.tsx`, `ChangeVoucherTypeModal.tsx` |
| Day Book       | `reports/DayBookView.tsx` |
| P&L            | `reports/ProfitLossView.tsx` (store-driven, period filter, drill-down to ledger vouchers) |
| Balance Sheet  | `reports/BalanceSheetView.tsx` (store-driven, as-on date, drill-down, Assets = Liabilities with Net P/L) |
| Stock Summary  | `reports/StockSummaryView.tsx` (item/group/monthly view, qty/rate/value, negative stock highlight, drill-down to item alter) |
| Banking        | `views/BankingView.tsx` (bank/cash ledgers and balances) |
| Capital / Loan | `views/CapitalLoanView.tsx` (credit score mock, eligibility, EMI calculator, loan application flow, API-ready) |
| Stock Masters  | `StockMastersView.tsx`, `InventoryMasterListView.tsx`, Stock Group/Item creation |
| Reports        | `reports/*` |
| Store          | `store/useAppStore.ts` (ledgers, vouchers, groups, stock, reports) |
| Keyboard       | `hooks/useKeyboardShortcuts.ts`, `utils/shortcuts.ts` |

---

This document serves as the single source of truth for feature architecture, data model, API contract, business rules, and UI flow for the Tally Prime–style accounting and inventory application.
