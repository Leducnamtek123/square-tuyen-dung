# Cac Cong Viec Da Hoan Thanh (Completed Tasks & Milestones)

> **Phan he**: 12-tasks  
> **Tai lieu**: completed.md  
> **Lich su nghiem thu**: Tong hop toan bo cac task da hoan thanh va pass kiem thu

---

## 1. Goi Nang Cap & Khac Phuc Triet De 16 Loi Native HRM (Enterprise HRM Remediation)

Toan bo 16 loi tiem an (5 Critical, 6 High, 5 Medium) trong phan he Native HRM da duoc khac phuc hoan toan va nghiem thu qua 32 backend pytest unit tests va frontend typecheck:

### Giai Doan 1: Nghiep Vu Tinh Luong & Toan Ven Tai Chinh (Financial Core)
- [x] **Task 1.1**: Sua loi tru luong 2 lan trong `payroll_engine.py` va `push_to_payroll`.
- [x] **Task 1.2**: Khac phuc lo hong vang mat ca thang van huong 100% luong va sua ham tinh ngay nghi khong luong (`Sum('total_days')` thay vi `.count()`).
- [x] **Task 1.3**: Bo sung truong `dependents_count` vao model `Employee`, serializer, giao dien va engine tinh thue TNCN (giam tru 4.4tr/nguoi phu thuoc).
- [x] **Task 1.4**: Them co che bao ve khoa bang luong da duyet (`APPROVED`) hoac da chi tra (`PAID`) truoc cac lenh tinh toan lai.

### Giai Doan 2: Cham Cong, Ghep Ca & Thuat Toan Bang Cong (Time & Attendance)
- [x] **Task 2.1**: Sua thuat toan ghep ca trong `services.py` (`process_punch_logs_for_date`) cho ca dem (`is_overnight`) va phat hien ngoai le `MISSED_IN` / `MISSED_OUT`.
- [x] **Task 2.2**: Phan biet rach roi giua nghi phep co luong (`paid_leave_days`) va nghi khong luong (`unpaid_leave_days`) trong `MonthlyAttendanceSummaryViewSet.recalculate()`.
- [x] **Task 2.3**: Sua loi query ngay nghi phep vat qua ranh gioi thang trong `AttendanceRecordViewSet.timesheet()`.

### Giai Doan 3: Hop Dong, Quy Phep & Dong Bo Hop Dong API (Contracts & Data Integrity)
- [x] **Task 3.1**: Dong bo 100% enum `CAREER_EVENT_CONFIG` va `DOCUMENT_TYPE_CONFIG` giua frontend va backend, triet tieu loi HTTP 400 Bad Request.
- [x] **Task 3.2**: Them truong chon `leave_type` vao modal Tao don nghi phep tren `LeaveListPage/index.tsx`.
- [x] **Task 3.3**: Them khoa `select_for_update` va kiem tra `remaining_days >= total_days` khi nop don nghi phep de ngan chan am quy phep.
- [x] **Task 3.4**: Bo sung `perform_update` trong `EmployeeViewSet` tu dong dong bo `full_name` khi thay doi `first_name` hoac `last_name`.
- [x] **Task 3.5**: Tu dong chuyen hop dong cu sang `EXPIRED` khi tao hop dong moi co trang thai `ACTIVE`.
- [x] **Task 3.6**: Tru quy phep khi duyet don nghi phep tu phan he `AttendanceRequest` (2-stage approval).

### Giai Doan 4: Hoan Thien Trai Nghiem UI/UX & Tien Ich Van Hanh (UI/UX Polish)
- [x] **Task 4.1**: Tich hop nut Xuat bang luong ra Excel/CSV tren giao dien `PayrollListPage`.
- [x] **Task 4.2**: Bo sung CSS `@media print` cho phieu luong Payslip in chuan trang A4 chuyen nghiep.
- [x] **Task 4.3**: Toi uu bo loc trang Onboarding (`OnboardingPage`), chi hien thi nhan su moi tiep nhan trong vong 60 ngay hoac dang thu viec.
- [x] **Task 4.4**: Bo sung thong tin bang cong ca nhan vao cong tu phuc vu nhan vien (`/me/`).

### Giai Doan 5: Nang Cap Bo Cuc & UI/UX Chuan Odoo & Frappe HR
- [x] **Task 5.1**: `HrmDashboardPage`: Widget "Vang mat hom nay (Who's Away Today)", Quick Actions nang cao, bo cuc Bento 3 cot.
- [x] **Task 5.2**: `EmployeeListPage`: Bo sung `dependents_count` vao Dialog Form & Drawer, phim tat mo truc tiep Lich su cong tac & Tai lieu so.
- [x] **Task 5.3**: `DetailedTimesheetPage`: Bo sung thanh Legend chu thich ma cham cong day du, tinh chinh `zIndex` co dinh headers tranh che khuat chu.
- [x] **Task 5.4**: `SummaryTimesheetPage`: Modal dieu huong tu dong sang Bang Luong (`/employer/hrm/payroll`) sau khi chot cong.
- [x] **Task 5.5**: `LeaveListPage` & `RequestManagementPage`: Banner lien thong hai chieu giua Don Nghi Phep & Cong Quan Ly Don Tu Tap Trung.
- [x] **Task 5.6**: `OrgChartPage`: Cay so do to chuc hien thi danh sach nhan su truc thuoc tung phong ban voi kha nang thu gon/mo rong linh hoat.

---

## 2. Cac Moc Ha Tang Da Nghiem Thu Truoc Do (Foundation Milestones)

- [x] **Khoi tao kien truc Monorepo**: Dong nhat Next.js 16 + Django REST Framework + Nginx Gateway.
- [x] **Kien truc Dual-Persistence**: MySQL 8.0 ket hop Elasticsearch 7.17 va MinIO S3.
- [x] **Tich hop LiveKit Voice AI**: Phong hop thoai WebRTC, STT/TTS tieng Viet va tu dong sinh scorecard.
- [x] **Ha tang giam sat**: Tich hop Prometheus, Grafana, Loki, Promtail va Alertmanager.
- [x] **Bao ve vanh dai WAF**: Cau hinh ModSecurity WAF voi OWASP CRS ruleset.
