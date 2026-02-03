/**
 * Validates that a date falls within a company's financial year.
 * Used before voucher save to enforce accounting period boundaries.
 */

export interface FinancialYearBounds {
  financial_year_start: string;
  financial_year_end: string;
}

export function isDateInFinancialYear(
  dateStr: string,
  bounds: FinancialYearBounds
): boolean {
  const date = new Date(dateStr);
  const start = new Date(bounds.financial_year_start);
  const end = new Date(bounds.financial_year_end);
  return date >= start && date <= end;
}

export function validateFinancialYear(
  dateStr: string,
  bounds: FinancialYearBounds
): void {
  if (!isDateInFinancialYear(dateStr, bounds)) {
    throw new Error(
      `Voucher date ${dateStr} is outside the financial year (${bounds.financial_year_start} to ${bounds.financial_year_end}).`
    );
  }
}
