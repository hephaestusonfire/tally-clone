# Business Management App – Feature Design (Tally Prime–Style)

## 1. Feature Breakdown

### 1.1 Core Accounting
| Feature | Description | Implementation |
|--------|-------------|----------------|
| **Profit & Loss** | Opening Stock → Purchase → Direct Expenses → Gross Profit (c/f & b/f) → Indirect Income/Expense → Net Profit | `ProfitLossView.tsx` – store-driven, period filter, drill-down |
| **Balance Sheet** | Assets & Liabilities, Current Assets/Liabilities, closing balances from vouchers | `BalanceSheetView.tsx` – period comparison (current vs previous) |
| **Trading Summary** | Sales, Purchase, Gross Profit derived from P&L | Part of P&L or separate report |
| **Date range** | From–To on all reports | Period filter component / state |
| **Drill-down** | Totals → Ledger list → Voucher entries | `setLedgerVouchersLedger` → `LedgerVouchersView` |

### 1.2 Inventory & Stock
| Feature | Description | Implementation |
|--------|-------------|----------------|
| **Stock Summary** | Item-wise Qty, Rate, Value; Opening, Inwards, Outwards, Closing | `StockSummaryView.tsx` – columns + movement summary |
| **Negative stock** | Alerts / highlight when qty &lt; 0 | Red row / badge in Stock Summary |
| **Units** | Nos, Pcs, Kg, Mtr, Rolls, Pkt, etc. | `inventoryUnits[]` in store; display in item list |
| **Stock Group / Item** | Hierarchy (Primary → Raw Materials, Finished Goods, etc.) | `stockGroups[]`, `stockItems[]` with `under` |
| **Valuation** | FIFO, Weighted Average, Standard Cost | `StockItem.valuationMethod`; aggregation in report |

### 1.3 Receivables & Payables
| Feature | Description | Implementation |
|--------|-------------|----------------|
| **Ageing** | 0–30, 31–60, 61–90, 90+ days | Bucket by voucher date / due date |
| **Overdue** | Receivables/Payables past due date | Filter ledger balance by due date |
| **Outstanding** | Pending amount per ledger | Sum of (Dr − Cr) for Sundry Debtors/Creditors |
| **Summary** | Ledger-wise outstanding | `ReceivablesPayablesView` – table + ageing columns |

### 1.4 Cash & Bank
| Feature | Description | Implementation |
|--------|-------------|----------------|
| **Cash-in-hand** | Single ledger balance | From ledgers under Cash-in-hand |
| **Multiple banks** | One row per bank ledger | `BankingView` – list from store |
| **Net cash flow** | Inflow − Outflow in period | Sum Receipt Dr − Payment Cr (or by lines) |
| **Bank-wise closing** | Balance per bank as of date | From ledger balance / voucher lines |

### 1.5 Dashboard (Visual Analytics)
| Feature | Description | Implementation |
|--------|-------------|----------------|
| **Sales Trend** | Monthly line chart | Aggregate vouchers type=Sales by month |
| **Purchase Trend** | Monthly line chart | Aggregate vouchers type=Purchase by month |
| **Cash In / Out** | Summary tiles | Receipt total, Payment total |
| **Trading** | Gross Profit, Net Profit, Sales, Purchases | From P&L logic / store |
| **Top Ledgers / Banks** | By balance | Sort ledgers by amount, take top N |
| **Assets vs Liabilities** | Pie or bar | Sum asset groups, liability groups |
| **Inventory Summary** | Total stock value | Sum (qty × rate) over stock items |
| **Ratios** | Inventory Turnover, Debt-Equity, Receivable days, ROI % | Formulae in `RatioAnalysisView` / dashboard |

### 1.6 Filters & Controls
| Feature | Description | Implementation |
|--------|-------------|----------------|
| **Period** | From–To date | Shared state or URL; applied to reports |
| **Company** | Multi-company selector | `companies[]`, `companyId` in store |
| **Stock Group / Ledger** | Filter dropdowns | Filter report rows by selected group/ledger |
| **Drill-down** | Every report row → ledger → vouchers | Consistent pattern: set ledger, open Ledger Vouchers |

