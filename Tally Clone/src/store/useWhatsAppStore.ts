import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useAppStore } from './useAppStore';

export interface WhatsAppSettings {
  setPreviewAsDefault: boolean;
  enablePdfArabic: boolean;
  enableStripeView: boolean;
  topMarginInches: number;
  showDateRange: boolean;
  showReportDateTime: boolean;
  showVoucherDateTime: boolean;
  includeCompanyLogo: boolean;
  logoImagePath: string;
  showCompanyName: boolean;
  showCompanyAddress: boolean;
  showPhoneNumber: boolean;
  showCountryCode: boolean;
}

export interface WhatsAppNumber {
  id: number;
  label: string;
  /** Business name for display in Manage > WhatsApp Nos. */
  businessName?: string;
  number: string;
  countryCode: string;
  isDefault?: boolean;
}

/** WhatsApp share/config (default no., template, attach PDF, short links) */
export interface WhatsAppConfig {
  defaultBusinessWhatsAppNo: string;
  messageTemplateForInvoices: string;
  attachPdfByDefault: boolean;
  useShortLinks: boolean;
}

const defaultWhatsAppConfig: WhatsAppConfig = {
  defaultBusinessWhatsAppNo: '',
  messageTemplateForInvoices: 'Please find attached report.',
  attachPdfByDefault: true,
  useShortLinks: false,
};

export interface CompanyWhatsAppData {
  settings: WhatsAppSettings;
  numbers: WhatsAppNumber[];
  whatsappConfig: WhatsAppConfig;
  walletBalance: number;
  subscriptionExpiry: string; // ISO date
  subscriptionRenewed: boolean;
}

const defaultSettings: WhatsAppSettings = {
  setPreviewAsDefault: false,
  enablePdfArabic: false,
  enableStripeView: false,
  topMarginInches: 0.5,
  showDateRange: true,
  showReportDateTime: true,
  showVoucherDateTime: true,
  includeCompanyLogo: false,
  logoImagePath: '',
  showCompanyName: true,
  showCompanyAddress: true,
  showPhoneNumber: true,
  showCountryCode: true,
};

const defaultCompanyData: CompanyWhatsAppData = {
  settings: defaultSettings,
  numbers: [],
  whatsappConfig: defaultWhatsAppConfig,
  walletBalance: 100,
  subscriptionExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  subscriptionRenewed: false,
};

interface WhatsAppState {
  companiesData: Record<string, CompanyWhatsAppData>;
  isSettingsOpen: boolean;
  isNumbersOpen: boolean;
  isShareOpen: boolean;
  isRechargeOpen: boolean;
  isRenewOpen: boolean;
  isWhatsappSendCurrentOpen: boolean;
  isWhatsappSendOthersOpen: boolean;
  isSignupOpen: boolean;
  shareError: string | null;
  openSettings: () => void;
  closeSettings: () => void;
  openNumbers: () => void;
  closeNumbers: () => void;
  openShare: () => void;
  closeShare: () => void;
  openRecharge: () => void;
  closeRecharge: () => void;
  openRenew: () => void;
  closeRenew: () => void;
  openWhatsappSendCurrent: () => void;
  closeWhatsappSendCurrent: () => void;
  openWhatsappSendOthers: () => void;
  closeWhatsappSendOthers: () => void;
  openSignup: () => void;
  closeSignup: () => void;
  getWhatsappConfig: () => WhatsAppConfig;
  setWhatsappConfig: (config: Partial<WhatsAppConfig>) => void;
  setSubscriptionRenewed: (renewed: boolean) => void;
  setShareError: (err: string | null) => void;
  getCurrentData: () => CompanyWhatsAppData;
  updateSettings: (settings: Partial<WhatsAppSettings>) => void;
  addNumber: (n: Omit<WhatsAppNumber, 'id'>) => void;
  updateNumber: (id: number, n: Partial<WhatsAppNumber>) => void;
  deleteNumber: (id: number) => void;
  setWalletBalance: (balance: number) => void;
  setSubscriptionExpiry: (date: string) => void;
  validateAndShare: () => { ok: boolean; error?: string };
}

function getCompanyKey(): string {
  return useAppStore.getState().companyName || 'default';
}

