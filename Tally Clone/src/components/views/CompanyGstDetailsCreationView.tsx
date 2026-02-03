import * as React from 'react';
import { useAppStore, type CompanyGstDetails } from '../../store/useAppStore';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

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

const defaultCompanyGstDetails: CompanyGstDetails = {
  enableGst: true,
  setGstRegistrationDetails: true,
  defaultGstRegistrationId: undefined,
  gstApplicableFrom: '',
  country: 'India',
  state: 'Maharashtra',
};

export function CompanyGstDetailsCreationView() {
  const companyGstDetails = useAppStore((s) => s.companyGstDetails);
  const gstRegistrations = useAppStore((s) => s.gstRegistrations);
  const setCompanyGstDetails = useAppStore((s) => s.setCompanyGstDetails);
  const setActiveView = useAppStore((s) => s.setActiveView);

  const [enableGst, setEnableGst] = React.useState(true);
  const [setGstRegistrationDetails, setSetGstRegistrationDetails] = React.useState(true);
  const [defaultGstRegistrationId, setDefaultGstRegistrationId] = React.useState<number | ''>('');
  const [gstApplicableFrom, setGstApplicableFrom] = React.useState('');
  const [country, setCountry] = React.useState('India');
  const [state, setState] = React.useState('Maharashtra');

  React.useEffect(() => {
    const src = companyGstDetails ?? defaultCompanyGstDetails;
    setEnableGst(src.enableGst);
    setSetGstRegistrationDetails(src.setGstRegistrationDetails);
    setDefaultGstRegistrationId(src.defaultGstRegistrationId ?? '');
    setGstApplicableFrom(src.gstApplicableFrom ?? '');
    setCountry(src.country ?? 'India');
    setState(src.state ?? 'Maharashtra');
  }, [companyGstDetails]);

  const handleQuit = () => {
    setActiveView('statutory-details');
  };

  const handleAccept = () => {
    const defaultId =
      defaultGstRegistrationId === '' ? undefined : (defaultGstRegistrationId as number);
    setCompanyGstDetails({
      enableGst,
      setGstRegistrationDetails,
      defaultGstRegistrationId: defaultId,
      gstApplicableFrom: gstApplicableFrom.trim() || undefined,
      country: country.trim() || undefined,
      state: state.trim() || undefined,
    });
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
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [enableGst, setGstRegistrationDetails, defaultGstRegistrationId, gstApplicableFrom, country, state]);

  return (
    <div className="flex h-full overflow-hidden bg-white">
      <ScrollArea className="flex-1 min-w-0 p-4">
        <div className="text-[14px] font-bold text-[#7F1D1D] mb-4">
          Company GST Details
        </div>
        <p className="text-[10px] text-gray-600 mb-3">
          Global GST switch. When GST = No, GST fields are hidden everywhere. When GST = Yes, GST Registration, Classification and Rates are enabled.
        </p>

        <div className="space-y-4 max-w-xl">
          <div>
            <label className="block text-[10px] font-medium text-gray-600 mb-1">Enable GST</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="enableGst"
                  checked={enableGst === true}
                  onChange={() => setEnableGst(true)}
                />
                <span className="text-[11px]">Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="enableGst"
                  checked={enableGst === false}
                  onChange={() => setEnableGst(false)}
                />
                <span className="text-[11px]">No</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-medium text-gray-600 mb-1">Set GST Registration Details</label>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="setGstReg"
                  checked={setGstRegistrationDetails === true}
                  onChange={() => setSetGstRegistrationDetails(true)}
                />
                <span className="text-[11px]">Yes</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="setGstReg"
                  checked={setGstRegistrationDetails === false}
                  onChange={() => setSetGstRegistrationDetails(false)}
                />
                <span className="text-[11px]">No</span>
              </label>
            </div>
          </div>

          {gstRegistrations.length > 0 && (
            <div>
              <label className="block text-[10px] font-medium text-gray-600 mb-1">Default GST Registration</label>
              <select
                value={defaultGstRegistrationId === '' ? '' : defaultGstRegistrationId}
                onChange={(e) =>
                  setDefaultGstRegistrationId(e.target.value === '' ? '' : Number(e.target.value))
                }
                className="border border-[#D0D0D0] px-2 py-1.5 w-full bg-white text-[11px]"
              >
                <option value="">-- None --</option>
                {gstRegistrations.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.state}
                    {r.isDefault ? ' (Default)' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className="border-t border-[#E0E0E0] pt-3">
            <div className="text-[10px] font-semibold text-gray-700 mb-2">Additional Details</div>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-medium text-gray-600 mb-1">GST Applicable From</label>
                <input
                  type="date"
                  value={gstApplicableFrom}
                  onChange={(e) => setGstApplicableFrom(e.target.value)}
                  className="border border-[#D0D0D0] px-2 py-1.5 w-40 text-[11px]"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-600 mb-1">Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="border border-[#D0D0D0] px-2 py-1.5 w-full text-[11px]"
                  placeholder="e.g. India"
                />
              </div>
              <div>
                <label className="block text-[10px] font-medium text-gray-600 mb-1">State</label>
                <select
                  value={state}
                  onChange={(e) => setState(e.target.value)}
                  className="border border-[#D0D0D0] px-2 py-1.5 w-full bg-white text-[11px]"
                >
                  {INDIAN_STATES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
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
