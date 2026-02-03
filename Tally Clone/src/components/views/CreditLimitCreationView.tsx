import * as React from 'react';
import {
  useAppStore,
  type CreditLimitRecord,
  type CreditLimitScope,
} from '../../store/useAppStore';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

export function CreditLimitCreationView() {
  const creditLimits = useAppStore((s) => s.creditLimits);
  const creditLimitFormEditingId = useAppStore((s) => s.creditLimitFormEditingId);
  const setCreditLimitFormEditingId = useAppStore((s) => s.setCreditLimitFormEditingId);
  const addCreditLimit = useAppStore((s) => s.addCreditLimit);
  const updateCreditLimit = useAppStore((s) => s.updateCreditLimit);
  const deleteCreditLimit = useAppStore((s) => s.deleteCreditLimit);
  const setActiveView = useAppStore((s) => s.setActiveView);
  const ledgers = useAppStore((s) => s.mockData.ledgers);
  const groups = useAppStore((s) => s.groups);

  const [scope, setScope] = React.useState<CreditLimitScope>('ledger');
  const [ledgerId, setLedgerId] = React.useState<number | ''>('');
  const [groupId, setGroupId] = React.useState<number | ''>('');
  const [amount, setAmount] = React.useState('');
  const [periodDays, setPeriodDays] = React.useState('');
  const [periodMonths, setPeriodMonths] = React.useState('');
  const [graceDays, setGraceDays] = React.useState('');
  const [graceMonths, setGraceMonths] = React.useState('');
  const [blockOnExceed, setBlockOnExceed] = React.useState(false);
  const [applyToSales, setApplyToSales] = React.useState(true);
  const [applyToJournal, setApplyToJournal] = React.useState(true);
  const [applyToCreditNote, setApplyToCreditNote] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const amountInputRef = React.useRef<HTMLInputElement>(null);

  const editing = React.useMemo(
    () =>
      creditLimitFormEditingId != null
        ? creditLimits.find((c) => c.id === creditLimitFormEditingId) ?? null
        : null,
    [creditLimitFormEditingId, creditLimits]
  );
  const isAlter = !!editing;

  React.useEffect(() => {
    if (editing) {
      setScope(editing.scope);
      setLedgerId(editing.ledgerId ?? '');
      setGroupId(editing.groupId ?? '');
      setAmount(String(editing.amount));
      setPeriodDays(editing.periodDays != null ? String(editing.periodDays) : '');
      setPeriodMonths(editing.periodMonths != null ? String(editing.periodMonths) : '');
      setGraceDays(editing.graceDays != null ? String(editing.graceDays) : '');
      setGraceMonths(editing.graceMonths != null ? String(editing.graceMonths) : '');
      setBlockOnExceed(editing.blockOnExceed);
      setApplyToSales(editing.applyToSales);
      setApplyToJournal(editing.applyToJournal);
      setApplyToCreditNote(editing.applyToCreditNote);
    } else {
      setScope('ledger');
      setLedgerId('');
      setGroupId('');
      setAmount('');
      setPeriodDays('');
      setPeriodMonths('');
      setGraceDays('');
      setGraceMonths('');
      setBlockOnExceed(false);
      setApplyToSales(true);
      setApplyToJournal(true);
      setApplyToCreditNote(true);
    }
    setError(null);
    setTimeout(() => amountInputRef.current?.focus(), 0);
  }, [editing?.id]);

  const handleQuit = () => {
    setCreditLimitFormEditingId(null);
    setActiveView('master-creation');
  };

  const handleAccept = () => {
    setError(null);
    const numAmount = Number(amount);
    if (!Number.isFinite(numAmount) || numAmount < 0) {
      setError('Credit limit amount is required and must be ≥ 0');
      amountInputRef.current?.focus();
      return;
    }
    if (scope === 'ledger') {
      const ledger = ledgers.find((l) => l.id === ledgerId);
      if (!ledger) {
        setError('Select a ledger');
        return;
      }
      const payload: Omit<CreditLimitRecord, 'id'> = {
        scope: 'ledger',
        ledgerId: ledger.id,
        ledgerName: ledger.name,
        amount: numAmount,
        periodDays: periodDays === '' ? undefined : Number(periodDays),
        periodMonths: periodMonths === '' ? undefined : Number(periodMonths),
        graceDays: graceDays === '' ? undefined : Number(graceDays),
        graceMonths: graceMonths === '' ? undefined : Number(graceMonths),
        blockOnExceed,
        applyToSales,
        applyToJournal,
        applyToCreditNote,
      };
      if (editing) {
        updateCreditLimit({ ...editing, ...payload });
      } else {
        addCreditLimit(payload);
      }
    } else {
      const group = groups.find((g) => g.id === groupId);
      if (!group) {
        setError('Select a group');
        return;
      }
      const payload: Omit<CreditLimitRecord, 'id'> = {
        scope: 'group',
        groupId: group.id,
        groupName: group.name,
        amount: numAmount,
        periodDays: periodDays === '' ? undefined : Number(periodDays),
        periodMonths: periodMonths === '' ? undefined : Number(periodMonths),
        graceDays: graceDays === '' ? undefined : Number(graceDays),
        graceMonths: graceMonths === '' ? undefined : Number(graceMonths),
        blockOnExceed,
        applyToSales,
        applyToJournal,
        applyToCreditNote,
      };
      if (editing) {
        updateCreditLimit({ ...editing, ...payload });
      } else {
        addCreditLimit(payload);
      }
    }
    handleQuit();
  };

  const handleDelete = () => {
    if (!editing) return;
    deleteCreditLimit(editing.id);
    handleQuit();
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
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
        e.preventDefault();
        if (isAlter && editing) handleDelete();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [editing, scope, ledgerId, groupId, amount]);

  const allowDelete = isAlter && !!editing;

  return (
    <div className="flex h-full overflow-hidden bg-white">
      <ScrollArea className="flex-1 min-w-0 p-4">
        <div className="text-[14px] font-bold text-[#7F1D1D] mb-4">
          Credit Limits
        </div>

        <div className="space-y-3 max-w-xl text-[11px]">
          <div>
            <label className="block text-[10px] font-medium text-gray-600 mb-1">Scope</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="scope"
                  checked={scope === 'ledger'}
                  onChange={() => setScope('ledger')}
                />
                Ledger (Customer / Supplier)
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="scope"
                  checked={scope === 'group'}
                  onChange={() => setScope('group')}
                />
                Group
              </label>
            </div>
          </div>

          {scope === 'ledger' && (
            <div>
              <label className="block text-[10px] font-medium text-gray-600 mb-1">Ledger *</label>
              <select
                value={ledgerId === '' ? '' : String(ledgerId)}
                onChange={(e) => setLedgerId(e.target.value === '' ? '' : Number(e.target.value))}
                className="border border-[#D0D0D0] px-2 py-1.5 w-full bg-white"
              >
                <option value="">-- Select ledger --</option>
                {ledgers.filter((l) => !l.inactive).map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {scope === 'group' && (
            <div>
              <label className="block text-[10px] font-medium text-gray-600 mb-1">Group *</label>
              <select
                value={groupId === '' ? '' : String(groupId)}
                onChange={(e) => setGroupId(e.target.value === '' ? '' : Number(e.target.value))}
                className="border border-[#D0D0D0] px-2 py-1.5 w-full bg-white"
              >
                <option value="">-- Select group --</option>
                {groups.filter((g) => !g.inactive).map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-[10px] font-medium text-gray-600 mb-1">Credit limit amount *</label>
            <input
              ref={amountInputRef}
              type="number"
              min={0}
              step={0.01}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="border border-[#D0D0D0] px-2 py-1.5 w-40"
            />
          </div>

          <div className="border-t border-[#E0E0E0] pt-3 mt-2">
            <div className="text-[10px] font-semibold text-gray-700 mb-2">Time period</div>
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-[10px] text-gray-600 mb-0.5">Days</label>
                <input
                  type="number"
                  min={0}
                  value={periodDays}
                  onChange={(e) => setPeriodDays(e.target.value)}
                  className="border border-[#D0D0D0] px-2 py-1.5 w-24"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-600 mb-0.5">Months</label>
                <input
                  type="number"
                  min={0}
                  value={periodMonths}
                  onChange={(e) => setPeriodMonths(e.target.value)}
                  className="border border-[#D0D0D0] px-2 py-1.5 w-24"
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-[#E0E0E0] pt-3 mt-2">
            <div className="text-[10px] font-semibold text-gray-700 mb-2">Grace period (optional)</div>
            <div className="flex flex-wrap gap-4">
              <div>
                <label className="block text-[10px] text-gray-600 mb-0.5">Days</label>
                <input
                  type="number"
                  min={0}
                  value={graceDays}
                  onChange={(e) => setGraceDays(e.target.value)}
                  className="border border-[#D0D0D0] px-2 py-1.5 w-24"
                  placeholder="Optional"
                />
              </div>
              <div>
                <label className="block text-[10px] text-gray-600 mb-0.5">Months</label>
                <input
                  type="number"
                  min={0}
                  value={graceMonths}
                  onChange={(e) => setGraceMonths(e.target.value)}
                  className="border border-[#D0D0D0] px-2 py-1.5 w-24"
                  placeholder="Optional"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-[#E0E0E0] pt-3 mt-2">
            <div className="text-[10px] font-semibold text-gray-700 mb-2">Enforcement</div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={blockOnExceed}
                onChange={(e) => setBlockOnExceed(e.target.checked)}
              />
              Block saving when limit exceeded (if unchecked, only warn)
            </label>
          </div>

          <div className="border-t border-[#E0E0E0] pt-3 mt-2">
            <div className="text-[10px] font-semibold text-gray-700 mb-2">Apply to voucher types</div>
            <div className="space-y-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyToSales}
                  onChange={(e) => setApplyToSales(e.target.checked)}
                />
                Sales
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyToJournal}
                  onChange={(e) => setApplyToJournal(e.target.checked)}
                />
                Journal
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={applyToCreditNote}
                  onChange={(e) => setApplyToCreditNote(e.target.checked)}
                />
                Credit Note
              </label>
            </div>
          </div>

          {error && <p className="text-[10px] text-red-600">{error}</p>}
        </div>

        <div className="flex gap-2 mt-4">
          <Button
            size="sm"
            className="bg-[#DC2626] text-white hover:bg-[#B91C1C] text-[11px]"
            onClick={handleAccept}
          >
            Accept (Ctrl+A)
          </Button>
          <Button size="sm" variant="outline" onClick={handleQuit}>
            Quit (Esc)
          </Button>
          {allowDelete && (
            <Button
              size="sm"
              variant="outline"
              className="text-red-700 border-red-300"
              onClick={handleDelete}
            >
              Delete (D)
            </Button>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
