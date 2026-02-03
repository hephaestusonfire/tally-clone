import * as React from 'react';
import { useShareStore } from '../../store/useShareStore';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../ui/button';

type Mode = 'current' | 'others';

export function EmailSendModal() {
  const isCurrentOpen = useShareStore((s) => s.isEmailSendCurrentOpen);
  const isOthersOpen = useShareStore((s) => s.isEmailSendOthersOpen);
  const closeCurrent = useShareStore((s) => s.closeEmailSendCurrent);
  const closeOthers = useShareStore((s) => s.closeEmailSendOthers);
  const emailConfig = useShareStore((s) => s.emailConfig);
  const companyName = useAppStore((s) => s.companyName);

  const mode: Mode = isOthersOpen ? 'others' : isCurrentOpen ? 'current' : null!;
  const isOpen = isCurrentOpen || isOthersOpen;
  const close = mode === 'others' ? closeOthers : closeCurrent;

  const [to, setTo] = React.useState('');
  const [cc, setCc] = React.useState('');
  const [subject, setSubject] = React.useState('');
  const [body, setBody] = React.useState('');
  const [emailType, setEmailType] = React.useState('Report');

  React.useEffect(() => {
    if (isOpen) {
      setSubject(companyName ? `Report – ${companyName}` : 'Report');
      setBody(emailConfig.predefinedMessage || 'Please find attached.');
    }
  }, [isOpen, companyName, emailConfig.predefinedMessage]);

  if (!isOpen) return null;

  const handleSend = () => {
    const payload = { to, cc, subject, body, emailType: mode === 'others' ? emailType : 'Current Report' };
    console.log('Email send (stub):', payload);
    close();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 text-[11px]">
      <div className="bg-[#FEF2F2] border border-[#D0D0D0] shadow-lg min-w-[420px] max-w-[500px] max-h-[90vh] flex flex-col">
        <div className="px-3 py-2 border-b border-[#D0D0D0] bg-[#C0C0C0] font-semibold">
          {mode === 'current' ? 'E-mail Current Report' : 'E-mail Others'}
        </div>
        <div className="p-3 space-y-2 overflow-auto">
          {mode === 'others' && (
            <div>
              <label className="block text-[10px] font-medium text-gray-700 mb-0.5">What do you want to e-mail?</label>
              <select
                value={emailType}
                onChange={(e) => setEmailType(e.target.value)}
                className="border border-[#D0D0D0] bg-white px-2 py-1 w-full text-[11px]"
              >
                <option value="Report">Report</option>
                <option value="Voucher">Voucher</option>
                <option value="Reminder">Reminder</option>
              </select>
            </div>
          )}
          <div>
            <label className="block text-[10px] font-medium text-gray-700 mb-0.5">To</label>
            <input type="text" value={to} onChange={(e) => setTo(e.target.value)} placeholder="email@example.com" className="border border-[#D0D0D0] bg-white px-2 py-1 w-full text-[11px]" />
          </div>
          {emailConfig.showCc && (
            <div>
              <label className="block text-[10px] font-medium text-gray-700 mb-0.5">Cc</label>
              <input type="text" value={cc} onChange={(e) => setCc(e.target.value)} className="border border-[#D0D0D0] bg-white px-2 py-1 w-full text-[11px]" />
            </div>
          )}
          <div>
            <label className="block text-[10px] font-medium text-gray-700 mb-0.5">Subject</label>
            <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="border border-[#D0D0D0] bg-white px-2 py-1 w-full text-[11px]" />
          </div>
          <div>
            <label className="block text-[10px] font-medium text-gray-700 mb-0.5">Body</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} className="border border-[#D0D0D0] bg-white px-2 py-1 w-full text-[11px] resize-y" />
          </div>
        </div>
        <div className="flex justify-end gap-2 px-3 py-2 border-t border-[#D0D0D0] bg-[#F5F5F5]">
          <Button size="sm" variant="outline" onClick={close}>Cancel</Button>
          <Button size="sm" className="bg-[#DC2626] text-white hover:bg-[#B91C1C]" onClick={handleSend}>Send</Button>
        </div>
      </div>
    </div>
  );
}
