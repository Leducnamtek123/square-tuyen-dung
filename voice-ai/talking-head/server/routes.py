###############################################################################
#  服务器路由 — 统一异常处理的 API 路由
###############################################################################

import os
import json
import time
import uuid
import hashlib
import tempfile
import asyncio
import httpx
from aiohttp import web

from utils.logger import logger
from core.lipsync_engine import LipSyncEngine, get_audio_duration


# ─── 路由工具函数 ──────────────────────────────────────────────────────────

def json_ok(data=None):
    """返回成功 JSON 响应"""
    body = {"code": 0, "msg": "ok"}
    if data is not None:
        body["data"] = data
    return web.Response(
        content_type="application/json",
        text=json.dumps(body),
    )


def json_error(msg: str, code: int = -1):
    """返回错误 JSON 响应"""
    return web.Response(
        content_type="application/json",
        text=json.dumps({"code": code, "msg": str(msg)}),
    )


from server.session_manager import session_manager
from server.avatar_routes import setup_avatar_routes

def get_session(request, sessionid: str):
    """从 app 中获取 session 实例"""
    return session_manager.get_session(sessionid)


# ─── 路由处理函数 ──────────────────────────────────────────────────────────

async def human(request):
    """文本输入（echo/chat 模式），支持 voice/emotion 参数"""
    try:
        params: dict = await request.json()

        sessionid: str = params.get('sessionid', '')
        avatar_session = get_session(request, sessionid) if sessionid else None
        if avatar_session is None:
            active_sessions = [s for s in session_manager.sessions.values() if s is not None]
            if active_sessions:
                avatar_session = active_sessions[-1]
            else:
                logger.info("human route: no active WebRTC session found for sessionid=%s", sessionid)
                return json_ok(data={"notice": "no active WebRTC session"})

        if params.get('interrupt'):
            avatar_session.flush_talk()

        datainfo = {}
        if params.get('tts'):  # tts 参数透传（voice, emotion 等）
            datainfo['tts'] = params.get('tts')

        if params['type'] == 'echo':
            avatar_session.put_msg_txt(params['text'], datainfo)
        elif params['type'] == 'chat':
            llm_response = request.app.get("llm_response")
            if llm_response:
                asyncio.get_event_loop().run_in_executor(
                    None, llm_response, params['text'], avatar_session, datainfo
                )

        return json_ok()
    except Exception as e:
        logger.exception('human route exception:')
        return json_error(str(e))


async def interrupt_talk(request):
    """打断当前说话"""
    try:
        params = await request.json()
        sessionid = params.get('sessionid', '')
        avatar_session = get_session(request, sessionid)
        if avatar_session is None:
            return json_error("session not found")
        avatar_session.flush_talk()
        return json_ok()
    except Exception as e:
        logger.exception('interrupt_talk exception:')
        return json_error(str(e))


async def humanaudio(request):
    """上传音频文件"""
    try:
        form = await request.post()
        sessionid = str(form.get('sessionid', ''))
        fileobj = form["file"]
        filebytes = fileobj.file.read()

        datainfo = {}

        avatar_session = get_session(request, sessionid) if sessionid else None
        if avatar_session is None:
            active_sessions = [s for s in session_manager.sessions.values() if s is not None]
            if active_sessions:
                avatar_session = active_sessions[-1]
            else:
                return json_error("session not found")
        avatar_session.put_audio_file(filebytes, datainfo)
        return json_ok()
    except Exception as e:
        logger.exception('humanaudio exception:')
        return json_error(str(e))


async def set_audiotype(request):
    """设置自定义状态（动作编排）"""
    try:
        params = await request.json()
        sessionid = params.get('sessionid', '')
        avatar_session = get_session(request, sessionid)
        if avatar_session is None:
            return json_error("session not found")
        avatar_session.set_custom_state(params['audiotype'])
        return json_ok()
    except Exception as e:
        logger.exception('set_audiotype exception:')
        return json_error(str(e))


