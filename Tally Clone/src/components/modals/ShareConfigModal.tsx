import * as React from 'react';
import { useShareStore } from '../../store/useShareStore';
import { useWhatsAppStore } from '../../store/useWhatsAppStore';
import { Button } from '../ui/button';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

/** Inline email config panel (same content as EmailConfigModal, without modal wrapper) for ShareConfigModal tab */
function EmailConfigPanel() {
  const emailConfig = useShareStore((s) => s.emailConfig);
  const setEmailConfig = useShareStore((s) => s.setEmailConfig);
  const [showMore, setShowMore] = React.useState(false);
  const update = (patch: Parameters<typeof setEmailConfig>[0]) => setEmailConfig(patch);
  return (
    <ScrollArea className="max-h-[50vh]">
      <div className="border border-[#D0D0D0] bg-white p-2">
        <div className="flex items-center justify-between px-2 py-1.5 border-b border-[#D0D0D0] bg-[#FFD700]">
          <span className="font-bold text-[#7F1D1D] text-[11px]">List of Configurations</span>
          <button type="button" className="text-[10px] font-medium text-[#7F1D1D] underline" onClick={() => setShowMore((m) => !m)}>
            {showMore ? 'Show Less' : 'Show More'}
          </button>
        </div>
        <div className="p-2 space-y-1 text-[11px]">
          <div className="font-semibold text-[#7F1D1D] text-[10px] uppercase">E-mail Settings</div>
          <div className="grid grid-cols-[1fr_auto] gap-2 items-center py-0.5">
            <span>Show Cc:</span>
            <select value={emailConfig.showCc ? 'Yes' : 'No'} onChange={(e) => update({ showCc: e.target.value === 'Yes' })} className="border border-[#D0D0D0] px-1.5 py-0.5 w-20 text-[11px]">
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
            <span>Show Bcc:</span>
            <select value={emailConfig.showBcc ? 'Yes' : 'No'} onChange={(e) => update({ showBcc: e.target.value === 'Yes' })} className="border border-[#D0D0D0] px-1.5 py-0.5 w-20 text-[11px]">
              <option value="Yes">Yes</option>
              <option value="No">No</option>
            </select>
          </div>
          {showMore && (
            <>
              <div className="font-semibold text-[#7F1D1D] text-[10px] uppercase pt-1">Company Details</div>
              <div className="grid grid-cols-[1fr_auto] gap-2 items-center py-0.5">
                <span>Include company logo:</span>
                <select value={emailConfig.includeCompanyLogo ? 'Yes' : 'No'} onChange={(e) => update({ includeCompanyLogo: e.target.value === 'Yes' })} className="border border-[#D0D0D0] px-1.5 py-0.5 w-20 text-[11px]">
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                <span>Image Path:</span>
                <input type="text" value={emailConfig.imagePath} onChange={(e) => update({ imagePath: e.target.value })} className="border border-[#D0D0D0] px-1.5 py-0.5 text-[11px] w-48" />
              </div>
            </>
          )}
        </div>
      </div>
    </ScrollArea>
  );
}

export function ShareConfigModal() {
  const isOpen = useShareStore((s) => s.isShareConfigOpen);
  const close = useShareStore((s) => s.closeShareConfig);
  const getWhatsappConfig = useWhatsAppStore((s) => s.getWhatsappConfig);
  const setWhatsappConfig = useWhatsAppStore((s) => s.setWhatsappConfig);
  const [activeTab, setActiveTab] = React.useState('email');

  if (!isOpen) return null;

  const wa = getWhatsappConfig();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 text-[11px]">
      <div className="bg-[#FEF2F2] border border-[#D0D0D0] shadow-lg min-w-[520px] max-w-[620px] max-h-[90vh] flex flex-col">
        <div className="px-3 py-2 border-b border-[#D0D0D0] bg-[#C0C0C0] font-semibold">
          Share Configuration
        </div>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList currentValue={activeTab} onValueChange={setActiveTab} className="border-0 bg-[#E0E0E0]">
            <TabsTrigger tabValue="email" currentValue={activeTab} onValueChange={setActiveTab}>E-mail Configuration</TabsTrigger>
            <TabsTrigger tabValue="whatsapp" currentValue={activeTab} onValueChange={setActiveTab}>WhatsApp Configuration</TabsTrigger>
          </TabsList>
          <TabsContent when="email" currentValue={activeTab} className="p-3 border-0">
            <EmailConfigPanel />
          </TabsContent>
          <TabsContent when="whatsapp" currentValue={activeTab} className="p-3 border-0">
            <div className="border border-[#D0D0D0] bg-white p-3 space-y-2">
              <div className="grid grid-cols-[180px_1fr] gap-2 items-center text-[11px]">
                <label>Default Business WhatsApp No.</label>
                <input
                  type="text"
                  value={wa.defaultBusinessWhatsAppNo}
                  onChange={(e) => setWhatsappConfig({ defaultBusinessWhatsAppNo: e.target.value })}
                  placeholder="+91 98765 43210"
                  className="border border-[#D0D0D0] px-2 py-1 text-[11px]"
                />
                <label>Message template for invoices</label>
                <textarea
                  value={wa.messageTemplateForInvoices}
                  onChange={(e) => setWhatsappConfig({ messageTemplateForInvoices: e.target.value })}
                  rows={3}
                  className="border border-[#D0D0D0] px-2 py-1 text-[11px] resize-y"
                />
                <label>Attach PDF by default</label>
                <select
                  value={wa.attachPdfByDefault ? 'Yes' : 'No'}
                  onChange={(e) => setWhatsappConfig({ attachPdfByDefault: e.target.value === 'Yes' })}
                  className="border border-[#D0D0D0] px-2 py-1 text-[11px] w-20"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
                <label>Use short links</label>
                <select
                  value={wa.useShortLinks ? 'Yes' : 'No'}
                  onChange={(e) => setWhatsappConfig({ useShortLinks: e.target.value === 'Yes' })}
                  className="border border-[#D0D0D0] px-2 py-1 text-[11px] w-20"
                >
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                </select>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        <div className="flex justify-between items-center px-3 py-2 border-t border-[#D0D0D0] bg-[#F5F5F5]">
          <span className="text-[10px] text-gray-600">Q: Quit · A: Accept</span>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" onClick={close}>Q: Quit</Button>
            <Button size="sm" className="bg-[#DC2626] text-white hover:bg-[#B91C1C]" onClick={close}>A: Accept</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
