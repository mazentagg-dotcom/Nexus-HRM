BEGIN;

-- ============================================
-- Onboarding Templates
-- ============================================
CREATE TABLE IF NOT EXISTS onboarding_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    position VARCHAR(150),
    is_active BOOLEAN DEFAULT true,
    duration_days INTEGER DEFAULT 30,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_updated_at_onboarding_templates BEFORE UPDATE ON onboarding_templates FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================
-- Onboarding Tasks
-- ============================================
CREATE TABLE IF NOT EXISTS onboarding_tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    template_id UUID NOT NULL REFERENCES onboarding_templates(id) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL,
    description TEXT,
    task_type VARCHAR(50) DEFAULT 'general' CHECK (task_type IN ('document','training','meeting','setup','review','general')),
    day_offset INTEGER NOT NULL DEFAULT 1,
    is_required BOOLEAN DEFAULT true,
    assignee_role VARCHAR(50) DEFAULT 'employee' CHECK (assignee_role IN ('employee','manager','hr','it')),
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_updated_at_onboarding_tasks BEFORE UPDATE ON onboarding_tasks FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================
-- Onboarding Instances
-- ============================================
CREATE TABLE IF NOT EXISTS onboarding_instances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    template_id UUID NOT NULL REFERENCES onboarding_templates(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('not_started','in_progress','completed','cancelled')),
    start_date DATE NOT NULL,
    end_date DATE,
    completion_percentage NUMERIC(5,2) DEFAULT 0,
    notes TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_updated_at_onboarding_instances BEFORE UPDATE ON onboarding_instances FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================
-- Onboarding Task Progress
-- ============================================
CREATE TABLE IF NOT EXISTS onboarding_task_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    instance_id UUID NOT NULL REFERENCES onboarding_instances(id) ON DELETE CASCADE,
    task_id UUID NOT NULL REFERENCES onboarding_tasks(id) ON DELETE CASCADE,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','in_progress','completed','skipped')),
    completed_at TIMESTAMPTZ,
    completed_by UUID REFERENCES users(id) ON DELETE SET NULL,
    notes TEXT,
    attachment_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(instance_id, task_id)
);
CREATE TRIGGER trg_updated_at_onboarding_task_progress BEFORE UPDATE ON onboarding_task_progress FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================
-- Review Cycles
-- ============================================
CREATE TABLE IF NOT EXISTS review_cycles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    review_type VARCHAR(50) NOT NULL CHECK (review_type IN ('annual','semi_annual','quarterly','monthly','probation','ad_hoc','360')),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft','active','completed','cancelled')),
    self_review BOOLEAN DEFAULT true,
    peer_review BOOLEAN DEFAULT false,
    manager_review BOOLEAN DEFAULT true,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    include_inactive BOOLEAN DEFAULT false,
    goals_template JSONB DEFAULT '[]'::jsonb,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_updated_at_review_cycles BEFORE UPDATE ON review_cycles FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================
-- Review Assignments
-- ============================================
CREATE TABLE IF NOT EXISTS review_assignments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_id UUID NOT NULL REFERENCES review_cycles(id) ON DELETE CASCADE,
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    review_type VARCHAR(20) NOT NULL CHECK (review_type IN ('self','manager','peer','direct_report')),
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending','in_progress','submitted','skipped')),
    submitted_at TIMESTAMPTZ,
    due_date DATE NOT NULL,
    reminder_sent_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(cycle_id, employee_id, reviewer_id, review_type)
);
CREATE TRIGGER trg_updated_at_review_assignments BEFORE UPDATE ON review_assignments FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================
-- Review Ratings
-- ============================================
CREATE TABLE IF NOT EXISTS review_ratings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES review_assignments(id) ON DELETE CASCADE,
    overall_rating NUMERIC(3,1) CHECK (overall_rating >= 1 AND overall_rating <= 5),
    strengths TEXT,
    areas_for_improvement TEXT,
    goals_for_next_period TEXT,
    comments TEXT,
    recommendation VARCHAR(30) CHECK (recommendation IN ('no_change','promotion','lateral_move','performance_improvement','salary_increase','role_change')),
    is_anonymous BOOLEAN DEFAULT false,
    submitted_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_updated_at_review_ratings BEFORE UPDATE ON review_ratings FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================
