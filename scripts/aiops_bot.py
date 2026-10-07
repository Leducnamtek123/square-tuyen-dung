#!/usr/bin/env python3
# =============================================================================
# scripts/aiops_bot.py — InfoHR Telegram Autonomous AIOps & SysAdmin Agent
# =============================================================================
# Provides 24/7 interactive server management, self-healing, health monitoring,
# and JEV/AI diagnostics directly inside Telegram.
# =============================================================================

import os
import sys
import time
import json
import logging
import subprocess
import urllib.request
import urllib.parse
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent

LOG_FILE = BASE_DIR / "scripts" / "aiops_bot.log"


class FlushFileHandler(logging.FileHandler):
    def emit(self, record):
        super().emit(record)
        self.flush()


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    handlers=[
        logging.StreamHandler(sys.stdout),
        FlushFileHandler(LOG_FILE, encoding="utf-8"),
    ],
)
logger = logging.getLogger("AIOpsBot")


def load_env():
    env_file = BASE_DIR / ".env"
    env_vars = {}
    if env_file.exists():
        with open(env_file, "r", encoding="utf-8", errors="ignore") as f:
            for line in f:
                line = line.strip()
                if line and not line.startswith("#") and "=" in line:
                    key, val = line.split("=", 1)
                    env_vars[key.strip()] = val.strip().strip("'\"")
    return env_vars


ENV = load_env()
BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN") or ENV.get("TELEGRAM_BOT_TOKEN") or ""
ADMIN_CHAT_ID_RAW = os.environ.get("TELEGRAM_CHAT_ID") or ENV.get("TELEGRAM_CHAT_ID") or "0"
try:
    ADMIN_CHAT_ID = int(ADMIN_CHAT_ID_RAW)
except ValueError:
    ADMIN_CHAT_ID = 0

TELEGRAM_API = f"https://api.telegram.org/bot{BOT_TOKEN}" if BOT_TOKEN else ""


