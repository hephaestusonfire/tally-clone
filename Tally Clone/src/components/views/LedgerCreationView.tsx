import * as React from 'react';
import {
  useAppStore,
  type Ledger,
  type LedgerMailingDetails,
  type LedgerBankingDetails,
  type LedgerTaxDetails,
  type LedgerRegistrationType,
  type DrCr,
} from '../../store/useAppStore';
import { useGatewayStore } from '../../store/useGatewayStore';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { ChevronDown, ChevronRight } from 'lucide-react';

const DEFAULT_UNDER = 'Capital Account';
const REGISTRATION_TYPES: LedgerRegistrationType[] = ['Regular', 'Composition', 'Unregistered'];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Bihar', 'Delhi', 'Gujarat', 'Karnataka', 'Maharashtra', 'Tamil Nadu',
  'Telangana', 'Uttar Pradesh', 'West Bengal', 'Kerala', 'Rajasthan', 'Madhya Pradesh', 'Punjab', 'Haryana',
];

function emptyMailing(): LedgerMailingDetails {
  return {};
}
function emptyBanking(): LedgerBankingDetails {
  return {
    provide: false,
    maintainBillByBill: false,
    enableChequePrinting: false,
  };
}
function emptyTax(): LedgerTaxDetails {
  return {};
}

