# BÁO CÁO AUDIT TOÀN DIỆN ENVIRONMENT VARIABLES & HARDCODED CONFIGURATION
**Dự án:** Square Tuyển Dụng (InfoHR)  
**Thời gian thực hiện:** 30/08/2026  
**Phạm vi quét:** Toàn bộ repository (`api/`, `frontend/`, `voice-ai/`, `infra/`, `scripts/`, `nginx-gateway/`, `notebooklm-mcp/`, `.github/`, root configs)  
**Trạng thái Code:** Chỉ thực hiện Audit & Báo cáo, KHÔNG can thiệp sửa mã nguồn trực tiếp.

---

## 1. Executive Summary

| Chỉ số | Số lượng | Ghi chú |
| :--- | :--- | :--- |
| **Tổng số files đã quét** | **1,922 files** | Đã loại trừ `node_modules`, `.next`, `__pycache__`, build output, binary |
| **CRITICAL (Nghiêm trọng)** | **4 phát hiện** | Lộ Private Key trong Git, lộ API Token trong Git, 27 file Backup DB nén trong Git, Client Secret bị gắn tiền tố `NEXT_PUBLIC_` / `VITE_` |
| **HIGH (Cao)** | **9 phát hiện** | Fallback Secret Key / DB Password / MinIO Creds, lộ mật khẩu qua CLI args Docker, tắt kiểm tra env production mặc định, hardcode URL dịch vụ ngoài |
| **MEDIUM (Trung bình)** | **7 phát hiện** | Không đồng nhất tên biến giữa các service (MinIO, AI, STT, TTS), hardcode Host/Port fallback, thiếu >70 biến trong `.env.example` |
| **LOW (Thấp)** | **5 phát hiện** | Hardcode CDN icon, biến cấu hình phụ trợ có thể chuyển sang env |
| **PUBLIC_CONFIG (Hợp lệ)** | **6 nhóm biến** | Firebase Web API Key, Google Client ID, Goong Map Public Key, LiveKit Public WSS URL, Hostnames |
| **CONSTANT (Giữ nguyên)** | **Đã phân loại** | Regex validate, UI constants, HTTP status maps, route definitions, date options |

---

## 2. Phân loại Mức độ Rủi ro (Severity Definitions)

* **CRITICAL**: Bí mật thật (private key, access token, production credential) bị commit vào Git hoặc bị gắn cờ expose ra client-side bundle (`NEXT_PUBLIC_*`). Cần **rotate/revoke ngay lập tức**.
* **HIGH**: Hardcode secret fallback nguy hiểm (`|| 'secret'`), credential nhạy cảm trong script/docker, hoặc cơ chế validation bị vô hiệu hóa.
* **MEDIUM**: Hardcode domain/port/host phụ thuộc môi trường (staging/production/local), không đồng bộ giữa `.env` và `.env.example`.
* **LOW**: Cấu hình phụ trợ chưa tạo rủi ro bảo mật trực tiếp.
* **INFO / SAFE**: Public keys hoặc Business constants hợp lệ.

---

## 3. Critical Findings (Nghiêm trọng nhất - Cần xử lý khẩn cấp)

