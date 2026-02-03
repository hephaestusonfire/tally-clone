import { useWhatsAppStore, type WhatsAppSettings } from '../../store/useWhatsAppStore';
import { Button } from '../ui/button';

export function WhatsAppSettingsModal() {
  const isOpen = useWhatsAppStore((s) => s.isSettingsOpen);
  const close = useWhatsAppStore((s) => s.closeSettings);
  const getCurrentData = useWhatsAppStore((s) => s.getCurrentData);
  const updateSettings = useWhatsAppStore((s) => s.updateSettings);

  if (!isOpen) return null;

  const data = getCurrentData();
  const s = data.settings;

  const update = (partial: Partial<WhatsAppSettings>) => updateSettings(partial);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#808080]/60 text-[11px]">
      <div className="flex w-full max-w-2xl max-h-[90vh] flex-col border border-[#D0D0D0] bg-white shadow-lg rounded-sm overflow-hidden">
        <div className="border-b border-[#D0D0D0] bg-[#FFD700] px-4 py-2 text-[12px] font-bold text-[#7F1D1D]">
          WhatsApp Settings
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-4">
          <section>
            <h3 className="font-bold text-[#7F1D1D] mb-2">General</h3>
            <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={s.setPreviewAsDefault}
                  onChange={(e) => update({ setPreviewAsDefault: e.target.checked })}
                  className="border border-[#D0D0D0]"
                />
                Set preview as default
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={s.enablePdfArabic}
                  onChange={(e) => update({ enablePdfArabic: e.target.checked })}
                  className="border border-[#D0D0D0]"
                />
                Enable PDF Arabic
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={s.enableStripeView}
                  onChange={(e) => update({ enableStripeView: e.target.checked })}
                  className="border border-[#D0D0D0]"
                />
                Enable Stripe view
              </label>
            </div>
          </section>
          <section>
            <h3 className="font-bold text-[#7F1D1D] mb-2">Header Information</h3>
            <div className="grid grid-cols-[140px_1fr] gap-2 items-center">
              <span>Top margin (inches)</span>
              <input
                type="number"
                step="0.1"
                min="0"
                value={s.topMarginInches}
                onChange={(e) => update({ topMarginInches: Number(e.target.value) })}
                className="border border-[#D0D0D0] px-2 py-1 w-20"
              />
              <label className="flex items-center gap-2 cursor-pointer col-span-2">
                <input
                  type="checkbox"
                  checked={s.showDateRange}
                  onChange={(e) => update({ showDateRange: e.target.checked })}
                  className="border border-[#D0D0D0]"
                />
                Show date range
              </label>
              <label className="flex items-center gap-2 cursor-pointer col-span-2">
                <input
                  type="checkbox"
                  checked={s.showReportDateTime}
                  onChange={(e) => update({ showReportDateTime: e.target.checked })}
                  className="border border-[#D0D0D0]"
                />
                Show report date/time
              </label>
              <label className="flex items-center gap-2 cursor-pointer col-span-2">
                <input
                  type="checkbox"
                  checked={s.showVoucherDateTime}
                  onChange={(e) => update({ showVoucherDateTime: e.target.checked })}
                  className="border border-[#D0D0D0]"
                />
                Show voucher date/time
              </label>
            </div>
          </section>
          <section>
            <h3 className="font-bold text-[#7F1D1D] mb-2">Company Details</h3>
            <div className="grid grid-cols-[140px_1fr] gap-2 items-center">
              <label className="flex items-center gap-2 cursor-pointer col-span-2">
                <input
                  type="checkbox"
                  checked={s.includeCompanyLogo}
                  onChange={(e) => update({ includeCompanyLogo: e.target.checked })}
                  className="border border-[#D0D0D0]"
                />
                Include company logo
              </label>
              <span>Logo image path</span>
              <input
                type="text"
                value={s.logoImagePath}
                onChange={(e) => update({ logoImagePath: e.target.value })}
                placeholder="C:\path\to\logo.png"
                className="border border-[#D0D0D0] px-2 py-1"
              />
              <label className="flex items-center gap-2 cursor-pointer col-span-2">
                <input
                  type="checkbox"
                  checked={s.showCompanyName}
                  onChange={(e) => update({ showCompanyName: e.target.checked })}
                  className="border border-[#D0D0D0]"
                />
                Show company name
              </label>
              <label className="flex items-center gap-2 cursor-pointer col-span-2">
                <input
                  type="checkbox"
                  checked={s.showCompanyAddress}
                  onChange={(e) => update({ showCompanyAddress: e.target.checked })}
                  className="border border-[#D0D0D0]"
                />
                Show company address
              </label>
              <label className="flex items-center gap-2 cursor-pointer col-span-2">
                <input
                  type="checkbox"
                  checked={s.showPhoneNumber}
                  onChange={(e) => update({ showPhoneNumber: e.target.checked })}
                  className="border border-[#D0D0D0]"
                />
                Show phone number
              </label>
              <label className="flex items-center gap-2 cursor-pointer col-span-2">
                <input
                  type="checkbox"
                  checked={s.showCountryCode}
                  onChange={(e) => update({ showCountryCode: e.target.checked })}
                  className="border border-[#D0D0D0]"
                />
                Show country code
              </label>
            </div>
          </section>
        </div>
        <div className="flex justify-end gap-2 px-4 py-2 border-t border-[#D0D0D0] bg-[#F5F5F5]">
          <Button size="sm" variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button size="sm" className="bg-[#DC2626] text-white hover:bg-[#B91C1C]" onClick={close}>
            Accept
          </Button>
        </div>
      </div>
    </div>
  );
}
