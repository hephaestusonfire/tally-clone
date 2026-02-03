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

export function StockMastersView() {
  const activeView = useAppStore((s) => s.activeView);
  const stockGroups = useAppStore((s) => s.stockGroups);
  const stockItems = useAppStore((s) => s.stockItems);
  const updateStockGroup = useAppStore((s) => s.updateStockGroup);
  const updateStockItem = useAppStore((s) => s.updateStockItem);
  const openConfig = useAppStore((s) => s.openConfig);
  const [activeTab, setActiveTab] = React.useState(
    activeView === 'stock-items' ? 'items' : 'groups',
  );
  React.useEffect(() => {
    if (activeView === 'stock-items') setActiveTab('items');
    else if (activeView === 'stock-groups') setActiveTab('groups');
  }, [activeView]);

  return (
    <div className="flex h-full flex-col overflow-auto pr-4">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger tabValue="groups" currentValue={activeTab} onValueChange={setActiveTab}>
            Stock Groups
          </TabsTrigger>
          <TabsTrigger tabValue="items" currentValue={activeTab} onValueChange={setActiveTab}>
            Stock Items
          </TabsTrigger>
        </TabsList>
        <TabsContent
          when="groups"
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
                        Name
                      </TableHead>
                      <TableHead className="border-[#D0D0D0] text-white">
                        Under
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockGroups.map((g) => (
                      <TableRow key={g.id}>
                        <TableCell className="border-[#D0D0D0] p-1">
                          <input
                            type="text"
                            className="w-full border-0 bg-transparent px-1 py-0.5 text-[10px] focus:border focus:border-[#DC2626] focus:outline-none"
                            value={g.name}
                            onChange={(e) =>
                              updateStockGroup({ ...g, name: e.target.value })
                            }
                          />
                        </TableCell>
                        <TableCell className="border-[#D0D0D0] p-1">
                          <input
                            type="text"
                            className="w-full border-0 bg-transparent px-1 py-0.5 text-[10px] focus:border focus:border-[#DC2626] focus:outline-none"
                            value={g.under}
                            onChange={(e) =>
                              updateStockGroup({ ...g, under: e.target.value })
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
        <TabsContent
          when="items"
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
                        Name
                      </TableHead>
                      <TableHead className="border-[#D0D0D0] text-white">
                        Under
                      </TableHead>
                      <TableHead className="w-16 border-[#D0D0D0] text-white">
                        Unit
                      </TableHead>
                      <TableHead className="w-20 border-[#D0D0D0] text-right text-white">
                        Opening Qty
                      </TableHead>
                      <TableHead className="w-20 border-[#D0D0D0] text-right text-white">
                        Rate
                      </TableHead>
                      <TableHead className="w-24 border-[#D0D0D0] text-right text-white">
                        Value (₹)
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {stockItems.map((i) => (
                      <TableRow key={i.id}>
                        <TableCell className="border-[#D0D0D0] p-1">
                          <input
                            type="text"
                            className="w-full border-0 bg-transparent px-1 py-0.5 text-[10px] focus:border focus:border-[#DC2626] focus:outline-none"
                            value={i.name}
                            onChange={(e) =>
                              updateStockItem({ ...i, name: e.target.value })
                            }
                          />
                        </TableCell>
                        <TableCell className="border-[#D0D0D0] p-1">
                          <input
                            type="text"
                            className="w-full border-0 bg-transparent px-1 py-0.5 text-[10px] focus:border focus:border-[#DC2626] focus:outline-none"
                            value={i.under}
                            onChange={(e) =>
                              updateStockItem({ ...i, under: e.target.value })
                            }
                          />
                        </TableCell>
                        <TableCell className="border-[#D0D0D0] p-1">
                          <input
                            type="text"
                            className="w-full border-0 bg-transparent px-1 py-0.5 text-[10px] focus:border focus:border-[#DC2626] focus:outline-none"
                            value={i.unit}
                            onChange={(e) =>
                              updateStockItem({ ...i, unit: e.target.value })
                            }
                          />
                        </TableCell>
                        <TableCell className="border-[#D0D0D0] p-1 text-right">
                          <input
                            type="number"
                            className="w-full border-0 bg-transparent px-1 py-0.5 text-right text-[10px] focus:border focus:border-[#DC2626] focus:outline-none"
                            value={i.openingQty}
                            onChange={(e) => {
                              const qty = Number(e.target.value) || 0;
                              updateStockItem({
                                ...i,
                                openingQty: qty,
                                value: qty * i.rate,
                              });
                            }}
                          />
                        </TableCell>
                        <TableCell className="border-[#D0D0D0] p-1 text-right">
                          <input
                            type="number"
                            className="w-full border-0 bg-transparent px-1 py-0.5 text-right text-[10px] focus:border focus:border-[#DC2626] focus:outline-none"
                            value={i.rate}
                            onChange={(e) => {
                              const rate = Number(e.target.value) || 0;
                              updateStockItem({
                                ...i,
                                rate,
                                value: i.openingQty * rate,
                              });
                            }}
                          />
                        </TableCell>
                        <TableCell className="border-[#D0D0D0] p-1 text-right text-[10px]">
                          ₹ {i.value.toLocaleString('en-IN')}
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
          onClick={openConfig}
        >
          F12: Alter
        </Button>
      </div>
    </div>
  );
}
