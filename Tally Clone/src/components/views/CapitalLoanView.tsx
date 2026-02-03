import * as React from 'react';
import { useAppStore } from '../../store/useAppStore';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableRow,
} from '../ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';

/** Mock credit score (API-ready: replace with GET /loan/credit-score) */
function useMockCreditScore() {
  const [score, setScore] = React.useState<number | null>(null);
  const [loading, setLoading] = React.useState(false);
  const fetchScore = React.useCallback(() => {
    setLoading(true);
    setTimeout(() => {
      setScore(720 + Math.floor(Math.random() * 60));
      setLoading(false);
    }, 500);
  }, []);
  return { score, loading, fetchScore };
}

/** EMI = P * r * (1+r)^n / ((1+r)^n - 1); r = monthly rate, n = months */
function calculateEMI(principal: number, annualRatePct: number, tenureMonths: number): number {
  if (tenureMonths <= 0) return 0;
  const r = annualRatePct / 100 / 12;
  const n = tenureMonths;
  if (r === 0) return principal / n;
  return (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
}

/** Eligibility (mock): min(turnover*0.1, profit*2, stock_value*0.5). API-ready: POST /loan/eligibility */
function useEligibility(turnover: number, profit: number, stockValue: number) {
  const limit = Math.min(
    turnover * 0.1,
    Math.max(profit * 2, 0),
    stockValue * 0.5
  );
  return { eligibleLimit: Math.round(limit), turnover, profit, stockValue };
}

export function CapitalLoanView() {
  const setActiveView = useAppStore((s) => s.setActiveView);
  const mockData = useAppStore((s) => s.mockData);
  const stockItems = useAppStore((s) => s.stockItems);

  const { score, loading, fetchScore } = useMockCreditScore();

  const turnover = React.useMemo(() => {
    return mockData.vouchers
      .filter((v) => v.type === 'Sales')
      .reduce((s, v) => s + v.amount, 0);
  }, [mockData.vouchers]);
  const profit = React.useMemo(() => {
    const sales = mockData.vouchers.filter((v) => v.type === 'Sales').reduce((s, v) => s + v.amount, 0);
    const purchase = mockData.vouchers.filter((v) => v.type === 'Purchase').reduce((s, v) => s + v.amount, 0);
    const expenses = mockData.ledgers
      .filter((l) => l.under === 'Indirect Expenses')
      .reduce((s, l) => s + l.amount, 0);
    return sales - purchase - expenses;
  }, [mockData.vouchers, mockData.ledgers]);
  const stockValue = React.useMemo(() => {
    return stockItems.reduce((s, i) => s + (i.openingQty * i.rate || i.value), 0);
  }, [stockItems]);

  const { eligibleLimit } = useEligibility(turnover, profit, stockValue);

  const [principal, setPrincipal] = React.useState(100000);
  const [ratePct, setRatePct] = React.useState(12);
  const [tenureMonths, setTenureMonths] = React.useState(36);
  const emi = React.useMemo(
    () => calculateEMI(principal, ratePct, tenureMonths),
    [principal, ratePct, tenureMonths]
  );

  const [step, setStep] = React.useState(1);
  const [applicationAmount, setApplicationAmount] = React.useState(50000);
  const [applicationDone, setApplicationDone] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState('eligibility');

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setActiveView('gateway');
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [setActiveView]);

  return (
    <div className="flex h-full flex-col overflow-auto bg-[#FEF2F2] p-4">
      <div className="mb-3 flex items-center justify-between">
        <div className="text-[14px] font-bold text-[#7F1D1D]">
          Capital / Loan Section (TallyCapital-style)
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="text-[10px]"
          onClick={() => setActiveView('gateway')}
        >
          Esc — Gateway
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 min-h-0 flex flex-col">
        <TabsList className="mb-2">
          <TabsTrigger tabValue="eligibility" currentValue={activeTab} onValueChange={setActiveTab}>
            Eligibility &amp; Credit Score
          </TabsTrigger>
          <TabsTrigger tabValue="emi" currentValue={activeTab} onValueChange={setActiveTab}>
            EMI Calculator
          </TabsTrigger>
          <TabsTrigger tabValue="application" currentValue={activeTab} onValueChange={setActiveTab}>
            Loan Application
          </TabsTrigger>
        </TabsList>

        <TabsContent when="eligibility" currentValue={activeTab} className="flex-1 overflow-auto mt-0">
          <div className="grid grid-cols-2 gap-3">
            <Card className="p-3 border-[#D0D0D0]">
              <div className="text-[11px] font-bold text-[#7F1D1D] mb-2">
                Credit Score (mock / API-ready)
              </div>
              {score == null ? (
                <Button
                  type="button"
                  size="sm"
                  className="text-[10px]"
                  onClick={fetchScore}
                  disabled={loading}
                >
                  {loading ? 'Checking…' : 'Check Credit Score'}
                </Button>
              ) : (
                <div className="text-[14px] font-bold text-[#7F1D1D]">{score}</div>
              )}
            </Card>
            <Card className="p-3 border-[#D0D0D0]">
              <div className="text-[11px] font-bold text-[#7F1D1D] mb-2">
                Loan Eligibility (from Turnover, Profit, Stock)
              </div>
              <div className="text-[12px]">
                Eligible limit: <strong>₹ {eligibleLimit.toLocaleString('en-IN')}</strong>
              </div>
              <Table className="mt-2 text-[10px]">
                <TableBody>
                  <TableRow>
                    <TableCell className="py-0.5">Turnover (sample)</TableCell>
                    <TableCell className="py-0.5 text-right">₹ {turnover.toLocaleString('en-IN')}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="py-0.5">Profit (sample)</TableCell>
                    <TableCell className="py-0.5 text-right">₹ {profit.toLocaleString('en-IN')}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell className="py-0.5">Stock value</TableCell>
                    <TableCell className="py-0.5 text-right">₹ {stockValue.toLocaleString('en-IN')}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Card>
          </div>
        </TabsContent>

        <TabsContent when="emi" currentValue={activeTab} className="flex-1 overflow-auto mt-0">
          <Card className="p-4 border-[#D0D0D0] max-w-md">
            <div className="text-[11px] font-bold text-[#7F1D1D] mb-3">
              EMI Calculator
            </div>
            <div className="space-y-2 text-[11px]">
              <div>
                <label>Principal (₹)</label>
                <input
                  type="number"
                  className="ml-2 border border-[#D0D0D0] px-2 py-1 w-32"
                  value={principal}
                  onChange={(e) => setPrincipal(Number(e.target.value) || 0)}
                />
              </div>
              <div>
                <label>Rate (% p.a.)</label>
                <input
                  type="number"
                  className="ml-2 border border-[#D0D0D0] px-2 py-1 w-24"
                  value={ratePct}
                  onChange={(e) => setRatePct(Number(e.target.value) || 0)}
                />
              </div>
              <div>
                <label>Tenure (months)</label>
                <input
                  type="number"
                  className="ml-2 border border-[#D0D0D0] px-2 py-1 w-24"
                  value={tenureMonths}
                  onChange={(e) => setTenureMonths(Number(e.target.value) || 0)}
                />
              </div>
              <div className="pt-2 font-bold text-[#7F1D1D]">
                EMI: ₹ {emi.toFixed(0)}
              </div>
            </div>
          </Card>
        </TabsContent>

        <TabsContent when="application" currentValue={activeTab} className="flex-1 overflow-auto mt-0">
          <Card className="p-4 border-[#D0D0D0] max-w-md">
            <div className="text-[11px] font-bold text-[#7F1D1D] mb-3">
              Loan Application (API-ready for partner lending)
            </div>
            {!applicationDone ? (
              <>
                {step === 1 && (
                  <>
                    <p className="text-[11px] mb-2">Step 1: Enter amount (₹)</p>
                    <input
                      type="number"
                      className="border border-[#D0D0D0] px-2 py-1 w-32"
                      value={applicationAmount}
                      onChange={(e) => setApplicationAmount(Number(e.target.value) || 0)}
                    />
                    <Button
                      type="button"
                      size="sm"
                      className="ml-2 text-[10px]"
                      onClick={() => setStep(2)}
                    >
                      Next
                    </Button>
                  </>
                )}
                {step === 2 && (
                  <>
                    <p className="text-[11px] mb-2">Step 2: Confirm application for ₹ {applicationAmount.toLocaleString('en-IN')}</p>
                    <Button
                      type="button"
                      size="sm"
                      className="text-[10px] mr-2"
                      onClick={() => setStep(1)}
                    >
                      Back
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      className="text-[10px]"
                      onClick={() => {
                        setApplicationDone(true);
                        // API-ready: POST /loan/application
                      }}
                    >
                      Submit
                    </Button>
                  </>
                )}
              </>
            ) : (
              <p className="text-[11px] text-green-700">
                Application submitted. (Partner API integration ready.)
              </p>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
