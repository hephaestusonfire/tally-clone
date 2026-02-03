/**
 * Financial year lock: prevent voucher edit/delete when year is locked.
 * Respects existing UI; disable silently when locked.
 */

export interface FinancialYearLockConfig {
  /** Locked financial year starts (e.g. '2023-04-01' for FY 2023-24) */
  lockedYears: string[];
}

let lockConfig: FinancialYearLockConfig = { lockedYears: [] };

export function setFinancialYearLockConfig(config: Partial<FinancialYearLockConfig>) {
  lockConfig = { ...lockConfig, ...config };
}

export function getFinancialYearLockConfig(): FinancialYearLockConfig {
  return lockConfig;
}

/** Check if a voucher date falls in a locked financial year */
export function isVoucherDateLocked(voucherDate: string): boolean {
  const date = new Date(voucherDate);
  for (const startStr of lockConfig.lockedYears) {
    const start = new Date(startStr);
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + 1);
    end.setDate(end.getDate() - 1);
    if (date >= start && date <= end) return true;
  }
  return false;
}

/** Can edit/delete voucher? Returns false when date is in locked year */
export function canEditVoucher(voucherDate: string): boolean {
  return !isVoucherDateLocked(voucherDate);
}