-- Review Questions
-- ============================================
CREATE TABLE IF NOT EXISTS review_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cycle_id UUID NOT NULL REFERENCES review_cycles(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(30) DEFAULT 'rating' CHECK (question_type IN ('rating','text','yes_no','rating_with_comment','multi_choice')),
    category VARCHAR(100),
    rating_scale INTEGER DEFAULT 5 CHECK (rating_scale IN (3,5,7,10)),
    weight NUMERIC(5,2) DEFAULT 1.00,
    is_required BOOLEAN DEFAULT true,
    sort_order INTEGER DEFAULT 0,
    options JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_updated_at_review_questions BEFORE UPDATE ON review_questions FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================
-- Review Responses
-- ============================================
CREATE TABLE IF NOT EXISTS review_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL REFERENCES review_assignments(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES review_questions(id) ON DELETE CASCADE,
    rating_value INTEGER,
    text_response TEXT,
    yes_no_response BOOLEAN,
    selected_option VARCHAR(200),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(assignment_id, question_id)
);
CREATE TRIGGER trg_updated_at_review_responses BEFORE UPDATE ON review_responses FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================
-- Review Summary
-- ============================================
CREATE TABLE IF NOT EXISTS review_summary (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    cycle_id UUID NOT NULL REFERENCES review_cycles(id) ON DELETE CASCADE,
    average_rating NUMERIC(5,2),
    self_rating NUMERIC(5,2),
    manager_rating NUMERIC(5,2),
    peer_avg_rating NUMERIC(5,2),
    total_responses INTEGER DEFAULT 0,
    completed_responses INTEGER DEFAULT 0,
    strengths_summary JSONB DEFAULT '[]'::jsonb,
    improvements_summary JSONB DEFAULT '[]'::jsonb,
    top_recommendation VARCHAR(30),
    notes TEXT,
    finalized_at TIMESTAMPTZ,
    finalized_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, cycle_id)
);
CREATE TRIGGER trg_updated_at_review_summary BEFORE UPDATE ON review_summary FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================
-- Leave Balances
-- ============================================
CREATE TABLE IF NOT EXISTS leave_balances (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    leave_type VARCHAR(50) NOT NULL CHECK (leave_type IN ('annual','sick','personal','maternity','paternity','bereavement','unpaid','comp_time','sabbatical','other')),
    year INTEGER NOT NULL,
    total_days NUMERIC(5,1) NOT NULL DEFAULT 0,
    used_days NUMERIC(5,1) NOT NULL DEFAULT 0,
    pending_days NUMERIC(5,1) NOT NULL DEFAULT 0,
    carried_over NUMERIC(5,1) DEFAULT 0,
    max_carry_over NUMERIC(5,1) DEFAULT 5,
    expires_at DATE,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, leave_type, year)
);
CREATE TRIGGER trg_updated_at_leave_balances BEFORE UPDATE ON leave_balances FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================
-- Time Off Policies
-- ============================================
CREATE TABLE IF NOT EXISTS time_off_policies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    leave_type VARCHAR(50) NOT NULL CHECK (leave_type IN ('annual','sick','personal','maternity','paternity','bereavement','unpaid','comp_time','sabbatical','other')),
    description TEXT,
    default_days NUMERIC(5,1) NOT NULL DEFAULT 0,
    max_carry_over NUMERIC(5,1) DEFAULT 5,
    carry_over_expires BOOLEAN DEFAULT false,
    requires_approval BOOLEAN DEFAULT true,
    min_advance_days INTEGER DEFAULT 1,
    max_consecutive_days INTEGER,
    accrual_rate NUMERIC(5,2) DEFAULT 0,
    accrual_period VARCHAR(20) DEFAULT 'yearly' CHECK (accrual_period IN ('yearly','monthly','quarterly','per_pay_period')),
    prorate_first_year BOOLEAN DEFAULT true,
    applies_to VARCHAR(50) DEFAULT 'all' CHECK (applies_to IN ('all','full_time','part_time','contract')),
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    is_active BOOLEAN DEFAULT true,
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_updated_at_time_off_policies BEFORE UPDATE ON time_off_policies FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================
-- Employee Announcements
-- ============================================
CREATE TABLE IF NOT EXISTS employee_announcements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(300) NOT NULL,
    content TEXT NOT NULL,
    announcement_type VARCHAR(50) DEFAULT 'general' CHECK (announcement_type IN ('general','policy_update','event','holiday','achievement','emergency','reminder')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low','normal','high','urgent')),
    target_audience VARCHAR(50) DEFAULT 'all' CHECK (target_audience IN ('all','department','specific','managers')),
    target_department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    target_employee_ids UUID[] DEFAULT '{}',
    starts_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    allow_comments BOOLEAN DEFAULT true,
    is_pinned BOOLEAN DEFAULT false,
    attachments JSONB DEFAULT '[]'::jsonb,
    published_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_updated_at_employee_announcements BEFORE UPDATE ON employee_announcements FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================
-- Employee Assets
-- ============================================
CREATE TABLE IF NOT EXISTS employee_assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    asset_type VARCHAR(50) NOT NULL CHECK (asset_type IN ('laptop','desktop','monitor','phone','tablet','printer','vehicle','card','key','software_license','other')),
    name VARCHAR(200) NOT NULL,
    description TEXT,
    serial_number VARCHAR(100),
    asset_tag VARCHAR(100),
    manufacturer VARCHAR(150),
    model VARCHAR(150),
    purchase_date DATE,
    purchase_cost NUMERIC(15,2),
    warranty_expiry DATE,
    assigned_date DATE NOT NULL DEFAULT CURRENT_DATE,
    return_date DATE,
    condition_when_assigned VARCHAR(20) DEFAULT 'new' CHECK (condition_when_assigned IN ('new','good','fair','poor')),
    condition_at_return VARCHAR(20) CHECK (condition_at_return IN ('new','good','fair','poor','damaged')),
    notes TEXT,
    status VARCHAR(20) DEFAULT 'assigned' CHECK (status IN ('assigned','returned','lost','damaged','transferred','disposed')),
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_updated_at_employee_assets BEFORE UPDATE ON employee_assets FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================
-- Benefit Plans
-- ============================================
CREATE TABLE IF NOT EXISTS benefit_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(200) NOT NULL,
    benefit_type VARCHAR(50) NOT NULL CHECK (benefit_type IN ('health_insurance','dental','vision','life_insurance','disability','retirement_401k','retirement_pension','hsa','fsa','stock_options','tuition_reimbursement','wellness','gym_membership','transportation','meal_allowance','other')),
    description TEXT,
    provider VARCHAR(200),
    plan_code VARCHAR(50) UNIQUE,
    employee_contribution NUMERIC(15,2) DEFAULT 0,
    employer_contribution NUMERIC(15,2) DEFAULT 0,
    total_cost NUMERIC(15,2) DEFAULT 0,
    contribution_frequency VARCHAR(20) DEFAULT 'monthly' CHECK (contribution_frequency IN ('weekly','bi_weekly','monthly','quarterly','annual')),
    is_active BOOLEAN DEFAULT true,
    effective_date DATE NOT NULL DEFAULT CURRENT_DATE,
    end_date DATE,
    eligibility_criteria JSONB DEFAULT '{}'::jsonb,
    enrollment_start DATE,
    enrollment_end DATE,
    details JSONB DEFAULT '{}'::jsonb,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);
