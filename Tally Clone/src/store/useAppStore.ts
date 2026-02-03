import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { createSalesVoucher, createPurchaseVoucher, createAccountingVoucher } from '../services/voucher.service';
import { validateGstAtVoucherSave } from '../services/gst.service';
import { createLedgerGroup, getLedgerGroups } from '../services/ledger-group.service';
import { createLedger } from '../services/ledger.service';

export type AppView =
  | 'dashboard'
  | 'vouchers'
  | 'masters'
  | 'stock-groups'
  | 'stock-items'
  | 'tax-ledgers'
  | 'gst-rates'
  | 'trial-balance'
  | 'balance-sheet'
  | 'profit-loss'
  | 'cash-flow'
  | 'ratio-analysis'
  | string;

export interface ReportAccount {
  id: number;
  name: string;
  amount: number;
  type: 'Dr' | 'Cr';
}

export type DrCr = 'Dr' | 'Cr';

export type LedgerRegistrationType = 'Regular' | 'Composition' | 'Unregistered';

export interface LedgerMailingDetails {
  name?: string;
  address?: string;
  state?: string;
  country?: string;
  pincode?: string;
  primaryMobile?: string;
  multipleMobiles?: boolean;
  defaultWhatsApp?: string;
  provideContactDetails?: boolean;
}

export interface LedgerBankingDetails {
  provide?: boolean;
  /** Maintain balances bill-by-bill (default No) */
  maintainBillByBill?: boolean;
  /** Enable cheque printing (default No; Yes if needed) */
  enableChequePrinting?: boolean;
  accountNumber?: string;
  ifsc?: string;
  bankName?: string;
  branch?: string;
}

export interface LedgerTaxDetails {
  pan?: string;
  registrationType?: LedgerRegistrationType;
  gstin?: string;
  additionalGstDetails?: boolean;
}

export interface Ledger {
  id: number;
  name: string;
  alias?: string;
  under: string;
  amount: number;
  /** Dr or Cr for opening balance */
  openingBalanceType?: DrCr;
  inactive?: boolean;
  /** Maintain balances bill-by-bill (Loans & Advances, Sundry Debtors etc.) */
  maintainBillByBill?: boolean;
  /** Credit period in days (e.g. Sundry Debtors) */
  creditPeriodDays?: number;
  mailingDetails?: LedgerMailingDetails;
  bankingDetails?: LedgerBankingDetails;
  taxDetails?: LedgerTaxDetails;
}

/** Single ledger line in a saved voucher (double-entry) */
export interface VoucherEntryLine {
  ledgerName: string;
  drCr: DrCr;
  amount: number;
  narration?: string;
}

export interface Voucher {
  id: number;
  date: string;
  type: string;
  /** Voucher type display name */
  typeName?: string;
  party: string;
  amount: number;
  /** Double-entry lines for Day Book / Ledger / Trial Balance / GST reports */
  lines?: VoucherEntryLine[];
  /** Optional voucher class name */
  voucherClassName?: string;
}

export interface CompanyFeature {
  id: number;
  name: string;
  enabled: boolean;
  use?: string;
}

/** HSN/SAC details source for stock group */
export type StockGroupHsnsacDetails = 'As per Company' | 'As per Stock Group' | 'Set at Group level';

export interface StockGroup {
  id: number;
  name: string;
  alias?: string;
  under: string;
  /** Should quantities of items be added? (Yes = true) */
  addQuantities: boolean;
  /** HSN/SAC code when set at group level */
  hsnsac?: string;
  /** HSN/SAC Details: As per Company / Stock Group / Set at Group level */
  hsnsacDetails?: StockGroupHsnsacDetails;
  /** GST Rate % when set at group level */
  gstRate?: number;
  /** Taxability Type: Taxable, Exempt, Nil Rated, etc. */
  taxabilityType?: string;
  /** Source of details: Company, Stock Group, etc. */
  sourceOfDetails?: string;
  inactive?: boolean;
}

/** Purchase invoice allocation method for group */
export type PurchaseAllocationMethod = 'Not Applicable' | 'Quantity' | 'Value' | 'FIFO' | 'LIFO';

/** Nature of group for accounting behaviour (Assets, Liabilities, Income, Expenses) */
export type NatureOfGroup = 'Assets' | 'Liabilities' | 'Income' | 'Expenses';

export interface Group {
  id: number;
  name: string;
  alias?: string;
  under: string;
  /** Nature of group: Assets, Liabilities, Income, Expenses */
  natureOfGroup?: NatureOfGroup;
  /** Language alias (More Details, Show More) */
  languageAlias?: string;
  /** Group behaves like a sub-ledger */
  behavesLikeSubLedger: boolean;
  /** Nett Debit/Credit Balances for Reporting */
  nettDebitCreditForReporting: boolean;
  /** Used for calculation (e.g. taxes, discounts) */
  usedForCalculation: boolean;
  purchaseAllocationMethod: PurchaseAllocationMethod;
  /** Method to allocate when used in sales invoice (if applicable) */
  salesAllocationMethod?: PurchaseAllocationMethod;
  /** GST Classification (Statutory / Classification) */
  gstClassificationName?: string;
  /** HSN/SAC reference if linked */
  hsnsacCode?: string;
  inactive?: boolean;
}

/** Inventory valuation method for closing stock & P&L */
export type StockItemValuationMethod = 'FIFO' | 'Average';

/** HSN/SAC or GST rate source for stock item (Tally-style) */
export type StockItemDetailsSource = 'As per Company' | 'As per Stock Group' | 'Set at Stock Item level';

export type TypeOfSupply = 'Goods' | 'Services';

export interface StockItem {
  id: number;
  name: string;
  alias?: string;
  /** Part number (optional) */
  partNo?: string;
  under: string;
  /** Stock Group name */
  categoryName?: string;
  /** Unit (e.g. Nos, Kg). Cannot change once used in vouchers. */
  unit: string;
  /** Allow quantity tracking; units required when true */
  allowQuantities: boolean;
  openingQty: number;
  rate: number;
  /** Opening value; typically openingQty * rate */
  value: number;
  /** Multi-line description */
  description?: string;
  /** HSN/SAC code when set at item level */
  hsnsac?: string;
  /** When true, use group HSN/SAC (legacy); prefer hsnsacDetails when present */
  inheritHsnsacFromGroup: boolean;
  /** HSN/SAC details: As per Company / Stock Group / Set at Stock Item level */
  hsnsacDetails?: StockItemDetailsSource;
  /** Source of details (display, e.g. Company / Stock Group) */
  sourceOfDetails?: string;
  /** GST applicability: true = Applicable, false = Not Applicable */
  gstApplicable?: boolean;
  /** GST rate details: As per Company / Stock Group / Set at Stock Item level */
  gstRateDetails?: StockItemDetailsSource;
  taxability?: string;
  gstRate?: number;
  /** Type of supply: Goods / Services */
  typeOfSupply?: TypeOfSupply;
  /** Rate of duty (optional numeric) */
  rateOfDuty?: number;
  /** Valuation method: FIFO or Average. Cannot change once used in vouchers. */
  valuationMethod: StockItemValuationMethod;
  /** Costing method (e.g. FIFO, Average). Cannot change once used in vouchers. */
  costingMethod?: string;
  /** Default/primary godown for opening balance; used for "stock exists" check. */
  godownName?: string;
  /** Notes (More Details) */
  notes?: string;
  /** Language alias (More Details, Show More) */
  languageAlias?: string;
  /** Alternate units of measurement */
  alternateUnits?: string;
  /** Default sales ledger for invoicing */
  defaultSalesLedger?: string;
  /** Default purchase ledger for invoicing */
  defaultPurchaseLedger?: string;
  /** Market valuation method */
  marketValuationMethod?: string;
  /** Standard buying rate (MRP & Pricing) */
  standardBuyingRate?: number;
  /** Standard selling rate (MRP & Pricing) */
  standardSellingRate?: number;
  /** Inclusive of duties and taxes (Yes/No) */
  inclusiveOfDutiesAndTaxes?: boolean;
  /** Bill of Materials / Components list (BoM). Immutable when used. */
  componentsList?: readonly { itemName: string; qty: number }[];
  /** GST HSN/SAC history (read-only, immutable) */
  gstHsnsacHistory?: readonly { effectiveFrom?: string; source: string; code: string; description?: string }[];
  /** GST rate history (read-only, immutable) */
  gstRateHistory?: readonly { effectiveFrom?: string; taxability: string; ratePercent: number }[];
  inactive?: boolean;
}

export interface Godown {
  id: number;
  name: string;
  alias?: string;
  /** Parent godown (Primary or parent name). Supports hierarchy (Warehouse → Racks). */
  under: string;
  inactive?: boolean;
}

export interface StockCategory {
  id: number;
  name: string;
  alias?: string;
  under: string;
  /** Language alias (shown in More Details when Show More is on) */
  languageAlias?: string;
  inactive?: boolean;
}

/** Unit type: simple (symbol + formal name) or compound (e.g. 1 Box = 10 Nos) */
export type InventoryUnitType = 'simple' | 'compound';

export interface InventoryUnit {
  id: number;
  type: InventoryUnitType;
  /** Symbol (e.g. Nos, Kg, Box). Used in stock items. */
  symbol: string;
  /** Formal name (e.g. Numbers, Kilogram). For simple units. */
  formalName?: string;
  /** Base unit for compound (e.g. Nos). 1 symbol = conversion baseUnit. */
  baseUnit?: string;
  /** Conversion factor: 1 [symbol] = conversion [baseUnit]. */
  conversion?: number;
  /** Unit Quantity Code (UQC). Default: Not Applicable. Cannot change once used. */
  uqc?: string;
  /** Number of decimal places. Default 0. Cannot change once used in stock items. */
  decimalPlaces?: number;
  /** UQC history (read-only, immutable). Shown when Show Inactive = ON. */
  uqcHistory?: readonly { effectiveFrom?: string; uqc: string }[];
  inactive?: boolean;
}

export interface TaxLedger {
  id: number;
  ledgerName: string;
  under: string;
  ratePercent: number;
  type: 'IGST' | 'CGST' | 'SGST';
  ledgers: string;
}

export interface GstRate {
  id: number;
  rateName: string;
  ratePercent: number;
  taxType: string;
  applicableLedgers: string[];
}

export type GstRegistrationType = 'Regular' | 'Composition' | 'Unregistered';
export type Gstr1Periodicity = 'Monthly' | 'Quarterly';
export type GstModeOfFiling = 'Not Applicable' | 'Online' | 'Offline';

export interface GstRegistration {
  id: number;
  /** Registration status: Active / Inactive. Default Active. */
  active: boolean;
  /** State (required). */
  state: string;
  /** Registration Type: Regular, Composition, Unregistered. */
  registrationType: GstRegistrationType;
  /** Assessee of Other Territory (Yes/No). */
  assesseeOfOtherTerritory: boolean;
  /** GSTIN / UIN. */
  gstinUin?: string;
  /** Periodicity of GSTR-1: Monthly, Quarterly. */
  gstr1Periodicity: Gstr1Periodicity;
  /** e-Way Bill applicable (Yes/No). */
  eWayBillApplicable: boolean;
  /** e-Way Bill applicable from (date). */
  eWayBillApplicableFrom?: string;
  /** e-Way Bill applicable for intrastate (Yes/No). Affects sales, delivery challans. */
  eWayBillApplicableForIntrastate: boolean;
  /** GST Username (API placeholder). */
  gstUsername?: string;
  /** Mode of Filing: Not Applicable, Online, Offline. API placeholder. */
  modeOfFiling: GstModeOfFiling;
  /** e-Invoicing applicable (Yes/No). Enable only if turnover threshold crossed. */
  eInvoiceApplicable: boolean;
  /** One registration must be default per company. Drives voucher GST, returns, e-Way Bill. */
  isDefault: boolean;
}

/** GST Classification: template for HSN/SAC and GST rate; can be applied to Ledgers and Stock Items. Values overridable at lower levels. */
export type GstClassificationHsnsacDetails = 'Not Defined' | 'Set';
export type GstClassificationGstRateDetails = 'Not Defined' | 'Set';
export type GstClassificationTaxability = 'Taxable' | 'Exempt' | 'Nil Rated';

export interface GstClassification {
  id: number;
  /** Name (required, unique). */
  name: string;
  /** HSN/SAC Details: Not Defined / Set. */
  hsnsacDetails: GstClassificationHsnsacDetails;
  /** HSN/SAC Code when Set. */
  hsnsacCode?: string;
  /** HSN/SAC Description when Set. */
  hsnsacDescription?: string;
  /** GST Rate Details: Not Defined / Set. */
  gstRateDetails: GstClassificationGstRateDetails;
  /** Taxability Type when Set. */
  taxabilityType?: GstClassificationTaxability;
  /** GST Rate (%) when Set. */
  gstRate?: number;
}

/** Company GST Details: global GST switch; when Enable GST = No, hide GST everywhere. */
export interface CompanyGstDetails {
  /** Enable GST (Yes/No). Global feature gate. */
  enableGst: boolean;
  /** Set GST Registration Details (Yes/No). */
  setGstRegistrationDetails: boolean;
  /** Default GST Registration (id). */
  defaultGstRegistrationId?: number;
  /** GST Applicable From (date). */
  gstApplicableFrom?: string;
  /** Country. */
  country?: string;
  /** State. */
  state?: string;
}

/** Company PAN/CIN Details: used in Invoices, GST returns, Reports. */
export interface CompanyPanCinDetails {
  /** PAN (Permanent Account Number): 5 letters + 4 digits + 1 letter, e.g. AAAAA9999A. */
  pan?: string;
  /** CIN (Corporate Identity Number): optional, 21 characters. */
  cin?: string;
}

export interface VoucherLine {
  id: number;
  srNo: number;
  ledgerName: string;
  drCr: DrCr;
  narration: string;
  amount: number;
  isGstRow?: boolean;
}

export interface VoucherItem {
  id: number;
  itemName: string;
  batch: string;
  qty: number;
  rate: number;
  amount: number;
  /** HSN/SAC code (from stock item or classification) */
  hsnsacCode?: string;
  /** IGST % (inter-state) */
  igstPct?: number;
  /** CGST % (intra-state) */
  cgstPct?: number;
  /** SGST % (intra-state) */
  sgstPct?: number;
  /** Discount % */
  discountPct?: number;
}

export interface ExchangeRate {
  id: number;
  currency: string;
  rate: number;
}

/** Currency master: one base per company; symbol used in ledgers/vouchers/reports */
export interface Currency {
  id: number;
  symbol: string;
  formalName: string;
  isoCode?: string;
  decimalPlaces: number;
  decimalSymbol: string;
  amountInWordsSingular?: string;
  amountInWordsPlural?: string;
  isBase: boolean;
  inactive?: boolean;
}

/** Exchange rate per currency per date (future-dated allowed) */
export interface CurrencyExchangeRate {
  id: number;
  currencyId: number;
  date: string;
  rate: number;
}

/** Cost Centre master (analytical; no balance). Used in vouchers & reports only. */
export interface CostCentre {
  id: number;
  name: string;
  under: string;
  inactive?: boolean;
}

export type VoucherNumberingMethod = 'Automatic' | 'Manual' | 'Automatic (Manual Override)';

/** Default ledger for Payment/Receipt class: Cash or Bank */
export type VoucherClassDefaultLedger = 'Cash' | 'Bank';

export interface VoucherTypeMasterClass {
  id: number;
  name: string;
  description?: string;
  /** Payment/Receipt: default account (Cash in Hand vs Bank) */
  defaultLedgerType?: VoucherClassDefaultLedger;
  /** Dr/Cr direction for primary side (e.g. Payment: Dr particulars, Cr cash) */
  debitCreditDirection?: DrCr;
  /** Single-entry (one account + particulars) vs double-entry (multi-line) */
  layout?: 'single-entry' | 'double-entry';
  /** GST applicable for this class (e.g. GST Sales vs Exempt Sales) */
  gstApplicable?: boolean;
}

/** Per-voucher-type configuration (F12) */
export interface VoucherTypeConfig {
  enableGst: boolean;
  enableItemInvoice: boolean;
  allowNarration: boolean;
  enableDiscountColumn: boolean;
  enableRoundingOff: boolean;
  allowVoucherClass: boolean;
}

/** Voucher status for Optional / Post-dated */
export type VoucherStatusType = 'Regular' | 'Optional' | 'Post-dated';

