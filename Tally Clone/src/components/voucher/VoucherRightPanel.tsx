import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { ScrollArea } from '../ui/scroll-area';
import { Button } from '../ui/button';
import { useGatewayStore } from '../../store/useGatewayStore';

export function VoucherRightPanel() {
  const activeView = useAppStore((s) => s.activeView);
  const voucherItems = useAppStore((s) => s.voucherItems);
  const updateVoucherItem = useAppStore((s) => s.updateVoucherItem);
  const voucherTypes = useAppStore((s) => s.voucherTypes);
  const accountingVoucherTypeId = useAppStore((s) => s.accountingVoucherTypeId);
  const accountingVoucherStatus = useAppStore((s) => s.accountingVoucherStatus);
  const setAccountingVoucherTypeId = useAppStore((s) => s.setAccountingVoucherTypeId);
  const setChangeVoucherTypePopupOpen = useAppStore((s) => s.setChangeVoucherTypePopupOpen);
  const setAccountingVoucherStatus = useAppStore((s) => s.setAccountingVoucherStatus);
  const openVoucherConfig = useAppStore((s) => s.openVoucherConfig);
  const toggleCompanyModal = useAppStore((s) => s.toggleCompanyModal);
  const openDateModal = useGatewayStore((s) => s.openDateModal);
  const setActiveView = useAppStore((s) => s.setActiveView);
  const voucherConfiguration = useAppStore((s) => s.voucherConfiguration);

  const [relatedReportsOpen, setRelatedReportsOpen] = useState(false);
  const isVoucherScreen = activeView === 'vouchers' || activeView === 'sales';
  const activeTypes = voucherTypes.filter((v) => v.active && !v.inactive);
  const allowOptionalPostDated = voucherConfiguration.allowOptionalPostDated;

  if (isVoucherScreen) {
    return (
      <aside className="flex h-full w-[320px] min-w-[320px] max-w-[320px] flex-col border-l border-[#D0D0D0] bg-[#E8E8E8]">
        <div className="border-b border-[#D0D0D0] bg-[#C0C0C0] px-2 py-1.5 text-[11px] font-bold">
          Actions
        </div>
        <ScrollArea className="flex-1 overflow-auto px-2 py-2">
          <div className="space-y-1.5 text-[10px]">
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start bg-white border-[#D0D0D0] text-[11px] h-8"
              onClick={openDateModal}
            >
              F2: Date
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start bg-white border-[#D0D0D0] text-[11px] h-8"
              onClick={toggleCompanyModal}
            >
              F3: Company / GST Registration
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start bg-white border-[#D0D0D0] text-[11px] h-8"
              onClick={() => setChangeVoucherTypePopupOpen(true)}
            >
              Ctrl+H / Ctrl+V: Voucher Type
            </Button>
            {activeTypes.slice(0, 7).map((vt, idx) => {
              const key = idx + 4;
              const isF = key <= 10;
              const label = isF ? `F${key}` : '';
              return (
                <Button
                  key={vt.id}
                  variant="outline"
                  size="sm"
                  className={`w-full justify-start border-[#D0D0D0] text-[11px] h-8 ${
                    accountingVoucherTypeId === vt.id ? 'bg-[#DC2626] text-white border-[#DC2626]' : 'bg-white'
                  }`}
                  onClick={() => setAccountingVoucherTypeId(vt.id)}
                >
                  {isF ? `${label}: ` : ''}{vt.name}
                </Button>
              );
            })}
            <div className="border-t border-[#D0D0D0] pt-2 mt-2 relative">
              <Button variant="outline" size="sm" className="w-full justify-start bg-white border-[#D0D0D0] text-[11px] h-8" disabled>
                I: More Details
              </Button>
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full justify-start bg-white border-[#D0D0D0] text-[11px] h-8"
                  onClick={() => setRelatedReportsOpen((o) => !o)}
                >
                  O: Related Reports
                </Button>
                {relatedReportsOpen && (
                  <div className="absolute left-0 top-full mt-0.5 z-10 bg-white border border-[#D0D0D0] shadow-lg rounded min-w-[180px] py-1">
                    <button
                      type="button"
                      className="w-full text-left px-2 py-1.5 text-[11px] hover:bg-[#E8E8E8]"
                      onClick={() => { setActiveView('tax-ledgers'); setRelatedReportsOpen(false); }}
                    >
                      GST Tax Analysis
                    </button>
                    <button
                      type="button"
                      className="w-full text-left px-2 py-1.5 text-[11px] hover:bg-[#E8E8E8]"
                      onClick={() => { setActiveView('stock-summary'); setRelatedReportsOpen(false); }}
                    >
                      Stock Query
                    </button>
                  </div>
                )}
              </div>
              {allowOptionalPostDated && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`w-full justify-start border-[#D0D0D0] text-[11px] h-8 ${accountingVoucherStatus === 'Optional' ? 'bg-[#DC2626] text-white border-[#DC2626]' : 'bg-white'}`}
                    onClick={() => setAccountingVoucherStatus('Optional')}
                  >
                    L: Optional
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className={`w-full justify-start border-[#D0D0D0] text-[11px] h-8 ${accountingVoucherStatus === 'Post-dated' ? 'bg-[#DC2626] text-white border-[#DC2626]' : 'bg-white'}`}
                    onClick={() => setAccountingVoucherStatus('Post-dated')}
                  >
                    T: Post-Dated
                  </Button>
                </>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="w-full justify-start bg-white border-[#D0D0D0] text-[11px] h-8 mt-2"
              onClick={openVoucherConfig}
            >
              F12: Configure
            </Button>
          </div>
        </ScrollArea>
      </aside>
    );
  }

  return (
    <div className="flex h-full w-[320px] min-w-[320px] max-w-[320px] flex-col border-l border-[#D0D0D0] bg-white">
      <div className="border-b border-[#D0D0D0] bg-[#E8E8E8] px-2 py-1.5 text-[11px] font-bold">
        Item Details
      </div>
      <ScrollArea className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#DC2626] hover:bg-[#DC2626]">
              <TableHead className="border-[#D0D0D0] text-white text-[10px]">
                Item Name
              </TableHead>
              <TableHead className="w-12 border-[#D0D0D0] text-white text-[10px]">
                Batch
              </TableHead>
              <TableHead className="w-14 border-[#D0D0D0] text-right text-white text-[10px]">
                Qty
              </TableHead>
              <TableHead className="w-16 border-[#D0D0D0] text-right text-white text-[10px]">
                Rate
              </TableHead>
              <TableHead className="w-20 border-[#D0D0D0] text-right text-white text-[10px]">
                Amount
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {voucherItems.map((i) => (
              <TableRow key={i.id}>
                <TableCell className="border-[#D0D0D0] p-1">
                  <input
                    type="text"
                    className="w-full border-0 bg-transparent px-1 py-0.5 text-[10px] focus:border focus:border-[#DC2626] focus:outline-none"
                    value={i.itemName}
                    onChange={(e) =>
                      updateVoucherItem({ ...i, itemName: e.target.value })
                    }
                  />
                </TableCell>
                <TableCell className="border-[#D0D0D0] p-1">
                  <input
                    type="text"
                    className="w-full border-0 bg-transparent px-1 py-0.5 text-[10px] focus:border focus:border-[#DC2626] focus:outline-none"
                    value={i.batch}
                    onChange={(e) =>
                      updateVoucherItem({ ...i, batch: e.target.value })
                    }
                  />
                </TableCell>
                <TableCell className="border-[#D0D0D0] p-1 text-right">
                  <input
                    type="number"
                    className="w-full border-0 bg-transparent px-1 py-0.5 text-right text-[10px] focus:border focus:border-[#DC2626] focus:outline-none"
                    value={i.qty}
                    onChange={(e) => {
                      const qty = Number(e.target.value) || 0;
                      updateVoucherItem({
                        ...i,
                        qty,
                        amount: qty * i.rate,
                      });
                    }}
                  />
                </TableCell>
                <TableCell className="border-[#D0D0D0] p-1 text-right">
                  <input
                    type="number"
                    className="w-full border-0 bg-transparent px-1 py-0.5 text-right text-[10px] focus:border focus:border-[#DC2626] focus:outline-none"
                    value={i.rate}
                    onChange={(e) => {
                      const rate = Number(e.target.value) || 0;
                      updateVoucherItem({
                        ...i,
                        rate,
                        amount: i.qty * rate,
                      });
                    }}
                  />
                </TableCell>
                <TableCell className="border-[#D0D0D0] p-1 text-right text-[10px]">
                  ₹ {i.amount.toLocaleString('en-IN')}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
    </div>
  );
}
