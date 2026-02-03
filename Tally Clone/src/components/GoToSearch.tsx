import { useEffect, useRef, useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useAppStore, type Ledger, type Voucher } from '../store/useAppStore';
import { ScrollArea } from './ui/scroll-area';

const REPORT_ITEMS: { view: string; label: string }[] = [
  { view: 'trial-balance', label: 'Trial Balance' },
  { view: 'balance-sheet', label: 'Balance Sheet' },
  { view: 'profit-loss', label: 'Profit & Loss A/c' },
  { view: 'cash-flow', label: 'Cash Flow' },
  { view: 'ratio-analysis', label: 'Ratio Analysis' },
  { view: 'monthly-summary', label: 'Monthly Summary' },
  { view: 'day-book', label: 'Day Book' },
  { view: 'voucher-register', label: 'Voucher Register' },
  { view: 'ledger-vouchers', label: 'Ledger Vouchers' },
];

function formatVoucherDate(iso: string): string {
  const d = new Date(iso);
  const day = d.getDate();
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const mon = months[d.getMonth()];
  const yy = String(d.getFullYear()).slice(2);
  return `${day.toString().padStart(2, '0')}-${mon}-${yy}`;
}

function refPrefix(type: string): string {
  const m: Record<string, string> = {
    Sales: 'S', Purchase: 'P', Receipt: 'R', Payment: 'Pay', Journal: 'J', Contra: 'C',
  };
  return m[type] ?? 'V';
}

type ResultItem =
  | { kind: 'master'; ledger: Ledger }
  | { kind: 'voucher'; voucher: Voucher }
  | { kind: 'report'; view: string; label: string };

function fuzzyMatch(query: string, ...texts: string[]): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return texts.some((t) => t.toLowerCase().includes(q));
}

