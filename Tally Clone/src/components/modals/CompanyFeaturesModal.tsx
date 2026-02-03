import { useAppStore } from '../../store/useAppStore';
import { Button } from '../ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

const FEATURE_USE_OPTIONS = ['Statutory GST', 'Optional', 'No'];

export function CompanyFeaturesModal() {
  const isOpen = useAppStore((s) => s.isConfigOpen);
  const close = useAppStore((s) => s.closeConfig);
  const openExchangeRateModal = useAppStore((s) => s.openExchangeRateModal);
  const companyFeatures = useAppStore((s) => s.companyFeatures);
  const toggleFeature = useAppStore((s) => s.toggleFeature);
  const setFeatureUse = useAppStore((s) => s.setFeatureUse);

  const handleExchangeRates = () => {
    close();
    openExchangeRateModal();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-[#808080]/60 text-[11px]">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col rounded-none border border-[#D0D0D0] bg-white shadow-none">
        <div className="border-b border-[#D0D0D0] bg-[#DC2626] px-3 py-2 text-[14px] font-bold text-white">
          Company Features
        </div>
        <div className="flex-1 overflow-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#DC2626] hover:bg-[#DC2626]">
                <TableHead className="border-[#D0D0D0] text-white">
                  Feature
                </TableHead>
                <TableHead className="w-[180px] border-[#D0D0D0] text-right text-white">
                  Use
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {companyFeatures.map((f) => (
                <TableRow key={f.id}>
                  <TableCell className="border-[#D0D0D0]">
                    {f.name}
                  </TableCell>
                  <TableCell className="border-[#D0D0D0] text-right">
                    {f.use !== undefined ? (
                      <select
                        className="ml-auto w-full max-w-[140px] border border-[#D0D0D0] bg-white px-1 py-0.5 text-[10px] text-right"
                        value={f.use}
                        onChange={(e) =>
                          setFeatureUse(f.id, e.target.value)
                        }
                      >
                        {FEATURE_USE_OPTIONS.map((opt) => (
                          <option key={opt} value={opt}>
                            {opt}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <label className="inline-flex cursor-pointer items-center justify-end gap-1">
                        <input
                          type="checkbox"
                          checked={f.enabled}
                          onChange={() => toggleFeature(f.id)}
                          className="h-3 w-3 border border-[#D0D0D0]"
                        />
                        <span>{f.enabled ? 'Yes' : 'No'}</span>
                      </label>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="flex justify-between border-t border-[#D0D0D0] bg-[#F5F5F5] px-3 py-2">
          <Button
            size="sm"
            variant="outline"
            className="text-[11px]"
            onClick={handleExchangeRates}
          >
            Exchange Rates
          </Button>
          <div className="flex gap-2">
            <Button
              size="sm"
              className="bg-[#DC2626] text-white hover:bg-[#B91C1C]"
              onClick={close}
            >
              Accept
            </Button>
            <Button size="sm" variant="outline" onClick={close}>
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
