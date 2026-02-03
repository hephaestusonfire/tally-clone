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

/** Party ledgers: Sundry Debtors (Sales) or Sundry Creditors (Purchase) */
function getPartyLedgerOptions(ledgers: { name: string; under: string }[], isSales: boolean): string[] {
  const key = isSales ? 'Debtor' : 'Creditor';
  return ledgers
    .filter((l) => l.name.includes(key) || l.under.toLowerCase().includes(key.toLowerCase()))
    .map((l) => l.name)
    .filter((n, i, a) => a.indexOf(n) === i)
    .sort();
}

/** Sales or Purchase ledger options (GST-enabled) */
function getSalesOrPurchaseLedgerOptions(ledgers: { name: string; under: string }[], isSales: boolean): string[] {
  const key = isSales ? 'Sales' : 'Purchase';
  return ledgers
    .filter((l) => l.name.includes(key) || l.under.includes(key))
    .map((l) => l.name)
    .filter((n, i, a) => a.indexOf(n) === i)
    .sort();
}

/** Cash and Bank ledger options for Payment/Receipt */
function getCashOrBankLedgerOptions(ledgers: { name: string; under: string }[]): string[] {
  return ledgers
    .filter((l) => /cash|bank/i.test(l.name) || /cash|bank/i.test(l.under))
    .map((l) => l.name)
    .filter((n, i, a) => a.indexOf(n) === i)
    .sort();
}

/** Voucher type IDs for sidebar navigation (Purchase, Payment, Receipt, Journal). */
const VOUCHER_VIEW_TYPE_IDS: Record<string, number> = {
  purchase: 2,
  payment: 4,
  receipt: 3,
  journal: 5,
};

