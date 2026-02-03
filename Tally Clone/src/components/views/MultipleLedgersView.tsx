import * as React from 'react';
import { useAppStore, type Ledger } from '../../store/useAppStore';
import { ScrollArea } from '../ui/scroll-area';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { Button } from '../ui/button';

/** Gateway → Create → Multiple Ledgers: grid-style data-entry for creating/altering many ledgers at once. Not a list view. */
export function MultipleLedgersView() {
  const setActiveView = useAppStore((s) => s.setActiveView);
  const groups = useAppStore((s) => s.groups) ?? [];
  const ledgers = useAppStore((s) => s.mockData?.ledgers) ?? [];
  const addLedger = useAppStore((s) => s.addLedger);
  const updateLedger = useAppStore((s) => s.updateLedger);

  const groupNames = React.useMemo(
    () => [...new Set(groups.map((g) => g.name))].sort(),
    [groups]
  );

  const [rows, setRows] = React.useState<{ name: string; under: string; amount: number; drCr: 'Dr' | 'Cr' }[]>([
    { name: '', under: groupNames[0] ?? 'Current Assets', amount: 0, drCr: 'Dr' },
  ]);

  const addRow = () => {
    setRows((r) => [...r, { name: '', under: groupNames[0] ?? 'Current Assets', amount: 0, drCr: 'Dr' }]);
  };

  const updateRow = (index: number, patch: Partial<(typeof rows)[0]>) => {
    setRows((r) => r.map((row, i) => (i === index ? { ...row, ...patch } : row)));
  };

  const handleAccept = () => {
    rows.forEach((row) => {
      const name = row.name.trim();
      if (!name) return;
      const existing = ledgers.find((l) => l.name.toLowerCase() === name.toLowerCase());
      const payload: Omit<Ledger, 'id'> = {
        name,
        under: row.under,
        amount: row.amount,
        openingBalanceType: row.drCr,
      };
      if (existing) {
        updateLedger({ ...existing, ...payload });
      } else {
        addLedger(payload);
      }
    });
    setActiveView('chart-of-accounts');
  };

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setActiveView('chart-of-accounts');
      }
      if (e.ctrlKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        handleAccept();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white rounded border border-[#D0D0D0] p-4">
      <div className="text-[14px] font-bold text-[#7F1D1D] mb-2">
        Multiple Ledgers
      </div>
      <p className="text-[10px] text-gray-600 mb-3">
        Create or alter many ledgers at once. Enter Name, Under, and Opening Balance. Accept saves all rows to Chart of Accounts.
      </p>
      <div className="flex gap-2 mb-3">
        <Button size="sm" variant="outline" className="text-[11px]" onClick={addRow}>
          Add Row
        </Button>
        <Button size="sm" className="bg-[#DC2626] text-white text-[11px]" onClick={handleAccept}>
          Accept (Ctrl+A)
        </Button>
        <Button size="sm" variant="outline" onClick={() => setActiveView('chart-of-accounts')}>
          Quit (Esc)
        </Button>
      </div>
      <ScrollArea className="flex-1 min-h-0 border border-[#D0D0D0] rounded">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#DC2626] hover:bg-[#DC2626]">
              <TableHead className="text-white text-[10px] w-8">#</TableHead>
              <TableHead className="text-white text-[10px] min-w-[200px]">Name</TableHead>
              <TableHead className="text-white text-[10px] min-w-[140px]">Under</TableHead>
              <TableHead className="text-white text-[10px] w-28 text-right">Opening Balance</TableHead>
              <TableHead className="text-white text-[10px] w-16">Dr/Cr</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row, i) => (
              <TableRow key={i} className="border-[#D0D0D0]">
                <TableCell className="p-1 text-[11px]">{i + 1}</TableCell>
                <TableCell className="p-1">
                  <input
                    type="text"
                    value={row.name}
                    onChange={(e) => updateRow(i, { name: e.target.value })}
                    placeholder="Ledger name"
                    className="border border-[#D0D0D0] px-2 py-1 w-full text-[11px]"
                  />
                </TableCell>
                <TableCell className="p-1">
                  <select
                    value={row.under}
                    onChange={(e) => updateRow(i, { under: e.target.value })}
                    className="border border-[#D0D0D0] px-2 py-1 w-full text-[11px] bg-white"
                  >
                    {groupNames.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </TableCell>
                <TableCell className="p-1 text-right">
                  <input
                    type="number"
                    value={row.amount || ''}
                    onChange={(e) => updateRow(i, { amount: Number(e.target.value) || 0 })}
                    className="border border-[#D0D0D0] px-2 py-1 w-full text-[11px] text-right"
                  />
                </TableCell>
                <TableCell className="p-1">
                  <select
                    value={row.drCr}
                    onChange={(e) => updateRow(i, { drCr: e.target.value as 'Dr' | 'Cr' })}
                    className="border border-[#D0D0D0] px-2 py-1 w-full text-[11px] bg-white"
                  >
                    <option value="Dr">Dr</option>
                    <option value="Cr">Cr</option>
                  </select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
      <div className="mt-2 text-[10px] text-gray-500">
        Ctrl+A: Accept · Esc: Quit
      </div>
    </div>
  );
}
