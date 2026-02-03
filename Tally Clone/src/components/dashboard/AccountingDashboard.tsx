import * as React from 'react';
import {
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAppStore } from '../../store/useAppStore';
import { Card } from '../ui/card';
import type { AppView } from '../../store/useAppStore';

const ASSET_GROUPS = new Set(['Fixed Assets', 'Current Assets', 'Bank Accounts', 'Cash-in-hand']);
const LIABILITY_GROUPS = new Set(['Capital Accounts', 'Capital Account', 'Secured Loans', 'Current Liabilities']);

export const DASHBOARD_TILE_DEFS: {
  id: string;
  label: string;
  defaultSize: 's' | 'm' | 'l';
  drillDownView: AppView;
}[] = [
  { id: 'sales-trend', label: 'Sales Trend', defaultSize: 'm', drillDownView: 'day-book' },
  { id: 'purchase-trend', label: 'Purchase Trend', defaultSize: 'm', drillDownView: 'day-book' },
  { id: 'cash-flow', label: 'Cash In / Out', defaultSize: 's', drillDownView: 'banking' },
  { id: 'pl-snapshot', label: 'P&L Snapshot', defaultSize: 's', drillDownView: 'profit-loss' },
  { id: 'assets-liabilities', label: 'Assets & Liabilities', defaultSize: 'l', drillDownView: 'balance-sheet' },
  { id: 'receivables-aging', label: 'Receivables / Payables', defaultSize: 's', drillDownView: 'receivables-payables' },
  { id: 'inventory-summary', label: 'Inventory Summary', defaultSize: 's', drillDownView: 'stock-summary' },
  { id: 'ratios', label: 'Accounting Ratios', defaultSize: 's', drillDownView: 'ratio-analysis' },
  { id: 'bank-balances', label: 'Bank Balances', defaultSize: 's', drillDownView: 'banking' },
];

function getTileSize(size: 's' | 'm' | 'l'): string {
  switch (size) {
    case 's': return 'col-span-1';
    case 'm': return 'col-span-1 lg:col-span-2';
    case 'l': return 'col-span-2';
    default: return 'col-span-1';
  }
}

