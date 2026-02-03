import * as React from 'react';
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

type ViewMode = 'item-wise' | 'group-wise' | 'monthly';

interface StockSummaryRow {
  id: number | string;
  name: string;
  group: string;
  openingQty: number;
  inwards: number;
  outwards: number;
  closingQty: number;
  rate: number;
  value: number;
  unit: string;
  isGroup: boolean;
  valuationMethod?: string;
}

export function StockSummaryView() {
  const stockItems = useAppStore((s) => s.stockItems);
  const stockGroups = useAppStore((s) => s.stockGroups);
  const setActiveView = useAppStore((s) => s.setActiveView);
  const setStockItemFormEditingId = useAppStore((s) => s.setStockItemFormEditingId);

  const [viewMode, setViewMode] = React.useState<ViewMode>('item-wise');
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const [asOnDate, setAsOnDate] = React.useState(() =>
    new Date().toISOString().slice(0, 10)
  );

  const rows = React.useMemo((): StockSummaryRow[] => {
    const itemToRow = (i: (typeof stockItems)[0], inw: number, outw: number) => {
      const open = i.openingQty;
      const close = open + inw - outw;
      const rate = i.rate;
      const value = close * rate || (i.value && close === open ? i.value : 0);
      return {
        id: i.id,
        name: i.name,
        group: i.under,
        openingQty: open,
        inwards: inw,
        outwards: outw,
        closingQty: close,
        rate,
        value,
        unit: i.unit,
        isGroup: false,
        valuationMethod: i.valuationMethod ?? 'FIFO',
      };
    };
    if (viewMode === 'group-wise') {
      return stockGroups.map((g) => {
        const items = stockItems.filter((i) => i.under === g.name);
        const openingQty = items.reduce((s, i) => s + i.openingQty, 0);
        const inwards = 0;
        const outwards = 0;
        const value = items.reduce((s, i) => s + (i.openingQty * i.rate || i.value), 0);
        const rate = openingQty !== 0 ? value / openingQty : 0;
        return {
          id: `g-${g.id}`,
          name: g.name,
          group: g.name,
          openingQty,
          inwards,
          outwards,
          closingQty: openingQty,
          rate,
          value,
          unit: '—',
          isGroup: true,
        };
      });
    }
    return stockItems.map((i) => itemToRow(i, 0, 0));
  }, [stockItems, stockGroups, viewMode]);

  const listRows = rows.filter((r) => !r.isGroup || r.value !== 0 || r.closingQty !== 0);
  const selectedRow = listRows[selectedIndex] ?? null;

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => (i < listRows.length - 1 ? i + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => (i > 0 ? i - 1 : listRows.length - 1));
      } else if (e.key === 'Enter' && selectedRow && !selectedRow.isGroup && typeof selectedRow.id === 'number') {
        e.preventDefault();
        setStockItemFormEditingId(selectedRow.id);
        setActiveView('stock-item-creation');
      } else if (e.key === 'Escape') {
        e.preventDefault();
        setActiveView('gateway');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [listRows.length, selectedRow, setStockItemFormEditingId, setActiveView]);

  const totalValue = listRows.reduce((s, r) => s + r.value, 0);

  return (
    <div className="flex h-full flex-col overflow-auto bg-[#FEF2F2] p-3 sm:p-4">
      <div className="mb-3 flex items-center justify-between gap-2 flex-wrap">
        <div className="text-[14px] font-bold text-[#7F1D1D]">
          Stock Summary
        </div>
        <div className="flex items-center gap-2">
          <label className="text-[10px]">As on</label>
          <input
            type="date"
            className="border border-[#D0D0D0] px-2 py-1 text-[11px] min-h-[44px] sm:min-h-0 touch-manipulation"
            value={asOnDate}
            onChange={(e) => setAsOnDate(e.target.value)}
          />
          <div className="flex gap-1">
            {(['item-wise', 'group-wise', 'monthly'] as ViewMode[]).map((m) => (
              <Button
                key={m}
                type="button"
                size="sm"
                variant={viewMode === m ? 'default' : 'outline'}
                className="text-[10px]"
                onClick={() => setViewMode(m)}
              >
                {m === 'item-wise' ? 'Item-wise' : m === 'group-wise' ? 'Group-wise' : 'Monthly'}
              </Button>
            ))}
          </div>
        </div>
      </div>

      <div className="border border-[#D0D0D0] bg-white flex-1 min-h-0 flex flex-col overflow-x-auto">
        <ScrollArea className="flex-1">
          <Table className="min-w-[600px]">
            <TableHeader>
              <TableRow className="bg-[#DC2626] hover:bg-[#DC2626]">
                <TableHead className="border-[#D0D0D0] text-white text-[11px]">
                  Item / Group
                </TableHead>
                <TableHead className="border-[#D0D0D0] text-white text-[11px]">
                  Group
                </TableHead>
                <TableHead className="border-[#D0D0D0] text-white text-[11px] w-16 text-right">
                  Opening
                </TableHead>
                <TableHead className="border-[#D0D0D0] text-white text-[11px] w-14 text-right">
                  Inwards
                </TableHead>
                <TableHead className="border-[#D0D0D0] text-white text-[11px] w-14 text-right">
                  Outwards
                </TableHead>
                <TableHead className="border-[#D0D0D0] text-white text-[11px] w-16 text-right">
                  Closing
                </TableHead>
                <TableHead className="border-[#D0D0D0] text-white text-[11px] w-14">
                  Unit
                </TableHead>
                <TableHead className="border-[#D0D0D0] text-white text-[11px] w-20 text-right">
                  Rate
                </TableHead>
                <TableHead className="border-[#D0D0D0] text-white text-[11px] w-24 text-right">
                  Value (₹)
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listRows.map((r, idx) => {
                const isSelected = idx === selectedIndex;
                const isNegative = r.closingQty < 0;
                return (
                  <TableRow
                    key={r.id}
                    className={`${isSelected ? 'bg-[#FFD700]' : ''} ${isNegative ? 'bg-red-100' : ''}`}
                  >
                    <TableCell className="border-[#D0D0D0] p-2 text-[11px] font-medium">
                      {r.name}
                      {r.valuationMethod && !r.isGroup && (
                        <span className="ml-1 text-[9px] text-[#666]">({r.valuationMethod})</span>
                      )}
                    </TableCell>
                    <TableCell className="border-[#D0D0D0] p-2 text-[11px] text-[#666]">
                      {r.group}
                    </TableCell>
                    <TableCell className="border-[#D0D0D0] p-2 text-[11px] text-right">
                      {r.openingQty.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="border-[#D0D0D0] p-2 text-[11px] text-right">
                      {r.inwards.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="border-[#D0D0D0] p-2 text-[11px] text-right">
                      {r.outwards.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="border-[#D0D0D0] p-2 text-[11px] text-right">
                      {r.closingQty.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="border-[#D0D0D0] p-2 text-[11px]">
                      {r.unit}
                    </TableCell>
                    <TableCell className="border-[#D0D0D0] p-2 text-[11px] text-right">
                      ₹ {r.rate.toLocaleString('en-IN')}
                    </TableCell>
                    <TableCell className="border-[#D0D0D0] p-2 text-[11px] text-right">
                      ₹ {r.value.toLocaleString('en-IN')}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </ScrollArea>
        <div className="border-t border-[#D0D0D0] bg-[#E8E8E8] px-2 py-1.5 flex justify-end">
          <span className="text-[11px] font-bold">
            Total value: ₹ {totalValue.toLocaleString('en-IN')}
          </span>
        </div>
      </div>
      <div className="mt-2 text-[10px] text-[#666]">
        ↑↓ Select · Enter Drill-down (alter item) · Esc Gateway
      </div>
    </div>
  );
}
