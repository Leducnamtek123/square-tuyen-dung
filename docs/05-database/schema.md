# Luoc Do Co So Du Lieu (Database Schema)

> **Phan he**: 05-database  
> **Tai lieu**: schema.md  
> **He quan tri**: MySQL 8.0 (InnoDB Engine, Charset: utf8mb4, Collation: utf8mb4_unicode_ci)  
> **ORM**: Django ORM (voi mo hinh quan he doi tuong dong nhat)

---

## 1. Cac Bang Quan Tri Nguoi Dung & Doanh Nghiep (Identity & Company)

### 1.1. Bang `users` (`apps.accounts.User`)
- `id`: BIGINT AUTO_INCREMENT PRIMARY KEY
- `email`: VARCHAR(255) UNIQUE NOT NULL
- `password`: VARCHAR(255) NOT NULL
- `role`: VARCHAR(20) NOT NULL (`CANDIDATE`, `EMPLOYER`, `ADMIN`)
- `is_active`: BOOLEAN DEFAULT TRUE
- `is_staff`: BOOLEAN DEFAULT FALSE
- `date_joined`: DATETIME NOT NULL

### 1.2. Bang `companies` (`apps.profiles.Company`)
- `id`: BIGINT AUTO_INCREMENT PRIMARY KEY
- `name`: VARCHAR(255) NOT NULL
- `tax_id`: VARCHAR(50) UNIQUE NOT NULL
- `logo`: VARCHAR(500) NULL
- `banner`: VARCHAR(500) NULL
- `address`: VARCHAR(255) NULL
- `city_id`: INT FOREIGN KEY -> `locations_provinces.id`
- `verification_status`: VARCHAR(20) DEFAULT `PENDING` (`PENDING`, `VERIFIED`, `REJECTED`)
- `business_license_file`: VARCHAR(500) NULL

---

## 2. Cac Bang Tuyen Dung & Ho So (Jobs & Applications)

### 2.1. Bang `job_posts` (`apps.jobs.JobPost`)
- `id`: BIGINT AUTO_INCREMENT PRIMARY KEY
- `company_id`: BIGINT FOREIGN KEY -> `companies.id` ON DELETE CASCADE
- `title`: VARCHAR(255) NOT NULL
- `slug`: VARCHAR(255) UNIQUE NOT NULL
- `job_type`: VARCHAR(20) NOT NULL
- `salary_min`: DECIMAL(12, 2) NOT NULL DEFAULT 0
- `salary_max`: DECIMAL(12, 2) NOT NULL DEFAULT 0
- `currency`: VARCHAR(10) DEFAULT 'VND'
- `description`: LONGTEXT NOT NULL
- `requirements`: LONGTEXT NOT NULL
- `benefits`: LONGTEXT NOT NULL
- `status`: VARCHAR(20) DEFAULT `ACTIVE` (`DRAFT`, `PENDING`, `ACTIVE`, `CLOSED`, `EXPIRED`)
- `interview_script_id`: BIGINT NULL FOREIGN KEY -> `interview_scripts.id`
- `created_at`: DATETIME NOT NULL
- `updated_at`: DATETIME NOT NULL

### 2.2. Bang `applications` (`apps.jobs.Application`)
- `id`: BIGINT AUTO_INCREMENT PRIMARY KEY
- `job_post_id`: BIGINT FOREIGN KEY -> `job_posts.id` ON DELETE CASCADE
- `candidate_id`: BIGINT FOREIGN KEY -> `candidate_profiles.id` ON DELETE CASCADE
- `resume_url`: VARCHAR(500) NOT NULL
- `cover_letter`: TEXT NULL
- `status`: VARCHAR(30) DEFAULT `APPLIED` (`APPLIED`, `SCREENING`, `AI_INTERVIEW_INVITED`, `AI_INTERVIEW_COMPLETED`, `OFFERED`, `REJECTED`, `HIRED`)
- `applied_at`: DATETIME NOT NULL

---

## 3. Cac Bang Phong Van Voice AI (Voice AI & Scorecards)

### 3.1. Bang `interview_sessions` (`apps.interviews.InterviewSession`)
- `id`: BIGINT AUTO_INCREMENT PRIMARY KEY
- `application_id`: BIGINT UNIQUE FOREIGN KEY -> `applications.id` ON DELETE CASCADE
- `livekit_room_name`: VARCHAR(100) UNIQUE NOT NULL
- `status`: VARCHAR(30) DEFAULT `SCHEDULED`
- `total_score`: INT NULL
- `recording_url`: VARCHAR(500) NULL
- `transcript`: JSON NULL
- `started_at`: DATETIME NULL
- `ended_at`: DATETIME NULL

