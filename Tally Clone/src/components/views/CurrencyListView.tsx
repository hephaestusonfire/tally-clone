import * as React from 'react';
import { useAppStore, type Currency } from '../../store/useAppStore';
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

/** Gateway → Chart of Accounts → Currencies: list of currencies (Symbol, Formal Name, rate). No Balance column. */
export function CurrencyListView() {
  const currencies = useAppStore((s) => s.currencies);
  const currencyExchangeRates = useAppStore((s) => s.currencyExchangeRates);
  const showInactive = useAppStore((s) => s.showInactive);
  const setActiveView = useAppStore((s) => s.setActiveView);
  const setCurrencyFormEditingId = useAppStore((s) => s.setCurrencyFormEditingId);

  const displayList = React.useMemo(
    () => (showInactive ? currencies : currencies.filter((c) => !c.inactive)),
    [currencies, showInactive]
  );

  const getRate = (c: Currency): number => {
    const r = currencyExchangeRates.find((x) => x.currencyId === c.id);
    return r?.rate ?? 0;
  };

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
        setCurrencyFormEditingId(selected.id);
        setActiveView('currency-creation');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [displayList, selected, setActiveView, setCurrencyFormEditingId]);

  return (
    <div className="flex flex-col h-full overflow-hidden bg-white rounded border border-[#D0D0D0] p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="text-[14px] font-bold text-[#7F1D1D]">Currencies</div>
        <div className="flex gap-2">
          <Button
            size="sm"
            className="bg-[#DC2626] text-white text-[11px]"
            onClick={() => {
              setCurrencyFormEditingId(null);
              setActiveView('currency-creation');
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
                setCurrencyFormEditingId(selected.id);
                setActiveView('currency-creation');
              }}
            >
              Alter
            </Button>
          )}
        </div>
      </div>
      <p className="text-[10px] text-gray-600 mb-3">
        Currencies are used when multi-currency is enabled. No balances. Esc: Back to Chart of Accounts.
      </p>
      <ScrollArea className="flex-1 min-h-0 border border-[#D0D0D0] rounded">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#DC2626] hover:bg-[#DC2626]">
              <TableHead className="text-white text-[10px] w-20">Symbol</TableHead>
              <TableHead className="text-white text-[10px] min-w-[140px]">Formal Name</TableHead>
              <TableHead className="text-white text-[10px] w-16">ISO</TableHead>
              <TableHead className="text-white text-[10px] w-20 text-right">Rate</TableHead>
              <TableHead className="text-white text-[10px] w-14">Base</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayList.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-[11px] text-gray-500 text-center p-4">
                  No currencies. Create from Gateway → Create → Currency.
                </TableCell>
              </TableRow>
            ) : (
              displayList.map((c: Currency, i: number) => (
                <TableRow
                  key={c.id}
                  className={`cursor-pointer ${i === selectedIndex ? 'bg-[#FEF2F2]' : ''}`}
                  onClick={() => setSelectedIndex(i)}
                  onDoubleClick={() => {
                    setCurrencyFormEditingId(c.id);
                    setActiveView('currency-creation');
                  }}
                >
                  <TableCell className="p-1.5 text-[11px] font-medium">{c.symbol}</TableCell>
                  <TableCell className="p-1.5 text-[11px]">{c.formalName}</TableCell>
                  <TableCell className="p-1.5 text-[11px]">{c.isoCode ?? '–'}</TableCell>
                  <TableCell className="p-1.5 text-[11px] text-right tabular-nums">{getRate(c)}</TableCell>
                  <TableCell className="p-1.5 text-[11px]">{c.isBase ? 'Yes' : 'No'}</TableCell>
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
