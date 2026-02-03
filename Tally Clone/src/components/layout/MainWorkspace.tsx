import React from 'react';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { StockMastersView } from '../views/StockMastersView';
import { TaxLedgersView } from '../views/TaxLedgersView';
import { GstRatesView } from '../views/GstRatesView';
import { SalesVoucherView } from '../views/SalesVoucherView';
import { AccountingVoucherView } from '../views/AccountingVoucherView';
import { TrialBalanceView } from '../reports/TrialBalanceView';
import { BalanceSheetView } from '../reports/BalanceSheetView';
import { ProfitLossView } from '../reports/ProfitLossView';
import { CashFlowView } from '../reports/CashFlowView';
import { RatioAnalysisView } from '../reports/RatioAnalysisView';
import { MonthlySummaryView } from '../reports/MonthlySummaryView';
import { DayBookView } from '../reports/DayBookView';
import { StockSummaryView } from '../reports/StockSummaryView';
import { ReceivablesPayablesView } from '../reports/ReceivablesPayablesView';
import { VoucherRegisterView } from '../reports/VoucherRegisterView';
import { LedgerVouchersView } from '../reports/LedgerVouchersView';
import { BankingView } from '../views/BankingView';
import { CapitalLoanView } from '../views/CapitalLoanView';
import { MasterCreationView } from '../views/MasterCreationView';
import { MasterAlterationView } from '../views/MasterAlterationView';
import { GroupCreationView } from '../views/GroupCreationView';
import { LedgerCreationView } from '../views/LedgerCreationView';
import { CurrencyCreationView } from '../views/CurrencyCreationView';
import { VoucherTypeCreationView } from '../views/VoucherTypeCreationView';
import { CreditLimitCreationView } from '../views/CreditLimitCreationView';
import { ScenarioCreationView } from '../views/ScenarioCreationView';
import { StockGroupCreationView } from '../views/StockGroupCreationView';
import { StockCategoryCreationView } from '../views/StockCategoryCreationView';
import { StockItemCreationView } from '../views/StockItemCreationView';
import { UnitCreationView } from '../views/UnitCreationView';
import { UnitsListView } from '../views/UnitsListView';
import { GodownCreationView } from '../views/GodownCreationView';
import { GstRegistrationCreationView } from '../views/GstRegistrationCreationView';
import { GstClassificationCreationView } from '../views/GstClassificationCreationView';
import { StatutoryDetailsView } from '../views/StatutoryDetailsView';
import { CompanyGstDetailsCreationView } from '../views/CompanyGstDetailsCreationView';
import { PanCinDetailsCreationView } from '../views/PanCinDetailsCreationView';
import { ChartOfAccountsView } from '../views/ChartOfAccountsView';
import { MultipleLedgersView } from '../views/MultipleLedgersView';
import { CostCentresListView } from '../views/CostCentresListView';
import { CostCentreCreationView } from '../views/CostCentreCreationView';
import { CurrencyListView } from '../views/CurrencyListView';
import { InventoryMasterListView } from '../views/InventoryMasterListView';
import { AccountingDashboard } from '../dashboard/AccountingDashboard';
import { WhatsappManageInboxView } from '../views/WhatsappManageInboxView';
import { WhatsappManageNumbersView } from '../views/WhatsappManageNumbersView';
function MastersView() {
  const { mockData } = useAppStore();
  return (
    <div className="flex flex-col h-full overflow-auto pr-4">
      <Tabs value="ledgers" onValueChange={() => undefined}>
        <TabsList>
          <TabsTrigger tabValue="ledgers" currentValue="ledgers">
            Ledgers
          </TabsTrigger>
        </TabsList>
        <TabsContent when="ledgers" currentValue="ledgers" className="bg-[#FEF2F2]">
          <div className="p-3 space-y-3">
            <div className="border border-tallyBorder bg-white">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Under</TableHead>
                    <TableHead className="w-[100px] text-right">
                      Balance
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockData.ledgers.map((l) => (
                    <TableRow key={l.id}>
                      <TableCell>{l.name}</TableCell>
                      <TableCell>{l.under}</TableCell>
                      <TableCell className="text-right">
                        ₹ {l.amount.toLocaleString('en-IN')}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

const REPORT_VIEWS = [
  'trial-balance',
  'balance-sheet',
  'profit-loss',
  'cash-flow',
  'ratio-analysis',
  'monthly-summary',
  'day-book',
  'stock-summary',
  'receivables-payables',
  'voucher-register',
  'ledger-vouchers',
] as const;

function isReportView(view: string): view is (typeof REPORT_VIEWS)[number] {
  return REPORT_VIEWS.includes(view as (typeof REPORT_VIEWS)[number]);
}

export function MainWorkspace() {
  const activeView = useAppStore((s) => s.activeView);
  const openConfig = useAppStore((s) => s.openConfig);
  const openExportModal = useAppStore((s) => s.openExportModal);

  let content: React.ReactNode;
  if (activeView === 'gateway') content = <AccountingDashboard />;
  else if (activeView === 'sales') content = <SalesVoucherView />;
  else if (
    activeView === 'vouchers' ||
    activeView === 'purchase' ||
    activeView === 'payment' ||
    activeView === 'receipt' ||
    activeView === 'journal'
  )
    content = <AccountingVoucherView />;
  else if (activeView === 'masters') content = <MastersView />;
  else if (
    activeView === 'stock-groups' ||
    activeView === 'stock-items' ||
    activeView === 'inventory'
  )
    content = <StockMastersView />;
  else if (activeView === 'tax-ledgers') content = <TaxLedgersView />;
  else if (activeView === 'gst-rates') content = <GstRatesView />;
  else if (activeView === 'trial-balance') content = <TrialBalanceView />;
  else if (activeView === 'balance-sheet') content = <BalanceSheetView />;
  else if (activeView === 'profit-loss') content = <ProfitLossView />;
  else if (activeView === 'cash-flow') content = <CashFlowView />;
  else if (activeView === 'ratio-analysis') content = <RatioAnalysisView />;
  else if (activeView === 'monthly-summary') content = <MonthlySummaryView />;
  else if (activeView === 'day-book') content = <DayBookView />;
  else if (activeView === 'stock-summary') content = <StockSummaryView />;
  else if (activeView === 'receivables-payables') content = <ReceivablesPayablesView />;
  else if (activeView === 'banking') content = <BankingView />;
  else if (activeView === 'capital-loan') content = <CapitalLoanView />;
  else if (activeView === 'voucher-register') content = <VoucherRegisterView />;
  else if (activeView === 'ledger-vouchers') content = <LedgerVouchersView />;
  else if (activeView === 'master-creation') content = <MasterCreationView />;
  else if (activeView === 'master-alteration') content = <MasterAlterationView />;
  else if (activeView === 'group-creation') content = <GroupCreationView />;
  else if (activeView === 'ledger-creation') content = <LedgerCreationView />;
  else if (activeView === 'currency-creation') content = <CurrencyCreationView />;
  else if (activeView === 'voucher-type-creation') content = <VoucherTypeCreationView />;
  else if (activeView === 'credit-limits-creation') content = <CreditLimitCreationView />;
  else if (activeView === 'scenario-creation') content = <ScenarioCreationView />;
  else if (activeView === 'stock-group-creation') content = <StockGroupCreationView />;
  else if (activeView === 'stock-category-creation') content = <StockCategoryCreationView />;
  else if (activeView === 'stock-item-creation') content = <StockItemCreationView />;
  else if (activeView === 'units-list') content = <UnitsListView />;
  else if (activeView === 'unit-creation') content = <UnitCreationView />;
  else if (activeView === 'godown-creation') content = <GodownCreationView />;
  else if (activeView === 'gst-registration-creation') content = <GstRegistrationCreationView />;
  else if (activeView === 'gst-classification-creation') content = <GstClassificationCreationView />;
  else if (activeView === 'statutory-details') content = <StatutoryDetailsView />;
  else if (activeView === 'company-gst-details-creation') content = <CompanyGstDetailsCreationView />;
  else if (activeView === 'pan-cin-details-creation') content = <PanCinDetailsCreationView />;
  else if (activeView === 'chart-of-accounts') content = <ChartOfAccountsView />;
  else if (activeView === 'multiple-ledgers') content = <MultipleLedgersView />;
  else if (activeView === 'cost-centres') content = <CostCentresListView />;
  else if (activeView === 'cost-centre-creation') content = <CostCentreCreationView />;
  else if (activeView === 'currencies-list') content = <CurrencyListView />;
  else if (activeView === 'list-of-stock-items') content = <InventoryMasterListView listType="stock-items" />;
  else if (activeView === 'list-of-stock-categories') content = <InventoryMasterListView listType="stock-categories" />;
  else if (activeView === 'dashboard') content = <AccountingDashboard />;
  else if (activeView === 'whatsapp-inbox') content = <WhatsappManageInboxView />;
  else if (activeView === 'whatsapp-numbers') content = <WhatsappManageNumbersView />;
  else content = <AccountingDashboard />;

  return (
    <main className="flex-1 min-h-0 flex flex-col border-x border-tallyBorder bg-[#FEF2F2] px-4 py-3 relative overflow-hidden">
      <div className="flex-1 min-h-0 overflow-hidden flex flex-col relative">
        {content}
        {isReportView(activeView) && (
          <Button
            type="button"
            size="sm"
            className="absolute right-4 top-3 text-[11px] bg-[#DC2626] text-white hover:bg-[#B91C1C] border-0"
            onClick={openExportModal}
          >
            Export
          </Button>
        )}
        {activeView !== 'sales' && activeView !== 'gateway' && (
          <Button
            variant="outline"
            size="sm"
            className="absolute right-4 bottom-3 text-[11px]"
            onClick={openConfig}
          >
            F12: Configure
          </Button>
        )}
      </div>
    </main>
  );
}