async def record(request):
    """录制控制"""
    try:
        params = await request.json()
        sessionid = params.get('sessionid', '')
        avatar_session = get_session(request, sessionid)
        if avatar_session is None:
            return json_error("session not found")
        if params['type'] == 'start_record':
            avatar_session.start_recording()
        elif params['type'] == 'end_record':
            avatar_session.stop_recording()
        return json_ok()
    except Exception as e:
        logger.exception('record exception:')
        return json_error(str(e))


async def is_speaking(request):
    """查询是否正在说话"""
    params = await request.json()
    sessionid = params.get('sessionid', '')
    avatar_session = get_session(request, sessionid)
    if avatar_session is None:
        return json_error("session not found")
    return json_ok(data=avatar_session.is_speaking())

async def sse_handler(request):
    """SSE 事件流，推送服务器状态更新到客户端"""
    sessionid = request.query.get('sessionid', '')
    avatar_session = session_manager.get_session(sessionid)
    if avatar_session is None:
        return json_error("session not found")

    response = web.StreamResponse(
        status=200,
        reason='OK',
        headers={
            'Content-Type': 'text/event-stream',
            'Cache-Control': 'no-cache',
            'Connection': 'keep-alive',
            'Access-Control-Allow-Origin': '*',
        }
    )
    await response.prepare(request)

    import queue
    msgqueue = queue.Queue()
    avatar_session.add_msgqueue(msgqueue)

    try:
        while True:
            try:
                msg = msgqueue.get_nowait()
                await response.write(f"data: {msg}\n\n".encode('utf-8'))
            except queue.Empty:
                await asyncio.sleep(0.01)
    except (asyncio.CancelledError, ConnectionResetError):
        logger.info('SSE connection closed for session: %s', sessionid)
    finally:
        if msgqueue in avatar_session.msgqueues:
            avatar_session.msgqueues.remove(msgqueue)

    return response


async def admin_config(request):
    """Admin: 获取全局配置参数"""
    try:
        opt = request.app.get("opt")
        if opt:
            return json_ok(data={"config": vars(opt)})
        return json_error("Config not found")
    except Exception as e:
        logger.exception('admin_config exception:')
        return json_error(str(e))


async def admin_sessions(request):
    """Admin: 获取活跃的会话及其配置"""
    try:
        sessions_info = []
        for sid, avatar_session in session_manager.sessions.items():
            if avatar_session:
                s_opt = getattr(avatar_session, 'opt', None)
                s_data = {
                    "sessionid": sid,
                    "speaking": avatar_session.is_speaking() if hasattr(avatar_session, 'is_speaking') else False,
                    "recording": getattr(avatar_session, 'recording', False),
                }
                if s_opt:
                    s_data.update({
                        "model": getattr(s_opt, "model", ""),
                        "avatar_id": getattr(s_opt, "avatar_id", ""),
                        "REF_FILE": getattr(s_opt, "REF_FILE", ""),
                        "transport": getattr(s_opt, "transport", ""),
                        "batch_size": getattr(s_opt, "batch_size", 0),
                        "customopt": getattr(s_opt, "customopt", []),
                    })
                sessions_info.append(s_data)
        return json_ok(data={"sessions": sessions_info})
    except Exception as e:
        logger.exception('admin_sessions exception:')
        return json_error(str(e))


# ─── 路由注册 ──────────────────────────────────────────────────────────────

async def index(request):
    """Trang gốc: Trả về trạng thái dịch vụ Aila AI Lipsync Engine"""
    return json_ok({
        "service": "aila-talking-head",
        "name": "Aila Realtime Lipsync & Talking Head Engine",
        "brand": "Aila (InfoHR)",
        "status": "online",
    })


