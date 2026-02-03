/**
 * GST state logic: infer intra-state vs inter-state from company and party state.
 * Used to auto-detect when party state is available; falls back to manual flag otherwise.
 */

/**
 * Infers whether a transaction is inter-state based on company and party state.
 * Same state = intra-state. Different state = inter-state.
 * @returns true = inter-state, false = intra-state, undefined = cannot determine (use manual flag)
 */
export function inferIsInterState(companyState: string, partyState?: string | null): boolean | undefined {
  if (!companyState?.trim()) return undefined;
  if (!partyState?.trim()) return undefined;

  const company = normalizeState(companyState);
  const party = normalizeState(partyState);
  if (!company || !party) return undefined;

  return company !== party;
}

/** Normalize state name for comparison (trim, lowercase) */
function normalizeState(s: string): string {
  return s.trim().toLowerCase().replace(/\s+/g, ' ');
}
