BEGIN;

-- ============================================
-- Permissions
-- ============================================
INSERT INTO permissions (id, name, module, action, description) VALUES
    ('10000000-0000-0000-0000-000000000001', 'users.view',       'users', 'view',       'View users') ON CONFLICT (name) DO NOTHING;
INSERT INTO permissions (id, name, module, action, description) VALUES
    ('10000000-0000-0000-0000-000000000002', 'users.create',     'users', 'create',     'Create users') ON CONFLICT (name) DO NOTHING;
INSERT INTO permissions (id, name, module, action, description) VALUES
    ('10000000-0000-0000-0000-000000000003', 'users.edit',       'users', 'edit',       'Edit users') ON CONFLICT (name) DO NOTHING;
INSERT INTO permissions (id, name, module, action, description) VALUES
    ('10000000-0000-0000-0000-000000000004', 'users.delete',     'users', 'delete',     'Delete users') ON CONFLICT (name) DO NOTHING;
INSERT INTO permissions (id, name, module, action, description) VALUES
    ('10000000-0000-0000-0000-000000000005', 'users.deactivate', 'users', 'deactivate', 'Deactivate users') ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (id, name, module, action, description) VALUES
    ('20000000-0000-0000-0000-000000000001', 'hr.view',      'hr', 'view',      'View HR data') ON CONFLICT (name) DO NOTHING;
INSERT INTO permissions (id, name, module, action, description) VALUES
    ('20000000-0000-0000-0000-000000000002', 'hr.create',    'hr', 'create',    'Create HR records') ON CONFLICT (name) DO NOTHING;
INSERT INTO permissions (id, name, module, action, description) VALUES
    ('20000000-0000-0000-0000-000000000003', 'hr.edit',      'hr', 'edit',      'Edit HR records') ON CONFLICT (name) DO NOTHING;
INSERT INTO permissions (id, name, module, action, description) VALUES
    ('20000000-0000-0000-0000-000000000004', 'hr.delete',    'hr', 'delete',    'Delete HR records') ON CONFLICT (name) DO NOTHING;
INSERT INTO permissions (id, name, module, action, description) VALUES
    ('20000000-0000-0000-0000-000000000005', 'hr.approve',   'hr', 'approve',   'Approve leave requests') ON CONFLICT (name) DO NOTHING;
INSERT INTO permissions (id, name, module, action, description) VALUES
    ('20000000-0000-0000-0000-000000000006', 'hr.payroll',   'hr', 'payroll',   'Manage payroll') ON CONFLICT (name) DO NOTHING;
INSERT INTO permissions (id, name, module, action, description) VALUES
    ('20000000-0000-0000-0000-000000000007', 'hr.attendance', 'hr', 'attendance', 'Manage attendance') ON CONFLICT (name) DO NOTHING;
INSERT INTO permissions (id, name, module, action, description) VALUES
    ('20000000-0000-0000-0000-000000000008', 'hr.reports',   'hr', 'reports',   'View HR reports') ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (id, name, module, action, description) VALUES
    ('30000000-0000-0000-0000-000000000001', 'settings.view', 'settings', 'view', 'View settings') ON CONFLICT (name) DO NOTHING;
INSERT INTO permissions (id, name, module, action, description) VALUES
    ('30000000-0000-0000-0000-000000000002', 'settings.edit', 'settings', 'edit', 'Edit settings') ON CONFLICT (name) DO NOTHING;

INSERT INTO permissions (id, name, module, action, description) VALUES
    ('40000000-0000-0000-0000-000000000001', 'self_service.view', 'self_service', 'view', 'Access self-service portal') ON CONFLICT (name) DO NOTHING;
INSERT INTO permissions (id, name, module, action, description) VALUES
    ('40000000-0000-0000-0000-000000000002', 'self_service.leave', 'self_service', 'leave', 'Apply for leave') ON CONFLICT (name) DO NOTHING;
INSERT INTO permissions (id, name, module, action, description) VALUES
    ('40000000-0000-0000-0000-000000000003', 'self_service.attendance', 'self_service', 'attendance', 'Clock in/out') ON CONFLICT (name) DO NOTHING;
