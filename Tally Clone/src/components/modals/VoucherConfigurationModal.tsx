import { useAppStore, type VoucherConfiguration } from '../../store/useAppStore';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

const SECTION_STYLE = 'border-b border-[#D0D0D0] pb-3 mb-3 last:border-0 last:mb-0';

export function VoucherConfigurationModal() {
  const isOpen = useAppStore((s) => s.isVoucherConfigOpen);
  const close = useAppStore((s) => s.closeVoucherConfig);
  const config = useAppStore((s) => s.voucherConfiguration);
  const setConfig = useAppStore((s) => s.setVoucherConfiguration);

  if (!isOpen) return null;

  const toggle = (key: keyof VoucherConfiguration, value: boolean) => {
    setConfig({ [key]: value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 text-[11px]">
      <div className="bg-[#FEF2F2] border border-tallyBorder shadow-lg min-w-[480px] max-w-[560px] max-h-[90vh] flex flex-col">
        <div className="px-3 py-2 border-b border-tallyBorder bg-[#C0C0C0] font-semibold">
          Voucher Configuration (F12)
        </div>
        <ScrollArea className="flex-1 overflow-auto p-3">
          <div className={SECTION_STYLE}>
            <div className="font-bold text-[#7F1D1D] mb-2">General Details</div>
            <div className="grid gap-1.5 text-[10px]">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={config.provideBuyerDetails} onChange={(e) => toggle('provideBuyerDetails', e.target.checked)} />
                Provide Buyer Details (Yes/No)
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={config.dispatchOrderExportDetails} onChange={(e) => toggle('dispatchOrderExportDetails', e.target.checked)} />
                Provide Dispatch / Order / Export details
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={config.orderDetails} onChange={(e) => toggle('orderDetails', e.target.checked)} />
                Provide Order Details
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={config.commonLedgerItemAllocation} onChange={(e) => toggle('commonLedgerItemAllocation', e.target.checked)} />
                Select common ledger for item allocation
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={config.billWiseDetails} onChange={(e) => toggle('billWiseDetails', e.target.checked)} />
                Bill-wise details
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={config.referenceNoDate} onChange={(e) => toggle('referenceNoDate', e.target.checked)} />
                Reference No &amp; Date
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={config.showLedgerBalances} onChange={(e) => toggle('showLedgerBalances', e.target.checked)} />
                Show ledger balances
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={config.modifyFieldsDuringEntry} onChange={(e) => toggle('modifyFieldsDuringEntry', e.target.checked)} />
                Modify fields during voucher entry
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={config.warnNegativeStock} onChange={(e) => toggle('warnNegativeStock', e.target.checked)} />
                Warn on negative stock
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={config.stripeView} onChange={(e) => toggle('stripeView', e.target.checked)} />
                Enable stripe view
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={config.enableDiscounts} onChange={(e) => toggle('enableDiscounts', e.target.checked)} />
                Enable discounts (item grid)
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={config.enableNarration} onChange={(e) => toggle('enableNarration', e.target.checked)} />
                Enable narration
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={config.allowOptionalPostDated} onChange={(e) => toggle('allowOptionalPostDated', e.target.checked)} />
                Allow Optional / Post-dated voucher status
              </label>
            </div>
          </div>
          <div className={SECTION_STYLE}>
            <div className="font-bold text-[#7F1D1D] mb-2">Tax Details</div>
            <div className="grid gap-1.5 text-[10px]">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={config.taxInclusivePricing} onChange={(e) => toggle('taxInclusivePricing', e.target.checked)} />
                Tax inclusive pricing
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={config.calculateTaxOnSubtotal} onChange={(e) => toggle('calculateTaxOnSubtotal', e.target.checked)} />
                Calculate tax on subtotal
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={config.modifyGstHsnsac} onChange={(e) => toggle('modifyGstHsnsac', e.target.checked)} />
                Modify GST &amp; HSN/SAC details
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={config.ewayBillGeneration} onChange={(e) => toggle('ewayBillGeneration', e.target.checked)} />
                e-Way bill generation option
              </label>
            </div>
          </div>
          <div className={SECTION_STYLE}>
            <div className="font-bold text-[#7F1D1D] mb-2">Bank Details</div>
            <div className="grid gap-1.5 text-[10px]">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={config.bankAllocation} onChange={(e) => toggle('bankAllocation', e.target.checked)} />
                Bank allocation
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={config.reconciliationOptions} onChange={(e) => toggle('reconciliationOptions', e.target.checked)} />
                Reconciliation options
              </label>
            </div>
          </div>
        </ScrollArea>
        <div className="flex justify-end gap-2 px-3 py-2 border-t border-tallyBorder bg-[#F5F5F5]">
          <Button size="sm" variant="outline" onClick={close}>Close</Button>
        </div>
      </div>
    </div>
  );
}
