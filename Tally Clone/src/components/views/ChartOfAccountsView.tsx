import * as React from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useAppStore, type Group, type Ledger } from '../../store/useAppStore';
import { ScrollArea } from '../ui/scroll-area';

/** Tally default group order (local copy to avoid store import/hydration issues). */
const GROUP_ORDER = [
  'Primary', 'Capital Account', 'Capital Accounts', 'Reserves & Surplus',
  'Current Assets', 'Current Liabilities', 'Bank Accounts', 'Cash-in-hand',
  'Deposit Accounts', 'Loans & Advances', 'Stock-in-hand', 'Sundry Debtors',
  'Sundry Creditors', 'Sales Accounts', 'Purchase Accounts', 'Direct Expenses',
  'Direct Incomes', 'Indirect Expenses', 'Indirect Incomes', 'Suspense A/c',
  'Duties & Taxes', 'Fixed Assets', 'Secured Loans',
];

type RowType = 'group' | 'ledger';

interface TreeRow {
  type: RowType;
  id: number;
  name: string;
  depth: number;
  inactive?: boolean;
  /** Ledger's group (Under); only for type 'ledger' */
  under?: string;
  /** Ledger balance (calculated; period-sensitive); only for type 'ledger' */
  amount?: number;
  openingBalanceType?: 'Dr' | 'Cr';
}

/** Sort groups by Tally hierarchy, then by name. */
function sortGroupsByTallyOrder<T extends { name: string }>(items: T[]): T[] {
  return [...items].sort((a, b) => {
    const ia = GROUP_ORDER.indexOf(a.name);
    const ib = GROUP_ORDER.indexOf(b.name);
    if (ia >= 0 && ib >= 0) return ia - ib;
    if (ia >= 0) return -1;
    if (ib >= 0) return 1;
    return a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
  });
}

function buildFlattenedRows(
  groups: Group[],
  ledgers: Ledger[],
  expanded: Set<string>,
  showInactive: boolean
): TreeRow[] {
  const rows: TreeRow[] = [];
  const g = Array.isArray(groups) ? groups : [];
  const l = Array.isArray(ledgers) ? ledgers : [];

  const filterInactive = <T extends { inactive?: boolean }>(items: T[]): T[] =>
    showInactive ? items : items.filter((x) => !x.inactive);

  const childGroups = (parentName: string) =>
    // Guard against self-parent or circular references (e.g. "Primary" under "Primary")
    filterInactive(g).filter(
      (x) => x && x.under === parentName && x.name !== parentName
    );
  const childLedgers = (groupName: string) =>
    filterInactive(l).filter((x) => x && x.under === groupName);

  const walk = (parentName: string, depth: number) => {
    const groupsHere = childGroups(parentName);
    const ledgersHere = childLedgers(parentName);
    const hasChildren = groupsHere.length > 0 || ledgersHere.length > 0;
    const isExpanded = expanded.has(parentName) || !hasChildren;

    const sortedGroups = sortGroupsByTallyOrder(groupsHere);
    const sortedLedgers = [...ledgersHere].sort((a, b) =>
      a.name.localeCompare(b.name, undefined, { sensitivity: 'base' })
    );

    for (const g of sortedGroups) {
      rows.push({
        type: 'group',
        id: g.id,
        name: g.name,
        depth,
        inactive: g.inactive,
      });
      if (isExpanded && expanded.has(g.name)) {
        walk(g.name, depth + 1);
      }
    }
    if (isExpanded) {
      for (const l of sortedLedgers) {
        rows.push({
          type: 'ledger',
          id: l.id,
          name: l.name,
          depth,
          inactive: l.inactive,
          under: l.under,
          amount: l.amount,
          openingBalanceType: l.openingBalanceType,
        });
      }
    }
  };

  // Root: groups under "Primary", sorted by Tally hierarchy.
  // Exclude self-parenting "Primary" group from children to avoid cycles.
  const primaryGroups = filterInactive(g).filter(
    (x) => x.under === 'Primary' && x.name !== 'Primary'
  );
  const primarySorted = sortGroupsByTallyOrder(primaryGroups);

  for (const g of primarySorted) {
    rows.push({
      type: 'group',
      id: g.id,
      name: g.name,
      depth: 0,
      inactive: g.inactive,
    });
    if (expanded.has(g.name)) {
      walk(g.name, 1);
    }
  }

  return rows;
}