export const useWhatsAppStore = create<WhatsAppState>()(
  persist(
    (set, get) => ({
      companiesData: {},
      isSettingsOpen: false,
      isNumbersOpen: false,
      isShareOpen: false,
      isRechargeOpen: false,
      isRenewOpen: false,
      isWhatsappSendCurrentOpen: false,
      isWhatsappSendOthersOpen: false,
      isSignupOpen: false,
      shareError: null,

      openSettings: () => set({ isSettingsOpen: true }),
      closeSettings: () => set({ isSettingsOpen: false }),
      openNumbers: () => set({ isNumbersOpen: true }),
      closeNumbers: () => set({ isNumbersOpen: false }),
      openShare: () => set({ isShareOpen: true, shareError: null }),
      closeShare: () => set({ isShareOpen: false, shareError: null }),
      openRecharge: () => set({ isRechargeOpen: true }),
      closeRecharge: () => set({ isRechargeOpen: false }),
      openRenew: () => set({ isRenewOpen: true }),
      closeRenew: () => set({ isRenewOpen: false }),
      openWhatsappSendCurrent: () => set({ isWhatsappSendCurrentOpen: true }),
      closeWhatsappSendCurrent: () => set({ isWhatsappSendCurrentOpen: false }),
      openWhatsappSendOthers: () => set({ isWhatsappSendOthersOpen: true }),
      closeWhatsappSendOthers: () => set({ isWhatsappSendOthersOpen: false }),
      openSignup: () => set({ isSignupOpen: true }),
      closeSignup: () => set({ isSignupOpen: false }),
      setShareError: (err) => set({ shareError: err }),

      getWhatsappConfig: () => {
        const key = getCompanyKey();
        const data = get().companiesData[key];
        const cfg = data?.whatsappConfig;
        return cfg ? { ...defaultWhatsAppConfig, ...cfg } : defaultWhatsAppConfig;
      },
      setWhatsappConfig: (config) => {
        const key = getCompanyKey();
        set((s) => {
          const current = s.companiesData[key] ?? defaultCompanyData;
          const prevCfg = current.whatsappConfig ?? defaultWhatsAppConfig;
          return {
            companiesData: {
              ...s.companiesData,
              [key]: {
                ...current,
                whatsappConfig: { ...prevCfg, ...config },
              },
            },
          };
        });
      },
      setSubscriptionRenewed: (renewed) => {
        const key = getCompanyKey();
        set((s) => {
          const current = s.companiesData[key] ?? defaultCompanyData;
          return {
            companiesData: {
              ...s.companiesData,
              [key]: { ...current, subscriptionRenewed: renewed },
            },
          };
        });
      },

      getCurrentData: () => {
        const key = getCompanyKey();
        const data = get().companiesData[key];
        if (!data) return defaultCompanyData;
        return {
          ...defaultCompanyData,
          ...data,
          settings: { ...defaultSettings, ...data.settings },
          numbers: data.numbers ?? [],
          whatsappConfig: data.whatsappConfig ? { ...defaultWhatsAppConfig, ...data.whatsappConfig } : defaultWhatsAppConfig,
          subscriptionRenewed: data.subscriptionRenewed ?? false,
        };
      },

      updateSettings: (settings) => {
        const key = getCompanyKey();
        set((s) => {
          const current = s.companiesData[key] ?? defaultCompanyData;
          return {
            companiesData: {
              ...s.companiesData,
              [key]: {
                ...current,
                settings: { ...current.settings, ...settings },
              },
            },
          };
        });
      },

      addNumber: (n) => {
        const key = getCompanyKey();
        set((s) => {
          const current = s.companiesData[key] ?? defaultCompanyData;
          const base = { ...defaultCompanyData, ...current };
          const ids = base.numbers.map((x) => x.id);
          const nextId = ids.length ? Math.max(...ids) + 1 : 1;
          return {
            companiesData: {
              ...s.companiesData,
              [key]: {
                ...base,
                numbers: [...base.numbers, { ...n, id: nextId }],
              },
            },
          };
        });
      },

      updateNumber: (id, n) => {
        const key = getCompanyKey();
        set((s) => {
          const current = s.companiesData[key] ?? defaultCompanyData;
          return {
            companiesData: {
              ...s.companiesData,
              [key]: {
                ...current,
                numbers: current.numbers.map((x) => (x.id === id ? { ...x, ...n } : x)),
              },
            },
          };
        });
      },

      deleteNumber: (id) => {
        const key = getCompanyKey();
        set((s) => {
          const current = s.companiesData[key] ?? defaultCompanyData;
          return {
            companiesData: {
              ...s.companiesData,
              [key]: {
                ...current,
                numbers: current.numbers.filter((x) => x.id !== id),
              },
            },
          };
        });
      },

      setWalletBalance: (balance) => {
        const key = getCompanyKey();
        set((s) => {
          const current = s.companiesData[key] ?? defaultCompanyData;
          return {
            companiesData: {
              ...s.companiesData,
              [key]: { ...current, walletBalance: balance },
            },
          };
        });
      },

      setSubscriptionExpiry: (date) => {
        const key = getCompanyKey();
        set((s) => {
          const current = s.companiesData[key] ?? defaultCompanyData;
          return {
            companiesData: {
              ...s.companiesData,
              [key]: { ...current, subscriptionExpiry: date },
            },
          };
        });
      },

      validateAndShare: () => {
        const data = get().getCurrentData();
        if (data.numbers.length === 0) return { ok: false, error: 'No WhatsApp numbers configured. Add a number under Share → Manage → WhatsApp Numbers.' };
        if (data.walletBalance <= 0) return { ok: false, error: 'Insufficient wallet balance. Recharge under Share → Manage → Recharge Wallet.' };
        const expiry = new Date(data.subscriptionExpiry).getTime();
        if (expiry < Date.now()) return { ok: false, error: 'WhatsApp subscription has expired. Renew under Share → Manage → Renew Subscription.' };
        return { ok: true };
      },
    }),
    { name: 'tally-whatsapp', partialize: (s) => ({ companiesData: s.companiesData }) }
  )
);
