import * as React from 'react';
import { useAppStore, type CostCentre } from '../../store/useAppStore';
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

/** Gateway → Chart of Accounts → Cost Centres: list of cost centres (Name, Under). No Balance column. */
export function CostCentresListView() {
  const costCentres = useAppStore((s) => s.costCentres);
  const showInactive = useAppStore((s) => s.showInactive);
  const setActiveView = useAppStore((s) => s.setActiveView);
  const setCostCentreFormEditingId = useAppStore((s) => s.setCostCentreFormEditingId);

  const displayList = React.useMemo(
    () => (showInactive ? costCentres : costCentres.filter((c) => !c.inactive)),
    [costCentres, showInactive]
  );
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const selected = displayList[selectedIndex] ?? null;

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setActiveView('chart-of-accounts');
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => (i < displayList.length - 1 ? i + 1 : 0));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => (i > 0 ? i - 1 : displayList.length - 1));
      }
      if (e.key === 'Enter' && selected) {
        e.preventDefault();
        setCostCentreFormEditingId(selected.id);
        setActiveView('cost-centre-creation');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [displayList, selected, setActiveView, setCostCentreFormEditingId]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white rounded border border-[#D0D0D0] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[14px] font-bold text-[#7F1D1D]">Cost Centres</div>
        <div className="flex gap-2">
          <Button
            size="sm"
            className="bg-[#DC2626] text-white text-[11px]"
            onClick={() => {
              setCostCentreFormEditingId(null);
              setActiveView('cost-centre-creation');
            }}
          >
            Create
          </Button>
          {selected && (
            <Button
              size="sm"
              variant="outline"
              className="text-[11px]"
              onClick={() => {
                setCostCentreFormEditingId(selected.id);
                setActiveView('cost-centre-creation');
              }}
            >
              Alter
            </Button>
          )}
        </div>
      </div>
      <p className="text-[10px] text-gray-600 mb-3">
        Cost Centres are analytical masters (no balance). Used in vouchers and reports only. Esc: Back to Chart of Accounts.
      </p>
      <ScrollArea className="flex-1 min-h-0 border border-[#D0D0D0] rounded">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#DC2626] hover:bg-[#DC2626]">
              <TableHead className="text-white text-[10px]">Name</TableHead>
              <TableHead className="text-white text-[10px]">Under</TableHead>
              <TableHead className="text-white text-[10px] w-16">Active</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-[11px] text-gray-500 text-center p-4">
                  No cost centres. Create one from Gateway → Create → Cost Centres.
                </TableCell>
              </TableRow>
            ) : (
              displayList.map((c: CostCentre, i: number) => (
                <TableRow
                  key={c.id}
                  className={`cursor-pointer ${i === selectedIndex ? 'bg-[#FEF2F2]' : ''}`}
                  onClick={() => setSelectedIndex(i)}
                  onDoubleClick={() => {
                    setCostCentreFormEditingId(c.id);
                    setActiveView('cost-centre-creation');
                  }}
                >
                  <TableCell className="p-1.5 text-[11px] font-medium">{c.name}</TableCell>
                  <TableCell className="p-1.5 text-[11px]">{c.under}</TableCell>
                  <TableCell className="p-1.5 text-[11px]">{c.inactive ? 'No' : 'Yes'}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </ScrollArea>
      <div className="mt-2 text-[10px] text-gray-500">
        Enter: Alter · Esc: Chart of Accounts
      </div>
    </div>
  );
}
