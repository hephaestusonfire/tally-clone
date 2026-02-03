import { useState } from 'react';
import { useWhatsAppStore } from '../../store/useWhatsAppStore';
import { Button } from '../ui/button';

export function RechargeWalletModal() {
  const isOpen = useWhatsAppStore((s) => s.isRechargeOpen);
  const close = useWhatsAppStore((s) => s.closeRecharge);
  const getCurrentData = useWhatsAppStore((s) => s.getCurrentData);
  const setWalletBalance = useWhatsAppStore((s) => s.setWalletBalance);

  const [amount, setAmount] = useState('');
  const [paymentMode, setPaymentMode] = useState('UPI');

  if (!isOpen) return null;

  const { walletBalance } = getCurrentData();

  const handleRecharge = () => {
    const n = Number(amount);
    if (n > 0) {
      setWalletBalance(walletBalance + n);
      setAmount('');
      close();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#808080]/60 text-[11px]">
      <div className="flex w-full max-w-sm flex-col border border-[#D0D0D0] bg-white shadow-lg rounded-sm overflow-hidden">
        <div className="border-b border-[#D0D0D0] bg-[#DC2626] px-4 py-2 text-[12px] font-bold text-white">
          Recharge Wallet
        </div>
        <div className="p-4 space-y-3">
          <p className="text-[11px] text-gray-700">
            Current Balance: <strong>₹{walletBalance.toLocaleString('en-IN')}</strong>
          </p>
          <p className="text-[10px] text-gray-500">
            Credit-based message system. Add credits to send WhatsApp reports.
          </p>
          <label className="block">
            <span className="block text-[10px] font-medium text-gray-600 mb-1">Recharge Amount (₹)</span>
            <input
              type="number"
              min="1"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="e.g. 500"
              className="border border-[#D0D0D0] px-2 py-1 w-full"
            />
          </label>
          <label className="block">
            <span className="block text-[10px] font-medium text-gray-600 mb-1">Payment Mode</span>
            <select
              value={paymentMode}
              onChange={(e) => setPaymentMode(e.target.value)}
              className="border border-[#D0D0D0] px-2 py-1 w-full"
            >
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Net Banking">Net Banking</option>
            </select>
          </label>
        </div>
        <div className="flex justify-end gap-2 px-4 py-2 border-t border-[#D0D0D0] bg-[#F5F5F5]">
          <Button size="sm" variant="outline" onClick={close}>
            Cancel
          </Button>
          <Button size="sm" className="bg-[#DC2626] text-white hover:bg-[#B91C1C]" onClick={handleRecharge} disabled={!amount || Number(amount) <= 0}>
            Recharge
          </Button>
        </div>
      </div>
    </div>
  );
}
