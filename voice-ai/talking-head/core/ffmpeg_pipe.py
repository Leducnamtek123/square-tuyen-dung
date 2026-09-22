"""Direct Memory Pipe to FFmpeg for high-definition, zero-loss Lip-Sync video encoding.

Bơm raw BGR24 frames trực tiếp từ RAM vào FFmpeg subprocess qua stdin.
- Codec: libx264 -preset veryfast -crf 17 -pix_fmt yuv420p
- Audio: aac -b:a 192k -shortest
- Tuyệt đối không dùng codec trung gian mp4v
- Không ép -colorspace bt709 cứng để giữ đồng nhất màu với video idle
"""

from __future__ import annotations

import logging
import os
import shutil
import subprocess
from pathlib import Path
from typing import Iterable, Sequence
import numpy as np

logger = logging.getLogger("talking_head.ffmpeg_pipe")


def find_ffmpeg() -> str:
    """Tìm đường dẫn binary ffmpeg trên hệ thống."""
    env = os.getenv("FFMPEG_PATH")
    if env and Path(env).is_file():
        return env
    which = shutil.which("ffmpeg")
    if which:
        return which

    # Các đường dẫn mặc định thông dụng trên Windows
    win_paths = [
        r"C:\ffmpeg\bin\ffmpeg.exe",
        r"C:\Program Files\ffmpeg\bin\ffmpeg.exe",
    ]
    local = os.environ.get("LOCALAPPDATA", "")
    if local:
        winget_base = Path(local) / "Microsoft" / "WinGet" / "Packages"
        if winget_base.is_dir():
            for p in winget_base.glob("Gyan.FFmpeg*/ffmpeg-*/bin/ffmpeg.exe"):
                if p.is_file():
                    return str(p)

    for p in win_paths:
        if Path(p).is_file():
            return str(p)

    return "ffmpeg"


def stream_frames_to_ffmpeg(
    frames: Sequence[np.ndarray] | Iterable[np.ndarray],
    audio_path: str,
    output_path: str,
    fps: int = 25,
    width: int = 1280,
    height: int = 720,
) -> str:
    """Bơm chuỗi khung hình raw BGR trực tiếp vào FFmpeg stdin để xuất video MP4 sắc nét.

    Args:
        frames: Danh sách hoặc generator các khung hình BGR (height, width, 3).
        audio_path: Đường dẫn file âm thanh câu thoại (.wav hoặc .mp3).
        output_path: Đường dẫn tệp video MP4 đầu ra.
        fps: Số khung hình trên giây (mặc định 25).
        width: Chiều rộng video (mặc định 1280).
        height: Chiều cao video (mặc định 720).

    Returns:
        str: Đường dẫn tuyệt đối của video hoàn thành.
    """
    out_file = Path(output_path).resolve()
    out_file.parent.mkdir(parents=True, exist_ok=True)

    audio_file = Path(audio_path).resolve()
    if not audio_file.is_file():
        raise FileNotFoundError(f"Tệp âm thanh không tồn tại: {audio_path}")

    ffmpeg_bin = find_ffmpeg()

    cmd = [
        ffmpeg_bin,
        "-y",
        "-f", "rawvideo",
        "-vcodec", "rawvideo",
        "-s", f"{width}x{height}",
        "-pix_fmt", "bgr24",
        "-r", str(fps),
        "-i", "-",
        "-i", str(audio_file),
        "-c:v", "libx264",
        "-preset", "veryfast",
        "-crf", "17",
        "-pix_fmt", "yuv420p",
        "-c:a", "aac",
        "-b:a", "192k",
        "-shortest",
        str(out_file),
    ]

    logger.info("Executing FFmpeg pipe: %s", " ".join(cmd))

    proc = subprocess.Popen(
        cmd,
        stdin=subprocess.PIPE,
        stdout=subprocess.DEVNULL,
        stderr=subprocess.PIPE,
    )

    frame_count = 0
    try:
        byte_chunks: list[bytes] = []
        for frame in frames:
            # Kiểm tra và điều chỉnh kích thước khung hình nếu chưa khớp
            if frame.shape[0] != height or frame.shape[1] != width:
                import cv2
                frame = cv2.resize(frame, (width, height), interpolation=cv2.INTER_LINEAR)

            # Chuyển đổi mảng numpy C-contiguous sang byte string
            if not frame.flags["C_CONTIGUOUS"]:
                frame = np.ascontiguousarray(frame)

            byte_chunks.append(frame.tobytes())
            frame_count += 1

        raw_data = b"".join(byte_chunks)
        _, stderr = proc.communicate(input=raw_data, timeout=60)
    except Exception as e:
        proc.kill()
        logger.error("Lỗi khi stream raw frames tới FFmpeg: %s", e)
        raise RuntimeError(f"FFmpeg memory pipe error: {e}") from e

    if proc.returncode != 0:
        err_msg = stderr.decode("utf-8", errors="replace") if stderr else "Unknown error"
        logger.error("FFmpeg thất bại (code %d): %s", proc.returncode, err_msg)
        raise RuntimeError(f"FFmpeg failed with return code {proc.returncode}: {err_msg[-1000:]}")

    if not out_file.is_file() or out_file.stat().st_size == 0:
        raise RuntimeError(f"FFmpeg không tạo được tệp đầu ra hợp lệ: {out_file}")

    logger.info("Hoàn tất encode video lipsync: %s (%d frames, %d bytes)", out_file, frame_count, out_file.stat().st_size)
    return str(out_file)