async def health_check(request):
    import torch
    cuda_avail = torch.cuda.is_available()
    device_name = torch.cuda.get_device_name(0) if cuda_avail else "CPU"
    return json_ok({
        "status": "healthy",
        "service": "aila-talking-head",
        "device": "cuda" if cuda_avail else "cpu",
        "cuda_available": cuda_avail,
        "gpu_name": device_name,
        "engine": "Aila Neural Lipsync Engine RTX 4070 Ti SUPER",
    })

async def characters_list(request):
    return json_ok({
        "characters": [
            {
                "id": "ng_c_linh",
                "name": "Ngọc Linh HR",
                "actions": [
                    {"name": "idle", "ready": True},
                    {"name": "nod", "ready": True},
                    {"name": "thinking", "ready": True},
                    {"name": "wave", "ready": True},
                    {"name": "thanks_wave", "ready": True},
                ]
            }
        ]
    })


_lipsync_engine = None
_render_lock = asyncio.Lock()

def get_lipsync_engine():
    global _lipsync_engine
    if _lipsync_engine is None:
        checkpoint = "./models/wav2lip.pth"
        if not os.path.exists(checkpoint):
            checkpoint = os.path.join(os.path.dirname(__file__), "..", "models", "wav2lip.pth")
        _lipsync_engine = LipSyncEngine(
            checkpoint_path=checkpoint if os.path.exists(checkpoint) else None,
            fallback_mode=True,
        )
    return _lipsync_engine


async def call_metaconnect_tts(text: str, voice: str = "Trúc Ly") -> bytes:
    """Gọi Metaconnect TTS để sinh âm thanh giọng nói chuẩn tiếng Việt."""
    base_url = (
        os.getenv("TTS_BASE_URL")
        or os.getenv("AI_TTS_BASE_URL")
        or "https://api.metaconnect.vn/v1"
    ).rstrip("/")
    api_key = (
        os.getenv("TTS_API_KEY")
        or os.getenv("AI_TTS_API_KEY")
        or "airp_live_ZX173OjElohx_4xp3OhMBdtNZkfgdGbFxbgIWLTH4LCP8"
    )
    model = os.getenv("TTS_MODEL") or os.getenv("AI_TTS_MODEL") or "tts-vi"
    url = f"{base_url}/audio/speech"
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
        "User-Agent": "curl/7.68.0",
    }
    payload = {
        "model": model,
        "input": text,
        "voice": voice,
        "response_format": "mp3",
    }
    async with httpx.AsyncClient(timeout=30.0, verify=False) as client:
        res = await client.post(url, json=payload, headers=headers)
        if res.status_code != 200:
            raise RuntimeError(f"Metaconnect TTS HTTP {res.status_code}: {res.text[:200]}")
        return res.content


