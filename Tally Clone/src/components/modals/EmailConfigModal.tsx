import * as React from 'react';
import { useShareStore, type EmailConfig } from '../../store/useShareStore';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

function BoolCell({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <select
      value={value ? 'Yes' : 'No'}
      onChange={(e) => onChange(e.target.value === 'Yes')}
      className="border border-[#D0D0D0] bg-white px-1.5 py-0.5 text-[11px] w-full max-w-[80px]"
    >
      <option value="Yes">Yes</option>
      <option value="No">No</option>
    </select>
  );
}

function TextCell({ value, onChange, placeholder }: { value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="border border-[#D0D0D0] bg-white px-1.5 py-0.5 text-[11px] w-full min-w-0"
    />
  );
}

function NumCell({ value, onChange, step = 0.01 }: { value: number; onChange: (v: number) => void; step?: number }) {
  return (
    <input
      type="number"
      step={step}
      value={value}
      onChange={(e) => onChange(Number(e.target.value) || 0)}
      className="border border-[#D0D0D0] bg-white px-1.5 py-0.5 text-[11px] w-full max-w-[80px]"
    />
  );
}

function ConfigRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[1fr_1fr] gap-2 items-center py-0.5 border-b border-[#E8E8E8] last:border-0 text-[11px]">
      <span className="text-gray-700">{label}</span>
      <div className="min-w-0">{children}</div>
    </div>
  );
}

