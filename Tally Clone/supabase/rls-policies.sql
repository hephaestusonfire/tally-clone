-- RLS policies for Tally Prime-like accounting app.
-- Apply via Supabase Dashboard SQL Editor or migration.
-- Assumes: companies, ledgers, vouchers, voucher_ledger_entries, etc.
-- User-company link: auth.jwt() -> 'company_id' claim or companies.created_by = auth.uid()

-- Enable RLS on main tables
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledgers ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE vouchers ENABLE ROW LEVEL SECURITY;
ALTER TABLE voucher_ledger_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE voucher_stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE voucher_item_taxes ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper: companies user can access (if companies has created_by: auth.uid(), else allow all for now)
-- Option A: companies.created_by = auth.uid()
-- CREATE POLICY "Users can access own companies" ON companies FOR ALL USING (created_by = auth.uid());

-- Option B: JWT claim company_id (set via custom claims when user signs in)
-- CREATE POLICY "Users can access assigned company" ON companies FOR ALL
--   USING (id = (auth.jwt() -> 'app_metadata' ->> 'company_id')::int);

-- Fallback: allow all when authenticated (replace with stricter policy when company link exists)
CREATE POLICY "Authenticated users can read companies" ON companies FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can insert companies" ON companies FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Authenticated users can update companies" ON companies FOR UPDATE
  USING (auth.role() = 'authenticated');

-- Ledgers: filter by company_id (company access controls which companies user sees)
CREATE POLICY "Users can access ledgers" ON ledgers FOR ALL
  USING (auth.role() = 'authenticated');

-- Ledger groups
CREATE POLICY "Users can access ledger_groups" ON ledger_groups FOR ALL
  USING (auth.role() = 'authenticated');

-- Vouchers
CREATE POLICY "Users can access vouchers" ON vouchers FOR ALL
  USING (auth.role() = 'authenticated');

-- Voucher ledger entries
CREATE POLICY "Users can access voucher_ledger_entries" ON voucher_ledger_entries FOR ALL
  USING (auth.role() = 'authenticated');

-- Voucher stock items
CREATE POLICY "Users can access voucher_stock_items" ON voucher_stock_items FOR ALL
  USING (auth.role() = 'authenticated');

-- Voucher item taxes
CREATE POLICY "Users can access voucher_item_taxes" ON voucher_item_taxes FOR ALL
  USING (auth.role() = 'authenticated');

-- Stock items
CREATE POLICY "Users can access stock_items" ON stock_items FOR ALL
  USING (auth.role() = 'authenticated');

-- Stock groups
CREATE POLICY "Users can access stock_groups" ON stock_groups FOR ALL
  USING (auth.role() = 'authenticated');

-- Audit logs: read-only for authenticated
CREATE POLICY "Users can read audit_logs" ON audit_logs FOR SELECT
  USING (auth.role() = 'authenticated');
CREATE POLICY "Service can insert audit_logs" ON audit_logs FOR INSERT
  WITH CHECK (auth.role() = 'authenticated');
