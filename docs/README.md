# Trung Tam Tai Lieu Ky Thuat: Square Tuyen Dung (InfoHR Documentation Hub)

> **He sinh thai**: Square Tuyen Dung (InfoHR Platform)  
> **Kien truc**: Monorepo (`frontend`, `api`, `voice-ai`, `nginx-gateway`, `monitoring`, `waf`)  
> **Trang thai**: Enterprise Production Standard  
> **Phien ban hien tai**: v1.1.0

---

## 1. So Do Cay Tai Lieu Chuan (Documentation Directory Tree)

Chao mung ban den voi cong thong tin tai lieu ky thuat tap trung cua he thong **Square Tuyen Dung (InfoHR)**. He thong tai lieu duoc to chuc khoa hoc gom 14 thu muc danh so va cac tai lieu dieu huong trung tam:

```text
docs/
├── 00-project/          # Tong quan du an, muc tieu, pham vi, thuat ngu, trang thai
│   ├── overview.md
│   ├── goals-and-scope.md
│   ├── glossary.md
│   └── status.md
├── 01-product/          # Yeu cau san pham, vai tro nguoi dung, luong cong viec, ma tran quyen han
│   ├── requirements.md
│   ├── user-roles.md
│   ├── workflows.md
│   └── permissions-matrix.md
├── 02-architecture/     # Kien truc he thong, backend, frontend, database, ha tang, so do Mermaid
│   ├── system-architecture.md
│   ├── backend-architecture.md
│   ├── frontend-architecture.md
│   ├── voice-ai-architecture.md
│   ├── infrastructure.md
│   └── mermaid-diagrams.md
├── 03-domain/           # Thuc the nghiep vu, quy trinh (workflows), quy tac trang thai & vong doi
│   ├── entities.md
│   ├── workflows.md
│   └── lifecycle-rules.md
├── 04-api/              # Tong quan REST/WS API, conventions, xac thuc, endpoints, DTO contracts
│   ├── overview.md
│   ├── authentication.md
│   ├── endpoints.md
│   └── dto-contracts.md
├── 05-database/         # Luoc do database, quan he ERD, migrations, indexes, dual-persistence
│   ├── schema.md
│   ├── erd.md
│   ├── migrations-and-indexes.md
│   └── dual-persistence.md
├── 06-frontend/         # Kien truc Next.js 16 + React 19 + Tailwind, routing, state, forms, a11y
│   ├── architecture.md
│   ├── routing-and-subdomains.md
│   ├── state-management.md
│   ├── forms-and-validation.md
│   └── accessibility-a11y.md
├── 07-design/           # Design System chuan thuong hieu Square (square.vn), typography, colors
│   ├── design-system.md
│   ├── color-palette.md
│   ├── typography.md
│   └── components.md
├── 08-development/      # Huong dan setup moi truong, lenh dev, chuan code, testing, git workflow
│   ├── environment-setup.md
│   ├── dev-commands.md
│   ├── coding-standards.md
│   ├── testing-guide.md
│   └── git-workflow.md
├── 09-operations/       # Trien khai Docker production, environments, giam sat, logging, backup
│   ├── docker-production.md
│   ├── environments.md
│   ├── monitoring-and-logging.md
│   └── backup-and-disaster-recovery.md
├── 10-ai/               # AI context, quy tac bat buoc (no em dash, i18n), task & verification protocol
│   ├── ai-context.md
│   ├── rules-and-constraints.md
│   └── task-verification-protocol.md
├── 11-decisions/        # Bo Architecture Decision Records (ADR-001 -> ADR-005)
│   ├── ADR-001-monorepo-dual-persistence.md
│   ├── ADR-002-admin-dashboard-stack.md
│   ├── ADR-003-webrtc-voice-ai-pipeline.md
│   ├── ADR-004-hrm-payroll-calculation-engine.md
│   ├── ADR-005-unified-design-system-square.md
│   ├── template.md
│   └── README.md
├── 12-tasks/            # Quan ly task (backlog, in-progress, blocked, completed)
│   ├── backlog.md
│   ├── in-progress.md
│   ├── blocked.md
│   └── completed.md
├── 13-changelog/        # Lich su thay doi phien ban theo Keep a Changelog
│   └── CHANGELOG.md
├── static/              # Luu tru frigate-api.yaml (dung cho CI/API spec) va logo nhan dien
│   ├── frigate-api.yaml
│   ├── square-logos.json
│   └── branding-assets.md
├── README.md            # Muc luc va cong dieu huong trung tam (File nay)
├── roadmap.md           # Lo trinh phat trien san pham & ky thuat
└── naming-conventions.md# Quy chuan dat ten toan dien trong toan bo du an
```

