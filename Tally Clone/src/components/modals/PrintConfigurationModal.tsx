import * as React from 'react';
import { usePrintStore } from '../../store/usePrintStore';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-4">
      <h3 className="font-bold text-[#7F1D1D] mb-2 text-[11px] border-b border-[#D0D0D0] pb-1">
        {title}
      </h3>
      <div className="space-y-2 text-[10px]">{children}</div>
    </section>
  );
}

function CheckRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="border border-[#D0D0D0]" />
      <span>{label}</span>
    </label>
  );
}

function InputRow({ label, value, onChange, type = 'text', min, step }: { label: string; value: string | number; onChange: (v: string | number) => void; type?: string; min?: number; step?: number }) {
  return (
    <div className="grid grid-cols-[160px_1fr] gap-2 items-center">
      <span className="text-gray-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(type === 'number' ? Number(e.target.value) : e.target.value)}
        min={min}
        step={step}
        className="border border-[#D0D0D0] px-2 py-1 text-[10px]"
      />
    </div>
  );
}

export function PrintConfigurationModal() {
  const isOpen = usePrintStore((s) => s.printConfigOpen);
  const close = usePrintStore((s) => s.closePrintConfig);
  const companiesData = usePrintStore((s) => s.companiesData);
  const getSettings = usePrintStore((s) => s.getSettings);
  const updateSettings = usePrintStore((s) => s.updateSettings);
  const acceptPrintConfig = usePrintStore((s) => s.acceptPrintConfig);

  const s = getSettings();
  void companiesData; // subscribe so modal re-renders when settings change

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (!isOpen) return;
      if (e.ctrlKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        acceptPrintConfig();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, acceptPrintConfig]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#808080]/60 text-[11px]">
      <div className="flex w-full max-w-2xl max-h-[90vh] flex-col border border-[#D0D0D0] bg-white shadow-lg rounded-sm overflow-hidden">
        <div className="border-b border-[#D0D0D0] bg-[#FFD700] px-4 py-2 text-[12px] font-bold text-[#7F1D1D]">
          Print Configuration
        </div>
        <ScrollArea className="flex-1 overflow-auto p-4">
          <Section title="Printer Settings">
            <InputRow label="Print format" value={s.printFormat} onChange={(v) => updateSettings({ printFormat: String(v) })} />
            <InputRow label="Printer name" value={s.printerName} onChange={(v) => updateSettings({ printerName: String(v) })} />
            <InputRow label="Paper type" value={s.paperType} onChange={(v) => updateSettings({ paperType: String(v) })} />
            <InputRow label="Number of copies" value={s.numberOfCopies} onChange={(v) => updateSettings({ numberOfCopies: Number(v) })} type="number" min={1} />
            <CheckRow label="Set preview as default" checked={s.setPreviewAsDefault} onChange={(v) => updateSettings({ setPreviewAsDefault: v })} />
            <CheckRow label="Enable stripe view for reports" checked={s.enableStripeViewForReports} onChange={(v) => updateSettings({ enableStripeViewForReports: v })} />
          </Section>
          <Section title="Header Information">
            <InputRow label="Top margin (inches)" value={s.topMarginInches} onChange={(v) => updateSettings({ topMarginInches: Number(v) })} type="number" step={0.1} min={0} />
            <CheckRow label="Print country with address" checked={s.printCountryWithAddress} onChange={(v) => updateSettings({ printCountryWithAddress: v })} />
            <CheckRow label="Show date range of report" checked={s.showDateRangeOfReport} onChange={(v) => updateSettings({ showDateRangeOfReport: v })} />
            <CheckRow label="Show page numbers" checked={s.showPageNumbers} onChange={(v) => updateSettings({ showPageNumbers: v })} />
            <CheckRow label="Show date/time of reports" checked={s.showDateTimeOfReports} onChange={(v) => updateSettings({ showDateTimeOfReports: v })} />
            <CheckRow label="Show date/time on all pages of reports" checked={s.showDateTimeOnAllPagesOfReports} onChange={(v) => updateSettings({ showDateTimeOnAllPagesOfReports: v })} />
            <CheckRow label="Show date/time of voucher printing" checked={s.showDateTimeOfVoucherPrinting} onChange={(v) => updateSettings({ showDateTimeOfVoucherPrinting: v })} />
            <CheckRow label="Show date/time on all pages of vouchers" checked={s.showDateTimeOnAllPagesOfVouchers} onChange={(v) => updateSettings({ showDateTimeOnAllPagesOfVouchers: v })} />
          </Section>
          <Section title="Company Details">
            <CheckRow label="Include company logo" checked={s.includeCompanyLogo} onChange={(v) => updateSettings({ includeCompanyLogo: v })} />
            <InputRow label="Logo image path" value={s.logoImagePath} onChange={(v) => updateSettings({ logoImagePath: String(v) })} />
            <CheckRow label="Show company name" checked={s.showCompanyName} onChange={(v) => updateSettings({ showCompanyName: v })} />
            <CheckRow label="Show company address" checked={s.showCompanyAddress} onChange={(v) => updateSettings({ showCompanyAddress: v })} />
            <CheckRow label="Show phone number" checked={s.showPhoneNumber} onChange={(v) => updateSettings({ showPhoneNumber: v })} />
            <CheckRow label="Show country code for mobile" checked={s.showCountryCodeForMobile} onChange={(v) => updateSettings({ showCountryCodeForMobile: v })} />
            <CheckRow label="Show fax" checked={s.showFax} onChange={(v) => updateSettings({ showFax: v })} />
            <CheckRow label="Show email" checked={s.showEmail} onChange={(v) => updateSettings({ showEmail: v })} />
            <CheckRow label="Show website" checked={s.showWebsite} onChange={(v) => updateSettings({ showWebsite: v })} />
            <CheckRow label="Show CIN" checked={s.showCIN} onChange={(v) => updateSettings({ showCIN: v })} />
            <CheckRow label="Show Udyam Reg No and enterprise type" checked={s.showUdyamRegNoAndEnterpriseType} onChange={(v) => updateSettings({ showUdyamRegNoAndEnterpriseType: v })} />
            <CheckRow label="Show activity type for reports" checked={s.showActivityTypeForReports} onChange={(v) => updateSettings({ showActivityTypeForReports: v })} />
          </Section>
          <Section title="Advanced Configurations">
            <CheckRow label="Reduce space between address and items" checked={s.reduceSpaceBetweenAddressAndItems} onChange={(v) => updateSettings({ reduceSpaceBetweenAddressAndItems: v })} />
            <CheckRow label="Use greyscale for B/W printers" checked={s.useGreyscaleForBWPrinters} onChange={(v) => updateSettings({ useGreyscaleForBWPrinters: v })} />
            <CheckRow label="Retrieve paper size for non-standard printers" checked={s.retrievePaperSizeForNonStandardPrinters} onChange={(v) => updateSettings({ retrievePaperSizeForNonStandardPrinters: v })} />
            <CheckRow label="Use bitmap mode to print" checked={s.useBitmapModeToPrint} onChange={(v) => updateSettings({ useBitmapModeToPrint: v })} />
          </Section>
        </ScrollArea>
        <div className="flex justify-end gap-2 px-4 py-2 border-t border-[#D0D0D0] bg-[#F5F5F5]">
          <Button size="sm" variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button size="sm" className="bg-[#DC2626] text-white hover:bg-[#B91C1C]" onClick={acceptPrintConfig}>
            Accept (Ctrl+A)
          </Button>
        </div>
      </div>
    </div>
  );
}
