import * as React from 'react';
import { useAppStore, type PurchaseAllocationMethod, type NatureOfGroup } from '../../store/useAppStore';
import { useGatewayStore } from '../../store/useGatewayStore';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { GroupMoreDetailsOverlay } from './GroupMoreDetailsOverlay';

/** Purchase invoice allocation options per Tally: Not Applicable, Appropriate by Quantity, Appropriate by Value */
const PURCHASE_ALLOCATION_OPTIONS: { value: PurchaseAllocationMethod; label: string }[] = [
  { value: 'Not Applicable', label: 'Not Applicable' },
  { value: 'Quantity', label: 'Appropriate by Quantity' },
  { value: 'Value', label: 'Appropriate by Value' },
];

const NATURE_OF_GROUP_OPTIONS: NatureOfGroup[] = ['Assets', 'Liabilities', 'Income', 'Expenses'];

const DEFAULT_UNDER = 'Primary';

export function GroupCreationView() {
  const groups = useAppStore((s) => s.groups);
  const groupFormEditingId = useAppStore((s) => s.groupFormEditingId);
  const setGroupFormEditingId = useAppStore((s) => s.setGroupFormEditingId);
  const addGroup = useAppStore((s) => s.addGroup);
  const updateGroup = useAppStore((s) => s.updateGroup);
  const deleteGroup = useAppStore((s) => s.deleteGroup);
  const canDeleteGroup = useAppStore((s) => s.canDeleteGroup);
  const isGroupNameUnique = useAppStore((s) => s.isGroupNameUnique);
  const wouldCreateCircularGroup = useAppStore((s) => s.wouldCreateCircularGroup);
  const isPredefinedGroup = useAppStore((s) => s.isPredefinedGroup);
  const setActiveView = useAppStore((s) => s.setActiveView);
  const groupFormFromCoA = useAppStore((s) => s.groupFormFromCoA);
  const setGroupFormFromCoA = useAppStore((s) => s.setGroupFormFromCoA);
  const isGstEnabled = useAppStore((s) => s.isGstEnabled);
  const toggleCompanyModal = useAppStore((s) => s.toggleCompanyModal);
  const openDateModal = useGatewayStore((s) => s.openDateModal);

  const [name, setName] = React.useState('');
  const [alias, setAlias] = React.useState('');
  const [under, setUnder] = React.useState(DEFAULT_UNDER);
  const [natureOfGroup, setNatureOfGroup] = React.useState<NatureOfGroup | ''>('');
  const [behavesLikeSubLedger, setBehavesLikeSubLedger] = React.useState(false);
  const [nettDebitCreditForReporting, setNettDebitCreditForReporting] = React.useState(false);
  const [usedForCalculation, setUsedForCalculation] = React.useState(false);
  const [purchaseAllocationMethod, setPurchaseAllocationMethod] = React.useState<PurchaseAllocationMethod>('Not Applicable');
  const [salesAllocationMethod, setSalesAllocationMethod] = React.useState<PurchaseAllocationMethod | ''>('');
  const [languageAlias, setLanguageAlias] = React.useState('');
  const [gstClassificationName, setGstClassificationName] = React.useState('');
  const [hsnsacCode, setHsnsacCode] = React.useState('');
  const [showMoreDetailsOverlay, setShowMoreDetailsOverlay] = React.useState(false);
  const [showQuitConfirm, setShowQuitConfirm] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const nameInputRef = React.useRef<HTMLInputElement>(null);

  const editingGroup = React.useMemo(
    () => (groupFormEditingId != null ? groups.find((g) => g.id === groupFormEditingId) : null),
    [groupFormEditingId, groups]
  );
  const isAlter = !!editingGroup;

  React.useEffect(() => {
    if (editingGroup) {
      setName(editingGroup.name);
      setAlias(editingGroup.alias ?? '');
      setUnder(editingGroup.under);
      setNatureOfGroup(editingGroup.natureOfGroup ?? '');
      setLanguageAlias(editingGroup.languageAlias ?? '');
      setBehavesLikeSubLedger(editingGroup.behavesLikeSubLedger);
      setNettDebitCreditForReporting(editingGroup.nettDebitCreditForReporting);
      setUsedForCalculation(editingGroup.usedForCalculation);
      setPurchaseAllocationMethod(
        editingGroup.purchaseAllocationMethod === 'FIFO' || editingGroup.purchaseAllocationMethod === 'LIFO'
          ? 'Not Applicable'
          : editingGroup.purchaseAllocationMethod
      );
      setSalesAllocationMethod(
        editingGroup.salesAllocationMethod === 'FIFO' || editingGroup.salesAllocationMethod === 'LIFO'
          ? ''
          : editingGroup.salesAllocationMethod ?? ''
      );
      setGstClassificationName(editingGroup.gstClassificationName ?? '');
      setHsnsacCode(editingGroup.hsnsacCode ?? '');
    } else {
      setName('');
      setAlias('');
      setUnder(DEFAULT_UNDER);
      setNatureOfGroup('');
      setLanguageAlias('');
      setBehavesLikeSubLedger(false);
      setNettDebitCreditForReporting(false);
      setUsedForCalculation(false);
      setPurchaseAllocationMethod('Not Applicable');
      setSalesAllocationMethod('');
      setGstClassificationName('');
      setHsnsacCode('');
    }
    setError(null);
    setTimeout(() => nameInputRef.current?.focus(), 0);
  }, [editingGroup?.id]);

  const handleQuit = () => {
    setShowQuitConfirm(false);
    setShowMoreDetailsOverlay(false);
    setGroupFormEditingId(null);
    setGroupFormFromCoA(false);
    if (groupFormFromCoA) {
      setActiveView('chart-of-accounts');
    } else {
      setActiveView(isAlter ? 'master-alteration' : 'master-creation');
    }
  };

  const initialDraft = React.useMemo(() => {
    if (editingGroup) {
      return {
        name: editingGroup.name,
        alias: editingGroup.alias ?? '',
        under: editingGroup.under,
        natureOfGroup: (editingGroup.natureOfGroup ?? '') as NatureOfGroup | '',
        languageAlias: editingGroup.languageAlias ?? '',
        behavesLikeSubLedger: editingGroup.behavesLikeSubLedger,
        nettDebitCreditForReporting: editingGroup.nettDebitCreditForReporting,
        usedForCalculation: editingGroup.usedForCalculation,
        purchaseAllocationMethod:
          editingGroup.purchaseAllocationMethod === 'FIFO' || editingGroup.purchaseAllocationMethod === 'LIFO'
            ? 'Not Applicable'
            : editingGroup.purchaseAllocationMethod,
        salesAllocationMethod:
          (editingGroup.salesAllocationMethod === 'FIFO' || editingGroup.salesAllocationMethod === 'LIFO'
            ? ''
            : editingGroup.salesAllocationMethod ?? '') as PurchaseAllocationMethod | '',
        gstClassificationName: editingGroup.gstClassificationName ?? '',
        hsnsacCode: editingGroup.hsnsacCode ?? '',
        inactive: !!editingGroup.inactive,
      };
    }
    return {
      name: '',
      alias: '',
      under: DEFAULT_UNDER,
      natureOfGroup: '' as NatureOfGroup | '',
      languageAlias: '',
      behavesLikeSubLedger: false,
      nettDebitCreditForReporting: false,
      usedForCalculation: false,
      purchaseAllocationMethod: 'Not Applicable' as PurchaseAllocationMethod,
      salesAllocationMethod: '' as PurchaseAllocationMethod | '',
      gstClassificationName: '',
      hsnsacCode: '',
      inactive: false,
    };
  }, [editingGroup?.id]);

  const isDirty = React.useMemo(() => {
    const current = {
      name: name.trim(),
      alias: alias.trim(),
      under: under.trim() || DEFAULT_UNDER,
      natureOfGroup,
      languageAlias: languageAlias.trim(),
      behavesLikeSubLedger,
      nettDebitCreditForReporting,
      usedForCalculation,
      purchaseAllocationMethod:
        purchaseAllocationMethod === 'FIFO' || purchaseAllocationMethod === 'LIFO' ? 'Not Applicable' : purchaseAllocationMethod,
      salesAllocationMethod:
        salesAllocationMethod === 'FIFO' || salesAllocationMethod === 'LIFO' ? '' : salesAllocationMethod,
      gstClassificationName: gstClassificationName.trim(),
      hsnsacCode: hsnsacCode.trim(),
    };
    const initial = {
      name: initialDraft.name,
      alias: initialDraft.alias,
      under: initialDraft.under,
      natureOfGroup: initialDraft.natureOfGroup,
      languageAlias: initialDraft.languageAlias,
      behavesLikeSubLedger: initialDraft.behavesLikeSubLedger,
      nettDebitCreditForReporting: initialDraft.nettDebitCreditForReporting,
      usedForCalculation: initialDraft.usedForCalculation,
      purchaseAllocationMethod: initialDraft.purchaseAllocationMethod,
      salesAllocationMethod: initialDraft.salesAllocationMethod,
      gstClassificationName: initialDraft.gstClassificationName,
      hsnsacCode: initialDraft.hsnsacCode,
    };
    return (
      current.name !== initial.name ||
      current.alias !== initial.alias ||
      current.under !== initial.under ||
      current.natureOfGroup !== initial.natureOfGroup ||
      current.languageAlias !== initial.languageAlias ||
      current.behavesLikeSubLedger !== initial.behavesLikeSubLedger ||
      current.nettDebitCreditForReporting !== initial.nettDebitCreditForReporting ||
      current.usedForCalculation !== initial.usedForCalculation ||
      current.purchaseAllocationMethod !== initial.purchaseAllocationMethod ||
      current.salesAllocationMethod !== initial.salesAllocationMethod ||
      current.gstClassificationName !== initial.gstClassificationName ||
      current.hsnsacCode !== initial.hsnsacCode
    );
  }, [
    name,
    alias,
    under,
    natureOfGroup,
    languageAlias,
    behavesLikeSubLedger,
    nettDebitCreditForReporting,
    usedForCalculation,
    purchaseAllocationMethod,
    salesAllocationMethod,
    gstClassificationName,
    hsnsacCode,
    initialDraft,
  ]);

  const handleAccept = async () => {
    setError(null);
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError('Name is required');
      nameInputRef.current?.focus();
      return;
    }
    if (!isGroupNameUnique(trimmedName, editingGroup?.id)) {
      setError('Group name must be unique within company');
      nameInputRef.current?.focus();
      return;
    }
    const parentExists = groups.some((g) => g.name === under);
    if (!parentExists && under.trim()) {
      setError('Parent group must exist');
      return;
    }
    if (wouldCreateCircularGroup(trimmedName, (under.trim() || groups[0]?.name) ?? 'Primary', editingGroup?.id)) {
      setError('Parent group cannot create circular hierarchy');
      return;
    }
    if (editingGroup) {
      updateGroup({
        ...editingGroup,
        name: trimmedName,
        alias: alias.trim() || undefined,
        under: under.trim() || DEFAULT_UNDER,
        natureOfGroup: natureOfGroup || undefined,
        languageAlias: languageAlias.trim() || undefined,
        behavesLikeSubLedger,
        nettDebitCreditForReporting,
        usedForCalculation,
        purchaseAllocationMethod,
        salesAllocationMethod:
          salesAllocationMethod === '' || salesAllocationMethod === 'FIFO' || salesAllocationMethod === 'LIFO'
            ? undefined
            : salesAllocationMethod,
        gstClassificationName: gstClassificationName.trim() || undefined,
        hsnsacCode: hsnsacCode.trim() || undefined,
      });
      setGroupFormFromCoA(false);
      handleQuit();
    } else {
      try {
        await addGroup({
          name: trimmedName,
          alias: alias.trim() || undefined,
          under: under.trim() || DEFAULT_UNDER,
          natureOfGroup: natureOfGroup || undefined,
          languageAlias: languageAlias.trim() || undefined,
          behavesLikeSubLedger,
          nettDebitCreditForReporting,
          usedForCalculation,
          purchaseAllocationMethod,
          salesAllocationMethod:
            salesAllocationMethod === '' || salesAllocationMethod === 'FIFO' || salesAllocationMethod === 'LIFO'
              ? undefined
              : salesAllocationMethod,
          gstClassificationName: gstClassificationName.trim() || undefined,
          hsnsacCode: hsnsacCode.trim() || undefined,
        });
        setGroupFormFromCoA(false);
        handleQuit();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save group');
      }
    }
  };

  const handleDelete = () => {
    if (!editingGroup) return;
    if (isPredefinedGroup(editingGroup.name)) {
      setError('Cannot delete: predefined group');
      return;
    }
    if (!canDeleteGroup(editingGroup.id)) {
      setError('Cannot delete: group has child groups or is used by ledgers');
      return;
    }
    deleteGroup(editingGroup.id);
    setGroupFormFromCoA(false);
    handleQuit();
  };

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        if (showMoreDetailsOverlay) {
          setShowMoreDetailsOverlay(false);
          return;
        }
        if (showQuitConfirm) {
          setShowQuitConfirm(false);
          return;
        }
        if (isDirty) {
          setShowQuitConfirm(true);
          return;
        }
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
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;
        e.preventDefault();
        setShowMoreDetailsOverlay(true);
        return;
      }
      if (e.key === 'b' || e.key === 'B') {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;
        e.preventDefault();
        // Placeholder: Get HSN/SAC Info (GST integration)
        return;
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isAlter, editingGroup, name, alias, under, handleQuit, handleAccept, handleDelete, showMoreDetailsOverlay, showQuitConfirm, isDirty]);

  const showInactive = useAppStore((s) => s.showInactive);
  const groupNames = React.useMemo(() => {
    const base = showInactive ? groups : groups.filter((g) => !g.inactive);
    const names = base.map((g) => g.name).filter(Boolean);
    if (!showInactive && under && !names.includes(under)) names.push(under);
    return names;
  }, [groups, showInactive, under]);
  const allowDelete =
    isAlter &&
    !!editingGroup &&
    !isPredefinedGroup(editingGroup.name) &&
    canDeleteGroup(editingGroup.id);

  return (
    <div className="flex h-full overflow-hidden bg-white">
      <div className="flex-1 min-w-0 flex flex-col overflow-auto p-4">
        <div className="text-[14px] font-bold text-[#7F1D1D] mb-4">
          {isAlter && groupFormFromCoA
            ? 'Group Alteration (Secondary)'
            : isAlter
              ? 'Alter Group'
              : 'Group Creation'}
        </div>

        <div className="space-y-3 max-w-xl">
          <div>
            <label className="block text-[10px] font-medium text-gray-600 mb-1">Name *</label>
            <input
              ref={nameInputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border border-[#D0D0D0] px-2 py-1.5 w-full text-[11px]"
              placeholder="Group name"
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
            <label className="block text-[10px] font-medium text-gray-600 mb-1">Under</label>
            <select
              value={under}
              onChange={(e) => setUnder(e.target.value)}
              className="border border-[#D0D0D0] px-2 py-1.5 w-full text-[11px] bg-white"
            >
              {groupNames.map((gName) => (
                <option key={gName} value={gName}>
                  {gName}
                </option>
              ))}
            </select>
            <span className="text-[10px] text-gray-500">Default: Primary</span>
          </div>

          <div className="border-t border-[#E0E0E0] pt-3 mt-3">
            <div className="text-[10px] font-semibold text-gray-700 mb-2">Nature &amp; Accounting Behaviour</div>
            <div className="space-y-2 mb-3">
              <label className="block text-[10px] font-medium text-gray-600 mb-1">Nature of Group</label>
              <select
                value={natureOfGroup}
                onChange={(e) => setNatureOfGroup(e.target.value as NatureOfGroup | '')}
                className="border border-[#D0D0D0] px-2 py-1.5 w-full text-[11px] bg-white"
              >
                <option value="">—</option>
                {NATURE_OF_GROUP_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </div>
            <div className="text-[10px] font-semibold text-gray-700 mb-2">Group Behaviour</div>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer text-[11px]">
                <input
                  type="checkbox"
                  checked={behavesLikeSubLedger}
                  onChange={(e) => setBehavesLikeSubLedger(e.target.checked)}
                  className="border border-[#D0D0D0]"
                />
                Group behaves like a sub-ledger
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-[11px]">
                <input
                  type="checkbox"
                  checked={nettDebitCreditForReporting}
                  onChange={(e) => setNettDebitCreditForReporting(e.target.checked)}
                  className="border border-[#D0D0D0]"
                />
                Nett Debit/Credit Balances for Reporting
              </label>
              <label className="flex items-center gap-2 cursor-pointer text-[11px]">
                <input
                  type="checkbox"
                  checked={usedForCalculation}
                  onChange={(e) => setUsedForCalculation(e.target.checked)}
                  className="border border-[#D0D0D0]"
                />
                Used for calculation (for example: taxes, discounts)
              </label>
            </div>
            <div className="mt-3">
              <label className="block text-[10px] font-medium text-gray-600 mb-1">
                Purchase Invoice Allocation
              </label>
              <p className="text-[10px] text-gray-600 mb-1">
                Method to allocate when used in purchase invoice:
              </p>
              <select
                value={purchaseAllocationMethod === 'FIFO' || purchaseAllocationMethod === 'LIFO' ? 'Not Applicable' : purchaseAllocationMethod}
                onChange={(e) => setPurchaseAllocationMethod(e.target.value as PurchaseAllocationMethod)}
                className="border border-[#D0D0D0] px-2 py-1.5 w-full text-[11px] bg-white"
              >
                {PURCHASE_ALLOCATION_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {error && <p className="text-[10px] text-red-600">{error}</p>}
        </div>

        <div className="flex gap-2 mt-4">
          <Button size="sm" className="bg-[#DC2626] text-white hover:bg-[#B91C1C] text-[11px]" onClick={handleAccept}>
            Accept (Ctrl+A)
          </Button>
          <Button size="sm" variant="outline" onClick={() => (isDirty ? setShowQuitConfirm(true) : handleQuit())}>
            Quit (Esc)
          </Button>
          {allowDelete && (
            <Button size="sm" variant="outline" className="text-red-700 border-red-300" onClick={handleDelete}>
              Delete (D)
            </Button>
          )}
        </div>
      </div>

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
              onClick={() => setShowMoreDetailsOverlay(true)}
            >
              I: More Details
            </button>
            <button
              type="button"
              className="tally-list-item w-full text-left px-2 py-1.5 rounded border border-transparent hover:border-[#D0D0D0] text-gray-500"
              onClick={() => {}}
            >
              B: Get HSN/SAC Info
            </button>
          </div>
        </ScrollArea>
      </aside>

      {/* More Details overlay: single instance, bound to same form state */}
      <GroupMoreDetailsOverlay
        open={showMoreDetailsOverlay}
        onClose={() => setShowMoreDetailsOverlay(false)}
        draft={{
          name,
          alias,
          under,
          natureOfGroup,
          languageAlias,
          behavesLikeSubLedger,
          nettDebitCreditForReporting,
          usedForCalculation,
          purchaseAllocationMethod:
            purchaseAllocationMethod === 'FIFO' || purchaseAllocationMethod === 'LIFO'
              ? 'Not Applicable'
              : purchaseAllocationMethod,
          salesAllocationMethod:
            salesAllocationMethod === 'FIFO' || salesAllocationMethod === 'LIFO' ? '' : salesAllocationMethod,
          gstClassificationName,
          hsnsacCode,
          inactive: !!editingGroup?.inactive,
        }}
        onChange={(key, value) => {
          switch (key) {
            case 'name':
              setName(String(value));
              break;
            case 'alias':
              setAlias(String(value));
              break;
            case 'under':
              setUnder(String(value));
              break;
            case 'natureOfGroup':
              setNatureOfGroup(value as NatureOfGroup | '');
              break;
            case 'languageAlias':
              setLanguageAlias(String(value));
              break;
            case 'behavesLikeSubLedger':
              setBehavesLikeSubLedger(!!value);
              break;
            case 'nettDebitCreditForReporting':
              setNettDebitCreditForReporting(!!value);
              break;
            case 'usedForCalculation':
              setUsedForCalculation(!!value);
              break;
            case 'purchaseAllocationMethod':
              setPurchaseAllocationMethod(value as PurchaseAllocationMethod);
              break;
            case 'salesAllocationMethod':
              setSalesAllocationMethod(value as PurchaseAllocationMethod | '');
              break;
            case 'gstClassificationName':
              setGstClassificationName(String(value));
              break;
            case 'hsnsacCode':
              setHsnsacCode(String(value));
              break;
            default:
              break;
          }
        }}
        isPredefined={!!editingGroup && isPredefinedGroup(editingGroup.name)}
        groupNames={groupNames}
        statutoryApplicable={isGstEnabled()}
      />

      {/* Quit confirmation: only when dirty */}
      {showQuitConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40" aria-modal role="dialog">
          <div className="bg-white border border-[#D0D0D0] shadow-lg px-4 py-3 min-w-[280px]">
            <p className="text-[12px] font-medium text-[#7F1D1D] mb-3">Quit ?</p>
            <p className="text-[11px] text-gray-600 mb-4">Discard unsaved changes and leave Group Alteration?</p>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="outline" onClick={() => setShowQuitConfirm(false)}>
                No
              </Button>
              <Button size="sm" className="bg-[#DC2626] text-white hover:bg-[#B91C1C]" onClick={handleQuit}>
                Yes
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
