# Quy Trinh Nghiep Vu & Vong Doi Trang Thai (Workflows & State Machines)

> **Phan he**: 03-domain  
> **Tai lieu**: workflows.md  
> **Tieu chuan**: Finite State Machines (FSM)

---

## 1. State Machine: Tien Trinh Ung Tuyen (Application Funnel)

Quy trinh xu ly mot ho so ung tuyen tu khi ung vien nop don den khi duoc tiep nhan nhan su chinh thuc:

```text
       ┌───────────────┐
       │    APPLIED    │ (Ung vien nop ho so thanh cong)
       └───────┬───────┘
               │ Recruiter xem xet ho so
               ▼
       ┌───────────────┐
       │   SCREENING   │ (Dang sang loc ho so dau vao)
       └───────┬───────┘
               │ Gui loi moi phong van Voice AI
               ▼
┌──────────────────────────────┐
│    AI_INTERVIEW_INVITED      │ (Cho ung vien xac nhan & phong van)
└──────────────┬───────────────┘
               │ Hoan tat phien phong van tren LiveKit
               ▼
┌──────────────────────────────┐
│    AI_INTERVIEW_COMPLETED    │ (AI da cham diem va sinh scorecard)
└──────────────┬───────────────┘
               │
       ┌───────┴───────────────────────┐
       │ Recruiter danh gia dat        │ Recruiter tu choi
       ▼                               ▼
┌───────────────┐               ┌───────────────┐
│    OFFERED    │               │   REJECTED    │ (Ket thuc quy trinh)
└───────┬───────┘               └───────────────┘
       │ Ung vien dong y nhan viec
       ▼
┌───────────────┐
│     HIRED     │ ──► [Tu dong kich hoat Onboarding sang Native HRM]
└───────────────┘
```

---

## 2. State Machine: Phien Phong Van Voice AI (Interview Session)

Vong doi cua mot phien phong van WebRTC voi LiveKit SFU va Python Agent:

```text
[SCHEDULED] ────────► [CANDIDATE_READY] ────────► [CONNECTED_IN_ROOM]
(Lich phong van)     (Kiem tra mic/cam OK)        (Ung vien vao phong LiveKit)
                                                         │
                                                         │ Agent bat dau phong van
                                                         ▼
                                                  [INTERVIEWING]
                                                  (Hoi dap cac cau trong script)
                                                         │
                                                         │ Ket thuc tat ca cau hoi
                                                         ▼
[EVALUATION_FAILED] ◄── [SCORING_IN_PROGRESS] ◄── [ROOM_COMPLETED]
 (Loi xu ly LLM)         (LLM cham diem & tong hop) (Tat ca roi phong)
                                 │
                                 │ Tao PDF Scorecard thanh cong
                                 ▼
                        [REPORT_GENERATED]
```

---

## 3. State Machine: Don Nghi Phep (Leave Request) & Quy Phep

```text
[PENDING] ──► (Nhan vien nop don, he thong kiem tra remaining_days >= total_days)
    │
    ├─► [APPROVED] (Quan ly duyet -> Tru thang vao used_days trong EmployeeLeaveBalance)
    │
    └─► [REJECTED] (Tu choi don -> Khong thay doi quy phep)
```

---

## 4. State Machine: Bang Luong Hang Thang (Payroll Ledger)

```text
[DRAFT] ──────► [CALCULATED] ──────► [APPROVED] ──────► [PAID]
(Khoi tao)    (Chay engine tinh)   (Ke toan/GD duyet)  (Da chi tra ngan hang)
                                          │                     │
                                          └─────────────────────┴──► [KHOA CUNG DU LIEU]
                                                                     (Cam update/create de)
```
