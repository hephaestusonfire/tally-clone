/**
 * Centralized shortcut action handlers.
 * Resolves action IDs from the registry to store actions.
 */

import { useAppStore } from '../store/useAppStore';
import { useGatewayStore } from '../store/useGatewayStore';
import { usePrintStore } from '../store/usePrintStore';
import { useShareStore } from '../store/useShareStore';
import { useWhatsAppStore } from '../store/useWhatsAppStore';

export type ShortcutActionId = string;

export function getShortcutHandler(actionId: string): (() => void) | null {
  const app = useAppStore.getState();
  const gateway = useGatewayStore.getState();
  const print = usePrintStore.getState();
  const share = useShareStore.getState();
  const _whatsapp = useWhatsAppStore.getState();
  void _whatsapp;

  switch (actionId) {
    // Global
    case 'global-accept':
    case 'global-save':
      return async () => {
        const { activeView, acceptGstAccountingVoucher, acceptCurrentAccountingVoucher } = useAppStore.getState();
        if (activeView === 'sales') {
          const r = await acceptGstAccountingVoucher();
          if (!r.saved && r.message) window.alert(r.message);
          else if (r.saved && r.warn && r.message) window.alert(r.message);
        } else if (['vouchers', 'purchase', 'payment', 'receipt', 'journal'].includes(activeView)) {
          const r = await acceptCurrentAccountingVoucher();
          if (!r.saved && r.message) window.alert(r.message);
          else if (r.saved && r.warn && r.message) window.alert(r.message);
        }
      };
    case 'global-quit':
      return () => app.setQuitConfirmOpen(true);
    case 'global-cancel':
      return () => {
        const { activeView, accountingVoucherDirty, resetAccountingVoucher } = useAppStore.getState();
        if (['vouchers', 'purchase', 'payment', 'receipt', 'journal'].includes(activeView) && accountingVoucherDirty && window.confirm('Cancel without saving?')) resetAccountingVoucher();
        else if (activeView === 'sales' && accountingVoucherDirty && window.confirm('Cancel without saving?')) resetAccountingVoucher();
      };
    case 'global-export':
      return () => app.openExportModal();
    case 'global-print':
      return () => print.openPrintReport();
    case 'global-find':
      return () => {}; // stub
    case 'global-find-advanced':
      return () => app.setSearchOpen(true);
    case 'global-back':
      return () => app.setActiveView('gateway');
    case 'global-gateway':
      return () => app.setActiveView('gateway');
    case 'global-new':
      return () => {
        const { activeView } = useAppStore.getState();
        if (activeView === 'vouchers' || activeView === 'sales') app.setActiveView('vouchers');
        else if (activeView === 'gateway') app.setActiveView('master-creation');
      };

    // Function keys
    case 'f1-help':
      return () => {}; // stub help
    case 'f2-date':
      return () => gateway.openDateModal();
    case 'f3-company':
      return () => app.toggleCompanyModal();
    case 'f4-contra':
      return () => { app.setAccountingVoucherTypeId(6); app.setActiveView('vouchers'); };
    case 'f5-payment':
      return () => { app.setAccountingVoucherTypeId(4); app.setActiveView('vouchers'); };
    case 'f6-receipt':
      return () => { app.setAccountingVoucherTypeId(3); app.setActiveView('vouchers'); };
    case 'f7-journal':
      return () => { app.setAccountingVoucherTypeId(5); app.setActiveView('vouchers'); };
    case 'f8-sales':
      return () => { app.setAccountingVoucherTypeId(1); app.setActiveView('vouchers'); };
    case 'f9-purchase':
      return () => { app.setAccountingVoucherTypeId(2); app.setActiveView('vouchers'); };
    case 'f10-other-voucher':
      return () => app.setActiveView('vouchers');
    case 'f11-features':
      return () => app.openConfig();
    case 'f12-configure':
      return () => {
        const { activeView, openConfig, openVoucherConfig, openGstRateModal, openDashboardConfig } = useAppStore.getState();
        if (activeView === 'dashboard') openDashboardConfig();
        else if (activeView === 'tax-ledgers' || activeView === 'gst-rates') openGstRateModal();
        else if (activeView === 'vouchers' || activeView === 'sales') openVoucherConfig();
        else openConfig();
      };

    // Gateway
    case 'gateway-go':
      return () => app.setSearchOpen(true);
    case 'gateway-company':
      return () => app.toggleCompanyModal();
    case 'gateway-masters':
      return () => app.setActiveView('master-alteration');
    case 'gateway-display-reports':
      return () => app.setActiveView('trial-balance');
    case 'gateway-banking':
      return () => app.setActiveView('banking');
    case 'gateway-data':
    case 'gateway-exchange':
      return () => {};

    // Master
    case 'master-create':
      return () => {
        const { activeView } = useAppStore.getState();
        if (activeView === 'vouchers') app.setActiveView('ledger-creation');
        else app.setActiveView('master-creation');
      };
    case 'master-ledger-list':
      return () => app.setListOfMastersPopupOpen(true);
    case 'master-inventory-list':
      return () => app.setActiveView('stock-items');
    case 'master-alter':
    case 'master-open':
    case 'master-delete':
      return () => {};

    // Voucher
    case 'voucher-type':
    case 'voucher-type-h':
      return () => app.setChangeVoucherTypePopupOpen(true);
    case 'voucher-cancel':
      return () => {
        const { activeView, accountingVoucherDirty, resetAccountingVoucher } = useAppStore.getState();
        if ((activeView === 'vouchers' || activeView === 'sales') && accountingVoucherDirty && window.confirm('Cancel voucher?')) resetAccountingVoucher();
      };
    case 'voucher-add':
    case 'voucher-duplicate':
    case 'voucher-delete':
    case 'voucher-alter':
    case 'voucher-insert-line':
    case 'voucher-remove-line':
      return () => {};

    // GST / Reports
    case 'gst-tax-analysis':
    case 'reports-gst-analysis':
      return () => app.setActiveView('tax-ledgers');
    case 'reports-stock-summary':
      return () => app.setActiveView('stock-summary');
    case 'reports-balance-sheet':
      return () => app.setActiveView('balance-sheet');
    case 'reports-pl':
      return () => app.setActiveView('profit-loss');

    // Config
    case 'config-close':
      return () => {
        useAppStore.getState().closeVoucherConfig();
        const share = useShareStore.getState();
        share.closeShareConfig();
        share.closeEmailConfig();
      };

    // Special / Share
    case 'share-menu':
      return () => {
        share.setShareMenuOpen(true);
        document.getElementById('share-menu-trigger')?.focus();
      };
    case 'line-colors':
      return () => gateway.openLineColorModal();
    case 'special-calculator':
    case 'special-refresh':
    case 'special-recompute':
      return () => {};

    default:
      return null;
  }
}
