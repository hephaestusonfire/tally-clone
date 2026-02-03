import * as React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { ScrollArea } from '../ui/scroll-area';
import { VoucherRightPanel } from '../voucher/VoucherRightPanel';

function getPartyLedgerOptions(ledgers: { name: string; under: string }[]): string[] {
  return ledgers
    .filter((l) => l.name.includes('Debtor') || l.under?.toLowerCase().includes('debtor'))
    .map((l) => l.name)
    .filter((n, i, a) => a.indexOf(n) === i)
    .sort();
}

function getSalesLedgerOptions(ledgers: { name: string; under: string }[]): string[] {
  return ledgers
    .filter((l) => l.name.includes('Sales') || l.under?.includes('Sales'))
    .map((l) => l.name)
    .filter((n, i, a) => a.indexOf(n) === i)
    .sort();
}

export function SalesVoucherView() {
  const {
    voucherConfiguration,
    voucherTypes,
    accountingVoucherTypeId,
    accountingVoucherClassId,
    setAccountingVoucherTypeId,
    setAccountingVoucherClassId,
    accountingVoucherDate,
    accountingVoucherNumber,
    accountingVoucherReference,
    accountingVoucherPartyLedger,
    accountingVoucherSalesOrPurchaseLedger,
    accountingVoucherIsInterState,
    accountingVoucherNarration,
    accountingVoucherStatus,
    setAccountingVoucherDate,
    setAccountingVoucherNumber,
    setAccountingVoucherReference,
    setAccountingVoucherPartyLedger,
    setAccountingVoucherSalesOrPurchaseLedger,
    setAccountingVoucherIsInterState,
    setAccountingVoucherNarration,
    setAccountingVoucherStatus,
    voucherItems,
    mockData,
    stockItems,
    updateVoucherItem,
    addVoucherItem,
    removeVoucherItem,
    getGstLedgerLinesFromItems,
    getOutstandingForParty,
    getLedgerBalance,
    acceptGstAccountingVoucher,
    resetAccountingVoucher,
    openVoucherConfig,
    setChangeVoucherTypePopupOpen,
    nextVoucherNumberByType,
  } = useAppStore();

  const cfg = voucherConfiguration;
  const vt = voucherTypes.find((v) => v.id === accountingVoucherTypeId);
  const isGstSales = Boolean(vt?.enableGst) || (vt?.allowClasses && accountingVoucherClassId != null && vt?.classes?.some((c) => c.id === accountingVoucherClassId && c.gstApplicable));

  const partyOptions = React.useMemo(() => getPartyLedgerOptions(mockData.ledgers), [mockData.ledgers]);
  const salesLedgerOptions = React.useMemo(() => getSalesLedgerOptions(mockData.ledgers), [mockData.ledgers]);

  React.useEffect(() => {
    const salesType = voucherTypes.find((v) => v.coreType === 'Sales' && (v.enableGst || v.classes?.some((c) => c.gstApplicable)));
    if (salesType && accountingVoucherTypeId !== salesType.id) {
      setAccountingVoucherTypeId(salesType.id);
      const gstClass = salesType.classes?.find((c) => c.gstApplicable);
      if (gstClass) setAccountingVoucherClassId(gstClass.id);
    }
  }, [voucherTypes, accountingVoucherTypeId, setAccountingVoucherTypeId, setAccountingVoucherClassId]);

  const partyBalance = React.useMemo(
    () => (accountingVoucherPartyLedger ? getOutstandingForParty(accountingVoucherPartyLedger) : 0),
    [accountingVoucherPartyLedger, getOutstandingForParty]
  );
  const salesLedgerBalance = React.useMemo(
    () => (accountingVoucherSalesOrPurchaseLedger ? getLedgerBalance(accountingVoucherSalesOrPurchaseLedger) : 0),
    [accountingVoucherSalesOrPurchaseLedger, getLedgerBalance]
  );

  const itemSubtotal = React.useMemo(
    () => voucherItems.reduce((s, i) => s + (i.qty * i.rate * (1 - (i.discountPct ?? 0) / 100)), 0),
    [voucherItems]
  );
  const gstLines = React.useMemo(
    () => getGstLedgerLinesFromItems(voucherItems, accountingVoucherIsInterState, true),
    [voucherItems, accountingVoucherIsInterState, getGstLedgerLinesFromItems]
  );
  const gstTotal = gstLines.reduce((s, l) => s + l.amount, 0);
  const beforeRound = itemSubtotal + gstTotal;
  const roundOff = Math.round(beforeRound * 100) / 100 - beforeRound;
  const grandTotal = Math.round((beforeRound + roundOff) * 100) / 100;

  const handleAccept = async () => {
    const result = await acceptGstAccountingVoucher();
    if (!result.saved && result.message) window.alert(result.message);
    else if (result.saved && result.warn && result.message) window.alert(result.message);
  };

  const handleCancel = () => {
    if (window.confirm('Cancel voucher? Unsaved changes will be lost.')) resetAccountingVoucher();
  };

  const typeName = vt?.name ?? 'Sales';
  const nextNum = nextVoucherNumberByType[typeName] ?? 1;

  return (
    <div className="flex h-full flex-col overflow-hidden pr-0">
      <div className="flex flex-1 min-h-0 overflow-hidden">
        <div className="flex-1 min-w-0 flex flex-col border-r border-[#D0D0D0]">
          <div className="flex-1 overflow-auto p-3 space-y-2">
            {/* Header: Voucher No, Date, Ref, Party, Status, Sales Ledger, Supply */}
            <div className="border border-[#D0D0D0] bg-white p-2 space-y-2">
              <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px]">
                <div className="flex items-center gap-2">
                  <label className="w-24 font-medium">Voucher No</label>
                  <input
                    type="text"
                    className="border border-[#D0D0D0] px-1.5 py-0.5 w-24 text-[11px]"
                    value={accountingVoucherNumber}
                    onChange={(e) => setAccountingVoucherNumber(e.target.value)}
                  />
                  <span className="text-[10px] text-gray-500">(Next: {nextNum})</span>
                </div>
                <div className="flex items-center gap-2">
                  <label className="w-24 font-medium">Date</label>
                  <input
                    type="date"
                    className="border border-[#D0D0D0] px-1.5 py-0.5 text-[11px]"
                    value={accountingVoucherDate}
                    onChange={(e) => setAccountingVoucherDate(e.target.value)}
                  />
                </div>
                {cfg.referenceNoDate && (
                  <div className="flex items-center gap-2 col-span-2">
                    <label className="w-24 font-medium">Reference</label>
                    <input
                      type="text"
                      className="border border-[#D0D0D0] px-1.5 py-0.5 flex-1 text-[11px]"
                      value={accountingVoucherReference}
                      onChange={(e) => setAccountingVoucherReference(e.target.value)}
                      placeholder="Ref No & Date"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <label className="w-24 font-medium">Party A/c Name</label>
                  <select
                    className="border border-[#D0D0D0] bg-white px-1.5 py-0.5 flex-1 text-[11px]"
                    value={accountingVoucherPartyLedger}
                    onChange={(e) => setAccountingVoucherPartyLedger(e.target.value)}
                  >
                    <option value="">-- Select --</option>
                    {partyOptions.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                  {cfg.showLedgerBalances && accountingVoucherPartyLedger && (
                    <span className="text-[10px] text-gray-600 whitespace-nowrap">
                      Balance: ₹{partyBalance.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                {cfg.allowOptionalPostDated && (
                  <div className="flex items-center gap-2">
                    <label className="w-24 font-medium">Status</label>
                    <select
                      className="border border-[#D0D0D0] bg-white px-1.5 py-0.5 text-[11px]"
                      value={accountingVoucherStatus}
                      onChange={(e) => setAccountingVoucherStatus(e.target.value as 'Regular' | 'Optional' | 'Post-dated')}
                    >
                      <option value="Regular">Regular</option>
                      <option value="Optional">Optional</option>
                      <option value="Post-dated">Post-dated</option>
                    </select>
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <label className="w-24 font-medium">Sales Ledger</label>
                  <select
                    className="border border-[#D0D0D0] bg-white px-1.5 py-0.5 flex-1 text-[11px]"
                    value={accountingVoucherSalesOrPurchaseLedger}
                    onChange={(e) => setAccountingVoucherSalesOrPurchaseLedger(e.target.value)}
                  >
                    <option value="">-- Select --</option>
                    {salesLedgerOptions.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </select>
                  {cfg.showLedgerBalances && accountingVoucherSalesOrPurchaseLedger && (
                    <span className="text-[10px] text-gray-600 whitespace-nowrap">
                      Balance: ₹{salesLedgerBalance.toLocaleString('en-IN')}
                    </span>
                  )}
                </div>
                {isGstSales && (
                  <div className="flex items-center gap-3 col-span-2">
                    <label className="font-medium">Supply type</label>
                    <label className="flex items-center gap-1">
                      <input type="radio" checked={!accountingVoucherIsInterState} onChange={() => setAccountingVoucherIsInterState(false)} />
                      Intra-state (CGST+SGST)
                    </label>
                    <label className="flex items-center gap-1">
                      <input type="radio" checked={accountingVoucherIsInterState} onChange={() => setAccountingVoucherIsInterState(true)} />
                      Inter-state (IGST)
                    </label>
                  </div>
                )}
              </div>
              {cfg.provideBuyerDetails && (
                <div className="pt-1 border-t border-[#E0E0E0]">
                  <label className="text-[10px] font-medium text-gray-600">Buyer Details</label>
                  <input type="text" className="w-full border border-[#D0D0D0] px-1.5 py-0.5 text-[11px] mt-0.5" placeholder="Name, address, GSTIN (optional)" />
                </div>
              )}
              {cfg.dispatchOrderExportDetails && (
                <div className="pt-1 border-t border-[#E0E0E0]">
                  <label className="text-[10px] font-medium text-gray-600">Dispatch / Order / Export</label>
                  <input type="text" className="w-full border border-[#D0D0D0] px-1.5 py-0.5 text-[11px] mt-0.5" placeholder="Details (optional)" />
                </div>
              )}
              {cfg.orderDetails && (
                <div className="pt-1 border-t border-[#E0E0E0]">
                  <label className="text-[10px] font-medium text-gray-600">Order Details</label>
                  <input type="text" className="w-full border border-[#D0D0D0] px-1.5 py-0.5 text-[11px] mt-0.5" placeholder="Order no, date (optional)" />
                </div>
              )}
            </div>

            {/* Item grid */}
            <div className="border border-[#D0D0D0] bg-white">
              <div className="text-[11px] font-semibold px-2 py-1 border-b border-[#D0D0D0] bg-[#E8E8E8]">
                Item Entry (GST Sales)
              </div>
              <ScrollArea className="max-h-[280px]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#DC2626] hover:bg-[#DC2626]">
                      <TableHead className="min-w-[140px] border-[#D0D0D0] text-white text-[10px]">Name of Item</TableHead>
                      {isGstSales && (
                        <>
                          <TableHead className="w-20 border-[#D0D0D0] text-white text-[10px]">HSN/SAC</TableHead>
                          <TableHead className="w-14 border-[#D0D0D0] text-right text-white text-[10px]">IGST %</TableHead>
                          <TableHead className="w-14 border-[#D0D0D0] text-right text-white text-[10px]">CGST %</TableHead>
                          <TableHead className="w-14 border-[#D0D0D0] text-right text-white text-[10px]">SGST %</TableHead>
                        </>
                      )}
                      <TableHead className="w-16 border-[#D0D0D0] text-right text-white text-[10px]">Qty</TableHead>
                      <TableHead className="w-20 border-[#D0D0D0] text-right text-white text-[10px]">Rate</TableHead>
                      {cfg.enableDiscounts && (
                        <TableHead className="w-16 border-[#D0D0D0] text-right text-white text-[10px]">Disc %</TableHead>
                      )}
                      <TableHead className="w-24 border-[#D0D0D0] text-right text-white text-[10px]">Amount</TableHead>
                      <TableHead className="w-8 border-[#D0D0D0]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {voucherItems.map((item) => (
                      <TableRow key={item.id} className={cfg.stripeView ? 'odd:bg-[#F8F8F8]' : ''}>
                        <TableCell className="border-[#D0D0D0] p-1">
                          <select
                            className="w-full min-w-[120px] border border-[#D0D0D0] bg-white px-1 py-0.5 text-[10px]"
                            value={item.itemName}
                            onChange={(e) => {
                              const name = e.target.value;
                              const stock = stockItems.find((s) => s.name === name);
                              updateVoucherItem({
                                ...item,
                                itemName: name,
                                hsnsacCode: stock?.hsnsac,
                                igstPct: stock?.gstRate,
                                cgstPct: stock?.gstRate != null ? stock.gstRate / 2 : undefined,
                                sgstPct: stock?.gstRate != null ? stock.gstRate / 2 : undefined,
                              });
                            }}
                          >
                            <option value="">-- Select Item --</option>
                            {stockItems.map((s) => (
                              <option key={s.id} value={s.name}>{s.name}</option>
                            ))}
                          </select>
                        </TableCell>
                        {isGstSales && (
                          <>
                            <TableCell className="border-[#D0D0D0] p-1">
                              <input type="text" className="w-full border-0 bg-transparent px-1 py-0.5 text-[10px]" value={item.hsnsacCode ?? ''} readOnly />
                            </TableCell>
                            <TableCell className="border-[#D0D0D0] p-1 text-right">
                              <input
                                type="number"
                                className="w-full border-0 bg-transparent px-1 py-0.5 text-right text-[10px]"
                                value={item.igstPct ?? ''}
                                onChange={(e) => updateVoucherItem({ ...item, igstPct: e.target.value ? Number(e.target.value) : undefined })}
                              />
                            </TableCell>
                            <TableCell className="border-[#D0D0D0] p-1 text-right">
                              <input
                                type="number"
                                className="w-full border-0 bg-transparent px-1 py-0.5 text-right text-[10px]"
                                value={item.cgstPct ?? ''}
                                onChange={(e) => updateVoucherItem({ ...item, cgstPct: e.target.value ? Number(e.target.value) : undefined })}
                              />
                            </TableCell>
                            <TableCell className="border-[#D0D0D0] p-1 text-right">
                              <input
                                type="number"
                                className="w-full border-0 bg-transparent px-1 py-0.5 text-right text-[10px]"
                                value={item.sgstPct ?? ''}
                                onChange={(e) => updateVoucherItem({ ...item, sgstPct: e.target.value ? Number(e.target.value) : undefined })}
                              />
                            </TableCell>
                          </>
                        )}
                        <TableCell className="border-[#D0D0D0] p-1 text-right">
                          <input
                            type="number"
                            className="w-full border-0 bg-transparent px-1 py-0.5 text-right text-[10px]"
                            value={item.qty || ''}
                            onChange={(e) => updateVoucherItem({ ...item, qty: Number(e.target.value) || 0 })}
                          />
                        </TableCell>
                        <TableCell className="border-[#D0D0D0] p-1 text-right">
                          <input
                            type="number"
                            className="w-full border-0 bg-transparent px-1 py-0.5 text-right text-[10px]"
                            value={item.rate || ''}
                            onChange={(e) => updateVoucherItem({ ...item, rate: Number(e.target.value) || 0 })}
                          />
                        </TableCell>
                        {cfg.enableDiscounts && (
                          <TableCell className="border-[#D0D0D0] p-1 text-right">
                            <input
                              type="number"
                              className="w-full border-0 bg-transparent px-1 py-0.5 text-right text-[10px]"
                              value={item.discountPct ?? ''}
                              onChange={(e) => updateVoucherItem({ ...item, discountPct: e.target.value ? Number(e.target.value) : undefined })}
                            />
                          </TableCell>
                        )}
                        <TableCell className="border-[#D0D0D0] p-1 text-right text-[10px]">₹{item.amount.toLocaleString('en-IN')}</TableCell>
                        <TableCell className="border-[#D0D0D0] p-1">
                          <Button type="button" size="sm" variant="ghost" className="h-5 w-5 p-0 text-[10px] text-red-600" onClick={() => removeVoucherItem(item.id)}>×</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
              <Button type="button" size="sm" variant="outline" className="text-[10px] m-1" onClick={() => addVoucherItem()}>+ Add Row</Button>
            </div>

            {/* Totals: Subtotal, Tax lines, Round-off, Grand Total */}
            <div className="border border-[#D0D0D0] bg-white p-2">
              <div className="text-[11px] font-semibold mb-1.5">Tax Summary</div>
              <div className="grid grid-cols-2 gap-x-4 text-[11px] max-w-xs">
                <div className="text-gray-600">Subtotal (Items)</div>
                <div className="text-right">₹{itemSubtotal.toFixed(2)}</div>
                {gstLines.map((l) => (
                  <React.Fragment key={l.ledgerName}>
                    <div className="text-gray-600">{l.ledgerName}</div>
                    <div className="text-right">₹{l.amount.toFixed(2)}</div>
                  </React.Fragment>
                ))}
                <div className="text-gray-600">Round-off</div>
                <div className="text-right">₹{roundOff.toFixed(2)}</div>
                <div className="font-semibold text-[#DC2626]">Grand Total</div>
                <div className="text-right font-semibold">₹{grandTotal.toLocaleString('en-IN')}</div>
              </div>
            </div>

            {cfg.enableNarration && (
              <div className="border border-[#D0D0D0] bg-white p-2">
                <label className="text-[11px] font-medium">Narration</label>
                <textarea
                  className="w-full border border-[#D0D0D0] px-1.5 py-0.5 text-[11px] mt-1 min-h-[44px]"
                  value={accountingVoucherNarration}
                  onChange={(e) => setAccountingVoucherNarration(e.target.value)}
                  placeholder="Remarks (optional)"
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-between gap-4 border-t border-[#D0D0D0] bg-[#E8E8E8] px-3 py-2">
            <div className="text-[12px] font-bold text-[#DC2626]">Total ₹{grandTotal.toLocaleString('en-IN')}</div>
            <div className="flex items-center gap-2">
              <Button size="sm" className="bg-[#DC2626] text-white hover:bg-[#B91C1C] text-[11px]" onClick={handleAccept}>
                Ctrl+A: Accept
              </Button>
              <Button variant="outline" size="sm" className="text-[11px]" onClick={handleCancel}>
                Ctrl+X: Cancel
              </Button>
              <Button variant="outline" size="sm" className="text-[11px]" onClick={openVoucherConfig}>
                F12: Configure
              </Button>
              <Button variant="outline" size="sm" className="text-[11px]" onClick={() => setChangeVoucherTypePopupOpen(true)}>
                Ctrl+H: Type
              </Button>
            </div>
          </div>
        </div>
        <VoucherRightPanel />
      </div>
    </div>
  );
}