async def render_avatar_lipsync(request):
    """
    POST /api/v1/avatar/lipsync/render
    Tạo video MP4 đồng bộ khẩu hình trực tiếp từ công nghệ AI AILA.
    Hỗ trợ text (gọi Metaconnect TTS), audio file upload hoặc audio URL.
    """
    temp_files = []
    try:
        params = {}
        uploaded_audio_bytes = None

        if request.content_type == 'multipart/form-data':
            reader = await request.multipart()
            while True:
                part = await reader.next()
                if part is None:
                    break
                if part.name in ('audio', 'file'):
                    uploaded_audio_bytes = await part.read()
                else:
                    val = await part.text()
                    params[part.name] = val
        else:
            try:
                params = await request.json()
            except Exception:
                params = {}

        text = params.get('text', '').strip()
        voice = params.get('voice', '').strip() or os.getenv("TTS_VOICE", "Trúc Ly")
        avatar_id = params.get('avatar_id', '').strip() or "ng_c_linh"
        action = params.get('action', '').strip() or "speaking"
        audio_url = params.get('audio_url', '').strip()

        audio_path = None

        os.makedirs("data/record", exist_ok=True)
        os.makedirs("media/renders", exist_ok=True)

        hash_seed = f"{avatar_id}_{action}_{voice}_{text or audio_url}"
        content_hash = hashlib.md5(hash_seed.encode("utf-8")).hexdigest()[:12]
        output_filename = f"lipsync_{content_hash}.mp4"
        output_filepath = os.path.join("data", "record", output_filename)
        relative_url = f"/talking-head/record/{output_filename}"

        # Fast cache check: trả về ngay lập tức nếu câu nói đã được sinh
        if os.path.isfile(output_filepath) and os.path.getsize(output_filepath) > 1000:
            duration_sec = get_audio_duration(output_filepath)
            logger.info("Cache HIT for lipsync render: %s (duration: %.2fs)", relative_url, duration_sec)
            return web.Response(
                content_type="application/json",
                text=json.dumps({
                    "code": 0,
                    "msg": "ok",
                    "video_url": relative_url,
                    "duration": round(duration_sec, 2),
                    "inference_time_ms": 1.0,
                    "cached": True,
                    "data": {
                        "video_url": relative_url,
                        "duration": round(duration_sec, 2),
                        "inference_time_ms": 1.0,
                        "cached": True,
                    }
                }),
            )

        if uploaded_audio_bytes:
            with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp:
                tmp.write(uploaded_audio_bytes)
                audio_path = tmp.name
                temp_files.append(audio_path)
        elif text:
            logger.info("Calling Metaconnect TTS for lipsync render (%d chars, voice=%s)", len(text), voice)
            audio_bytes = await call_metaconnect_tts(text, voice)
            with tempfile.NamedTemporaryFile(suffix=".mp3", delete=False) as tmp:
                tmp.write(audio_bytes)
                audio_path = tmp.name
                temp_files.append(audio_path)
        elif audio_url:
            if audio_url.startswith("http://") or audio_url.startswith("https://"):
                async with httpx.AsyncClient(timeout=30.0, verify=False) as client:
                    resp = await client.get(audio_url)
                    if resp.status_code != 200:
                        return json_error(f"Download audio failed HTTP {resp.status_code}", code=400)
                    with tempfile.NamedTemporaryFile(suffix=".wav", delete=False) as tmp:
                        tmp.write(resp.content)
                        audio_path = tmp.name
                        temp_files.append(audio_path)
            elif os.path.isfile(audio_url):
                audio_path = audio_url
            else:
                return json_error(f"Audio file not found: {audio_url}", code=404)
        else:
            return json_error("Either 'text', 'audio_url', or uploaded audio file is required", code=400)

        # Định vị reference action video và coords
        action_video_candidates = [
            f"data/avatars/{avatar_id}/actions/{action}.mp4",
            f"data/avatars/{avatar_id}/actions/speaking.mp4",
            f"data/avatars/{avatar_id}/actions/idle.mp4",
            f"media/avatars/{avatar_id}/actions/{action}.mp4",
            f"media/avatars/{avatar_id}/actions/idle.mp4",
        ]
        ref_video = next((p for p in action_video_candidates if os.path.isfile(p)), None)
        if not ref_video:
            import glob
            avail_mp4s = glob.glob(f"data/avatars/{avatar_id}/actions/*.mp4")
            if avail_mp4s:
                ref_video = avail_mp4s[0]
            else:
                return json_error(f"No reference action video found for avatar '{avatar_id}'", code=404)

        coords_candidates = [
            f"data/avatars/{avatar_id}/actions/{action}.mp4.coords_256.npy",
            f"data/avatars/{avatar_id}/actions/.{action}.mp4.coords_256.npy",
            f"data/avatars/{avatar_id}/actions/idle.mp4.coords_256.npy",
            f"data/avatars/{avatar_id}/actions/.idle.mp4.coords_256.npy",
            f"data/avatars/{avatar_id}/actions/coords_256.npy",
            f"data/avatars/{avatar_id}/coords.pkl",
        ]
        coords_file = next((p for p in coords_candidates if os.path.isfile(p)), None)

        async with _render_lock:
            # Kiểm tra lại lần 2 trong lock tránh race condition
            if os.path.isfile(output_filepath) and os.path.getsize(output_filepath) > 1000:
                duration_sec = get_audio_duration(output_filepath)
                return web.Response(
                    content_type="application/json",
                    text=json.dumps({
                        "code": 0,
                        "msg": "ok",
                        "video_url": relative_url,
                        "duration": round(duration_sec, 2),
                        "inference_time_ms": 1.0,
                        "cached": True,
                        "data": {
                            "video_url": relative_url,
                            "duration": round(duration_sec, 2),
                            "inference_time_ms": 1.0,
                            "cached": True,
                        }
                    }),
                )

            engine = get_lipsync_engine()
            loop = asyncio.get_event_loop()
            out_path, duration_sec, inference_time_ms = await loop.run_in_executor(
                None,
                engine.infer_and_render,
                audio_path,
                ref_video,
                coords_file,
                output_filepath,
                25,
            )

        render_symlink = os.path.join("media", "renders", output_filename)
        if not os.path.exists(render_symlink) and os.path.exists(output_filepath):
            try:
                import shutil
                shutil.copyfile(output_filepath, render_symlink)
            except Exception:
                pass

        relative_url = f"/talking-head/record/{output_filename}"
        logger.info(
            "Rendered lipsync successfully: %s (duration: %.2fs, inference: %.1fms)",
            relative_url, duration_sec, inference_time_ms
        )

        return web.Response(
            content_type="application/json",
            text=json.dumps({
                "code": 0,
                "msg": "ok",
                "video_url": relative_url,
                "duration": round(duration_sec, 2),
                "inference_time_ms": round(inference_time_ms, 2),
                "data": {
                    "video_url": relative_url,
                    "duration": round(duration_sec, 2),
                    "inference_time_ms": round(inference_time_ms, 2),
                }
            }),
        )

    except Exception as exc:
        logger.exception("render_avatar_lipsync failed:")
        return json_error(str(exc), code=500)
    finally:
        for f in temp_files:
            try:
                if os.path.isfile(f):
                    os.unlink(f)
            except Exception:
                pass


