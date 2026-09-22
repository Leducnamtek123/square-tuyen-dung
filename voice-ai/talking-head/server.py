"""FastAPI Server for Real-Time Talking Head AI Lip-Sync Service.

Cung cấp các API:
- GET  /health và /api/v1/avatar/health: Kiểm tra tình trạng server, GPU và CUDA.
- GET  /api/v1/avatar/characters: Trả về danh sách avatar và trạng thái các clip hành động.
- POST /api/v1/avatar/lipsync/render: Render video lipsync từ file âm thanh và action video.
"""

from __future__ import annotations

import logging
import os
import tempfile
import time
import uuid
from pathlib import Path
from typing import Any, Optional

import httpx
import torch
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

from core.lipsync_engine import LipSyncEngine

# Cấu hình logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("talking_head.server")

BASE_DIR = Path(__file__).resolve().parent
MEDIA_DIR = BASE_DIR / "media"
MEDIA_DIR.mkdir(parents=True, exist_ok=True)
RENDERS_DIR = MEDIA_DIR / "renders"
RENDERS_DIR.mkdir(parents=True, exist_ok=True)
DATA_DIR = BASE_DIR / "data"

URL_PREFIX = os.getenv("URL_PREFIX", "").rstrip("/")

app = FastAPI(
    title="InfoHR Real-Time Talking Head AI Service",
    description="Wav2Lip GPU Lip-Sync & Video Synthesis Microservice for Square Tuyển Dụng",
    version="1.0.0",
)

# Cấu hình CORS cho phép Frontend truy cập
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount thư mục media tĩnh cho video rendering và avatar clips
app.mount("/media", StaticFiles(directory=str(MEDIA_DIR)), name="media")

# Khởi tạo LipSync Engine
engine = LipSyncEngine(
    checkpoint_path=str(BASE_DIR / "models" / "wav2lip.pth"),
    fallback_mode=True,
)


class RenderRequest(BaseModel):
    audio_url: str = Field(..., description="URL hoặc đường dẫn file âm thanh câu thoại (.wav hoặc .mp3)")
    avatar_id: str = Field("ng_c_linh", description="Mã nhân vật avatar (ví dụ ng_c_linh)")
    base_action: str = Field("idle", description="Cử chỉ nền: idle, nod, thinking, wave, thanks_wave")
    sample_rate: int = Field(16000, description="Tần số lấy mẫu âm thanh (Hz)")


class RenderResponse(BaseModel):
    status: str
    video_url: str
    duration_sec: float
    inference_time_ms: float


@app.get("/health")
@app.get("/api/v1/avatar/health")
async def health_check() -> dict[str, Any]:
    """Kiểm tra sức khỏe dịch vụ và khả năng tăng tốc GPU."""
    cuda_avail = torch.cuda.is_available()
    device_name = torch.cuda.get_device_name(0) if cuda_avail else "CPU"
    return {
        "status": "healthy",
        "service": "talking-head",
        "device": engine.device,
        "cuda_available": cuda_avail,
        "gpu_name": device_name,
        "real_model_loaded": engine.is_real_model_loaded,
    }


@app.get("/api/v1/avatar/characters")
async def get_characters() -> dict[str, list[dict[str, Any]]]:
    """Trả về danh sách các nhân vật và tình trạng sẵn sàng của các video hành động."""
    character_definitions = [
        {
            "id": "ng_c_linh",
            "name": "Ngọc Linh HR",
            "actions": ["idle", "nod", "thinking", "wave", "thanks_wave", "speaking"],
        }
    ]

    result = []
    for char in character_definitions:
        char_id = char["id"]
        actions_list = []
        for act in char["actions"]:
            # Kiểm tra xem video file có tồn tại trong media hoặc data
            media_path = MEDIA_DIR / "avatars" / char_id / "actions" / f"{act}.mp4"
            data_path = DATA_DIR / "avatars" / char_id / "actions" / f"{act}.mp4"
            ready = media_path.is_file() or data_path.is_file()
            actions_list.append({
                "name": act,
                "ready": ready,
                "url": f"{URL_PREFIX}/media/avatars/{char_id}/actions/{act}.mp4" if URL_PREFIX else f"/media/avatars/{char_id}/actions/{act}.mp4",
            })
        result.append({
            "id": char_id,
            "name": char["name"],
            "actions": actions_list,
        })

    return {"characters": result}


