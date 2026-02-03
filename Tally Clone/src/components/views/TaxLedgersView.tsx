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
import { ScrollArea } from '../ui/scroll-area';

const TAX_TYPES = ['IGST', 'CGST', 'SGST'] as const;

export function TaxLedgersView() {
  const taxLedgers = useAppStore((s) => s.taxLedgers);
  const updateTaxLedger = useAppStore((s) => s.updateTaxLedger);
  const openGstRateModal = useAppStore((s) => s.openGstRateModal);
  const [activeTab, setActiveTab] = React.useState('alter');

  return (
    <div className="flex h-full flex-col overflow-auto pr-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger
            tabValue="alter"
            currentValue={activeTab}
            onValueChange={setActiveTab}
          >
            Alter
          </TabsTrigger>
        </TabsList>
        <TabsContent
          when="alter"
          currentValue={activeTab}
          className="min-h-0 flex-1 border-[#D0D0D0] bg-[#FFF5F5]"
        >
          <div className="p-3">
            <div className="border border-[#D0D0D0] bg-white">
              <ScrollArea className="max-h-[calc(100vh-220px)]">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#DC2626] hover:bg-[#DC2626]">
                      <TableHead className="border-[#D0D0D0] text-white">
                        Ledger Name
                      </TableHead>
                      <TableHead className="border-[#D0D0D0] text-white">
                        Under
                      </TableHead>
                      <TableHead className="w-16 border-[#D0D0D0] text-right text-white">
                        Rate %
                      </TableHead>
                      <TableHead className="w-24 border-[#D0D0D0] text-white">
                        Type
                      </TableHead>
                      <TableHead className="border-[#D0D0D0] text-white">
                        Ledgers
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {taxLedgers.map((t) => (
                      <TableRow key={t.id}>
                        <TableCell className="border-[#D0D0D0] p-1">
                          <input
                            type="text"
                            className="w-full border-0 bg-transparent px-1 py-0.5 text-[10px] focus:border focus:border-[#DC2626] focus:outline-none"
                            value={t.ledgerName}
                            onChange={(e) =>
                              updateTaxLedger({
                                ...t,
                                ledgerName: e.target.value,
                              })
                            }
                          />
                        </TableCell>
                        <TableCell className="border-[#D0D0D0] p-1">
                          <input
                            type="text"
                            className="w-full border-0 bg-transparent px-1 py-0.5 text-[10px] focus:border focus:border-[#DC2626] focus:outline-none"
                            value={t.under}
                            onChange={(e) =>
                              updateTaxLedger({ ...t, under: e.target.value })
                            }
                          />
                        </TableCell>
                        <TableCell className="border-[#D0D0D0] p-1 text-right">
                          <input
                            type="number"
                            className="w-full border-0 bg-transparent px-1 py-0.5 text-right text-[10px] focus:border focus:border-[#DC2626] focus:outline-none"
                            value={t.ratePercent}
                            onChange={(e) =>
                              updateTaxLedger({
                                ...t,
                                ratePercent: Number(e.target.value) || 0,
                              })
                            }
                          />
                        </TableCell>
                        <TableCell className="border-[#D0D0D0] p-1">
                          <select
                            className="w-full border border-[#D0D0D0] bg-white px-1 py-0.5 text-[10px]"
                            value={t.type}
                            onChange={(e) =>
                              updateTaxLedger({
                                ...t,
                                type: e.target.value as 'IGST' | 'CGST' | 'SGST',
                              })
                            }
                          >
                            {TAX_TYPES.map((type) => (
                              <option key={type} value={type}>
                                {type}
                              </option>
                            ))}
                          </select>
                        </TableCell>
                        <TableCell className="border-[#D0D0D0] p-1">
                          <input
                            type="text"
                            className="w-full border-0 bg-transparent px-1 py-0.5 text-[10px] focus:border focus:border-[#DC2626] focus:outline-none"
                            value={t.ledgers}
                            onChange={(e) =>
                              updateTaxLedger({
                                ...t,
                                ledgers: e.target.value,
                              })
                            }
                          />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </div>
          </div>
        </TabsContent>
      </Tabs>
      <div className="mt-auto pt-2">
        <Button
          variant="outline"
          size="sm"
          className="bg-[#E8E8E8] text-[11px]"
          onClick={openGstRateModal}
        >
          F12: GST Rate Configuration
        </Button>
      </div>
    </div>
  );
}
