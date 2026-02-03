import { useEffect, useState } from 'react';
import { useWhatsAppStore } from '../../store/useWhatsAppStore';
import { Button } from '../ui/button';

export function ShareViaWhatsAppModal() {
  const isOpen = useWhatsAppStore((s) => s.isShareOpen);
  const closeShare = useWhatsAppStore((s) => s.closeShare);
  const validateAndShare = useWhatsAppStore((s) => s.validateAndShare);
  const getCurrentData = useWhatsAppStore((s) => s.getCurrentData);

  const [result, setResult] = useState<{ ok: boolean; error?: string } | null>(null);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setResult(null);
      setSent(false);
      const r = validateAndShare();
      setResult(r);
    }
  }, [isOpen, validateAndShare]);

  const handleShare = () => {
    setSending(true);
    // Simulate PDF generation and send (using current settings)
    setTimeout(() => {
      setSending(false);
      setSent(true);
    }, 800);
  };

  const handleClose = () => {
    closeShare();
    setResult(null);
    setSent(false);
    setSending(false);
  };

  if (!isOpen) return null;

  const data = getCurrentData();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#808080]/60 text-[11px]">
      <div className="flex w-full max-w-md flex-col border border-[#D0D0D0] bg-white shadow-lg rounded-sm overflow-hidden">
        <div className="border-b border-[#D0D0D0] bg-[#DC2626] px-4 py-2 text-[12px] font-bold text-white">
          Share via WhatsApp
        </div>
        <div className="p-4 space-y-3">
          {result && !result.ok && (
            <div className="p-3 bg-red-50 border border-red-200 rounded text-red-800 text-[11px]">
              {result.error}
            </div>
          )}
          {result?.ok && !sent && (
            <>
              <p className="text-[11px] text-gray-700">
                Wallet balance: ₹{data.walletBalance}. Subscription valid until {data.subscriptionExpiry}.
                {data.numbers.length} number(s) configured.
              </p>
              <p className="text-[11px] text-gray-600">
                A PDF will be generated using current WhatsApp settings (header, company details, logo if enabled) and shared to the selected number(s).
              </p>
            </>
          )}
          {sent && (
            <p className="text-[11px] text-green-700 font-medium">
              PDF generated and share sent successfully (simulated).
            </p>
          )}
        </div>
        <div className="flex justify-end gap-2 px-4 py-2 border-t border-[#D0D0D0] bg-[#F5F5F5]">
          <Button size="sm" variant="outline" onClick={handleClose}>
            Close
          </Button>
          {result?.ok && !sent && (
            <Button
              size="sm"
              className="bg-[#DC2626] text-white hover:bg-[#B91C1C]"
              onClick={handleShare}
              disabled={sending}
            >
              {sending ? 'Generating…' : 'Generate PDF & Share'}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