export function AccountingDashboard() {
  const mockData = useAppStore((s) => s.mockData);
  const stockItems = useAppStore((s) => s.stockItems);
  const companies = useAppStore((s) => s.companies);
  const companyId = useAppStore((s) => s.companyId);
  const setActiveView = useAppStore((s) => s.setActiveView);
  const setCurrentCompany = useAppStore((s) => s.setCurrentCompany);
  const dashboardTiles = useAppStore((s) => s.dashboardTiles);
  const dashboardTileSizes = useAppStore((s) => s.dashboardTileSizes);
  const openDashboardConfig = useAppStore((s) => s.openDashboardConfig);
  const openExportModal = useAppStore((s) => s.openExportModal);

  const [periodFrom, setPeriodFrom] = React.useState('2024-05-01');
  const [periodTo, setPeriodTo] = React.useState('2024-05-31');

  const totalSales = React.useMemo(
    () => mockData.vouchers.filter((v) => v.type === 'Sales').reduce((s, v) => s + v.amount, 0),
    [mockData.vouchers]
  );
  const totalPurchase = React.useMemo(
    () => mockData.vouchers.filter((v) => v.type === 'Purchase').reduce((s, v) => s + v.amount, 0),
    [mockData.vouchers]
  );
  const cashIn = React.useMemo(
    () => mockData.vouchers.filter((v) => v.type === 'Receipt').reduce((s, v) => s + v.amount, 0),
    [mockData.vouchers]
  );
  const cashOut = React.useMemo(
    () => mockData.vouchers.filter((v) => v.type === 'Payment').reduce((s, v) => s + v.amount, 0),
    [mockData.vouchers]
  );
  const salesTrend = React.useMemo(() => {
    const byMonth: Record<string, { sales: number; purchase: number }> = {};
    mockData.vouchers.forEach((v) => {
      const month = v.date.slice(0, 7);
      if (!byMonth[month]) byMonth[month] = { sales: 0, purchase: 0 };
      if (v.type === 'Sales') byMonth[month].sales += v.amount;
      if (v.type === 'Purchase') byMonth[month].purchase += v.amount;
    });
    return Object.entries(byMonth).map(([name, v]) => ({ name, ...v }));
  }, [mockData.vouchers]);
  const totalAssets = React.useMemo(
    () => mockData.ledgers.filter((l) => ASSET_GROUPS.has(l.under)).reduce((s, l) => s + l.amount, 0),
    [mockData.ledgers]
  );
  const totalLiabilities = React.useMemo(
    () => mockData.ledgers.filter((l) => LIABILITY_GROUPS.has(l.under)).reduce((s, l) => s + l.amount, 0),
    [mockData.ledgers]
  );
  const inventoryValue = React.useMemo(
    () => stockItems.reduce((s, i) => s + (i.openingQty * i.rate || i.value), 0),
    [stockItems]
  );
  const bankLedgers = React.useMemo(
    () =>
      mockData.ledgers.filter(
        (l) =>
          l.under === 'Bank Accounts' ||
          l.name.toLowerCase().includes('bank') ||
          l.under === 'Cash-in-hand' ||
          l.name.toLowerCase().includes('cash')
      ),
    [mockData.ledgers]
  );
  const grossProfit = totalSales - totalPurchase;
  const indirectExp = mockData.ledgers
    .filter((l) => l.under === 'Indirect Expenses')
    .reduce((s, l) => s + l.amount, 0);
  const indirectInc = mockData.ledgers
    .filter((l) => ['Direct Incomes', 'Indirect Incomes'].includes(l.under))
    .reduce((s, l) => s + l.amount, 0);
  const netProfit = grossProfit + indirectInc - indirectExp;
  const inventoryTurnover = totalPurchase && inventoryValue ? (totalPurchase / inventoryValue).toFixed(2) : '—';
  const debtEquity =
    totalLiabilities && mockData.ledgers.find((l) => l.under === 'Capital Accounts')?.amount
      ? (totalLiabilities / (mockData.ledgers.find((l) => l.under === 'Capital Accounts')?.amount ?? 1)).toFixed(2)
      : '—';
  const debtors = mockData.ledgers.filter((l) => /debtor/i.test(l.name)).reduce((s, l) => s + l.amount, 0);
  const receivableDays = totalSales ? ((debtors * 365) / totalSales).toFixed(0) : '—';
  const roi = totalAssets ? ((netProfit / totalAssets) * 100).toFixed(1) : '—';
  const creditors = mockData.ledgers.filter((l) => /creditor/i.test(l.name)).reduce((s, l) => s + l.amount, 0);

  const assetsLiabilitiesData = React.useMemo(() => {
    const total = totalAssets + totalLiabilities;
    if (total === 0) return [{ name: 'Assets', value: 1 }, { name: 'Liabilities', value: 1 }];
    return [
      { name: 'Assets', value: Math.max(totalAssets, 0.01) },
      { name: 'Liabilities', value: Math.max(totalLiabilities, 0.01) },
    ];
  }, [totalAssets, totalLiabilities]);

  const handlePrint = () => {
    window.print();
  };

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        useAppStore.getState().setActiveView('gateway');
        e.preventDefault();
      }
      if (e.key === 'g' && !e.ctrlKey && !e.altKey && !e.metaKey) {
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT') return;
        useAppStore.getState().setActiveView('gateway');
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const renderTile = (tileId: string) => {
    const def = DASHBOARD_TILE_DEFS.find((d) => d.id === tileId);
    if (!def) return null;
    const size = dashboardTileSizes[tileId] ?? def.defaultSize;
    const span = getTileSize(size);
    const onClick = () => setActiveView(def.drillDownView);

    const baseClass = `cursor-pointer border border-[#D0D0D0] bg-white hover:border-[#DC2626] hover:shadow-sm active:scale-[0.98] transition-all flex flex-col min-h-[100px] sm:min-h-[100px] print:break-inside-avoid touch-manipulation overflow-hidden ${span}`;

    switch (tileId) {
      case 'sales-trend':
        return (
          <Card key={tileId} className={`${baseClass} p-2`} onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onClick()}>
            <div className="text-[10px] font-bold text-[#7F1D1D] mb-1 shrink-0">Sales Trend</div>
            <div className="flex-1 min-h-[100px] max-h-[140px] overflow-hidden">
              <ResponsiveContainer width="100%" height={100}>
                <LineChart data={salesTrend}>
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} width={40} />
                  <Tooltip />
                  <Line type="monotone" dataKey="sales" stroke="#00897B" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        );
      case 'purchase-trend':
        return (
          <Card key={tileId} className={`${baseClass} p-2`} onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onClick()}>
            <div className="text-[10px] font-bold text-[#7F1D1D] mb-1 shrink-0">Purchase Trend</div>
            <div className="flex-1 min-h-[100px] max-h-[140px] overflow-hidden">
              <ResponsiveContainer width="100%" height={100}>
                <LineChart data={salesTrend}>
                  <XAxis dataKey="name" tick={{ fontSize: 9 }} />
                  <YAxis tick={{ fontSize: 9 }} width={40} />
                  <Tooltip />
                  <Line type="monotone" dataKey="purchase" stroke="#FF7043" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        );
      case 'cash-flow':
        return (
          <Card key={tileId} className={`${baseClass} px-3 py-2`} onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onClick()}>
            <div className="text-[10px] font-bold text-[#7F1D1D] mb-1 shrink-0">Cash In / Out</div>
            <div className="text-[11px] truncate">In: ₹ {cashIn.toLocaleString('en-IN')}</div>
            <div className="text-[11px] truncate">Out: ₹ {cashOut.toLocaleString('en-IN')}</div>
            <div className="text-[11px] font-semibold truncate">Net: ₹ {(cashIn - cashOut).toLocaleString('en-IN')}</div>
          </Card>
        );
      case 'pl-snapshot':
        return (
          <Card key={tileId} className={`${baseClass} px-3 py-2`} onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onClick()}>
            <div className="text-[10px] font-bold text-[#7F1D1D] mb-1 shrink-0">P&L Snapshot</div>
            <div className="text-[11px] truncate">Sales: ₹ {totalSales.toLocaleString('en-IN')}</div>
            <div className="text-[11px] truncate">Purchase: ₹ {totalPurchase.toLocaleString('en-IN')}</div>
            <div className="text-[11px] font-semibold text-green-700 truncate">Net Profit: ₹ {netProfit.toLocaleString('en-IN')}</div>
          </Card>
        );
      case 'assets-liabilities':
        return (
          <Card key={tileId} className={`${baseClass} p-2 min-h-[180px] sm:min-h-[200px]`} onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onClick()}>
            <div className="text-[10px] font-bold text-[#7F1D1D] mb-1 shrink-0">Assets & Liabilities</div>
            <div className="flex-1 min-h-[160px] sm:min-h-[175px] w-full flex flex-col items-center justify-center overflow-hidden">
              <ResponsiveContainer width="100%" height="100%" minWidth={120} minHeight={140}>
                <PieChart margin={{ top: 8, right: 8, bottom: 8, left: 8 }}>
                  <Pie
                    data={assetsLiabilitiesData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius="70%"
                    paddingAngle={2}
                  >
                    {assetsLiabilitiesData.map((_, i) => (
                      <Cell key={i} fill={i === 0 ? '#DC2626' : '#B91C1C'} />
                    ))}
                  </Pie>
                  <Legend
                    layout="horizontal"
                    align="center"
                    verticalAlign="bottom"
                    formatter={(value) => {
                      const item = assetsLiabilitiesData.find((d) => d.name === value);
                      const pct = item ? ((item.value / assetsLiabilitiesData.reduce((s, d) => s + d.value, 0)) * 100).toFixed(0) : '';
                      return `${value} ${pct}%`;
                    }}
                    wrapperStyle={{ fontSize: '10px' }}
                    iconSize={8}
                    iconType="circle"
                  />
                  <Tooltip formatter={(v: number | undefined) => `₹ ${Number(v ?? 0).toLocaleString('en-IN')}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        );
      case 'receivables-aging':
        return (
          <Card key={tileId} className={`${baseClass} px-3 py-2`} onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onClick()}>
            <div className="text-[10px] font-bold text-[#7F1D1D] mb-1 shrink-0">Receivables / Payables</div>
            <div className="text-[11px] truncate">Debtors: ₹ {debtors.toLocaleString('en-IN')}</div>
            <div className="text-[11px] truncate">Creditors: ₹ {creditors.toLocaleString('en-IN')}</div>
          </Card>
        );
      case 'inventory-summary':
        return (
          <Card key={tileId} className={`${baseClass} px-3 py-2`} onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onClick()}>
            <div className="text-[10px] font-bold text-[#7F1D1D] mb-1 shrink-0">Inventory Summary</div>
            <div className="text-[14px] font-bold truncate">₹ {inventoryValue.toLocaleString('en-IN')}</div>
          </Card>
        );
      case 'ratios':
        return (
          <Card key={tileId} className={`${baseClass} px-3 py-2`} onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onClick()}>
            <div className="text-[10px] font-bold text-[#7F1D1D] mb-1 shrink-0">Ratios</div>
            <div className="text-[10px] truncate">Inv.T/O: {inventoryTurnover} · D/E: {debtEquity}</div>
            <div className="text-[10px] truncate">Rec.Days: {receivableDays} · ROI: {roi}%</div>
          </Card>
        );
      case 'bank-balances':
        return (
          <Card key={tileId} className={`${baseClass} px-3 py-2`} onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onClick()}>
            <div className="text-[10px] font-bold text-[#7F1D1D] mb-1 shrink-0">Bank Balances</div>
            <div className="space-y-0.5">
              {bankLedgers.slice(0, 3).map((l) => (
                <div key={l.id} className="text-[10px] truncate">{l.name}: ₹ {l.amount.toLocaleString('en-IN')}</div>
              ))}
              {bankLedgers.length > 3 && <div className="text-[10px] text-[#666]">+{bankLedgers.length - 3} more</div>}
            </div>
          </Card>
        );
      default:
        return (
          <Card key={tileId} className={`${baseClass} px-3 py-2`} onClick={onClick} role="button" tabIndex={0} onKeyDown={(e) => e.key === 'Enter' && onClick()}>
            <div className="text-[10px] font-bold">{def.label}</div>
            <div className="text-[10px] text-[#666]">Click to open</div>
          </Card>
        );
    }
  };

  return (
    <div className="flex flex-col h-full overflow-auto p-3 sm:p-4 sm:pr-4 min-h-0">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-2 flex-wrap mb-3 sm:mb-2 print:mb-1">
        <div className="flex flex-col sm:flex-row gap-2 flex-wrap">
          <select
            className="border border-[#D0D0D0] px-3 py-2 sm:px-2 sm:py-1 text-[12px] sm:text-[11px] w-full sm:w-auto min-h-[44px] sm:min-h-0"
            value={companyId}
            onChange={(e) => setCurrentCompany(e.target.value)}
          >
            {companies.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <label className="text-[10px] sm:text-[10px]">From</label>
            <input
              type="date"
              className="border border-[#D0D0D0] px-3 py-2 sm:px-2 sm:py-1 text-[12px] sm:text-[11px] w-full sm:w-auto min-h-[44px] sm:min-h-0"
              value={periodFrom}
              onChange={(e) => setPeriodFrom(e.target.value)}
            />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
            <label className="text-[10px]">To</label>
            <input
              type="date"
              className="border border-[#D0D0D0] px-3 py-2 sm:px-2 sm:py-1 text-[12px] sm:text-[11px] w-full sm:w-auto min-h-[44px] sm:min-h-0"
              value={periodTo}
              onChange={(e) => setPeriodTo(e.target.value)}
            />
          </div>
        </div>
        <div className="flex gap-2 sm:gap-1 flex-wrap">
          <button
            type="button"
            className="flex-1 sm:flex-initial px-4 py-3 sm:px-2 sm:py-1 text-[12px] sm:text-[10px] border border-[#D0D0D0] bg-white hover:bg-[#E8E8E8] min-h-[44px] sm:min-h-0 touch-manipulation"
            onClick={openDashboardConfig}
          >
            F12: Tiles
          </button>
          <button
            type="button"
            className="flex-1 sm:flex-initial px-4 py-3 sm:px-2 sm:py-1 text-[12px] sm:text-[10px] border border-[#D0D0D0] bg-white hover:bg-[#E8E8E8] min-h-[44px] sm:min-h-0 touch-manipulation"
            onClick={openExportModal}
          >
            Export
          </button>
          <button
            type="button"
            className="flex-1 sm:flex-initial px-4 py-3 sm:px-2 sm:py-1 text-[12px] sm:text-[10px] border border-[#D0D0D0] bg-white hover:bg-[#E8E8E8] min-h-[44px] sm:min-h-0 touch-manipulation"
            onClick={handlePrint}
          >
            Print
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-2 flex-1 min-h-0 content-start">
        {dashboardTiles.map(renderTile)}
      </div>

      <div className="mt-3 sm:mt-2 text-[10px] text-[#666] border-t border-[#D0D0D0] pt-3 sm:pt-2 pb-2 sm:pb-0">
        Esc / G — Gateway · Tap tile — Drill-down · F12 — Configure tiles
      </div>
    </div>
  );
}