### 1.7 UX & UI
| Requirement | Implementation |
|-------------|----------------|
| Desktop, keyboard-driven | F1–F12, Enter, Esc, ↑↓; Tally-style shortcuts |
| Right panel | Change View, Filter, Configure, Add/Remove Tiles | `RightPanel.tsx` – context per view |
| Fast loading | Virtualise long lists; memoise report aggregation |
| Export PDF/Excel | Export modal (`ExportModal.tsx`) – wire to current report; use jspdf/xlsx or `GET /reports/.../export?format=pdf|xlsx` for server-side export |

---

## 2. Database Schema

### 2.1 Core (already in ARCHITECTURE.md – extended)

```sql
-- Companies & period
companies (id, name, financial_start, financial_end, base_currency_id)
periods (id, company_id, start_date, end_date, is_locked)

-- Chart of Accounts
groups (id, name, under_group_id, nature)  -- nature: Assets|Liabilities|Income|Expenses
ledgers (id, name, group_id, opening_balance, opening_balance_dc)

-- Vouchers (double-entry)
voucher_types (id, name, abbreviation, numbering_method)
vouchers (id, company_id, voucher_type_id, date, number, reference, narration)
voucher_lines (id, voucher_id, ledger_id, dr_cr, amount, narration, line_order)

-- Ledger balance (computed or stored)
ledger_balances (ledger_id, period_id, as_on_date, balance, balance_dc)
```

### 2.2 Inventory (extended)

```sql
units (id, symbol, formal_name, base_unit_id, conversion_factor)
stock_groups (id, name, under_group_id, add_quantities)
stock_items (id, name, stock_group_id, unit_id, opening_qty, opening_rate,
             valuation_method)  -- FIFO | WEIGHTED_AVG | STANDARD_COST
godowns (id, name, under_godown_id)
stock_movements (id, stock_item_id, godown_id, date, voucher_id, qty, rate, movement_type)
-- movement_type: OPENING | INWARD | OUTWARD | ADJUSTMENT
```

### 2.3 Receivables / Payables (for ageing)

```sql
-- Optional: bill-wise for ageing
party_bills (id, ledger_id, voucher_id, date, due_date, amount, balance, dr_cr)
-- Or derive ageing from voucher_lines + date for ledger
```

**In-app (current):** Outstanding = ledger balance (Dr − Cr). Ageing = bucket vouchers by (today − voucher date) for that ledger.

---

## 3. API Flow

### 3.1 Reports (GET)

| API | Query | Response |
|-----|-------|----------|
| `GET /reports/profit-loss` | from, to, company_id | Sections: opening_stock, purchase, direct_exp, gross_profit, indirect_inc, indirect_exp, net_profit |
| `GET /reports/balance-sheet` | as_on, company_id, compare_to (optional) | assets[], liabilities[], comparison[] |
| `GET /reports/stock-summary` | as_on, group_id, godown_id | items: [{ item, opening, inwards, outwards, closing, rate, value }] |
| `GET /reports/receivables-payables` | as_on, type (receivables\|payables) | ledgers: [{ name, balance, ageing_buckets }] |
| `GET /reports/cash-bank` | from, to, company_id | cash_in_hand, banks[], net_inflow, net_outflow |
| `GET /reports/dashboard` | from, to, company_id | sales_trend[], purchase_trend[], cash_in, cash_out, ratios, top_ledgers |

### 3.2 Calculations (server or client)

- **Ledger balance (as_on):** Opening + Σ(voucher_lines where date ≤ as_on) with Dr/Cr.
- **P&L (from–to):** Income/Expense groups from ledger balances in period (or period movement).
- **Gross Profit:** (Sales + Closing Stock) − (Opening Stock + Purchase + Direct Expenses).
- **Stock movement:** Inwards = sum of INWARD; Outwards = sum of OUTWARD; Closing = Opening + Inwards − Outwards.

---

## 4. UI Wireframe Description

