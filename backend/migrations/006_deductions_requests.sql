BEGIN;

CREATE TABLE IF NOT EXISTS deductions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    deduction_type VARCHAR(50) NOT NULL CHECK (deduction_type IN ('social_insurance','taxes','loan','medical_insurance','late_attendance','absence','other')),
    amount NUMERIC(12,2) NOT NULL CHECK (amount >= 0),
    month VARCHAR(7) NOT NULL,
    reason TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','active','cancelled')),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_updated_at_deductions BEFORE UPDATE ON deductions FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE IF NOT EXISTS requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    request_type VARCHAR(50) NOT NULL CHECK (request_type IN ('leave','vacation','loan','attendance_correction','payroll_correction','document_request','other')),
    reason TEXT NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected','cancelled')),
    reviewed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    reviewed_at TIMESTAMPTZ,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TRIGGER trg_updated_at_requests BEFORE UPDATE ON requests FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE INDEX idx_deductions_employee ON deductions(employee_id);
CREATE INDEX idx_deductions_status ON deductions(status);
CREATE INDEX idx_deductions_type ON deductions(deduction_type);
CREATE INDEX idx_deductions_month ON deductions(month);

CREATE INDEX idx_requests_employee ON requests(employee_id);
CREATE INDEX idx_requests_status ON requests(status);
CREATE INDEX idx_requests_type ON requests(request_type);

COMMIT;