### 3.2. Bang `interview_scorecards` (`apps.interviews.InterviewScorecard`)
- `id`: BIGINT AUTO_INCREMENT PRIMARY KEY
- `session_id`: BIGINT UNIQUE FOREIGN KEY -> `interview_sessions.id` ON DELETE CASCADE
- `technical_score`: DECIMAL(5,2) NOT NULL
- `communication_score`: DECIMAL(5,2) NOT NULL
- `aptitude_score`: DECIMAL(5,2) NOT NULL
- `language_score`: DECIMAL(5,2) NOT NULL
- `dimensions_breakdown`: JSON NOT NULL
- `summary_notes`: TEXT NULL
- `pdf_report_url`: VARCHAR(500) NULL
- `created_at`: DATETIME NOT NULL

---

## 4. Cac Bang Native HRM (HRM Core & Payroll)

### 4.1. Bang `hrm_employees` (`apps.hrm.Employee`)
- `id`: BIGINT AUTO_INCREMENT PRIMARY KEY
- `company_id`: BIGINT FOREIGN KEY -> `companies.id`
- `user_id`: BIGINT UNIQUE NULL FOREIGN KEY -> `users.id`
- `employee_code`: VARCHAR(50) UNIQUE NOT NULL
- `first_name`: VARCHAR(100) NOT NULL
- `last_name`: VARCHAR(100) NOT NULL
- `full_name`: VARCHAR(200) NOT NULL
- `job_title`: VARCHAR(100) NOT NULL
- `department_id`: BIGINT NULL FOREIGN KEY -> `hrm_departments.id`
- `hire_date`: DATE NOT NULL
- `dependents_count`: INT DEFAULT 0
- `status`: VARCHAR(20) DEFAULT `ACTIVE` (`PROBATION`, `ACTIVE`, `RESIGNED`)

### 4.2. Bang `hrm_shifts` (`apps.hrm.Shift`)
- `id`: BIGINT AUTO_INCREMENT PRIMARY KEY
- `company_id`: BIGINT FOREIGN KEY -> `companies.id`
- `name`: VARCHAR(100) NOT NULL
- `start_time`: TIME NOT NULL
- `end_time`: TIME NOT NULL
- `is_overnight`: BOOLEAN DEFAULT FALSE

### 4.3. Bang `hrm_attendance_records` (`apps.hrm.AttendanceRecord`)
- `id`: BIGINT AUTO_INCREMENT PRIMARY KEY
- `employee_id`: BIGINT FOREIGN KEY -> `hrm_employees.id`
- `shift_id`: BIGINT NULL FOREIGN KEY -> `hrm_shifts.id`
- `date`: DATE NOT NULL
- `check_in_time`: DATETIME NULL
- `check_out_time`: DATETIME NULL
- `actual_hours`: DECIMAL(5, 2) DEFAULT 0
- `status`: VARCHAR(20) NOT NULL

### 4.4. Bang `hrm_payroll_ledgers` (`apps.hrm.PayrollLedger`)
- `id`: BIGINT AUTO_INCREMENT PRIMARY KEY
- `employee_id`: BIGINT FOREIGN KEY -> `hrm_employees.id`
- `month`: INT NOT NULL
- `year`: INT NOT NULL
- `base_salary`: DECIMAL(12, 2) NOT NULL
- `actual_days`: DECIMAL(5, 2) NOT NULL
- `unpaid_leave_days`: DECIMAL(5, 2) DEFAULT 0
- `gross_income`: DECIMAL(12, 2) NOT NULL
- `insurance_deduction`: DECIMAL(12, 2) NOT NULL
- `personal_relief`: DECIMAL(12, 2) NOT NULL DEFAULT 11000000
- `dependent_relief`: DECIMAL(12, 2) NOT NULL DEFAULT 0
- `taxable_income`: DECIMAL(12, 2) NOT NULL
- `pit_tax`: DECIMAL(12, 2) NOT NULL
- `net_salary`: DECIMAL(12, 2) NOT NULL
- `status`: VARCHAR(20) DEFAULT `DRAFT` (`DRAFT`, `CALCULATED`, `APPROVED`, `PAID`)
- `created_at`: DATETIME NOT NULL
- UNIQUE KEY `unique_emp_month_year` (`employee_id`, `month`, `year`)