### 4.1 Report Screen (common layout)
- **Top bar:** Title, Period (From–To or As on), Company selector.
- **Left:** Optional section index (e.g. P&L sections).
- **Center:** Main table (Particulars | Amount | Comparison).
- **Right panel:** Change View, Filter (Ledger, Stock Group), Configure, Export (PDF/Excel).
- **Bottom:** Status bar with shortcuts (Enter drill-down, Esc back).

### 4.2 Dashboard
- **Top:** Period + Company; Add/Remove Tiles.
- **Row 1:** KPI tiles (Sales, Purchase, Gross Profit, Net Profit, Cash In, Cash Out).
- **Row 2:** Sales Trend (line), Purchase Trend (line).
- **Row 3:** Assets vs Liabilities (pie/bar), Top Ledgers (table or bar).
- **Row 4:** Inventory Summary tile, Accounting Ratios (Inventory Turnover, Debt-Equity, Receivable days, ROI %).

### 4.3 Stock Summary
- **Columns:** Item/Group | Opening | Inwards | Outwards | Closing | Rate | Value | Unit.
- **Filter:** Stock Group dropdown; As on date.
- **Negative stock:** Row background red or icon.

### 4.4 Receivables / Payables
- **Columns:** Ledger | Outstanding | 0–30 | 31–60 | 61–90 | 90+ | Overdue (Y/N).
- **Filter:** As on; Type = Receivables or Payables.

---

## 5. Sample Calculations

### 5.1 P&L (Gross Profit)
- Opening Stock = sum of stock ledger opening (or from inventory).
- Purchase = sum of ledgers under Purchase Accounts (debit side).
- Direct Expenses = sum of ledgers under Direct Expenses.
- Sales = sum of ledgers under Sales Accounts (credit side).
- Closing Stock = as per Stock Summary total value.
- **Gross Profit** = (Sales + Closing Stock) − (Opening Stock + Purchase + Direct Expenses).
- **Gross Profit b/f** = same figure carried to next section.
- **Indirect Income** = sum of Indirect Incomes group.
- **Indirect Expenses** = sum of Indirect Expenses group.
- **Net Profit** = Gross Profit + Indirect Income − Indirect Expenses.
- **Net Profit c/f** = carried to Balance Sheet (liability side).

### 5.2 Balance (from vouchers)
- For ledger L, as_on date D:
  - Balance = Opening_balance + Σ(amount where dr_cr='Dr' and date ≤ D) − Σ(amount where dr_cr='Cr' and date ≤ D).
  - If result &lt; 0, balance is Credit; else Debit.

### 5.3 Stock (Weighted Average)
- Closing value = Σ(layers): each layer = qty × rate; rate = weighted avg of (opening + inwards) / (opening qty + inward qty).
- **FIFO:** Consume oldest batches first; closing = remaining batches.
- **Standard Cost:** closing value = closing_qty × standard_rate (fixed rate per item).

### 5.4 Ratios
- **Inventory Turnover** = COGS / Average Stock (value).
- **Debt-Equity** = Total Debt (loans) / Equity (capital + reserves + P/L).
- **Receivable Turnover (days)** = (Debtors × 365) / Credit Sales.
- **ROI %** = (Net Profit / Total Assets) × 100.

---

## 6. Dashboard Aggregation Logic

1. **Sales Trend (monthly):** Group vouchers (type = Sales) by month; sum amount.
2. **Purchase Trend (monthly):** Group vouchers (type = Purchase) by month; sum amount.
3. **Cash In:** Sum of Receipt vouchers (amount or lines to Cash/Bank).
4. **Cash Out:** Sum of Payment vouchers (amount or lines from Cash/Bank).
5. **Gross / Net Profit:** From P&L aggregation for selected period.
6. **Top Ledgers:** Sort ledgers by |balance|; take top 5 or 10.
7. **Assets vs Liabilities:** Sum asset groups, sum liability groups (+ Net P/L); pass to pie/bar.
8. **Inventory Summary:** Sum over stock items (closing_qty × rate) or opening value + movement.
9. **Ratios:** Compute from ledger balances and P&L totals as above.

This document is the single reference for feature breakdown, data models, APIs, calculation logic, and UI layout for the business management app.