| STT | File | Dòng | Giá trị / Pattern | Loại | Rủi ro | Khuyến nghị khắc phục |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- |
| **C-01** | `frontend/docker/nginx/certs/myjob.key` | 1-28 | `-----BEGIN PRIVATE KEY----- ...` | **MUST_SECRET** | **SSL RSA Private Key thật** bị commit và theo dõi trực tiếp trong Git index (`git ls-files`). Bất kỳ ai clone repo đều có private key này. | **1.** Thu hồi/cấp lại SSL certificate.<br>**2.** Xóa file khỏi Git index (`git rm --cached`).<br>**3.** Đưa vào `.gitignore` (`*.key`, `*.pem`). |
| **C-02** | `infra/fpt-gpu/square-ai.runtime.env` | 3 | `API_TOKEN="36173238af56c9ee63badd82ac28ef9bb22ab5a47d8b02e29b8dc8a1f236b85b"` | **MUST_SECRET** | **API Token 64 ký tự** của cụm FPT GPU Serverless AI bị hardcode và commit trực tiếp trong Git. Kẻ tấn công có thể gọi API suy luận AI làm phát sinh chi phí GPU. | **1.** Rotate/revoke token trên cụm FPT Cloud AI.<br>**2.** Xóa file này khỏi Git tracking.<br>**3.** Thêm `infra/fpt-gpu/*.runtime.env` vào `.gitignore`. |
| **C-03** | `backups/db_backup_square_*.sql.gz` (27 files) | N/A | `db_backup_square_2026-08-04_112526.sql.gz` ... `2026-08-29_154705.sql.gz` | **MUST_SECRET** | **27 bản sao lưu MySQL Database nén toàn bộ** đang bị commit và theo dõi trong Git. Chứa toàn bộ dữ liệu người dùng thật, email, hash mật khẩu, thông tin tuyển dụng, token. | **1.** Xóa toàn bộ thư mục `backups/*.sql.gz` khỏi Git index.<br>**2.** Đảm bảo `.gitignore` đã có `backups/` và `*.sql.gz`.<br>**3.** Rotate tất cả credential của user có trong DB. |
| **C-04** | `.env` & `.env.prod` | 232, 237, 309, 311 | `NEXT_PUBLIC_GOOGLE_CLIENT_SECRET=GOCSPX-...`<br>`NEXT_PUBLIC_PROJECT_SERVER_CLIENT_SECRET=VYSa...`<br>`VITE_GOOGLE_CLIENT_SECRET=GOCSPX-...`<br>`VITE_PROJECT_SERVER_CLIENT_SECRET=VYSa...` | **MUST_SECRET** | **OAuth Client Secret** bị đặt tiền tố `NEXT_PUBLIC_` và `VITE_`. Trong Next.js và Vite, mọi biến có tiền tố này sẽ tự động bị đóng gói (baked) vào Javascript bundle tải về trình duyệt của người dùng cuối. | **1.** Đổi tên biến: xóa bỏ tiền tố `NEXT_PUBLIC_` và `VITE_` (chỉ dùng `GOOGLE_CLIENT_SECRET`, `CLIENT_SECRET` trên server-side).<br>**2.** Rotate Google OAuth Client Secret trên Google Cloud Console. |

---

## 4. High Findings (Rủi ro cao)

| STT | File | Dòng | Giá trị / Pattern | Loại | Rủi ro | Khuyến nghị khắc phục |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- |
| **H-01** | `api/config/settings.py` | 184 | `SECRET_KEY = config("SECRET_KEY", default="django-insecure-square-tuyen-dung-local-only")` | **MUST_SECRET** | Nếu biến `SECRET_KEY` bị thiếu trong production, Django sẽ âm thầm sử dụng chuỗi insecure hardcode sẵn, làm vô hiệu hóa bảo mật phiên (session), ký mã hoá mật khẩu, và CSRF token. | Xóa default fallback hoặc bắt buộc fail-fast nếu thiếu trong môi trường production (`if not SECRET_KEY or 'insecure' in SECRET_KEY: raise ImproperlyConfigured`). |
| **H-02** | `api/config/settings.py` | 528-529 | `MINIO_ACCESS_KEY = config('MINIO_ACCESS_KEY', default='admin')`<br>`MINIO_SECRET_KEY = config('MINIO_SECRET_KEY', default='password')` | **MUST_SECRET** | Fallback mật khẩu lưu trữ Object Storage là `admin` / `password`. | Yêu cầu bắt buộc truyền qua environment variable, cấm default password yếu. |
| **H-03** | `scripts/backup_db.sh` | 17 | `DB_PASSWORD="${DB_PASSWORD:-secret}"` | **MUST_SECRET** | Script backup tự động có fallback mật khẩu root database là `secret`. | Đổi thành `DB_PASSWORD="${DB_PASSWORD:?DB_PASSWORD must be set}"` để báo lỗi ngay nếu không có biến. |
| **H-04** | `docker-compose.yml` | 236, 259 | `-p${DB_PASSWORD:?Set DB_PASSWORD in .env}` và `-p$${MYSQL_ROOT_PASSWORD}` trên CLI command | **MUST_SECRET** | Truyền mật khẩu trực tiếp qua đối số dòng lệnh CLI trong Docker healthcheck (`mysqladmin -p...`) và cron (`mysqldump -p...`) khiến mật khẩu hiển thị dạng plaintext khi chạy `ps aux` hoặc xem inspect container. | Sử dụng file cấu hình `~/.my.cnf` hoặc `MYSQL_PWD` environment variable thay vì truyền trực tiếp cờ `-p<password>`. |
| **H-05** | `api/config/settings.py` | 152, 656-659 | `STRICT_ENV_VALIDATION = config("STRICT_ENV_VALIDATION", default=False)` | **SHOULD_ENV** | Module kiểm tra tính hợp lệ của biến môi trường (`validate_required_settings`) bị tắt mặc định. Dù chạy `IS_PRODUCTION=True`, hệ thống vẫn không tự động validate các biến bắt buộc. | Đổi mặc định thành: `STRICT_ENV_VALIDATION = config("STRICT_ENV_VALIDATION", default=IS_PRODUCTION, cast=_to_bool)` để luôn tự động bật trong production. |
| **H-06** | `api/config/settings.py` | 574 | `SMS_BASE_URL = "https://qy1kdr.api.infobip.com"` | **SHOULD_ENV** | URL endpoint dịch vụ Infobip SMS tenant-specific bị hardcode cứng trong code thay vì đọc qua `config("SMS_BASE_URL")`. | Đổi thành `SMS_BASE_URL = config("SMS_BASE_URL", default="https://api.infobip.com")`. |
| **H-07** | `api/config/settings.py` & `voice-ai/livekit_agent/src/config.py` | 80, 58 | `default="https://token.nodelee.tech/v1"` | **SHOULD_ENV** | Hardcode proxy endpoint dịch vụ bên thứ ba (`token.nodelee.tech`) làm giá trị fallback. | Đổi default thành rỗng hoặc chuẩn OpenAPI endpoint, bắt buộc cấu hình qua `AI_LLM_BASE_URL`. |
| **H-08** | `voice-ai/livekit_agent/src/config.py` | 98, 107 | `AI_STT_API_KEY = "no-key-needed"`, `AI_TTS_API_KEY = "no-key-needed"` | **SHOULD_ENV** | Fallback key dạng chuỗi giả lập che giấu việc thiếu API key thực sự của các dịch vụ nhận diện giọng nói / đọc văn bản. | Bỏ fallback giả lập, kiểm tra rõ ràng quyền truy cập khi khởi tạo service. |
| **H-09** | `infra/fpt-gpu/app-env.all-in-one.env` | 3, 35, 43 | `http://squareai0606full-ybnk5e9x-8000.serverless.fptcloud.com/v1` ... | **SHOULD_ENV** | Endpoint thực tế của FPT Serverless GPU container đang hoạt động bị commit vào Git repository. | Thêm file mẫu `app-env.all-in-one.env.example` với placeholder, đưa các file `.env` cụ thể vào `.gitignore`. |

