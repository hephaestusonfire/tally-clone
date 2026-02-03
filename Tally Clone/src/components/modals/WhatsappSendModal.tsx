import * as React from 'react';
import { useWhatsAppStore } from '../../store/useWhatsAppStore';
import { Button } from '../ui/button';

type Mode = 'current' | 'others';

export function WhatsappSendModal() {
  const isCurrentOpen = useWhatsAppStore((s) => s.isWhatsappSendCurrentOpen);
  const isOthersOpen = useWhatsAppStore((s) => s.isWhatsappSendOthersOpen);
  const closeCurrent = useWhatsAppStore((s) => s.closeWhatsappSendCurrent);
  const closeOthers = useWhatsAppStore((s) => s.closeWhatsappSendOthers);
  const getCurrentData = useWhatsAppStore((s) => s.getCurrentData);
  const getWhatsappConfig = useWhatsAppStore((s) => s.getWhatsappConfig);

  const mode: Mode = isOthersOpen ? 'others' : isCurrentOpen ? 'current' : null!;
  const isOpen = isCurrentOpen || isOthersOpen;
  const close = mode === 'others' ? closeOthers : closeCurrent;

  const { numbers } = getCurrentData();
  const config = getWhatsappConfig();

  const [registeredNo, setRegisteredNo] = React.useState('');
  const [message, setMessage] = React.useState(config.messageTemplateForInvoices);
  const [includePdf, setIncludePdf] = React.useState(config.attachPdfByDefault);
  const [contentType, setContentType] = React.useState('Report');
  const [scheduleTime, setScheduleTime] = React.useState('');

  React.useEffect(() => {
    if (isOpen) {
      setMessage(config.messageTemplateForInvoices);
      setIncludePdf(config.attachPdfByDefault);
      if (numbers.length) setRegisteredNo(numbers[0].countryCode + numbers[0].number);
    }
  }, [isOpen, config.messageTemplateForInvoices, config.attachPdfByDefault, numbers]);

  if (!isOpen) return null;

  const handleSend = () => {
    const payload = {
      mode,
      registeredWhatsAppNo: registeredNo,
      messageTemplate: message,
      includePdfAttachment: includePdf,
      ...(mode === 'others' && { contentType, scheduleTime: scheduleTime || undefined }),
    };
    console.log('WhatsApp send (stub):', JSON.stringify(payload, null, 2));
    close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 text-[11px]">
      <div className="bg-[#FEF2F2] border border-[#D0D0D0] shadow-lg min-w-[400px] max-w-[480px] max-h-[90vh] flex flex-col">
        <div className="px-3 py-2 border-b border-[#D0D0D0] bg-[#C0C0C0] font-semibold">
          Send via WhatsApp ({mode === 'current' ? 'Current' : 'Others'})
        </div>
        <div className="p-3 space-y-2 overflow-auto">
          {mode === 'others' && (
            <div>
              <label className="block text-[10px] font-medium text-gray-700 mb-0.5">Select content type</label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="border border-[#D0D0D0] bg-white px-2 py-1 w-full text-[11px]"
              >
                <option value="Report">Report</option>
                <option value="Voucher">Voucher</option>
                <option value="Reminder">Reminder</option>
              </select>
            </div>
          )}
          <div>
            <label className="block text-[10px] font-medium text-gray-700 mb-0.5">Registered WhatsApp No.</label>
            <select
              value={registeredNo}
              onChange={(e) => setRegisteredNo(e.target.value)}
              className="border border-[#D0D0D0] bg-white px-2 py-1 w-full text-[11px]"
            >
              <option value="">-- Select --</option>
              {numbers.map((n) => (
                <option key={n.id} value={n.countryCode + n.number}>
                  {n.label} ({n.countryCode} {n.number})
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-700 mb-0.5">Message template</label>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={4} className="border border-[#D0D0D0] bg-white px-2 py-1 w-full text-[11px] resize-y" />
          </div>
          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" checked={includePdf} onChange={(e) => setIncludePdf(e.target.checked)} className="border border-[#D0D0D0]" />
              <span className="text-[11px]">Include PDF attachment</span>
            </label>
          </div>
          {mode === 'others' && (
            <div>
              <label className="block text-[10px] font-medium text-gray-700 mb-0.5">Schedule time (optional)</label>
              <input type="datetime-local" value={scheduleTime} onChange={(e) => setScheduleTime(e.target.value)} className="border border-[#D0D0D0] bg-white px-2 py-1 w-full text-[11px]" />
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 px-3 py-2 border-t border-[#D0D0D0] bg-[#F5F5F5]">
          <Button size="sm" variant="outline" onClick={close}>Cancel</Button>
          <Button size="sm" className="bg-[#25D366] text-white hover:bg-[#20BD5A]" onClick={handleSend}>Send</Button>
        </div>
      </div>
    </div>
  );
}
