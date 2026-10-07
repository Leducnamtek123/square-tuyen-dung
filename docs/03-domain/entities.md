# Mo Hinh Thuc The Nghiep Vu (Domain Entities)

> **Phan he**: 03-domain  
> **Tai lieu**: entities.md  
> **Phuong phap**: Domain-Driven Design (DDD) Bounded Contexts

---

## 1. Cac Bounded Contexts Trong He Thong

Kien truc he thong InfoHR duoc chia thanh 5 Bounded Contexts ro rang:

```text
┌────────────────────────────────────────────────────────┐
│ 1. Identity & Profile Context                          │
│    - User, CandidateProfile, Company, RecruiterProfile │
├────────────────────────────────────────────────────────┤
│ 2. Recruitment & ATS Context                           │
│    - JobPost, Application, CandidateCV                 │
├────────────────────────────────────────────────────────┤
│ 3. Voice AI Interview Context                          │
│    - InterviewSession, InterviewScript, Scorecard      │
├────────────────────────────────────────────────────────┤
│ 4. Native HRM Context                                  │
│    - Employee, Department, Contract, Shift, Timesheet, │
│      AttendanceRecord, LeaveBalance, PayrollLedger     │
├────────────────────────────────────────────────────────┤
│ 5. Content & Notification Context                      │
│    - Article, Category, SystemSetting, AuditLog        │
└────────────────────────────────────────────────────────┘
```

---

## 2. Chi Tiet Cac Thuc The Cot Loi

### 2.1. Bounded Context 1: Identity & Profile
- **`User`**:
  - Dinh danh tai khoan nguoi dung toan he thong.
  - Thuoc tinh: `id` (UUID/Int), `email`, `password_hash`, `role` (`CANDIDATE`, `EMPLOYER`, `ADMIN`), `is_active`, `is_verified`, `created_at`.
- **`CandidateProfile`**:
  - Ho so chi tiet cua ung vien.
  - Thuoc tinh: `user_id`, `full_name`, `phone`, `date_of_birth`, `gender`, `address`, `city_code`, `current_title`, `experience_years`, `expected_salary_min`, `expected_salary_max`.
- **`Company`**:
  - Phap nhan doanh nghiep nha tuyen dung.
  - Thuoc tinh: `id`, `name`, `tax_id` (Ma so thue), `logo_url`, `banner_url`, `website`, `address`, `city_code`, `verification_status` (`PENDING`, `VERIFIED`, `REJECTED`), `created_by`.

### 2.2. Bounded Context 2: Recruitment & ATS
- **`JobPost`**:
  - Tin dang tuyen dung do doanh nghiep phat hanh.
  - Thuoc tinh: `id`, `company_id`, `title`, `slug`, `job_type` (`FULL_TIME`, `PART_TIME`, `INTERNSHIP`, `REMOTE`), `salary_min`, `salary_max`, `currency` (`VND`), `description`, `requirements`, `benefits`, `status` (`DRAFT`, `PENDING`, `ACTIVE`, `CLOSED`, `EXPIRED`), `interview_script_id`.
- **`Application`**:
  - Don ung tuyen lien ket giua ung vien va tin dang.
  - Thuoc tinh: `id`, `job_post_id`, `candidate_id`, `resume_url`, `cover_letter`, `status` (`APPLIED`, `SCREENING`, `AI_INTERVIEW_INVITED`, `AI_INTERVIEW_COMPLETED`, `OFFERED`, `REJECTED`, `HIRED`), `applied_at`.

### 2.3. Bounded Context 3: Voice AI Interview
- **`InterviewScript`**:
  - Kich ban phong van mau hoac tuy bien cho tung tin tuyen dung.
  - Thuoc tinh: `id`, `company_id`, `title`, `description`, `total_duration_minutes`, `passing_score`.
- **`InterviewQuestion`**:
  - Tung cau hoi trong kich ban phong van.
  - Thuoc tinh: `id`, `script_id`, `order`, `question_text`, `expected_keywords`, `weight`, `time_limit_seconds`.
- **`InterviewSession`**:
  - Mot phien phong van thoi gian thuc tren LiveKit.
  - Thuoc tinh: `id`, `application_id`, `livekit_room_name`, `status` (`SCHEDULED`, `CANDIDATE_READY`, `CONNECTED_IN_ROOM`, `INTERVIEWING`, `ROOM_COMPLETED`, `SCORING_IN_PROGRESS`, `REPORT_GENERATED`, `FAILED`), `recording_url`, `total_score`, `started_at`, `ended_at`.
- **`InterviewScorecard`**:
  - Bang danh gia chi tiet sau phong van.
  - Thuoc tinh: `id`, `session_id`, `technical_score`, `communication_score`, `aptitude_score`, `language_score`, `summary_text`, `pdf_report_url`, `created_at`.

### 2.4. Bounded Context 4: Native HRM
- **`Employee`**:
  - Ho so nhan su chinh thuc trong doanh nghiep.
  - Thuoc tinh: `id`, `company_id`, `user_id`, `employee_code` (Ma nhan vien duy nhat), `first_name`, `last_name`, `full_name`, `department_id`, `job_title`, `hire_date`, `dependents_count` (So nguoi phu thuoc tinh thue TNCN), `status` (`PROBATION`, `ACTIVE`, `RESIGNED`).
- **`Shift`**:
  - Ca lam viec trong cong ty.
  - Thuoc tinh: `id`, `name`, `start_time`, `end_time`, `is_overnight` (Danh dau ca dem vat qua 00:00).
- **`AttendanceRecord`**:
  - Ban ghi cham cong hang ngay.
  - Thuoc tinh: `id`, `employee_id`, `date`, `shift_id`, `check_in_time`, `check_out_time`, `status` (`ON_TIME`, `LATE`, `EARLY_LEAVE`, `ABSENT`, `MISSED_IN`, `MISSED_OUT`), `actual_hours`.
- **`AttendanceRequest` / `LeaveRequest`**:
  - Don xin nghi phep hoac giai trinh cham cong.
  - Thuoc tinh: `id`, `employee_id`, `leave_type` (`ANNUAL`, `SICK`, `UNPAID`, `MATERNITY`), `start_date`, `end_date`, `total_days`, `status` (`PENDING`, `APPROVED`, `REJECTED`).
- **`EmployeeLeaveBalance`**:
  - Quy phep nam cua tung nhan vien.
  - Thuoc tinh: `employee_id`, `year`, `total_allocated_days`, `used_days`, `remaining_days`.
- **`PayrollLedger`**:
  - Bang luong thang tong hop cua nhan vien.
  - Thuoc tinh: `id`, `employee_id`, `month`, `year`, `base_salary`, `actual_days`, `unpaid_leave_days`, `gross_income`, `insurance_deduction` (BHXH 8%, BHYT 1.5%, BHTN 1%), `personal_relief` (11tr), `dependent_relief` (4.4tr * dependents), `taxable_income`, `pit_tax` (Thue TNCN luy tien), `net_salary`, `status` (`DRAFT`, `APPROVED`, `PAID`).