/** Voucher Configuration (Tally-style: General, Tax, Bank) */
export interface VoucherConfiguration {
  provideBuyerDetails: boolean;
  dispatchOrderExportDetails: boolean;
  orderDetails: boolean;
  commonLedgerItemAllocation: boolean;
  billWiseDetails: boolean;
  referenceNoDate: boolean;
  showLedgerBalances: boolean;
  modifyFieldsDuringEntry: boolean;
  warnNegativeStock: boolean;
  stripeView: boolean;
  /** Show discount column in item grid */
  enableDiscounts: boolean;
  /** Show narration field */
  enableNarration: boolean;
  /** Allow Optional / Post-dated voucher status */
  allowOptionalPostDated: boolean;
  taxInclusivePricing: boolean;
  calculateTaxOnSubtotal: boolean;
  modifyGstHsnsac: boolean;
  ewayBillGeneration: boolean;
  bankAllocation: boolean;
  reconciliationOptions: boolean;
}

export interface VoucherTypeMaster {
  id: number;
  name: string;
  alias?: string;
  coreType: string; // e.g. Sales, Purchase, Payment
  abbreviation?: string;
  active: boolean;
  numberingMethod: VoucherNumberingMethod;
  retainOriginalNumber: boolean;
  showUnusedNumbers: boolean;
  useEffectiveDates: boolean;
  allowZeroValued: boolean;
  optionalByDefault: boolean;
  allowNarration: boolean;
  /** false = use common narration (one per voucher); true = per ledger */
  narrationPerLedger: boolean;
  /** Enable GST for this voucher type */
  enableGst?: boolean;
  printAfterSave: boolean;
  whatsappAfterSave: boolean;
  allowClasses: boolean;
  classes: VoucherTypeMasterClass[];
  inactive?: boolean;
}

/** Credit limit scope: ledger (customer/supplier) or group (default for ledgers under it) */
export type CreditLimitScope = 'ledger' | 'group';

export interface CreditLimitRecord {
  id: number;
  scope: CreditLimitScope;
  ledgerId?: number;
  ledgerName?: string;
  groupId?: number;
  groupName?: string;
  amount: number;
  periodDays?: number;
  periodMonths?: number;
  graceDays?: number;
  graceMonths?: number;
  /** When true, block saving when limit exceeded; when false, only warn */
  blockOnExceed: boolean;
  applyToSales: boolean;
  applyToJournal: boolean;
  applyToCreditNote: boolean;
  inactive?: boolean;
}

/** Scenario master: non-posting what-if reporting configuration */
export interface ScenarioMaster {
  id: number;
  /** Scenario name (e.g. Provisional Entries) */
  name: string;
  /** Include Optional Vouchers (Yes/No) */
  includeOptionalVouchers: boolean;
  inactive?: boolean;
}

/** Result of credit limit check on voucher save */
export interface CreditLimitCheckResult {
  saved: boolean;
  message?: string;
  warn?: boolean;
}

interface MockData {
  ledgers: Ledger[];
  vouchers: Voucher[];
}

export type GroupFormMode = 'create' | 'alter';

export const SALES_LEDGER_OPTIONS = [
  'MME',
  'Sundry Debtors',
  'Cash in Hand',
  'Sharma & Co.',
  'Verma Traders',
  'Gupta Suppliers',
  'Patel Agencies',
  'Mehta Distributors',
  'Kumar Enterprises',
  'Singh & Sons',
  'Bank - SBI Current A/c',
  'Sales Account',
  'Output GST',
  'Duties & Taxes',
  'Purchase Account',
  'Input GST',
  'Capital Account - Proprietor',
  'Drawings - Proprietor',
  'Raman & Associates',
  'Krishna Traders',
];

export interface CompanyOption {
  id: string;
  name: string;
  financialStart: string;
  financialEnd: string;
}

export interface AppState {
  activeView: AppView;
  /** Navigation history for Back/Forward */
  viewHistory: AppView[];
  viewHistoryIndex: number;
  canGoBack: () => boolean;
  canGoForward: () => boolean;
  goBack: () => void;
  goForward: () => void;
  companyName: string;
  companyId: string;
  companies: CompanyOption[];
  date: string;
  financialPeriodStart: string;
  financialPeriodEnd: string;
  mockData: MockData;
  groups: Group[];
  /** When set, Group Creation view opens in alter mode with this group */
  groupFormEditingId: number | null;
  /** When true, Group form was opened from Chart of Accounts → Enter on group (header: Group Alteration Secondary; Quit → chart-of-accounts) */
  groupFormFromCoA: boolean;
  setGroupFormFromCoA: (value: boolean) => void;
  /** When set, Ledger Creation view opens in alter mode with this ledger */
  ledgerFormEditingId: number | null;
  /** When set, Currency Creation view opens in alter mode with this currency */
  currencyFormEditingId: number | null;
  /** When set, Voucher Type Creation view opens in alter mode with this voucher type */
  voucherTypeFormEditingId: number | null;
  voucherTypes: VoucherTypeMaster[];
  creditLimitFormEditingId: number | null;
  creditLimits: CreditLimitRecord[];
  /** Scenario masters (what-if reporting) */
  scenarios: ScenarioMaster[];
  /** When set, Scenario Creation view opens in alter mode with this scenario */
  scenarioFormEditingId: number | null;
  currencies: Currency[];
  currencyExchangeRates: CurrencyExchangeRate[];
  /** Cost Centres (parallel to COA; no balances). Gateway → Chart of Accounts → Cost Centres. */
  costCentres: CostCentre[];
  costCentreFormEditingId: number | null;
  addCostCentre: (c: Omit<CostCentre, 'id'>) => void;
  updateCostCentre: (c: CostCentre) => void;
  deleteCostCentre: (id: number) => void;
  setCostCentreFormEditingId: (id: number | null) => void;
  companyFeatures: CompanyFeature[];
  stockGroups: StockGroup[];
  /** When set, Stock Group Creation view opens in alter mode with this stock group */
  stockGroupFormEditingId: number | null;
  stockItems: StockItem[];
  stockCategories: StockCategory[];
  /** When set, Stock Category Creation view opens in alter mode with this category */
  stockCategoryFormEditingId: number | null;
  /** When set, Stock Item Creation view opens in alter mode with this item */
  stockItemFormEditingId: number | null;
  /** Inventory units (global per company). Used in stock items. */
  inventoryUnits: InventoryUnit[];
  /** When set, Unit Creation view opens in alter mode with this unit */
  unitFormEditingId: number | null;
  /** Godowns (warehouses); used for stock movement and location tracking. */
  godowns: Godown[];
  /** When set, Godown Creation view opens in alter mode with this godown */
  godownFormEditingId: number | null;
  /** GST Registrations (multiple per company; one must be default). */
  gstRegistrations: GstRegistration[];
  /** When set, GST Registration view opens in alter mode with this registration */
  gstRegistrationFormEditingId: number | null;
  /** GST Classifications (templates for Ledgers / Stock Items; values overridable at lower levels). */
  gstClassifications: GstClassification[];
  /** When set, GST Classification view opens in alter mode with this classification */
  gstClassificationFormEditingId: number | null;
  /** Company GST Details: global GST switch; single record per company. */
  companyGstDetails: CompanyGstDetails | null;
  /** Company PAN/CIN Details: used in Invoices, GST returns, Reports. */
  companyPanCinDetails: CompanyPanCinDetails | null;
  taxLedgers: TaxLedger[];
  gstRates: GstRate[];
  voucherLines: VoucherLine[];
  voucherItems: VoucherItem[];
  exchangeRates: ExchangeRate[];
  trialBalanceAccounts: ReportAccount[];
  drillDownAccount: ReportAccount | null;
  /** Supabase-fetched report data (when available) */
  reportDayBookVouchers: { id: number; date: string; type: string; party: string; amount: number; dateFormatted: string; ref: string; narration: string; debit: number; credit: number; balance: number }[] | null;
  reportTrialBalanceAccounts: ReportAccount[] | null;
  reportLedgersWithBalance: { id: number; name: string; under: string; amount: number }[] | null;
  reportLedgerVouchers: { date: string; voucher_id: number; voucher_type: string; narration: string; debit: number; credit: number; balance: number }[] | null;
  reportPLData: { grossProfit: number; netProfit: number; totalSales: number; totalPurchase: number } | null;
  reportBalanceSheetData: { totalAssets: number; totalLiabilities: number; netProfit: number; balanced: boolean } | null;
  setReportDayBookVouchers: (v: { id: number; date: string; type: string; party: string; amount: number; dateFormatted: string; ref: string; narration: string; debit: number; credit: number; balance: number }[] | null) => void;
  setReportTrialBalanceAccounts: (v: ReportAccount[] | null) => void;
  setReportLedgersWithBalance: (v: { id: number; name: string; under: string; amount: number }[] | null) => void;
  setReportLedgerVouchers: (v: { date: string; voucher_id: number; voucher_type: string; narration: string; debit: number; credit: number; balance: number }[] | null) => void;
  setReportPLData: (v: { grossProfit: number; netProfit: number; totalSales: number; totalPurchase: number } | null) => void;
  setReportBalanceSheetData: (v: { totalAssets: number; totalLiabilities: number; netProfit: number; balanced: boolean } | null) => void;
  /** Ledger selected for Ledger Vouchers view (id + name) */
  ledgerVouchersLedger: { id: number; name: string } | null;
  /** Ordered voucher ids for viewer Prev/Next */
  voucherViewerIds: number[];
  voucherViewerCurrentId: number | null;
  /** Accounting voucher context */
  accountingVoucherTypeId: number;
  accountingVoucherClassId: number | null;
  accountingVoucherDate: string;
  accountingVoucherNumber: string;
  accountingVoucherReference: string;
  accountingVoucherPartyLedger: string;
  accountingVoucherSalesOrPurchaseLedger: string;
  accountingVoucherIsInterState: boolean;
  accountingVoucherNarration: string;
  accountingVoucherDirty: boolean;
  /** Payment/Receipt: Cash or Bank account selected */
  accountingVoucherCashOrBankLedger: string;
  /** Payment/Receipt: particulars (multi-ledger lines: ledgerName, amount, drCr) */
  accountingVoucherParticulars: { id: number; ledgerName: string; amount: number; drCr: DrCr }[];
  /** Regular / Optional / Post-dated */
  accountingVoucherStatus: VoucherStatusType;
  setAccountingVoucherStatus: (status: VoucherStatusType) => void;
  changeVoucherTypePopupOpen: boolean;
  /** Per-voucher-type config (F12): enableGst, item invoice, narration, discount, round-off, class */
  voucherTypeConfigs: Record<number, VoucherTypeConfig>;
  setAccountingVoucherTypeId: (id: number) => void;
  setAccountingVoucherClassId: (id: number | null) => void;
  setAccountingVoucherDate: (date: string) => void;
  setAccountingVoucherNumber: (num: string) => void;
  setAccountingVoucherReference: (ref: string) => void;
  setAccountingVoucherPartyLedger: (name: string) => void;
  setAccountingVoucherSalesOrPurchaseLedger: (name: string) => void;
  setAccountingVoucherIsInterState: (v: boolean) => void;
  setAccountingVoucherNarration: (s: string) => void;
  setAccountingVoucherDirty: (v: boolean) => void;
  setAccountingVoucherCashOrBankLedger: (name: string) => void;
  setAccountingVoucherParticulars: (lines: { id: number; ledgerName: string; amount: number; drCr: DrCr }[]) => void;
  addAccountingVoucherParticular: (line?: Partial<{ ledgerName: string; amount: number; drCr: DrCr }>) => void;
  updateAccountingVoucherParticular: (id: number, upd: Partial<{ ledgerName: string; amount: number; drCr: DrCr }>) => void;
  removeAccountingVoucherParticular: (id: number) => void;
  setChangeVoucherTypePopupOpen: (open: boolean) => void;
  setVoucherTypeConfig: (typeId: number, config: Partial<VoucherTypeConfig>) => void;
  /** Auto GST lines from item grid (Output/Input CGST, SGST, IGST) */
  getGstLedgerLinesFromItems: (items: VoucherItem[], isInterState: boolean, isSales: boolean) => { ledgerName: string; amount: number; type: 'CGST' | 'SGST' | 'IGST' }[];
  getLedgerBalance: (ledgerName: string) => number;
  resetAccountingVoucher: () => void;
  acceptGstAccountingVoucher: () => Promise<{ saved: boolean; message?: string; warn?: boolean }>;
  acceptPaymentReceiptVoucher: () => Promise<{ saved: boolean; message?: string; warn?: boolean }>;
  /** Accept current voucher (dispatches to GST Sales/Purchase or Payment/Receipt) */
  acceptCurrentAccountingVoucher: () => Promise<{ saved: boolean; message?: string; warn?: boolean }>;
  /** Next voucher number per type (for auto-numbering) */
  nextVoucherNumberByType: Record<string, number>;
  setNextVoucherNumberByType: (typeName: string, num: number) => void;
  isSidebarCollapsed: boolean;
  /** Mobile: slide-out drawer open (hamburger menu) */
  mobileSidebarOpen: boolean;
  setMobileSidebarOpen: (open: boolean) => void;
  isConfigOpen: boolean;
  isVoucherConfigOpen: boolean;
  openVoucherConfig: () => void;
  closeVoucherConfig: () => void;
  voucherConfiguration: VoucherConfiguration;
  setVoucherConfiguration: (config: Partial<VoucherConfiguration>) => void;
  addVoucherClass: (typeId: number, name: string) => void;
  isCompanyModalOpen: boolean;
  isGstRateModalOpen: boolean;
  isExchangeRateModalOpen: boolean;
  isExportModalOpen: boolean;
  /** Dashboard: visible tile ids (order) and size per tile (s=1x1, m=2x1, l=2x2) */
  dashboardTiles: string[];
  dashboardTileSizes: Record<string, 's' | 'm' | 'l'>;
  dashboardConfigOpen: boolean;
  setDashboardTiles: (tiles: string[]) => void;
  setDashboardTileSize: (tileId: string, size: 's' | 'm' | 'l') => void;
  addDashboardTile: (tileId: string) => void;
  removeDashboardTile: (tileId: string) => void;
  openDashboardConfig: () => void;
  closeDashboardConfig: () => void;
  searchOpen: boolean;
  searchQuery: string;
  /** List of Masters popup (Chart of Accounts entry); Esc closes and returns to Chart of Accounts */
  listOfMastersPopupOpen: boolean;
  setListOfMastersPopupOpen: (open: boolean) => void;
  /** Quit confirmation (Gateway → Quit) */
  quitConfirmOpen: boolean;
  setQuitConfirmOpen: (open: boolean) => void;
  /** Show/hide inactive masters (Groups, Ledgers, etc.); consistent across Chart of Accounts, List of Masters, Alter; persisted with partialize */
  showInactive: boolean;
  setShowInactive: (value: boolean) => void;
  /** Chart of Accounts: show ledgers with zero balance (Tally: Show / Hide Zero Balance) */
  showZeroBalance: boolean;
  setShowZeroBalance: (value: boolean) => void;
  /** User role for shortcut visibility: admin | accountant | viewer */
  userRole: 'admin' | 'accountant' | 'viewer';
  setUserRole: (role: 'admin' | 'accountant' | 'viewer') => void;
  /** When set, Master Alteration opens directly to this master type's record list */
  masterAlterationOpenTo: string | null;
  setMasterAlterationOpenTo: (formType: string | null) => void;
  setActiveView: (view: AppView) => void;
  setDate: (date: string) => void;
  setCurrentCompany: (id: string) => void;
  /** Merge Supabase data (companies, ledgers, voucher types, stock items) into store for persistence */
  setSupabaseData: (data: {
    companyId: string;
    ledgerGroups?: { group_id: number; group_name: string; parent_group_id?: number }[];
    companies: { id: string; name: string; financialStart: string; financialEnd: string }[];
    ledgers: { id: number; name: string; under: string; amount: number; openingBalanceType?: DrCr }[];
    voucherTypes: { id: number; name: string; coreType: string; enableGst: boolean; allowClasses: boolean; classes: unknown[] }[];
    stockItems: { id: number; name: string; under: string; unit: string; allowQuantities: boolean; openingQty: number; rate: number; value: number; inheritHsnsacFromGroup: boolean; hsnsac?: string; gstRate?: number }[];
  }) => void;
  setSearchOpen: (open: boolean) => void;
  setSearchQuery: (query: string) => void;
  setDrillDownAccount: (account: ReportAccount | null) => void;
  addLedger: (ledger: Omit<Ledger, 'id'>) => Promise<void>;
  updateLedger: (ledger: Ledger) => void;
  deleteLedger: (id: number) => void;
  addGroup: (group: Omit<Group, 'id'>) => Promise<void>;
  updateGroup: (group: Group) => void;
  deleteGroup: (id: number) => void;
  setGroupFormEditingId: (id: number | null) => void;
  setLedgerFormEditingId: (id: number | null) => void;
  setCurrencyFormEditingId: (id: number | null) => void;
  setVoucherTypeFormEditingId: (id: number | null) => void;
  addCurrency: (currency: Omit<Currency, 'id'>) => void;
  updateCurrency: (currency: Currency) => void;
  deleteCurrency: (id: number) => void;
  /** Base currency (only one per company); null if none */
  getBaseCurrency: () => Currency | null;
  /** True if currency can be deleted (!isBase and not referenced) */
  canDeleteCurrency: (id: number) => boolean;
  /** True if currency symbol is unique (excluding id for alter) */
  isCurrencySymbolUnique: (symbol: string, excludeId?: number) => boolean;
  addVoucherType: (vt: Omit<VoucherTypeMaster, 'id'>) => void;
  updateVoucherType: (vt: VoucherTypeMaster) => void;
  deleteVoucherType: (id: number) => void;
  isVoucherTypeNameUnique: (name: string, excludeId?: number) => boolean;
  canDeleteVoucherType: (id: number) => boolean;
  setCreditLimitFormEditingId: (id: number | null) => void;
  addCreditLimit: (cl: Omit<CreditLimitRecord, 'id'>) => void;
  updateCreditLimit: (cl: CreditLimitRecord) => void;
  deleteCreditLimit: (id: number) => void;
  getEffectiveCreditLimitForLedger: (ledgerName: string, ledgerUnderGroup?: string) => CreditLimitRecord | null;
  getOutstandingForParty: (partyName: string) => number;
  /** Scenario master actions */
  setScenarioFormEditingId: (id: number | null) => void;
  addScenario: (s: Omit<ScenarioMaster, 'id'>) => void;
  updateScenario: (s: ScenarioMaster) => void;
  deleteScenario: (id: number) => void;
  isScenarioNameUnique: (name: string, excludeId?: number) => boolean;
  canDeleteScenario: (id: number) => boolean;
  /** True if group can be deleted (no children, no ledgers, not predefined) */
  canDeleteGroup: (id: number) => boolean;
  /** True if group name is predefined (e.g. Primary) and cannot be deleted */
  isPredefinedGroup: (name: string) => boolean;
  /** True if ledger can be deleted (no vouchers; opening balance rule can be relaxed) */
  canDeleteLedger: (id: number) => boolean;
  /** True if ledger name is unique (excluding optional id for alter) */
  isLedgerNameUnique: (name: string, excludeId?: number) => boolean;
  /** True if ledger's group can be changed (ledger not used in any voucher) */
  canChangeLedgerGroup: (ledgerId: number) => boolean;
  /** True if group name is unique (excluding optional id for alter) */
  isGroupNameUnique: (name: string, excludeId?: number) => boolean;
  /** True if setting under to parent would create a cycle */
  wouldCreateCircularGroup: (groupName: string, underParent: string, excludeId?: number) => boolean;
  setStockGroupFormEditingId: (id: number | null) => void;
  addStockGroup: (group: Omit<StockGroup, 'id'>) => void;
  updateStockGroup: (item: StockGroup) => void;
  deleteStockGroup: (id: number) => void;
  isStockGroupNameUnique: (name: string, excludeId?: number) => boolean;
  canDeleteStockGroup: (id: number) => boolean;
  wouldCreateCircularStockGroup: (groupName: string, underParent: string, excludeId?: number) => boolean;
  setStockCategoryFormEditingId: (id: number | null) => void;
  addStockCategory: (cat: Omit<StockCategory, 'id'>) => void;
  updateStockCategory: (cat: StockCategory) => void;
  deleteStockCategory: (id: number) => void;
  isStockCategoryNameUnique: (name: string, excludeId?: number) => boolean;
  canDeleteStockCategory: (id: number) => boolean;
  wouldCreateCircularStockCategory: (categoryName: string, underParent: string, excludeId?: number) => boolean;
  setStockItemFormEditingId: (id: number | null) => void;
  addStockItem: (item: Omit<StockItem, 'id'>) => void;
  updateStockItem: (item: StockItem) => void;
  deleteStockItem: (id: number) => void;
  isStockItemNameUnique: (name: string, excludeId?: number) => boolean;
  canDeleteStockItem: (id: number) => boolean;
  /** True if unit can be changed (item not used in any voucher) */
  canChangeStockItemUnit: (id: number) => boolean;
  /** True if valuation method can be changed (item not used in any voucher) */
  canChangeStockItemValuation: (id: number) => boolean;
  /** True if company has GST enabled (Company GST Details master). */
  isGstEnabled: () => boolean;
  /** Set Company GST Details (global GST switch). */
  setCompanyGstDetails: (d: CompanyGstDetails) => void;
  /** Set Company PAN/CIN Details. */
  setCompanyPanCinDetails: (d: CompanyPanCinDetails) => void;
  /** Get stock group by name (for HSN/SAC and GST inheritance) */
  getStockGroupByName: (name: string) => StockGroup | undefined;
  setUnitFormEditingId: (id: number | null) => void;
  addInventoryUnit: (u: Omit<InventoryUnit, 'id'>) => void;
  updateInventoryUnit: (u: InventoryUnit) => void;
  deleteInventoryUnit: (id: number) => void;
  isUnitSymbolUnique: (symbol: string, excludeId?: number) => boolean;
  canDeleteInventoryUnit: (id: number) => boolean;
  /** True if unit can be altered (not used in any stock item) */
  canAlterInventoryUnit: (id: number) => boolean;
  /** Count of stock items using this unit (by symbol). For Units list display. */
  getUnitUsageCount: (unitId: number) => number;
  /** Deactivate unit (Remove). Does not delete. */
  setUnitInactive: (unitId: number, inactive: boolean) => void;
  setGodownFormEditingId: (id: number | null) => void;
  addGodown: (g: Omit<Godown, 'id'>) => void;
  updateGodown: (g: Godown) => void;
  deleteGodown: (id: number) => void;
  isGodownNameUnique: (name: string, excludeId?: number) => boolean;
  canDeleteGodown: (id: number) => boolean;
  getMainLocationGodown: () => Godown | undefined;
  wouldCreateCircularGodown: (godownName: string, underParent: string, excludeId?: number) => boolean;
  setGstRegistrationFormEditingId: (id: number | null) => void;
  addGstRegistration: (r: Omit<GstRegistration, 'id'>) => void;
  updateGstRegistration: (r: GstRegistration) => void;
  deleteGstRegistration: (id: number) => void;
  canDeleteGstRegistration: (id: number) => boolean;
  setDefaultGstRegistration: (id: number) => void;
  setGstClassificationFormEditingId: (id: number | null) => void;
  addGstClassification: (c: Omit<GstClassification, 'id'>) => void;
  updateGstClassification: (c: GstClassification) => void;
  deleteGstClassification: (id: number) => void;
  canDeleteGstClassification: (id: number) => boolean;
  isGstClassificationNameUnique: (name: string, excludeId?: number) => boolean;
  setLedgerVouchersLedger: (ledger: { id: number; name: string } | null) => void;
  openVoucherViewer: (voucherIds: number[], currentId: number) => void;
  closeVoucherViewer: () => void;
  voucherViewerPrev: () => void;
  voucherViewerNext: () => void;
  toggleSidebar: () => void;
  openConfig: () => void;
  closeConfig: () => void;
  toggleCompanyModal: () => void;
  openGstRateModal: () => void;
  closeGstRateModal: () => void;
  openExchangeRateModal: () => void;
  closeExchangeRateModal: () => void;
  openExportModal: () => void;
  closeExportModal: () => void;
  updateExchangeRate: (item: ExchangeRate) => void;
  toggleFeature: (id: number) => void;
  setFeatureUse: (id: number, use: string) => void;
  updateTaxLedger: (item: TaxLedger) => void;
  addGstRate: (rate: Omit<GstRate, 'id'>) => void;
  updateGstRate: (rate: GstRate) => void;
  updateVoucherLine: (line: VoucherLine) => void;
  updateVoucherItem: (item: VoucherItem) => void;
  addVoucherItem: (item?: Partial<VoucherItem>) => void;
  removeVoucherItem: (id: number) => void;
  acceptSalesVoucher: () => CreditLimitCheckResult;
  addVoucher: (voucher: Omit<Voucher, 'id'>) => void;
  updateVoucher: (voucher: Voucher) => void;
  deleteVoucher: (id: number) => void;
}

