import { supabase } from '../supabaseClient';
import { validateFinancialYear, type FinancialYearBounds } from '../utils/financialYear';
import { validateStockBeforeSales } from './stockMovement.service';
import { logAudit } from './audit.service';

/** Ledger entry for double-entry validation */
export interface LedgerEntryInput {
  ledger_id: number;
  amount: number;
  dr_cr: 'DR' | 'CR';
}

/** Validate that total DR = total CR. Rejects unbalanced vouchers with meaningful error. */
export function validateDrEqualsCr(entries: LedgerEntryInput[]): void {
  if (!entries?.length) {
    throw new Error('At least one ledger entry is required.');
  }
  let totalDr = 0;
  let totalCr = 0;
  for (const e of entries) {
    if (e.amount < 0) {
      throw new Error(`Invalid amount: ledger entries cannot be negative (${e.amount}).`);
    }
    if (e.dr_cr === 'DR') totalDr += e.amount;
    else totalCr += e.amount;
  }
  const diff = Math.abs(totalDr - totalCr);
  if (diff > 0.01) {
    throw new Error(
      `Voucher is not balanced. Debit total: ₹${totalDr.toFixed(2)}, Credit total: ₹${totalCr.toFixed(2)}. ` +
        `Difference: ₹${diff.toFixed(2)}. Debits must equal Credits.`
    );
  }
}

export async function createVoucher(
  payload: {
    company_id: number;
    voucher_type_id: number;
    voucher_date: string;
    voucher_number?: string;
    party_ledger_id?: number;
    narration?: string;
  },
  fyBounds?: FinancialYearBounds
) {
  if (fyBounds) {
    validateFinancialYear(payload.voucher_date, fyBounds);
  }
  const { data, error } = await supabase
    .from('vouchers')
    .insert(payload)
    .select()
    .single();
  if (error) {
    console.error('[Supabase] createVoucher failed:', error);
    throw error;
  }

  const voucherId = data?.voucher_id ?? data?.id;
  if (voucherId) {
    console.info('[Supabase] Voucher created:', voucherId);
    logAudit({
      entity: 'voucher',
      entity_id: voucherId,
      action: 'create',
      new_data: data,
    });
  }
  return data;
}

export async function addLedgerEntries(entries: {
  voucher_id: number;
  ledger_id: number;
  amount: number;
  dr_cr: 'DR' | 'CR';
  narration?: string;
}[]) {
  validateDrEqualsCr(entries);
  const { error } = await supabase.from('voucher_ledger_entries').insert(entries);
  if (error) throw error;
}

/** Create accounting voucher (Payment, Receipt, Journal, Contra) with ledger entries. Enforces DR=CR. */
export async function createAccountingVoucher(params: {
  company_id: number;
  voucher_type_id: number;
  voucher_date: string;
  voucher_number?: string;
  party_ledger_id?: number;
  narration?: string;
  entries: LedgerEntryInput[];
  fyBounds?: FinancialYearBounds;
}) {
  validateDrEqualsCr(params.entries);
  const voucher = await createVoucher({
    company_id: params.company_id,
    voucher_type_id: params.voucher_type_id,
    voucher_date: params.voucher_date,
    voucher_number: params.voucher_number,
    party_ledger_id: params.party_ledger_id,
    narration: params.narration,
  }, params.fyBounds);
  const voucherId = voucher?.voucher_id ?? voucher?.id;
  if (!voucherId) throw new Error('Voucher created but no id returned');
  const rows = params.entries.map((e) => ({
    voucher_id: voucherId,
    ledger_id: e.ledger_id,
    amount: e.amount,
    dr_cr: e.dr_cr,
  }));
  await addLedgerEntries(rows);
  return voucher;
}

/** Create Payment voucher: Dr Party, Cr Cash/Bank (or reverse for Receipt) */
export async function createPaymentVoucher(params: {
  company_id: number;
  voucher_type_id: number;
  voucher_date: string;
  voucher_number?: string;
  party_ledger_id: number;
  cash_or_bank_ledger_id: number;
  amount: number;
  narration?: string;
  is_receipt?: boolean; // if true: Dr Cash/Bank, Cr Party
  fyBounds?: FinancialYearBounds;
}) {
  const { amount, is_receipt } = params;
  const entries: LedgerEntryInput[] = is_receipt
    ? [
        { ledger_id: params.cash_or_bank_ledger_id, amount, dr_cr: 'DR' },
        { ledger_id: params.party_ledger_id, amount, dr_cr: 'CR' },
      ]
    : [
        { ledger_id: params.party_ledger_id, amount, dr_cr: 'DR' },
        { ledger_id: params.cash_or_bank_ledger_id, amount, dr_cr: 'CR' },
      ];
  return createAccountingVoucher({
    company_id: params.company_id,
    voucher_type_id: params.voucher_type_id,
    voucher_date: params.voucher_date,
    voucher_number: params.voucher_number,
    party_ledger_id: params.party_ledger_id,
    narration: params.narration,
    entries,
    fyBounds: params.fyBounds,
  });
}