---

## 5. Medium Findings (Rủi ro trung bình - Bất cập cấu hình & Naming)

| STT | Vấn đề | Vị trí phát hiện | Chi tiết & Tác động | Khuyến nghị refactor |
| :--- | :--- | :--- | :--- | :--- |
| **M-01** | **Bất nhất tên biến MinIO** | `docker-compose.yml:509` vs `.env` | Trong `docker-compose.yml` (service `minio-init`) dùng `$${MINIO_ROOT_USER}` và `$${MINIO_ROOT_PASSWORD}`, nhưng trong `.env.example` lại định nghĩa `MINIO_ACCESS_KEY` và `MINIO_SECRET_KEY`. Có nguy cơ init bucket thất bại nếu không khớp tên biến. | Thống nhất chuẩn tên biến MinIO: `MINIO_ROOT_USER` / `MINIO_ROOT_PASSWORD` (cho server) và `MINIO_ACCESS_KEY` / `MINIO_SECRET_KEY` (cho client app), ánh xạ đồng bộ trong `docker-compose.yml`. |
| **M-02** | **Bất nhất tên biến AI LLM** | `api/config/settings.py` vs `api/apps/jobs/ai_scoring_service.py` vs `voice-ai/` | Cùng một dịch vụ LLM nhưng các module đọc nhiều tên khác nhau:<br>• `settings.py`: `AI_LLM_BASE_URL`, `AI_LLM_MODEL`, `AI_LLM_API_KEY`<br>• `ai_scoring_service.py`: `OPENAI_API_URL`, `AI_MODEL`, `OPENAI_API_KEY`<br>• `livekit_agent`: `LLM_BASE_URL`, `LLM_MODEL`, `LLM_API_KEY` | Chuẩn hoá thành bộ biến duy nhất: `AI_LLM_BASE_URL`, `AI_LLM_MODEL`, `AI_LLM_API_KEY` cho toàn bộ các module backend và AI agent. |
| **M-03** | **Hardcode NotebookLM UUID** | `api/config/settings.py:703`<br>`docker-compose.yml:96` | `DEFAULT_NOTEBOOKLM_NOTEBOOK_ID = '0a469926-b901-426d-afe5-843096613137'` fallback UUID cố định trong code. | Chuyển hoàn toàn sang biến môi trường `DEFAULT_NOTEBOOKLM_NOTEBOOK_ID` không gán default ID cá nhân vào source code. |
| **M-04** | **Hardcode Domain Client trong Settings Backend** | `api/config/settings.py:62-68` | `WEB_JOB_SEEKER_CLIENT_URL` và `WEB_EMPLOYER_CLIENT_URL` fallback về `https://infohr.vn/`. Khi chạy local dev nếu thiếu biến sẽ tự động trỏ về domain production gây nhầm lẫn môi trường. | Đổi fallback trong local dev thành `http://localhost:3000`. |
| **M-05** | **Hardcode Nginx Port trong Next.js Proxy & Server Fetch** | `frontend/next.config.mjs:22,26`<br>`frontend/src/lib/server-fetch.ts:26,48` | Hardcode fallback port `8080` (`process.env.NGINX_PORT \|\| '8080'`). Nếu đổi port gateway ở docker-compose nhưng quên set biến ở frontend sẽ gãy routing API nội bộ. | Đưa `API_PROXY_PORT` / `NGINX_PORT` vào file cấu hình môi trường tập trung của frontend. |
| **M-06** | **Thiếu >70 biến trong `.env.example`** | `.env.example` so với `.env`/`.env.prod` | 74 biến cấu hình có trong `.env`/`.env.prod` nhưng hoàn toàn vắng bóng trong `.env.example` (bao gồm các nhóm: `FRAPPE_HR_*`, `TWILIO_*`, `CLOUDINARY_*`, `MINIO_ROOT_*`, `GUNICORN_*`, `NEXT_PUBLIC_HRM_PUBLIC_URL`, v.v.). Thành viên mới hoặc môi trường CI không thể setup đầy đủ dự án từ `.env.example`. | Bổ sung đầy đủ tất cả các biến vào `.env.example` kèm giá trị mẫu `CHANGE_ME`. |
| **M-07** | **Môi trường Dev & Prod dùng chung nhiều định danh / config** | `.env` vs `.env.prod` | Cả 2 file `.env` và `.env.prod` hiện tại có cùng mật khẩu `DB_PASSWORD`, cùng `SECRET_KEY`, cùng `CLOUDINARY_API_SECRET`, cùng `FRAPPE_HR_API_SECRET`. | Bắt buộc tách biệt hoàn toàn credential giữa các môi trường (Development, Staging, Production). Tuyệt đối không dùng chung database password hay secret key. |