const initialCompanies: CompanyOption[] = [
  { id: '1', name: 'MME', financialStart: '2024-04-01', financialEnd: '2025-03-31' },
  { id: '2', name: 'New Company', financialStart: '2024-04-01', financialEnd: '2025-03-31' },
];

const initialLedgers: Ledger[] = [
  { id: 1, name: 'Cash in Hand', under: 'Current Assets', amount: 150000 },
  { id: 2, name: 'Sundry Debtors - Sharma & Co.', under: 'Current Assets', amount: 85000 },
  { id: 3, name: 'Sundry Debtors - Verma Traders', under: 'Current Assets', amount: 63000 },
  { id: 4, name: 'Sundry Creditors - Gupta Suppliers', under: 'Current Liabilities', amount: 42000 },
  { id: 5, name: 'Bank - SBI Current A/c', under: 'Bank Accounts', amount: 275000 },
  { id: 6, name: 'Capital Account - Proprietor', under: 'Capital Accounts', amount: 500000 },
  { id: 7, name: 'Sales - Local', under: 'Sales Accounts', amount: 325000 },
  { id: 8, name: 'Sales - Interstate', under: 'Sales Accounts', amount: 145000 },
  { id: 9, name: 'Purchase - Local', under: 'Purchase Accounts', amount: 210000 },
  { id: 10, name: 'Purchase - Interstate', under: 'Purchase Accounts', amount: 95000 },
  { id: 11, name: 'Input GST', under: 'Duties & Taxes', amount: 38000 },
  { id: 12, name: 'Output GST', under: 'Duties & Taxes', amount: 41500 },
  { id: 13, name: 'Salary Expenses', under: 'Indirect Expenses', amount: 78000 },
  { id: 14, name: 'Rent Expenses', under: 'Indirect Expenses', amount: 45000 },
  { id: 15, name: 'Telephone Expenses', under: 'Indirect Expenses', amount: 8500 },
  { id: 16, name: 'Electricity Expenses', under: 'Indirect Expenses', amount: 12300 },
  { id: 17, name: 'Furniture & Fixtures', under: 'Fixed Assets', amount: 95000 },
  { id: 18, name: 'Computer Equipment', under: 'Fixed Assets', amount: 120000 },
  { id: 19, name: 'Loans - HDFC Bank', under: 'Secured Loans', amount: 200000 },
  { id: 20, name: 'Drawings - Proprietor', under: 'Capital Accounts', amount: 30000 },
];

const initialVouchers: Voucher[] = [
  { id: 1, date: '2024-05-01', type: 'Sales', party: 'Sharma & Co.', amount: 25000 },
  { id: 2, date: '2024-05-02', type: 'Sales', party: 'Verma Traders', amount: 18000 },
  { id: 3, date: '2024-05-03', type: 'Purchase', party: 'Gupta Suppliers', amount: 22000 },
  { id: 4, date: '2024-05-05', type: 'Receipt', party: 'Sharma & Co.', amount: 15000 },
  { id: 5, date: '2024-05-06', type: 'Payment', party: 'Gupta Suppliers', amount: 12000 },
  { id: 6, date: '2024-05-07', type: 'Journal', party: 'Salary Expenses', amount: 30000 },
  { id: 7, date: '2024-05-08', type: 'Contra', party: 'SBI Current A/c', amount: 50000 },
  { id: 8, date: '2024-05-09', type: 'Sales', party: 'Patel Agencies', amount: 27000 },
  { id: 9, date: '2024-05-10', type: 'Sales', party: 'Mehta Distributors', amount: 32000 },
  { id: 10, date: '2024-05-11', type: 'Purchase', party: 'Verma Traders', amount: 19000 },
  { id: 11, date: '2024-05-12', type: 'Receipt', party: 'Patel Agencies', amount: 21000 },
  { id: 12, date: '2024-05-13', type: 'Payment', party: 'Mehta Distributors', amount: 16000 },
  { id: 13, date: '2024-05-14', type: 'Journal', party: 'Rent Expenses', amount: 25000 },
  { id: 14, date: '2024-05-15', type: 'Contra', party: 'Cash in Hand', amount: 15000 },
  { id: 15, date: '2024-05-16', type: 'Sales', party: 'Kumar Enterprises', amount: 28000 },
  { id: 16, date: '2024-05-17', type: 'Purchase', party: 'Kumar Enterprises', amount: 17500 },
  { id: 17, date: '2024-05-18', type: 'Receipt', party: 'Kumar Enterprises', amount: 20000 },
  { id: 18, date: '2024-05-19', type: 'Payment', party: 'HDFC Bank', amount: 30000 },
  { id: 19, date: '2024-05-20', type: 'Journal', party: 'Electricity Expenses', amount: 9000 },
  { id: 20, date: '2024-05-21', type: 'Sales', party: 'Singh & Sons', amount: 31000 },
];

const initialCompanyFeatures: CompanyFeature[] = [
  { id: 1, name: 'Enable TallyVault', enabled: false },
  { id: 2, name: 'Use Indian GST', enabled: true, use: 'Statutory GST' },
  { id: 3, name: 'Use Higher Security', enabled: false },
  { id: 4, name: 'Manage Multiple Companies', enabled: true },
  { id: 5, name: 'Use Tally.NET', enabled: false },
  { id: 6, name: 'Allow Remote Access', enabled: false },
  { id: 7, name: 'Enable Audit & Compliance', enabled: true },
  { id: 8, name: 'Use Payroll', enabled: false },
  { id: 9, name: 'Use Job Costing', enabled: false },
  { id: 10, name: 'Use Bill-wise Details', enabled: true },
  { id: 11, name: 'Use Cost Centres', enabled: false },
  { id: 12, name: 'Use Interest Calculation', enabled: false },
];

const DEFAULT_GROUP_FLAGS = {
  behavesLikeSubLedger: false,
  nettDebitCreditForReporting: false,
  usedForCalculation: false,
  purchaseAllocationMethod: 'Not Applicable' as const,
};

/** Predefined group names that cannot be deleted. */
export const PREDEFINED_GROUP_NAMES = new Set<string>(['Primary']);

/** Tally default hierarchy order for List of Groups display. */
export const GROUP_DISPLAY_ORDER = [
  'Primary',
  'Capital Account',
  'Capital Accounts',
  'Reserves & Surplus',
  'Current Assets',
  'Current Liabilities',
  'Bank Accounts',
  'Cash-in-hand',
  'Deposit Accounts',
  'Loans & Advances',
  'Stock-in-hand',
  'Sundry Debtors',
  'Sundry Creditors',
  'Sales Accounts',
  'Purchase Accounts',
  'Direct Expenses',
  'Direct Incomes',
  'Indirect Expenses',
  'Indirect Incomes',
  'Suspense A/c',
  'Duties & Taxes',
  'Fixed Assets',
  'Secured Loans',
];

const initialGroups: Group[] = [
  { id: 1, name: 'Primary', under: 'Primary', ...DEFAULT_GROUP_FLAGS },
  { id: 2, name: 'Capital Account', under: 'Primary', ...DEFAULT_GROUP_FLAGS },
  { id: 3, name: 'Capital Accounts', under: 'Primary', ...DEFAULT_GROUP_FLAGS },
  { id: 4, name: 'Current Assets', under: 'Primary', ...DEFAULT_GROUP_FLAGS },
  { id: 5, name: 'Current Liabilities', under: 'Primary', ...DEFAULT_GROUP_FLAGS },
  { id: 6, name: 'Bank Accounts', under: 'Primary', ...DEFAULT_GROUP_FLAGS },
  { id: 7, name: 'Sales Accounts', under: 'Primary', ...DEFAULT_GROUP_FLAGS },
  { id: 8, name: 'Purchase Accounts', under: 'Primary', ...DEFAULT_GROUP_FLAGS },
  { id: 9, name: 'Duties & Taxes', under: 'Primary', ...DEFAULT_GROUP_FLAGS },
  { id: 10, name: 'Indirect Expenses', under: 'Primary', ...DEFAULT_GROUP_FLAGS },
  { id: 11, name: 'Fixed Assets', under: 'Primary', ...DEFAULT_GROUP_FLAGS },
  { id: 12, name: 'Secured Loans', under: 'Primary', ...DEFAULT_GROUP_FLAGS },
  { id: 13, name: 'Cash-in-hand', under: 'Primary', ...DEFAULT_GROUP_FLAGS },
  { id: 14, name: 'Deposit Accounts', under: 'Primary', ...DEFAULT_GROUP_FLAGS },
  { id: 15, name: 'Loans & Advances', under: 'Primary', ...DEFAULT_GROUP_FLAGS },
  { id: 16, name: 'Sundry Debtors', under: 'Primary', ...DEFAULT_GROUP_FLAGS },
  { id: 17, name: 'Sundry Creditors', under: 'Primary', ...DEFAULT_GROUP_FLAGS },
];

