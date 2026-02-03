import * as React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../ui/button';
import { DASHBOARD_TILE_DEFS } from '../dashboard/AccountingDashboard';

export function DashboardConfigModal() {
  const dashboardConfigOpen = useAppStore((s) => s.dashboardConfigOpen);
  const closeDashboardConfig = useAppStore((s) => s.closeDashboardConfig);
  const dashboardTiles = useAppStore((s) => s.dashboardTiles);
  const dashboardTileSizes = useAppStore((s) => s.dashboardTileSizes);
  const setDashboardTiles = useAppStore((s) => s.setDashboardTiles);
  const setDashboardTileSize = useAppStore((s) => s.setDashboardTileSize);

  const [localTiles, setLocalTiles] = React.useState<string[]>([]);
  const [localSizes, setLocalSizes] = React.useState<Record<string, 's' | 'm' | 'l'>>({});

  React.useEffect(() => {
    if (dashboardConfigOpen) {
      setLocalTiles([...dashboardTiles]);
      setLocalSizes({ ...dashboardTileSizes });
    }
  }, [dashboardConfigOpen, dashboardTiles, dashboardTileSizes]);

  const toggleTile = (tileId: string) => {
    setLocalTiles((prev) =>
      prev.includes(tileId) ? prev.filter((id) => id !== tileId) : [...prev, tileId]
    );
  };

  const setSize = (tileId: string, size: 's' | 'm' | 'l') => {
    setLocalSizes((prev) => ({ ...prev, [tileId]: size }));
  };

  const handleSave = () => {
    setDashboardTiles(localTiles);
    Object.entries(localSizes).forEach(([id, size]) => {
      if (localTiles.includes(id)) setDashboardTileSize(id, size);
    });
    closeDashboardConfig();
  };

  const moveUp = (index: number) => {
    if (index <= 0) return;
    setLocalTiles((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveDown = (index: number) => {
    if (index >= localTiles.length - 1) return;
    setLocalTiles((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  if (!dashboardConfigOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 text-[11px]">
      <div className="bg-white border border-[#D0D0D0] shadow-lg max-w-lg w-full max-h-[90vh] flex flex-col">
        <div className="border-b border-[#D0D0D0] bg-[#FFD700] px-3 py-2 text-[12px] font-bold text-[#7F1D1D]">
          Configure Dashboard Tiles
        </div>
        <div className="p-3 overflow-auto flex-1">
          <div className="mb-3 text-[10px] text-[#666]">
            Check to show tile; use size S (small), M (medium), L (large). Order: use ↑↓ to reorder.
          </div>
          <ul className="space-y-2">
            {DASHBOARD_TILE_DEFS.map((def) => {
              const enabled = localTiles.includes(def.id);
              const size = localSizes[def.id] ?? def.defaultSize;
              return (
                <li key={def.id} className="flex items-center gap-2 flex-wrap border-b border-[#E8E8E8] pb-2">
                  <input
                    type="checkbox"
                    checked={enabled}
                    onChange={() => toggleTile(def.id)}
                    className="rounded"
                  />
                  <span className="flex-1 min-w-[120px] font-medium">{def.label}</span>
                  <select
                    value={size}
                    onChange={(e) => setSize(def.id, e.target.value as 's' | 'm' | 'l')}
                    className="border border-[#D0D0D0] px-2 py-1 text-[10px]"
                    disabled={!enabled}
                  >
                    <option value="s">Small</option>
                    <option value="m">Medium</option>
                    <option value="l">Large</option>
                  </select>
                  {enabled && (
                    <>
                      <button
                        type="button"
                        className="px-1.5 py-0.5 border border-[#D0D0D0] text-[10px]"
                        onClick={() => {
                          const i = localTiles.indexOf(def.id);
                          moveUp(i);
                        }}
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        className="px-1.5 py-0.5 border border-[#D0D0D0] text-[10px]"
                        onClick={() => {
                          const i = localTiles.indexOf(def.id);
                          moveDown(i);
                        }}
                      >
                        ↓
                      </button>
                    </>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
        <div className="border-t border-[#D0D0D0] p-3 flex justify-end gap-2">
          <Button type="button" variant="outline" size="sm" className="text-[11px]" onClick={closeDashboardConfig}>
            Cancel
          </Button>
          <Button type="button" size="sm" className="text-[11px] bg-[#DC2626] text-white" onClick={handleSave}>
            Save
          </Button>
        </div>
      </div>
    </div>
  );
}