export function AccountingVoucherView() {
  const activeView = useAppStore((s) => s.activeView);
  const setAccountingVoucherTypeId = useAppStore((s) => s.setAccountingVoucherTypeId);
  const {
    companyName,
    financialPeriodStart,
    financialPeriodEnd,
    voucherTypes,
    accountingVoucherTypeId,
    accountingVoucherClassId,
    accountingVoucherDate,
    accountingVoucherNumber,
    accountingVoucherReference,
    accountingVoucherPartyLedger,
    accountingVoucherSalesOrPurchaseLedger,
    accountingVoucherIsInterState,
    accountingVoucherNarration,
    accountingVoucherCashOrBankLedger,
    accountingVoucherParticulars,
    voucherItems,
    mockData,
    companyGstDetails,
    gstRegistrations,
    setAccountingVoucherDate,
    setAccountingVoucherReference,
    setAccountingVoucherPartyLedger,
    setAccountingVoucherSalesOrPurchaseLedger,
    setAccountingVoucherIsInterState,
    setAccountingVoucherNarration,
    setAccountingVoucherCashOrBankLedger,
    updateVoucherItem,
    addVoucherItem,
    removeVoucherItem,
    getGstLedgerLinesFromItems,
    getOutstandingForParty,
    getLedgerBalance,
    acceptGstAccountingVoucher,
    acceptPaymentReceiptVoucher,
    addAccountingVoucherParticular,
    updateAccountingVoucherParticular,
    removeAccountingVoucherParticular,
    openVoucherConfig,
    setChangeVoucherTypePopupOpen,
    stockItems,
    resetAccountingVoucher,
  } = useAppStore();

  const vt = voucherTypes.find((v) => v.id === accountingVoucherTypeId);
  const isSales = vt?.coreType === 'Sales';
  const isPurchase = vt?.coreType === 'Purchase';
  const isPayment = vt?.coreType === 'Payment';
  const isReceipt = vt?.coreType === 'Receipt';
  const isPaymentOrReceipt = isPayment || isReceipt;
  const isGstType = Boolean(vt?.enableGst) || (vt?.allowClasses && accountingVoucherClassId != null && vt.classes?.some((c) => c.id === accountingVoucherClassId && c.gstApplicable));

  const partyOptions = React.useMemo(
    () => getPartyLedgerOptions(mockData.ledgers, isSales),
    [mockData.ledgers, isSales]
  );
  const salesOrPurchaseOptions = React.useMemo(
    () => getSalesOrPurchaseLedgerOptions(mockData.ledgers, isSales),
    [mockData.ledgers, isSales]
  );
  const cashOrBankOptions = React.useMemo(
    () => getCashOrBankLedgerOptions(mockData.ledgers),
    [mockData.ledgers]
  );

  // When opened from sidebar (Purchase / Payment / Receipt / Journal), set voucher type
  React.useEffect(() => {
    const typeId = VOUCHER_VIEW_TYPE_IDS[activeView];
    if (typeId != null) setAccountingVoucherTypeId(typeId);
  }, [activeView, setAccountingVoucherTypeId]);

  React.useEffect(() => {
    if (!isPaymentOrReceipt || accountingVoucherCashOrBankLedger || cashOrBankOptions.length === 0) return;
    const cls = vt?.allowClasses && accountingVoucherClassId != null
      ? vt.classes.find((c) => c.id === accountingVoucherClassId)
      : null;
    const wantCash = cls?.defaultLedgerType === 'Cash';
    const wantBank = cls?.defaultLedgerType === 'Bank';
    const defaultLedger = wantCash
      ? cashOrBankOptions.find((n) => /cash/i.test(n))
      : wantBank
        ? cashOrBankOptions.find((n) => /bank/i.test(n))
        : cashOrBankOptions[0];
    if (defaultLedger) setAccountingVoucherCashOrBankLedger(defaultLedger);
  }, [isPaymentOrReceipt, accountingVoucherCashOrBankLedger, accountingVoucherClassId, vt, cashOrBankOptions, setAccountingVoucherCashOrBankLedger]);

  const partyBalance = accountingVoucherPartyLedger
    ? getOutstandingForParty(accountingVoucherPartyLedger)
    : 0;
  const ledgerBalance = accountingVoucherSalesOrPurchaseLedger
    ? mockData.ledgers.find((l) => l.name === accountingVoucherSalesOrPurchaseLedger)?.amount ?? 0
    : 0;

  const gstLines = React.useMemo(
    () => getGstLedgerLinesFromItems(voucherItems, accountingVoucherIsInterState, isSales),
    [voucherItems, accountingVoucherIsInterState, isSales, getGstLedgerLinesFromItems]
  );
  const itemTaxableTotal = voucherItems.reduce(
    (s, i) => s + (i.qty * i.rate * (1 - (i.discountPct ?? 0) / 100)),
    0
  );
  const gstTotal = gstLines.reduce((s, l) => s + l.amount, 0);
  const totalAmount = Math.round((itemTaxableTotal + gstTotal) * 100) / 100;
  const particularsTotal = accountingVoucherParticulars.reduce((s, p) => s + p.amount, 0);

  const handleAccept = async () => {
    const result = await (isPaymentOrReceipt ? acceptPaymentReceiptVoucher() : acceptGstAccountingVoucher());
    if (!result.saved && result.message) window.alert(result.message);
    else if (result.saved && result.warn && result.message) window.alert(result.message);
  };

  const handleCancel = () => {
    if (window.confirm('Cancel voucher? Unsaved data will be lost.')) resetAccountingVoucher();
  };

  const defaultGstRegistration = gstRegistrations.find((r) => r.isDefault) ?? gstRegistrations[0];
  const gstRegistrationLabel = defaultGstRegistration
    ? `${defaultGstRegistration.state} - ${defaultGstRegistration.gstinUin ?? 'Unregistered'}`
    : 'Not set';

  return (
    <div className="flex h-full flex-col overflow-hidden pr-0">
      {/* Header: Company, period, GST Registration */}
      <div className="flex shrink-0 items-center justify-between border-b border-[#D0D0D0] bg-[#FEF2F2] px-3 py-1.5 text-[11px]">
        <div className="flex items-center gap-4">
          <span className="font-semibold">{companyName}</span>
          <span>
            Period: {financialPeriodStart} to {financialPeriodEnd}
          </span>
          {companyGstDetails?.enableGst && (
            <span className="text-gray-700">GST Registration: {gstRegistrationLabel}</span>
          )}
        </div>
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="flex-1 min-w-0 flex flex-col border-r border-[#D0D0D0]">
          <ScrollArea className="flex-1 overflow-auto">
            <div className="p-3 space-y-3">
              {/* Voucher header row */}
              <div className="grid grid-cols-[140px,1fr,100px,1fr] gap-2 items-center text-[11px]">
                <label className="font-medium">Voucher Type</label>
                <div className="flex items-center gap-2">
                  <span className="text-[#DC2626] font-semibold">
                    {vt?.name ?? 'Sales'}
                    {vt?.allowClasses && accountingVoucherClassId != null && (() => {
                      const cls = vt.classes?.find((c) => c.id === accountingVoucherClassId);
                      return cls ? ` · ${cls.name}` : '';
                    })()}
                  </span>
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    className="h-6 px-1.5 text-[10px] text-[#DC2626]"
                    onClick={() => setChangeVoucherTypePopupOpen(true)}
                  >
                    Ctrl+H / Ctrl+V Change Type
                  </Button>
                </div>
                <label className="font-medium">Voucher No.</label>
                <input
                  type="text"
                  className="border border-[#D0D0D0] bg-white px-1.5 py-0.5 text-[11px] w-24"
                  value={accountingVoucherNumber}
                  readOnly
                />
                <label className="font-medium">Date</label>
                <input
                  type="date"
                  className="border border-[#D0D0D0] bg-white px-1.5 py-0.5 text-[11px] w-36"
                  value={accountingVoucherDate}
                  onChange={(e) => setAccountingVoucherDate(e.target.value)}
                />
                <label className="font-medium">Ref No.</label>
                <input
                  type="text"
                  className="border border-[#D0D0D0] bg-white px-1.5 py-0.5 text-[11px]"
                  value={accountingVoucherReference}
                  onChange={(e) => setAccountingVoucherReference(e.target.value)}
                  placeholder="Optional"
                />
              </div>

              {/* Payment / Receipt: Account + Particulars */}
              {isPaymentOrReceipt && (
                <div className="border border-[#D0D0D0] bg-white p-2 space-y-2">
                  <div className="grid grid-cols-[140px,1fr,100px] gap-2 items-center text-[11px]">
                    <label className="font-medium">Account</label>
                    <select
                      className="border border-[#D0D0D0] bg-white px-1.5 py-0.5 text-[11px]"
                      value={accountingVoucherCashOrBankLedger}
                      onChange={(e) => setAccountingVoucherCashOrBankLedger(e.target.value)}
                    >
                      <option value="">-- Select Cash / Bank --</option>
                      {cashOrBankOptions.map((name) => (
                        <option key={name} value={name}>
                          {name}
                        </option>
                      ))}
                    </select>
                    <span className="text-right text-[10px] text-gray-600">
                      Balance: ₹{getLedgerBalance(accountingVoucherCashOrBankLedger).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="text-[11px] font-semibold">Particulars ({isReceipt ? 'Cr' : 'Dr'})</div>
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#DC2626] hover:bg-[#DC2626]">
                        <TableHead className="min-w-[180px] border-[#D0D0D0] text-white text-[10px]">Ledger</TableHead>
                        <TableHead className="w-24 border-[#D0D0D0] text-right text-white text-[10px]">Amount</TableHead>
                        <TableHead className="w-8 border-[#D0D0D0]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {accountingVoucherParticulars.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="border-[#D0D0D0] p-1">
                            <select
                              className="w-full border border-[#D0D0D0] bg-white px-1 py-0.5 text-[10px]"
                              value={p.ledgerName}
                              onChange={(e) => updateAccountingVoucherParticular(p.id, { ledgerName: e.target.value })}
                            >
                              <option value="">-- Select --</option>
                              {mockData.ledgers.map((l) => (
                                <option key={l.id} value={l.name}>{l.name}</option>
                              ))}
                            </select>
                          </TableCell>
                          <TableCell className="border-[#D0D0D0] p-1 text-right">
                            <input
                              type="number"
                              className="w-full border-0 bg-transparent px-1 py-0.5 text-right text-[10px]"
                              value={p.amount || ''}
                              onChange={(e) => updateAccountingVoucherParticular(p.id, { amount: Number(e.target.value) || 0 })}
                            />
                          </TableCell>
                          <TableCell className="border-[#D0D0D0] p-1">
                            <Button type="button" size="sm" variant="ghost" className="h-5 w-5 p-0 text-red-600" onClick={() => removeAccountingVoucherParticular(p.id)}>×</Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  <Button type="button" size="sm" variant="outline" className="text-[10px]" onClick={() => addAccountingVoucherParticular()}>+ Add Particular</Button>
                </div>
              )}

              {/* Party & Ledger section (Sales / Purchase / Journal / Contra) */}
              {!isPaymentOrReceipt && (
              <div className="border border-[#D0D0D0] bg-white p-2 space-y-2">
                <div className="grid grid-cols-[140px,1fr,100px] gap-2 items-center text-[11px]">
                  <label className="font-medium">
                    {isSales ? 'Party A/c Name (Sundry Debtors)' : isPurchase ? 'Party A/c Name (Sundry Creditors)' : 'Party / Ledger'}
                  </label>
                  <select
                    className="border border-[#D0D0D0] bg-white px-1.5 py-0.5 text-[11px]"
                    value={accountingVoucherPartyLedger}
                    onChange={(e) => setAccountingVoucherPartyLedger(e.target.value)}
                  >
                    <option value="">-- Select --</option>
                    {partyOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <span className="text-right text-[10px] text-gray-600">
                    Balance: ₹{partyBalance.toLocaleString('en-IN')}
                  </span>
                </div>
                {(isSales || isPurchase) && (
                <div className="grid grid-cols-[140px,1fr,100px] gap-2 items-center text-[11px]">
                  <label className="font-medium">
                    {isSales ? 'Sales Ledger' : 'Purchase Ledger'}
                  </label>
                  <select
                    className="border border-[#D0D0D0] bg-white px-1.5 py-0.5 text-[11px]"
                    value={accountingVoucherSalesOrPurchaseLedger}
                    onChange={(e) => setAccountingVoucherSalesOrPurchaseLedger(e.target.value)}
                  >
                    <option value="">-- Select --</option>
                    {salesOrPurchaseOptions.map((name) => (
                      <option key={name} value={name}>
                        {name}
                      </option>
                    ))}
                  </select>
                  <span className="text-right text-[10px] text-gray-600">
                    Balance: ₹{ledgerBalance.toLocaleString('en-IN')}
                  </span>
                </div>
                )}
                {isGstType && (
                  <div className="flex items-center gap-2 text-[11px]">
                    <label className="font-medium">Supply type</label>
                    <label className="flex items-center gap-1">
                      <input
                        type="radio"
                        checked={!accountingVoucherIsInterState}
                        onChange={() => setAccountingVoucherIsInterState(false)}
                      />
                      Intra-state (CGST+SGST)
                    </label>
                    <label className="flex items-center gap-1">
                      <input
                        type="radio"
                        checked={accountingVoucherIsInterState}
                        onChange={() => setAccountingVoucherIsInterState(true)}
                      />
                      Inter-state (IGST)
                    </label>
                  </div>
                )}
              </div>
              )}

              {/* Item grid (Sales / Purchase with item invoice) */}
              {!isPaymentOrReceipt && (
              <div className="border border-[#D0D0D0] bg-white">
                <div className="text-[11px] font-semibold px-2 py-1 border-b border-[#D0D0D0] bg-[#E8E8E8]">
                  Item Entry
                </div>
                <ScrollArea className="max-h-[280px]">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-[#DC2626] hover:bg-[#DC2626]">
                        <TableHead className="min-w-[140px] border-[#D0D0D0] text-white text-[10px]">
                          Name of Item
                        </TableHead>
                        {isGstType && (
                          <>
                            <TableHead className="w-20 border-[#D0D0D0] text-white text-[10px]">
                              HSN/SAC
                            </TableHead>
                            <TableHead className="w-14 border-[#D0D0D0] text-right text-white text-[10px]">
                              IGST %
                            </TableHead>
                            <TableHead className="w-14 border-[#D0D0D0] text-right text-white text-[10px]">
                              CGST %
                            </TableHead>
                            <TableHead className="w-14 border-[#D0D0D0] text-right text-white text-[10px]">
                              SGST %
                            </TableHead>
                          </>
                        )}
                        <TableHead className="w-16 border-[#D0D0D0] text-right text-white text-[10px]">
                          Qty
                        </TableHead>
                        <TableHead className="w-20 border-[#D0D0D0] text-right text-white text-[10px]">
                          Rate
                        </TableHead>
                        <TableHead className="w-16 border-[#D0D0D0] text-right text-white text-[10px]">
                          Disc %
                        </TableHead>
                        <TableHead className="w-24 border-[#D0D0D0] text-right text-white text-[10px]">
                          Amount
                        </TableHead>
                        <TableHead className="w-8 border-[#D0D0D0]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {voucherItems.map((item) => (
                        <TableRow key={item.id}>
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
                                <option key={s.id} value={s.name}>
                                  {s.name}
                                </option>
                              ))}
                            </select>
                          </TableCell>
                          {isGstType && (
                            <>
                              <TableCell className="border-[#D0D0D0] p-1">
                                <input
                                  type="text"
                                  className="w-full border-0 bg-transparent px-1 py-0.5 text-[10px]"
                                  value={item.hsnsacCode ?? ''}
                                  readOnly
                                />
                              </TableCell>
                              <TableCell className="border-[#D0D0D0] p-1 text-right">
                                <input
                                  type="number"
                                  className="w-full border-0 bg-transparent px-1 py-0.5 text-right text-[10px]"
                                  value={item.igstPct ?? ''}
                                  onChange={(e) =>
                                    updateVoucherItem({
                                      ...item,
                                      igstPct: e.target.value ? Number(e.target.value) : undefined,
                                    })
                                  }
                                />
                              </TableCell>
                              <TableCell className="border-[#D0D0D0] p-1 text-right">
                                <input
                                  type="number"
                                  className="w-full border-0 bg-transparent px-1 py-0.5 text-right text-[10px]"
                                  value={item.cgstPct ?? ''}
                                  onChange={(e) =>
                                    updateVoucherItem({
                                      ...item,
                                      cgstPct: e.target.value ? Number(e.target.value) : undefined,
                                    })
                                  }
                                />
                              </TableCell>
                              <TableCell className="border-[#D0D0D0] p-1 text-right">
                                <input
                                  type="number"
                                  className="w-full border-0 bg-transparent px-1 py-0.5 text-right text-[10px]"
                                  value={item.sgstPct ?? ''}
                                  onChange={(e) =>
                                    updateVoucherItem({
                                      ...item,
                                      sgstPct: e.target.value ? Number(e.target.value) : undefined,
                                    })
                                  }
                                />
                              </TableCell>
                            </>
                          )}
                          <TableCell className="border-[#D0D0D0] p-1 text-right">
                            <input
                              type="number"
                              className="w-full border-0 bg-transparent px-1 py-0.5 text-right text-[10px]"
                              value={item.qty || ''}
                              onChange={(e) => {
                                const qty = Number(e.target.value) || 0;
                                updateVoucherItem({ ...item, qty });
                              }}
                            />
                          </TableCell>
                          <TableCell className="border-[#D0D0D0] p-1 text-right">
                            <input
                              type="number"
                              className="w-full border-0 bg-transparent px-1 py-0.5 text-right text-[10px]"
                              value={item.rate || ''}
                              onChange={(e) => {
                                const rate = Number(e.target.value) || 0;
                                updateVoucherItem({ ...item, rate });
                              }}
                            />
                          </TableCell>
                          <TableCell className="border-[#D0D0D0] p-1 text-right">
                            <input
                              type="number"
                              className="w-full border-0 bg-transparent px-1 py-0.5 text-right text-[10px]"
                              value={item.discountPct ?? ''}
                              onChange={(e) =>
                                updateVoucherItem({
                                  ...item,
                                  discountPct: e.target.value ? Number(e.target.value) : undefined,
                                })
                              }
                            />
                          </TableCell>
                          <TableCell className="border-[#D0D0D0] p-1 text-right text-[10px]">
                            ₹{item.amount.toLocaleString('en-IN')}
                          </TableCell>
                          <TableCell className="border-[#D0D0D0] p-1">
                            <Button
                              type="button"
                              size="sm"
                              variant="ghost"
                              className="h-5 w-5 p-0 text-[10px] text-red-600"
                              onClick={() => removeVoucherItem(item.id)}
                            >
                              ×
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </ScrollArea>
                <div className="flex justify-end px-2 py-1 border-t border-[#D0D0D0] bg-[#F5F5F5]">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="text-[10px]"
                    onClick={() => addVoucherItem()}
                  >
                    + Add Row
                  </Button>
                </div>
              </div>
              )}

              {/* Auto GST ledger lines (read-only) */}
              {!isPaymentOrReceipt && isGstType && gstLines.length > 0 && (
                <div className="border border-[#D0D0D0] bg-[#F8F8F8] p-2">
                  <div className="text-[10px] font-semibold text-gray-600 mb-1">Automatic GST Ledger Posting</div>
                  <Table>
                    <TableBody>
                      {gstLines.map((line, idx) => (
                        <TableRow key={idx}>
                          <TableCell className="border-0 py-0.5 text-[10px] font-medium">
                            {line.ledgerName} @ {accountingVoucherIsInterState ? (voucherItems[0]?.igstPct ?? 0) : (voucherItems[0]?.cgstPct ?? 0) + (voucherItems[0]?.sgstPct ?? 0)}%
                          </TableCell>
                          <TableCell className="border-0 py-0.5 text-right text-[10px]">
                            ₹{line.amount.toLocaleString('en-IN')}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {/* Narration */}
              <div className="flex items-start gap-2 text-[11px]">
                <label className="font-medium shrink-0 pt-0.5">Narration</label>
                <textarea
                  className="flex-1 border border-[#D0D0D0] bg-white px-1.5 py-0.5 text-[11px] min-h-[44px]"
                  value={accountingVoucherNarration}
                  onChange={(e) => setAccountingVoucherNarration(e.target.value)}
                  placeholder="Optional"
                  rows={2}
                />
              </div>
            </div>
          </ScrollArea>

          {/* Footer: Total, Accept, Cancel */}
          <div className="flex shrink-0 items-center justify-between gap-4 border-t border-[#D0D0D0] bg-[#E8E8E8] px-3 py-2">
            <div className="text-[12px] font-bold text-[#DC2626]">
              Total ₹{(isPaymentOrReceipt ? particularsTotal : totalAmount).toLocaleString('en-IN')}
            </div>
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                className="bg-[#DC2626] text-white hover:bg-[#B91C1C] text-[11px]"
                onClick={handleAccept}
              >
                Ctrl+A Accept
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="text-[11px]"
                onClick={handleCancel}
              >
                X Cancel
              </Button>
              <Button size="sm" variant="outline" className="text-[11px]" onClick={openVoucherConfig}>
                F12 Configure
              </Button>
            </div>
          </div>
        </div>
        <VoucherRightPanel />
      </div>
    </div>
  );
}
