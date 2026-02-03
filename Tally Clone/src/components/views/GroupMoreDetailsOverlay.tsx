import * as React from 'react';
import { ScrollArea } from '../ui/scroll-area';
import type { NatureOfGroup, PurchaseAllocationMethod } from '../../store/useAppStore';

/** Draft values bound to the same Group model (no duplicated state); overlay calls onChange to update parent. */
export interface GroupDetailsDraft {
  name: string;
  alias: string;
  under: string;
  natureOfGroup: NatureOfGroup | '';
  languageAlias: string;
  behavesLikeSubLedger: boolean;
  nettDebitCreditForReporting: boolean;
  usedForCalculation: boolean;
  purchaseAllocationMethod: PurchaseAllocationMethod;
  salesAllocationMethod: PurchaseAllocationMethod | '';
  gstClassificationName: string;
  hsnsacCode: string;
  inactive: boolean;
}

const PURCHASE_ALLOCATION_OPTIONS: { value: PurchaseAllocationMethod; label: string }[] = [
  { value: 'Not Applicable', label: 'Not Applicable' },
  { value: 'Quantity', label: 'Appropriate by Quantity' },
  { value: 'Value', label: 'Appropriate by Value' },
];

const NATURE_OPTIONS: NatureOfGroup[] = ['Assets', 'Liabilities', 'Income', 'Expenses'];

interface GroupMoreDetailsOverlayProps {
  open: boolean;
  onClose: () => void;
  draft: GroupDetailsDraft;
  onChange: (key: keyof GroupDetailsDraft, value: GroupDetailsDraft[keyof GroupDetailsDraft]) => void;
  isPredefined: boolean;
  groupNames: string[];
  /** Whether GST/statutory section is applicable (e.g. company has GST enabled) */
  statutoryApplicable?: boolean;
}

