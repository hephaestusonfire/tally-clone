import * as React from 'react';
import {
  useAppStore,
  type GstClassification,
  type GstClassificationHsnsacDetails,
  type GstClassificationGstRateDetails,
  type GstClassificationTaxability,
} from '../../store/useAppStore';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

const HSN_SAC_DETAILS_OPTIONS: GstClassificationHsnsacDetails[] = ['Not Defined', 'Set'];
const GST_RATE_DETAILS_OPTIONS: GstClassificationGstRateDetails[] = ['Not Defined', 'Set'];
const TAXABILITY_OPTIONS: GstClassificationTaxability[] = ['Taxable', 'Exempt', 'Nil Rated'];

export function GstClassificationCreationView() {
  const gstClassifications = useAppStore((s) => s.gstClassifications);
  const gstClassificationFormEditingId = useAppStore((s) => s.gstClassificationFormEditingId);
  const setGstClassificationFormEditingId = useAppStore((s) => s.setGstClassificationFormEditingId);
  const addGstClassification = useAppStore((s) => s.addGstClassification);
  const updateGstClassification = useAppStore((s) => s.updateGstClassification);
  const deleteGstClassification = useAppStore((s) => s.deleteGstClassification);
  const canDeleteGstClassification = useAppStore((s) => s.canDeleteGstClassification);
  const isGstClassificationNameUnique = useAppStore((s) => s.isGstClassificationNameUnique);
  const setActiveView = useAppStore((s) => s.setActiveView);

  const [name, setName] = React.useState('');
  const [hsnsacDetails, setHsnsacDetails] = React.useState<GstClassificationHsnsacDetails>('Not Defined');
  const [hsnsacCode, setHsnsacCode] = React.useState('');
  const [hsnsacDescription, setHsnsacDescription] = React.useState('');
  const [gstRateDetails, setGstRateDetails] = React.useState<GstClassificationGstRateDetails>('Not Defined');
  const [taxabilityType, setTaxabilityType] = React.useState<GstClassificationTaxability>('Taxable');
  const [gstRate, setGstRate] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const [quitConfirmOpen, setQuitConfirmOpen] = React.useState(false);
  const [getHsnsacModalOpen, setGetHsnsacModalOpen] = React.useState(false);
  const nameInputRef = React.useRef<HTMLInputElement>(null);
  const initialSnapshotRef = React.useRef<Record<string, unknown> | null>(null);

  const editing = React.useMemo(
    () =>
      gstClassificationFormEditingId != null
        ? gstClassifications.find((c) => c.id === gstClassificationFormEditingId) ?? null
        : null,
    [gstClassificationFormEditingId, gstClassifications]
  );
  const isAlter = !!editing;

  React.useEffect(() => {
    if (editing) {
      setName(editing.name);
      setHsnsacDetails(editing.hsnsacDetails);
      setHsnsacCode(editing.hsnsacCode ?? '');
      setHsnsacDescription(editing.hsnsacDescription ?? '');
      setGstRateDetails(editing.gstRateDetails);
      setTaxabilityType(editing.taxabilityType ?? 'Taxable');
      setGstRate(editing.gstRate != null ? String(editing.gstRate) : '');
      initialSnapshotRef.current = {
        name: editing.name,
        hsnsacDetails: editing.hsnsacDetails,
        hsnsacCode: editing.hsnsacCode ?? '',
        hsnsacDescription: editing.hsnsacDescription ?? '',
        gstRateDetails: editing.gstRateDetails,
        taxabilityType: editing.taxabilityType ?? 'Taxable',
        gstRate: editing.gstRate,
      };
    } else {
      setName('');
      setHsnsacDetails('Not Defined');
      setHsnsacCode('');
      setHsnsacDescription('');
      setGstRateDetails('Not Defined');
      setTaxabilityType('Taxable');
      setGstRate('');
      initialSnapshotRef.current = {
        name: '',
        hsnsacDetails: 'Not Defined',
        hsnsacCode: '',
        hsnsacDescription: '',
        gstRateDetails: 'Not Defined',
        taxabilityType: 'Taxable',
        gstRate: '',
      };
    }
    setError(null);
    setQuitConfirmOpen(false);
    setTimeout(() => nameInputRef.current?.focus(), 0);
  }, [editing?.id]);

  const hasUnsavedChanges = React.useMemo(() => {
    const s = initialSnapshotRef.current;
    if (!s) return false;
    const gstRateNum = gstRate.trim() === '' ? undefined : Number(gstRate);
    return (
      s.name !== name ||
      s.hsnsacDetails !== hsnsacDetails ||
      s.hsnsacCode !== hsnsacCode ||
      s.hsnsacDescription !== hsnsacDescription ||
      s.gstRateDetails !== gstRateDetails ||
      s.taxabilityType !== taxabilityType ||
      (s.gstRate as number | undefined) !== gstRateNum
    );
  }, [name, hsnsacDetails, hsnsacCode, hsnsacDescription, gstRateDetails, taxabilityType, gstRate]);

  const handleQuit = () => {
    setQuitConfirmOpen(false);
    setGstClassificationFormEditingId(null);
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
    if (!isGstClassificationNameUnique(trimmedName, editing?.id)) {
      setError('GST Classification name must be unique');
      nameInputRef.current?.focus();
      return;
    }
    const gstRateNum = gstRate.trim() === '' ? undefined : Number(gstRate);
    if (
      gstRate.trim() !== '' &&
      (gstRateNum == null || !Number.isFinite(gstRateNum) || gstRateNum < 0 || gstRateNum > 100)
    ) {
      setError('GST Rate % must be between 0 and 100');
      return;
    }
    const payload: Omit<GstClassification, 'id'> = {
      name: trimmedName,
      hsnsacDetails,
      hsnsacCode: hsnsacDetails === 'Set' ? (hsnsacCode.trim() || undefined) : undefined,
      hsnsacDescription: hsnsacDetails === 'Set' ? (hsnsacDescription.trim() || undefined) : undefined,
      gstRateDetails,
      taxabilityType: gstRateDetails === 'Set' ? taxabilityType : undefined,
      gstRate: gstRateDetails === 'Set' ? gstRateNum : undefined,
    };
    if (editing) {
      updateGstClassification({ ...editing, ...payload });
    } else {
      addGstClassification(payload);
    }
    handleQuit();
  };

  const handleDelete = () => {
    if (!editing) return;
    if (!canDeleteGstClassification(editing.id)) {
      setError('Cannot delete: Classification is in use.');
      return;
    }
    deleteGstClassification(editing.id);
    handleQuit();
  };

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (getHsnsacModalOpen) {
        if (e.key === 'Escape' || e.key === 'b' || e.key === 'B') {
          e.preventDefault();
          setGetHsnsacModalOpen(false);
          return;
        }
        return;
      }
      if (e.key === 'Escape') {
        e.preventDefault();
        if (hasUnsavedChanges) {
          setQuitConfirmOpen(true);
        } else {
          handleQuit();
        }
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
      if (e.key === 'b' || e.key === 'B') {
        const target = e.target as HTMLElement;
        if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName)) return;
        e.preventDefault();
        setGetHsnsacModalOpen(true);
        return;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [editing, name, hasUnsavedChanges, getHsnsacModalOpen]);

  const allowDelete = isAlter && editing && canDeleteGstClassification(editing.id);

  return (
    <div className="flex h-full overflow-hidden bg-white">
      <ScrollArea className="flex-1 min-w-0 p-4">
        <div className="text-[14px] font-bold text-[#7F1D1D] mb-4">
          {isAlter ? 'GST Classification Alteration' : 'GST Classification Creation'}
        </div>

        <p className="text-[10px] text-gray-600 mb-3">
          GST Classification is used as a template. Can be applied to Ledgers and Stock Items. Values can be overridden at lower levels.
        </p>

        <div className="space-y-4 max-w-xl text-[11px]">
          <div className="border-t border-[#E0E0E0] pt-3">
            <div className="text-[10px] font-semibold text-gray-700 mb-2">Core Fields</div>
            <div>
              <label className="block text-[10px] font-medium text-gray-600 mb-1">Name *</label>
              <input
                ref={nameInputRef}
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border border-[#D0D0D0] px-2 py-1.5 w-full"
                placeholder="Classification name"
              />
            </div>
          </div>

          <div className="border-t border-[#E0E0E0] pt-3">
            <div className="text-[10px] font-semibold text-gray-700 mb-2">HSN/SAC &amp; Related Details</div>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-medium text-gray-600 mb-1">HSN/SAC Details</label>
                <select
                  value={hsnsacDetails}
                  onChange={(e) => setHsnsacDetails(e.target.value as GstClassificationHsnsacDetails)}
                  className="border border-[#D0D0D0] px-2 py-1.5 w-full bg-white"
                >
                  {HSN_SAC_DETAILS_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
              {hsnsacDetails === 'Set' && (
                <>
                  <div>
                    <label className="block text-[10px] font-medium text-gray-600 mb-1">HSN/SAC Code</label>
                    <input
                      type="text"
                      value={hsnsacCode}
                      onChange={(e) => setHsnsacCode(e.target.value)}
                      className="border border-[#D0D0D0] px-2 py-1.5 w-full"
                      placeholder="e.g. 9983"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-gray-600 mb-1">Description</label>
                    <input
                      type="text"
                      value={hsnsacDescription}
                      onChange={(e) => setHsnsacDescription(e.target.value)}
                      className="border border-[#D0D0D0] px-2 py-1.5 w-full"
                      placeholder="Optional"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          <div className="border-t border-[#E0E0E0] pt-3">
            <div className="text-[10px] font-semibold text-gray-700 mb-2">GST Rate &amp; Related Details</div>
            <div className="space-y-3">
              <div>
                <label className="block text-[10px] font-medium text-gray-600 mb-1">GST Rate Details</label>
                <select
                  value={gstRateDetails}
                  onChange={(e) => setGstRateDetails(e.target.value as GstClassificationGstRateDetails)}
                  className="border border-[#D0D0D0] px-2 py-1.5 w-full bg-white"
                >
                  {GST_RATE_DETAILS_OPTIONS.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              </div>
              {gstRateDetails === 'Set' && (
                <>
                  <div>
                    <label className="block text-[10px] font-medium text-gray-600 mb-1">Taxability Type</label>
                    <select
                      value={taxabilityType}
                      onChange={(e) => setTaxabilityType(e.target.value as GstClassificationTaxability)}
                      className="border border-[#D0D0D0] px-2 py-1.5 w-full bg-white"
                    >
                      {TAXABILITY_OPTIONS.map((t) => (
                        <option key={t} value={t}>
                          {t}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-gray-600 mb-1">GST Rate (%)</label>
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.01}
                      value={gstRate}
                      onChange={(e) => setGstRate(e.target.value)}
                      className="border border-[#D0D0D0] px-2 py-1.5 w-24"
                      placeholder="e.g. 18"
                    />
                  </div>
                </>
              )}
            </div>
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
        <div className="space-y-1 text-[10px]">
          <button
            type="button"
            className="tally-list-item w-full text-left px-2 py-1.5 rounded border border-transparent hover:border-[#D0D0D0]"
            onClick={() => {}}
          >
            I: More Details
          </button>
          <button
            type="button"
            className="tally-list-item w-full text-left px-2 py-1.5 rounded border border-transparent hover:border-[#D0D0D0]"
            onClick={() => setGetHsnsacModalOpen(true)}
          >
            B: Get HSN/SAC Info
          </button>
        </div>
      </aside>

      {quitConfirmOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50"
          role="dialog"
          aria-modal="true"
          aria-labelledby="quit-confirm-title"
        >
          <div className="bg-white border border-[#D0D0D0] rounded shadow-lg p-4 max-w-sm mx-4">
            <h2 id="quit-confirm-title" className="font-semibold text-[12px] text-[#7F1D1D] mb-2">
              Quit ?
            </h2>
            <p className="text-[11px] text-gray-600 mb-4">Discard unsaved changes and return?</p>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setQuitConfirmOpen(false)}>
                No
              </Button>
              <Button size="sm" className="bg-[#DC2626] text-white hover:bg-[#B91C1C]" onClick={handleQuit}>
                Yes
              </Button>
            </div>
          </div>
        </div>
      )}

      {getHsnsacModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          role="dialog"
          aria-modal="true"
          aria-labelledby="get-hsnsac-title"
        >
          <div className="bg-white border border-[#D0D0D0] rounded shadow-lg max-w-sm w-full mx-4 p-4">
            <div className="font-semibold text-[12px] text-[#7F1D1D] mb-2" id="get-hsnsac-title">
              Get HSN/SAC Info
            </div>
            <p className="text-[11px] text-gray-600 mb-4">
              API integration placeholder. This action would fetch HSN/SAC description and GST rates from an external service.
            </p>
            <div className="flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setGetHsnsacModalOpen(false)}>
                Close (B or Esc)
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
