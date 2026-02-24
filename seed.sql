-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create Enums (matching drizzle-schema.ts)
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('ADMIN', 'HR', 'EMPLOYEE');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE leave_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create Tables
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    plan VARCHAR(50) DEFAULT 'FREE' NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    cognito_id VARCHAR(255) NOT NULL UNIQUE,
    company_id UUID REFERENCES companies(id) NOT NULL,
    email VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    department VARCHAR(100),
    role user_role DEFAULT 'EMPLOYEE' NOT NULL,
    created_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Seed Companies
INSERT INTO companies (id, name, plan) VALUES 
('11111111-1111-1111-1111-111111111111', 'Company_Alpha', 'ENTERPRISE'),
('22222222-2222-2222-2222-222222222222', 'Company_Beta', 'FREE')
ON CONFLICT (id) DO NOTHING;

-- Seed Employees for Company_Alpha
INSERT INTO employees (id, cognito_id, company_id, email, first_name, last_name, role) VALUES
('00000000-0000-0000-0000-000000000001', 'alpha-admin-sub', '11111111-1111-1111-1111-111111111111', 'admin@alpha.com', 'Alpha', 'Admin', 'ADMIN'),
('00000000-0000-0000-0000-000000000002', 'alpha-hr-sub', '11111111-1111-1111-1111-111111111111', 'hr@alpha.com', 'Alpha', 'HR', 'HR'),
('00000000-0000-0000-0000-000000000003', 'alpha-emp-sub', '11111111-1111-1111-1111-111111111111', 'emp@alpha.com', 'Alpha', 'Employee', 'EMPLOYEE')
ON CONFLICT (id) DO NOTHING;

-- Seed Employees for Company_Beta
INSERT INTO employees (id, cognito_id, company_id, email, first_name, last_name, role) VALUES
('00000000-0000-0000-0000-000000000011', 'beta-admin-sub', '22222222-2222-2222-2222-222222222222', 'admin@beta.com', 'Beta', 'Admin', 'ADMIN'),
('00000000-0000-0000-0000-000000000012', 'beta-emp-sub', '22222222-2222-2222-2222-222222222222', 'emp@beta.com', 'Beta', 'Employee', 'EMPLOYEE')
ON CONFLICT (id) DO NOTHING;
