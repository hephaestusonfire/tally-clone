import * as React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../ui/button';

/** Create/Alter Cost Centre. No balance. Quit → cost-centres. */
export function CostCentreCreationView() {
  const costCentres = useAppStore((s) => s.costCentres);
  const costCentreFormEditingId = useAppStore((s) => s.costCentreFormEditingId);
  const setCostCentreFormEditingId = useAppStore((s) => s.setCostCentreFormEditingId);
  const addCostCentre = useAppStore((s) => s.addCostCentre);
  const updateCostCentre = useAppStore((s) => s.updateCostCentre);
  const setActiveView = useAppStore((s) => s.setActiveView);

  const editing = React.useMemo(
    () => (costCentreFormEditingId != null ? costCentres.find((c) => c.id === costCentreFormEditingId) ?? null : null),
    [costCentreFormEditingId, costCentres]
  );
  const isAlter = !!editing;

  const [name, setName] = React.useState('');
  const [under, setUnder] = React.useState('Primary');
  const [inactive, setInactive] = React.useState(false);

  React.useEffect(() => {
    if (editing) {
      setName(editing.name);
      setUnder(editing.under);
      setInactive(editing.inactive ?? false);
    } else {
      setName('');
      setUnder('Primary');
      setInactive(false);
    }
  }, [editing?.id]);

  const parentOptions = React.useMemo(
    () => [...new Set(['Primary', ...costCentres.map((c) => c.name)])],
    [costCentres]
  );

  const handleQuit = () => {
    setCostCentreFormEditingId(null);
    setActiveView('cost-centres');
  };

  const handleAccept = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    if (editing) {
      updateCostCentre({ ...editing, name: trimmed, under, inactive });
    } else {
      addCostCentre({ name: trimmed, under, inactive });
    }
    handleQuit();
  };

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        handleQuit();
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
    <div className="flex flex-col h-full overflow-auto bg-white p-4 max-w-xl">
      <div className="text-[14px] font-bold text-[#7F1D1D] mb-4">
        {isAlter ? 'Cost Centre Alteration' : 'Cost Centre Creation'}
      </div>
      <p className="text-[10px] text-gray-600 mb-3">
        Cost Centres are analytical (no balance). Used in vouchers and reports only.
      </p>
      <div className="space-y-4 text-[11px]">
        <div>
          <label className="block text-[10px] font-medium text-gray-600 mb-1">Name *</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border border-[#D0D0D0] px-2 py-1.5 w-full"
            placeholder="Cost Centre name"
          />
        </div>
        <div>
          <label className="block text-[10px] font-medium text-gray-600 mb-1">Under</label>
          <select
            value={under}
            onChange={(e) => setUnder(e.target.value)}
            className="border border-[#D0D0D0] px-2 py-1.5 w-full bg-white"
          >
            {parentOptions.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
        <label className="flex items-center gap-2 cursor-pointer text-[10px]">
          <input type="checkbox" checked={inactive} onChange={(e) => setInactive(e.target.checked)} />
          Inactive
        </label>
      </div>
      <div className="flex gap-2 mt-4">
        <Button size="sm" className="bg-[#DC2626] text-white text-[11px]" onClick={handleAccept}>
          Accept (Ctrl+A)
        </Button>
        <Button size="sm" variant="outline" onClick={handleQuit}>
          Quit (Esc)
        </Button>
      </div>
    </div>
  );
}