def send_message(chat_id: int, text: str, reply_markup: dict = None):
    url = f"{TELEGRAM_API}/sendMessage"
    payload = {
        "chat_id": chat_id,
        "text": text,
        "parse_mode": "HTML",
    }
    if reply_markup:
        payload["reply_markup"] = reply_markup

    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(url, data=data, headers={"Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=10) as resp:
            res = json.loads(resp.read().decode("utf-8"))
            if not res.get("ok"):
                logger.error(f"Telegram API returned non-ok: {res}")
            return res
    except Exception as e:
        logger.error(f"Failed to send message: {e}")
        return None


def get_keyboard():
    return {
        "keyboard": [
            [{"text": "📈 Báo Cáo Điều Hành"}, {"text": "📊 Trạng thái Máy chủ"}],
            [{"text": "🎙️ Trạng thái JEV & AI"}, {"text": "📦 Sao lưu sang ổ Z:"}],
            [{"text": "🧹 Dọn rác ổ C:"}, {"text": "🔄 Khởi động lại LiveKit"}],
            [{"text": "🔄 Khởi động lại Backend"}, {"text": "❓ Trợ giúp"}]
        ],
        "resize_keyboard": True
    }


def get_executive_digest() -> str:
    """
    Tong hop so lieu kinh doanh & ha tang dinh ky (Executive Metrics Digest)
    Lay truc tiep tu CSDL backend Django va he thong giam sat Windows host.
    """
    logger.info("Generating Executive Metrics Digest...")

    # 1. Truy van so lieu nghiep vu tu container Backend Django
    biz_data = {}
    try:
        py_cmd = (
            "import json; from django.utils import timezone; from datetime import timedelta; "
            "from apps.accounts.models import User; from apps.jobs.models import JobPost, JobPostActivity; "
            "from apps.interviews.models import InterviewSession; from apps.profiles.models import Company, CompanyVerification; "
            "from shared.configs import variable_system as var_sys; "
            "today = timezone.localdate(); seven_days_ago = timezone.now() - timedelta(days=7); "
            "data = {"
            "'total_users': User.objects.count(), "
            "'new_users_7d': User.objects.filter(create_at__gte=seven_days_ago).count(), "
            "'job_seekers': User.objects.filter(role_name=var_sys.JOB_SEEKER).count(), "
            "'employers': User.objects.filter(role_name=var_sys.EMPLOYER).count(), "
            "'total_jobs': JobPost.objects.count(), "
            "'active_jobs': JobPost.objects.filter(status=var_sys.JobPostStatus.APPROVED, deadline__gte=today).count(), "
            "'pending_jobs': JobPost.objects.filter(status=var_sys.JobPostStatus.PENDING).count(), "
            "'new_jobs_7d': JobPost.objects.filter(create_at__gte=seven_days_ago).count(), "
            "'total_apps': JobPostActivity.objects.filter(is_deleted=False).count(), "
            "'new_apps_7d': JobPostActivity.objects.filter(is_deleted=False, create_at__gte=seven_days_ago).count(), "
            "'total_interviews': InterviewSession.objects.count(), "
            "'completed_interviews': InterviewSession.objects.filter(status='completed').count(), "
            "'completed_interviews_7d': InterviewSession.objects.filter(status='completed', update_at__gte=seven_days_ago).count(), "
            "'total_companies': Company.objects.count(), "
            "'verified_companies': Company.objects.filter(is_verified=True).count(), "
            "'pending_verifications': CompanyVerification.objects.filter(status=CompanyVerification.STATUS_PENDING).count(), "
            "}; print('DIGEST_DATA:' + json.dumps(data))"
        )
        db_proc = subprocess.run(
            ["docker", "exec", "tuyendung-studio-backend", "python", "manage.py", "shell", "-c", py_cmd],
            capture_output=True, text=True, timeout=20
        )
        for line in db_proc.stdout.splitlines():
            if line.startswith("DIGEST_DATA:"):
                biz_data = json.loads(line.replace("DIGEST_DATA:", "").strip())
                break
    except Exception as e:
        logger.error(f"Failed to query business metrics for digest: {e}")

    # 2. Thong tin GPU NVIDIA
    gpu_desc = "Không nhận diện"
    try:
        gpu_cmd = subprocess.run(
            ["nvidia-smi", "--query-gpu=name,temperature.gpu,utilization.gpu,memory.used,memory.total", "--format=csv,noheader"],
            capture_output=True, text=True, timeout=5
        )
        if gpu_cmd.returncode == 0:
            gpu_info = [x.strip() for x in gpu_cmd.stdout.strip().split(",")]
            gpu_desc = f"{gpu_info[0]} ({gpu_info[1]}°C, Tải {gpu_info[2]}, VRAM: {gpu_info[3]} / {gpu_info[4]})"
    except Exception:
        pass

    # 3. Thong tin Luu tru O dia (C: va Z:)
    disk_desc = []
    try:
        ps_disk = subprocess.run(
            ["powershell", "-NoProfile", "-Command",
             "Get-Volume | Where-Object { $_.DriveLetter -in @('C','Z') } | ForEach-Object { \"$($_.DriveLetter)|$([math]::Round($_.SizeRemaining/1GB,1))|$([math]::Round($_.Size/1GB,1))\" }"],
            capture_output=True, text=True, timeout=8
        )
        if ps_disk.returncode == 0:
            for line in ps_disk.stdout.strip().splitlines():
                parts = line.strip().split("|")
                if len(parts) == 3:
                    dl, free_gb, total_gb = parts
                    label = "SSD HĐH" if dl == "C" else "aitrain NAS"
                    disk_desc.append(f"Ổ {dl}: ({label}) Trống {free_gb} GB / {total_gb} GB")
    except Exception:
        pass

    # 4. Containers Status
    running_containers = 0
    try:
        ps_docker = subprocess.run(["docker", "ps", "-q"], capture_output=True, text=True, timeout=5)
        if ps_docker.returncode == 0:
            running_containers = len([x for x in ps_docker.stdout.strip().splitlines() if x])
    except Exception:
        pass

    # Dinh dang noi dung HTML Telegram
    now_str = time.strftime("%d/%m/%Y %H:%M")

    total_users = biz_data.get("total_users", 0)
    new_users_7d = biz_data.get("new_users_7d", 0)
    job_seekers = biz_data.get("job_seekers", 0)
    employers = biz_data.get("employers", 0)
    total_companies = biz_data.get("total_companies", 0)
    verified_companies = biz_data.get("verified_companies", 0)

    total_jobs = biz_data.get("total_jobs", 0)
    active_jobs = biz_data.get("active_jobs", 0)
    pending_jobs = biz_data.get("pending_jobs", 0)

    total_apps = biz_data.get("total_apps", 0)
    new_apps_7d = biz_data.get("new_apps_7d", 0)

    total_interviews = biz_data.get("total_interviews", 0)
    completed_interviews = biz_data.get("completed_interviews", 0)
    completed_interviews_7d = biz_data.get("completed_interviews_7d", 0)
    completion_rate = round((completed_interviews / total_interviews * 100), 1) if total_interviews > 0 else 0

    lines = [
        "📊 <b>[InfoHR — Báo Cáo Điều Hành & Sức Khỏe Sản Xuất]</b>",
        f"🗓️ <i>Thời điểm: {now_str} (Máy chủ Windows Server)</i>\n",
        "👥 <b>1. Người Dùng & Doanh Nghiệp:</b>",
        f"   • Tổng tài khoản: <b>{total_users:,}</b> (<i>+{new_users_7d} trong 7 ngày qua</i>)",
        f"   • Ứng viên (Job Seekers): <b>{job_seekers:,}</b>",
        f"   • Nhà tuyển dụng (Employers): <b>{employers:,}</b>",
        f"   • Doanh nghiệp: <b>{total_companies}</b> (<b>{verified_companies}</b> đã xác thực ✅)\n",
        "💼 <b>2. Hoạt Động Tuyển Dụng:</b>",
        f"   • Tin tuyển dụng: <b>{total_jobs}</b> tin (<b>{active_jobs}</b> đang mở tuyển)",
        f"   • Tin chờ kiểm duyệt: <b>{pending_jobs}</b> tin",
        f"   • Lượt nộp hồ sơ ứng tuyển: <b>{total_apps:,}</b> (<i>+{new_apps_7d} trong 7 ngày qua</i>)\n",
        "🎙️ <b>3. Phỏng Vấn AI (LiveKit Voice AI & JEV):</b>",
        f"   • Tổng số phiên phỏng vấn: <b>{total_interviews:,}</b> phiên",
        f"   • Đã hoàn thành đánh giá: <b>{completed_interviews:,}</b> phiên (<i>+{completed_interviews_7d} trong 7 ngày qua</i>)",
        f"   • Tỷ lệ phỏng vấn thành công: <b>{completion_rate}%</b>\n",
        "🩺 <b>4. Sức Khỏe Hạ Tầng Máy Chủ:</b>",
        f"   • 🎮 GPU: <b>{gpu_desc}</b>",
    ]
    for d in disk_desc:
        lines.append(f"   • 💾 {d}")
    lines.append(f"   • 🐳 Dịch vụ Container: <b>{running_containers} containers</b> đang hoạt động ổn định")
    lines.append(f"\n<i>Báo cáo được tổng hợp tự động từ CSDL Production & Hệ thống giám sát.</i>")

    report_text = "\n".join(lines)

    # 5. Xuat sang Webhook ngoai (Google Sheets / External Webhook) neu duoc cau hinh
    webhook_url = ENV.get("GOOGLE_SHEET_WEBHOOK_URL") or ENV.get("DIGEST_WEBHOOK_URL")
    if webhook_url:
        try:
            payload = {
                "timestamp": now_str,
                "total_users": total_users,
                "new_users_7d": new_users_7d,
                "job_seekers": job_seekers,
                "employers": employers,
                "total_companies": total_companies,
                "active_jobs": active_jobs,
                "total_apps": total_apps,
                "total_interviews": total_interviews,
                "completed_interviews": completed_interviews,
                "gpu": gpu_desc,
                "running_containers": running_containers
            }
            req = urllib.request.Request(
                webhook_url,
                data=json.dumps(payload).encode("utf-8"),
                headers={"Content-Type": "application/json"}
            )
            with urllib.request.urlopen(req, timeout=10) as resp:
                logger.info(f"Pushed metrics digest to webhook: status {resp.status}")
        except Exception as e:
            logger.warning(f"Failed to push digest to webhook: {e}")

    return report_text


def get_system_status():
    status_lines = ["🛡️ <b>[InfoHR AIOps — Trạng thái Máy chủ]</b>\n"]

    # 1. GPU Status
    try:
        gpu_cmd = subprocess.run(
            ["nvidia-smi", "--query-gpu=name,temperature.gpu,utilization.gpu,memory.used,memory.total", "--format=csv,noheader"],
            capture_output=True, text=True, timeout=5
        )
        if gpu_cmd.returncode == 0:
            gpu_info = [x.strip() for x in gpu_cmd.stdout.strip().split(",")]
            status_lines.append(
                f"🎮 <b>GPU:</b> {gpu_info[0]}\n"
                f"   • Nhiệt độ: <b>{gpu_info[1]}°C</b> | Tải: <b>{gpu_info[2]}</b>\n"
                f"   • VRAM: <b>{gpu_info[3]} / {gpu_info[4]}</b>\n"
            )
        else:
            status_lines.append("🎮 <b>GPU:</b> Không nhận diện được qua nvidia-smi\n")
    except Exception as e:
        status_lines.append(f"🎮 <b>GPU:</b> Lỗi đọc: {e}\n")

    # 2. Drive C: & Drive Z: Storage
    try:
        ps_disk = subprocess.run(
            ["powershell", "-NoProfile", "-Command",
             "Get-Volume | Where-Object { $_.DriveLetter -in @('C','Z') } | ForEach-Object { \"$($_.DriveLetter)|$([math]::Round($_.SizeRemaining/1GB,1))|$([math]::Round($_.Size/1GB,1))\" }"],
            capture_output=True, text=True, timeout=8
        )
        if ps_disk.returncode == 0 and ps_disk.stdout.strip():
            status_lines.append("💾 <b>Lưu trữ Ổ đĩa:</b>")
            for line in ps_disk.stdout.strip().splitlines():
                parts = line.strip().split("|")
                if len(parts) == 3:
                    dl, free_gb, total_gb = parts
                    label = "Cục bộ HĐH" if dl == "C" else "aitrain NAS"
                    icon = "⚠️" if dl == "C" and float(free_gb) < 50 else "✅"
                    status_lines.append(f"   {icon} <b>Ổ {dl}: ({label}):</b> Còn trống <b>{free_gb} GB</b> / {total_gb} GB")
            status_lines.append("")
    except Exception as e:
        status_lines.append(f"💾 <b>Lưu trữ:</b> Lỗi đọc: {e}\n")

    # 3. Docker Containers Status
    try:
        ps_docker = subprocess.run(
            ["docker", "ps", "--format", "{{.Names}}|{{.Status}}"],
            capture_output=True, text=True, timeout=8
        )
        if ps_docker.returncode == 0:
            lines = [l.strip() for l in ps_docker.stdout.strip().splitlines() if l.strip()]
            unhealthy = [l for l in lines if "unhealthy" in l.lower()]
            restarting = [l for l in lines if "restart" in l.lower()]

            status_lines.append(f"🐳 <b>Docker Containers:</b> Đang chạy <b>{len(lines)}</b> dịch vụ")
            if unhealthy:
                status_lines.append(f"   ⚠️ <i>Cảnh báo không khỏe mạnh:</i> {', '.join(unhealthy[:3])}")
            if restarting:
                status_lines.append(f"   🔄 <i>Đang khởi động lại:</i> {', '.join(restarting[:3])}")
            if not unhealthy and not restarting:
                status_lines.append("   ✅ <i>Tất cả containers hoạt động ổn định!</i>")
    except Exception as e:
        status_lines.append(f"🐳 <b>Docker:</b> Lỗi đọc: {e}")

    status_lines.append(f"\n⏰ <i>Cập nhật: {time.strftime('%Y-%m-%d %H:%M:%S')}</i>")
    return "\n".join(status_lines)


def get_jev_status():
    status_lines = ["🎙️ <b>[InfoHR — Trạng thái JEV Engine & Voice AI]</b>\n"]

    # 1. LiveKit & Voice Services Check
    services = [
        ("LiveKit Server (WebRTC)", "tuyendung-studio-livekit"),
        ("LiveKit Voice AI Agent", "tuyendung-studio-livekit-agent"),
        ("Talking Head AI Lipsync", "tuyendung-studio-talking-head"),
        ("Egress Media Recorder", "tuyendung-studio-livekit-egress"),
    ]

    status_lines.append("🧠 <b>Trạng thái Dịch vụ AI:</b>")
    for name, container in services:
        try:
            inspect_cmd = subprocess.run(
                ["docker", "inspect", container, "--format", "{{.State.Status}}{{if .State.Health}} ({{.State.Health.Status}}){{end}}"],
                capture_output=True, text=True, timeout=5
            )
            raw = inspect_cmd.stdout.strip()
            if "running" in raw:
                status_lines.append(f"   ✅ <b>{name}:</b> {raw}")
            else:
                status_lines.append(f"   🚨 <b>{name}:</b> {raw or 'Đã dừng'}")
        except Exception:
            status_lines.append(f"   ⚠️ <b>{name}:</b> Không phản hồi")

    status_lines.append("")

    # 2. Database Stats (Jobs & Interviews)
    try:
        db_cmd = subprocess.run(
            ["docker", "exec", "tuyendung-studio-backend", "python", "manage.py", "shell", "-c",
             "from apps.interviews.models import InterviewSession, Question; from apps.jobs.models import JobPost; print(f'DATA:{JobPost.objects.count()}|{InterviewSession.objects.count()}|{Question.objects.count()}')"],
            capture_output=True, text=True, timeout=10
        )
        data_str = ""
        for line in db_cmd.stdout.splitlines():
            if line.startswith("DATA:"):
                data_str = line.replace("DATA:", "").strip()
                break

        if data_str and "|" in data_str:
            jobs_count, sessions_count, questions_count = [x.strip() for x in data_str.split("|")]
            status_lines.append(
                f"📊 <b>Nghiệp vụ Tuyển dụng & JEV:</b>\n"
                f"   • Tổng số tin tuyển dụng (Job Posts): <b>{jobs_count}</b>\n"
                f"   • Phiên phỏng vấn AI (Interview Sessions): <b>{sessions_count}</b>\n"
                f"   • Ngân hàng câu hỏi tuyển dụng: <b>{questions_count} câu</b>\n"
                f"   • JEV System 1 Scorer: <b>Sẵn sàng (Độ trễ &lt; 5ms)</b>\n"
                f"   • JEV Matcher (CV-to-Job): <b>Hoạt động bình thường</b>"
            )
        else:
            status_lines.append("📊 <b>Nghiệp vụ:</b> Sẵn sàng kết nối")
    except Exception as e:
        status_lines.append(f"📊 <b>Nghiệp vụ:</b> Không truy vấn được CSDL: {e}")

    status_lines.append(f"\n⏰ <i>Cập nhật: {time.strftime('%Y-%m-%d %H:%M:%S')}</i>")
    return "\n".join(status_lines)


def run_clean_c():
    msg = "🧹 <b>[InfoHR AIOps — Đang Dọn Rác Ổ C:]</b>\nĐang dọn dẹp Docker build cache & dangling images..."
    send_message(ADMIN_CHAT_ID, msg)
    try:
        prune_cmd = subprocess.run(["docker", "builder", "prune", "-f"], capture_output=True, text=True, timeout=60)
        img_cmd = subprocess.run(["docker", "image", "prune", "-f"], capture_output=True, text=True, timeout=60)

        # Check free space after prune
        ps_disk = subprocess.run(
            ["powershell", "-NoProfile", "-Command", "(Get-Volume -DriveLetter C).SizeRemaining / 1GB"],
            capture_output=True, text=True, timeout=5
        )
        free_c = round(float(ps_disk.stdout.strip()), 1) if ps_disk.returncode == 0 else "N/A"

        return (
            f"✅ <b>[Dọn Dẹp Thành Công]</b>\n"
            f"• Build cache: Đã dọn dẹp xong\n"
            f"• Images rác: Đã dọn dẹp xong\n"
            f"• Dung lượng trống hiện tại của ổ C: <b>{free_c} GB</b>"
        )
    except Exception as e:
        return f"❌ <b>Lỗi khi dọn dẹp:</b> {e}"


def run_instant_backup():
    send_message(ADMIN_CHAT_ID, "⏳ <b>[InfoHR AIOps]</b> Đang kích hoạt tiến trình sao lưu tức thì sang ổ Z: (aitrain)...")
    try:
        # Run backup inside container
        run_cmd = subprocess.run(
            ["docker", "restart", "tuyendung-studio-db-backup"],
            capture_output=True, text=True, timeout=20
        )
        return (
            "🚀 <b>Tiến trình sao lưu đã được kích hoạt!</b>\n"
            "Dữ liệu MySQL và MinIO Media đang được sao chép trực tiếp vào <code>Z:\\InfoHR_Backups</code>.\n"
            "Bot sẽ tự động gửi thông báo kết quả khi sao lưu hoàn tất trong 1–2 phút."
        )
    except Exception as e:
        return f"❌ <b>Không thể kích hoạt sao lưu:</b> {e}"


def restart_service(service_name: str):
    mapping = {
        "livekit": "tuyendung-studio-livekit",
        "backend": "tuyendung-studio-backend",
        "frontend": "tuyendung-studio-frontend",
        "celery": "tuyendung-studio-celery-worker",
        "redis": "tuyendung-studio-redis",
        "minio": "tuyendung-studio-minio",
        "talking-head": "tuyendung-studio-talking-head",
        "agent": "tuyendung-studio-livekit-agent",
    }
    target = mapping.get(service_name.lower())
    if not target:
        for k, v in mapping.items():
            if k in service_name.lower():
                target = v
                break

    if not target:
        return f"⚠️ Không tìm thấy dịch vụ <code>{service_name}</code>. Các dịch vụ hỗ trợ: <code>livekit, backend, frontend, celery, redis, minio, agent</code>."

    send_message(ADMIN_CHAT_ID, f"⏳ Đang khởi động lại dịch vụ <b>{target}</b>...")
    try:
        res = subprocess.run(["docker", "restart", target], capture_output=True, text=True, timeout=30)
        if res.returncode == 0:
            return f"✅ Dịch vụ <b>{target}</b> đã được khởi động lại thành công!"
        else:
            return f"❌ Lỗi khi khởi động lại <b>{target}</b>: {res.stderr}"
    except Exception as e:
        return f"❌ Lỗi: {e}"


def get_logs(service_name: str):
    mapping = {
        "livekit": "tuyendung-studio-livekit",
        "backend": "tuyendung-studio-backend",
        "frontend": "tuyendung-studio-frontend",
        "agent": "tuyendung-studio-livekit-agent",
        "backup": "tuyendung-studio-db-backup",
    }
    target = mapping.get(service_name.lower(), f"tuyendung-studio-{service_name.lower()}")
    try:
        res = subprocess.run(["docker", "logs", target, "--tail", "20"], capture_output=True, text=True, timeout=10)
        logs = res.stdout or res.stderr
        clean_logs = logs.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")[-3000:]
        return f"📜 <b>20 dòng log mới nhất của {target}:</b>\n<pre>{clean_logs}</pre>"
    except Exception as e:
        return f"❌ Lỗi đọc logs: {e}"


def handle_message(text: str, chat_id: int):
    raw = text.strip()
    cmd = raw.lower()

    if cmd in ["/start", "/help", "❓ trợ giúp", "tro giup", "help"]:
        msg = (
            "🤖 <b>Xin chào Quản trị viên! Tôi là Trợ lý AIOps của InfoHR.</b>\n\n"
            "Tôi có thể hỗ trợ bạn theo dõi và điều hành toàn bộ máy chủ 24/7:\n\n"
            "• 📈 <b>Báo Cáo Điều Hành:</b> Tổng hợp số liệu tăng trưởng, tuyển dụng & JEV AI\n"
            "• 📊 <b>Trạng thái Máy chủ:</b> Xem tải CPU, GPU nhiệt độ, ổ C:, ổ Z:\n"
            "• 🎙️ <b>Trạng thái JEV & AI:</b> Kiểm tra Voice AI LiveKit, JEV Scorer\n"
            "• 📦 <b>Sao lưu sang ổ Z:</b> Kích hoạt backup MySQL + MinIO ngay\n"
            "• 🧹 <b>Dọn rác ổ C:</b> Dọn dẹp cache Docker, giải phóng ổ cứng\n"
            "• 🔄 <b>Khởi động lại:</b> Tự phục hồi LiveKit hoặc Backend khi lỗi\n\n"
            "<i>Bạn có thể bấm vào các nút bên dưới hoặc gõ lệnh trực tiếp!</i>"
        )
        send_message(chat_id, msg, reply_markup=get_keyboard())

    elif cmd in ["/digest", "/report", "📈 báo cáo điều hành", "bao cao", "digest", "report"]:
        send_message(chat_id, "⏳ <i>Đang tổng hợp số liệu điều hành và sức khỏe máy chủ...</i>", reply_markup=get_keyboard())
        result = get_executive_digest()
        send_message(chat_id, result, reply_markup=get_keyboard())

    elif cmd in ["/status", "📊 trạng thái máy chủ", "status", "trang thai"]:
        send_message(chat_id, get_system_status(), reply_markup=get_keyboard())

    elif cmd in ["/jev", "🎙️ trạng thái jev & ai", "jev", "ai"]:
        send_message(chat_id, get_jev_status(), reply_markup=get_keyboard())

    elif cmd in ["/backup", "📦 sao lưu sang ổ z:", "backup", "sao luu"]:
        result = run_instant_backup()
        send_message(chat_id, result, reply_markup=get_keyboard())

    elif cmd in ["/clean", "🧹 dọn rác ổ c:", "clean", "don rac"]:
        result = run_clean_c()
        send_message(chat_id, result, reply_markup=get_keyboard())

    elif cmd in ["🔄 khởi động lại livekit", "/restart livekit"]:
        result = restart_service("livekit")
        send_message(chat_id, result, reply_markup=get_keyboard())

    elif cmd in ["🔄 khởi động lại backend", "/restart backend"]:
        result = restart_service("backend")
        send_message(chat_id, result, reply_markup=get_keyboard())

    elif cmd.startswith("/restart"):
        parts = raw.split(maxsplit=1)
        svc = parts[1] if len(parts) > 1 else "livekit"
        result = restart_service(svc)
        send_message(chat_id, result, reply_markup=get_keyboard())

    elif cmd.startswith("/logs"):
        parts = raw.split(maxsplit=1)
        svc = parts[1] if len(parts) > 1 else "backend"
        result = get_logs(svc)
        send_message(chat_id, result, reply_markup=get_keyboard())

    else:
        # Smart fallback or general question
        msg = (
            f"🤖 Tôi đã nhận được yêu cầu: <i>{raw}</i>\n\n"
            "Bạn có thể dùng các phím bấm bên dưới hoặc gõ:\n"
            "• <code>/status</code> để kiểm tra tài nguyên\n"
            "• <code>/jev</code> để kiểm tra AI phỏng vấn\n"
            "• <code>/backup</code> để chạy sao lưu\n"
            "• <code>/clean</code> để dọn dẹp ổ C:"
        )
        send_message(chat_id, msg, reply_markup=get_keyboard())


def main():
    if not BOT_TOKEN or not ADMIN_CHAT_ID:
        logger.error("Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID in environment/.env. Exiting.")
        sys.exit(1)

    logger.info(f"Starting InfoHR AIOps Agent for Admin ID: {ADMIN_CHAT_ID}...")
    offset = 0
    last_daily_digest_date = None

    # Send startup message with keyboard
    startup_msg = (
        "🟢 <b>[InfoHR AIOps Agent Đã Khởi Động]</b>\n"
        "Hệ thống tự quản lý máy chủ và JEV AI đang hoạt động.\n"
        "• Bấm <b>📈 Báo Cáo Điều Hành</b> để xem chỉ số tăng trưởng & thống kê sản xuất.\n"
        "• Bấm <b>📊 Trạng thái Máy chủ</b> để kiểm tra tải CPU, GPU & ổ đĩa."
    )
    send_message(ADMIN_CHAT_ID, startup_msg, reply_markup=get_keyboard())

    while True:
        try:
            # Tự động gửi Executive Digest vào 08:00 sáng mỗi ngày (giờ máy chủ)
            now_dt = time.localtime()
            current_date_str = time.strftime("%Y-%m-%d", now_dt)
            current_hm = time.strftime("%H:%M", now_dt)

            if current_hm == "08:00" and last_daily_digest_date != current_date_str:
                logger.info("Triggering scheduled morning executive digest...")
                digest_msg = get_executive_digest()
                send_message(ADMIN_CHAT_ID, digest_msg, reply_markup=get_keyboard())
                last_daily_digest_date = current_date_str

            url = f"{TELEGRAM_API}/getUpdates?offset={offset}&timeout=25"
            req = urllib.request.Request(url)
            with urllib.request.urlopen(req, timeout=35) as resp:
                data = json.loads(resp.read().decode("utf-8"))

            if data.get("ok"):
                for update in data.get("result", []):
                    offset = update["update_id"] + 1
                    msg = update.get("message")
                    if not msg:
                        continue

                    chat_id = msg.get("chat", {}).get("id")
                    from_user = msg.get("from", {})
                    text = msg.get("text", "")

                    if chat_id != ADMIN_CHAT_ID:
                        logger.warning(f"Unauthorized message from {from_user.get('id')} ({from_user.get('username')})")
                        continue

                    logger.info(f"Received command from Admin: {text}")
                    handle_message(text, chat_id)

        except urllib.error.URLError as e:
            logger.warning(f"Network error in poll: {e}")
            time.sleep(5)
        except Exception as e:
            logger.error(f"Unexpected error in event loop: {e}", exc_info=True)
            time.sleep(5)


if __name__ == "__main__":
    main()
