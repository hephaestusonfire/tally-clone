import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAppStore } from './useAppStore';

export interface PrintSettings {
  // Printer Settings
  printFormat: string;
  printerName: string;
  paperType: string;
  setPreviewAsDefault: boolean;
  numberOfCopies: number;
  enableStripeViewForReports: boolean;
  // Header Information
  printCountryWithAddress: boolean;
  topMarginInches: number;
  showDateRangeOfReport: boolean;
  showPageNumbers: boolean;
  showDateTimeOfReports: boolean;
  showDateTimeOnAllPagesOfReports: boolean;
  showDateTimeOfVoucherPrinting: boolean;
  showDateTimeOnAllPagesOfVouchers: boolean;
  // Company Details
  includeCompanyLogo: boolean;
  logoImagePath: string;
  showCompanyName: boolean;
  showCompanyAddress: boolean;
  showPhoneNumber: boolean;
  showCountryCodeForMobile: boolean;
  showFax: boolean;
  showEmail: boolean;
  showWebsite: boolean;
  showCIN: boolean;
  showUdyamRegNoAndEnterpriseType: boolean;
  showActivityTypeForReports: boolean;
  // Advanced
  reduceSpaceBetweenAddressAndItems: boolean;
  useGreyscaleForBWPrinters: boolean;
  retrievePaperSizeForNonStandardPrinters: boolean;
  useBitmapModeToPrint: boolean;
}

const defaultPrintSettings: PrintSettings = {
  printFormat: 'Neat Mode',
  printerName: '',
  paperType: 'Plain Paper',
  setPreviewAsDefault: false,
  numberOfCopies: 1,
  enableStripeViewForReports: false,
  printCountryWithAddress: true,
  topMarginInches: 0.5,
  showDateRangeOfReport: true,
  showPageNumbers: true,
  showDateTimeOfReports: true,
  showDateTimeOnAllPagesOfReports: false,
  showDateTimeOfVoucherPrinting: true,
  showDateTimeOnAllPagesOfVouchers: false,
  includeCompanyLogo: false,
  logoImagePath: '',
  showCompanyName: true,
  showCompanyAddress: true,
  showPhoneNumber: true,
  showCountryCodeForMobile: true,
  showFax: false,
  showEmail: false,
  showWebsite: false,
  showCIN: false,
  showUdyamRegNoAndEnterpriseType: false,
  showActivityTypeForReports: false,
  reduceSpaceBetweenAddressAndItems: false,
  useGreyscaleForBWPrinters: false,
  retrievePaperSizeForNonStandardPrinters: false,
  useBitmapModeToPrint: false,
};

export interface ReportItem {
  id: string;
  label: string;
  view?: string;
}

export interface ReportCategory {
  id: string;
  label: string;
  items: ReportItem[];
}

const REPORT_CATEGORIES: ReportCategory[] = [
  {
    id: 'multi',
    label: 'Multi Account Reports',
    items: [
      { id: 'tb', label: 'Trial Balance', view: 'trial-balance' },
      { id: 'bs', label: 'Balance Sheet', view: 'balance-sheet' },
      { id: 'pl', label: 'Profit & Loss A/c', view: 'profit-loss' },
      { id: 'cf', label: 'Cash Flow', view: 'cash-flow' },
      { id: 'ra', label: 'Ratio Analysis', view: 'ratio-analysis' },
      { id: 'ms', label: 'Monthly Summary', view: 'monthly-summary' },
    ],
  },
  {
    id: 'cashbank',
    label: 'Cash / Bank Books',
    items: [
      { id: 'db', label: 'Day Book', view: 'day-book' },
      { id: 'cb', label: 'Cash Book', view: 'day-book' },
      { id: 'bb', label: 'Bank Book', view: 'ledger-vouchers' },
    ],
  },
  {
    id: 'ledger',
    label: 'Ledger Reports',
    items: [
      { id: 'lv', label: 'Ledger Vouchers', view: 'ledger-vouchers' },
      { id: 'lr', label: 'Ledger Report', view: 'ledger-vouchers' },
    ],
  },
  {
    id: 'voucher',
    label: 'Voucher Reports',
    items: [
      { id: 'vr', label: 'Voucher Register', view: 'voucher-register' },
      { id: 'jb', label: 'Journal Book', view: 'vouchers' },
    ],
  },
  {
    id: 'outstanding',
    label: 'Outstanding Reports',
    items: [
      { id: 'sd', label: 'Sundry Debtors', view: 'ledger-vouchers' },
      { id: 'sc', label: 'Sundry Creditors', view: 'ledger-vouchers' },
    ],
  },
  {
    id: 'inventory',
    label: 'Inventory / Stock Reports',
    items: [
      { id: 'sg', label: 'Stock Groups', view: 'stock-groups' },
      { id: 'si', label: 'Stock Items', view: 'stock-items' },
    ],
  },
];

function getCompanyKey(): string {
  return useAppStore.getState().companyName || 'default';
}

interface PrintState {
  companiesData: Record<string, { settings: PrintSettings }>;
  printReportOpen: boolean;
  printConfigOpen: boolean;
  expandAll: boolean;
  showMore: boolean;
  openPrintReport: () => void;
  closePrintReport: () => void;
  openPrintConfig: () => void;
  closePrintConfig: () => void;
  setExpandAll: (v: boolean) => void;
  setShowMore: (v: boolean) => void;
  getSettings: () => PrintSettings;
  updateSettings: (s: Partial<PrintSettings>) => void;
  acceptPrintConfig: () => void;
  getReportCategories: () => ReportCategory[];
  executePrint: (view?: string) => void;
}

export const usePrintStore = create<PrintState>()(
  persist(
    (set, get) => ({
      companiesData: {},
      printReportOpen: false,
      printConfigOpen: false,
      expandAll: true,
      showMore: true,

      openPrintReport: () => set({ printReportOpen: true }),
      closePrintReport: () => set({ printReportOpen: false }),
      openPrintConfig: () => set({ printConfigOpen: true }),
      closePrintConfig: () => set({ printConfigOpen: false }),
      setExpandAll: (v) => set({ expandAll: v }),
      setShowMore: (v) => set({ showMore: v }),

      getSettings: () => {
        const key = getCompanyKey();
        const data = get().companiesData[key];
        const settings = data?.settings ?? defaultPrintSettings;
        return { ...defaultPrintSettings, ...settings };
      },

      updateSettings: (partial) => {
        const key = getCompanyKey();
        set((s) => {
          const current = s.companiesData[key] ?? { settings: defaultPrintSettings };
          return {
            companiesData: {
              ...s.companiesData,
              [key]: {
                settings: { ...current.settings, ...partial },
              },
            },
          };
        });
      },

      acceptPrintConfig: () => get().closePrintConfig(),

      getReportCategories: () => REPORT_CATEGORIES,

      executePrint: (view) => {
        if (view) {
          useAppStore.getState().setActiveView(view);
          setTimeout(() => window.print(), 300);
        } else {
          window.print();
        }
      },
    }),
    { name: 'tally-print', partialize: (s) => ({ companiesData: s.companiesData }) }
  )
);
