import * as React from 'react';
import { useGatewayStore } from '../../store/useGatewayStore';
import { Button } from '../ui/button';

export function LineColorModal() {
  const isOpen = useGatewayStore((s) => s.isLineColorModalOpen);
  const close = useGatewayStore((s) => s.closeLineColorModal);
  const lineColorSettings = useGatewayStore((s) => s.lineColorSettings);
  const setLineColorSettings = useGatewayStore((s) => s.setLineColorSettings);
  const applyLineColors = useGatewayStore((s) => s.applyLineColors);

  React.useEffect(() => {
    if (isOpen) applyLineColors();
  }, [isOpen, lineColorSettings, applyLineColors]);

  const handleChange = (key: 'highlightColor' | 'selectionBarColor', value: string) => {
    setLineColorSettings({ [key]: value });
    applyLineColors();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#808080]/60 text-[11px]">
      <div className="flex w-full max-w-sm flex-col border border-[#D0D0D0] bg-white shadow-lg rounded-sm overflow-hidden">
        <div className="border-b border-[#D0D0D0] bg-[#FFD700] px-4 py-2 text-[12px] font-bold text-[#7F1D1D]">
          Line Color / Theme
        </div>
        <div className="p-4 space-y-3">
          <label className="block">
            <span className="block text-[10px] font-medium text-gray-600 mb-1">Highlight color</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={lineColorSettings.highlightColor}
                onChange={(e) => handleChange('highlightColor', e.target.value)}
                className="w-10 h-8 border border-[#D0D0D0] cursor-pointer"
              />
              <input
                type="text"
                value={lineColorSettings.highlightColor}
                onChange={(e) => handleChange('highlightColor', e.target.value)}
                className="flex-1 border border-[#D0D0D0] px-2 py-1 text-[10px]"
              />
            </div>
          </label>
          <label className="block">
            <span className="block text-[10px] font-medium text-gray-600 mb-1">Selection bar color</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={lineColorSettings.selectionBarColor}
                onChange={(e) => handleChange('selectionBarColor', e.target.value)}
                className="w-10 h-8 border border-[#D0D0D0] cursor-pointer"
              />
              <input
                type="text"
                value={lineColorSettings.selectionBarColor}
                onChange={(e) => handleChange('selectionBarColor', e.target.value)}
                className="flex-1 border border-[#D0D0D0] px-2 py-1 text-[10px]"
              />
            </div>
          </label>
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
