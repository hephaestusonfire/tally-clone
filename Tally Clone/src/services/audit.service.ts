import { supabase } from '../supabaseClient';

export interface AuditPayload {
  entity: string;
  entity_id: number;
  action: string;
  old_data?: unknown;
  new_data?: unknown;
}

/** Log audit entry. Fire-and-forget so business logic is not blocked by audit failure. */
export async function logAudit(payload: AuditPayload): Promise<void> {
  try {
    await supabase.from('audit_logs').insert(payload);
  } catch (err) {
    console.warn('Audit log failed:', err);
  }
}