---

## 2. Huong Dan Tra Cuu Nhanh Theo Vai Tro (Role-Based Reading Guide)

### 👨‍💻 Danh Cho Ky Su Backend (Backend Engineers)
1. Tim hieu thuc the va nghiep vu cot loi: [03-domain/entities.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/03-domain/entities.md) va [03-domain/workflows.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/03-domain/workflows.md).
2. Nam vung kien truc Service Layer: [02-architecture/backend-architecture.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/02-architecture/backend-architecture.md) va [08-development/coding-standards.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/08-development/coding-standards.md).
3. Luoc do CSDL va kien truc luu tru kep: [05-database/schema.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/05-database/schema.md) va [05-database/dual-persistence.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/05-database/dual-persistence.md).
4. Quy chuan API va DTO Contracts: [04-api/overview.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/04-api/overview.md) va [04-api/dto-contracts.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/04-api/dto-contracts.md).

### 🎨 Danh Cho Ky Su Frontend (Frontend Engineers)
1. Kien truc Next.js 16 va Subdomain Routing: [06-frontend/architecture.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/06-frontend/architecture.md) va [06-frontend/routing-and-subdomains.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/06-frontend/routing-and-subdomains.md).
2. Quan ly trang thai 3 tang va Bieu mau: [06-frontend/state-management.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/06-frontend/state-management.md) va [06-frontend/forms-and-validation.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/06-frontend/forms-and-validation.md).
3. Design System chuan thuong hieu Square: [07-design/design-system.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/07-design/design-system.md) va [07-design/color-palette.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/07-design/color-palette.md).
4. Tieu chuan tiep can A11y: [06-frontend/accessibility-a11y.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/06-frontend/accessibility-a11y.md).

### 🎙️ Danh Cho Ky Su Voice AI & WebRTC
1. Pipeline xu ly giong noi thoi gian thuc: [02-architecture/voice-ai-architecture.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/02-architecture/voice-ai-architecture.md).
2. Xac thuc va cap LiveKit Room Token: [04-api/authentication.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/04-api/authentication.md).
3. Quyet dinh kien truc WebRTC: [11-decisions/ADR-003-webrtc-voice-ai-pipeline.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/11-decisions/ADR-003-webrtc-voice-ai-pipeline.md).

### 🚀 Danh Cho Doi Ngu DevOps & Van Hanh
1. Huong dan trien khai Docker: [09-operations/docker-production.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/09-operations/docker-production.md).
2. Quan ly Secret va Moi truong: [09-operations/environments.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/09-operations/environments.md).
3. Giam sat he thong va Tuong lua WAF: [09-operations/monitoring-and-logging.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/09-operations/monitoring-and-logging.md).
4. Kich ban sao luu va phuc hoi su co: [09-operations/backup-and-disaster-recovery.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/09-operations/backup-and-disaster-recovery.md).

### 🤖 Danh Cho Cac Tro Ly Lap Trinh AI (AI Coding Assistants)
1. Quy tac bat buoc: [10-ai/rules-and-constraints.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/10-ai/rules-and-constraints.md) (Khong dung em dash, tuan thu i18n, bao ve comment tieng Viet).
2. Giao thuc xac minh nghiem ngat: [10-ai/task-verification-protocol.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/10-ai/task-verification-protocol.md).
3. Quy chuan dat ten toan he thong: [docs/naming-conventions.md](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docs/naming-conventions.md).
