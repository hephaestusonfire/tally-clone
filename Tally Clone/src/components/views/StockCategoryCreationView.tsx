import * as React from 'react';
import { useAppStore, type StockCategory } from '../../store/useAppStore';
import { useGatewayStore } from '../../store/useGatewayStore';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

const DEFAULT_UNDER = 'Primary';

export function StockCategoryCreationView() {
  const stockCategories = useAppStore((s) => s.stockCategories);
  const stockCategoryFormEditingId = useAppStore((s) => s.stockCategoryFormEditingId);
  const setStockCategoryFormEditingId = useAppStore((s) => s.setStockCategoryFormEditingId);
  const addStockCategory = useAppStore((s) => s.addStockCategory);
  const updateStockCategory = useAppStore((s) => s.updateStockCategory);
  const deleteStockCategory = useAppStore((s) => s.deleteStockCategory);
  const isStockCategoryNameUnique = useAppStore((s) => s.isStockCategoryNameUnique);
  const canDeleteStockCategory = useAppStore((s) => s.canDeleteStockCategory);
  const wouldCreateCircularStockCategory = useAppStore((s) => s.wouldCreateCircularStockCategory);
  const setActiveView = useAppStore((s) => s.setActiveView);
  const toggleCompanyModal = useAppStore((s) => s.toggleCompanyModal);
  const openDateModal = useGatewayStore((s) => s.openDateModal);

  const [name, setName] = React.useState('');
  const [alias, setAlias] = React.useState('');
  const [under, setUnder] = React.useState(DEFAULT_UNDER);
  const [languageAlias, setLanguageAlias] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [moreDetailsOverlayOpen, setMoreDetailsOverlayOpen] = React.useState(false);
  const [showMoreInOverlay, setShowMoreInOverlay] = React.useState(false);
  const nameInputRef = React.useRef<HTMLInputElement>(null);

  const editing = React.useMemo(
    () =>
      stockCategoryFormEditingId != null
        ? stockCategories.find((c) => c.id === stockCategoryFormEditingId) ?? null
        : null,
    [stockCategoryFormEditingId, stockCategories]
  );
  const isAlter = !!editing;

  React.useEffect(() => {
    if (editing) {
      setName(editing.name);
      setAlias(editing.alias ?? '');
      setUnder(editing.under);
      setLanguageAlias(editing.languageAlias ?? '');
    } else {
      setName('');
      setAlias('');
      setUnder(DEFAULT_UNDER);
      setLanguageAlias('');
    }
    setError(null);
    setTimeout(() => nameInputRef.current?.focus(), 0);
  }, [editing?.id]);

  const handleQuit = () => {
    setStockCategoryFormEditingId(null);
    setActiveView(isAlter ? 'master-alteration' : 'master-creation');
  };

  const handleAccept = () => {
    setError(null);
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Name is required');
      nameInputRef.current?.focus();
      return;
    }
    if (!isStockCategoryNameUnique(trimmedName, editing?.id)) {
      setError('Stock Category name must be unique');
      nameInputRef.current?.focus();
      return;
    }
    const parentName = under.trim() || DEFAULT_UNDER;
    const parentExists = stockCategories.some((c) => c.name === parentName);
    if (!parentExists) {
      setError('Parent category (Under) must exist');
      return;
    }
    if (wouldCreateCircularStockCategory(trimmedName, parentName, editing?.id)) {
      setError('Under would create a circular hierarchy');
      return;
    }
    const payload: Omit<StockCategory, 'id'> = {
      name: trimmedName,
      alias: alias.trim() || undefined,
      under: parentName,
      languageAlias: languageAlias.trim() || undefined,
    };
    if (editing) {
      updateStockCategory({ ...editing, ...payload });
    } else {
      addStockCategory(payload);
    }
    handleQuit();
  };

  const handleDelete = () => {
    if (!editing) return;
    if (!canDeleteStockCategory(editing.id)) {
      setError('Cannot delete: Stock Items exist in this category or it has child categories');
      return;
    }
    deleteStockCategory(editing.id);
    handleQuit();
  };

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (moreDetailsOverlayOpen) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setMoreDetailsOverlayOpen(false);
          return;
        }
        if (e.key === 'i' || e.key === 'I') {
          const target = e.target as HTMLElement;
          if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
          e.preventDefault();
          setMoreDetailsOverlayOpen(false);
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
      if (e.key === 'F2') {
        e.preventDefault();
        openDateModal();
        return;
      }
      if (e.key === 'F3') {
        e.preventDefault();
        toggleCompanyModal();
        return;
      }
      if (e.key === 'F10') {
        e.preventDefault();
        setActiveView('master-creation');
        return;
      }
      if (e.key === 'i' || e.key === 'I') {
        const target = e.target as HTMLElement;
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
        e.preventDefault();
        setMoreDetailsOverlayOpen(true);
        return;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [editing, name, under, moreDetailsOverlayOpen]);

  const allowDelete = isAlter && editing && canDeleteStockCategory(editing.id);
  const categoryNames = React.useMemo(
    () => stockCategories.map((c) => c.name).filter(Boolean),
    [stockCategories]
  );

  return (
    <div className="flex h-full overflow-hidden bg-white">
      <ScrollArea className="flex-1 min-w-0 p-4">
        <div className="text-[14px] font-bold text-[#7F1D1D] mb-4">
          {isAlter ? 'Stock Category Alteration' : 'Stock Category Creation'}
        </div>

        <p className="text-[10px] text-gray-600 mb-3">
          Categories are classification only. No accounting or valuation impact. One stock item can belong to only one category. Cannot delete if stock items exist.
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
              placeholder="Category name"
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
              {categoryNames.map((cName) => (
                <option key={cName} value={cName}>
                  {cName}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-gray-500 mt-0.5">Default: Primary / Parent category</p>
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

      <aside className="hidden lg:flex w-[200px] min-w-[200px] flex-col border-l border-[#D0D0D0] bg-[#F0F0F0] p-2">
        <div className="text-[10px] font-bold text-[#7F1D1D] mb-2">Context Keys</div>
        <ScrollArea className="flex-1">
          <div className="space-y-1 text-[10px]">
            <button
              type="button"
              className="tally-list-item w-full text-left px-2 py-1.5 rounded border border-transparent hover:border-[#D0D0D0]"
              onClick={openDateModal}
            >
              F2: Period
            </button>
            <button
              type="button"
              className="tally-list-item w-full text-left px-2 py-1.5 rounded border border-transparent hover:border-[#D0D0D0]"
              onClick={toggleCompanyModal}
            >
              F3: Company
            </button>
            <button
              type="button"
              className="tally-list-item w-full text-left px-2 py-1.5 rounded border border-transparent hover:border-[#D0D0D0]"
              onClick={() => setActiveView('master-creation')}
            >
              F10: Other Masters
            </button>
            <button
              type="button"
              className="tally-list-item w-full text-left px-2 py-1.5 rounded border border-transparent hover:border-[#D0D0D0]"
              onClick={() => setMoreDetailsOverlayOpen((o) => !o)}
            >
              I: More Details
            </button>
          </div>
        </ScrollArea>
      </aside>

      {moreDetailsOverlayOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="more-details-title"
        >
          <div className="bg-white border border-[#D0D0D0] rounded shadow-lg max-w-md w-full mx-4 max-h-[90vh] overflow-hidden flex flex-col">
            <div className="px-4 py-2 border-b border-[#D0D0D0] bg-[#F5F5F5] font-semibold text-[12px] text-[#7F1D1D]" id="more-details-title">
              More Details
            </div>
            <ScrollArea className="flex-1 p-4 text-[11px]">
              <div className="text-[10px] font-semibold text-gray-700 mb-2">Stock Category Details</div>
              <ul className="list-disc list-inside text-[10px] text-gray-600 mb-3 space-y-0.5">
                <li>Name and Alias</li>
                <li>Grouping of Stock Category (Primary / Parent)</li>
                {showMoreInOverlay && <li>Language Alias</li>}
              </ul>

              <div className="border-t border-[#E0E0E0] pt-3 mt-3">
                <div className="text-[10px] font-semibold text-gray-700 mb-2">General Details</div>
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] font-medium text-gray-600 mb-1">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="border border-[#D0D0D0] px-2 py-1.5 w-full text-[11px]"
                      placeholder="Category name"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-gray-600 mb-1">Alias</label>
                    <input
                      type="text"
                      value={alias}
                      onChange={(e) => setAlias(e.target.value)}
                      className="border border-[#D0D0D0] px-2 py-1.5 w-full text-[11px]"
                      placeholder="Optional alias"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-gray-600 mb-1">Grouping of Stock Category</label>
                    <select
                      value={under}
                      onChange={(e) => setUnder(e.target.value)}
                      className="border border-[#D0D0D0] px-2 py-1.5 w-full bg-white text-[11px]"
                    >
                      {categoryNames.map((cName) => (
                        <option key={cName} value={cName}>
                          {cName}
                        </option>
                      ))}
                    </select>
                    <p className="text-[10px] text-gray-500 mt-0.5">Value: Primary / Parent Category</p>
                  </div>

                  {showMoreInOverlay && (
                    <div>
                      <label className="block text-[10px] font-medium text-gray-600 mb-1">Language Alias</label>
                      <input
                        type="text"
                        value={languageAlias}
                        onChange={(e) => setLanguageAlias(e.target.value)}
                        className="border border-[#D0D0D0] px-2 py-1.5 w-full text-[11px]"
                        placeholder="Optional"
                      />
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-3 pt-3 border-t border-[#E0E0E0]">
                <button
                  type="button"
                  className="text-[10px] text-[#DC2626] hover:underline"
                  onClick={() => setShowMoreInOverlay((s) => !s)}
                >
                  {showMoreInOverlay ? 'Show Less' : 'Show More'}
                </button>
                <p className="text-[10px] text-gray-500 mt-0.5">
                  {showMoreInOverlay ? 'Hide advanced fields. Values are preserved.' : 'Show additional fields (e.g. Language Alias).'}
                </p>
              </div>
            </ScrollArea>
            <div className="px-4 py-2 border-t border-[#D0D0D0] bg-[#F5F5F5] flex justify-end">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setMoreDetailsOverlayOpen(false)}
              >
                Close (I or Esc)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