const initialStockGroups: StockGroup[] = [
  { id: 1, name: 'Primary', under: 'Primary', addQuantities: true },
  { id: 2, name: 'Raw Materials', under: 'Primary', addQuantities: true },
  { id: 3, name: 'Finished Goods', under: 'Primary', addQuantities: true },
  { id: 4, name: 'Semi-Finished', under: 'Primary', addQuantities: true },
  { id: 5, name: 'Consumables', under: 'Primary', addQuantities: true },
  { id: 6, name: 'Scrap', under: 'Primary', addQuantities: true },
  { id: 7, name: 'Trading Goods', under: 'Primary', addQuantities: true },
  { id: 8, name: 'Work in Progress', under: 'Primary', addQuantities: true },
];

const DEFAULT_STOCK_ITEM_FLAGS = {
  allowQuantities: true,
  inheritHsnsacFromGroup: true,
  valuationMethod: 'FIFO' as const,
};

const initialStockItems: StockItem[] = [
  { id: 1, name: 'Labour Charge', under: 'Primary', unit: 'Hrs', openingQty: 0, rate: 50, value: 0, ...DEFAULT_STOCK_ITEM_FLAGS },
  { id: 2, name: 'Steel Rods', under: 'Raw Materials', unit: 'Nos', openingQty: 100, rate: 120, value: 12000, ...DEFAULT_STOCK_ITEM_FLAGS },
  { id: 3, name: 'Aluminium Sheet', under: 'Raw Materials', unit: 'Kg', openingQty: 50, rate: 180, value: 9000, ...DEFAULT_STOCK_ITEM_FLAGS },
  { id: 4, name: 'Widget A', under: 'Finished Goods', unit: 'Nos', openingQty: 200, rate: 250, value: 50000, ...DEFAULT_STOCK_ITEM_FLAGS },
  { id: 5, name: 'Widget B', under: 'Finished Goods', unit: 'Nos', openingQty: 150, rate: 320, value: 48000, ...DEFAULT_STOCK_ITEM_FLAGS },
  { id: 6, name: 'Oil 5L', under: 'Consumables', unit: 'Ltr', openingQty: 20, rate: 450, value: 9000, ...DEFAULT_STOCK_ITEM_FLAGS },
  { id: 7, name: 'Scrap Metal', under: 'Scrap', unit: 'Kg', openingQty: 0, rate: 25, value: 0, ...DEFAULT_STOCK_ITEM_FLAGS },
  { id: 8, name: 'Import Item X', under: 'Trading Goods', unit: 'Nos', openingQty: 30, rate: 1200, value: 36000, ...DEFAULT_STOCK_ITEM_FLAGS },
];

const initialStockCategories: StockCategory[] = [
  { id: 1, name: 'Primary', under: 'Primary' },
  { id: 2, name: 'Raw', under: 'Primary' },
  { id: 3, name: 'Finished', under: 'Primary' },
  { id: 4, name: 'Trading', under: 'Primary' },
];

const initialInventoryUnits: InventoryUnit[] = [
  { id: 1, type: 'simple', symbol: 'Nos', formalName: 'Numbers', decimalPlaces: 0, uqc: 'NOS' },
  { id: 2, type: 'simple', symbol: 'Kg', formalName: 'Kilograms', decimalPlaces: 3, uqc: 'KGS' },
  { id: 3, type: 'simple', symbol: 'Ltr', formalName: 'Litres', decimalPlaces: 3, uqc: 'LTR' },
  { id: 4, type: 'simple', symbol: 'Hrs', formalName: 'Hours', decimalPlaces: 2, uqc: 'HUR' },
  { id: 5, type: 'simple', symbol: 'Mtr', formalName: 'Metres', decimalPlaces: 2, uqc: 'MTR' },
  { id: 6, type: 'simple', symbol: 'Pcs', formalName: 'Pieces', decimalPlaces: 0, uqc: 'PCS' },
  { id: 7, type: 'simple', symbol: 'Set', formalName: 'Set', decimalPlaces: 0, uqc: 'SET' },
  { id: 8, type: 'compound', symbol: 'Box', formalName: 'Box', baseUnit: 'Nos', conversion: 10, decimalPlaces: 0, uqc: 'BOX' },
  { id: 9, type: 'compound', symbol: 'Dozen', formalName: 'Dozen', baseUnit: 'Nos', conversion: 12, decimalPlaces: 0, uqc: 'DOZ' },
];

/** Default godown name created for the company; cannot be deleted. */
export const MAIN_LOCATION_GODOWN_NAME = 'Main Location';

const initialGodowns: Godown[] = [
  { id: 1, name: 'Primary', under: 'Primary' },
  { id: 2, name: MAIN_LOCATION_GODOWN_NAME, under: 'Primary' },
  { id: 3, name: 'Main Store', under: 'Primary' },
  { id: 4, name: 'Rack A', under: 'Main Store' },
];

const initialGstRegistrations: GstRegistration[] = [
  {
    id: 1,
    active: true,
    state: 'Maharashtra',
    registrationType: 'Regular',
    assesseeOfOtherTerritory: false,
    gstinUin: undefined,
    gstr1Periodicity: 'Monthly',
    eWayBillApplicable: true,
    eWayBillApplicableFrom: undefined,
    eWayBillApplicableForIntrastate: true,
    gstUsername: undefined,
    modeOfFiling: 'Not Applicable',
    eInvoiceApplicable: false,
    isDefault: true,
  },
];

const initialGstClassifications: GstClassification[] = [
  { id: 1, name: 'Goods 18%', hsnsacDetails: 'Set', hsnsacCode: '9983', hsnsacDescription: 'Other goods', gstRateDetails: 'Set', taxabilityType: 'Taxable', gstRate: 18 },
  { id: 2, name: 'Services 18%', hsnsacDetails: 'Set', hsnsacCode: '998313', hsnsacDescription: 'IT services', gstRateDetails: 'Set', taxabilityType: 'Taxable', gstRate: 18 },
];

const initialCompanyGstDetails: CompanyGstDetails = {
  enableGst: true,
  setGstRegistrationDetails: true,
  defaultGstRegistrationId: 1,
  gstApplicableFrom: '2017-07-01',
  country: 'India',
  state: 'Maharashtra',
};

const initialCompanyPanCinDetails: CompanyPanCinDetails = {
  pan: undefined,
  cin: undefined,
};

const initialTaxLedgers: TaxLedger[] = [
  { id: 1, ledgerName: 'Output GST', under: 'Duties & Taxes', ratePercent: 18, type: 'IGST', ledgers: 'Sales Accounts' },
  { id: 2, ledgerName: 'Output CGST', under: 'Duties & Taxes', ratePercent: 9, type: 'CGST', ledgers: 'Sales Accounts' },
  { id: 3, ledgerName: 'Output SGST', under: 'Duties & Taxes', ratePercent: 9, type: 'SGST', ledgers: 'Sales Accounts' },
  { id: 4, ledgerName: 'Input GST', under: 'Duties & Taxes', ratePercent: 18, type: 'IGST', ledgers: 'Purchase Accounts' },
  { id: 5, ledgerName: 'Input CGST', under: 'Duties & Taxes', ratePercent: 9, type: 'CGST', ledgers: 'Purchase Accounts' },
  { id: 6, ledgerName: 'Input SGST', under: 'Duties & Taxes', ratePercent: 9, type: 'SGST', ledgers: 'Purchase Accounts' },
  { id: 7, ledgerName: 'GST 5% Output', under: 'Duties & Taxes', ratePercent: 5, type: 'IGST', ledgers: 'Sales Accounts' },
  { id: 8, ledgerName: 'GST 12% Output', under: 'Duties & Taxes', ratePercent: 12, type: 'IGST', ledgers: 'Sales Accounts' },
];

const initialGstRates: GstRate[] = [
  { id: 1, rateName: 'IGST 18%', ratePercent: 18, taxType: 'IGST 18%', applicableLedgers: ['Output GST', 'Input GST'] },
  { id: 2, rateName: 'CGST 9%', ratePercent: 9, taxType: 'CGST 9%', applicableLedgers: ['Output CGST', 'Input CGST'] },
  { id: 3, rateName: 'SGST 9%', ratePercent: 9, taxType: 'SGST 9%', applicableLedgers: ['Output SGST', 'Input SGST'] },
];

const initialVoucherLines: VoucherLine[] = [
  { id: 1, srNo: 1, ledgerName: 'MME', drCr: 'Dr', narration: 'Sold goods on credit', amount: 10000 },
  { id: 2, srNo: 2, ledgerName: 'Output GST', drCr: 'Cr', narration: 'IGST @18%', amount: 1800, isGstRow: true },
];

const initialVoucherItems: VoucherItem[] = [
  { id: 1, itemName: 'Labour Charge', batch: '-', qty: 1, rate: 50, amount: 50 },
];

const initialExchangeRates: ExchangeRate[] = [
  { id: 1, currency: 'INR', rate: 1 },
  { id: 2, currency: 'USD', rate: 83.5 },
  { id: 3, currency: 'EUR', rate: 89.2 },
  { id: 4, currency: 'GBP', rate: 105.0 },
];

const initialCurrencies: Currency[] = [
  { id: 1, symbol: '₹', formalName: 'Indian Rupee', isoCode: 'INR', decimalPlaces: 2, decimalSymbol: '.', amountInWordsSingular: 'Rupee', amountInWordsPlural: 'Rupees', isBase: true },
];

const initialCurrencyExchangeRates: CurrencyExchangeRate[] = [
  { id: 1, currencyId: 1, date: '2024-01-01', rate: 1 },
];

const initialCostCentres: CostCentre[] = [
  { id: 1, name: 'Head Office', under: 'Primary' },
  { id: 2, name: 'Branch - North', under: 'Primary' },
];

const initialVoucherTypes: VoucherTypeMaster[] = [
  {
    id: 1,
    name: 'Sales',
    alias: undefined,
    coreType: 'Sales',
    abbreviation: 'S',
    active: true,
    numberingMethod: 'Automatic',
    retainOriginalNumber: false,
    showUnusedNumbers: false,
    useEffectiveDates: false,
    allowZeroValued: false,
    optionalByDefault: false,
    allowNarration: true,
    narrationPerLedger: false,
    enableGst: true,
    printAfterSave: false,
    whatsappAfterSave: false,
    allowClasses: true,
    classes: [
      { id: 101, name: 'Exempt Sales', description: 'Sales without GST', gstApplicable: false },
      { id: 102, name: 'GST Sales', description: 'Item-wise GST Sales', gstApplicable: true },
    ],
  },
  {
    id: 2,
    name: 'Purchase',
    alias: undefined,
    coreType: 'Purchase',
    abbreviation: 'P',
    active: true,
    numberingMethod: 'Automatic',
    retainOriginalNumber: false,
    showUnusedNumbers: false,
    useEffectiveDates: false,
    allowZeroValued: false,
    optionalByDefault: false,
    allowNarration: true,
    narrationPerLedger: false,
    enableGst: true,
    printAfterSave: false,
    whatsappAfterSave: false,
    allowClasses: true,
    classes: [
      { id: 201, name: 'Expense Purchase', description: 'Expense / non-inventory purchase', gstApplicable: false },
      { id: 202, name: 'GST Purchase', description: 'Item-wise GST Purchase', gstApplicable: true },
    ],
  },
  {
    id: 3,
    name: 'Receipt',
    alias: undefined,
    coreType: 'Receipt',
    abbreviation: 'R',
    active: true,
    numberingMethod: 'Manual',
    retainOriginalNumber: false,
    showUnusedNumbers: false,
    useEffectiveDates: false,
    allowZeroValued: false,
    optionalByDefault: false,
    allowNarration: true,
    narrationPerLedger: false,
    enableGst: false,
    printAfterSave: false,
    whatsappAfterSave: false,
    allowClasses: true,
    classes: [
      { id: 301, name: 'Cash Receipt', defaultLedgerType: 'Cash', layout: 'double-entry' },
      { id: 302, name: 'Bank Receipt', defaultLedgerType: 'Bank', layout: 'double-entry' },
    ],
  },
  {
    id: 4,
    name: 'Payment',
    alias: undefined,
    coreType: 'Payment',
    abbreviation: 'Pm',
    active: true,
    numberingMethod: 'Manual',
    retainOriginalNumber: false,
    showUnusedNumbers: false,
    useEffectiveDates: false,
    allowZeroValued: false,
    optionalByDefault: false,
    allowNarration: true,
    narrationPerLedger: false,
    enableGst: false,
    printAfterSave: false,
    whatsappAfterSave: false,
    allowClasses: true,
    classes: [
      { id: 401, name: 'Cash Payment', defaultLedgerType: 'Cash', layout: 'double-entry' },
      { id: 402, name: 'Bank Payment', defaultLedgerType: 'Bank', layout: 'double-entry' },
    ],
  },
  {
    id: 5,
    name: 'Journal',
    alias: undefined,
    coreType: 'Journal',
    abbreviation: 'J',
    active: true,
    numberingMethod: 'Manual',
    retainOriginalNumber: false,
    showUnusedNumbers: false,
    useEffectiveDates: false,
    allowZeroValued: false,
    optionalByDefault: false,
    allowNarration: true,
    narrationPerLedger: false,
    enableGst: false,
    printAfterSave: false,
    whatsappAfterSave: false,
    allowClasses: false,
    classes: [],
  },
  {
    id: 6,
    name: 'Contra',
    alias: undefined,
    coreType: 'Contra',
    abbreviation: 'C',
    active: true,
    numberingMethod: 'Manual',
    retainOriginalNumber: false,
    showUnusedNumbers: false,
    useEffectiveDates: false,
    allowZeroValued: false,
    optionalByDefault: false,
    allowNarration: true,
    narrationPerLedger: false,
    enableGst: false,
    printAfterSave: false,
    whatsappAfterSave: false,
    allowClasses: false,
    classes: [],
  },
  {
    id: 7,
    name: 'GST Sales',
    alias: undefined,
    coreType: 'Sales',
    abbreviation: 'GS',
    active: true,
    numberingMethod: 'Automatic',
    retainOriginalNumber: false,
    showUnusedNumbers: false,
    useEffectiveDates: false,
    allowZeroValued: false,
    optionalByDefault: false,
    allowNarration: true,
    narrationPerLedger: false,
    enableGst: true,
    printAfterSave: false,
    whatsappAfterSave: false,
    allowClasses: true,
    classes: [
      { id: 1, name: 'GST Sales', description: 'Item-wise GST Sales', gstApplicable: true },
      { id: 2, name: 'Sales @5%', description: 'GST 5%', gstApplicable: true },
      { id: 3, name: 'Sales @12%', description: 'GST 12%', gstApplicable: true },
      { id: 4, name: 'Sales @18%', description: 'GST 18%', gstApplicable: true },
    ],
  },
  {
    id: 8,
    name: 'GST Purchase',
    alias: undefined,
    coreType: 'Purchase',
    abbreviation: 'GP',
    active: true,
    numberingMethod: 'Automatic',
    retainOriginalNumber: false,
    showUnusedNumbers: false,
    useEffectiveDates: false,
    allowZeroValued: false,
    optionalByDefault: false,
    allowNarration: true,
    narrationPerLedger: false,
    enableGst: true,
    printAfterSave: false,
    whatsappAfterSave: false,
    allowClasses: true,
    classes: [{ id: 1, name: 'GST Purchase', description: 'Item-wise GST Purchase' }],
  },
];

const initialCreditLimits: CreditLimitRecord[] = [];

const initialScenarios: ScenarioMaster[] = [];

const initialTrialBalanceAccounts: ReportAccount[] = [
  { id: 1, name: 'Sales Account', amount: 48000, type: 'Cr' },
  { id: 2, name: 'Purchase Account', amount: 30000, type: 'Dr' },
  { id: 3, name: 'Cash in Hand', amount: 150000, type: 'Dr' },
  { id: 4, name: 'Sundry Debtors', amount: 85000, type: 'Dr' },
  { id: 5, name: 'Sundry Creditors', amount: 42000, type: 'Cr' },
  { id: 6, name: 'Bank - SBI Current A/c', amount: 275000, type: 'Dr' },
  { id: 7, name: 'Capital Account', amount: 500000, type: 'Cr' },
  { id: 8, name: 'Output GST', amount: 8640, type: 'Cr' },
  { id: 9, name: 'Input GST', amount: 5400, type: 'Dr' },
  { id: 10, name: 'Salary Expenses', amount: 78000, type: 'Dr' },
  { id: 11, name: 'Rent Expenses', amount: 45000, type: 'Dr' },
  { id: 12, name: 'Fixed Assets', amount: 215000, type: 'Dr' },
];