/** Format ledger balance for display (period-sensitive; calculated from opening + vouchers in full impl). */
function formatBalance(amount: number, drCr?: 'Dr' | 'Cr'): string {
  const type = drCr ?? 'Dr';
  const abs = Math.abs(amount);
  const str = abs.toLocaleString('en-IN', { maximumFractionDigits: 0 });
  return `₹${str} ${type}`;
}

export function ChartOfAccountsView() {
  const groups = useAppStore((s) => s.groups) ?? [];
  const ledgers = useAppStore((s) => s.mockData?.ledgers) ?? [];
  const setActiveView = useAppStore((s) => s.setActiveView);
  const setGroupFormEditingId = useAppStore((s) => s.setGroupFormEditingId);
  const setGroupFormFromCoA = useAppStore((s) => s.setGroupFormFromCoA);
  const setLedgerFormEditingId = useAppStore((s) => s.setLedgerFormEditingId);
  const setLedgerVouchersLedger = useAppStore((s) => s.setLedgerVouchersLedger);
  const setListOfMastersPopupOpen = useAppStore((s) => s.setListOfMastersPopupOpen);
  const showZeroBalance = useAppStore((s) => s.showZeroBalance);

  const [expanded, setExpanded] = React.useState<Set<string>>(() => {
    const names = (groups ?? []).filter((g) => g.under === 'Primary').map((g) => g.name);
    return new Set(names);
  });
  const showInactive = useAppStore((s) => s.showInactive);
  const setShowInactive = useAppStore((s) => s.setShowInactive);
  const setShowZeroBalance = useAppStore((s) => s.setShowZeroBalance);
  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const filteredLedgers = React.useMemo(
    () =>
      showZeroBalance
        ? ledgers
        : ledgers.filter((l) => l.amount !== 0),
    [ledgers, showZeroBalance]
  );
  const rows = React.useMemo(
    () => buildFlattenedRows(groups, filteredLedgers, expanded, showInactive),
    [groups, filteredLedgers, expanded, showInactive]
  );

  const toggleExpand = (name: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  };

  // Enter / Alt+Enter: on group → Group Alteration; on ledger → Ledger Alteration (Alter) or drill
  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' && !(e.key === 'Enter' && e.altKey)) return;
      const row = rows[selectedIndex];
      if (!row) return;
      const target = e.target as HTMLElement;
      if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;
      e.preventDefault();
      if (row.type === 'group') {
        setGroupFormEditingId(row.id);
        setGroupFormFromCoA(true);
        setActiveView('group-creation');
      } else if (row.type === 'ledger') {
        setLedgerFormEditingId(row.id);
        setActiveView('ledger-creation');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [rows, selectedIndex, setGroupFormEditingId, setGroupFormFromCoA, setLedgerFormEditingId, setActiveView]);

  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-white rounded border border-[#D0D0D0]">
      <div className="flex-shrink-0 p-4 pb-2">
        <div className="text-[14px] font-bold text-[#7F1D1D] mb-4">
          Chart of Accounts
        </div>
        <p className="text-[10px] text-gray-600 mb-3">
          Enter / Alt+Enter: Alter selected Group or Ledger. Double-click Ledger: Ledger Vouchers. Esc: Gateway.
        </p>
        <div className="flex items-center gap-4 mb-3 text-[10px] flex-wrap">
          <button
            type="button"
            className="px-2 py-1.5 rounded border border-[#D0D0D0] bg-white hover:bg-[#E8E8E8] text-[#7F1D1D] font-medium"
            onClick={() => setListOfMastersPopupOpen(true)}
          >
            List of Masters
          </button>
          <button
            type="button"
            className="px-2 py-1.5 rounded border border-[#D0D0D0] bg-white hover:bg-[#E8E8E8] text-[#7F1D1D] font-medium"
            onClick={() => setActiveView('cost-centres')}
          >
            Cost Centres
          </button>
          <button
            type="button"
            className="px-2 py-1.5 rounded border border-[#D0D0D0] bg-white hover:bg-[#E8E8E8] text-[#7F1D1D] font-medium"
            onClick={() => setActiveView('currencies-list')}
          >
            Currencies
          </button>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => setShowInactive(e.target.checked)}
              className="border border-[#D0D0D0]"
            />
            Show Inactive
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showZeroBalance}
              onChange={(e) => setShowZeroBalance(e.target.checked)}
              className="border border-[#D0D0D0]"
            />
            Show Zero Balance
          </label>
        </div>
      </div>
      <div className="flex-1 min-h-0 flex flex-col px-4 pb-2">
        <ScrollArea className="flex-1 min-h-0 border border-[#D0D0D0] rounded overflow-auto bg-white">
          <div className="p-2 space-y-0.5">
            <div className="flex items-center gap-1 py-1.5 px-1 text-[10px] font-semibold text-[#7F1D1D] border-b border-[#E0E0E0] mb-1">
              <span className="truncate min-w-0 flex-1">Name</span>
              <span className="w-[120px] shrink-0">Under</span>
              <span className="w-[100px] shrink-0 text-right">Balance</span>
            </div>
            {rows.length === 0 ? (
              <p className="text-[11px] text-gray-500 px-3 py-2">No accounts. Create groups and ledgers from Gateway → Create.</p>
            ) : (
              rows.map((row, i) => {
                const isGroup = row.type === 'group';
                const hasChildren =
                  isGroup &&
                  (groups.some((g) => g.under === row.name) || ledgers.some((l) => l.under === row.name));
                const isExpanded = isGroup && expanded.has(row.name);
                const isSelected = i === selectedIndex;
                return (
                  <button
                    key={row.type === 'group' ? `g-${row.id}` : `l-${row.id}`}
                    type="button"
                    className={`tally-list-item w-full text-left flex items-center gap-1 py-1.5 rounded border border-transparent hover:border-[#D0D0D0] text-[11px] ${
                      isSelected ? 'tally-selected font-medium border-[#D0D0D0] bg-[#E8E8E8]' : ''
                    } ${row.inactive ? 'text-gray-500 italic' : ''}`}
                    style={{ paddingLeft: `${12 + row.depth * 16}px` }}
                    data-selected={isSelected ? 'true' : undefined}
                    onClick={() => setSelectedIndex(i)}
                    onDoubleClick={() => {
                      setSelectedIndex(i);
                      if (row.type === 'group') {
                        if (hasChildren) {
                          toggleExpand(row.name);
                        } else {
                          setGroupFormEditingId(row.id);
                          setGroupFormFromCoA(true);
                          setActiveView('group-creation');
                        }
                      } else if (row.type === 'ledger') {
                        setLedgerVouchersLedger({ id: row.id, name: row.name });
                        setActiveView('ledger-vouchers');
                      }
                    }}
                  >
                    {isGroup && hasChildren ? (
                      isExpanded ? (
                        <ChevronDown className="w-3 h-3 flex-shrink-0 text-gray-600" />
                      ) : (
                        <ChevronRight className="w-3 h-3 flex-shrink-0 text-gray-600" />
                      )
                    ) : (
                      <span className="w-3 flex-shrink-0" />
                    )}
                    <span className="truncate min-w-0 flex-1">{row.name}</span>
                    {row.type === 'ledger' && (
                      <>
                        {row.under && (
                          <span className="text-[10px] text-gray-500 truncate w-[120px] shrink-0" title={row.under}>
                            {row.under}
                          </span>
                        )}
                        <span className="text-[10px] text-right tabular-nums w-[100px] shrink-0" title="Balance">
                          {formatBalance(row.amount ?? 0, row.openingBalanceType)}
                        </span>
                      </>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </ScrollArea>
      </div>
      <div className="flex-shrink-0 px-4 pb-2 mt-2 text-[10px] text-gray-500 border-t border-[#E0E0E0] pt-2">
        ↑↓ Move · Enter / Alt+Enter: Alter · Double-click Ledger: Ledger Vouchers · Esc: Gateway
      </div>
    </div>
  );
}
