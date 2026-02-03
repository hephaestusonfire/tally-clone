import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../ui/table';

const EXPORT_FORMATS = ['Excel', 'PDF', 'XML', 'HTML', 'JPEG'] as const;
const OUTPUT_TYPES = ['Screen', 'Printer', 'File'] as const;

const DEFAULT_FOLDER = 'C:\\TallyPrime\\Reports\\';

export function ExportModal() {
  const isOpen = useAppStore((s) => s.isExportModalOpen);
  const close = useAppStore((s) => s.closeExportModal);
  const [format, setFormat] = useState<string>('Excel');
  const [outputType, setOutputType] = useState<string>('File');
  const [folder, setFolder] = useState(DEFAULT_FOLDER);

  if (!isOpen) return null;

  const handleBrowse = () => {
    // In browser we cannot open native folder picker for path; keep default or could use optional showDirectoryPicker
    setFolder(DEFAULT_FOLDER);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#808080]/70 text-[11px]">
      <div className="flex w-full max-w-2xl flex-col border border-[#D0D0D0] bg-white shadow-lg">
        {/* Title: Export - yellow tab */}
        <div className="border-b border-[#D0D0D0] bg-[#FFD700] px-3 py-2 text-[12px] font-bold text-[#7F1D1D]">
          Export
        </div>

        <div className="flex flex-1 min-h-0">
          {/* Left: Export Format table - Export Format | Excel | PDF | XML | HTML | JPEG */}
          <div className="w-[280px] min-w-[280px] border-r border-[#D0D0D0] bg-[#F5F5F5]">
            <Table>
              <TableHeader>
                <TableRow className="bg-[#E8E8E8] hover:bg-[#E8E8E8]">
                  <TableHead className="border-[#D0D0D0] p-1.5 text-[10px] font-bold">
                    Export Format
                  </TableHead>
                  <TableHead className="border-[#D0D0D0] p-1.5 text-[10px] font-bold w-20">
                    Format
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {EXPORT_FORMATS.map((f) => (
                  <TableRow
                    key={f}
                    className={`cursor-pointer ${
                      format === f ? 'bg-[#DC2626] text-white' : 'hover:bg-[#E0E0E0]'
                    }`}
                    onClick={() => setFormat(f)}
                  >
                    <TableCell className="border-[#D0D0D0] p-1.5 text-[10px]">
                      Export Format
                    </TableCell>
                    <TableCell className="border-[#D0D0D0] p-1.5 text-[10px]">
                      {f}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Right: Settings panel */}
          <div className="flex-1 p-4 space-y-4 bg-white">
            <div className="grid grid-cols-[100px_1fr] gap-2 items-center text-[10px]">
              <span className="font-semibold text-[#333]">Output Type</span>
              <div className="flex gap-2">
                {OUTPUT_TYPES.map((t) => (
                  <label
                    key={t}
                    className="inline-flex items-center gap-1 cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="outputType"
                      checked={outputType === t}
                      onChange={() => setOutputType(t)}
                      className="border border-[#D0D0D0]"
                    />
                    <span>{t}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-[100px_1fr] gap-2 items-center text-[10px]">
              <span className="font-semibold text-[#333]">Folder</span>
              <div className="flex gap-1 items-center">
                <input
                  type="text"
                  value={folder}
                  onChange={(e) => setFolder(e.target.value)}
                  className="flex-1 border border-[#D0D0D0] bg-white px-2 py-1 text-[10px] min-w-0"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="text-[10px] px-2 py-1 h-7 whitespace-nowrap border-[#D0D0D0] flex-shrink-0"
                  onClick={handleBrowse}
                >
                  Browse
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-2 px-4 py-2 border-t border-[#D0D0D0] bg-[#F5F5F5]">
          <Button size="sm" variant="outline" onClick={close} className="text-[11px]">
            Cancel
          </Button>
          <Button
            size="sm"
            className="bg-[#DC2626] text-white hover:bg-[#B91C1C] text-[11px]"
            onClick={close}
          >
            Export
          </Button>
        </div>
      </div>
    </div>
  );
}
