import { useWhatsAppStore } from '../../store/useWhatsAppStore';
import { Button } from '../ui/button';

export function WhatsappSignupModal() {
  const isOpen = useWhatsAppStore((s) => s.isSignupOpen);
  const close = useWhatsAppStore((s) => s.closeSignup);
  const setSubscriptionRenewed = useWhatsAppStore((s) => s.setSubscriptionRenewed);

  if (!isOpen) return null;

  const handleSignUpSubscribe = () => {
    setSubscriptionRenewed(true);
    close();
  };

  const handleEnterDetails = () => {
    close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 text-[11px]">
      <div className="bg-[#FEF2F2] border border-[#D0D0D0] shadow-lg min-w-[400px] max-w-[480px] flex flex-col">
        <div className="px-3 py-2 border-b border-[#D0D0D0] bg-[#C0C0C0] font-semibold">
          Sign Up &amp; Use Registered Business WhatsApp No.
        </div>
        <div className="p-4 space-y-3">
          <p className="text-[11px] text-gray-700">
            Subscribe to WhatsApp Business API to send reports and vouchers directly from Tally. You can register your business number and manage messaging from here.
          </p>
          <p className="text-[10px] text-gray-600">
            After signing up, you will receive credits for sending messages. Use Recharge Wallet to add more credits and REnew Subscription to extend your plan.
          </p>
        </div>
        <div className="flex justify-end gap-2 px-3 py-2 border-t border-[#D0D0D0] bg-[#F5F5F5]">
          <Button size="sm" variant="outline" onClick={close}>Cancel</Button>
          <Button size="sm" className="bg-[#DC2626] text-white hover:bg-[#B91C1C]" onClick={handleEnterDetails}>A: Enter WhatsApp Details</Button>
          <Button size="sm" className="bg-[#25D366] text-white hover:bg-[#20BD5A]" onClick={handleSignUpSubscribe}>W: Sign Up &amp; Subscribe</Button>
        </div>
      </div>
    </div>
  );
}
