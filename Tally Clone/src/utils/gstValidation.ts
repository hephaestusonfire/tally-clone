/**
 * GST validation logic for voucher save.
 * Enforces intra-state = CGST+SGST only, inter-state = IGST only.
 */

export type GstTaxType = 'IGST' | 'CGST' | 'SGST';

export interface GstLine {
  ledgerName: string;
  amount: number;
  type: GstTaxType;
}

/**
 * Validates that GST lines match the transaction type.
 * - Intra-state: only CGST and/or SGST allowed. Reject IGST.
 * - Inter-state: only IGST allowed. Reject CGST or SGST.
 */
export function validateGstTaxType(isInterState: boolean, gstLines: GstLine[]): void {
  const hasIgst = gstLines.some((l) => l.type === 'IGST');
  const hasCgst = gstLines.some((l) => l.type === 'CGST');
  const hasSgst = gstLines.some((l) => l.type === 'SGST');

  if (isInterState) {
    if (hasCgst || hasSgst) {
      throw new Error(
        'Inter-state transactions must use IGST only. CGST and SGST are not allowed for inter-state supplies.'
      );
    }
    if (!hasIgst && gstLines.length > 0) {
      throw new Error('Inter-state transactions with GST must use IGST ledger(s).');
    }
  } else {
    if (hasIgst) {
      throw new Error(
        'Intra-state transactions must use CGST + SGST. IGST is not allowed for intra-state supplies.'
      );
    }
    if ((hasCgst && !hasSgst) || (!hasCgst && hasSgst)) {
      throw new Error('Intra-state GST requires both CGST and SGST when tax is applicable.');
    }
  }
}
