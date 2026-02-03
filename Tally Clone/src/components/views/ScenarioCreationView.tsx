import * as React from 'react';
import { useAppStore, type ScenarioMaster } from '../../store/useAppStore';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

export function ScenarioCreationView() {
  const scenarios = useAppStore((s) => s.scenarios);
  const scenarioFormEditingId = useAppStore((s) => s.scenarioFormEditingId);
  const setScenarioFormEditingId = useAppStore((s) => s.setScenarioFormEditingId);
  const addScenario = useAppStore((s) => s.addScenario);
  const updateScenario = useAppStore((s) => s.updateScenario);
  const deleteScenario = useAppStore((s) => s.deleteScenario);
  const isScenarioNameUnique = useAppStore((s) => s.isScenarioNameUnique);
  const canDeleteScenario = useAppStore((s) => s.canDeleteScenario);
  const setActiveView = useAppStore((s) => s.setActiveView);

  const [name, setName] = React.useState('');
  const [includeOptionalVouchers, setIncludeOptionalVouchers] = React.useState(true);
  const [inactive, setInactive] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const nameInputRef = React.useRef<HTMLInputElement>(null);

  const editing = React.useMemo(
    () =>
      scenarioFormEditingId != null
        ? scenarios.find((s) => s.id === scenarioFormEditingId) ?? null
        : null,
    [scenarioFormEditingId, scenarios]
  );
  const isAlter = !!editing;

  React.useEffect(() => {
    if (editing) {
      setName(editing.name);
      setIncludeOptionalVouchers(editing.includeOptionalVouchers);
      setInactive(!!editing.inactive);
    } else {
      setName('');
      setIncludeOptionalVouchers(true);
      setInactive(false);
    }
    setError(null);
    setTimeout(() => nameInputRef.current?.focus(), 0);
  }, [editing?.id]);

  const handleQuit = () => {
    setScenarioFormEditingId(null);
    setActiveView(isAlter ? 'master-alteration' : 'master-creation');
  };

  const handleAccept = () => {
    setError(null);
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Scenario Name is required');
      nameInputRef.current?.focus();
      return;
    }
    if (!isScenarioNameUnique(trimmedName, editing?.id)) {
      setError('Scenario name must be unique');
      nameInputRef.current?.focus();
      return;
    }
    const payload: Omit<ScenarioMaster, 'id'> = {
      name: trimmedName,
      includeOptionalVouchers,
      inactive,
    };
    if (editing) {
      updateScenario({ ...editing, ...payload });
    } else {
      addScenario(payload);
    }
    handleQuit();
  };

  const handleDelete = () => {
    if (!editing) return;
    if (!canDeleteScenario(editing.id)) {
      setError('Cannot delete this Scenario');
      return;
    }
    deleteScenario(editing.id);
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
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
        e.preventDefault();
        if (isAlter && editing) handleDelete();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [editing, name, includeOptionalVouchers, inactive]);

  const allowDelete = isAlter && !!editing && canDeleteScenario(editing.id);

  return (
    <div className="flex h-full overflow-hidden bg-white">
      <ScrollArea className="flex-1 min-w-0 p-4">
        <div className="text-[14px] font-bold text-[#7F1D1D] mb-4">
          {isAlter ? 'Scenario Alteration' : 'Scenario Creation'}
        </div>

        <div className="space-y-3 max-w-xl text-[11px]">
          <div>
            <label className="block text-[10px] font-medium text-gray-600 mb-1">
              Scenario Name *
            </label>
            <input
              ref={nameInputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-[#D0D0D0] px-2 py-1.5 w-full"
              placeholder="e.g. Provisional Entries"
            />
          </div>

          <div className="border-t border-[#E0E0E0] pt-3 mt-2">
            <div className="text-[10px] font-semibold text-gray-700 mb-2">
              Voucher Inclusion
            </div>
            <p className="text-[10px] text-gray-500 mb-1">
              Include optional vouchers in this Scenario?
            </p>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="includeOptional"
                  checked={includeOptionalVouchers}
                  onChange={() => setIncludeOptionalVouchers(true)}
                />
                Yes
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="radio"
                  name="includeOptional"
                  checked={!includeOptionalVouchers}
                  onChange={() => setIncludeOptionalVouchers(false)}
                />
                No
              </label>
            </div>
          </div>

          <div className="border-t border-[#E0E0E0] pt-3 mt-2">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={inactive}
                onChange={(e) => setInactive(e.target.checked)}
              />
              Inactive
            </label>
          </div>

          {error && <p className="text-[10px] text-red-600">{error}</p>}
        </div>

        <div className="flex gap-2 mt-4">
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

