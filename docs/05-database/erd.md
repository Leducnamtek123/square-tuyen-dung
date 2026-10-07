# So Do Thuc The Quan He (Entity-Relationship Diagram - ERD)

> **Phan he**: 05-database  
> **Tai lieu**: erd.md  
> **Dinh dang**: Mermaid `erDiagram`

---

## 1. So Do ERD Tong The He Thong

```mermaid
erDiagram
    User ||--o| Company : "owns/manages"
    User ||--o| CandidateProfile : "has"
    User ||--o| Employee : "linked to"

    Company ||--o{ JobPost : "publishes"
    Company ||--o{ InterviewScript : "owns"
    Company ||--o{ Department : "has"
    Company ||--o{ Employee : "employs"

    JobPost ||--o{ Application : "receives"
    CandidateProfile ||--o{ Application : "submits"

    InterviewScript ||--o{ InterviewQuestion : "contains"
    JobPost }o--|| InterviewScript : "assigned to"

    Application ||--o| InterviewSession : "conducts"
    InterviewSession ||--o| InterviewScorecard : "produces"

    Department ||--o{ Employee : "contains"
    Employee ||--o{ AttendanceRecord : "records"
    Employee ||--o{ LeaveRequest : "requests"
    Employee ||--o{ EmployeeLeaveBalance : "has"
    Employee ||--o{ PayrollLedger : "receives"

    Shift ||--o{ AttendanceRecord : "schedules"

    User {
        bigint id PK
        string email
        string password_hash
        string role
        boolean is_active
        datetime date_joined
    }

    Company {
        bigint id PK
        string name
        string tax_id UK
        string verification_status
        string logo_url
    }

    JobPost {
        bigint id PK
        bigint company_id FK
        string title
        string slug UK
        string status
        decimal salary_min
        decimal salary_max
    }

    Application {
        bigint id PK
        bigint job_post_id FK
        bigint candidate_id FK
        string resume_url
        string status
        datetime applied_at
    }

    InterviewSession {
        bigint id PK
        bigint application_id FK
        string livekit_room_name UK
        string status
        int total_score
        string recording_url
    }

    InterviewScorecard {
        bigint id PK
        bigint session_id FK
        decimal technical_score
        decimal communication_score
        decimal total_score
        string pdf_report_url
    }

    Employee {
        bigint id PK
        bigint company_id FK
        bigint department_id FK
        string employee_code UK
        string full_name
        int dependents_count
        string status
    }

    AttendanceRecord {
        bigint id PK
        bigint employee_id FK
        date date
        datetime check_in_time
        datetime check_out_time
        string status
    }

    PayrollLedger {
        bigint id PK
        bigint employee_id FK
        int month
        int year
        decimal gross_income
        decimal pit_tax
        decimal net_salary
        string status
    }
```

---

## 2. Giai Thich Quan He Chinh

1. **`User` va `CandidateProfile` / `Company`**: Quan he 1-1. Mot tai khoan nguoi dung co the la mot ung vien so huu ho so ca nhan, hoac la dai dien quan tri mot doanh nghiep.
2. **`JobPost` va `Application`**: Quan he 1-Nhieu. Mot tin tuyen dung nhan nhieu ho so ung tuyen tu cac ung vien khac nhau.
3. **`Application` va `InterviewSession`**: Quan he 1-1. Moi ho so ung tuyen chi lien ket toi toi da 1 phien phong van Voice AI dang hoat dong.
4. **`Employee` va `PayrollLedger`**: Quan he 1-Nhieu. Mot nhan vien nhan nhieu bang luong qua tung thang trong nam, voi rang buoc duy nhat `(employee_id, month, year)`.
