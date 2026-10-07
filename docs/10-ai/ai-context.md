# Ngu Canh He Thong Cho Tro Ly AI (AI System Context)

> **Phan he**: 10-ai  
> **Tai lieu**: ai-context.md  
> **Doi tuong ap dung**: Antigravity, Cursor, Claude Code, GitHub Copilot, Windsurf

---

## 1. Dinh Vi He Sinh Thai InfoHR

Square Tuyen Dung (InfoHR) la he sinh thai monorepo tich hop gom:
- **`frontend/`**: Next.js 16 (App Router), React 19, Tailwind CSS v4, TypeScript 5, TanStack Query v5, Redux Toolkit, Shadcn UI.
- **`api/`**: Django 4.2+, Django REST Framework, Celery 5.3+, MySQL 8.0, Redis 7, Elasticsearch 7, MinIO S3 SDK.
- **`voice-ai/`**: LiveKit SFU, LiveKit Python Agent, Whisper STT, Vieneu/Edge TTS, Talking-Head avatar lipsync.
- **`nginx-gateway/`**: Nginx Reverse Proxy, ModSecurity WAF.
- **`monitoring/`**: Prometheus, Grafana, Loki, Promtail.

---

## 2. 5 Nguyen Tac Hanh Vi Cot Loi Danh Cho AI

1. **Bang Chung Tren Gia Dinh (Evidence Over Assumption)**:
   - Luon kiem tra file that, import that, signature ham that truoc khi viet code.
   - Khong bao gio tu bia ra model khong ton tai, field khong co trong database hoac endpoint khong ton tai.
2. **Kiem Tra Xac Minh Truoc Khi Bao Hoan Thanh (Verification First)**:
   - Phai chay lenh xac minh thuc te (`ruff check .`, `pytest`, `pnpm run typecheck`, `pnpm run build`) truoc khi thong bao cho nguoi dung.
3. **Bao Ton Comment Va Docstrings Tieng Viet (Non-Destructive Editing)**:
   - Codebase chua nhieu giai thich nghiep vu Luat Lao dong, thue TNCN va tinh toan bang luong bang tieng Viet rat co gia tri. Khong duoc tu y xoa hoac dich sang tieng Anh.
4. **Dong Bo Hop Dong Giua Cac Phan He (Cross-Service Contract Sync)**:
   - Khi sua serializer o backend, phai dong bo TypeScript interface tai `frontend/src/types/`.
5. **Tuyet Doi Khong De Lo Secret (Strict Secret Hygiene)**:
   - Khong duoc xuat ra man hinh hoac commit cac noi dung file `.env`, private key, password vao git.