const GST_RATE = 0.18;

function defaultVoucherTypeConfig(): VoucherTypeConfig {
  return {
    enableGst: false,
    enableItemInvoice: false,
    allowNarration: true,
    enableDiscountColumn: true,
    enableRoundingOff: false,
    allowVoucherClass: false,
  };
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      activeView: 'dashboard',
  viewHistory: ['dashboard'],
  viewHistoryIndex: 0,
      companyName: 'MME',
      companyId: '1',
      companies: initialCompanies,
      date: '31 May 24',
  financialPeriodStart: '2024-04-01',
  financialPeriodEnd: '2025-03-31',
  mockData: {
    ledgers: initialLedgers,
    vouchers: initialVouchers,
  },
  groups: initialGroups,
  groupFormEditingId: null,
  groupFormFromCoA: false,
  setGroupFormFromCoA: (value) => set({ groupFormFromCoA: value }),
  ledgerFormEditingId: null,
  currencyFormEditingId: null,
  voucherTypeFormEditingId: null,
  voucherTypes: initialVoucherTypes,
  creditLimitFormEditingId: null,
  creditLimits: initialCreditLimits,
  scenarios: initialScenarios,
  scenarioFormEditingId: null,
  currencies: initialCurrencies,
  currencyExchangeRates: initialCurrencyExchangeRates,
  costCentres: initialCostCentres,
  costCentreFormEditingId: null,
  companyFeatures: initialCompanyFeatures,
  stockGroups: initialStockGroups,
  stockGroupFormEditingId: null,
  stockItems: initialStockItems,
  stockCategories: initialStockCategories,
  stockCategoryFormEditingId: null,
  stockItemFormEditingId: null,
  inventoryUnits: initialInventoryUnits,
  unitFormEditingId: null,
  godowns: initialGodowns,
  godownFormEditingId: null,
  gstRegistrations: initialGstRegistrations,
  gstRegistrationFormEditingId: null,
  gstClassifications: initialGstClassifications,
  gstClassificationFormEditingId: null,
  companyGstDetails: initialCompanyGstDetails,
  companyPanCinDetails: initialCompanyPanCinDetails,
  taxLedgers: initialTaxLedgers,
  gstRates: initialGstRates,
  voucherLines: initialVoucherLines,
  voucherItems: initialVoucherItems,
  exchangeRates: initialExchangeRates,
  trialBalanceAccounts: initialTrialBalanceAccounts,
  drillDownAccount: null,
  reportDayBookVouchers: null,
  reportTrialBalanceAccounts: null,
  reportLedgersWithBalance: null,
  reportLedgerVouchers: null,
  reportPLData: null,
  reportBalanceSheetData: null,
  setReportDayBookVouchers: (v) => set({ reportDayBookVouchers: v }),
  setReportTrialBalanceAccounts: (v) => set({ reportTrialBalanceAccounts: v }),
  setReportLedgersWithBalance: (v) => set({ reportLedgersWithBalance: v }),
  setReportLedgerVouchers: (v) => set({ reportLedgerVouchers: v }),
  setReportPLData: (v) => set({ reportPLData: v }),
  setReportBalanceSheetData: (v) => set({ reportBalanceSheetData: v }),
  ledgerVouchersLedger: null,
  voucherViewerIds: [],
  voucherViewerCurrentId: null,
  accountingVoucherTypeId: 7,
  accountingVoucherClassId: null,
  accountingVoucherDate: new Date().toISOString().slice(0, 10),
  accountingVoucherNumber: '1',
  accountingVoucherReference: '',
  accountingVoucherPartyLedger: '',
  accountingVoucherSalesOrPurchaseLedger: '',
  accountingVoucherIsInterState: false,
  accountingVoucherNarration: '',
  accountingVoucherDirty: false,
  accountingVoucherCashOrBankLedger: '',
  accountingVoucherParticulars: [],
  changeVoucherTypePopupOpen: false,
  voucherTypeConfigs: {},
  nextVoucherNumberByType: {},
  isSidebarCollapsed: false,
  mobileSidebarOpen: false,
  setMobileSidebarOpen: (open) => set({ mobileSidebarOpen: open }),
  isConfigOpen: false,
  isVoucherConfigOpen: false,
  openVoucherConfig: () => set({ isVoucherConfigOpen: true }),
  closeVoucherConfig: () => set({ isVoucherConfigOpen: false }),
  voucherConfiguration: {
    provideBuyerDetails: false,
    dispatchOrderExportDetails: false,
    orderDetails: false,
    commonLedgerItemAllocation: false,
    billWiseDetails: true,
    referenceNoDate: true,
    showLedgerBalances: true,
    modifyFieldsDuringEntry: true,
    warnNegativeStock: true,
    stripeView: false,
    enableDiscounts: true,
    enableNarration: true,
    allowOptionalPostDated: true,
    taxInclusivePricing: false,
    calculateTaxOnSubtotal: true,
    modifyGstHsnsac: true,
    ewayBillGeneration: false,
    bankAllocation: false,
    reconciliationOptions: false,
  },
  accountingVoucherStatus: 'Regular' as VoucherStatusType,
  setAccountingVoucherStatus: (status: VoucherStatusType) => set({ accountingVoucherStatus: status }),
  setVoucherConfiguration: (config) =>
    set((s) => ({ voucherConfiguration: { ...s.voucherConfiguration, ...config } })),
  addVoucherClass: (typeId, name) => {
    const vt = get().voucherTypes.find((v) => v.id === typeId);
    if (!vt || !vt.allowClasses) return;
    const nextId = vt.classes.length ? Math.max(...vt.classes.map((c) => c.id)) + 1 : 1;
    const newClass: VoucherTypeMasterClass = { id: nextId, name: name.trim(), gstApplicable: vt.enableGst };
    set((s) => ({
      voucherTypes: s.voucherTypes.map((v) =>
        v.id === typeId ? { ...v, classes: [...v.classes, newClass] } : v
      ),
    }));
  },
  isCompanyModalOpen: false,
  isGstRateModalOpen: false,
  isExchangeRateModalOpen: false,
  isExportModalOpen: false,
  dashboardTiles: [
    'sales-trend',
    'purchase-trend',
    'cash-flow',
    'pl-snapshot',
    'assets-liabilities',
    'receivables-aging',
    'inventory-summary',
    'ratios',
    'bank-balances',
  ],
  dashboardTileSizes: {},
  dashboardConfigOpen: false,
  setDashboardTiles: (tiles) => set({ dashboardTiles: tiles }),
  setDashboardTileSize: (tileId, size) =>
    set((s) => ({ dashboardTileSizes: { ...s.dashboardTileSizes, [tileId]: size } })),
  addDashboardTile: (tileId) =>
    set((s) =>
      s.dashboardTiles.includes(tileId) ? s : { dashboardTiles: [...s.dashboardTiles, tileId] }
    ),
  removeDashboardTile: (tileId) =>
    set((s) => ({
      dashboardTiles: s.dashboardTiles.filter((id) => id !== tileId),
      dashboardTileSizes: (() => {
        const next = { ...s.dashboardTileSizes };
        delete next[tileId];
        return next;
      })(),
    })),
  openDashboardConfig: () => set({ dashboardConfigOpen: true }),
  closeDashboardConfig: () => set({ dashboardConfigOpen: false }),
  searchOpen: false,
  searchQuery: '',
  listOfMastersPopupOpen: false,
  setListOfMastersPopupOpen: (open) => set({ listOfMastersPopupOpen: open }),
  quitConfirmOpen: false,
  setQuitConfirmOpen: (open) => set({ quitConfirmOpen: open }),
  showInactive: false,
  setShowInactive: (value) => set({ showInactive: value }),
  showZeroBalance: true,
  setShowZeroBalance: (value) => set({ showZeroBalance: value }),
  userRole: 'accountant',
  setUserRole: (role) => set({ userRole: role }),
  masterAlterationOpenTo: null,
  setMasterAlterationOpenTo: (formType) => set({ masterAlterationOpenTo: formType }),
  canGoBack: () => get().viewHistoryIndex > 0,
  canGoForward: () => get().viewHistoryIndex < get().viewHistory.length - 1,
  goBack: () => {
    const state = get();
    if (state.viewHistoryIndex <= 0) return;
    const newIndex = state.viewHistoryIndex - 1;
    set({ activeView: state.viewHistory[newIndex], viewHistoryIndex: newIndex });
  },
  goForward: () => {
    const state = get();
    if (state.viewHistoryIndex >= state.viewHistory.length - 1) return;
    const newIndex = state.viewHistoryIndex + 1;
    set({ activeView: state.viewHistory[newIndex], viewHistoryIndex: newIndex });
  },
  setActiveView: (view) =>
    set((state) => {
      if (state.activeView === view) return state;
      const newHistory = state.viewHistory.slice(0, state.viewHistoryIndex + 1).concat(view);
      return {
        activeView: view,
        viewHistory: newHistory,
        viewHistoryIndex: newHistory.length - 1,
        listOfMastersPopupOpen: view === 'chart-of-accounts' ? false : state.listOfMastersPopupOpen,
      };
    }),
  setDate: (date) => set({ date }),
  setCurrentCompany: (id) => {
    const company = get().companies.find((c) => c.id === id);
    if (company) {
      set({
        companyId: id,
        companyName: company.name,
        financialPeriodStart: company.financialStart,
        financialPeriodEnd: company.financialEnd,
      });
    }
  },
  setSupabaseData: (data) => {
    const company = data.companies.find((c) => c.id === data.companyId) ?? data.companies[0];
    const existing = get();
    const sbGroups = data.ledgerGroups ?? [];
    const idByName = new Map(sbGroups.map((g) => [(g.group_name ?? '').trim(), g.group_id]));
    const mergedGroups = existing.groups.map((g) => {
      const sbId = idByName.get(g.name);
      if (sbId != null) return { ...g, id: sbId };
      return g;
    });
    const existingNames = new Set(mergedGroups.map((g) => g.name));
    for (const sg of sbGroups) {
      const name = (sg.group_name ?? '').trim();
      if (!name || existingNames.has(name)) continue;
      existingNames.add(name);
      const parentId = sg.parent_group_id;
      const parentName = parentId != null ? mergedGroups.find((g) => g.id === parentId)?.name : null;
      mergedGroups.push({
        id: sg.group_id,
        name,
        under: parentName ?? 'Primary',
        ...DEFAULT_GROUP_FLAGS,
      });
    }
    const vtDefaults = (v: (typeof data.voucherTypes)[0]) => ({
      ...v,
      active: true,
      numberingMethod: 'Automatic' as const,
      retainOriginalNumber: false,
      showUnusedNumbers: false,
      useEffectiveDates: false,
      allowZeroValued: false,
      optionalByDefault: false,
      allowNarration: true,
      narrationPerLedger: false,
      printAfterSave: false,
      whatsappAfterSave: false,
    });
    const siDefaults = (s: (typeof data.stockItems)[0]) => ({
      ...s,
      valuationMethod: 'FIFO' as const,
      alias: undefined,
      partNo: undefined,
      categoryName: s.under,
      description: undefined,
      gstApplicable: true,
      hsnsacDetails: undefined,
      gstRateDetails: undefined,
      sourceOfDetails: undefined,
    });
    set({
      companyId: data.companyId,
      companies: data.companies,
      groups: mergedGroups,
      companyName: company?.name ?? existing.companyName,
      financialPeriodStart: company?.financialStart ?? existing.financialPeriodStart,
      financialPeriodEnd: company?.financialEnd ?? existing.financialPeriodEnd,
      mockData: {
        ...existing.mockData,
        ledgers: data.ledgers,
      },
      voucherTypes: data.voucherTypes.map(vtDefaults) as typeof existing.voucherTypes,
      stockItems: data.stockItems.map(siDefaults) as typeof existing.stockItems,
    });
  },
  setDrillDownAccount: (account) => set({ drillDownAccount: account }),
  addLedger: async (ledger) => {
    const { mockData, companyId } = get();
    const cid = Number(companyId);
    if (!cid) throw new Error('No company selected. Select a company first.');
    const existingGroups = await getLedgerGroups(cid);
    const grp = existingGroups.find((g) => (g.group_name ?? '') === ledger.under);
    const groupId = grp?.group_id ?? (grp as { id?: number })?.id;
    if (!groupId) throw new Error(`Group "${ledger.under}" not found. Create the group first.`);

    const ob = Math.abs(ledger.amount ?? 0);
    const obType = (ledger.openingBalanceType ?? 'Dr') === 'Cr' ? 'CR' : 'DR';

    const result = await createLedger({
      company_id: cid,
      ledger_name: ledger.name.trim(),
      group_id: groupId,
      opening_balance: ob,
      opening_balance_type: obType,
    });
    const lid = result.ledger_id ?? (result as { id?: number }).id;
    if (!lid) throw new Error('Ledger created but no id returned');
    const newLedger: Ledger = {
      ...ledger,
      id: lid,
      name: ledger.name.trim(),
      under: ledger.under.trim() || 'Primary',
      amount: ledger.amount ?? 0,
      openingBalanceType: ledger.openingBalanceType,
    };
    set({
      mockData: {
        ...mockData,
        ledgers: [...mockData.ledgers, newLedger],
      },
    });
  },
  updateLedger: (ledger) => {
    const { mockData } = get();
    set({
      mockData: {
        ...mockData,
        ledgers: mockData.ledgers.map((l) => (l.id === ledger.id ? ledger : l)),
      },
    });
  },
  deleteLedger: (id) => {
    if (!get().canDeleteLedger(id)) return;
    set((state) => ({
      mockData: {
        ...state.mockData,
        ledgers: state.mockData.ledgers.filter((l) => l.id !== id),
      },
      ledgerFormEditingId: state.ledgerFormEditingId === id ? null : state.ledgerFormEditingId,
    }));
  },
  addGroup: async (group) => {
    const { groups, companyId } = get();
    const cid = Number(companyId);
    if (!cid) throw new Error('No company selected. Select a company first.');
    const natureMap: Record<string, 'ASSETS' | 'LIABILITIES' | 'INCOME' | 'EXPENSE'> = {
      Assets: 'ASSETS',
      Liabilities: 'LIABILITIES',
      Income: 'INCOME',
      Expenses: 'EXPENSE',
    };
    const nature = natureMap[group.natureOfGroup ?? ''] ?? 'ASSETS';
    let parentGroupId: number | undefined;
    const existingGroups = await getLedgerGroups(cid);
    const parent = existingGroups.find((g) => (g.group_name ?? '') === group.under);
    if (parent) parentGroupId = parent.group_id ?? (parent as { id?: number }).id;

    const result = await createLedgerGroup({
      company_id: cid,
      group_name: group.name.trim(),
      nature,
      parent_group_id: parentGroupId,
    });
    const gid = result.group_id ?? (result as { id?: number }).id;
    if (!gid) throw new Error('Group created but no id returned');
    const newGroup: Group = {
      ...group,
      id: gid,
      name: group.name.trim(),
      under: group.under.trim() || 'Primary',
    };
    set({ groups: [...groups, newGroup] });
  },
  /** Update group (inactive, name, etc.). Changes propagate instantly: Ledger masters, voucher entry, and reports read from the same store. */
  updateGroup: (group) => {
    set((state) => ({
      groups: state.groups.map((g) => (g.id === group.id ? group : g)),
    }));
  },
  deleteGroup: (id) => {
    const { groups, canDeleteGroup } = get();
    if (!canDeleteGroup(id)) return;
    set({ groups: groups.filter((g) => g.id !== id), groupFormEditingId: null });
  },
  setGroupFormEditingId: (id) => set({ groupFormEditingId: id }),
  setLedgerFormEditingId: (id) => set({ ledgerFormEditingId: id }),
  setCurrencyFormEditingId: (id) => set({ currencyFormEditingId: id }),
  setVoucherTypeFormEditingId: (id) => set({ voucherTypeFormEditingId: id }),
  getBaseCurrency: () => get().currencies.find((c) => c.isBase) ?? null,
  canDeleteCurrency: (id) => {
    const { currencies } = get();
    const cur = currencies.find((c) => c.id === id);
    if (!cur || cur.isBase) return false;
    return true;
  },
  isCurrencySymbolUnique: (symbol, excludeId) => {
    const { currencies } = get();
    const s = symbol.trim();
    if (!s) return false;
    return !currencies.some((c) => c.symbol === s && c.id !== (excludeId ?? -1));
  },
  addCurrency: (currency) => {
    const { currencies } = get();
    const nextId = currencies.length ? Math.max(...currencies.map((c) => c.id)) + 1 : 1;
    let next = [...currencies, { ...currency, id: nextId }];
    if (currency.isBase) next = next.map((c) => (c.id !== nextId ? { ...c, isBase: false } : c));
    set({ currencies: next });
  },
  updateCurrency: (currency) => {
    set((state) => {
      let next = state.currencies.map((c) => (c.id === currency.id ? currency : c));
      if (currency.isBase) next = next.map((c) => (c.id !== currency.id ? { ...c, isBase: false } : c));
      return { currencies: next };
    });
  },
  deleteCurrency: (id) => {
    if (!get().canDeleteCurrency(id)) return;
    set((state) => ({
      currencies: state.currencies.filter((c) => c.id !== id),
      currencyExchangeRates: state.currencyExchangeRates.filter((r) => r.currencyId !== id),
      currencyFormEditingId: state.currencyFormEditingId === id ? null : state.currencyFormEditingId,
    }));
  },
  setCostCentreFormEditingId: (id) => set({ costCentreFormEditingId: id }),
  addCostCentre: (c) => {
    const { costCentres } = get();
    const nextId = costCentres.length ? Math.max(...costCentres.map((x) => x.id)) + 1 : 1;
    set({ costCentres: [...costCentres, { ...c, id: nextId }] });
  },
  updateCostCentre: (c) => {
    set((state) => ({
      costCentres: state.costCentres.map((x) => (x.id === c.id ? c : x)),
    }));
  },
  deleteCostCentre: (id) => {
    set((state) => ({
      costCentres: state.costCentres.filter((x) => x.id !== id),
      costCentreFormEditingId: state.costCentreFormEditingId === id ? null : state.costCentreFormEditingId,
    }));
  },
  addVoucherType: (vt) => {
    const { voucherTypes } = get();
    const nextId = voucherTypes.length ? Math.max(...voucherTypes.map((v) => v.id)) + 1 : 1;
    set({ voucherTypes: [...voucherTypes, { ...vt, id: nextId }] });
  },
  updateVoucherType: (vt) => {
    set((state) => ({
      voucherTypes: state.voucherTypes.map((v) => (v.id === vt.id ? vt : v)),
    }));
  },
  deleteVoucherType: (id) => {
    if (!get().canDeleteVoucherType(id)) return;
    set((state) => ({
      voucherTypes: state.voucherTypes.filter((v) => v.id !== id),
      voucherTypeFormEditingId: state.voucherTypeFormEditingId === id ? null : state.voucherTypeFormEditingId,
    }));
  },
  isVoucherTypeNameUnique: (name, excludeId) => {
    const { voucherTypes } = get();
    const n = name.trim().toLowerCase();
    if (!n) return false;
    return !voucherTypes.some((v) => v.name.toLowerCase() === n && v.id !== (excludeId ?? -1));
  },
  setCreditLimitFormEditingId: (id) => set({ creditLimitFormEditingId: id }),
  addCreditLimit: (cl) => {
    const { creditLimits } = get();
    const nextId = creditLimits.length ? Math.max(...creditLimits.map((c) => c.id)) + 1 : 1;
    set({ creditLimits: [...creditLimits, { ...cl, id: nextId }] });
  },
  updateCreditLimit: (cl) => {
    set((state) => ({
      creditLimits: state.creditLimits.map((c) => (c.id === cl.id ? cl : c)),
    }));
  },
  deleteCreditLimit: (id) => {
    set((state) => ({
      creditLimits: state.creditLimits.filter((c) => c.id !== id),
      creditLimitFormEditingId: state.creditLimitFormEditingId === id ? null : state.creditLimitFormEditingId,
    }));
  },
  setScenarioFormEditingId: (id) => set({ scenarioFormEditingId: id }),
  addScenario: (s) => {
    const { scenarios } = get();
    const nextId = scenarios.length ? Math.max(...scenarios.map((x) => x.id)) + 1 : 1;
    set({ scenarios: [...scenarios, { ...s, id: nextId }] });
  },
  updateScenario: (s) =>
    set((state) => ({
      scenarios: state.scenarios.map((x) => (x.id === s.id ? s : x)),
    })),
  deleteScenario: (id) => {
    if (!get().canDeleteScenario(id)) return;
    set((state) => ({
      scenarios: state.scenarios.filter((x) => x.id !== id),
      scenarioFormEditingId: state.scenarioFormEditingId === id ? null : state.scenarioFormEditingId,
    }));
  },
  isScenarioNameUnique: (name, excludeId) => {
    const { scenarios } = get();
    const n = name.trim().toLowerCase();
    if (!n) return false;
    return !scenarios.some((s) => s.name.toLowerCase() === n && s.id !== (excludeId ?? -1));
  },
  canDeleteScenario: (_id) => true,
  getEffectiveCreditLimitForLedger: (ledgerName, ledgerUnderGroup) => {
    const { creditLimits } = get();
    const active = creditLimits.filter((c) => !c.inactive);
    const ledgerLimit = active.find(
      (c) => c.scope === 'ledger' && c.ledgerName?.toLowerCase() === ledgerName.trim().toLowerCase()
    );
    if (ledgerLimit) return ledgerLimit;
    if (ledgerUnderGroup) {
      const groupLimit = active.find(
        (c) => c.scope === 'group' && c.groupName?.toLowerCase() === ledgerUnderGroup.trim().toLowerCase()
      );
      return groupLimit ?? null;
    }
    return null;
  },
  getOutstandingForParty: (partyName) => {
    const { mockData } = get();
    const name = partyName.trim().toLowerCase();
    if (!name) return 0;
    const creditTypes = ['Sales', 'Journal', 'Credit Note'];
    const reduceTypes = ['Receipt', 'Payment'];
    let outstanding = 0;
    for (const v of mockData.vouchers) {
      if (v.party.toLowerCase() !== name) continue;
      if (creditTypes.includes(v.type)) outstanding += v.amount;
      if (reduceTypes.includes(v.type)) outstanding -= v.amount;
    }
    return Math.max(0, outstanding);
  },
  canDeleteVoucherType: (id) => {
    const { voucherTypes, mockData } = get();
    const vt = voucherTypes.find((v) => v.id === id);
    if (!vt) return false;
    // Cannot delete if used in transactions
    const used = mockData.vouchers.some((v) => v.type === vt.name);
    return !used;
  },
  canDeleteLedger: (id) => {
    const { mockData } = get();
    const ledger = mockData.ledgers.find((l) => l.id === id);
    if (!ledger) return false;
    const usedInVoucher = mockData.vouchers.some((v) => v.party === ledger.name);
    return !usedInVoucher;
  },
  isLedgerNameUnique: (name, excludeId) => {
    const { mockData } = get();
    const n = name.trim().toLowerCase();
    if (!n) return false;
    return !mockData.ledgers.some((l) => l.name.toLowerCase() === n && l.id !== (excludeId ?? -1));
  },
  canChangeLedgerGroup: (ledgerId) => {
    const { mockData } = get();
    const ledger = mockData.ledgers.find((l) => l.id === ledgerId);
    if (!ledger) return true;
    return !mockData.vouchers.some((v) => v.party === ledger.name);
  },
  canDeleteGroup: (id) => {
    const { groups, mockData } = get();
    const group = groups.find((g) => g.id === id);
    if (!group) return false;
    if (PREDEFINED_GROUP_NAMES.has(group.name)) return false;
    const hasChildGroups = groups.some((g) => g.under === group.name && g.id !== id);
    if (hasChildGroups) return false;
    const usedByLedger = mockData.ledgers.some((l) => l.under === group.name);
    return !usedByLedger;
  },
  /** True if group is predefined and cannot be deleted (e.g. Primary). */
  isPredefinedGroup: (name: string) => PREDEFINED_GROUP_NAMES.has(name),
  isGroupNameUnique: (name, excludeId) => {
    const { groups } = get();
    const n = name.trim().toLowerCase();
    if (!n) return false;
    return !groups.some((g) => g.name.toLowerCase() === n && g.id !== (excludeId ?? -1));
  },
  wouldCreateCircularGroup: (groupName, underParent, excludeId) => {
    const { groups } = get();
    const seen = new Set<string>();
    let current: string | null = underParent;
    const selfName = groupName.trim();
    while (current) {
      if (current === selfName && current !== groups.find((g) => g.id === excludeId)?.name) return true;
      if (seen.has(current)) return true;
      seen.add(current);
      const parent = groups.find((g) => g.name === current);
      current = parent ? parent.under : null;
      if (current === parent?.name) break;
    }
    return false;
  },
  setStockGroupFormEditingId: (id) => set({ stockGroupFormEditingId: id }),
  addStockGroup: (group) => {
    const { stockGroups } = get();
    const nextId = stockGroups.length ? Math.max(...stockGroups.map((g) => g.id)) + 1 : 1;
    set({ stockGroups: [...stockGroups, { ...group, id: nextId }] });
  },
  updateStockGroup: (item) =>
    set((state) => ({
      stockGroups: state.stockGroups.map((g) => (g.id === item.id ? item : g)),
    })),
  deleteStockGroup: (id) => {
    if (!get().canDeleteStockGroup(id)) return;
    set((state) => ({
      stockGroups: state.stockGroups.filter((g) => g.id !== id),
      stockGroupFormEditingId: state.stockGroupFormEditingId === id ? null : state.stockGroupFormEditingId,
    }));
  },
  isStockGroupNameUnique: (name, excludeId) => {
    const { stockGroups } = get();
    const n = name.trim().toLowerCase();
    if (!n) return false;
    return !stockGroups.some((g) => g.name.toLowerCase() === n && g.id !== (excludeId ?? -1));
  },
  canDeleteStockGroup: (id) => {
    const { stockGroups, stockItems } = get();
    const group = stockGroups.find((g) => g.id === id);
    if (!group) return false;
    const groupName = group.name;
    const hasItems = stockItems.some((i) => i.under === groupName);
    const hasChildGroups = stockGroups.some((g) => g.under === groupName && g.id !== id);
    return !hasItems && !hasChildGroups;
  },
  wouldCreateCircularStockGroup: (groupName, underParent, _excludeId) => {
    const { stockGroups } = get();
    const seen = new Set<string>();
    let current: string | null = underParent.trim() || 'Primary';
    while (current) {
      if (current.toLowerCase() === groupName.trim().toLowerCase()) return true;
      if (seen.has(current)) return true;
      seen.add(current);
      const parent = stockGroups.find((g) => g.name === current);
      current = parent ? parent.under : null;
      if (current === parent?.name) break;
    }
    return false;
  },
  setStockCategoryFormEditingId: (id) => set({ stockCategoryFormEditingId: id }),
  addStockCategory: (cat) => {
    const { stockCategories } = get();
    const nextId = stockCategories.length ? Math.max(...stockCategories.map((c) => c.id)) + 1 : 1;
    set({ stockCategories: [...stockCategories, { ...cat, id: nextId }] });
  },
  updateStockCategory: (cat) => {
    set((state) => ({
      stockCategories: state.stockCategories.map((c) => (c.id === cat.id ? cat : c)),
    }));
  },
  deleteStockCategory: (id) => {
    if (!get().canDeleteStockCategory(id)) return;
    set((state) => ({
      stockCategories: state.stockCategories.filter((c) => c.id !== id),
      stockCategoryFormEditingId: state.stockCategoryFormEditingId === id ? null : state.stockCategoryFormEditingId,
    }));
  },
  isStockCategoryNameUnique: (name, excludeId) => {
    const { stockCategories } = get();
    const n = name.trim().toLowerCase();
    if (!n) return false;
    return !stockCategories.some((c) => c.name.toLowerCase() === n && c.id !== (excludeId ?? -1));
  },
  canDeleteStockCategory: (id) => {
    const { stockCategories, stockItems } = get();
    const cat = stockCategories.find((c) => c.id === id);
    if (!cat) return false;
    const hasItems = stockItems.some((i) => i.categoryName === cat.name);
    const hasChildCategories = stockCategories.some((c) => c.under === cat.name && c.id !== id);
    return !hasItems && !hasChildCategories;
  },
  wouldCreateCircularStockCategory: (categoryName, underParent, _excludeId) => {
    const { stockCategories } = get();
    const seen = new Set<string>();
    let current: string | null = underParent.trim() || 'Primary';
    while (current) {
      if (current.toLowerCase() === categoryName.trim().toLowerCase()) return true;
      if (seen.has(current)) return true;
      seen.add(current);
      const parent = stockCategories.find((c) => c.name === current);
      current = parent ? parent.under : null;
      if (current === parent?.name) break;
    }
    return false;
  },
  setStockItemFormEditingId: (id) => set({ stockItemFormEditingId: id }),
  addStockItem: (item) => {
    const { stockItems } = get();
    const nextId = stockItems.length ? Math.max(...stockItems.map((i) => i.id)) + 1 : 1;
    set({ stockItems: [...stockItems, { ...item, id: nextId }] });
  },
  updateStockItem: (item) =>
    set((state) => ({
      stockItems: state.stockItems.map((i) => (i.id === item.id ? item : i)),
    })),
  deleteStockItem: (id) => {
    if (!get().canDeleteStockItem(id)) return;
    set((state) => ({
      stockItems: state.stockItems.filter((i) => i.id !== id),
      stockItemFormEditingId: state.stockItemFormEditingId === id ? null : state.stockItemFormEditingId,
    }));
  },
  isStockItemNameUnique: (name, excludeId) => {
    const { stockItems } = get();
    const n = name.trim().toLowerCase();
    if (!n) return false;
    return !stockItems.some((i) => i.name.toLowerCase() === n && i.id !== (excludeId ?? -1));
  },
  canDeleteStockItem: (id) => {
    const { stockItems, voucherItems } = get();
    const item = stockItems.find((i) => i.id === id);
    if (!item) return false;
    const usedInVouchers = voucherItems.some((v) => v.itemName.trim().toLowerCase() === item.name.toLowerCase());
    return !usedInVouchers;
  },
  canChangeStockItemUnit: (id) => get().canDeleteStockItem(id),
  canChangeStockItemValuation: (id) => get().canDeleteStockItem(id),
  isGstEnabled: () => {
    const details = get().companyGstDetails;
    if (details != null) return details.enableGst;
    const f = get().companyFeatures.find((x) => x.id === 2);
    return !!f?.enabled;
  },
  setCompanyGstDetails: (d) => set({ companyGstDetails: d }),
  setCompanyPanCinDetails: (d) => set({ companyPanCinDetails: d }),
  getStockGroupByName: (name) => get().stockGroups.find((g) => g.name === name),
  setUnitFormEditingId: (id) => set({ unitFormEditingId: id }),
  addInventoryUnit: (u) => {
    const { inventoryUnits } = get();
    const nextId = inventoryUnits.length ? Math.max(...inventoryUnits.map((x) => x.id)) + 1 : 1;
    set({ inventoryUnits: [...inventoryUnits, { ...u, id: nextId }] });
  },
  updateInventoryUnit: (u) => {
    set((state) => ({
      inventoryUnits: state.inventoryUnits.map((x) => (x.id === u.id ? u : x)),
    }));
  },
  deleteInventoryUnit: (id) => {
    if (!get().canDeleteInventoryUnit(id)) return;
    set((state) => ({
      inventoryUnits: state.inventoryUnits.filter((x) => x.id !== id),
      unitFormEditingId: state.unitFormEditingId === id ? null : state.unitFormEditingId,
    }));
  },
  isUnitSymbolUnique: (symbol, excludeId) => {
    const { inventoryUnits } = get();
    const s = symbol.trim().toLowerCase();
    if (!s) return false;
    return !inventoryUnits.some((x) => x.symbol.toLowerCase() === s && x.id !== (excludeId ?? -1));
  },
  canDeleteInventoryUnit: (id) => get().canAlterInventoryUnit(id),
  canAlterInventoryUnit: (id) => {
    const { inventoryUnits, stockItems } = get();
    const unit = inventoryUnits.find((x) => x.id === id);
    if (!unit) return false;
    const usedInStockItems = stockItems.some((i) => i.unit.trim().toLowerCase() === unit.symbol.toLowerCase());
    return !usedInStockItems;
  },
  getUnitUsageCount: (unitId) => {
    const { inventoryUnits, stockItems } = get();
    const unit = inventoryUnits.find((x) => x.id === unitId);
    if (!unit) return 0;
    return stockItems.filter((i) => i.unit.trim().toLowerCase() === unit.symbol.toLowerCase()).length;
  },
  setUnitInactive: (unitId, inactive) => {
    const unit = get().inventoryUnits.find((x) => x.id === unitId);
    if (unit) get().updateInventoryUnit({ ...unit, inactive });
  },
  setGodownFormEditingId: (id) => set({ godownFormEditingId: id }),
  addGodown: (g) => {
    const { godowns } = get();
    const nextId = godowns.length ? Math.max(...godowns.map((x) => x.id)) + 1 : 1;
    set({ godowns: [...godowns, { ...g, id: nextId }] });
  },
  updateGodown: (g) => {
    set((state) => ({
      godowns: state.godowns.map((x) => (x.id === g.id ? g : x)),
    }));
  },
  deleteGodown: (id) => {
    if (!get().canDeleteGodown(id)) return;
    set((state) => ({
      godowns: state.godowns.filter((x) => x.id !== id),
      godownFormEditingId: state.godownFormEditingId === id ? null : state.godownFormEditingId,
    }));
  },
  isGodownNameUnique: (name, excludeId) => {
    const { godowns } = get();
    const n = name.trim().toLowerCase();
    if (!n) return false;
    return !godowns.some((x) => x.name.toLowerCase() === n && x.id !== (excludeId ?? -1));
  },
  canDeleteGodown: (id) => {
    const { godowns, stockItems } = get();
    const godown = godowns.find((x) => x.id === id);
    if (!godown) return false;
    if (godown.name === MAIN_LOCATION_GODOWN_NAME) return false;
    const hasChildGodowns = godowns.some((x) => x.under === godown.name && x.id !== id);
    const hasStock = stockItems.some((i) => i.godownName?.trim().toLowerCase() === godown.name.toLowerCase());
    return !hasChildGodowns && !hasStock;
  },
  /** Returns the Main Location godown if it exists (default for company). */
  getMainLocationGodown: () => {
    return get().godowns.find((g) => g.name === MAIN_LOCATION_GODOWN_NAME);
  },
  wouldCreateCircularGodown: (godownName, underParent, _excludeId) => {
    const { godowns } = get();
    const seen = new Set<string>();
    let current: string | null = underParent.trim() || 'Primary';
    while (current) {
      if (current.toLowerCase() === godownName.trim().toLowerCase()) return true;
      if (seen.has(current)) return true;
      seen.add(current);
      const parent = godowns.find((x) => x.name === current);
      current = parent ? parent.under : null;
      if (current === parent?.name) break;
    }
    return false;
  },
  setGstRegistrationFormEditingId: (id) => set({ gstRegistrationFormEditingId: id }),
  addGstRegistration: (r) => {
    const { gstRegistrations } = get();
    const nextId = gstRegistrations.length ? Math.max(...gstRegistrations.map((x) => x.id)) + 1 : 1;
    const isFirst = gstRegistrations.length === 0;
    set({
      gstRegistrations: [
        ...gstRegistrations,
        { ...r, id: nextId, isDefault: isFirst ? true : (r.isDefault ?? false) },
      ],
    });
  },
  updateGstRegistration: (r) =>
    set((state) => ({
      gstRegistrations: state.gstRegistrations.map((x) => (x.id === r.id ? r : x)),
    })),
  deleteGstRegistration: (id) => {
    const { gstRegistrations, canDeleteGstRegistration } = get();
    if (!canDeleteGstRegistration(id)) return;
    const remaining = gstRegistrations.filter((x) => x.id !== id);
    const deleted = gstRegistrations.find((x) => x.id === id);
    const wasDefault = deleted?.isDefault;
    const nextWithDefault = remaining.map((r, i) => ({
      ...r,
      isDefault: wasDefault ? i === 0 : r.isDefault,
    }));
    set((state) => ({
      gstRegistrations: nextWithDefault,
      gstRegistrationFormEditingId: state.gstRegistrationFormEditingId === id ? null : state.gstRegistrationFormEditingId,
    }));
  },
  canDeleteGstRegistration: (_id) => {
    const { gstRegistrations } = get();
    if (gstRegistrations.length <= 1) return false;
    return true;
  },
  setDefaultGstRegistration: (id) =>
    set((state) => ({
      gstRegistrations: state.gstRegistrations.map((r) => ({
        ...r,
        isDefault: r.id === id,
      })),
    })),
  setGstClassificationFormEditingId: (id) => set({ gstClassificationFormEditingId: id }),
  addGstClassification: (c) => {
    const { gstClassifications } = get();
    const nextId = gstClassifications.length ? Math.max(...gstClassifications.map((x) => x.id)) + 1 : 1;
    set({ gstClassifications: [...gstClassifications, { ...c, id: nextId }] });
  },
  updateGstClassification: (c) =>
    set((state) => ({
      gstClassifications: state.gstClassifications.map((x) => (x.id === c.id ? c : x)),
    })),
  deleteGstClassification: (id) => {
    if (!get().canDeleteGstClassification(id)) return;
    set((state) => ({
      gstClassifications: state.gstClassifications.filter((x) => x.id !== id),
      gstClassificationFormEditingId: state.gstClassificationFormEditingId === id ? null : state.gstClassificationFormEditingId,
    }));
  },
  canDeleteGstClassification: (_id) => true,
  isGstClassificationNameUnique: (name, excludeId) => {
    const { gstClassifications } = get();
    const n = name.trim().toLowerCase();
    if (!n) return false;
    return !gstClassifications.some((x) => x.name.toLowerCase() === n && x.id !== (excludeId ?? -1));
  },
  setLedgerVouchersLedger: (ledger) => set({ ledgerVouchersLedger: ledger }),
  openVoucherViewer: (voucherIds, currentId) =>
    set({ voucherViewerIds: voucherIds, voucherViewerCurrentId: currentId }),
  closeVoucherViewer: () =>
    set({ voucherViewerIds: [], voucherViewerCurrentId: null }),
  voucherViewerPrev: () => {
    const state = get();
    const { voucherViewerIds, voucherViewerCurrentId } = state;
    const idx = voucherViewerIds.indexOf(voucherViewerCurrentId ?? -1);
    if (idx <= 0) return;
    set({ voucherViewerCurrentId: voucherViewerIds[idx - 1] });
  },
  voucherViewerNext: () => {
    const state = get();
    const { voucherViewerIds, voucherViewerCurrentId } = state;
    const idx = voucherViewerIds.indexOf(voucherViewerCurrentId ?? -1);
    if (idx < 0 || idx >= voucherViewerIds.length - 1) return;
    set({ voucherViewerCurrentId: voucherViewerIds[idx + 1] });
  },
  setAccountingVoucherTypeId: (id) => set({ accountingVoucherTypeId: id, accountingVoucherDirty: true }),
  setAccountingVoucherClassId: (id) => set({ accountingVoucherClassId: id, accountingVoucherDirty: true }),
  setAccountingVoucherDate: (date) => set({ accountingVoucherDate: date, accountingVoucherDirty: true }),
  setAccountingVoucherNumber: (num) => set({ accountingVoucherNumber: num, accountingVoucherDirty: true }),
  setAccountingVoucherReference: (ref) => set({ accountingVoucherReference: ref, accountingVoucherDirty: true }),
  setAccountingVoucherPartyLedger: (name) => set({ accountingVoucherPartyLedger: name, accountingVoucherDirty: true }),
  setAccountingVoucherSalesOrPurchaseLedger: (name) => set({ accountingVoucherSalesOrPurchaseLedger: name, accountingVoucherDirty: true }),
  setAccountingVoucherIsInterState: (v) => set({ accountingVoucherIsInterState: v, accountingVoucherDirty: true }),
  setAccountingVoucherNarration: (s) => set({ accountingVoucherNarration: s, accountingVoucherDirty: true }),
  setAccountingVoucherDirty: (v) => set({ accountingVoucherDirty: v }),
  setAccountingVoucherCashOrBankLedger: (name) => set({ accountingVoucherCashOrBankLedger: name, accountingVoucherDirty: true }),
  setAccountingVoucherParticulars: (lines) => set({ accountingVoucherParticulars: lines, accountingVoucherDirty: true }),
  addAccountingVoucherParticular: (line) => {
    const state = get();
    const nextId = state.accountingVoucherParticulars.length
      ? Math.max(...state.accountingVoucherParticulars.map((p) => p.id)) + 1
      : 1;
    const newLine = {
      id: nextId,
      ledgerName: line?.ledgerName ?? '',
      amount: line?.amount ?? 0,
      drCr: (line?.drCr ?? 'Dr') as DrCr,
    };
    set({
      accountingVoucherParticulars: [...state.accountingVoucherParticulars, newLine],
      accountingVoucherDirty: true,
    });
  },
  updateAccountingVoucherParticular: (id, upd) => {
    set((state) => ({
      accountingVoucherParticulars: state.accountingVoucherParticulars.map((p) =>
        p.id === id ? { ...p, ...upd } : p
      ),
      accountingVoucherDirty: true,
    }));
  },
  removeAccountingVoucherParticular: (id) => {
    set((state) => ({
      accountingVoucherParticulars: state.accountingVoucherParticulars.filter((p) => p.id !== id),
      accountingVoucherDirty: true,
    }));
  },
  setChangeVoucherTypePopupOpen: (open) => set({ changeVoucherTypePopupOpen: open }),
  setVoucherTypeConfig: (typeId, config) =>
    set((state) => ({
      voucherTypeConfigs: {
        ...state.voucherTypeConfigs,
        [typeId]: { ...defaultVoucherTypeConfig(), ...state.voucherTypeConfigs[typeId], ...config },
      },
    })),
  getGstLedgerLinesFromItems: (items, isInterState, isSales) => {
    const prefix = isSales ? 'Output' : 'Input';
    const lines: { ledgerName: string; amount: number; type: 'CGST' | 'SGST' | 'IGST' }[] = [];
    let cgstTotal = 0;
    let sgstTotal = 0;
    let igstTotal = 0;
    for (const i of items) {
      const taxable = Math.round((i.qty * i.rate * (1 - (i.discountPct ?? 0) / 100)) * 100) / 100;
      if (isInterState) {
        const pct = i.igstPct ?? 18;
        igstTotal += Math.round(taxable * (pct / 100) * 100) / 100;
      } else {
        const cgst = i.cgstPct ?? 9;
        const sgst = i.sgstPct ?? 9;
        cgstTotal += Math.round(taxable * (cgst / 100) * 100) / 100;
        sgstTotal += Math.round(taxable * (sgst / 100) * 100) / 100;
      }
    }
    if (cgstTotal > 0) lines.push({ ledgerName: `${prefix} CGST`, amount: cgstTotal, type: 'CGST' });
    if (sgstTotal > 0) lines.push({ ledgerName: `${prefix} SGST`, amount: sgstTotal, type: 'SGST' });
    if (igstTotal > 0) lines.push({ ledgerName: `${prefix} IGST`, amount: igstTotal, type: 'IGST' });
    return lines;
  },
  getLedgerBalance: (ledgerName) => {
    const ledger = get().mockData.ledgers.find((l) => l.name === ledgerName);
    return ledger?.amount ?? 0;
  },
  resetAccountingVoucher: () => {
    const { voucherTypes, accountingVoucherTypeId, nextVoucherNumberByType } = get();
    const vt = voucherTypes.find((v) => v.id === accountingVoucherTypeId);
    const typeName = vt?.name ?? 'Sales';
    const nextNum = (nextVoucherNumberByType[typeName] ?? 1);
    set({
      voucherLines: [
        { id: 1, srNo: 1, ledgerName: '', drCr: 'Dr', narration: '', amount: 0 },
        { id: 2, srNo: 2, ledgerName: 'Output GST', drCr: 'Cr', narration: '', amount: 0, isGstRow: true },
      ],
      voucherItems: [{ id: 1, itemName: '', batch: '-', qty: 0, rate: 0, amount: 0 }],
      accountingVoucherDate: new Date().toISOString().slice(0, 10),
      accountingVoucherNumber: String(nextNum),
      accountingVoucherReference: '',
      accountingVoucherPartyLedger: '',
      accountingVoucherSalesOrPurchaseLedger: '',
      accountingVoucherIsInterState: false,
      accountingVoucherNarration: '',
      accountingVoucherDirty: false,
      accountingVoucherClassId: vt?.allowClasses && vt.classes?.length ? vt.classes[0].id : null,
      accountingVoucherCashOrBankLedger: '',
      accountingVoucherParticulars: [],
      accountingVoucherStatus: 'Regular' as VoucherStatusType,
    });
  },
  acceptGstAccountingVoucher: async () => {
    const state = get();
    const {
      voucherItems,
      accountingVoucherTypeId,
      accountingVoucherDate,
      accountingVoucherPartyLedger,
      accountingVoucherSalesOrPurchaseLedger,
      accountingVoucherIsInterState,
      getGstLedgerLinesFromItems,
      addVoucher,
      nextVoucherNumberByType,
      setNextVoucherNumberByType,
      voucherTypes,
      getEffectiveCreditLimitForLedger,
      getOutstandingForParty,
      mockData,
      stockItems,
      companyId,
      companyGstDetails,
      gstRegistrations,
    } = state;
    const vt = voucherTypes.find((v) => v.id === accountingVoucherTypeId);
    const isSales = vt?.coreType === 'Sales';
    if (!accountingVoucherPartyLedger?.trim()) {
      return { saved: false, message: 'Party A/c Name is mandatory.' };
    }
    if (vt?.enableGst) {
      if (!companyGstDetails?.enableGst) {
        return { saved: false, message: 'GST must be enabled for this voucher type. Enable GST in Company GST Details.' };
      }
      const defaultReg = gstRegistrations.find((r) => r.isDefault) ?? gstRegistrations[0];
      if (!defaultReg?.active) {
        return { saved: false, message: 'GST Registration must be active.' };
      }
    }
    if (voucherItems.length === 0 || voucherItems.every((i) => !i.itemName?.trim())) {
      return { saved: false, message: 'At least one item is required.' };
    }
    const itemTotal = voucherItems.reduce((s, i) => s + (i.qty * i.rate * (1 - (i.discountPct ?? 0) / 100)), 0);
    const gstLines = getGstLedgerLinesFromItems(voucherItems, accountingVoucherIsInterState, isSales);
    const gstTotal = gstLines.reduce((s, l) => s + l.amount, 0);
    const total = Math.round((itemTotal + gstTotal) * 100) / 100;

    if (vt?.enableGst && gstLines.length > 0) {
      const partyLedgerIdForValidation = mockData.ledgers.find((l) => l.name === accountingVoucherPartyLedger)?.id;
      const gstValidation = await validateGstAtVoucherSave(
        Number(companyId),
        partyLedgerIdForValidation,
        null,
        accountingVoucherIsInterState,
        gstLines
      );
      if (!gstValidation.valid && gstValidation.message) {
        return { saved: false, message: gstValidation.message };
      }
    }
    if (isSales) {
      const limitRecord = getEffectiveCreditLimitForLedger(
        accountingVoucherPartyLedger,
        mockData.ledgers.find((l) => l.name === accountingVoucherPartyLedger)?.under
      );
      if (limitRecord?.applyToSales && limitRecord.amount > 0) {
        const outstanding = getOutstandingForParty(accountingVoucherPartyLedger);
        if (outstanding + total > limitRecord.amount) {
          if (limitRecord.blockOnExceed) {
            return {
              saved: false,
              message: `Credit limit exceeded. Limit: ${limitRecord.amount}, Outstanding + Voucher: ${(outstanding + total).toFixed(2)}`,
            };
          }
          const entryLinesWarn: VoucherEntryLine[] = [
            { ledgerName: accountingVoucherPartyLedger, drCr: 'Dr', amount: total },
            { ledgerName: accountingVoucherSalesOrPurchaseLedger || (isSales ? 'Sales - Local' : 'Purchase - Local'), drCr: 'Cr', amount: itemTotal },
          ];
          gstLines.forEach((l) => entryLinesWarn.push({ ledgerName: l.ledgerName, drCr: 'Cr', amount: l.amount }));
          addVoucher({
            date: accountingVoucherDate,
            type: vt?.name ?? 'Sales',
            typeName: vt?.name,
            party: accountingVoucherPartyLedger,
            amount: total,
            lines: entryLinesWarn,
          });
          setNextVoucherNumberByType(vt?.name ?? 'Sales', (nextVoucherNumberByType[vt?.name ?? 'Sales'] ?? 1) + 1);
          state.resetAccountingVoucher();
          return { saved: true, message: `Credit limit exceeded.`, warn: true };
        }
      }
    }
    const partyLedgerId = mockData.ledgers.find((l) => l.name === accountingVoucherPartyLedger)?.id;
    const salesOrPurchaseLedgerId = mockData.ledgers.find((l) => l.name === (accountingVoucherSalesOrPurchaseLedger || (isSales ? 'Sales - Local' : 'Purchase - Local')))?.id;
    if (!partyLedgerId || !salesOrPurchaseLedgerId) {
      return { saved: false, message: 'Party or Sales/Purchase ledger not found. Load data from Supabase first.' };
    }
    const ledgerEntries = [
      { ledger_id: partyLedgerId, amount: total, dr_cr: 'DR' as const },
      { ledger_id: salesOrPurchaseLedgerId, amount: itemTotal, dr_cr: 'CR' as const },
      ...gstLines.map((l) => {
        const lid = mockData.ledgers.find((x) => x.name === l.ledgerName)?.id;
        return lid ? { ledger_id: lid, amount: l.amount, dr_cr: 'CR' as const } : null;
      }).filter(Boolean) as { ledger_id: number; amount: number; dr_cr: 'CR' }[],
    ];
    const stockItemsPayload = voucherItems
      .filter((i) => i.itemName?.trim())
      .map((i) => {
        const sid = stockItems.find((s) => s.name === i.itemName)?.id;
        const taxable = i.qty * i.rate * (1 - (i.discountPct ?? 0) / 100);
        return sid ? { stock_item_id: sid, quantity: i.qty, rate: i.rate, taxable_value: taxable, total_value: taxable } : null;
      })
      .filter(Boolean) as { stock_item_id: number; quantity: number; rate: number; taxable_value: number; total_value: number }[];
    if (stockItemsPayload.length === 0) {
      return { saved: false, message: 'Stock items not found. Create stock items in Supabase first.' };
    }
    try {
      const company_id = Number(companyId);
      const fyBounds = state.financialPeriodStart && state.financialPeriodEnd
        ? { financial_year_start: state.financialPeriodStart, financial_year_end: state.financialPeriodEnd }
        : undefined;
      if (isSales) {
        await createSalesVoucher({
          company_id,
          voucher_type_id: accountingVoucherTypeId,
          voucher_date: accountingVoucherDate,
          party_ledger_id: partyLedgerId,
          sales_ledger_id: salesOrPurchaseLedgerId,
          narration: state.accountingVoucherNarration || undefined,
          ledger_entries: ledgerEntries,
          stock_items: stockItemsPayload,
          tax_rows: gstLines.map((l) => {
            const lid = mockData.ledgers.find((x) => x.name === l.ledgerName)?.id;
            return lid ? { ledger_id: lid, amount: l.amount } : null;
          }).filter(Boolean) as { ledger_id: number; amount: number }[],
          fyBounds,
        });
      } else {
        await createPurchaseVoucher({
          company_id,
          voucher_type_id: accountingVoucherTypeId,
          voucher_date: accountingVoucherDate,
          party_ledger_id: partyLedgerId,
          purchase_ledger_id: salesOrPurchaseLedgerId,
          narration: state.accountingVoucherNarration || undefined,
          ledger_entries: ledgerEntries,
          stock_items: stockItemsPayload,
          tax_rows: gstLines.map((l) => {
            const lid = mockData.ledgers.find((x) => x.name === l.ledgerName)?.id;
            return lid ? { ledger_id: lid, amount: l.amount } : null;
          }).filter(Boolean) as { ledger_id: number; amount: number }[],
          fyBounds,
        });
      }
      const entryLines: VoucherEntryLine[] = [
        { ledgerName: accountingVoucherPartyLedger, drCr: 'Dr', amount: total },
        { ledgerName: accountingVoucherSalesOrPurchaseLedger || (isSales ? 'Sales - Local' : 'Purchase - Local'), drCr: 'Cr', amount: itemTotal },
      ];
      gstLines.forEach((l) => entryLines.push({ ledgerName: l.ledgerName, drCr: 'Cr', amount: l.amount }));
      addVoucher({
        date: accountingVoucherDate,
        type: vt?.name ?? 'Sales',
        typeName: vt?.name,
        party: accountingVoucherPartyLedger,
        amount: total,
        lines: entryLines,
      });
      setNextVoucherNumberByType(vt?.name ?? 'Sales', (nextVoucherNumberByType[vt?.name ?? 'Sales'] ?? 1) + 1);
      state.resetAccountingVoucher();
      return { saved: true };
    } catch (err) {
      console.error('Supabase voucher save error:', err);
      return { saved: false, message: err instanceof Error ? err.message : String(err) };
    }
  },
  acceptPaymentReceiptVoucher: async () => {
    const state = get();
    const {
      accountingVoucherTypeId,
      accountingVoucherClassId,
      accountingVoucherDate,
      accountingVoucherCashOrBankLedger,
      accountingVoucherParticulars,
      accountingVoucherNarration,
      voucherTypes,
      addVoucher,
      nextVoucherNumberByType,
      setNextVoucherNumberByType,
      mockData,
      companyId,
    } = state;
    const vt = voucherTypes.find((v) => v.id === accountingVoucherTypeId);
    const isReceipt = vt?.coreType === 'Receipt';
    if (!accountingVoucherCashOrBankLedger?.trim()) {
      return { saved: false, message: 'Account (Cash/Bank) is mandatory.' };
    }
    const totalParticulars = accountingVoucherParticulars.reduce((s, p) => s + p.amount, 0);
    if (totalParticulars <= 0 || accountingVoucherParticulars.every((p) => !p.ledgerName?.trim())) {
      return { saved: false, message: 'At least one particular with amount is required.' };
    }
    const total = Math.round(totalParticulars * 100) / 100;
    const entryLines: VoucherEntryLine[] = [];
    if (isReceipt) {
      entryLines.push({ ledgerName: accountingVoucherCashOrBankLedger, drCr: 'Dr', amount: total, narration: accountingVoucherNarration });
      accountingVoucherParticulars.forEach((p) => {
        if (p.ledgerName?.trim() && p.amount > 0) {
          entryLines.push({ ledgerName: p.ledgerName, drCr: 'Cr', amount: p.amount });
        }
      });
    } else {
      accountingVoucherParticulars.forEach((p) => {
        if (p.ledgerName?.trim() && p.amount > 0) {
          entryLines.push({ ledgerName: p.ledgerName, drCr: 'Dr', amount: p.amount });
        }
      });
      entryLines.push({ ledgerName: accountingVoucherCashOrBankLedger, drCr: 'Cr', amount: total, narration: accountingVoucherNarration });
    }
    const drTotal = entryLines.filter((l) => l.drCr === 'Dr').reduce((s, l) => s + l.amount, 0);
    const crTotal = entryLines.filter((l) => l.drCr === 'Cr').reduce((s, l) => s + l.amount, 0);
    if (Math.abs(drTotal - crTotal) > 0.01) {
      return { saved: false, message: 'Debit and Credit must be equal.' };
    }
    const cashBankLedgerId = mockData.ledgers.find((l) => l.name === accountingVoucherCashOrBankLedger)?.id;
    const entries: { ledger_id: number; amount: number; dr_cr: 'DR' | 'CR' }[] = [];
    for (const p of accountingVoucherParticulars) {
      if (!p.ledgerName?.trim() || p.amount <= 0) continue;
      const lid = mockData.ledgers.find((l) => l.name === p.ledgerName)?.id;
      if (!lid) return { saved: false, message: `Ledger "${p.ledgerName}" not found. Load data from Supabase first.` };
      entries.push({ ledger_id: lid, amount: Math.round(p.amount * 100) / 100, dr_cr: isReceipt ? 'CR' : 'DR' });
    }
    if (!cashBankLedgerId) {
      return { saved: false, message: 'Cash/Bank ledger not found. Load data from Supabase first.' };
    }
    entries.push({ ledger_id: cashBankLedgerId, amount: total, dr_cr: isReceipt ? 'DR' : 'CR' });
    const partyLedgerId = mockData.ledgers.find((l) => l.name === (accountingVoucherParticulars[0]?.ledgerName ?? accountingVoucherCashOrBankLedger))?.id;
    const fyBounds = state.financialPeriodStart && state.financialPeriodEnd
      ? { financial_year_start: state.financialPeriodStart, financial_year_end: state.financialPeriodEnd }
      : undefined;
    try {
      await createAccountingVoucher({
        company_id: Number(companyId),
        voucher_type_id: accountingVoucherTypeId,
        voucher_date: accountingVoucherDate,
        party_ledger_id: partyLedgerId ?? undefined,
        narration: accountingVoucherNarration || undefined,
        entries,
        fyBounds,
      });
      const className = vt?.allowClasses && accountingVoucherClassId != null
        ? vt.classes.find((c) => c.id === accountingVoucherClassId)?.name
        : undefined;
      const partyName = accountingVoucherParticulars[0]?.ledgerName ?? accountingVoucherCashOrBankLedger;
      addVoucher({
        date: accountingVoucherDate,
        type: vt?.name ?? 'Payment',
        typeName: vt?.name,
        party: partyName,
        amount: total,
        lines: entryLines,
        voucherClassName: className,
      });
      setNextVoucherNumberByType(vt?.name ?? 'Payment', (nextVoucherNumberByType[vt?.name ?? 'Payment'] ?? 1) + 1);
      state.resetAccountingVoucher();
      return { saved: true };
    } catch (err) {
      console.error('Supabase payment/receipt save error:', err);
      return { saved: false, message: err instanceof Error ? err.message : String(err) };
    }
  },
  acceptCurrentAccountingVoucher: () => {
    const state = get();
    const vt = state.voucherTypes.find((v) => v.id === state.accountingVoucherTypeId);
    if (vt?.coreType === 'Payment' || vt?.coreType === 'Receipt') {
      return state.acceptPaymentReceiptVoucher();
    }
    return state.acceptGstAccountingVoucher();
  },
  setNextVoucherNumberByType: (typeName, num) =>
    set((state) => ({
      nextVoucherNumberByType: { ...state.nextVoucherNumberByType, [typeName]: num },
    })),
  toggleSidebar: () =>
    set((state) => ({ isSidebarCollapsed: !state.isSidebarCollapsed })),
  openConfig: () => set({ isConfigOpen: true }),
  closeConfig: () => set({ isConfigOpen: false }),
  toggleCompanyModal: () =>
    set((state) => ({ isCompanyModalOpen: !state.isCompanyModalOpen })),
  openGstRateModal: () => set({ isGstRateModalOpen: true }),
  closeGstRateModal: () => set({ isGstRateModalOpen: false }),
  openExchangeRateModal: () => set({ isExchangeRateModalOpen: true }),
  closeExchangeRateModal: () => set({ isExchangeRateModalOpen: false }),
  openExportModal: () => set({ isExportModalOpen: true }),
  closeExportModal: () => set({ isExportModalOpen: false }),
  setSearchOpen: (open) => set({ searchOpen: open, ...(open ? {} : { searchQuery: '' }) }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  updateExchangeRate: (item) =>
    set((state) => ({
      exchangeRates: state.exchangeRates.map((r) =>
        r.id === item.id ? item : r,
      ),
    })),
  toggleFeature: (id) =>
    set((state) => ({
      companyFeatures: state.companyFeatures.map((f) =>
        f.id === id ? { ...f, enabled: !f.enabled } : f,
      ),
    })),
  setFeatureUse: (id, use) =>
    set((state) => ({
      companyFeatures: state.companyFeatures.map((f) =>
        f.id === id ? { ...f, use } : f,
      ),
    })),
  updateTaxLedger: (item) =>
    set((state) => ({
      taxLedgers: state.taxLedgers.map((t) =>
        t.id === item.id ? item : t,
      ),
    })),
  addGstRate: (rate) => {
    const { gstRates } = get();
    const nextId =
      gstRates.length > 0 ? Math.max(...gstRates.map((r) => r.id)) + 1 : 1;
    set({ gstRates: [...gstRates, { ...rate, id: nextId }] });
  },
  updateGstRate: (rate) =>
    set((state) => ({
      gstRates: state.gstRates.map((r) =>
        r.id === rate.id ? rate : r,
      ),
    })),
  updateVoucherLine: (line) => {
    const state = get();
    let nextLines = state.voucherLines.map((l) =>
      l.id === line.id ? line : l,
    );
    if (line.id === state.voucherLines[0]?.id && !line.isGstRow) {
      const gstLine = nextLines.find((l) => l.isGstRow);
      if (gstLine) {
        const gstAmount = Math.round(line.amount * GST_RATE);
        nextLines = nextLines.map((l) =>
          l.id === gstLine.id ? { ...l, amount: gstAmount } : l,
        );
      }
    }
    set({ voucherLines: nextLines });
  },
  updateVoucherItem: (item) => {
    const discount = (item.discountPct ?? 0) / 100;
    const amount = Math.round(item.qty * item.rate * (1 - discount) * 100) / 100;
    set((state) => ({
      voucherItems: state.voucherItems.map((i) =>
        i.id === item.id ? { ...item, amount } : i,
      ),
    }));
  },
  addVoucherItem: (item) => {
    const state = get();
    const nextId = state.voucherItems.length
      ? Math.max(...state.voucherItems.map((i) => i.id)) + 1
      : 1;
    const newItem: VoucherItem = {
      id: nextId,
      itemName: item?.itemName ?? '',
      batch: item?.batch ?? '-',
      qty: item?.qty ?? 0,
      rate: item?.rate ?? 0,
      amount: item?.amount ?? 0,
      hsnsacCode: item?.hsnsacCode,
      igstPct: item?.igstPct,
      cgstPct: item?.cgstPct,
      sgstPct: item?.sgstPct,
      discountPct: item?.discountPct,
    };
    set({ voucherItems: [...state.voucherItems, newItem], accountingVoucherDirty: true });
  },
  removeVoucherItem: (id) => {
    set((state) => ({
      voucherItems: state.voucherItems.filter((i) => i.id !== id),
      accountingVoucherDirty: true,
    }));
  },
  acceptSalesVoucher: () => {
    const {
      voucherLines,
      addVoucher,
      mockData,
      getEffectiveCreditLimitForLedger,
      getOutstandingForParty,
    } = get();
    const total = voucherLines.reduce((s, l) => s + l.amount, 0);
    const party = voucherLines[0]?.ledgerName?.trim() ?? 'Party';
    const ledger = mockData.ledgers.find(
      (l) => l.name.trim().toLowerCase() === party.toLowerCase()
    );
    const groupName = ledger?.under;
    const limitRecord = getEffectiveCreditLimitForLedger(party, groupName);
    if (limitRecord?.applyToSales && limitRecord.amount > 0) {
      const outstanding = getOutstandingForParty(party);
      const newTotal = outstanding + total;
      if (newTotal > limitRecord.amount) {
        if (limitRecord.blockOnExceed) {
          return {
            saved: false,
            message: `Credit limit exceeded for ${party}. Limit: ${limitRecord.amount}, Outstanding + Voucher: ${newTotal}`,
          };
        }
        addVoucher({
          date: new Date().toISOString().slice(0, 10),
          type: 'Sales',
          party,
          amount: total,
        });
        return {
          saved: true,
          message: `Credit limit exceeded for ${party}. Limit: ${limitRecord.amount}, Outstanding + Voucher: ${newTotal}`,
          warn: true,
        };
      }
    }
    addVoucher({
      date: new Date().toISOString().slice(0, 10),
      type: 'Sales',
      party,
      amount: total,
    });
    return { saved: true };
  },
  addVoucher: (voucher) => {
    const { mockData } = get();
    const nextId =
      mockData.vouchers.length > 0
        ? Math.max(...mockData.vouchers.map((v) => v.id)) + 1
        : 1;
    set({
      mockData: {
        ...mockData,
        vouchers: [...mockData.vouchers, { ...voucher, id: nextId }],
      },
    });
  },
  updateVoucher: (voucher) => {
    const { mockData } = get();
    set({
      mockData: {
        ...mockData,
        vouchers: mockData.vouchers.map((v) =>
          v.id === voucher.id ? voucher : v,
        ),
      },
    });
  },
  deleteVoucher: (id) => {
    const { mockData } = get();
    set({
      mockData: {
        ...mockData,
        vouchers: mockData.vouchers.filter((v) => v.id !== id),
      },
    });
  },
}),
    {
      name: 'tally-app',
      partialize: (s) => ({
        companyId: s.companyId,
        date: s.date,
        showInactive: s.showInactive,
        showZeroBalance: s.showZeroBalance,
        userRole: s.userRole,
        dashboardTiles: s.dashboardTiles,
        dashboardTileSizes: s.dashboardTileSizes,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.companyId) {
          const company = initialCompanies.find((c) => c.id === state!.companyId);
          if (company) {
            useAppStore.setState({
              companyName: company.name,
              financialPeriodStart: company.financialStart,
              financialPeriodEnd: company.financialEnd,
            });
          }
        }
      },
    }
  )
);

