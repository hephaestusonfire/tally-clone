import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!url || !anonKey) {
  console.error('[Supabase] Missing env: VITE_SUPABASE_URL=', !!url, 'VITE_SUPABASE_ANON_KEY=', !!anonKey);
} else {
  console.info('[Supabase] Connected: URL loaded, anon key loaded');
}

export const supabase = createClient(url || '', anonKey || '');
