#!/usr/bin/env node
/**
 * Full verification: connection, company, ledger_group, ledger, voucher, audit.
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

const supabase = createClient(url || '', anonKey || '');
const results = { connection: false, company: false, ledgerGroup: false, ledger: false, voucher: false, audit: false };

async function run() {
  console.log('=== Full Verification ===\n');

  // 1. Connection
  const { data: companies, error: ce } = await supabase.from('companies').select('*').limit(1);
  if (ce) {
    console.log('1. Connection: FAIL -', ce.message);
    return;
  }
  results.connection = true;
  console.log('1. Connection: PASS');

  const companyId = companies?.[0]?.company_id ?? companies?.[0]?.id;
  if (!companyId) {
    console.log('2. Company: SKIP (no company in DB)');
  } else {
    results.company = true;
    console.log('2. Company: PASS (company_id:', companyId, ')');
  }

  // 3. Ledger Group
  const { data: lg, error: lge } = await supabase.from('ledger_groups').insert({
    company_id: companyId,
    group_name: 'QA Test Group',
    nature: 'ASSETS',
  }).select().single();
  if (lge) {
    console.log('3. Ledger Group: FAIL -', lge.message);
  } else {
    results.ledgerGroup = true;
    const groupId = lg?.group_id ?? lg?.id;
    console.log('3. Ledger Group: PASS (group_id:', groupId, ')');

    // 4. Ledger
    const { data: lr, error: lre } = await supabase.from('ledgers').insert({
      company_id: companyId,
      ledger_name: 'QA Test Ledger',
      group_id: groupId,
      opening_balance: 1000,
      opening_balance_type: 'DR',
    }).select().single();
    if (lre) {
      console.log('4. Ledger: FAIL -', lre.message);
    } else {
      results.ledger = true;
      const ledgerId = lr?.ledger_id ?? lr?.id;
      console.log('4. Ledger: PASS (ledger_id:', ledgerId, ')');

      // 5. Voucher (need voucher_type_id)
      const { data: vtypes } = await supabase.from('voucher_types').select('voucher_type_id').eq('company_id', companyId).limit(1);
      const vtId = vtypes?.[0]?.voucher_type_id ?? vtypes?.[0]?.id;
      if (!vtId) {
        console.log('5. Voucher: SKIP (no voucher type)');
      } else {
        const { data: v, error: ve } = await supabase.from('vouchers').insert({
          company_id: companyId,
          voucher_type_id: vtId,
          voucher_date: new Date().toISOString().slice(0, 10),
          party_ledger_id: ledgerId,
        }).select().single();
        if (ve) {
          console.log('5. Voucher: FAIL -', ve.message);
        } else {
          results.voucher = true;
          const vid = v?.voucher_id ?? v?.id;
          await supabase.from('voucher_ledger_entries').insert([
            { voucher_id: vid, ledger_id: ledgerId, amount: 500, dr_cr: 'DR' },
            { voucher_id: vid, ledger_id: ledgerId, amount: 500, dr_cr: 'CR' },
          ]);
          console.log('5. Voucher: PASS (voucher_id:', vid, ')');
        }
      }
    }
  }

  // 6. Audit logs
  const { data: audits, error: ae } = await supabase.from('audit_logs').select('*').limit(1);
  if (ae) {
    console.log('6. Audit: FAIL (table/query) -', ae.message);
  } else {
    results.audit = true;
    console.log('6. Audit: PASS (audit_logs readable, count:', audits?.length ?? 0, ')');
  }

  console.log('\n=== SUMMARY ===');
  console.log('Connection:', results.connection ? 'PASS' : 'FAIL');
  console.log('Company:', results.company ? 'PASS' : 'FAIL');
  console.log('Ledger Group:', results.ledgerGroup ? 'PASS' : 'FAIL');
  console.log('Ledger:', results.ledger ? 'PASS' : 'FAIL');
  console.log('Voucher:', results.voucher ? 'PASS' : 'FAIL');
  console.log('Audit:', results.audit ? 'PASS' : 'FAIL');
}

run().catch((e) => console.error('Error:', e.message));
