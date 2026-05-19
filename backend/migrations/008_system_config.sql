BEGIN;

-- System Configuration tables
-- Stores company-level HR/payroll rules and branches

CREATE TABLE IF NOT EXISTS company_branches (
    id SERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL UNIQUE,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE TRIGGER trg_updated_at_company_branches BEFORE UPDATE ON company_branches FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS system_config (
    id INTEGER PRIMARY KEY DEFAULT 1 CHECK (id = 1),
    -- Attendance Policy
    working_hours_per_day NUMERIC(4,1) NOT NULL DEFAULT 8.0,
    working_days_per_month INTEGER NOT NULL DEFAULT 22,
    grace_period_minutes INTEGER NOT NULL DEFAULT 15,
    standard_start_time VARCHAR(10) NOT NULL DEFAULT '09:00',
    standard_end_time VARCHAR(10) NOT NULL DEFAULT '17:00',
    weekend_days JSONB NOT NULL DEFAULT '["Saturday","Sunday"]',
    absence_mode VARCHAR(20) NOT NULL DEFAULT 'fixed',
    fixed_absence_amount NUMERIC(12,2) NOT NULL DEFAULT 100.00,
    progressive_absence_amounts JSONB NOT NULL DEFAULT '[50,100,200,400,800]',
    enable_late_deduction BOOLEAN NOT NULL DEFAULT true,
    late_threshold_hours NUMERIC(4,1) NOT NULL DEFAULT 3.0,
    late_deduction_type VARCHAR(20) NOT NULL DEFAULT 'fraction',
    late_deduction_fraction VARCHAR(20) NOT NULL DEFAULT 'quarter',
    late_fixed_amount NUMERIC(12,2) NOT NULL DEFAULT 0.00,
    -- Payroll Rules
    payroll_frequency VARCHAR(20) NOT NULL DEFAULT 'monthly',
    default_payroll_day INTEGER NOT NULL DEFAULT 28,
    auto_generate_payslip BOOLEAN NOT NULL DEFAULT true,
    allow_negative_salary BOOLEAN NOT NULL DEFAULT false,
    overtime_enabled BOOLEAN NOT NULL DEFAULT true,
    overtime_rate_multiplier NUMERIC(6,2) NOT NULL DEFAULT 1.50,
    -- Company-Level Deductions
    annual_tax_bulk_amount NUMERIC(14,2) NOT NULL DEFAULT 1000000.00,
    annual_insurance_bulk_amount NUMERIC(14,2) NOT NULL DEFAULT 600000.00,
    -- Medical Insurance
    medical_insurance_enabled BOOLEAN NOT NULL DEFAULT true,
    medical_deduction_type VARCHAR(20) NOT NULL DEFAULT 'fixed',
    medical_fixed_monthly_amount NUMERIC(12,2) NOT NULL DEFAULT 300.00,
    medical_percentage_rate NUMERIC(6,2) NOT NULL DEFAULT 2.00,
    medical_apply_to VARCHAR(20) NOT NULL DEFAULT 'enabled_only',
    -- Loan Rules
    loan_enabled BOOLEAN NOT NULL DEFAULT true,
    loan_default_behavior VARCHAR(30) NOT NULL DEFAULT 'fixed_installment',
    loan_auto_deduct BOOLEAN NOT NULL DEFAULT true,
    -- Metadata
    updated_by VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE TRIGGER trg_updated_at_system_config BEFORE UPDATE ON system_config FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Seed default branches
INSERT INTO company_branches (name, is_active) VALUES
    ('Main Office', true),
    ('South Branch', true),
    ('West Branch', true),
    ('Downtown Branch', true),
    ('Customer Service Center', true),
    ('Corporate Headquarters', true)
ON CONFLICT DO NOTHING;

-- Seed default config (single row, id=1)
INSERT INTO system_config (id) VALUES (1) ON CONFLICT DO NOTHING;

COMMIT;
