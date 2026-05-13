BEGIN;

CREATE TABLE IF NOT EXISTS loan_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    amount NUMERIC(12,2) NOT NULL CHECK (amount > 0),
    purpose TEXT NOT NULL,
    monthly_installment NUMERIC(12,2) GENERATED ALWAYS AS (ROUND(amount / NULLIF(repayment_months, 0), 2)) STORED,
    repayment_months INT NOT NULL CHECK (repayment_months > 0),
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    approved_by UUID REFERENCES users(id) ON DELETE SET NULL,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT loan_status_check CHECK (status IN ('pending', 'approved', 'rejected', 'paid'))
);

CREATE INDEX idx_loan_requests_employee ON loan_requests(employee_id);
CREATE INDEX idx_loan_requests_status ON loan_requests(status);

COMMIT;