CREATE TRIGGER trg_updated_at_benefit_plans BEFORE UPDATE ON benefit_plans FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================
-- Benefit Enrollments
-- ============================================
CREATE TABLE IF NOT EXISTS benefit_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL REFERENCES employees(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES benefit_plans(id) ON DELETE CASCADE,
    enrollment_status VARCHAR(20) DEFAULT 'active' CHECK (enrollment_status IN ('pending','active','waived','cancelled','terminated')),
    enrolled_date DATE NOT NULL DEFAULT CURRENT_DATE,
    effective_date DATE,
    termination_date DATE,
    termination_reason TEXT,
    dependents JSONB DEFAULT '[]'::jsonb,
    coverage_tier VARCHAR(30) DEFAULT 'employee_only' CHECK (coverage_tier IN ('employee_only','employee_spouse','employee_children','family')),
    employee_monthly_cost NUMERIC(15,2) DEFAULT 0,
    employer_monthly_cost NUMERIC(15,2) DEFAULT 0,
    notes TEXT,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(employee_id, plan_id)
);
CREATE TRIGGER trg_updated_at_benefit_enrollments BEFORE UPDATE ON benefit_enrollments FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ============================================
-- Indexes
-- ============================================
CREATE INDEX idx_onboarding_templates_department ON onboarding_templates(department_id);
CREATE INDEX idx_onboarding_templates_active ON onboarding_templates(is_active);
CREATE INDEX idx_onboarding_tasks_template ON onboarding_tasks(template_id);
CREATE INDEX idx_onboarding_instances_employee ON onboarding_instances(employee_id);
CREATE INDEX idx_onboarding_instances_template ON onboarding_instances(template_id);
CREATE INDEX idx_onboarding_instances_status ON onboarding_instances(status);
CREATE INDEX idx_onboarding_task_progress_instance ON onboarding_task_progress(instance_id);
CREATE INDEX idx_onboarding_task_progress_task ON onboarding_task_progress(task_id);
CREATE INDEX idx_onboarding_task_progress_status ON onboarding_task_progress(status);

