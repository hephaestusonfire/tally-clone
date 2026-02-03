import { useState } from 'react';
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

export function WhatsAppNumbersModal() {
  const isOpen = useWhatsAppStore((s) => s.isNumbersOpen);
  const close = useWhatsAppStore((s) => s.closeNumbers);
  const getCurrentData = useWhatsAppStore((s) => s.getCurrentData);
  const addNumber = useWhatsAppStore((s) => s.addNumber);
  const updateNumber = useWhatsAppStore((s) => s.updateNumber);
  const deleteNumber = useWhatsAppStore((s) => s.deleteNumber);

  const [editingId, setEditingId] = useState<number | null>(null);
  const [form, setForm] = useState({ label: '', number: '', countryCode: '+91' });

  if (!isOpen) return null;

  const { numbers } = getCurrentData();

  const handleAdd = () => {
    if (form.label.trim() && form.number.trim()) {
      addNumber({ label: form.label.trim(), number: form.number.trim(), countryCode: form.countryCode.trim() });
      setForm({ label: '', number: '', countryCode: '+91' });
    }
  };

  const handleEdit = (n: WhatsAppNumber) => {
    setEditingId(n.id);
    setForm({ label: n.label, number: n.number, countryCode: n.countryCode });
  };

  const handleSaveEdit = () => {
    if (editingId != null && form.label.trim() && form.number.trim()) {
      updateNumber(editingId, { label: form.label.trim(), number: form.number.trim(), countryCode: form.countryCode.trim() });
      setEditingId(null);
      setForm({ label: '', number: '', countryCode: '+91' });
    }
  };

  const handleDelete = (id: number) => {
    deleteNumber(id);
    if (editingId === id) {
      setEditingId(null);
      setForm({ label: '', number: '', countryCode: '+91' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#808080]/60 text-[11px]">
      <div className="flex w-full max-w-xl max-h-[90vh] flex-col border border-[#D0D0D0] bg-white shadow-lg rounded-sm overflow-hidden">
        <div className="border-b border-[#D0D0D0] bg-[#DC2626] px-4 py-2 text-[12px] font-bold text-white">
          WhatsApp Numbers
        </div>
        <div className="flex-1 overflow-auto p-4 space-y-3">
          <div className="flex gap-2 items-end">
            <div className="flex-1 grid grid-cols-3 gap-2">
              <input
                type="text"
                placeholder="Label"
                value={form.label}
                onChange={(e) => setForm((f) => ({ ...f, label: e.target.value }))}
                className="border border-[#D0D0D0] px-2 py-1"
              />
              <input
                type="text"
                placeholder="Country code"
                value={form.countryCode}
                onChange={(e) => setForm((f) => ({ ...f, countryCode: e.target.value }))}
                className="border border-[#D0D0D0] px-2 py-1 w-20"
              />
              <input
                type="text"
                placeholder="Number"
                value={form.number}
                onChange={(e) => setForm((f) => ({ ...f, number: e.target.value }))}
                className="border border-[#D0D0D0] px-2 py-1"
              />
            </div>
            {editingId != null ? (
              <Button size="sm" onClick={handleSaveEdit} className="bg-[#DC2626] text-white">
                Save
              </Button>
            ) : (
              <Button size="sm" onClick={handleAdd} className="bg-[#DC2626] text-white">
                Add
              </Button>
            )}
          </div>
          <div className="border border-[#D0D0D0] overflow-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#E8E8E8]">
                  <TableHead className="border-[#D0D0D0] p-1.5 text-[10px]">Label</TableHead>
                  <TableHead className="border-[#D0D0D0] p-1.5 text-[10px]">Country</TableHead>
                  <TableHead className="border-[#D0D0D0] p-1.5 text-[10px]">Number</TableHead>
                  <TableHead className="border-[#D0D0D0] p-1.5 text-[10px] w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {numbers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="border-[#D0D0D0] p-2 text-[10px] text-gray-500 text-center">
                      No numbers. Add one above.
                    </TableCell>
                  </TableRow>
                ) : (
                  numbers.map((n) => (
                    <TableRow key={n.id}>
                      <TableCell className="border-[#D0D0D0] p-1.5 text-[10px]">{n.label}</TableCell>
                      <TableCell className="border-[#D0D0D0] p-1.5 text-[10px]">{n.countryCode}</TableCell>
                      <TableCell className="border-[#D0D0D0] p-1.5 text-[10px]">{n.number}</TableCell>
                      <TableCell className="border-[#D0D0D0] p-1.5 text-[10px]">
                        <div className="flex gap-1">
                          <Button size="xs" variant="ghost" className="h-6 px-1 text-[10px]" onClick={() => handleEdit(n)}>
                            Edit
                          </Button>
                          <Button size="xs" variant="ghost" className="h-6 px-1 text-[10px] text-red-700" onClick={() => handleDelete(n.id)}>
                            Del
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        <div className="flex justify-end gap-2 px-4 py-2 border-t border-[#D0D0D0] bg-[#F5F5F5]">
          <Button size="sm" variant="outline" onClick={close}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