export function GoToSearch() {
  const searchOpen = useAppStore((s) => s.searchOpen);
  const searchQuery = useAppStore((s) => s.searchQuery);
  const setSearchOpen = useAppStore((s) => s.setSearchOpen);
  const setSearchQuery = useAppStore((s) => s.setSearchQuery);
  const setActiveView = useAppStore((s) => s.setActiveView);
  const setLedgerVouchersLedger = useAppStore((s) => s.setLedgerVouchersLedger);
  const openVoucherViewer = useAppStore((s) => s.openVoucherViewer);
  const mockData = useAppStore((s) => s.mockData);

  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const results = useMemo(() => {
    const q = searchQuery.trim();
    const items: ResultItem[] = [];

    if (q) {
      mockData.ledgers.forEach((l) => {
        if (fuzzyMatch(q, l.name, l.under)) items.push({ kind: 'master', ledger: l });
      });
      mockData.vouchers.forEach((v) => {
        const ref = `${refPrefix(v.type)}/${v.id}`;
        const dateStr = formatVoucherDate(v.date);
        const amt = `₹${v.amount.toLocaleString('en-IN')}`;
        if (fuzzyMatch(q, ref, v.type, v.party, dateStr, amt))
          items.push({ kind: 'voucher', voucher: v });
      });
      REPORT_ITEMS.forEach((r) => {
        if (fuzzyMatch(q, r.label)) items.push({ kind: 'report', view: r.view, label: r.label });
      });
    } else {
      mockData.ledgers.slice(0, 10).forEach((l) => items.push({ kind: 'master', ledger: l }));
      mockData.vouchers
        .slice()
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, 10)
        .forEach((v) => items.push({ kind: 'voucher', voucher: v }));
      REPORT_ITEMS.slice(0, 5).forEach((r) => items.push({ kind: 'report', view: r.view, label: r.label }));
    }

    return items;
  }, [searchQuery, mockData.ledgers, mockData.vouchers]);

  const masters = results.filter((r): r is ResultItem & { kind: 'master' } => r.kind === 'master');
  const vouchers = results.filter((r): r is ResultItem & { kind: 'voucher' } => r.kind === 'voucher');
  const reports = results.filter((r): r is ResultItem & { kind: 'report' } => r.kind === 'report');

  const flatIndexToItem = useMemo(() => {
    const flat: ResultItem[] = [];
    masters.forEach((r) => flat.push(r));
    vouchers.forEach((r) => flat.push(r));
    reports.forEach((r) => flat.push(r));
    return flat;
  }, [masters, vouchers, reports]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [searchQuery, results.length]);

  useEffect(() => {
    if (searchOpen) {
      inputRef.current?.focus();
    }
  }, [searchOpen]);

  const handleSelect = (item: ResultItem) => {
    if (item.kind === 'master') {
      setLedgerVouchersLedger({ id: item.ledger.id, name: item.ledger.name });
      setActiveView('ledger-vouchers');
    } else if (item.kind === 'voucher') {
      const ids = [...mockData.vouchers]
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
        .map((v) => v.id);
      openVoucherViewer(ids, item.voucher.id);
    } else {
      setActiveView(item.view);
    }
    setSearchOpen(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      setSearchOpen(false);
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => (i < flatIndexToItem.length - 1 ? i + 1 : 0));
      return;
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => (i > 0 ? i - 1 : flatIndexToItem.length - 1));
      return;
    }
    if (e.key === 'Enter' && flatIndexToItem[selectedIndex]) {
      e.preventDefault();
      handleSelect(flatIndexToItem[selectedIndex]);
      return;
    }
  };

  const getItemIndex = (item: ResultItem): number => {
    return flatIndexToItem.findIndex((x) => {
      if (x.kind !== item.kind) return false;
      if (x.kind === 'master' && item.kind === 'master') return x.ledger.id === item.ledger.id;
      if (x.kind === 'voucher' && item.kind === 'voucher') return x.voucher.id === item.voucher.id;
      if (x.kind === 'report' && item.kind === 'report') return x.view === item.view;
      return false;
    });
  };

  if (!searchOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center">
      {/* Overlay backdrop - optional dim */}
      <div
        className="absolute inset-0 bg-black/20"
        aria-hidden
        onClick={() => setSearchOpen(false)}
      />
      {/* Go To Bar */}
      <div
        className="relative w-full max-w-2xl mx-auto mt-4 flex items-center gap-3 h-[50px] px-4 rounded-lg bg-[#FFF5F5] border border-[#D0D0D0] shadow-md"
        style={{ width: 'calc(100% - 32px)' }}
      >
        <Search className="w-5 h-5 text-[#7F1D1D] flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Go To... Type name or shortcut (Alt+G)"
          className="flex-1 min-w-0 bg-transparent border-0 outline-none text-[12px] text-[#333] placeholder:text-gray-500"
        />
        <button
          type="button"
          onClick={() => setSearchOpen(false)}
          className="text-[11px] text-gray-600 hover:text-gray-800 flex-shrink-0"
        >
          Cancel
        </button>
      </div>

      {/* Dropdown */}
      {flatIndexToItem.length > 0 && (
        <div
          className="relative w-full max-w-2xl mx-auto mt-1 bg-white border border-[#D0D0D0] rounded-md shadow-md overflow-hidden"
          style={{ width: 'calc(100% - 32px)', maxHeight: '24rem' }}
        >
          <ScrollArea className="max-h-96">
            <div className="p-1">
              {masters.length > 0 && (
                <div className="mb-1">
                  <div className="px-2 py-1 text-[10px] font-bold text-[#7F1D1D] uppercase tracking-wide">
                    Masters
                  </div>
                  {masters.map((r) => {
                    const idx = getItemIndex(r);
                    const selected = idx === selectedIndex;
                    return (
                      <button
                        key={`m-${r.ledger.id}`}
                        type="button"
                        className={`w-full text-left px-3 py-2 text-[10px] rounded flex justify-between ${selected ? 'bg-[#FEE2E2]' : 'hover:bg-[#FEE2E2]'}`}
                        onClick={() => handleSelect(r)}
                      >
                        <span className="font-medium">{r.ledger.name}</span>
                        <span className="text-gray-500">{r.ledger.under}</span>
                      </button>
                    );
                  })}
                </div>
              )}
              {vouchers.length > 0 && (
                <div className="mb-1">
                  <div className="px-2 py-1 text-[10px] font-bold text-[#7F1D1D] uppercase tracking-wide">
                    Vouchers
                  </div>
                  {vouchers.map((r) => {
                    const idx = getItemIndex(r);
                    const selected = idx === selectedIndex;
                    const ref = `${refPrefix(r.voucher.type)}/${r.voucher.id}`;
                    const dateStr = formatVoucherDate(r.voucher.date);
                    const amt = `₹${r.voucher.amount.toLocaleString('en-IN')}`;
                    return (
                      <button
                        key={`v-${r.voucher.id}`}
                        type="button"
                        className={`w-full text-left px-3 py-2 text-[10px] rounded flex justify-between ${selected ? 'bg-[#FEE2E2]' : 'hover:bg-[#FEE2E2]'}`}
                        onClick={() => handleSelect(r)}
                      >
                        <span>
                          <span className="font-medium">{ref}</span>
                          <span className="mx-2 text-gray-500">|</span>
                          <span>{r.voucher.type}</span>
                          <span className="mx-2 text-gray-500">|</span>
                          <span>{dateStr}</span>
                          <span className="ml-2 font-medium">{amt}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
              {reports.length > 0 && (
                <div>
                  <div className="px-2 py-1 text-[10px] font-bold text-[#7F1D1D] uppercase tracking-wide">
                    Reports
                  </div>
                  {reports.map((r) => {
                    const idx = getItemIndex(r);
                    const selected = idx === selectedIndex;
                    return (
                      <button
                        key={`r-${r.view}`}
                        type="button"
                        className={`w-full text-left px-3 py-2 text-[10px] rounded ${selected ? 'bg-[#FEE2E2]' : 'hover:bg-[#FEE2E2]'}`}
                        onClick={() => handleSelect(r)}
                      >
                        {r.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}
