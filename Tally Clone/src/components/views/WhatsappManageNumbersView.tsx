import * as React from 'react';
import { useWhatsAppStore, type WhatsAppNumber } from '../../store/useWhatsAppStore';
import { Button } from '../ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';
import { ScrollArea } from '../ui/scroll-area';

export function WhatsappManageNumbersView() {
  const getCurrentData = useWhatsAppStore((s) => s.getCurrentData);
  const addNumber = useWhatsAppStore((s) => s.addNumber);
  const updateNumber = useWhatsAppStore((s) => s.updateNumber);
  const deleteNumber = useWhatsAppStore((s) => s.deleteNumber);

  const { numbers } = getCurrentData();
  const [editingId, setEditingId] = React.useState<number | null>(null);
  const [form, setForm] = React.useState({ name: '', businessName: '', number: '', countryCode: '+91', isDefault: false });

  const handleAdd = () => {
    if (form.name.trim() && form.number.trim()) {
      addNumber({
        label: form.name.trim(),
        businessName: form.businessName.trim() || undefined,
        number: form.number.trim(),
        countryCode: form.countryCode.trim(),
        isDefault: form.isDefault,
      });
      setForm({ name: '', businessName: '', number: '', countryCode: '+91', isDefault: false });
    }
  };

  const handleEdit = (n: WhatsAppNumber) => {
    setEditingId(n.id);
    setForm({
      name: n.label,
      businessName: n.businessName ?? '',
      number: n.number,
      countryCode: n.countryCode,
      isDefault: n.isDefault ?? false,
    });
  };

  const handleSaveEdit = () => {
    if (editingId != null && form.name.trim() && form.number.trim()) {
      updateNumber(editingId, {
        label: form.name.trim(),
        businessName: form.businessName.trim() || undefined,
        number: form.number.trim(),
        countryCode: form.countryCode.trim(),
        isDefault: form.isDefault,
      });
      setEditingId(null);
      setForm({ name: '', businessName: '', number: '', countryCode: '+91', isDefault: false });
    }
  };

  const setDefault = (id: number) => {
    numbers.forEach((n) => updateNumber(n.id, { isDefault: n.id === id }));
  };

  return (
    <div className="flex flex-col h-full overflow-hidden p-4">
      <div className="font-bold text-[14px] text-[#7F1D1D] mb-3">WhatsApp Nos.</div>
      <div className="flex gap-2 items-end mb-3 flex-wrap">
        <input
          type="text"
          placeholder="Name"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          className="border border-[#D0D0D0] px-2 py-1 text-[11px] w-28"
        />
        <input
          type="text"
          placeholder="Business Name"
          value={form.businessName}
          onChange={(e) => setForm((f) => ({ ...f, businessName: e.target.value }))}
          className="border border-[#D0D0D0] px-2 py-1 text-[11px] w-32"
        />
        <input
          type="text"
          placeholder="Country code"
          value={form.countryCode}
          onChange={(e) => setForm((f) => ({ ...f, countryCode: e.target.value }))}
          className="border border-[#D0D0D0] px-2 py-1 text-[11px] w-20"
        />
        <input
          type="text"
          placeholder="WhatsApp No."
          value={form.number}
          onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))}
          className="border border-[#D0D0D0] px-2 py-1 text-[11px] w-28"
        />
        <label className="flex items-center gap-1 text-[11px]">
          <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm((f) => ({ ...f, isDefault: e.target.checked }))} />
          Default?
        </label>
        {editingId != null ? (
          <Button size="sm" className="bg-[#DC2626] text-white text-[11px]" onClick={handleSaveEdit}>Save</Button>
        ) : (
          <Button size="sm" className="bg-[#DC2626] text-white text-[11px]" onClick={handleAdd}>Add</Button>
        )}
      </div>
      <div className="border border-[#D0D0D0] bg-white flex-1 min-h-0 flex flex-col">
        <ScrollArea className="flex-1">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#DC2626] hover:bg-[#DC2626]">
                <TableHead className="border-[#D0D0D0] text-white text-[10px]">Name</TableHead>
                <TableHead className="border-[#D0D0D0] text-white text-[10px]">Business Name</TableHead>
                <TableHead className="border-[#D0D0D0] text-white text-[10px]">WhatsApp No.</TableHead>
                <TableHead className="border-[#D0D0D0] text-white text-[10px] w-20">Default?</TableHead>
                <TableHead className="border-[#D0D0D0] text-white text-[10px] w-28">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {numbers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="border-[#D0D0D0] p-2 text-[11px] text-gray-500 text-center">
                    No numbers. Add one above.
                  </TableCell>
                </TableRow>
              ) : (
                numbers.map((n) => (
                  <TableRow key={n.id} className="hover:bg-[#FEF2F2]">
                    <TableCell className="border-[#D0D0D0] p-1.5 text-[11px]">{n.label}</TableCell>
                    <TableCell className="border-[#D0D0D0] p-1.5 text-[11px]">{n.businessName ?? '–'}</TableCell>
                    <TableCell className="border-[#D0D0D0] p-1.5 text-[11px]">{n.countryCode} {n.number}</TableCell>
                    <TableCell className="border-[#D0D0D0] p-1.5 text-[11px]">
                      {n.isDefault ? 'Yes' : <button type="button" className="text-[#DC2626] underline text-[10px]" onClick={() => setDefault(n.id)}>Set</button>}
                    </TableCell>
                    <TableCell className="border-[#D0D0D0] p-1.5">
                      <div className="flex gap-1">
                        <Button size="xs" variant="ghost" className="h-6 px-1 text-[10px]" onClick={() => handleEdit(n)}>Edit</Button>
                        <Button size="xs" variant="ghost" className="h-6 px-1 text-[10px] text-red-700" onClick={() => deleteNumber(n.id)}>Delete</Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </ScrollArea>
      </div>
    </div>
  );
}
