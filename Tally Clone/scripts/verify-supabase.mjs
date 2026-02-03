#!/usr/bin/env node
/**
 * Verification script for Supabase connectivity.
 * Run: node scripts/verify-supabase.mjs
 * Requires: VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env or environment
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

let url = process.env.VITE_SUPABASE_URL;
let anonKey = process.env.VITE_SUPABASE_ANON_KEY;
if (!url || !anonKey) {
  try {
    const env = readFileSync(resolve(process.cwd(), '.env'), 'utf8');
    for (const line of env.split('\n')) {
      const m = line.match(/^VITE_SUPABASE_URL=(.+)$/);
      if (m) url = m[1].trim();
      const k = line.match(/^VITE_SUPABASE_ANON_KEY=(.+)$/);
      if (k) anonKey = k[1].trim();
    }
  } catch (e) { /* ignore */ }
}

console.log('--- Supabase Verification ---');
console.log('VITE_SUPABASE_URL:', url ? `${url.slice(0, 30)}...` : 'MISSING');
console.log('VITE_SUPABASE_ANON_KEY:', anonKey ? 'loaded' : 'MISSING');

if (!url || !anonKey) {
  console.error('FAIL: Missing env variables');
  process.exit(1);
}

const supabase = createClient(url, anonKey);

async function run() {
  try {
    const { data, error } = await supabase.from('companies').select('*').limit(5);
    if (error) {
      console.error('FAIL: companies query error:', error.message);
      process.exit(1);
    }
    console.log('PASS: Supabase connected. Companies:', data?.length ?? 0);
    if (data?.length) {
      const cid = data[0].company_id ?? data[0].id;
      const { data: ledgers, error: lErr } = await supabase.from('ledgers').select('ledger_id').eq('company_id', cid).limit(5);
      if (lErr) console.log('Ledgers query:', lErr.message);
      else console.log('Ledgers for company:', ledgers?.length ?? 0);
    }
  } catch (err) {
    console.error('FAIL:', err.message);
    process.exit(1);
  }
}

run();