export function EmailConfigModal() {
  const isOpen = useShareStore((s) => s.isEmailConfigModalOpen);
  const close = useShareStore((s) => s.closeEmailConfig);
  const emailConfig = useShareStore((s) => s.emailConfig);
  const setEmailConfig = useShareStore((s) => s.setEmailConfig);
  const [showMore, setShowMore] = React.useState(false);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.key === 'Escape' || (e.key === 'q' && !e.ctrlKey && !e.metaKey)) {
        e.preventDefault();
        close();
      }
      if (e.key === 'a' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;
        e.preventDefault();
        close();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, close]);

  if (!isOpen) return null;

  const update = (patch: Partial<EmailConfig>) => setEmailConfig(patch);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 text-[11px]">
      <div className="bg-[#FEF2F2] border border-[#D0D0D0] shadow-lg min-w-[520px] max-w-[600px] max-h-[90vh] flex flex-col">
        <div className="px-3 py-2 border-b border-[#D0D0D0] bg-[#C0C0C0] font-semibold">
          E-mail Configuration
        </div>
        <ScrollArea className="flex-1 overflow-auto p-3">
          <div className="border border-[#D0D0D0] bg-white">
            <div className="flex items-center justify-between px-2 py-1.5 border-b border-[#D0D0D0] bg-[#FFD700]">
              <span className="font-bold text-[#7F1D1D]">List of Configurations</span>
              <button
                type="button"
                className="text-[10px] font-medium text-[#7F1D1D] underline"
                onClick={() => setShowMore((m) => !m)}
              >
                {showMore ? 'Show Less' : 'Show More'}
              </button>
            </div>
            <div className="p-2 space-y-2">
              {/* E-mail Settings */}
              <div className="font-semibold text-[#7F1D1D] text-[10px] uppercase">E-mail Settings</div>
              <ConfigRow label="Show Cc:"><BoolCell value={emailConfig.showCc} onChange={(v) => update({ showCc: v })} /></ConfigRow>
              <ConfigRow label="Show Bcc:"><BoolCell value={emailConfig.showBcc} onChange={(v) => update({ showBcc: v })} /></ConfigRow>
              <ConfigRow label="Pre-defined Message:"><TextCell value={emailConfig.predefinedMessage} onChange={(v) => update({ predefinedMessage: v })} placeholder="<0 defined>" /></ConfigRow>
              <ConfigRow label="Pre-defined E-mail Profile:"><TextCell value={emailConfig.predefinedEmailProfile} onChange={(v) => update({ predefinedEmailProfile: v })} placeholder="<0 defined>" /></ConfigRow>
              <ConfigRow label="Show additional details for Recipient E-mail ID:"><BoolCell value={emailConfig.showAdditionalDetailsRecipientEmail} onChange={(v) => update({ showAdditionalDetailsRecipientEmail: v })} /></ConfigRow>
              <ConfigRow label="Set no. of copies for Emailing vouchers:"><TextCell value={emailConfig.setNoOfCopiesEmailingVouchers} onChange={(v) => update({ setNoOfCopiesEmailingVouchers: v })} /></ConfigRow>
              <ConfigRow label="Enable export to PDF in Arabic:"><BoolCell value={emailConfig.enableExportPdfArabic} onChange={(v) => update({ enableExportPdfArabic: v })} /></ConfigRow>
              <ConfigRow label="Enable Stripe View for Reports:"><BoolCell value={emailConfig.enableStripeViewReports} onChange={(v) => update({ enableStripeViewReports: v })} /></ConfigRow>

              {/* Header Information */}
              <div className="font-semibold text-[#7F1D1D] text-[10px] uppercase pt-1">Header Information</div>
              <ConfigRow label="Print Country with Address:"><BoolCell value={emailConfig.printCountryWithAddress} onChange={(v) => update({ printCountryWithAddress: v })} /></ConfigRow>
              <ConfigRow label="Top Margin of Reports (in inches):"><NumCell value={emailConfig.topMarginReportsInches} onChange={(v) => update({ topMarginReportsInches: v })} step={0.1} /></ConfigRow>
              <ConfigRow label="Show Date Range of Report:"><BoolCell value={emailConfig.showDateRangeOfReport} onChange={(v) => update({ showDateRangeOfReport: v })} /></ConfigRow>
              <ConfigRow label="Show Page Numbers in Vouchers and Reports:"><BoolCell value={emailConfig.showPageNumbersVouchersReports} onChange={(v) => update({ showPageNumbersVouchersReports: v })} /></ConfigRow>
              <ConfigRow label="Show Date and Time of Reports:"><BoolCell value={emailConfig.showDateAndTimeOfReports} onChange={(v) => update({ showDateAndTimeOfReports: v })} /></ConfigRow>
              <ConfigRow label="Show Date and Time on all pages of Reports:"><BoolCell value={emailConfig.showDateAndTimeOnAllPagesReports} onChange={(v) => update({ showDateAndTimeOnAllPagesReports: v })} /></ConfigRow>
              <ConfigRow label="Show Date and Time of Voucher printing:"><BoolCell value={emailConfig.showDateAndTimeVoucherPrinting} onChange={(v) => update({ showDateAndTimeVoucherPrinting: v })} /></ConfigRow>
              <ConfigRow label="Show Date and Time on all pages of Vouchers:"><BoolCell value={emailConfig.showDateAndTimeOnAllPagesVouchers} onChange={(v) => update({ showDateAndTimeOnAllPagesVouchers: v })} /></ConfigRow>

              {showMore && (
                <>
                  <div className="font-semibold text-[#7F1D1D] text-[10px] uppercase pt-1">Company Details</div>
                  <ConfigRow label="Include company logo (applicable to Print/Export/Share):"><BoolCell value={emailConfig.includeCompanyLogo} onChange={(v) => update({ includeCompanyLogo: v })} /></ConfigRow>
                  <ConfigRow label="Image Path:"><TextCell value={emailConfig.imagePath} onChange={(v) => update({ imagePath: v })} /></ConfigRow>
                  <ConfigRow label="Show Company Name:"><BoolCell value={emailConfig.showCompanyName} onChange={(v) => update({ showCompanyName: v })} /></ConfigRow>
                  <ConfigRow label="Show Company Address:"><BoolCell value={emailConfig.showCompanyAddress} onChange={(v) => update({ showCompanyAddress: v })} /></ConfigRow>
                  <ConfigRow label="Show Phone No.:"><BoolCell value={emailConfig.showPhoneNo} onChange={(v) => update({ showPhoneNo: v })} /></ConfigRow>
                  <ConfigRow label="Show Country Code for Mobile No.:"><BoolCell value={emailConfig.showCountryCodeMobileNo} onChange={(v) => update({ showCountryCodeMobileNo: v })} /></ConfigRow>
                  <ConfigRow label="Show Fax:"><BoolCell value={emailConfig.showFax} onChange={(v) => update({ showFax: v })} /></ConfigRow>
                  <ConfigRow label="Show E-mail:"><BoolCell value={emailConfig.showEmail} onChange={(v) => update({ showEmail: v })} /></ConfigRow>
                  <ConfigRow label="Show Website:"><BoolCell value={emailConfig.showWebsite} onChange={(v) => update({ showWebsite: v })} /></ConfigRow>
                  <ConfigRow label="Show CIN:"><BoolCell value={emailConfig.showCin} onChange={(v) => update({ showCin: v })} /></ConfigRow>
                  <ConfigRow label="Show Udyam Reg No. & Enterprise Type for Reports:"><BoolCell value={emailConfig.showUdyamRegNoEnterpriseTypeReports} onChange={(v) => update({ showUdyamRegNoEnterpriseTypeReports: v })} /></ConfigRow>
                  <ConfigRow label="Show Activity Type for Reports:"><BoolCell value={emailConfig.showActivityTypeReports} onChange={(v) => update({ showActivityTypeReports: v })} /></ConfigRow>
                </>
              )}
            </div>
          </div>
        </ScrollArea>
        <div className="flex justify-between items-center px-3 py-2 border-t border-[#D0D0D0] bg-[#F5F5F5]">
          <span className="text-[10px] text-gray-600">Q: Quit · A: Accept</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={close}>Q: Quit</Button>
            <Button size="sm" className="bg-[#DC2626] text-white hover:bg-[#B91C1C]" onClick={close}>A: Accept</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
