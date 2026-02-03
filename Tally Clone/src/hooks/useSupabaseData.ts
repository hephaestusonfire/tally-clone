import { useEffect } from 'react';
import { getCompanies } from '../services/company.service';
import { getLedgers } from '../services/ledger.service';
import { getLedgerGroups } from '../services/ledger-group.service';
import { getVoucherTypes } from '../services/voucher-type.service';
import { getStockItems } from '../services/stock-item.service';
import { useAppStore } from '../store/useAppStore';

/** Load companies, ledgers, voucher types, stock items from Supabase and merge into store. */
export function useSupabaseData() {
  const setSupabaseData = useAppStore((s) => s.setSupabaseData);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const companies = await getCompanies();
        if (cancelled) return;
        if (!companies?.length) {
          console.warn('[Supabase] No companies found. Create a company in Supabase to load data.');
          return;
        }

        const company = companies[0];
        const companyId = String((company as { company_id?: number }).company_id ?? (company as { id?: number }).id ?? 1);

        const [ledgers, ledgerGroups, voucherTypes, stockItems] = await Promise.all([
          getLedgers(Number(companyId)),
          getLedgerGroups(Number(companyId)),
          getVoucherTypes(Number(companyId)),
          getStockItems(Number(companyId)),
        ]);

        if (cancelled) return;

        const groupName = (l: { ledger_groups?: unknown }) => {
          const g = l.ledger_groups;
          if (!g || typeof g !== 'object') return '';
          const obj = Array.isArray(g) ? g[0] : g;
          return obj && typeof obj === 'object' && 'group_name' in obj ? String((obj as { group_name?: string }).group_name ?? '') : '';
        };

        console.info('[Supabase] Data loaded: companies=', companies.length, 'ledgers=', ledgers.length, 'ledgerGroups=', ledgerGroups.length, 'voucherTypes=', voucherTypes.length, 'stockItems=', stockItems.length);
        setSupabaseData({
          companyId,
          ledgerGroups: ledgerGroups ?? [],
          companies: (companies ?? []).map((c) => ({
            id: String((c as { company_id?: number }).company_id ?? (c as { id?: number }).id ?? ''),
            name: c.company_name ?? (c as { name?: string }).name ?? '',
            financialStart: c.financial_year_start ?? '2024-04-01',
            financialEnd: c.financial_year_end ?? '2025-03-31',
          })),
          ledgers: (ledgers ?? []).map((l) => ({
            id: l.ledger_id ?? (l as { id?: number }).id ?? 0,
            name: l.ledger_name ?? (l as { name?: string }).name ?? '',
            under: groupName(l),
            amount: (l.opening_balance ?? 0) * (l.opening_balance_type === 'CR' ? -1 : 1),
            openingBalanceType: l.opening_balance_type === 'CR' ? ('Cr' as const) : ('Dr' as const),
          })),
          voucherTypes: (voucherTypes ?? []).map((v) => ({
            id: v.voucher_type_id ?? (v as { id?: number }).id ?? 0,
            name: v.voucher_name ?? (v as { name?: string }).name ?? '',
            coreType: inferCoreType(v.voucher_name ?? ''),
            enableGst: Boolean(v.allow_gst ?? (v as { allow_gst?: boolean }).allow_gst),
            allowClasses: false,
            classes: [],
          })),
          stockItems: (stockItems ?? []).map((s) => ({
            id: s.stock_item_id ?? (s as { id?: number }).id ?? 0,
            name: s.item_name ?? (s as { name?: string }).name ?? '',
            under: (s as { stock_groups?: { group_name?: string } }).stock_groups?.group_name ?? '',
            unit: (s as { units?: { symbol?: string } }).units?.symbol ?? 'Nos',
            allowQuantities: true,
            openingQty: s.opening_qty ?? 0,
            rate: s.opening_rate ?? s.rate ?? 0,
            value: (s.opening_qty ?? 0) * (s.opening_rate ?? s.rate ?? 0),
            inheritHsnsacFromGroup: false,
            hsnsac: s.hsn_sac ?? (s as { hsn_sac?: string }).hsn_sac,
            gstRate: s.gst_rate ?? (s as { gst_rate?: number }).gst_rate,
          })),
        });
      } catch (err) {
        if (!cancelled) console.error('[Supabase] Data load failed:', err);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [setSupabaseData]);
}

function inferCoreType(name: string): 'Sales' | 'Purchase' | 'Payment' | 'Receipt' | 'Journal' | 'Contra' {
  const n = name.toLowerCase();
  if (n.includes('sales')) return 'Sales';
  if (n.includes('purchase')) return 'Purchase';
  if (n.includes('payment')) return 'Payment';
  if (n.includes('receipt')) return 'Receipt';
  if (n.includes('journal')) return 'Journal';
  if (n.includes('contra')) return 'Contra';
  return 'Journal';
}
