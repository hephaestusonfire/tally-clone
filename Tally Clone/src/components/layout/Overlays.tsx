import * as React from 'react';
import { useAppStore, type VoucherTypeConfig } from '../../store/useAppStore';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';

const defaultConfig = (): VoucherTypeConfig => ({
  enableGst: false,
  enableItemInvoice: false,
  allowNarration: true,
  enableDiscountColumn: true,
  enableRoundingOff: false,
  allowVoucherClass: false,
});

export function ConfigModal() {
  const isOpen = useAppStore((s) => s.isConfigOpen);
  const close = useAppStore((s) => s.closeConfig);
  const activeView = useAppStore((s) => s.activeView);
  const voucherTypes = useAppStore((s) => s.voucherTypes);
  const voucherTypeConfigs = useAppStore((s) => s.voucherTypeConfigs);
  const setVoucherTypeConfig = useAppStore((s) => s.setVoucherTypeConfig);

  if (!isOpen) return null;

  const isVoucherConfig = activeView === 'vouchers';

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40 text-[11px]">
      <div className={`bg-[#FEF2F2] border border-tallyBorder shadow-lg ${isVoucherConfig ? 'min-w-[480px] max-w-[520px] max-h-[85vh] flex flex-col' : 'min-w-[420px]'}`}>
        <div className="px-3 py-2 border-b border-tallyBorder bg-[#C0C0C0] font-semibold">
          Configuration (F12)
        </div>
        {isVoucherConfig ? (
          <>
            <div className="px-3 py-1 border-b border-tallyBorder bg-[#E0E0E0] text-[10px] font-medium">
              Per-voucher-type options. Changes apply to voucher entry behaviour.
            </div>
            <ScrollArea className="flex-1 overflow-auto p-3">
              <div className="space-y-4">
                {voucherTypes.filter((vt) => vt.active && !vt.inactive).map((vt) => {
                  const config = voucherTypeConfigs[vt.id] ?? defaultConfig();
                  const update = (patch: Partial<VoucherTypeConfig>) => setVoucherTypeConfig(vt.id, patch);
                  return (
                    <div key={vt.id} className="border border-[#D0D0D0] bg-white rounded p-2">
                      <div className="font-semibold text-[#DC2626] mb-2">{vt.name}</div>
                      <div className="grid gap-1.5 text-[10px]">
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={config.enableGst} onChange={(e) => update({ enableGst: e.target.checked })} />
                          Enable GST
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={config.enableItemInvoice} onChange={(e) => update({ enableItemInvoice: e.target.checked })} />
                          Enable item invoice (item grid)
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={config.allowNarration} onChange={(e) => update({ allowNarration: e.target.checked })} />
                          Allow narration
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={config.enableDiscountColumn} onChange={(e) => update({ enableDiscountColumn: e.target.checked })} />
                          Enable discount column
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={config.enableRoundingOff} onChange={(e) => update({ enableRoundingOff: e.target.checked })} />
                          Enable rounding off
                        </label>
                        <label className="flex items-center gap-2">
                          <input type="checkbox" checked={config.allowVoucherClass} onChange={(e) => update({ allowVoucherClass: e.target.checked })} />
                          Allow voucher class
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
            <div className="flex justify-end gap-2 px-3 py-2 border-t border-tallyBorder bg-[#F5F5F5]">
              <Button size="sm" variant="outline" onClick={close}>Close</Button>
            </div>
          </>
        ) : (
          <>
            <div className="p-3 space-y-2">
              <p className="text-[11px]">
                Configure voucher and report options. This is a placeholder modal
                for the Tally-style configuration screen.
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>Voucher numbering and prefixes</li>
                <li>GST settings and tax classifications</li>
                <li>Appearance and printing options</li>
              </ul>
            </div>
            <div className="flex justify-end gap-2 px-3 py-2 border-t border-tallyBorder bg-[#F5F5F5]">
              <Button size="sm" variant="outline" onClick={close}>Close</Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export function CompanyModal() {
  const [search, setSearch] = React.useState('');
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const listRef = React.useRef<HTMLDivElement>(null);
  const isOpen = useAppStore((s) => s.isCompanyModalOpen);
  const toggle = useAppStore((s) => s.toggleCompanyModal);
  const companies = useAppStore((s) => s.companies);
  const companyId = useAppStore((s) => s.companyId);
  const setCurrentCompany = useAppStore((s) => s.setCurrentCompany);

  const filtered = React.useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return companies;
    return companies.filter((c) => c.name.toLowerCase().includes(q));
  }, [companies, search]);

  React.useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  React.useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') toggle();
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((i) => (i < filtered.length - 1 ? i + 1 : 0));
      }
      if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((i) => (i > 0 ? i - 1 : filtered.length - 1));
      }
      if (e.key === 'Enter' && filtered[selectedIndex]) {
        e.preventDefault();
        setCurrentCompany(filtered[selectedIndex].id);
        toggle();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, filtered, selectedIndex, toggle, setCurrentCompany]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-40 text-[11px]">
      <div className="bg-[#FEF2F2] border border-tallyBorder min-w-[400px] max-w-lg max-h-[80vh] flex flex-col shadow-lg">
        <div className="px-3 py-2 border-b border-tallyBorder bg-[#C0C0C0] font-semibold">
          Select Company (F3)
        </div>
        <div className="p-2 border-b border-tallyBorder">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search companies..."
            className="w-full border border-tallyBorder px-2 py-1 text-[11px]"
          />
        </div>
        <div ref={listRef} className="flex-1 overflow-auto p-2 space-y-0.5">
          {filtered.length === 0 ? (
            <p className="text-[10px] text-gray-500">No companies found.</p>
          ) : (
            filtered.map((c, i) => (
              <button
                key={c.id}
                type="button"
                className={`tally-list-item w-full text-left px-2 py-2 border rounded text-[11px] ${
                  c.id === companyId ? 'border-[var(--tally-selection-bar)] tally-highlight-bg' : 'border-transparent'
                } ${i === selectedIndex ? 'tally-selected' : ''}`}
                data-selected={i === selectedIndex ? 'true' : undefined}
                onClick={() => {
                  setCurrentCompany(c.id);
                  toggle();
                }}
              >
                <div className="font-semibold">{c.name}</div>
                <div className="text-[10px] text-gray-700">
                  Period: {c.financialStart} to {c.financialEnd}
                </div>
              </button>
            ))
          )}
        </div>
        <div className="flex justify-end gap-2 px-3 py-2 border-t border-tallyBorder bg-[#F5F5F5]">
          <Button size="sm" variant="outline" onClick={toggle}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}