INSERT INTO permissions (id, name, module, action, description) VALUES
    ('40000000-0000-0000-0000-000000000004', 'self_service.loan', 'self_service', 'loan', 'Apply for loans') ON CONFLICT (name) DO NOTHING;

-- ============================================
-- Roles
-- ============================================
INSERT INTO roles (id, name, slug, description, is_system) VALUES
    ('a0000000-0000-0000-0000-000000000001', 'Super Admin',    'super_admin', 'Full system access with all permissions', true) ON CONFLICT (slug) DO NOTHING;
INSERT INTO roles (id, name, slug, description, is_system) VALUES
    ('a0000000-0000-0000-0000-000000000005', 'Admin',          'admin',       'Full system access (same as Super Admin)', true) ON CONFLICT (slug) DO NOTHING;
INSERT INTO roles (id, name, slug, description, is_system) VALUES
    ('a0000000-0000-0000-0000-000000000002', 'HR Director',    'hr_director', 'HR management with full HR permissions', false) ON CONFLICT (slug) DO NOTHING;
INSERT INTO roles (id, name, slug, description, is_system) VALUES
    ('a0000000-0000-0000-0000-000000000003', 'Manager',        'manager',     'Department manager with team oversight', false) ON CONFLICT (slug) DO NOTHING;
INSERT INTO roles (id, name, slug, description, is_system) VALUES
    ('a0000000-0000-0000-0000-000000000004', 'Employee',       'employee',    'Standard employee with self-service access', false) ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- Super Admin - All permissions
-- ============================================
INSERT INTO role_permissions (role_id, permission_id) SELECT 'a0000000-0000-0000-0000-000000000001', id FROM permissions ON CONFLICT DO NOTHING;

-- ============================================
-- Admin - All permissions (same as Super Admin)
-- ============================================
INSERT INTO role_permissions (role_id, permission_id) SELECT 'a0000000-0000-0000-0000-000000000005', id FROM permissions ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT 'a0000000-0000-0000-0000-000000000004', id FROM permissions WHERE module = 'self_service'
ON CONFLICT DO NOTHING;

-- ============================================
-- HR Director - all HR + users.view/create/edit + settings + self_service
-- ============================================
INSERT INTO role_permissions (role_id, permission_id) VALUES
    ('a0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001') ON CONFLICT DO NOTHING;
INSERT INTO role_permissions (role_id, permission_id) VALUES
    ('a0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002') ON CONFLICT DO NOTHING;
INSERT INTO role_permissions (role_id, permission_id) VALUES
    ('a0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000003') ON CONFLICT DO NOTHING;
INSERT INTO role_permissions (role_id, permission_id) VALUES
    ('a0000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000005') ON CONFLICT DO NOTHING;
INSERT INTO role_permissions (role_id, permission_id) SELECT 'a0000000-0000-0000-0000-000000000002', id FROM permissions WHERE module = 'hr' ON CONFLICT DO NOTHING;
INSERT INTO role_permissions (role_id, permission_id) SELECT 'a0000000-0000-0000-0000-000000000002', id FROM permissions WHERE module = 'settings' ON CONFLICT DO NOTHING;
INSERT INTO role_permissions (role_id, permission_id) SELECT 'a0000000-0000-0000-0000-000000000002', id FROM permissions WHERE module = 'self_service' ON CONFLICT DO NOTHING;

-- ============================================
-- Manager - HR view, approve, attendance + users.view + settings.view + self_service
-- ============================================
INSERT INTO role_permissions (role_id, permission_id) VALUES
    ('a0000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001') ON CONFLICT DO NOTHING;
INSERT INTO role_permissions (role_id, permission_id) VALUES
    ('a0000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001') ON CONFLICT DO NOTHING;
INSERT INTO role_permissions (role_id, permission_id) VALUES
    ('a0000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000005') ON CONFLICT DO NOTHING;
INSERT INTO role_permissions (role_id, permission_id) VALUES
    ('a0000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000007') ON CONFLICT DO NOTHING;
INSERT INTO role_permissions (role_id, permission_id) VALUES
    ('a0000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000008') ON CONFLICT DO NOTHING;
INSERT INTO role_permissions (role_id, permission_id) VALUES
    ('a0000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001') ON CONFLICT DO NOTHING;
