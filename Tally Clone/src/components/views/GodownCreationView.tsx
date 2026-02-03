import * as React from 'react';
import { useAppStore, type Godown } from '../../store/useAppStore';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

const DEFAULT_UNDER = 'Primary';

export function GodownCreationView() {
  const godowns = useAppStore((s) => s.godowns);
  const godownFormEditingId = useAppStore((s) => s.godownFormEditingId);
  const setGodownFormEditingId = useAppStore((s) => s.setGodownFormEditingId);
  const addGodown = useAppStore((s) => s.addGodown);
  const updateGodown = useAppStore((s) => s.updateGodown);
  const deleteGodown = useAppStore((s) => s.deleteGodown);
  const isGodownNameUnique = useAppStore((s) => s.isGodownNameUnique);
  const canDeleteGodown = useAppStore((s) => s.canDeleteGodown);
  const wouldCreateCircularGodown = useAppStore((s) => s.wouldCreateCircularGodown);
  const getMainLocationGodown = useAppStore((s) => s.getMainLocationGodown);
  const setActiveView = useAppStore((s) => s.setActiveView);

  const [name, setName] = React.useState('');
  const [alias, setAlias] = React.useState('');
  const [under, setUnder] = React.useState(DEFAULT_UNDER);
  const [error, setError] = React.useState<string | null>(null);
  const [guardDismissedToCreate, setGuardDismissedToCreate] = React.useState(false);
  const nameInputRef = React.useRef<HTMLInputElement>(null);

  const mainLocation = React.useMemo(() => getMainLocationGodown(), [getMainLocationGodown]);
  const editing = React.useMemo(
    () =>
      godownFormEditingId != null
        ? godowns.find((g) => g.id === godownFormEditingId) ?? null
        : null,
    [godownFormEditingId, godowns]
  );
  const isAlter = !!editing;
  const showGuardModal = !editing && mainLocation != null && !guardDismissedToCreate;

  React.useEffect(() => {
    if (editing) {
      setName(editing.name);
      setAlias(editing.alias ?? '');
      setUnder(editing.under);
    } else {
      setName('');
      setAlias('');
      setUnder(DEFAULT_UNDER);
    }
    setError(null);
    setTimeout(() => nameInputRef.current?.focus(), 0);
  }, [editing?.id]);

  const handleQuit = () => {
    setGodownFormEditingId(null);
    setGuardDismissedToCreate(false);
    setActiveView(isAlter ? 'master-alteration' : 'master-creation');
  };

  const handleGuardCreateNew = () => {
    setGuardDismissedToCreate(true);
  };

  const handleGuardAlterExisting = () => {
    if (mainLocation) setGodownFormEditingId(mainLocation.id);
  };

  const handleAccept = () => {
    setError(null);
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Name is required');
      nameInputRef.current?.focus();
      return;
    }
    if (!isGodownNameUnique(trimmedName, editing?.id)) {
      setError('Godown name must be unique');
      nameInputRef.current?.focus();
      return;
    }
    const parentName = under.trim() || DEFAULT_UNDER;
    const parentExists = godowns.some((g) => g.name === parentName);
    if (!parentExists) {
      setError('Parent godown (Under) must exist');
      return;
    }
    if (wouldCreateCircularGodown(trimmedName, parentName, editing?.id)) {
      setError('Under would create a circular hierarchy');
      return;
    }
    const payload: Omit<Godown, 'id'> = {
      name: trimmedName,
      alias: alias.trim() || undefined,
      under: parentName,
    };
    if (editing) {
      updateGodown({ ...editing, ...payload });
    } else {
      addGodown(payload);
    }
    handleQuit();
  };

  const handleDelete = () => {
    if (!editing) return;
    if (!canDeleteGodown(editing.id)) {
      setError('Cannot delete: Stock exists in this godown or it has child godowns');
      return;
    }
    deleteGodown(editing.id);
    handleQuit();
  };

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (showGuardModal) {
        if (e.key.toLowerCase() === 'c') {
          e.preventDefault();
          handleGuardCreateNew();
          return;
        }
        if (e.key.toLowerCase() === 'a') {
          e.preventDefault();
          handleGuardAlterExisting();
          return;
        }
        return;
      }
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
  }, [editing, name, under, showGuardModal]);

  const allowDelete = isAlter && editing && canDeleteGodown(editing.id);
  const godownNames = React.useMemo(() => godowns.map((g) => g.name).filter(Boolean), [godowns]);

  return (
    <div className="flex h-full overflow-hidden bg-white">
      {showGuardModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="guard-modal-title"
        >
          <div
            className="bg-white border border-[#D0D0D0] rounded shadow-lg p-4 max-w-md mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <h2 id="guard-modal-title" className="font-semibold text-[12px] text-[#7F1D1D] mb-3">
              Main Location exists by default for the Company.
            </h2>
            <p className="text-[11px] text-gray-600 mb-4">
              Do you want to alter Main Location or create a new Godown?
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                size="sm"
                className="bg-[#DC2626] text-white hover:bg-[#B91C1C] text-[11px]"
                onClick={handleGuardCreateNew}
              >
                C: Create New
              </Button>
              <Button size="sm" variant="outline" onClick={handleGuardAlterExisting}>
                A: Alter Existing
              </Button>
            </div>
          </div>
        </div>
      )}
      <ScrollArea className="flex-1 min-w-0 p-4">
        <div className="text-[14px] font-bold text-[#7F1D1D] mb-4">
          {isAlter ? 'Godown Alteration' : 'Godown Creation'}
        </div>

        <p className="text-[10px] text-gray-600 mb-3">
          Godowns (warehouses) are used for stock movement and location tracking. Supports hierarchy (e.g. Warehouse → Racks). Items can move between godowns via vouchers. Cannot delete if stock exists or if it has child godowns.
        </p>

        <div className="space-y-3 max-w-xl text-[11px]">
          <div>
            <label className="block text-[10px] font-medium text-gray-600 mb-1">Name *</label>
            <input
              ref={nameInputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-[#D0D0D0] px-2 py-1.5 w-full"
              placeholder="Godown name"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-600 mb-1">Alias</label>
            <input
              type="text"
              value={alias}
              onChange={(e) => setAlias(e.target.value)}
              className="border border-[#D0D0D0] px-2 py-1.5 w-full"
              placeholder="Optional alias"
            />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-600 mb-1">Under *</label>
            <select
              value={under}
              onChange={(e) => setUnder(e.target.value)}
              className="border border-[#D0D0D0] px-2 py-1.5 w-full bg-white"
            >
              {godownNames.map((gName) => (
                <option key={gName} value={gName}>
                  {gName}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-gray-500 mt-0.5">Primary or parent godown for hierarchy.</p>
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