export async function addStockItem(payload: {
  voucher_id: number;
  stock_item_id: number;
  godown_id?: number;
  quantity: number;
  rate: number;
  taxable_value: number;
  total_value: number;
}) {
  const { error } = await supabase.from('voucher_stock_items').insert(payload);
  if (error) throw error;
}

export async function addVoucherItemTax(payload: {
  voucher_id: number;
  voucher_stock_item_id?: number;
  ledger_id: number;
  amount: number;
  tax_rate?: number;
}) {
  const { error } = await supabase.from('voucher_item_taxes').insert(payload);
  if (error) throw error;
}

/** Create Sales voucher: voucher + ledger entries (Dr Party + GST, Cr Sales) + stock items + taxes */
export async function createSalesVoucher(params: {
  company_id: number;
  voucher_type_id: number;
  voucher_date: string;
  voucher_number?: string;
  party_ledger_id: number;
  sales_ledger_id: number;
  narration?: string;
  ledger_entries: LedgerEntryInput[];
  stock_items: {
    stock_item_id: number;
    godown_id?: number;
    quantity: number;
    rate: number;
    taxable_value: number;
    total_value: number;
  }[];
  tax_rows?: { ledger_id: number; amount: number; tax_rate?: number }[];
  fyBounds?: FinancialYearBounds;
}) {
  validateDrEqualsCr(params.ledger_entries);

  const stockCheck = await validateStockBeforeSales(
    params.company_id,
    params.stock_items.map((s) => ({ stock_item_id: s.stock_item_id, godown_id: s.godown_id, quantity: s.quantity }))
  );
  if (!stockCheck.valid) throw new Error(stockCheck.message);
  const voucher = await createVoucher({
    company_id: params.company_id,
    voucher_type_id: params.voucher_type_id,
    voucher_date: params.voucher_date,
    voucher_number: params.voucher_number,
    party_ledger_id: params.party_ledger_id,
    narration: params.narration,
  });
  const voucherId = voucher?.voucher_id ?? voucher?.id;
  if (!voucherId) throw new Error('Voucher created but no id returned');

  const entryRows = params.ledger_entries.map((e) => ({
    voucher_id: voucherId,
    ledger_id: e.ledger_id,
    amount: e.amount,
    dr_cr: e.dr_cr,
  }));
  await addLedgerEntries(entryRows);

  for (const si of params.stock_items) {
    await addStockItem({ voucher_id: voucherId, ...si });
  }

  if (params.tax_rows?.length) {
    for (const t of params.tax_rows) {
      await addVoucherItemTax({
        voucher_id: voucherId,
        ledger_id: t.ledger_id,
        amount: t.amount,
        tax_rate: t.tax_rate,
      });
    }
  }
  return voucher;
}

/** Create Purchase voucher: voucher + ledger entries (Dr Purchase + GST, Cr Party) + stock items + taxes */
export async function createPurchaseVoucher(params: {
  company_id: number;
  voucher_type_id: number;
  voucher_date: string;
  voucher_number?: string;
  party_ledger_id: number;
  purchase_ledger_id: number;
  narration?: string;
  ledger_entries: LedgerEntryInput[];
  stock_items: {
    stock_item_id: number;
    godown_id?: number;
    quantity: number;
    rate: number;
    taxable_value: number;
    total_value: number;
  }[];
  tax_rows?: { ledger_id: number; amount: number; tax_rate?: number }[];
  fyBounds?: FinancialYearBounds;
}) {
  validateDrEqualsCr(params.ledger_entries);
  const voucher = await createVoucher({
    company_id: params.company_id,
    voucher_type_id: params.voucher_type_id,
    voucher_date: params.voucher_date,
    voucher_number: params.voucher_number,
    party_ledger_id: params.party_ledger_id,
    narration: params.narration,
  }, params.fyBounds);
  const voucherId = voucher?.voucher_id ?? voucher?.id;
  if (!voucherId) throw new Error('Voucher created but no id returned');

  const entryRows = params.ledger_entries.map((e) => ({
    voucher_id: voucherId,
    ledger_id: e.ledger_id,
    amount: e.amount,
    dr_cr: e.dr_cr,
  }));
  await addLedgerEntries(entryRows);

  for (const si of params.stock_items) {
    await addStockItem({ voucher_id: voucherId, ...si });
  }

  if (params.tax_rows?.length) {
    for (const t of params.tax_rows) {
      await addVoucherItemTax({
        voucher_id: voucherId,
        ledger_id: t.ledger_id,
        amount: t.amount,
        tax_rate: t.tax_rate,
      });
    }
  }
  return voucher;
}

export async function getVouchers(company_id: number, limit = 100) {
  const { data, error } = await supabase
    .from('vouchers')
    .select('*, voucher_types(voucher_name, voucher_category)')
    .eq('company_id', company_id)
    .order('voucher_date', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return data ?? [];
}
