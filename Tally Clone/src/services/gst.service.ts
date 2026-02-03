/**
 * GST service: validation, state inference, and compliance checks at voucher save.
 */

import { getCompany } from './company.service';
import { validateGstTaxType, type GstLine } from '../utils/gstValidation';
import { inferIsInterState } from '../utils/gstState';

/** Result of GST validation at voucher save */
export interface GstValidationResult {
  valid: boolean;
  isInterState: boolean;
  message?: string;
}

/**
 * Validates GST at voucher save.
 * - Fetches company state for auto-detection (when party state available)
 * - Validates GST tax type matches intra/inter-state
 */
export async function validateGstAtVoucherSave(
  company_id: number,
  _partyLedgerId: number | undefined,
  partyState: string | null | undefined,
  manualIsInterState: boolean,
  gstLines: GstLine[]
): Promise<GstValidationResult> {
  let isInterState = manualIsInterState;

  try {
    const company = await getCompany(company_id);
    const companyState = (company as { state?: string })?.state ?? '';
    const inferred = inferIsInterState(companyState, partyState);
    if (inferred !== undefined) {
      isInterState = inferred;
      if (inferred !== manualIsInterState) {
        return {
          valid: false,
          isInterState: inferred,
          message: inferred
            ? 'Party state differs from company state. This is an inter-state supply. Please select Inter-state (IGST).'
            : 'Party state matches company state. This is an intra-state supply. Please select Intra-state (CGST+SGST).',
        };
      }
    }

    validateGstTaxType(isInterState, gstLines);
    return { valid: true, isInterState };
  } catch (err) {
    return {
      valid: false,
      isInterState,
      message: err instanceof Error ? err.message : 'GST validation failed.',
    };
  }
}
