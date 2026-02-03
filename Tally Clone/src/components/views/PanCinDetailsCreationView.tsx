import * as React from 'react';
import { useAppStore, type CompanyPanCinDetails } from '../../store/useAppStore';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

/** Indian PAN: 5 letters (A–Z) + 4 digits + 1 letter. Exactly 10 characters. */
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;

/** Indian CIN: 21 chars. L/U + 5 digit industry + 2 letter state + 4 digit year + 3 letter type + 6 digit reg no. */
const CIN_REGEX = /^[LU][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}$/;

function validatePan(value: string): string | null {
  const trimmed = value.trim().toUpperCase();
  if (!trimmed) return 'PAN is required';
  if (trimmed.length !== 10) return 'PAN must be exactly 10 characters (5 letters + 4 digits + 1 letter)';
  if (!PAN_REGEX.test(trimmed)) return 'Invalid PAN format. Use e.g. AAAAA9999A';
  return null;
}

function validateCin(value: string): string | null {
  const trimmed = value.trim().toUpperCase();
  if (!trimmed) return null; // CIN optional
  if (trimmed.length !== 21) return 'CIN must be exactly 21 characters when provided';
  if (!CIN_REGEX.test(trimmed)) return 'Invalid CIN format. Use e.g. L01631KA2010PTC096843';
  return null;
}

const defaultCompanyPanCinDetails: CompanyPanCinDetails = {
  pan: undefined,
  cin: undefined,
};

export function PanCinDetailsCreationView() {
  const companyPanCinDetails = useAppStore((s) => s.companyPanCinDetails);
  const setCompanyPanCinDetails = useAppStore((s) => s.setCompanyPanCinDetails);
  const setActiveView = useAppStore((s) => s.setActiveView);

  const [pan, setPan] = React.useState('');
  const [cin, setCin] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const panInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    const src = companyPanCinDetails ?? defaultCompanyPanCinDetails;
    setPan(src.pan ?? '');
    setCin(src.cin ?? '');
    setError(null);
  }, [companyPanCinDetails]);

  const handleQuit = () => {
    setActiveView('statutory-details');
  };

  const handleAccept = () => {
    setError(null);
    const panErr = validatePan(pan);
    if (panErr) {
      setError(panErr);
      panInputRef.current?.focus();
      return;
    }
    const cinErr = validateCin(cin);
    if (cinErr) {
      setError(cinErr);
      return;
    }
    const panVal = pan.trim().toUpperCase() || undefined;
    const cinVal = cin.trim().toUpperCase() || undefined;
    setCompanyPanCinDetails({ pan: panVal, cin: cinVal });
    handleQuit();
  };

  const handlePanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
    setPan(v);
    if (error) setError(null);
  };

  const handleCinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.target.value.toUpperCase().replace(/\s/g, '');
    setCin(v);
    if (error) setError(null);
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
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [pan, cin]);

  return (
    <div className="flex h-full overflow-hidden bg-white">
      <ScrollArea className="flex-1 min-w-0 p-4">
        <div className="text-[14px] font-bold text-[#7F1D1D] mb-4">
          PAN/CIN Details
        </div>
        <p className="text-[10px] text-gray-600 mb-3">
          These details reflect in Invoices, GST returns, and Reports. PAN is required; CIN is optional.
        </p>

        <div className="space-y-4 max-w-xl">
          <div>
            <label className="block text-[10px] font-medium text-gray-600 mb-1">PAN *</label>
            <input
              ref={panInputRef}
              type="text"
              value={pan}
              onChange={handlePanChange}
              maxLength={10}
              placeholder="e.g. AAAAA9999A"
              className="border border-[#D0D0D0] px-2 py-1.5 w-40 text-[11px] uppercase tracking-wider"
              aria-invalid={!!error}
            />
            <p className="text-[9px] text-gray-500 mt-0.5">
              5 letters + 4 digits + 1 letter (10 characters)
            </p>
          </div>

          <div>
            <label className="block text-[10px] font-medium text-gray-600 mb-1">CIN (optional)</label>
            <input
              type="text"
              value={cin}
              onChange={handleCinChange}
              maxLength={21}
              placeholder="e.g. L01631KA2010PTC096843"
              className="border border-[#D0D0D0] px-2 py-1.5 w-full text-[11px] uppercase"
              aria-invalid={!!error}
            />
            <p className="text-[9px] text-gray-500 mt-0.5">
              21 characters. Corporate Identity Number.
            </p>
          </div>

          {error && (
            <p className="text-[11px] text-red-600 font-medium" role="alert">
              {error}
            </p>
          )}
        </div>

        <div className="flex gap-2 mt-4">
          <Button size="sm" onClick={handleAccept} className="text-[11px]">
            Accept (Ctrl+A)
          </Button>
          <Button size="sm" variant="outline" onClick={handleQuit} className="text-[11px]">
            Quit (Esc)
          </Button>
        </div>
      </ScrollArea>
    </div>
  );
}
