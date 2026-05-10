BEGIN;

CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    phone VARCHAR(30),
    date_of_birth DATE,
    gender VARCHAR(20) CHECK (gender IN ('male','female','other','prefer_not_to_say')),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(100),
    country VARCHAR(100) DEFAULT 'USA',
    zip_code VARCHAR(20),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    position VARCHAR(150),
    job_title VARCHAR(150),
    employment_type VARCHAR(50) DEFAULT 'full_time' CHECK (employment_type IN ('full_time','part_time','contract','intern','temporary','freelance')),
    employment_status VARCHAR(50) DEFAULT 'active' CHECK (employment_status IN ('active','inactive','on_leave','terminated','resigned','probation')),
    hire_date DATE NOT NULL,
    confirmation_date DATE,
    termination_date DATE,
    termination_reason TEXT,
    reports_to UUID,
    work_location VARCHAR(200),
    salary_currency VARCHAR(3) DEFAULT 'USD',
    base_salary NUMERIC(15,2),
    pay_frequency VARCHAR(20) DEFAULT 'monthly' CHECK (pay_frequency IN ('weekly','bi_weekly','semi_monthly','monthly','quarterly','annual')),
    bank_name VARCHAR(200),
    bank_account VARCHAR(100),
    bank_routing VARCHAR(50),
    tax_id VARCHAR(50),
    emergency_contact_name VARCHAR(150),
    emergency_contact_phone VARCHAR(30),
    emergency_contact_relation VARCHAR(50),
    avatar_url TEXT,
    bio TEXT,
    skills JSONB DEFAULT '[]'::jsonb,
    education JSONB DEFAULT '[]'::jsonb,
    certifications JSONB DEFAULT '[]'::jsonb,
    work_experience JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    custom_fields JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_updated_at_employees BEFORE UPDATE ON employees FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    date DATE NOT NULL,
    check_in TIMESTAMPTZ,
    check_out TIMESTAMPTZ,
    status VARCHAR(20) DEFAULT 'present' CHECK (status IN ('present','absent','late','half_day','on_leave','holiday','weekend','wfh')),
    work_hours NUMERIC(5,2) DEFAULT 0,
    overtime_hours NUMERIC(5,2) DEFAULT 0,
    break_minutes INTEGER DEFAULT 0,
    location TEXT,
    notes TEXT,
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    is_approved BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, date)
);
CREATE TRIGGER trg_updated_at_attendance BEFORE UPDATE ON attendance_records FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type VARCHAR(50) NOT NULL CHECK (leave_type IN ('annual','sick','personal','maternity','paternity','bereavement','unpaid','comp_time','sabbatical','other')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    duration_days NUMERIC(5,1) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','cancelled','withdrawn')),
    approver_id UUID REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMPTZ,
    rejection_reason TEXT,
    attachment_url TEXT,
    contact_during_leave VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_updated_at_leave_requests BEFORE UPDATE ON leave_requests FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS payroll_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    pay_period_start DATE NOT NULL,
    pay_period_end DATE NOT NULL,
    basic_salary NUMERIC(15,2) NOT NULL,
    housing_allowance NUMERIC(15,2) DEFAULT 0,
    transport_allowance NUMERIC(15,2) DEFAULT 0,
    medical_allowance NUMERIC(15,2) DEFAULT 0,
    food_allowance NUMERIC(15,2) DEFAULT 0,
    bonus NUMERIC(15,2) DEFAULT 0,
    commission NUMERIC(15,2) DEFAULT 0,
    overtime_pay NUMERIC(15,2) DEFAULT 0,
    other_earnings NUMERIC(15,2) DEFAULT 0,
    tax_deduction NUMERIC(15,2) DEFAULT 0,
    social_security NUMERIC(15,2) DEFAULT 0,
    health_insurance NUMERIC(15,2) DEFAULT 0,
    retirement_fund NUMERIC(15,2) DEFAULT 0,
    loan_deduction NUMERIC(15,2) DEFAULT 0,
    tax_penalty NUMERIC(15,2) DEFAULT 0,
    other_deductions NUMERIC(15,2) DEFAULT 0,
    deductions_notes TEXT,
    gross_pay NUMERIC(15,2) GENERATED ALWAYS AS (
        basic_salary + housing_allowance + transport_allowance + medical_allowance + food_allowance + bonus + commission + overtime_pay + other_earnings
    ) STORED,
    total_deductions NUMERIC(15,2) GENERATED ALWAYS AS (
        tax_deduction + social_security + health_insurance + retirement_fund + loan_deduction + tax_penalty + other_deductions
    ) STORED,
    net_pay NUMERIC(15,2) GENERATED ALWAYS AS (
        (basic_salary + housing_allowance + transport_allowance + medical_allowance + food_allowance + bonus + commission + overtime_pay + other_earnings)
        - (tax_deduction + social_security + health_insurance + retirement_fund + loan_deduction + tax_penalty + other_deductions)
    ) STORED,
    pay_date DATE,
    payment_method VARCHAR(30) DEFAULT 'bank_transfer' CHECK (payment_method IN ('bank_transfer','check','cash','direct_deposit')),
    payment_reference VARCHAR(100),
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','pending','processing','paid','failed','cancelled')),
    notes TEXT,
    processed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_updated_at_payroll BEFORE UPDATE ON payroll_records FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS employee_documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL CHECK (document_type IN ('resume','cover_letter','id_card','passport','driving_license','degree_certificate','transcript','professional_certification','offer_letter','employment_contract','nda','tax_form','medical_record','visa','work_permit','reference_letter','performance_review','other')),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    file_name VARCHAR(500) NOT NULL,
    file_url TEXT NOT NULL,
    file_size BIGINT DEFAULT 0,
    file_type VARCHAR(100),
    mime_type VARCHAR(100),
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES users(id) ON DELETE SET NULL,
    verified_at TIMESTAMPTZ,
    expires_at DATE,
    is_confidential BOOLEAN DEFAULT false,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_updated_at_employee_documents BEFORE UPDATE ON employee_documents FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_employees_user_id ON employees(user_id);
CREATE INDEX idx_employees_department_id ON employees(department_id);
CREATE INDEX idx_employees_employee_code ON employees(employee_code);
CREATE INDEX idx_employees_email ON employees(email);
CREATE INDEX idx_employees_reports_to ON employees(reports_to);
CREATE INDEX idx_employees_employment_status ON employees(employment_status);
CREATE INDEX idx_attendance_employee_id ON attendance_records(employee_id);
CREATE INDEX idx_attendance_date ON attendance_records(date);
CREATE INDEX idx_attendance_status ON attendance_records(status);
CREATE INDEX idx_attendance_employee_date ON attendance_records(employee_id, date);
CREATE INDEX idx_leave_requests_employee_id ON leave_requests(employee_id);
CREATE INDEX idx_leave_requests_status ON leave_requests(status);
CREATE INDEX idx_leave_requests_leave_type ON leave_requests(leave_type);
CREATE INDEX idx_leave_requests_dates ON leave_requests(start_date, end_date);
CREATE INDEX idx_payroll_employee_id ON payroll_records(employee_id);
CREATE INDEX idx_payroll_status ON payroll_records(status);
CREATE INDEX idx_payroll_pay_period ON payroll_records(pay_period_start, pay_period_end);
CREATE INDEX idx_employee_documents_employee_id ON employee_documents(employee_id);
CREATE INDEX idx_employee_documents_type ON employee_documents(document_type);
CREATE INDEX idx_employee_documents_verified ON employee_documents(is_verified);

COMMIT;