export function GroupMoreDetailsOverlay({
  open,
  onClose,
  draft,
  onChange,
  isPredefined,
  groupNames,
  statutoryApplicable = false,
}: GroupMoreDetailsOverlayProps) {
  const [showMore, setShowMore] = React.useState(false);
  const [showInactive, setShowInactive] = React.useState(false);
  const overlayRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
      aria-modal
      role="dialog"
      aria-labelledby="more-details-title"
      style={{ pointerEvents: 'auto' }}
    >
      <div
        ref={overlayRef}
        className="bg-white border border-[#D0D0D0] shadow-lg flex flex-col max-w-2xl w-full max-h-[85vh] mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header: More Details + toggles top-right */}
        <div className="flex items-center justify-between flex-shrink-0 px-4 py-2 border-b border-[#D0D0D0] bg-[#F5F5F5]">
          <h2 id="more-details-title" className="text-[14px] font-bold text-[#7F1D1D]">
            More Details
          </h2>
          <div className="flex items-center gap-3 text-[10px]">
            <button
              type="button"
              className="px-2 py-1 rounded border border-[#D0D0D0] bg-white hover:bg-[#E8E8E8] text-[#7F1D1D] font-medium"
              onClick={() => setShowMore((m) => !m)}
            >
              {showMore ? 'Show Less' : 'Show More'}
            </button>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showInactive}
                onChange={(e) => setShowInactive(e.target.checked)}
                className="border border-[#D0D0D0]"
              />
              Show Inactive
            </label>
          </div>
        </div>

        {/* Inner title */}
        <div className="flex-shrink-0 px-4 py-1.5 border-b border-[#E0E0E0] bg-[#FAFAFA] text-[11px] font-semibold text-[#7F1D1D]">
          List of Group Details
        </div>

        {/* Scrollable content */}
        <ScrollArea className="flex-1 min-h-0 p-4 text-[11px]">
          <div className="space-y-4 pr-2">
            {/* General Details */}
            <section>
              <h3 className="text-[10px] font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                General Details
              </h3>
              <div className="space-y-2 pl-0">
                <div>
                  <label className="block text-[10px] text-gray-600 mb-0.5">Name</label>
                  <input
                    type="text"
                    value={draft.name}
                    onChange={(e) => onChange('name', e.target.value)}
                    className="w-full border border-[#D0D0D0] px-2 py-1 text-[11px] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-600 mb-0.5">Alias</label>
                  <input
                    type="text"
                    value={draft.alias}
                    onChange={(e) => onChange('alias', e.target.value)}
                    className="w-full border border-[#D0D0D0] px-2 py-1 text-[11px] bg-white"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-gray-600 mb-0.5">Under</label>
                  <select
                    value={draft.under}
                    onChange={(e) => onChange('under', e.target.value)}
                    className="w-full border border-[#D0D0D0] px-2 py-1 text-[11px] bg-white"
                  >
                    {groupNames.map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-gray-600 mb-0.5">Nature of Group</label>
                  <select
                    value={draft.natureOfGroup}
                    onChange={(e) => onChange('natureOfGroup', e.target.value as NatureOfGroup | '')}
                    disabled={isPredefined}
                    className="w-full border border-[#D0D0D0] px-2 py-1 text-[11px] bg-white disabled:bg-[#F0F0F0] disabled:text-gray-500"
                  >
                    <option value="">—</option>
                    {NATURE_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </select>
                  {isPredefined && (
                    <span className="text-[10px] text-gray-500 ml-1">Predefined: cannot change</span>
                  )}
                </div>
                {showMore && (
                  <div>
                    <label className="block text-[10px] text-gray-600 mb-0.5">Language Alias</label>
                    <input
                      type="text"
                      value={draft.languageAlias}
                      onChange={(e) => onChange('languageAlias', e.target.value)}
                      className="w-full border border-[#D0D0D0] px-2 py-1 text-[11px] bg-white"
                    />
                  </div>
                )}
              </div>
            </section>

            {/* Accounting Behaviour */}
            <section>
              <h3 className="text-[10px] font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                Accounting Behaviour
              </h3>
              <div className="space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.behavesLikeSubLedger}
                    onChange={(e) => onChange('behavesLikeSubLedger', e.target.checked)}
                    className="border border-[#D0D0D0]"
                  />
                  <span>Group behaves like a sub-ledger</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.nettDebitCreditForReporting}
                    onChange={(e) => onChange('nettDebitCreditForReporting', e.target.checked)}
                    className="border border-[#D0D0D0]"
                  />
                  <span>Nett Debit/Credit Balances for Reporting</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={draft.usedForCalculation}
                    onChange={(e) => onChange('usedForCalculation', e.target.checked)}
                    className="border border-[#D0D0D0]"
                  />
                  <span>Used for calculation (taxes / discounts)</span>
                </label>
              </div>
            </section>

            {/* Purchase / Sales Behaviour */}
            <section>
              <h3 className="text-[10px] font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                Purchase / Sales Behaviour
              </h3>
              <div className="space-y-2">
                <div>
                  <label className="block text-[10px] text-gray-600 mb-0.5">
                    Method to allocate when used in purchase invoice
                  </label>
                  <select
                    value={draft.purchaseAllocationMethod === 'FIFO' || draft.purchaseAllocationMethod === 'LIFO' ? 'Not Applicable' : draft.purchaseAllocationMethod}
                    onChange={(e) => onChange('purchaseAllocationMethod', e.target.value as PurchaseAllocationMethod)}
                    className="w-full border border-[#D0D0D0] px-2 py-1 text-[11px] bg-white"
                  >
                    {PURCHASE_ALLOCATION_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] text-gray-600 mb-0.5">
                    Method to allocate when used in sales invoice (if applicable)
                  </label>
                  <select
                    value={draft.salesAllocationMethod === '' || draft.salesAllocationMethod === 'FIFO' || draft.salesAllocationMethod === 'LIFO' ? 'Not Applicable' : draft.salesAllocationMethod}
                    onChange={(e) =>
                      onChange('salesAllocationMethod', e.target.value === 'Not Applicable' ? '' : (e.target.value as PurchaseAllocationMethod))
                    }
                    className="w-full border border-[#D0D0D0] px-2 py-1 text-[11px] bg-white"
                  >
                    <option value="Not Applicable">Not Applicable</option>
                    {PURCHASE_ALLOCATION_OPTIONS.filter((o) => o.value !== 'Not Applicable').map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Statutory / Classification (if applicable) */}
            {statutoryApplicable && (
              <section>
                <h3 className="text-[10px] font-semibold text-gray-700 mb-2 uppercase tracking-wide">
                  Statutory / Classification
                </h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-[10px] text-gray-600 mb-0.5">GST Classification</label>
                    <input
                      type="text"
                      value={draft.gstClassificationName}
                      onChange={(e) => onChange('gstClassificationName', e.target.value)}
                      className="w-full border border-[#D0D0D0] px-2 py-1 text-[11px] bg-white"
                      placeholder="Read/write"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] text-gray-600 mb-0.5">HSN/SAC reference (if linked)</label>
                    <input
                      type="text"
                      value={draft.hsnsacCode}
                      onChange={(e) => onChange('hsnsacCode', e.target.value)}
                      className="w-full border border-[#D0D0D0] px-2 py-1 text-[11px] bg-white"
                      placeholder="If linked"
                    />
                  </div>
                </div>
              </section>
            )}

            {/* Show Inactive: read-only muted fields */}
            {showInactive && (
              <section>
                <h3 className="text-[10px] font-semibold text-gray-500 mb-2 uppercase tracking-wide">
                  Inactive / Historical
                </h3>
                <div className="space-y-2">
                  <div>
                    <label className="block text-[10px] text-gray-500 mb-0.5">Inactive</label>
                    <div
                      className="w-full border border-[#E0E0E0] px-2 py-1 text-[11px] bg-[#F5F5F5] text-gray-500 rounded"
                      aria-readonly
                    >
                      {draft.inactive ? 'Yes' : 'No'}
                    </div>
                    <p className="text-[10px] text-gray-400 mt-0.5">Read-only when Show Inactive is ON</p>
                  </div>
                </div>
              </section>
            )}
          </div>
        </ScrollArea>

        <div className="flex-shrink-0 px-4 py-2 border-t border-[#E0E0E0] bg-[#FAFAFA] text-[10px] text-gray-500">
          ↑↓: Move · Enter: Drill into field · Esc: Close overlay
        </div>
      </div>
    </div>
  );
}