---

## 6. Public Configuration (PUBLIC_CONFIG - Hợp lệ nhưng cần quản lý)

Các biến sau xuất hiện ở frontend bundle hoặc client configuration là **đúng thiết kế kiến trúc**, nhưng phải được quản lý qua biến môi trường thay vì hardcode giá trị production:

1. **`NEXT_PUBLIC_GOOGLE_CLIENT_ID`**: Public Client ID dùng cho Google Sign-In SDK phía trình duyệt. (An toàn khi là Client ID, **nhưng cấm Client Secret**).
2. **`NEXT_PUBLIC_FIREBASE_*`**:
   * `NEXT_PUBLIC_FIREBASE_API_KEY`
   * `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   * `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
   * `NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET`
   * `NEXT_PUBLIC_FIREBASE_APP_ID`
   *(Theo tài liệu chính thức của Google Firebase, các thông số Web Client này là public và an toàn khi Firestore Security Rules / Storage Rules được thiết lập chặt chẽ)*.
3. **`NEXT_PUBLIC_GOONGAPI_KEY`**: Map tiles & geocoding public key phía client.
4. **`NEXT_PUBLIC_LIVEKIT_URL`**: WebSocket URL công khai (`wss://infohr.vn/livekit` hoặc `ws://localhost:7880`) để client kết nối phòng phỏng vấn.
5. **`NEXT_PUBLIC_HRM_PUBLIC_URL`**: Đường dẫn tới portal HRM bên ngoài.
6. **`NEXT_PUBLIC_PROJECT_HOST_NAME` / `NEXT_PUBLIC_ADMIN_PROJECT_HOST_NAME`**: Domain định tuyến multi-portal (infohr.vn, admin.infohr.vn, employer.infohr.vn).

---

## 7. Business Constants (CONSTANT - KHÔNG đưa vào `.env`)

Các giá trị sau là **hằng số logic nghiệp vụ bất biến** của ứng dụng, **đúng chuẩn không nên chuyển sang `.env`**:

