/**
 * Supabase Auth integration.
 * Wire logic behind existing UI - no layout changes.
 * Links authenticated user to company_id when schema supports it.
 */

import { useEffect, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { supabase } from '../supabaseClient';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
      setUser(s?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  /** Get company_id from user metadata (when linked via app_metadata or user_metadata). */
  const companyIdFromUser = user?.user_metadata?.company_id ?? user?.app_metadata?.company_id;

  return { user, session, loading, companyIdFromUser };
}