export function LedgerCreationView() {
  const groups = useAppStore((s) => s.groups);
  const ledgers = useAppStore((s) => s.mockData.ledgers);
  const ledgerFormEditingId = useAppStore((s) => s.ledgerFormEditingId);
  const setLedgerFormEditingId = useAppStore((s) => s.setLedgerFormEditingId);
  const addLedger = useAppStore((s) => s.addLedger);
  const updateLedger = useAppStore((s) => s.updateLedger);
  const deleteLedger = useAppStore((s) => s.deleteLedger);
  const canDeleteLedger = useAppStore((s) => s.canDeleteLedger);
  const isLedgerNameUnique = useAppStore((s) => s.isLedgerNameUnique);
  const canChangeLedgerGroup = useAppStore((s) => s.canChangeLedgerGroup);
  const setActiveView = useAppStore((s) => s.setActiveView);
  const showInactive = useAppStore((s) => s.showInactive);
  const toggleCompanyModal = useAppStore((s) => s.toggleCompanyModal);
  const openDateModal = useGatewayStore((s) => s.openDateModal);
  const isGstEnabled = useAppStore((s) => s.isGstEnabled);
  const isGstActive = isGstEnabled();

  const [name, setName] = React.useState('');
  const [alias, setAlias] = React.useState('');
  const [under, setUnder] = React.useState(DEFAULT_UNDER);
  const [mailingOpen, setMailingOpen] = React.useState(false);
  const [mailing, setMailing] = React.useState<LedgerMailingDetails>(emptyMailing());
  const [banking, setBanking] = React.useState<LedgerBankingDetails>(emptyBanking());
  const [tax, setTax] = React.useState<LedgerTaxDetails>(emptyTax());
  const [openingAmount, setOpeningAmount] = React.useState(0);
  const [openingBalanceType, setOpeningBalanceType] = React.useState<DrCr>('Dr');
  const [maintainBillByBill, setMaintainBillByBill] = React.useState(false);
  const [creditPeriodDays, setCreditPeriodDays] = React.useState<number | ''>('');
  const [moreDetails, setMoreDetails] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const nameInputRef = React.useRef<HTMLInputElement>(null);

  const editingLedger = React.useMemo(
    () => (ledgerFormEditingId != null ? ledgers.find((l) => l.id === ledgerFormEditingId) : null),
    [ledgerFormEditingId, ledgers]
  );
  const isAlter = !!editingLedger;

  React.useEffect(() => {
    if (editingLedger) {
      setName(editingLedger.name);
      setAlias(editingLedger.alias ?? '');
      setUnder(editingLedger.under);
      setMailing(editingLedger.mailingDetails ?? emptyMailing());
      setBanking(editingLedger.bankingDetails ?? emptyBanking());
      setTax(editingLedger.taxDetails ?? emptyTax());
      setOpeningAmount(Math.abs(editingLedger.amount ?? 0));
      setOpeningBalanceType(editingLedger.openingBalanceType ?? (editingLedger.amount >= 0 ? 'Dr' : 'Cr'));
      setMaintainBillByBill(!!editingLedger.maintainBillByBill);
      setCreditPeriodDays(editingLedger.creditPeriodDays ?? '');
    } else {
      setName('');
      setAlias('');
      setUnder(DEFAULT_UNDER);
      setMailing(emptyMailing());
      setBanking(emptyBanking());
      setTax(emptyTax());
      setOpeningAmount(0);
      setOpeningBalanceType('Dr');
      setMaintainBillByBill(false);
      setCreditPeriodDays('');
    }
    setError(null);
    setTimeout(() => nameInputRef.current?.focus(), 0);
  }, [editingLedger?.id]);

  const handleQuit = () => {
    setLedgerFormEditingId(null);
    setActiveView(isAlter ? 'master-alteration' : 'master-creation');
  };

  const handleAccept = async () => {
    setError(null);
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Name is required');
      nameInputRef.current?.focus();
      return;
    }
    if (!isLedgerNameUnique(trimmedName, editingLedger?.id)) {
      setError('Ledger name must be unique per company');
      nameInputRef.current?.focus();
      return;
    }
    if (editingLedger && under !== editingLedger.under && !canChangeLedgerGroup(editingLedger.id)) {
      setError('Cannot change Group: ledger is used in vouchers');
      return;
    }
    const groupExists = groups.some((g) => g.name === under);
    if (!groupExists && under.trim()) {
      setError('Selected group must exist');
      return;
    }
    const amountVal = Math.abs(openingAmount);
    const payload: Omit<Ledger, 'id'> = {
      name: trimmedName,
      alias: alias.trim() || undefined,
      under: under.trim() || DEFAULT_UNDER,
      amount: amountVal,
      openingBalanceType: amountVal > 0 ? openingBalanceType : undefined,
      maintainBillByBill: maintainBillByBill || undefined,
      creditPeriodDays: creditPeriodDays === '' ? undefined : Number(creditPeriodDays),
      mailingDetails: Object.keys(mailing).length ? mailing : undefined,
      bankingDetails: banking.provide ? banking : undefined,
      taxDetails: Object.keys(tax).length ? tax : undefined,
    };
    if (editingLedger) {
      updateLedger({ ...editingLedger, ...payload });
      handleQuit();
    } else {
      try {
        await addLedger(payload);
        handleQuit();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save ledger');
      }
    }
  };

  const handleDelete = () => {
    if (!editingLedger) return;
    if (!canDeleteLedger(editingLedger.id)) {
      setError('Cannot delete: ledger has vouchers or is in use');
      return;
    }
    deleteLedger(editingLedger.id);
    handleQuit();
  };

  const handleFetchByGstin = () => {
    if (tax.gstin?.trim()) {
      setMailing((m) => ({ ...m, name: name || m.name, address: m.address || '(Fetched from GSTIN placeholder)' }));
    }
  };

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleQuit();
        return;
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        handleAccept();
        return;
      }
      if (e.key === 'd' && !e.ctrlKey && !e.metaKey && !e.altKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;
        e.preventDefault();
        handleDelete();
        return;
      }
      if (e.key === 'F2') {
        e.preventDefault();
        openDateModal();
        return;
      }
      if (e.key === 'F3') {
        e.preventDefault();
        toggleCompanyModal();
        return;
      }
      if (e.key === 'F10') {
        e.preventDefault();
        setActiveView('master-creation');
        return;
      }
      if (e.key === 'i' || e.key === 'I') {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;
        e.preventDefault();
        setMoreDetails((m) => !m);
        return;
      }
      if (e.key === 'l' || e.key === 'L') {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;
        e.preventDefault();
        handleFetchByGstin();
        return;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isAlter, editingLedger, name, under, openingAmount, openingBalanceType]);

  const groupNames = React.useMemo(() => {
    const base = showInactive ? groups : groups.filter((g) => !g.inactive);
    const names = base.map((g) => g.name).filter(Boolean);
    if (!showInactive && under && !names.includes(under)) names.push(under);
    return names;
  }, [groups, showInactive, under]);
  const allowDelete = isAlter && editingLedger && canDeleteLedger(editingLedger.id);
  const totalDr = openingBalanceType === 'Dr' ? openingAmount : 0;
  const totalCr = openingBalanceType === 'Cr' ? openingAmount : 0;

  return (
    <div className="flex h-full overflow-hidden bg-white">
      <ScrollArea className="flex-1 min-w-0 p-4">
        <div className="text-[14px] font-bold text-[#7F1D1D] mb-4">
          {isAlter ? 'Alter Ledger' : 'Ledger Creation'}
        </div>

        <div className="space-y-3 max-w-xl">
          <div>
            <label className="block text-[10px] font-medium text-gray-600 mb-1">Name *</label>
            <input
              ref={nameInputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-[#D0D0D0] px-2 py-1.5 w-full text-[11px]"
              placeholder="Ledger name"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-600 mb-1">Alias</label>
            <input
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              className="border border-[#D0D0D0] px-2 py-1.5 w-full text-[11px]"
              placeholder="Optional alias"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-600 mb-1">Under (Group) *</label>
            <select
              value={under}
              onChange={(e) => setUnder(e.target.value)}
              className="border border-[#D0D0D0] px-2 py-1.5 w-full text-[11px] bg-white"
            >
              {groupNames.map((gName) => (
                <option key={gName} value={gName}>
                  {gName}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-gray-500 mt-1">
              Bank: Bank Accounts · Cash: Cash-in-hand · Deposits: Deposit Accounts
            </p>
          </div>

          {/* Mailing Details - collapsible */}
          <div className="border border-[#E0E0E0] rounded">
            <button
              type="button"
              className="w-full flex items-center gap-1 px-3 py-2 text-left text-[11px] font-semibold text-[#7F1D1D] bg-[#F5F5F5] hover:bg-[#EEEEEE]"
              onClick={() => setMailingOpen((o) => !o)}
            >
              {mailingOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
              Mailing Details
            </button>
            {mailingOpen && (
              <div className="p-3 space-y-2 border-t border-[#E0E0E0]">
                <input type="text" placeholder="Name" value={mailing.name ?? ''} onChange={(e) => setMailing((m) => ({ ...m, name: e.target.value }))} className="border border-[#D0D0D0] px-2 py-1 w-full text-[11px]" />
                <textarea placeholder="Address" value={mailing.address ?? ''} onChange={(e) => setMailing((m) => ({ ...m, address: e.target.value }))} className="border border-[#D0D0D0] px-2 py-1 w-full text-[11px] min-h-[60px]" rows={2} />
                <select value={mailing.state ?? ''} onChange={(e) => setMailing((m) => ({ ...m, state: e.target.value }))} className="border border-[#D0D0D0] px-2 py-1 text-[11px] bg-white">
                  <option value="">State</option>
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
                <input type="text" placeholder="Country" value={mailing.country ?? 'India'} onChange={(e) => setMailing((m) => ({ ...m, country: e.target.value }))} className="border border-[#D0D0D0] px-2 py-1 w-full text-[11px]" />
                <input type="text" placeholder="Pincode" value={mailing.pincode ?? ''} onChange={(e) => setMailing((m) => ({ ...m, pincode: e.target.value }))} className="border border-[#D0D0D0] px-2 py-1 w-full text-[11px]" />
                <input type="text" placeholder="Primary Mobile No." value={mailing.primaryMobile ?? ''} onChange={(e) => setMailing((m) => ({ ...m, primaryMobile: e.target.value }))} className="border border-[#D0D0D0] px-2 py-1 w-full text-[11px]" />
                <label className="flex items-center gap-2 text-[11px]"><input type="checkbox" checked={mailing.multipleMobiles ?? false} onChange={(e) => setMailing((m) => ({ ...m, multipleMobiles: e.target.checked }))} /> Provide multiple Mobile Nos.</label>
                <input type="text" placeholder="Default WhatsApp No." value={mailing.defaultWhatsApp ?? ''} onChange={(e) => setMailing((m) => ({ ...m, defaultWhatsApp: e.target.value }))} className="border border-[#D0D0D0] px-2 py-1 w-full text-[11px]" />
                <label className="flex items-center gap-2 text-[11px]"><input type="checkbox" checked={mailing.provideContactDetails ?? false} onChange={(e) => setMailing((m) => ({ ...m, provideContactDetails: e.target.checked }))} /> Provide Contact Details</label>
              </div>
            )}
          </div>

          {/* Banking Details (Bank Accounts: Account No, IFSC, Bank Branch; Maintain bill-by-bill, Enable cheque printing) */}
          <div className="border border-[#E0E0E0] rounded p-3">
            <div className="text-[10px] font-semibold text-gray-700 mb-2">Banking Details</div>
            <label className="flex items-center gap-2 text-[11px] mb-2">
              <input type="checkbox" checked={banking.provide ?? false} onChange={(e) => setBanking((b) => ({ ...b, provide: e.target.checked }))} />
              Provide bank details
            </label>
            {(banking.provide ?? false) && (
              <div className="space-y-2 pl-4">
                <label className="flex items-center gap-2 text-[11px] cursor-pointer">
                  <input type="checkbox" checked={banking.maintainBillByBill ?? false} onChange={(e) => setBanking((b) => ({ ...b, maintainBillByBill: e.target.checked }))} />
                  Maintain balances bill-by-bill
                </label>
                <label className="flex items-center gap-2 text-[11px] cursor-pointer">
                  <input type="checkbox" checked={banking.enableChequePrinting ?? false} onChange={(e) => setBanking((b) => ({ ...b, enableChequePrinting: e.target.checked }))} />
                  Enable cheque printing
                </label>
                <div>
                  <label className="block text-[10px] text-gray-600 mb-0.5">Account No</label>
                  <input type="text" value={banking.accountNumber ?? ''} onChange={(e) => setBanking((b) => ({ ...b, accountNumber: e.target.value }))} className="border border-[#D0D0D0] px-2 py-1 w-full text-[11px]" placeholder="Account Number" />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-600 mb-0.5">IFSC</label>
                  <input type="text" value={banking.ifsc ?? ''} onChange={(e) => setBanking((b) => ({ ...b, ifsc: e.target.value }))} className="border border-[#D0D0D0] px-2 py-1 w-full text-[11px]" placeholder="IFSC Code" />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-600 mb-0.5">Bank Branch</label>
                  <input type="text" value={banking.branch ?? ''} onChange={(e) => setBanking((b) => ({ ...b, branch: e.target.value }))} className="border border-[#D0D0D0] px-2 py-1 w-full text-[11px]" placeholder="Branch" />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-600 mb-0.5">Bank Name</label>
                  <input type="text" value={banking.bankName ?? ''} onChange={(e) => setBanking((b) => ({ ...b, bankName: e.target.value }))} className="border border-[#D0D0D0] px-2 py-1 w-full text-[11px]" placeholder="Bank Name" />
                </div>
              </div>
            )}
          </div>

          {/* Tax Registration Details (GST Details → Enable if registered) */}
          <div className="border border-[#E0E0E0] rounded p-3">
            <div className="text-[10px] font-semibold text-gray-700 mb-2">Tax Registration Details</div>
            {under === 'Sundry Debtors' && isGstActive && (
              <p className="text-[10px] text-gray-600 mb-2">GST Details → Enable if registered</p>
            )}
            <input type="text" placeholder="PAN / IT No." value={tax.pan ?? ''} onChange={(e) => setTax((t) => ({ ...t, pan: e.target.value }))} className="border border-[#D0D0D0] px-2 py-1 w-full text-[11px] mb-2" />
            <select value={tax.registrationType ?? ''} onChange={(e) => setTax((t) => ({ ...t, registrationType: (e.target.value || undefined) as LedgerRegistrationType | undefined }))} className="border border-[#D0D0D0] px-2 py-1 text-[11px] bg-white mb-2">
              <option value="">Registration Type</option>
              {REGISTRATION_TYPES.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
            {isGstActive && (
              <>
                <input type="text" placeholder="GSTIN / UIN" value={tax.gstin ?? ''} onChange={(e) => setTax((t) => ({ ...t, gstin: e.target.value }))} className="border border-[#D0D0D0] px-2 py-1 w-full text-[11px] mb-2" />
                <label className="flex items-center gap-2 text-[11px]"><input type="checkbox" checked={tax.additionalGstDetails ?? false} onChange={(e) => setTax((t) => ({ ...t, additionalGstDetails: e.target.checked }))} /> Set / Alter additional GST details</label>
              </>
            )}
          </div>

          {/* Opening Balance */}
          <div className="border border-[#E0E0E0] rounded p-3">
            <div className="text-[10px] font-semibold text-gray-700 mb-2">Opening Balance</div>
            <div className="flex gap-2 items-center">
              <input
                type="number"
                value={openingAmount || ''}
                onChange={(e) => setOpeningAmount(Number(e.target.value) || 0)}
                className="border border-[#D0D0D0] px-2 py-1.5 w-32 text-[11px] text-right"
                placeholder="Amount"
              />
              <select
                value={openingBalanceType}
                onChange={(e) => setOpeningBalanceType(e.target.value as DrCr)}
                className="border border-[#D0D0D0] px-2 py-1.5 text-[11px] bg-white"
              >
                <option value="Dr">Dr</option>
                <option value="Cr">Cr</option>
              </select>
            </div>
            <p className="text-[10px] text-gray-500 mt-1">Effective from company start date.</p>
            <div className="mt-2 text-[10px] text-gray-600">
              Total Opening: Dr {totalDr.toLocaleString('en-IN')} | Cr {totalCr.toLocaleString('en-IN')}
              {totalDr !== totalCr && <span className="text-amber-600 ml-1">(Unbalanced)</span>}
            </div>
          </div>

          {moreDetails && (
            <div className="border-t border-[#E0E0E0] pt-3 text-[10px] text-gray-500">
              More details (advanced fields).
            </div>
          )}

          {error && <p className="text-[10px] text-red-600">{error}</p>}
        </div>

        <div className="flex gap-2 mt-4">
          <Button size="sm" className="bg-[#DC2626] text-white hover:bg-[#B91C1C] text-[11px]" onClick={handleAccept}>
            Accept (Ctrl+A)
          </Button>
          <Button size="sm" variant="outline" onClick={handleQuit}>
            Quit (Esc)
          </Button>
          {allowDelete && (
            <Button size="sm" variant="outline" className="text-red-700 border-red-300" onClick={handleDelete}>
              Delete (D)
            </Button>
          )}
        </div>
      </ScrollArea>

      <aside className="hidden lg:flex w-[200px] min-w-[200px] flex-col border-l border-[#D0D0D0] bg-[#F0F0F0] p-2">
        <div className="text-[10px] font-bold text-[#7F1D1D] mb-2">Context Keys</div>
        <ScrollArea className="flex-1">
          <div className="space-y-1 text-[10px]">
            <button type="button" className="tally-list-item w-full text-left px-2 py-1.5 rounded border border-transparent hover:border-[#D0D0D0]" onClick={openDateModal}>F2: Period</button>
            <button type="button" className="tally-list-item w-full text-left px-2 py-1.5 rounded border border-transparent hover:border-[#D0D0D0]" onClick={toggleCompanyModal}>F3: Company</button>
            <button type="button" className="tally-list-item w-full text-left px-2 py-1.5 rounded border border-transparent hover:border-[#D0D0D0]" onClick={() => setActiveView('master-creation')}>F10: Other Masters</button>
            <button type="button" className="tally-list-item w-full text-left px-2 py-1.5 rounded border border-transparent hover:border-[#D0D0D0]" onClick={() => setMoreDetails((m) => !m)}>I: More Details</button>
            <button type="button" className="tally-list-item w-full text-left px-2 py-1.5 rounded border border-transparent hover:border-[#D0D0D0] text-gray-500" onClick={handleFetchByGstin}>L: Fetch Details Using GSTIN/UIN</button>
          </div>
        </ScrollArea>
      </aside>
    </div>
  );
}