* **Route paths**: `auth/token/`, `job/web/job-posts/`, `/admin/dashboard`, `/login`, `/register` trong [apiEndpoints.ts](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/configs/apiEndpoints.ts) và [routeConfig.ts](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/configs/routeConfig.ts).
* **Validation Regex**: `phoneRegExp`, `urlRegExp` trong [constants.ts](file:///c:/Users/WIN10/Documents/square-tuyen-dung/frontend/src/configs/constants.ts).
* **UI Formatting & Colors**: `JOB_POST_STATUS_BG_COLOR = { 1: 'warning', 2: 'error', 3: 'success' }`.
* **Social links cố định**: `https://www.facebook.com/squarevn`, `https://www.youtube.com/@squarevn`, v.v.
* **Django Built-in configs**: `AUTH_PASSWORD_VALIDATORS`, `LANGUAGE_CODE = 'vi-vn'`, `TIME_ZONE = 'Asia/Ho_Chi_Minh'`.
* **Pagination Limits**: `ADMIN_MAX_PAGE_SIZE = 10000`.

---

## 8. Frontend Exposure Analysis

```mermaid
graph TD
    A[Environment Variables] --> B{Có tiền tố NEXT_PUBLIC_ hoặc VITE_ ?}
    B -- Có --> C[Next.js / Vite Build Process]
    C --> D[Inlined vào Client JS Bundle]
    D --> E[Public ra Browser cho bất kỳ ai inspect]
    B -- Không --> F[Chỉ chạy trên Server / Node / Django Runtime]
    
    style E fill:#ff6b6b,stroke:#c92a2a,stroke-width:2px
    style F fill:#51cf66,stroke:#2b8a3e,stroke-width:2px
```

* **Lỗ hổng phát hiện:**
  Trong file `.env` và `.env.prod`, các biến bí mật sau đây bị gắn sai tiền tố:
  * `NEXT_PUBLIC_PROJECT_SERVER_CLIENT_SECRET`
  * `NEXT_PUBLIC_GOOGLE_CLIENT_SECRET`
  * `VITE_PROJECT_SERVER_CLIENT_SECRET`
  * `VITE_GOOGLE_CLIENT_SECRET`
* **Hậu quả:** Mặc dù code hiện tại trong `src/configs/constants.ts` không chủ động gọi biến này, việc khai báo chúng với tiền tố `NEXT_PUBLIC_` khiến toàn bộ hệ thống build Next.js xem chúng là public assets và có thể bị rò rỉ nếu có bất kỳ đoạn code nào vô tình import.
* **Khắc phục:** Loại bỏ hoàn toàn các dòng này ra khỏi frontend environment scope.

---

## 9. Docker Exposure Analysis

1. **Bake-in Arguments:**
   Trong [docker-compose.yml](file:///c:/Users/WIN10/Documents/square-tuyen-dung/docker-compose.yml#L40-L60), service `frontend` truyền các biến `NEXT_PUBLIC_*` qua `build.args`. Cần đảm bảo tuyệt đối không truyền bất kỳ biến bí mật nào qua build args vì chúng sẽ bị lưu vĩnh viễn vào các layer của Docker image.
2. **Plaintext Passwords in Process Table:**
   Service `db` và `db-backup` truyền `-p${DB_PASSWORD}` trực tiếp trong `healthcheck` và `entrypoint shell script`. Bất kỳ user nào có quyền truy cập host hoặc container đều có thể xem mật khẩu root DB bằng lệnh `docker top` hoặc `ps aux`.
3. **Volume Mount Private Keys:**
   Service `backend` mount file private key SSH từ `${FPT_GPU_SSH_KEY_SOURCE:-./.secrets/fpt_gpu_ssh_key}`. Cần đảm bảo thư mục `.secrets/` nằm trong `.gitignore` và được phân quyền `chmod 600`.

---

## 10. Git History Exposure Analysis

* **Lịch sử commit:**
  Kiểm tra qua `git log --all --full-history` cho thấy:
  1. File `frontend/docker/nginx/certs/myjob.key` (SSL Private Key) đã được commit vào Git.
  2. File `infra/fpt-gpu/square-ai.runtime.env` (chứa `API_TOKEN="36173238..."`) đã được commit vào Git.
  3. 27 file `backups/db_backup_square_*.sql.gz` đã được commit vào Git.
* **CẢNH BÁO QUAN TRỌNG:**
  > **Chỉ xóa file hoặc đưa vào `.gitignore` là KHÔNG ĐỦ.**  
  > Các giá trị bí mật này vẫn tồn tại trong lịch sử commit của Git repository.  
  > **BẮT BUỘC PHẢI:**
  > 1. **Rotate/Revoke** ngay lập tức SSL Certificate và FPT API Token.
  > 2. Dùng công cụ `git-filter-repo` hoặc BFG Repo-Cleaner để làm sạch lịch sử Git nếu repository này được push lên remote public/shared.
  > 3. Xóa cache index: `git rm -r --cached backups/ frontend/docker/nginx/certs/ infra/fpt-gpu/*.env`.

---

## 11. Đề xuất `.env.example` Chuẩn hóa Toàn diện

Dưới đây là nội dung mẫu file `.env.example` đầy đủ, chuẩn hoá tên biến, phân nhóm rõ ràng và KHÔNG chứa bất kỳ bí mật thật nào:

```env
# =============================================================================
# .env.example — Comprehensive Environment Configuration Template
# =============================================================================
# Instructions:
# 1. Copy this file to .env (for local development) or .env.prod (for production).
# 2. Fill in the required values. NEVER commit real .env files to Git.
# =============================================================================

# --- Project & Core Environment ---
COMPOSE_PROJECT_NAME=tuyendung_studio_vn
APP_ENV=development
APP_ENVIRONMENT=development
DEBUG=True
APPEND_SLASH=False
STRICT_ENV_VALIDATION=False
ALLOWED_HOSTS=localhost,127.0.0.1
CSRF_TRUSTED_ORIGINS=http://localhost
CORS_ALLOWED_ORIGINS=http://localhost
SECRET_KEY=CHANGE_ME_generate_a_random_32_plus_char_secret_key

# --- HTTPS & Security Headers (Production) ---
USE_X_FORWARDED_HOST=False
SECURE_SSL_REDIRECT=False
SESSION_COOKIE_SECURE=False
CSRF_COOKIE_SECURE=False
SECURE_HSTS_SECONDS=0
SECURE_HSTS_INCLUDE_SUBDOMAINS=False
SECURE_HSTS_PRELOAD=False

# --- Database (MySQL) ---
DB_ENGINE=django.db.backends.mysql
DB_HOST=db
DB_NAME=square_db
DB_USER=root
DB_PASSWORD=CHANGE_ME_strong_database_password
DB_PORT=3306
DB_CONN_MAX_AGE=60

# --- Redis & Celery ---
SERVICE_REDIS_HOST=redis
SERVICE_REDIS_PORT=6379
SERVICE_REDIS_USERNAME=
SERVICE_REDIS_PASSWORD=
SERVICE_REDIS_DB=0
CELERY_WORKER_CONCURRENCY=2
CELERY_WORKER_PREFETCH_MULTIPLIER=1
CELERY_TASK_ACKS_LATE=true
CELERY_TASK_REJECT_ON_WORKER_LOST=true
CELERY_WORKER_MAX_TASKS_PER_CHILD=20
CELERY_TASK_ALWAYS_EAGER=False

# --- Object Storage (MinIO / S3) ---
MINIO_ENDPOINT=minio:9000
MINIO_ROOT_USER=minioadmin
MINIO_ROOT_PASSWORD=CHANGE_ME_strong_minio_root_password
MINIO_ACCESS_KEY=CHANGE_ME_minio_app_access_key
MINIO_SECRET_KEY=CHANGE_ME_minio_app_secret_key
MINIO_BUCKET=square
MINIO_SECURE=False
MINIO_PUBLIC_URL=http://localhost:9000
MINIO_CONSOLE_ADDRESS=:9001
MINIO_PRESIGN_EXPIRES=3600
MINIO_USE_PRESIGNED=False
MINIO_PRESIGN_PUBLIC=False
FILE_STORAGE_BACKEND=minio
FILE_STORAGE_PUBLIC_URL=

# --- Elasticsearch ---
ELASTICSEARCH_HOST=elasticsearch:9200

# --- Gateway & Networking ---
NGINX_PORT=8080

# --- Email (SMTP) ---
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_HOST_USER=your_email@gmail.com
EMAIL_HOST_PASSWORD=CHANGE_ME_google_app_password
SUPPORT_CONTACT_EMAIL=support@squaregroup.vn
COMPANY_CONTACT_EMAIL=support@squaregroup.vn
COMPANY_CONTACT_PHONE=0888-425-094

# --- SMS Gateway (Infobip / Twilio) ---
SMS_BASE_URL=https://api.infobip.com
SMS_API_KEY=CHANGE_ME_infobip_api_key
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE=

# --- OAuth & Authentication (Backend) ---
CLIENT_ID=CHANGE_ME_oauth_client_id
CLIENT_SECRET=CHANGE_ME_oauth_client_secret
OAUTH_CLIENT_TYPE=public
SOCIAL_AUTH_FACEBOOK_KEY=
SOCIAL_AUTH_FACEBOOK_SECRET=
SOCIAL_AUTH_GOOGLE_OAUTH2_KEY=CHANGE_ME_google_oauth_client_id
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET=CHANGE_ME_google_oauth_client_secret

# --- LiveKit WebRTC & Interview Agents ---
LIVEKIT_URL=http://livekit:7880
LIVEKIT_PUBLIC_URL=ws://localhost:7880
LIVEKIT_API_KEY=CHANGE_ME_livekit_api_key
LIVEKIT_API_SECRET=CHANGE_ME_livekit_api_secret
LIVEKIT_WEBHOOK_TOKEN=
LIVEKIT_WEBHOOK_STRICT=True
INTERVIEW_AGENT_SHARED_SECRET=CHANGE_ME_generate_a_random_32_char_shared_secret
INTERVIEW_AGENT_AUTH_REQUIRED=True
INTERVIEW_AGENT_AUTH_MAX_SKEW_SECONDS=300
INTERVIEW_DISCONNECT_GRACE_SECONDS=300

# --- AI Services (LLM / STT / TTS) ---
AI_LLM_BASE_URL=http://host.docker.internal:11434/v1
AI_LLM_MODEL=gpt-5.4-mini
AI_LLM_API_KEY=CHANGE_ME_optional_if_using_cloud_llm
AI_LLM_TEMPERATURE=0.7
AI_LLM_TOP_P=0.8
AI_LLM_TOP_K=20
AI_LLM_MIN_P=0.0
AI_LLM_PRESENCE_PENALTY=1.5
AI_LLM_REPETITION_PENALTY=1.0
AI_LLM_MAX_TOKENS=2048
AI_LLM_USE_VLLM_PARAMS=0
AI_LLM_ENABLE_THINKING=0

AI_STT_BASE_URL=http://whisper:8080/v1
AI_STT_MODEL=Systran/faster-whisper-large-v3
AI_STT_LANGUAGE=vi
AI_STT_API_KEY=

AI_TTS_BASE_URL=http://vieneu-tts:8298/v1
AI_TTS_MODEL=tts-1
AI_TTS_DEFAULT_VOICE=Ly
AI_TTS_API_KEY=
TTS_DEVICE=cuda
TTS_MODE=fast

# --- FPT GPU Cloud Infrastructure Control ---
FPT_GPU_CONTROL_BASE_URL=https://console-api.fptcloud.com
FPT_GPU_BSS_TOKEN_EXCHANGE_URL=https://ai-api.fptcloud.com/v1/login-callback/cloud_access_token
FPT_GPU_TENANT_ID=
FPT_GPU_REGION=hanoi-2-vn
FPT_GPU_CONTAINER_ID=
FPT_GPU_CONTAINER_NAME=
FPT_GPU_CONSOLE_URL=
FPT_GPU_BSS_ACCESS_TOKEN=
FPT_GPU_ACCESS_TOKEN=
FPT_GPU_SSH_HOST=
FPT_GPU_SSH_PORT=22
FPT_GPU_SSH_USER=root
FPT_GPU_SSH_KEY_SOURCE=./.secrets/fpt_gpu_ssh_key
FPT_GPU_SSH_KEY_PATH=/run/secrets/fpt_gpu_ssh_key
FPT_GPU_RUNNING_HOURLY_COST_VND=0
FPT_GPU_STOPPED_HOURLY_COST_VND=0

# --- NotebookLM MCP ---
NOTEBOOKLM_MCP_URL=http://notebooklm-mcp:8000/mcp
DEFAULT_NOTEBOOKLM_NOTEBOOK_ID=

# --- Frappe HR Sync ---
FRAPPE_HR_BASE_URL=
FRAPPE_HR_PUBLIC_URL=
FRAPPE_HR_SITE_NAME=
FRAPPE_HR_API_KEY=
FRAPPE_HR_API_SECRET=
FRAPPE_HR_DEFAULT_COMPANY=

# --- Firebase Server Credentials (Backend) ---
FIREBASE_CREDENTIALS_PATH=
FIREBASE_CREDENTIALS_JSON=
FIREBASE_CREDENTIALS_JSON_BASE64=

# =============================================================================
# FRONTEND PUBLIC VARIABLES (Inlined into Client Bundle at Build Time)
# =============================================================================
NEXT_PUBLIC_NODE_ENV=development
NEXT_PUBLIC_PROJECT_HOST_NAME=localhost
NEXT_PUBLIC_ADMIN_PROJECT_HOST_NAME=admin.localhost
NEXT_PUBLIC_EMPLOYER_PROJECT_HOST_NAME=employer.localhost
NEXT_PUBLIC_PROJECT_SERVER_CLIENT_ID=CHANGE_ME_oauth_client_id
NEXT_PUBLIC_GOOGLE_CLIENT_ID=CHANGE_ME_google_oauth_client_id
NEXT_PUBLIC_FACEBOOK_CLIENT_ID=
NEXT_PUBLIC_GOONGAPI_KEY=CHANGE_ME_goong_map_public_key
NEXT_PUBLIC_LIVEKIT_URL=ws://localhost:7880
NEXT_PUBLIC_MINIO_PUBLIC_URL=http://localhost:9000
NEXT_PUBLIC_HRM_PUBLIC_URL=http://localhost:8081

# --- Frontend Firebase Web Configuration (Public) ---
NEXT_PUBLIC_FIREBASE_API_KEY=CHANGE_ME_firebase_web_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-app-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-app.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=123456789012
NEXT_PUBLIC_FIREBASE_APP_ID=1:123456789012:web:abcdef123456
NEXT_PUBLIC_FIREBASE_FORCE_LONG_POLLING=false
```

---

## 12. Recommended Architecture & Configuration Patterns

### 12.1. Phân tầng và Cô lập Biến Môi trường (Strict Boundary)

```text
┌─────────────────────────────────────────────────────────────┐
│                    Secret Manager / Vault                   │
│   (AWS Secrets Manager, GCP Secret Manager, HashiCorp)      │
└──────────────────────────────┬──────────────────────────────┘
                               │ Injected at deploy time
             ┌─────────────────┴─────────────────┐
             ▼                                   ▼
┌─────────────────────────┐         ┌─────────────────────────┐
│     Server Runtime      │         │   Frontend Build Time   │
│ (Django / FastAPI / MCP)│         │     (Next.js / Vite)    │
├─────────────────────────┤         ├─────────────────────────┤
│ • SECRET_KEY            │         │ • NEXT_PUBLIC_HOST      │
│ • DB_PASSWORD           │         │ • NEXT_PUBLIC_API_URL   │
│ • CLIENT_SECRET         │         │ • NEXT_PUBLIC_GOOGLE_ID │
│ • API Tokens & Keys     │         │ • NEXT_PUBLIC_FIREBASE  │
│ ❌ CẤM BUNDLE RA NGOÀI  │         │ ⚠️ TUYỆT ĐỐI KHÔNG CHỨA │
│                         │         │    BẤT KỲ SECRET NÀO!   │
└─────────────────────────┘         └─────────────────────────┘
```

### 12.2. Cơ chế Fail-Fast Validation (Bắt buộc cho Production)

1. **Django Backend:**
   * Trong [settings.py](file:///c:/Users/WIN10/Documents/square-tuyen-dung/api/config/settings.py#L151-L153), tự động kích hoạt `validate_required_settings` khi `APP_ENVIRONMENT == 'production'` hoặc `DEBUG is False`.
   * Cấm khởi động ứng dụng nếu `SECRET_KEY` chứa chuỗi `django-insecure` hoặc `DB_PASSWORD` là chuỗi mặc định.

2. **Frontend Next.js:**
   * Tạo schema validation ở `next.config.mjs` bằng Zod hoặc schema đơn giản để kiểm tra các biến `NEXT_PUBLIC_*` bắt buộc ngay khi chạy `npm run build`.

3. **Voice AI Agent (FastAPI/Python):**
   * Trong `config.py`, bổ sung hàm validate bắt buộc `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `INTERVIEW_AGENT_SHARED_SECRET` khi khởi động container, thay vì gán fallback rỗng.

### 12.3. Quy trình Xử lý Khẩn cấp sau Audit (Action Plan)

1. **Bước 1 (Thu hồi & Cấp lại):**
   * Rotate FPT GPU Cloud Token.
   * Cấp lại SSL Certificate mới, xóa bỏ private key cũ.
   * Rotate Google OAuth Client Secret.
2. **Bước 2 (Dọn dẹp Git Index):**
   * Chạy `git rm -r --cached backups/`
   * Chạy `git rm --cached frontend/docker/nginx/certs/myjob.key frontend/docker/nginx/certs/myjob.crt`
   * Chạy `git rm --cached infra/fpt-gpu/square-ai.runtime.env`
3. **Bước 3 (Cập nhật `.gitignore`):**
   * Thêm các dòng bảo vệ:
     ```gitignore
     backups/
     *.sql.gz
     *.key
     *.pem
     infra/fpt-gpu/*.runtime.env
     .secrets/
     ```
4. **Bước 4 (Refactor Naming):**
   * Xóa tiền tố `NEXT_PUBLIC_` khỏi các biến secret trong `.env` và `.env.prod`.
   * Chuẩn hoá tên biến MinIO và AI LLM thống nhất giữa backend, frontend và docker-compose.
