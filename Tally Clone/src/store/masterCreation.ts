export interface MasterItem {
  id: string;
  label: string;
  view?: string;
  formType?:
    | 'group'
    | 'ledger'
    | 'multiple-ledgers'
    | 'stock-group'
    | 'stock-category'
    | 'stock-item'
    | 'unit'
    | 'godown'
    | 'currency'
    | 'voucher-type'
    | 'credit-limits'
    | 'scenario'
    | 'gst-registration'
    | 'gst-classification'
    | 'statutory-details'
    | 'placeholder';
  inactive?: boolean;
}

export interface MasterCategory {
  id: string;
  label: string;
  items: MasterItem[];
}

export const MASTER_CATEGORIES: MasterCategory[] = [
  {
    id: 'accounting',
    label: 'Accounting Masters',
    items: [
      { id: 'group', label: 'Group', formType: 'group' as const },
      { id: 'ledger', label: 'Ledger', formType: 'ledger' },
      { id: 'multiple-ledgers', label: 'Multiple Ledgers', formType: 'multiple-ledgers' },
      { id: 'currency', label: 'Currency', formType: 'currency' },
      { id: 'budget', label: 'Budget', formType: 'placeholder' },
      { id: 'scenario', label: 'Scenario', formType: 'scenario' },
      { id: 'voucher-type', label: 'Voucher Type', formType: 'voucher-type' },
      { id: 'credit-limits', label: 'Credit Limits', formType: 'credit-limits' },
    ],
  },
  {
    id: 'inventory',
    label: 'Inventory Masters',
    items: [
      { id: 'stock-group', label: 'Stock Group', formType: 'stock-group' },
      { id: 'stock-category', label: 'Stock Category', formType: 'stock-category' },
      { id: 'stock-item', label: 'Stock Item', formType: 'stock-item' },
      { id: 'unit', label: 'Unit', formType: 'unit' },
      { id: 'godown', label: 'Godown', formType: 'godown' },
    ],
  },
  {
    id: 'statutory',
    label: 'Statutory Masters',
    items: [
      { id: 'gst-registration', label: 'GST Registration', formType: 'gst-registration' },
      { id: 'gst-classification', label: 'GST Classification', formType: 'gst-classification' },
      { id: 'statutory-details', label: 'Statutory Details', formType: 'statutory-details' },
      { id: 'company-gst', label: 'Company GST Details', formType: 'placeholder' },
      { id: 'pan-cin', label: 'PAN / CIN Details', formType: 'placeholder' },
    ],
  },
];

/** Expanded categories for Alter: includes Reorder Level, Copy Allocation, GST Rate Setup */
export const MASTER_CATEGORIES_ALTER: MasterCategory[] = [
  {
    id: 'accounting',
    label: 'Accounting Masters',
    items: [
      { id: 'group', label: 'Group', formType: 'group' as const },
      { id: 'ledger', label: 'Ledger', formType: 'ledger' },
      { id: 'multiple-ledgers', label: 'Multiple Ledgers', formType: 'multiple-ledgers' },
      { id: 'currency', label: 'Currency', formType: 'currency' },
      { id: 'budget', label: 'Budget', formType: 'placeholder' },
      { id: 'scenario', label: 'Scenario', formType: 'scenario' },
      { id: 'voucher-type', label: 'Voucher Type', formType: 'voucher-type' },
      { id: 'credit-limits', label: 'Credit Limits', formType: 'credit-limits' },
    ],
  },
  {
    id: 'inventory',
    label: 'Inventory Masters',
    items: [
      { id: 'stock-group', label: 'Stock Group', formType: 'stock-group' },
      { id: 'stock-category', label: 'Stock Category', formType: 'stock-category' },
      { id: 'stock-item', label: 'Stock Item', formType: 'stock-item' },
      { id: 'unit', label: 'Unit', formType: 'unit' },
      { id: 'godown', label: 'Godown', formType: 'godown' },
      { id: 'reorder-stock-item', label: 'Reorder Level (Stock Item)', formType: 'placeholder' },
      { id: 'reorder-stock-group', label: 'Reorder Level (Stock Group)', formType: 'placeholder' },
      { id: 'copy-allocation', label: 'Copy Allocation Details', formType: 'placeholder' },
    ],
  },
  {
    id: 'statutory',
    label: 'Statutory Masters',
    items: [
      { id: 'gst-registration', label: 'GST Registration', formType: 'gst-registration' },
      { id: 'gst-classification', label: 'GST Classification', formType: 'gst-classification' },
      { id: 'statutory-details', label: 'Statutory Details', formType: 'statutory-details' },
      { id: 'company-gst', label: 'Company GST Details', formType: 'placeholder' },
      { id: 'pan-cin', label: 'PAN / CIN Details', formType: 'placeholder' },
      { id: 'gst-rate-setup', label: 'GST Rate Setup', formType: 'placeholder' },
    ],
  },
];

const INITIAL_VISIBLE = 5;

export function getVisibleItems(items: MasterItem[], showMore: boolean, showInactive: boolean): MasterItem[] {
  const filtered = showInactive ? items : items.filter((i) => !i.inactive);
  return showMore ? filtered : filtered.slice(0, INITIAL_VISIBLE);
}

export function hasMoreItems(items: MasterItem[], showMore: boolean, showInactive: boolean): boolean {
  const filtered = showInactive ? items : items.filter((i) => !i.inactive);
  return filtered.length > INITIAL_VISIBLE && !showMore;
}
