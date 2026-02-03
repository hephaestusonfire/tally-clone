import * as React from 'react';
import {
  useAppStore,
  type GstRegistration,
  type GstRegistrationType,
  type Gstr1Periodicity,
  type GstModeOfFiling,
} from '../../store/useAppStore';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

const REGISTRATION_TYPES: GstRegistrationType[] = ['Regular', 'Composition', 'Unregistered'];
const GSTR1_PERIODICITY: Gstr1Periodicity[] = ['Monthly', 'Quarterly'];
const MODE_OF_FILING: GstModeOfFiling[] = ['Not Applicable', 'Online', 'Offline'];

const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Puducherry',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Andaman and Nicobar Islands',
  'Lakshadweep',
];

export function GstRegistrationCreationView() {
  const gstRegistrations = useAppStore((s) => s.gstRegistrations);
  const gstRegistrationFormEditingId = useAppStore((s) => s.gstRegistrationFormEditingId);
  const setGstRegistrationFormEditingId = useAppStore((s) => s.setGstRegistrationFormEditingId);
  const addGstRegistration = useAppStore((s) => s.addGstRegistration);
  const updateGstRegistration = useAppStore((s) => s.updateGstRegistration);
  const deleteGstRegistration = useAppStore((s) => s.deleteGstRegistration);
  const canDeleteGstRegistration = useAppStore((s) => s.canDeleteGstRegistration);
  const setDefaultGstRegistration = useAppStore((s) => s.setDefaultGstRegistration);
  const setActiveView = useAppStore((s) => s.setActiveView);

  const [active, setActive] = React.useState(true);
  const [state, setState] = React.useState('Maharashtra');
  const [registrationType, setRegistrationType] = React.useState<GstRegistrationType>('Regular');
  const [assesseeOfOtherTerritory, setAssesseeOfOtherTerritory] = React.useState(false);
  const [gstinUin, setGstinUin] = React.useState('');
  const [gstr1Periodicity, setGstr1Periodicity] = React.useState<Gstr1Periodicity>('Monthly');
  const [eWayBillApplicable, setEWayBillApplicable] = React.useState(true);
  const [eWayBillApplicableFrom, setEWayBillApplicableFrom] = React.useState('');
  const [eWayBillApplicableForIntrastate, setEWayBillApplicableForIntrastate] = React.useState(true);
  const [gstUsername, setGstUsername] = React.useState('');
  const [modeOfFiling, setModeOfFiling] = React.useState<GstModeOfFiling>('Not Applicable');
  const [eInvoiceApplicable, setEInvoiceApplicable] = React.useState(false);
  const [isDefault, setIsDefault] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const stateInputRef = React.useRef<HTMLSelectElement>(null);

  const editing = React.useMemo(
    () =>
      gstRegistrationFormEditingId != null
        ? gstRegistrations.find((r) => r.id === gstRegistrationFormEditingId) ?? null
        : null,
    [gstRegistrationFormEditingId, gstRegistrations]
  );
  const isAlter = !!editing;

  React.useEffect(() => {
    if (editing) {
      setActive(editing.active);
      setState(editing.state);
      setRegistrationType(editing.registrationType);
      setAssesseeOfOtherTerritory(editing.assesseeOfOtherTerritory);
      setGstinUin(editing.gstinUin ?? '');
      setGstr1Periodicity(editing.gstr1Periodicity);
      setEWayBillApplicable(editing.eWayBillApplicable);
      setEWayBillApplicableFrom(editing.eWayBillApplicableFrom ?? '');
      setEWayBillApplicableForIntrastate(editing.eWayBillApplicableForIntrastate);
      setGstUsername(editing.gstUsername ?? '');
      setModeOfFiling(editing.modeOfFiling);
      setEInvoiceApplicable(editing.eInvoiceApplicable);
      setIsDefault(editing.isDefault);
    } else {
      setActive(true);
      setState('Maharashtra');
      setRegistrationType('Regular');
      setAssesseeOfOtherTerritory(false);
      setGstinUin('');
      setGstr1Periodicity('Monthly');
      setEWayBillApplicable(true);
      setEWayBillApplicableFrom('');
      setEWayBillApplicableForIntrastate(true);
      setGstUsername('');
      setModeOfFiling('Not Applicable');
      setEInvoiceApplicable(false);
      setIsDefault(gstRegistrations.length === 0);
    }
    setError(null);
    setTimeout(() => stateInputRef.current?.focus(), 0);
  }, [editing?.id, gstRegistrations.length]);

  const handleQuit = () => {
    setGstRegistrationFormEditingId(null);
    setActiveView(isAlter ? 'master-alteration' : 'master-creation');
  };

  const handleAccept = () => {
    setError(null);
    const trimmedState = state.trim();
    if (!trimmedState) {
      setError('State is required');
      stateInputRef.current?.focus();
      return;
    }
    const payload: Omit<GstRegistration, 'id'> = {
      active,
      state: trimmedState,
      registrationType,
      assesseeOfOtherTerritory,
      gstinUin: gstinUin.trim() || undefined,
      gstr1Periodicity,
      eWayBillApplicable,
      eWayBillApplicableFrom: eWayBillApplicableFrom.trim() || undefined,
      eWayBillApplicableForIntrastate,
      gstUsername: gstUsername.trim() || undefined,
      modeOfFiling,
      eInvoiceApplicable,
      isDefault,
    };
    if (editing) {
      updateGstRegistration({ ...editing, ...payload });
    } else {
      addGstRegistration({ ...payload, isDefault: gstRegistrations.length === 0 ? true : isDefault });
    }
    handleQuit();
  };

  const handleDelete = () => {
    if (!editing) return;
    if (!canDeleteGstRegistration(editing.id)) {
      setError('Cannot delete: Only one registration remains, or registration is in use.');
      return;
    }
    deleteGstRegistration(editing.id);
    handleQuit();
  };

  const handleSetDefault = () => {
    if (!editing) return;
    setDefaultGstRegistration(editing.id);
    setIsDefault(true);
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
        handleDelete();
        return;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [editing, state]);

  const allowDelete = isAlter && editing && canDeleteGstRegistration(editing.id);

  return (
    <div className="flex h-full overflow-hidden bg-white">
      <ScrollArea className="flex-1 min-w-0 p-4">
        <div className="text-[14px] font-bold text-[#7F1D1D] mb-4">
          {isAlter ? 'GST Registration Alteration' : 'GST Registration Creation'}
        </div>

        <p className="text-[10px] text-gray-600 mb-3">
          Multiple GST registrations allowed per company. One must be default. Drives voucher GST logic, returns, and e-Way Bill.
        </p>

        <div className="space-y-4 max-w-xl text-[11px]">
          <div className="border-t border-[#E0E0E0] pt-3">
            <div className="text-[10px] font-semibold text-gray-700 mb-2">Registration Status</div>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="active" checked={active} onChange={() => setActive(true)} />
                Active
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" name="active" checked={!active} onChange={() => setActive(false)} />
                Inactive
              </label>
            </div>
          </div>

          <div className="border-t border-[#E0E0E0] pt-3">
            <div className="text-[10px] font-semibold text-gray-700 mb-2">GST Registration Details</div>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-medium text-gray-600 mb-1">State *</label>
                <select
                  ref={stateInputRef}
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="border border-[#D0D0D0] px-2 py-1.5 w-full bg-white"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-600 mb-1">Registration Type</label>
                <select
                  value={registrationType}
                  onChange={(e) => setRegistrationType(e.target.value as GstRegistrationType)}
                  className="border border-[#D0D0D0] px-2 py-1.5 w-full bg-white"
                >
                  {REGISTRATION_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={assesseeOfOtherTerritory}
                  onChange={(e) => setAssesseeOfOtherTerritory(e.target.checked)}
                />
                Assessee of Other Territory
              </label>
              <div>
                <label className="block text-[10px] font-medium text-gray-600 mb-1">GSTIN / UIN</label>
                <input
                  type="text"
                  value={gstinUin}
                  onChange={(e) => setGstinUin(e.target.value)}
                  className="border border-[#D0D0D0] px-2 py-1.5 w-full"
                  placeholder="e.g. 27AAAAA0000A1Z5"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-600 mb-1">Periodicity of GSTR-1</label>
                <select
                  value={gstr1Periodicity}
                  onChange={(e) => setGstr1Periodicity(e.target.value as Gstr1Periodicity)}
                  className="border border-[#D0D0D0] px-2 py-1.5 w-full bg-white"
                >
                  {GSTR1_PERIODICITY.map((p) => (
                    <option key={p} value={p}>
                      {p}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-[#E0E0E0] pt-3">
            <div className="text-[10px] font-semibold text-gray-700 mb-2">e-Way Bill Details</div>
            <p className="text-[9px] text-gray-500 mb-2">Affects sales and delivery challans.</p>
            <div className="space-y-3">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={eWayBillApplicable}
                  onChange={(e) => setEWayBillApplicable(e.target.checked)}
                />
                e-Way Bill applicable
              </label>
              <div>
                <label className="block text-[10px] font-medium text-gray-600 mb-1">Applicable from (date)</label>
                <input
                  type="text"
                  value={eWayBillApplicableFrom}
                  onChange={(e) => setEWayBillApplicableFrom(e.target.value)}
                  className="border border-[#D0D0D0] px-2 py-1.5 w-32"
                  placeholder="DD-MM-YYYY"
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={eWayBillApplicableForIntrastate}
                  onChange={(e) => setEWayBillApplicableForIntrastate(e.target.checked)}
                />
                Applicable for intrastate
              </label>
            </div>
          </div>

          <div className="border-t border-[#E0E0E0] pt-3">
            <div className="text-[10px] font-semibold text-gray-700 mb-2">Connected GST Details (API placeholders)</div>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-medium text-gray-600 mb-1">GST Username</label>
                <input
                  type="text"
                  value={gstUsername}
                  onChange={(e) => setGstUsername(e.target.value)}
                  className="border border-[#D0D0D0] px-2 py-1.5 w-full"
                  placeholder="API placeholder"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-600 mb-1">Mode of Filing</label>
                <select
                  value={modeOfFiling}
                  onChange={(e) => setModeOfFiling(e.target.value as GstModeOfFiling)}
                  className="border border-[#D0D0D0] px-2 py-1.5 w-full bg-white"
                >
                  {MODE_OF_FILING.map((m) => (
                    <option key={m} value={m}>
                      {m}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="border-t border-[#E0E0E0] pt-3">
            <div className="text-[10px] font-semibold text-gray-700 mb-2">e-Invoice Details</div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={eInvoiceApplicable}
                onChange={(e) => setEInvoiceApplicable(e.target.checked)}
              />
              e-Invoicing applicable
            </label>
            <p className="text-[9px] text-gray-500 mt-0.5">Enable only if turnover threshold crossed.</p>
          </div>

          <div className="border-t border-[#E0E0E0] pt-3">
            <div className="text-[10px] font-semibold text-gray-700 mb-2">Default Registration</div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                disabled={isAlter && editing?.isDefault}
              />
              Set as default (one per company)
            </label>
            {isAlter && editing?.isDefault && (
              <p className="text-[9px] text-amber-700 mt-0.5">Use &quot;Set as default&quot; on another registration to change.</p>
            )}
          </div>

          {error && <p className="text-[10px] text-red-600">{error}</p>}
        </div>

        <div className="flex gap-2 mt-4 flex-wrap">
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
          {isAlter && editing && !editing.isDefault && (
            <Button size="sm" variant="outline" onClick={handleSetDefault}>
              Set as default
            </Button>
          )}
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
