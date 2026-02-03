import * as React from 'react';
import { useAppStore, type InventoryUnit } from '../../store/useAppStore';
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

export function UnitsListView() {
  const inventoryUnits = useAppStore((s) => s.inventoryUnits);
  const showInactive = useAppStore((s) => s.showInactive);
  const setActiveView = useAppStore((s) => s.setActiveView);
  const setUnitFormEditingId = useAppStore((s) => s.setUnitFormEditingId);
  const getUnitUsageCount = useAppStore((s) => s.getUnitUsageCount);
  const setUnitInactive = useAppStore((s) => s.setUnitInactive);
  const canAlterInventoryUnit = useAppStore((s) => s.canAlterInventoryUnit);

  const [selectedIndex, setSelectedIndex] = React.useState(0);

  const displayUnits = React.useMemo(
    () => (showInactive ? inventoryUnits : inventoryUnits.filter((u) => !u.inactive)),
    [inventoryUnits, showInactive]
  );
  const selectedUnit = displayUnits[selectedIndex] ?? null;

  React.useEffect(() => {
    if (selectedIndex >= displayUnits.length && displayUnits.length > 0) {
      setSelectedIndex(displayUnits.length - 1);
    }
  }, [displayUnits.length, selectedIndex]);

  const handleCreate = () => {
    setUnitFormEditingId(null);
    setActiveView('unit-creation');
  };

  const handleAlter = (unit: InventoryUnit) => {
    setUnitFormEditingId(unit.id);
    setActiveView('unit-creation');
  };

  const handleRemove = (unit: InventoryUnit) => {
    setUnitInactive(unit.id, true);
  };

  const handleRestore = (unit: InventoryUnit) => {
    setUnitInactive(unit.id, false);
  };

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setActiveView('master-creation');
        return;
      }
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => (i < displayUnits.length - 1 ? i + 1 : 0));
        return;
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => (i > 0 ? i - 1 : displayUnits.length - 1));
        return;
      }
      if (e.key === 'Enter' && selectedUnit) {
        e.preventDefault();
        handleAlter(selectedUnit);
        return;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [displayUnits, selectedUnit]);

  return (
    <div className="flex flex-col h-full overflow-hidden p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="font-bold text-[14px] text-[#7F1D1D]">Units of Measure</div>
        <div className="flex gap-2">
          <Button size="sm" className="bg-[#DC2626] text-white text-[11px]" onClick={handleCreate}>
            Create
          </Button>
          {selectedUnit && canAlterInventoryUnit(selectedUnit.id) && (
            <Button size="sm" variant="outline" className="text-[11px]" onClick={() => handleAlter(selectedUnit)}>
              Alter
            </Button>
          )}
          {selectedUnit && !selectedUnit.inactive && (
            <Button size="sm" variant="outline" className="text-[11px]" onClick={() => handleRemove(selectedUnit)}>
              Remove (Deactivate)
            </Button>
          )}
          {selectedUnit?.inactive && (
            <Button size="sm" variant="outline" className="text-[11px]" onClick={() => handleRestore(selectedUnit)}>
              Restore
            </Button>
          )}
        </div>
      </div>
      <div className="border border-[#D0D0D0] bg-white flex-1 min-h-0 flex flex-col">
        <ScrollArea className="flex-1">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#DC2626] hover:bg-[#DC2626]">
                <TableHead className="border-[#D0D0D0] text-white text-[10px] w-24">Symbol</TableHead>
                <TableHead className="border-[#D0D0D0] text-white text-[10px] min-w-[120px]">Formal Name</TableHead>
                <TableHead className="border-[#D0D0D0] text-white text-[10px] w-20">Type</TableHead>
                <TableHead className="border-[#D0D0D0] text-white text-[10px] w-16 text-right">Decimal</TableHead>
                <TableHead className="border-[#D0D0D0] text-white text-[10px] w-16">UQC</TableHead>
                <TableHead className="border-[#D0D0D0] text-white text-[10px] w-14 text-right">Usage</TableHead>
                <TableHead className="border-[#D0D0D0] text-white text-[10px] w-16">Active</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayUnits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="border-[#D0D0D0] p-2 text-[11px] text-gray-500 text-center">
                    No units. Create one to get started.
                  </TableCell>
                </TableRow>
              ) : (
                displayUnits.map((u, i) => (
                  <TableRow
                    key={u.id}
                    className={`hover:bg-[#FEF2F2] cursor-pointer ${i === selectedIndex ? 'bg-[#FEF2F2]' : ''}`}
                    onClick={() => setSelectedIndex(i)}
                    onDoubleClick={() => canAlterInventoryUnit(u.id) && handleAlter(u)}
                  >
                    <TableCell className="border-[#D0D0D0] p-1.5 text-[11px] font-medium">{u.symbol}</TableCell>
                    <TableCell className="border-[#D0D0D0] p-1.5 text-[11px]">{u.formalName ?? '–'}</TableCell>
                    <TableCell className="border-[#D0D0D0] p-1.5 text-[11px]">{u.type === 'compound' ? 'Compound' : 'Simple'}</TableCell>
                    <TableCell className="border-[#D0D0D0] p-1.5 text-[11px] text-right">{u.decimalPlaces ?? 0}</TableCell>
                    <TableCell className="border-[#D0D0D0] p-1.5 text-[11px]">{u.uqc ?? '–'}</TableCell>
                    <TableCell className="border-[#D0D0D0] p-1.5 text-[11px] text-right">{getUnitUsageCount(u.id)}</TableCell>
                    <TableCell className="border-[#D0D0D0] p-1.5 text-[11px]">{u.inactive ? 'No' : 'Yes'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
      <div className="mt-2 text-[10px] text-gray-600">
        Enter — Alter selected · Create — New unit · Remove — Deactivate · Restore — Activate · Esc — Back
      </div>
    </div>
  );
}
