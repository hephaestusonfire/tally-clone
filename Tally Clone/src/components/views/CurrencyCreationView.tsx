import * as React from 'react';
import { useAppStore, type Currency } from '../../store/useAppStore';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

const DECIMAL_SYMBOLS = ['.', ',', "'"];
const DEFAULT_DECIMAL_PLACES = 2;

export function CurrencyCreationView() {
  const currencies = useAppStore((s) => s.currencies);
  const currencyFormEditingId = useAppStore((s) => s.currencyFormEditingId);
  const setCurrencyFormEditingId = useAppStore((s) => s.setCurrencyFormEditingId);
  const addCurrency = useAppStore((s) => s.addCurrency);
  const updateCurrency = useAppStore((s) => s.updateCurrency);
  const deleteCurrency = useAppStore((s) => s.deleteCurrency);
  const canDeleteCurrency = useAppStore((s) => s.canDeleteCurrency);
  const isCurrencySymbolUnique = useAppStore((s) => s.isCurrencySymbolUnique);
  const setActiveView = useAppStore((s) => s.setActiveView);

  const [symbol, setSymbol] = React.useState('');
  const [formalName, setFormalName] = React.useState('');
  const [isoCode, setIsoCode] = React.useState('');
  const [decimalPlaces, setDecimalPlaces] = React.useState(DEFAULT_DECIMAL_PLACES);
  const [decimalSymbol, setDecimalSymbol] = React.useState('.');
  const [amountInWordsSingular, setAmountInWordsSingular] = React.useState('');
  const [amountInWordsPlural, setAmountInWordsPlural] = React.useState('');
  const [isBase, setIsBase] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const symbolInputRef = React.useRef<HTMLInputElement>(null);

  const editingCurrency = React.useMemo(
    () => (currencyFormEditingId != null ? currencies.find((c) => c.id === currencyFormEditingId) : null),
    [currencyFormEditingId, currencies]
  );
  const isAlter = !!editingCurrency;
  const baseCurrency = React.useMemo(() => currencies.find((c) => c.isBase) ?? null, [currencies]);

  React.useEffect(() => {
    if (editingCurrency) {
      setSymbol(editingCurrency.symbol);
      setFormalName(editingCurrency.formalName);
      setIsoCode(editingCurrency.isoCode ?? '');
      setDecimalPlaces(editingCurrency.decimalPlaces);
      setDecimalSymbol(editingCurrency.decimalSymbol);
      setAmountInWordsSingular(editingCurrency.amountInWordsSingular ?? '');
      setAmountInWordsPlural(editingCurrency.amountInWordsPlural ?? '');
      setIsBase(editingCurrency.isBase);
    } else {
      setSymbol('');
      setFormalName('');
      setIsoCode('');
      setDecimalPlaces(DEFAULT_DECIMAL_PLACES);
      setDecimalSymbol('.');
      setAmountInWordsSingular('');
      setAmountInWordsPlural('');
      setIsBase(!baseCurrency);
    }
    setError(null);
    setTimeout(() => symbolInputRef.current?.focus(), 0);
  }, [editingCurrency?.id]);

  const handleQuit = () => {
    setCurrencyFormEditingId(null);
    setActiveView('master-creation');
  };

  const handleAccept = () => {
    setError(null);
    const trimmedSymbol = symbol.trim();
    const trimmedFormal = formalName.trim();
    if (!trimmedSymbol) {
      setError('Symbol is required');
      symbolInputRef.current?.focus();
      return;
    }
    if (!trimmedFormal) {
      setError('Formal Name is required');
      return;
    }
    if (!isCurrencySymbolUnique(trimmedSymbol, editingCurrency?.id)) {
      setError('Currency symbol must be unique');
      symbolInputRef.current?.focus();
      return;
    }
    const payload: Omit<Currency, 'id'> = {
      symbol: trimmedSymbol,
      formalName: trimmedFormal,
      isoCode: isoCode.trim() || undefined,
      decimalPlaces: Math.max(0, Math.min(10, decimalPlaces)),
      decimalSymbol: decimalSymbol || '.',
      amountInWordsSingular: amountInWordsSingular.trim() || undefined,
      amountInWordsPlural: amountInWordsPlural.trim() || undefined,
      isBase: isBase || !baseCurrency,
    };
    if (editingCurrency) {
      updateCurrency({ ...editingCurrency, ...payload });
    } else {
      addCurrency(payload);
    }
    handleQuit();
  };

  const handleDelete = () => {
    if (!editingCurrency) return;
    if (!canDeleteCurrency(editingCurrency.id)) {
      setError('Cannot delete: base currency cannot be deleted, or currency is in use');
      return;
    }
    deleteCurrency(editingCurrency.id);
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
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;
        e.preventDefault();
        handleDelete();
        return;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isAlter, editingCurrency]);

  const allowDelete = isAlter && editingCurrency && canDeleteCurrency(editingCurrency.id);
  const allowSetBase = !baseCurrency || !!editingCurrency;

  return (
    <div className="flex h-full overflow-hidden bg-white">
      <ScrollArea className="flex-1 min-w-0 p-4">
        <div className="text-[14px] font-bold text-[#7F1D1D] mb-4">
          {isAlter ? 'Currency Alteration' : 'Currency Creation'}
        </div>

        <div className="space-y-3 max-w-xl">
          <div>
            <label className="block text-[10px] font-medium text-gray-600 mb-1">Symbol *</label>
            <input
              ref={symbolInputRef}
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="border border-[#D0D0D0] px-2 py-1.5 w-full text-[11px]"
              placeholder="e.g. ₹, $, €"
              maxLength={10}
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-600 mb-1">Formal Name *</label>
            <input
              type="text"
              value={formalName}
              onChange={(e) => setFormalName(e.target.value)}
              className="border border-[#D0D0D0] px-2 py-1.5 w-full text-[11px]"
              placeholder="e.g. Indian Rupee"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-600 mb-1">ISO Code</label>
            <input
              type="text"
              value={isoCode}
              onChange={(e) => setIsoCode(e.target.value)}
              className="border border-[#D0D0D0] px-2 py-1.5 w-full text-[11px]"
              placeholder="e.g. INR, USD"
              maxLength={5}
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-600 mb-1">Number of decimal places</label>
            <input
              type="number"
              min={0}
              max={10}
              value={decimalPlaces}
              onChange={(e) => setDecimalPlaces(Number(e.target.value) || 0)}
              className="border border-[#D0D0D0] px-2 py-1.5 w-24 text-[11px]"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-600 mb-1">Decimal symbol</label>
            <select
              value={decimalSymbol}
              onChange={(e) => setDecimalSymbol(e.target.value)}
              className="border border-[#D0D0D0] px-2 py-1.5 text-[11px] bg-white"
            >
              {DECIMAL_SYMBOLS.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-600 mb-1">Amount in words (singular)</label>
            <input
              type="text"
              value={amountInWordsSingular}
              onChange={(e) => setAmountInWordsSingular(e.target.value)}
              className="border border-[#D0D0D0] px-2 py-1.5 w-full text-[11px]"
              placeholder="e.g. Rupee"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-600 mb-1">Amount in words (plural)</label>
            <input
              type="text"
              value={amountInWordsPlural}
              onChange={(e) => setAmountInWordsPlural(e.target.value)}
              className="border border-[#D0D0D0] px-2 py-1.5 w-full text-[11px]"
              placeholder="e.g. Rupees"
            />
          </div>
          {allowSetBase && (
            <label className="flex items-center gap-2 text-[11px] cursor-pointer">
              <input
                type="checkbox"
                checked={isBase}
                onChange={(e) => setIsBase(e.target.checked)}
                className="border border-[#D0D0D0]"
              />
              Set as base currency (only one per company)
            </label>
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
    </div>
  );
}
