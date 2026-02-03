import { useState } from 'react';
import { useWhatsAppStore } from '../../store/useWhatsAppStore';
import { Button } from '../ui/button';

export function RenewSubscriptionModal() {
  const isOpen = useWhatsAppStore((s) => s.isRenewOpen);
  const close = useWhatsAppStore((s) => s.closeRenew);
  const getCurrentData = useWhatsAppStore((s) => s.getCurrentData);
  const setSubscriptionExpiry = useWhatsAppStore((s) => s.setSubscriptionExpiry);
  const setSubscriptionRenewed = useWhatsAppStore((s) => s.setSubscriptionRenewed);

  const [date, setDate] = useState('');

  if (!isOpen) return null;

  const { subscriptionExpiry, subscriptionRenewed } = getCurrentData();
  const isExpired = new Date(subscriptionExpiry).getTime() < Date.now();

  const handleRenew = () => {
    if (date) {
      setSubscriptionExpiry(date);
      setSubscriptionRenewed(true);
      setDate('');
      close();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#808080]/60 text-[11px]">
      <div className="flex w-full max-w-sm flex-col border border-[#D0D0D0] bg-white shadow-lg rounded-sm overflow-hidden">
        <div className="border-b border-[#D0D0D0] bg-[#DC2626] px-4 py-2 text-[12px] font-bold text-white">
          REnew Subscription
        </div>
        <div className="p-4 space-y-3">
          <p className="text-[11px] text-gray-700">
            Current plan expiry: <strong>{subscriptionExpiry}</strong>
            {isExpired && <span className="ml-2 text-red-600 font-medium">(Expired)</span>}
            {subscriptionRenewed && <span className="ml-2 text-green-600 font-medium">(Renewed)</span>}
          </p>
          <p className="text-[10px] text-gray-500">
            Extend your WhatsApp report subscription. Select new expiry date.
          </p>
          <label className="block">
            <span className="block text-[10px] font-medium text-gray-600 mb-1">New expiry date</span>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="border border-[#D0D0D0] px-2 py-1 w-full"
            />
          </label>
        </div>
        <div className="flex justify-end gap-2 px-4 py-2 border-t border-[#D0D0D0] bg-[#F5F5F5]">
          <Button size="sm" variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button size="sm" className="bg-[#DC2626] text-white hover:bg-[#B91C1C]" onClick={handleRenew} disabled={!date}>
            Renew
          </Button>
        </div>
      </div>
    </div>
  );
}