INSERT INTO role_permissions (role_id, permission_id) SELECT 'a0000000-0000-0000-0000-000000000003', id FROM permissions WHERE module = 'self_service' ON CONFLICT DO NOTHING;

-- ============================================
-- Employee - users.view + self_service
-- ============================================
INSERT INTO role_permissions (role_id, permission_id) VALUES
    ('a0000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001') ON CONFLICT DO NOTHING;
INSERT INTO role_permissions (role_id, permission_id) SELECT 'a0000000-0000-0000-0000-000000000004', id FROM permissions WHERE module = 'self_service' ON CONFLICT DO NOTHING;

-- ============================================
-- Users
-- ============================================
INSERT INTO users (id, email, password_hash, first_name, last_name, phone, is_active, is_verified) VALUES
    ('b0000000-0000-0000-0000-000000000001', 'admin@nexus-hrm.com',
     '$2a$10$4LuI30K88sg.55WaCOKwWuwS5pgAYbuXZzsOtzsw4qZYxS0TD3VsK',
     'Admin', 'User', '+1 (555) 000-0001', true, true) ON CONFLICT (email) DO NOTHING;

INSERT INTO users (id, email, password_hash, first_name, last_name, phone, is_active, is_verified) VALUES
    ('b0000000-0000-0000-0000-000000000002', 'sarah.ahmed@nexus-hrm.com',
     '$2a$10$4LuI30K88sg.55WaCOKwWuwS5pgAYbuXZzsOtzsw4qZYxS0TD3VsK',
     'Sarah', 'Ahmed', '+1 (555) 000-0002', true, true) ON CONFLICT (email) DO NOTHING;

INSERT INTO users (id, email, password_hash, first_name, last_name, phone, is_active, is_verified) VALUES
    ('b0000000-0000-0000-0000-000000000003', 'employee@nexus-hrm.com',
     '$2a$10$4LuI30K88sg.55WaCOKwWuwS5pgAYbuXZzsOtzsw4qZYxS0TD3VsK',
     'John', 'Doe', '+1 (555) 000-0003', true, true) ON CONFLICT (email) DO NOTHING;

INSERT INTO users (id, email, password_hash, first_name, last_name, phone, is_active, is_verified) VALUES
    ('b0000000-0000-0000-0000-000000000004', 'manager@nexus-hrm.com',
     '$2a$10$4LuI30K88sg.55WaCOKwWuwS5pgAYbuXZzsOtzsw4qZYxS0TD3VsK',
     'Sarah', 'Manager', '+1 (555) 000-0004', true, true) ON CONFLICT (email) DO NOTHING;

INSERT INTO user_roles (user_id, role_id) VALUES
    ('b0000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001') ON CONFLICT DO NOTHING;
INSERT INTO user_roles (user_id, role_id) VALUES
    ('b0000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000002') ON CONFLICT DO NOTHING;
INSERT INTO user_roles (user_id, role_id) VALUES
    ('b0000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000004') ON CONFLICT DO NOTHING;
INSERT INTO user_roles (user_id, role_id) VALUES
    ('b0000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000003') ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT 'a0000000-0000-0000-0000-000000000002', id FROM permissions WHERE module = 'self_service'
ON CONFLICT DO NOTHING;

INSERT INTO role_permissions (role_id, permission_id)
SELECT 'a0000000-0000-0000-0000-000000000003', id FROM permissions WHERE module = 'self_service'
ON CONFLICT DO NOTHING;

