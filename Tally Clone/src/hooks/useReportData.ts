/**
 * Fetches report data from Supabase when report views are active.
 * Updates store with fetched data. Views read from store (report data or mock fallback).
 */

import { useEffect, useRef } from 'react';
import { useAppStore } from '../store/useAppStore';
import { getDayBookVouchers } from '../services/reports/dayBook.service';
import { getLedgerEntries } from '../services/reports/ledgerReport.service';
import { getTrialBalance } from '../services/reports/trialBalance.service';
import { getProfitLossData } from '../services/reports/pl.service';
import { getBalanceSheetData } from '../services/reports/balanceSheet.service';

function parseDateInput(s: string): string {
  const parts = s.split('-');
  if (parts.length !== 3) return s;
  const months: Record<string, string> = {
    Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
    Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
  };
  const mon = months[parts[1]] ?? '01';
  const year = parts[2].length === 2 ? `20${parts[2]}` : parts[2];
  return `${year}-${mon}-${parts[0].padStart(2, '0')}`;
}

export function useReportData(
  activeView: string,
  opts?: {
    dateFrom?: string;
    dateTo?: string;
    asOnDate?: string;
    periodFrom?: string;
    periodTo?: string;
    ledgerId?: number;
    voucherTypeFilter?: string;
  }
) {
  const companyId = useAppStore((s) => s.companyId);
  const setReportDayBookVouchers = useAppStore((s) => s.setReportDayBookVouchers);
  const setReportTrialBalanceAccounts = useAppStore((s) => s.setReportTrialBalanceAccounts);
  const setReportLedgersWithBalance = useAppStore((s) => s.setReportLedgersWithBalance);
  const setReportLedgerVouchers = useAppStore((s) => s.setReportLedgerVouchers);
  const setReportPLData = useAppStore((s) => s.setReportPLData);
  const setReportBalanceSheetData = useAppStore((s) => s.setReportBalanceSheetData);
  const ref = useRef({ activeView, opts });

  useEffect(() => {
    ref.current = { activeView, opts };
  }, [activeView, opts]);

  useEffect(() => {
    let cancelled = false;
    const cid = Number(companyId);
    if (!cid) return;

    async function load() {
      try {
        const { activeView: v, opts: o } = ref.current;
        if (cancelled) return;

        if (v === 'day-book') {
          const from = o?.dateFrom ? parseDateInput(o.dateFrom) : new Date().toISOString().slice(0, 10);
          const to = o?.dateTo ? parseDateInput(o.dateTo) : new Date().toISOString().slice(0, 10);
          const rows = await getDayBookVouchers(cid, from, to, o?.voucherTypeFilter);
          if (!cancelled) setReportDayBookVouchers(rows);
          return;
        }

        if (v === 'trial-balance') {
          const asOn = o?.asOnDate ?? new Date().toISOString().slice(0, 10);
          const { accounts } = await getTrialBalance(cid, asOn);
          if (!cancelled) setReportTrialBalanceAccounts(accounts);
          return;
        }

        if (v === 'ledger-vouchers' && o?.ledgerId) {
          const from = o?.dateFrom ? parseDateInput(o.dateFrom) : undefined;
          const to = o?.dateTo ? parseDateInput(o.dateTo) : undefined;
          const result = await getLedgerEntries(cid, o.ledgerId, from, to);
          if (!cancelled && result) setReportLedgerVouchers(result.entries);
          return;
        }

        if (v === 'profit-loss') {
          const from = o?.periodFrom ?? new Date().toISOString().slice(0, 10);
          const to = o?.periodTo ?? new Date().toISOString().slice(0, 10);
          const pl = await getProfitLossData(cid, from, to);
          const ledgersWithBalance = [
            ...pl.incomeGroups.flatMap((g) => g.ledgers.map((l) => ({ ...l, under: g.name }))),
            ...pl.expenseGroups.flatMap((g) => g.ledgers.map((l) => ({ ...l, under: g.name }))),
          ];
          if (!cancelled) {
            setReportLedgersWithBalance(ledgersWithBalance);
            setReportPLData(pl);
          }
          return;
        }

        if (v === 'balance-sheet') {
          const asOn = o?.asOnDate ?? new Date().toISOString().slice(0, 10);
          const bs = await getBalanceSheetData(cid, asOn, 0);
          const ledgersWithBalance = [
            ...bs.assetGroups.flatMap((g) => g.ledgers.map((l) => ({ ...l, under: g.name }))),
            ...bs.liabilityGroups.flatMap((g) => g.ledgers.map((l) => ({ ...l, under: g.name }))),
          ];
          if (!cancelled) {
            setReportLedgersWithBalance(ledgersWithBalance);
            setReportBalanceSheetData(bs);
          }
        }
      } catch (err) {
        if (!cancelled) console.warn('Report data load failed:', err);
      }
    }

    const reportViews = ['day-book', 'trial-balance', 'ledger-vouchers', 'profit-loss', 'balance-sheet'];
    if (reportViews.includes(activeView)) {
      load();
    }

    return () => { cancelled = true; };
  }, [
    companyId,
    activeView,
    opts?.dateFrom,
    opts?.dateTo,
    opts?.asOnDate,
    opts?.periodFrom,
    opts?.periodTo,
    opts?.ledgerId,
    opts?.voucherTypeFilter,
    setReportDayBookVouchers,
    setReportTrialBalanceAccounts,
    setReportLedgersWithBalance,
    setReportLedgerVouchers,
    setReportPLData,
    setReportBalanceSheetData,
  ]);
}