@app.post("/api/v1/avatar/lipsync/render", response_model=RenderResponse)
async def render_lipsync(req: RenderRequest) -> RenderResponse:
    """Render video đồng bộ khẩu hình từ audio và reference video hành động."""
    avatar_id = req.avatar_id.strip() or "ng_c_linh"
    base_action = req.base_action.strip() or "idle"

    # 1. Tìm action reference video
    action_video_paths = [
        MEDIA_DIR / "avatars" / avatar_id / "actions" / f"{base_action}.mp4",
        DATA_DIR / "avatars" / avatar_id / "actions" / f"{base_action}.mp4",
        MEDIA_DIR / "avatars" / avatar_id / "actions" / "idle.mp4",
        DATA_DIR / "avatars" / avatar_id / "actions" / "idle.mp4",
    ]
    ref_video = next((p for p in action_video_paths if p.is_file()), None)
    if not ref_video:
        raise HTTPException(
            status_code=404,
            detail=f"Không tìm thấy video hành động '{base_action}' cho nhân vật '{avatar_id}'",
        )

    # 2. Tìm file coords .coords_256.npy hoặc coords_256.npy
    coords_candidates = [
        ref_video.parent / f"{base_action}.mp4.coords_256.npy",
        ref_video.parent / f".{base_action}.mp4.coords_256.npy",
        ref_video.parent / "coords_256.npy",
        ref_video.parent / ".coords_256.npy",
        DATA_DIR / "avatars" / avatar_id / "actions" / f"{base_action}.mp4.coords_256.npy",
        DATA_DIR / "avatars" / avatar_id / "actions" / f".{base_action}.mp4.coords_256.npy",
        DATA_DIR / "avatars" / avatar_id / "actions" / "coords_256.npy",
        DATA_DIR / "avatars" / avatar_id / "actions" / ".coords_256.npy",
    ]
    coords_file = next((p for p in coords_candidates if p.is_file()), None)

    # 3. Chuẩn bị file âm thanh (tải về nếu là URL)
    temp_audio_file: Optional[Path] = None
    audio_path_str: str

    try:
        if req.audio_url.startswith("http://") or req.audio_url.startswith("https://"):
            logger.info("Đang tải file âm thanh từ URL: %s", req.audio_url)
            async with httpx.AsyncClient(timeout=30.0) as client:
                res = await client.get(req.audio_url)
                if res.status_code != 200:
                    raise HTTPException(
                        status_code=400,
                        detail=f"Tải audio thất bại (HTTP {res.status_code}): {req.audio_url}",
                    )
                with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
                    tmp.write(res.content)
                    temp_audio_file = Path(tmp.name)
            audio_path_str = str(temp_audio_file)
        else:
            # File cục bộ
            local_audio = Path(req.audio_url)
            if not local_audio.is_file():
                # Thử relative từ project root
                project_local = BASE_DIR / req.audio_url
                if project_local.is_file():
                    local_audio = project_local
                else:
                    raise HTTPException(
                        status_code=404,
                        detail=f"Tệp âm thanh cục bộ không tồn tại: {req.audio_url}",
                    )
            audio_path_str = str(local_audio)

        # 4. Tạo đường dẫn xuất video
        render_id = f"{avatar_id}_{uuid.uuid4().hex[:10]}"
        output_filename = f"lipsync_{render_id}.mp4"
        output_filepath = RENDERS_DIR / output_filename

        # 5. Gọi Engine suy luận & pipe FFmpeg
        out_path, duration_sec, inference_time_ms = engine.infer_and_render(
            audio_path=audio_path_str,
            video_path=str(ref_video),
            coords_path=str(coords_file) if coords_file else None,
            output_path=str(output_filepath),
        )

        relative_video_url = f"{URL_PREFIX}/media/renders/{output_filename}" if URL_PREFIX else f"/media/renders/{output_filename}"

        return RenderResponse(
            status="success",
            video_url=relative_video_url,
            duration_sec=round(duration_sec, 2),
            inference_time_ms=round(inference_time_ms, 2),
        )
    finally:
        # Dọn dẹp file tạm audio nếu tải về
        if temp_audio_file and temp_audio_file.is_file():
            try:
                temp_audio_file.unlink()
            except Exception:
                pass


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", "8010"))
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=True)