-- ============================================
-- Departments
-- ============================================
INSERT INTO departments (id, name, code, description, manager_id, budget) VALUES
    ('c0000000-0000-0000-0000-000000000001', 'Engineering', 'ENG', 'Software engineering and development team', 'b0000000-0000-0000-0000-000000000001', 500000.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO departments (id, name, code, description, budget) VALUES
    ('c0000000-0000-0000-0000-000000000002', 'Sales', 'SAL', 'Sales and business development team', 300000.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO departments (id, name, code, description, budget) VALUES
    ('c0000000-0000-0000-0000-000000000003', 'Marketing', 'MKT', 'Marketing, branding, and communications team', 250000.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO departments (id, name, code, description, budget) VALUES
    ('c0000000-0000-0000-0000-000000000004', 'Operations', 'OPS', 'Operations and logistics management team', 350000.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO departments (id, name, code, description, budget) VALUES
    ('c0000000-0000-0000-0000-000000000005', 'Finance', 'FIN', 'Financial planning, accounting, and reporting team', 200000.00) ON CONFLICT (code) DO NOTHING;
INSERT INTO departments (id, name, code, description, manager_id, budget) VALUES
    ('c0000000-0000-0000-0000-000000000006', 'Human Resources', 'HR', 'Human resources and people operations team', 'b0000000-0000-0000-0000-000000000002', 150000.00) ON CONFLICT (code) DO NOTHING;

-- ============================================
-- Employees
-- ============================================
INSERT INTO employees (id, employee_code, first_name, last_name, email, phone, date_of_birth, gender, department_id, position, job_title, employment_type, employment_status, hire_date, base_salary, reports_to, user_id) VALUES
    ('d0000000-0000-0000-0000-000000000001', 'EMP-001', 'Sarah',    'Ahmed',      'sarah.ahmed@nexus-hrm.com',    '+1 (555) 100-0001', '1985-03-15', 'female', 'c0000000-0000-0000-0000-000000000006', 'HR Director',    'HR Director',           'full_time', 'active',     '2020-01-10', 120000.00, NULL,  'b0000000-0000-0000-0000-000000000002') ON CONFLICT (employee_code) DO NOTHING;
INSERT INTO employees (id, employee_code, first_name, last_name, email, phone, date_of_birth, gender, department_id, position, job_title, employment_type, employment_status, hire_date, base_salary, reports_to) VALUES
    ('d0000000-0000-0000-0000-000000000002', 'EMP-002', 'James',    'Wilson',     'james.wilson@nexus-hrm.com',   '+1 (555) 100-0002', '1988-07-22', 'male',   'c0000000-0000-0000-0000-000000000001', 'Engineering Manager', 'Engineering Manager', 'full_time', 'active', '2020-03-15', 135000.00, 'd0000000-0000-0000-0000-000000000001') ON CONFLICT (employee_code) DO NOTHING;
INSERT INTO employees (id, employee_code, first_name, last_name, email, phone, date_of_birth, gender, department_id, position, job_title, employment_type, employment_status, hire_date, base_salary, reports_to) VALUES
    ('d0000000-0000-0000-0000-000000000003', 'EMP-003', 'Emily',    'Chen',       'emily.chen@nexus-hrm.com',     '+1 (555) 100-0003', '1992-11-08', 'female', 'c0000000-0000-0000-0000-000000000001', 'Senior Developer',    'Senior Software Engineer', 'full_time', 'active', '2020-06-01', 110000.00, 'd0000000-0000-0000-0000-000000000002') ON CONFLICT (employee_code) DO NOTHING;
INSERT INTO employees (id, employee_code, first_name, last_name, email, phone, date_of_birth, gender, department_id, position, job_title, employment_type, employment_status, hire_date, base_salary, reports_to) VALUES
    ('d0000000-0000-0000-0000-000000000004', 'EMP-004', 'Michael',  'Brown',      'michael.brown@nexus-hrm.com',  '+1 (555) 100-0004', '1990-01-30', 'male',   'c0000000-0000-0000-0000-000000000001', 'Developer',           'Software Engineer',      'full_time', 'active', '2021-01-15', 95000.00,  'd0000000-0000-0000-0000-000000000002') ON CONFLICT (employee_code) DO NOTHING;
INSERT INTO employees (id, employee_code, first_name, last_name, email, phone, date_of_birth, gender, department_id, position, job_title, employment_type, employment_status, hire_date, base_salary, reports_to) VALUES
    ('d0000000-0000-0000-0000-000000000005', 'EMP-005', 'Olivia',   'Martinez',   'olivia.martinez@nexus-hrm.com', '+1 (555) 100-0005', '1993-05-12', 'female', 'c0000000-0000-0000-0000-000000000002', 'Sales Manager',       'Sales Manager',          'full_time', 'active', '2020-02-20', 105000.00, 'd0000000-0000-0000-0000-000000000001') ON CONFLICT (employee_code) DO NOTHING;
INSERT INTO employees (id, employee_code, first_name, last_name, email, phone, date_of_birth, gender, department_id, position, job_title, employment_type, employment_status, hire_date, base_salary, reports_to) VALUES
    ('d0000000-0000-0000-0000-000000000006', 'EMP-006', 'David',    'Taylor',     'david.taylor@nexus-hrm.com',   '+1 (555) 100-0006', '1987-09-03', 'male',   'c0000000-0000-0000-0000-000000000002', 'Sales Executive',     'Sales Executive',        'full_time', 'active', '2021-04-10', 75000.00,  'd0000000-0000-0000-0000-000000000005') ON CONFLICT (employee_code) DO NOTHING;
INSERT INTO employees (id, employee_code, first_name, last_name, email, phone, date_of_birth, gender, department_id, position, job_title, employment_type, employment_status, hire_date, base_salary, reports_to) VALUES
    ('d0000000-0000-0000-0000-000000000007', 'EMP-007', 'Sophia',   'Garcia',     'sophia.garcia@nexus-hrm.com',  '+1 (555) 100-0007', '1991-12-25', 'female', 'c0000000-0000-0000-0000-000000000003', 'Marketing Lead',      'Marketing Manager',      'full_time', 'active', '2020-08-01', 98000.00,  'd0000000-0000-0000-0000-000000000001') ON CONFLICT (employee_code) DO NOTHING;
INSERT INTO employees (id, employee_code, first_name, last_name, email, phone, date_of_birth, gender, department_id, position, job_title, employment_type, employment_status, hire_date, base_salary, reports_to) VALUES
    ('d0000000-0000-0000-0000-000000000008', 'EMP-008', 'Robert',   'Anderson',   'robert.anderson@nexus-hrm.com', '+1 (555) 100-0008', '1986-04-18', 'male',   'c0000000-0000-0000-0000-000000000004', 'Operations Manager',  'Operations Manager',     'full_time', 'active', '2019-11-05', 100000.00, 'd0000000-0000-0000-0000-000000000001') ON CONFLICT (employee_code) DO NOTHING;
INSERT INTO employees (id, employee_code, first_name, last_name, email, phone, date_of_birth, gender, department_id, position, job_title, employment_type, employment_status, hire_date, base_salary, reports_to) VALUES
    ('d0000000-0000-0000-0000-000000000009', 'EMP-009', 'Jessica',  'Lee',        'jessica.lee@nexus-hrm.com',     '+1 (555) 100-0009', '1994-06-30', 'female', 'c0000000-0000-0000-0000-000000000005', 'Senior Accountant',   'Senior Accountant',      'full_time', 'active', '2021-02-01', 85000.00,  'd0000000-0000-0000-0000-000000000001') ON CONFLICT (employee_code) DO NOTHING;
INSERT INTO employees (id, employee_code, first_name, last_name, email, phone, date_of_birth, gender, department_id, position, job_title, employment_type, employment_status, hire_date, base_salary, reports_to) VALUES
    ('d0000000-0000-0000-0000-000000000010', 'EMP-010', 'Daniel',   'Thomas',     'daniel.thomas@nexus-hrm.com',   '+1 (555) 100-0010', '1995-02-14', 'male',   'c0000000-0000-0000-0000-000000000001', 'Junior Developer',    'Junior Software Engineer', 'full_time', 'probation', '2024-09-01', 70000.00, 'd0000000-0000-0000-0000-000000000003') ON CONFLICT (employee_code) DO NOTHING;
INSERT INTO employees (id, employee_code, first_name, last_name, email, phone, date_of_birth, gender, department_id, position, job_title, employment_type, employment_status, hire_date, base_salary, reports_to, user_id) VALUES
    ('d0000000-0000-0000-0000-000000000011', 'EMP-011', 'John',     'Doe',        'employee@nexus-hrm.com',       '+1 (555) 100-0011', '1993-08-20', 'male',   'c0000000-0000-0000-0000-000000000001', 'Developer',           'Software Engineer',      'full_time', 'active', '2022-03-15', 90000.00,  'd0000000-0000-0000-0000-000000000002', 'b0000000-0000-0000-0000-000000000003') ON CONFLICT (employee_code) DO NOTHING;

COMMIT;
