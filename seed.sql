-- Create Companies
INSERT INTO companies (id, name, plan) VALUES 
('11111111-1111-1111-1111-111111111111', 'Company_Alpha', 'ENTERPRISE'),
('22222222-2222-2222-2222-222222222222', 'Company_Beta', 'FREE');

-- Create Users for Company_Alpha
INSERT INTO users (id, cognito_id, company_id, email, first_name, last_name, role) VALUES 
('00000000-0000-0000-0000-000000000001', 'alpha-admin-cognito-id', '11111111-1111-1111-1111-111111111111', 'admin@alpha.com', 'Alpha', 'Admin', 'ADMIN'),
('00000000-0000-0000-0000-000000000002', 'alpha-hr-cognito-id', '11111111-1111-1111-1111-111111111111', 'hr@alpha.com', 'Alpha', 'HR', 'HR'),
('00000000-0000-0000-0000-000000000003', 'alpha-emp-cognito-id', '11111111-1111-1111-1111-111111111111', 'emp@alpha.com', 'Alpha', 'Employee', 'EMPLOYEE');

-- Create Users for Company_Beta
INSERT INTO users (id, cognito_id, company_id, email, first_name, last_name, role) VALUES 
('00000000-0000-0000-0000-000000000004', 'beta-admin-cognito-id', '22222222-2222-2222-2222-222222222222', 'admin@beta.com', 'Beta', 'Admin', 'ADMIN'),
('00000000-0000-0000-0000-000000000005', 'beta-emp-cognito-id', '22222222-2222-2222-2222-222222222222', 'emp@beta.com', 'Beta', 'Employee', 'EMPLOYEE');
