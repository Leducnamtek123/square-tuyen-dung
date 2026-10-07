# Quy Trinh Git & Tieu Chuan Commit (Git Workflow & Commits)

> **Phan he**: 08-development  
> **Tai lieu**: git-workflow.md  
> **Tieu chuan**: Conventional Commits 1.0.0 & Git Feature Branching

---

## 1. Mo Hinh Nhanh Git (Branching Strategy)

He thong ap dung mo hinh Git Flow don gian hoa:

- **`main`**: Nhanh san sang trien khai production. Chi merge thong qua Pull Request da duoc review va chay pass toan bo CI/CD pipeline.
- **`dev`**: Nhanh tich hop chinh cho moi truong Staging.
- **`feature/<ten-tinh-nang>`**: Nhanh phat trien tinh nang moi (tao ra tu `dev`).
- **`fix/<ten-loi>`**: Nhanh sua loi nghiep vu hoac bug thuong (tao ra tu `dev`).
- **`hotfix/<ten-loi-khan-cap>`**: Nhanh sua loi khan cap tren production (tao ra truc tiep tu `main`).

---

## 2. Quy Chuan Dat Ten Commit (Conventional Commits 1.0.0)

Moi commit phai tuan thu cu phap:
```text
<type>(<scope>): <mo ta ngan gon ve thay doi>

[Noi dung chi tiet mo rong ly do thay doi neu co]
```

### Cac `type` hop le:
- `feat`: Tinh nang moi cho nguoi dung hoac he thong.
- `fix`: Sua loi phan mem hoac loi nghiep vu.
- `refactor`: Tai cau truc ma nguon khong lam thay doi tinh nang hoac sua loi.
- `perf`: Cai tien hieu nang (SQL query, bundle size, latency).
- `docs`: Cap nhat tai lieu huong dan.
- `test`: Them hoac sua test cases.
- `chore`: Cap nhat dependencies, cau hinh build, CI/CD.

### Cac `scope` thuong dung:
- `api`, `frontend`, `voice-ai`, `hrm`, `ats`, `auth`, `gateway`, `db`.

### Vi du commit dung:
```text
feat(hrm): bo sung dependents_count vao engine tinh thue TNCN
fix(interviews): sua loi timeout khi LiveKit Egress xuat ban ghi len MinIO
refactor(frontend): tach EmployerSectionClient thanh cac client leaf components
docs(api): dong bo OpenAPI DTO contracts cho endpoint payroll
```

---

## 3. Dinh Nghia Hoan Thanh (Definition of Done - DoD)

Mot Pull Request chi duoc phep merge khi thoa man day du 5 tieu chi DoD:
1. **Tuan thu quy tac**: Code tuan thu chat che cac huong dan trong `AGENTS.md` cua phan he tuong ung.
2. **Kiem tra loai & Linting**: `ruff check .` (Backend) va `pnpm run typecheck` (Frontend) pass 100%, khong co canh bao moi.
3. **Kiem thu vuot qua**: Cac unit test va regression test lien quan deu chay thanh cong tren moi truong local va CI.
4. **Bao ton tri thuc**: Khong xoa cac comment, docstring tieng Viet mang gia tri giai thich nghiep vu.
5. **Zero Secrets**: Khong co bat ky file chua credential, key bi mat hay file `.env` nao bi kem theo commit.