def setup_routes(app):
    """注册所有路由到 aiohttp app"""
    app.router.add_get("/", index)
    app.router.add_get("/health", health_check)
    app.router.add_get("/api/v1/avatar/health", health_check)
    app.router.add_get("/api/v1/avatar/characters", characters_list)
    app.router.add_post("/api/v1/avatar/lipsync/render", render_avatar_lipsync)
    app.router.add_post("/lipsync/render", render_avatar_lipsync)
    app.router.add_post("/human", human)
    app.router.add_post("/humanaudio", humanaudio)
    app.router.add_post("/set_audiotype", set_audiotype)
    app.router.add_post("/record", record)
    app.router.add_post("/interrupt_talk", interrupt_talk)
    app.router.add_post("/is_speaking", is_speaking)
    app.router.add_get("/api/admin/config", admin_config)
    app.router.add_get("/api/admin/sessions", admin_sessions)
    app.router.add_get('/sse', sse_handler)

    # ── Local ASR endpoint (SenseVoice/FunASR) ── Issue #604 ──
    try:
        from server.asr_server import asr_websocket_handler, is_funasr_available
        if is_funasr_available():
            app.router.add_get("/api/asr", asr_websocket_handler)
            logger.info("[ASR] Local SenseVoice ASR endpoint enabled at /api/asr")
        else:
            logger.info("[ASR] funasr not installed — local ASR endpoint disabled "
                        "(pip install funasr modelscope)")
    except Exception as e:
        logger.warning(f"[ASR] Failed to register ASR endpoint: {e}")

    # 注册 avatar 生成相关的路由
    setup_avatar_routes(app)

    os.makedirs("data/record", exist_ok=True)
    os.makedirs("media/renders", exist_ok=True)
    app.router.add_static('/talking-head/record', path='data/record')
    app.router.add_static('/media', path='media')
