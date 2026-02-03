import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/** E-mail Configuration (List of Configurations) */
export interface EmailConfig {
  // E-mail Settings
  showCc: boolean;
  showBcc: boolean;
  predefinedMessage: string;
  predefinedEmailProfile: string;
  showAdditionalDetailsRecipientEmail: boolean;
  setNoOfCopiesEmailingVouchers: string;
  enableExportPdfArabic: boolean;
  enableStripeViewReports: boolean;
  // Header Information
  printCountryWithAddress: boolean;
  topMarginReportsInches: number;
  showDateRangeOfReport: boolean;
  showPageNumbersVouchersReports: boolean;
  showDateAndTimeOfReports: boolean;
  showDateAndTimeOnAllPagesReports: boolean;
  showDateAndTimeVoucherPrinting: boolean;
  showDateAndTimeOnAllPagesVouchers: boolean;
  // Company Details
  includeCompanyLogo: boolean;
  imagePath: string;
  showCompanyName: boolean;
  showCompanyAddress: boolean;
  showPhoneNo: boolean;
  showCountryCodeMobileNo: boolean;
  showFax: boolean;
  showEmail: boolean;
  showWebsite: boolean;
  showCin: boolean;
  showUdyamRegNoEnterpriseTypeReports: boolean;
  showActivityTypeReports: boolean;
}

export const defaultEmailConfig: EmailConfig = {
  showCc: false,
  showBcc: false,
  predefinedMessage: '',
  predefinedEmailProfile: '',
  showAdditionalDetailsRecipientEmail: false,
  setNoOfCopiesEmailingVouchers: '1',
  enableExportPdfArabic: false,
  enableStripeViewReports: false,
  printCountryWithAddress: false,
  topMarginReportsInches: 0.5,
  showDateRangeOfReport: true,
  showPageNumbersVouchersReports: true,
  showDateAndTimeOfReports: false,
  showDateAndTimeOnAllPagesReports: false,
  showDateAndTimeVoucherPrinting: false,
  showDateAndTimeOnAllPagesVouchers: false,
  includeCompanyLogo: true,
  imagePath: 'E:\\TallyPrime\\MMEE LOGO.jpg',
  showCompanyName: true,
  showCompanyAddress: true,
  showPhoneNo: true,
  showCountryCodeMobileNo: true,
  showFax: true,
  showEmail: true,
  showWebsite: true,
  showCin: true,
  showUdyamRegNoEnterpriseTypeReports: true,
  showActivityTypeReports: true,
};

export interface ShareState {
  shareMenuOpen: boolean;
  setShareMenuOpen: (open: boolean) => void;
  emailConfig: EmailConfig;
  setEmailConfig: (config: Partial<EmailConfig>) => void;
  isEmailConfigModalOpen: boolean;
  openEmailConfig: () => void;
  closeEmailConfig: () => void;
  isEmailSendCurrentOpen: boolean;
  openEmailSendCurrent: () => void;
  closeEmailSendCurrent: () => void;
  isEmailSendOthersOpen: boolean;
  openEmailSendOthers: () => void;
  closeEmailSendOthers: () => void;
  isShareConfigOpen: boolean;
  openShareConfig: () => void;
  closeShareConfig: () => void;
}

export const useShareStore = create<ShareState>()(
  persist(
    (set) => ({
      shareMenuOpen: false,
      setShareMenuOpen: (open) => set({ shareMenuOpen: open }),
      emailConfig: defaultEmailConfig,
      setEmailConfig: (config) =>
        set((s) => ({ emailConfig: { ...s.emailConfig, ...config } })),
      isEmailConfigModalOpen: false,
      openEmailConfig: () => set({ isEmailConfigModalOpen: true }),
      closeEmailConfig: () => set({ isEmailConfigModalOpen: false }),
      isEmailSendCurrentOpen: false,
      openEmailSendCurrent: () => set({ isEmailSendCurrentOpen: true }),
      closeEmailSendCurrent: () => set({ isEmailSendCurrentOpen: false }),
      isEmailSendOthersOpen: false,
      openEmailSendOthers: () => set({ isEmailSendOthersOpen: true }),
      closeEmailSendOthers: () => set({ isEmailSendOthersOpen: false }),
      isShareConfigOpen: false,
      openShareConfig: () => set({ isShareConfigOpen: true }),
      closeShareConfig: () => set({ isShareConfigOpen: false }),
    }),
    { name: 'tally-share', partialize: (s) => ({ emailConfig: s.emailConfig }) }
  )
);
