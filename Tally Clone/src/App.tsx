import './App.css';
import { Topbar } from './components/layout/Topbar';
import { LeftSidebar } from './components/layout/LeftSidebar';
import { MobileSidebarDrawer } from './components/layout/MobileSidebarDrawer';
import { MainWorkspace } from './components/layout/MainWorkspace';
import { RightPanel } from './components/layout/RightPanel';
import { StatusBar } from './components/layout/StatusBar';
import { useKeyboardShortcuts } from './hooks/useKeyboardShortcuts';
import { CompanyModal } from './components/layout/Overlays';
import { CompanyFeaturesModal } from './components/modals/CompanyFeaturesModal';
import { GstRateModal } from './components/modals/GstRateModal';
import { ExchangeRateModal } from './components/modals/ExchangeRateModal';
import { ExportModal } from './components/modals/ExportModal';
import { VoucherViewerModal } from './components/modals/VoucherViewerModal';
import { GoToSearch } from './components/GoToSearch';
import { WhatsAppSettingsModal } from './components/modals/WhatsAppSettingsModal';
import { WhatsAppNumbersModal } from './components/modals/WhatsAppNumbersModal';
import { ShareViaWhatsAppModal } from './components/modals/ShareViaWhatsAppModal';
import { PrintReportSelectorModal } from './components/modals/PrintReportSelectorModal';
import { PrintConfigurationModal } from './components/modals/PrintConfigurationModal';
import { ListOfMastersPopup } from './components/modals/ListOfMastersPopup';
import { RechargeWalletModal } from './components/modals/RechargeWalletModal';
import { RenewSubscriptionModal } from './components/modals/RenewSubscriptionModal';
import { EmailConfigModal } from './components/modals/EmailConfigModal';
import { EmailSendModal } from './components/modals/EmailSendModal';
import { ShareConfigModal } from './components/modals/ShareConfigModal';
import { WhatsappSendModal } from './components/modals/WhatsappSendModal';
import { WhatsappSignupModal } from './components/modals/WhatsappSignupModal';
import { ChangeDateModal } from './components/modals/ChangeDateModal';
import { ChangeVoucherTypeModal } from './components/modals/ChangeVoucherTypeModal';
import { LineColorModal } from './components/modals/LineColorModal';
import { QuitConfirmModal } from './components/modals/QuitConfirmModal';
import { DashboardConfigModal } from './components/modals/DashboardConfigModal';
import { VoucherConfigurationModal } from './components/modals/VoucherConfigurationModal';
import { useEffect } from 'react';
import { useGatewayStore } from './store/useGatewayStore';
import { useSupabaseData } from './hooks/useSupabaseData';

function App() {
  useKeyboardShortcuts();
  useSupabaseData();
  useEffect(() => {
    useGatewayStore.getState().applyLineColors();
  }, []);

  return (
    <>
      <GoToSearch />
      <div className="h-screen w-screen overflow-hidden bg-tallyBgLight flex flex-col font-sans text-[12px]">
        <Topbar />
        <MobileSidebarDrawer />
        <div className="flex flex-1 overflow-hidden flex-col">
          <div className="flex flex-1 min-h-0">
            <LeftSidebar />
            <MainWorkspace />
            <RightPanel />
          </div>
          <StatusBar />
        </div>
      </div>
      <CompanyFeaturesModal />
      <GstRateModal />
      <ExchangeRateModal />
      <CompanyModal />
      <ExportModal />
      <VoucherViewerModal />
      <WhatsAppSettingsModal />
      <WhatsAppNumbersModal />
      <ShareViaWhatsAppModal />
      <RechargeWalletModal />
      <RenewSubscriptionModal />
      <EmailConfigModal />
      <EmailSendModal />
      <ShareConfigModal />
      <WhatsappSendModal />
      <WhatsappSignupModal />
      <PrintReportSelectorModal />
      <PrintConfigurationModal />
      <ListOfMastersPopup />
      <ChangeDateModal />
      <ChangeVoucherTypeModal />
      <LineColorModal />
      <QuitConfirmModal />
      <DashboardConfigModal />
      <VoucherConfigurationModal />
    </>
  );
}

export default App;