CREATE INDEX idx_review_cycles_status ON review_cycles(status);
CREATE INDEX idx_review_cycles_type ON review_cycles(review_type);
CREATE INDEX idx_review_cycles_department ON review_cycles(department_id);
CREATE INDEX idx_review_cycles_dates ON review_cycles(start_date, end_date);
CREATE INDEX idx_review_assignments_cycle ON review_assignments(cycle_id);
CREATE INDEX idx_review_assignments_employee ON review_assignments(employee_id);
CREATE INDEX idx_review_assignments_reviewer ON review_assignments(reviewer_id);
CREATE INDEX idx_review_assignments_status ON review_assignments(status);
CREATE INDEX idx_review_ratings_assignment ON review_ratings(assignment_id);
CREATE INDEX idx_review_questions_cycle ON review_questions(cycle_id);
CREATE INDEX idx_review_responses_assignment ON review_responses(assignment_id);
CREATE INDEX idx_review_responses_question ON review_responses(question_id);
CREATE INDEX idx_review_summary_employee ON review_summary(employee_id);
CREATE INDEX idx_review_summary_cycle ON review_summary(cycle_id);

CREATE INDEX idx_leave_balances_employee ON leave_balances(employee_id);
CREATE INDEX idx_leave_balances_year ON leave_balances(year);
CREATE INDEX idx_leave_balances_type ON leave_balances(leave_type);
CREATE INDEX idx_leave_balances_employee_year ON leave_balances(employee_id, year);

CREATE INDEX idx_time_off_policies_type ON time_off_policies(leave_type);
CREATE INDEX idx_time_off_policies_active ON time_off_policies(is_active);
CREATE INDEX idx_time_off_policies_department ON time_off_policies(department_id);

CREATE INDEX idx_employee_announcements_type ON employee_announcements(announcement_type);
CREATE INDEX idx_employee_announcements_priority ON employee_announcements(priority);
CREATE INDEX idx_employee_announcements_published ON employee_announcements(is_published);
CREATE INDEX idx_employee_announcements_dates ON employee_announcements(starts_at, expires_at);
CREATE INDEX idx_employee_announcements_department ON employee_announcements(target_department_id);

CREATE INDEX idx_employee_assets_employee ON employee_assets(employee_id);
CREATE INDEX idx_employee_assets_type ON employee_assets(asset_type);
CREATE INDEX idx_employee_assets_status ON employee_assets(status);
CREATE INDEX idx_employee_assets_serial ON employee_assets(serial_number);

CREATE INDEX idx_benefit_plans_type ON benefit_plans(benefit_type);
CREATE INDEX idx_benefit_plans_active ON benefit_plans(is_active);
CREATE INDEX idx_benefit_enrollments_employee ON benefit_enrollments(employee_id);
CREATE INDEX idx_benefit_enrollments_plan ON benefit_enrollments(plan_id);
CREATE INDEX idx_benefit_enrollments_status ON benefit_enrollments(enrollment_status);

COMMIT;
