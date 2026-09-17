"""
simulate_live_candidates.py
Simulates real candidate video and audio participants connecting to LiveKit rooms.
Runs all 10 candidates concurrently, publishing camera and microphone tracks in real-time.
"""

import asyncio
import json
import logging
import math
import os
import random
import sys
import time
from typing import Dict, List
import numpy as np
from PIL import Image, ImageDraw, ImageFont

from livekit import api, rtc

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("CandidateSim")

LIVEKIT_URL = os.environ.get("LIVEKIT_URL", "http://livekit:7880").replace("http://", "ws://").replace("https://", "wss://")
API_KEY = os.environ.get("LIVEKIT_API_KEY", "lk_UtAnNjB4iOJ1r1w-AGRxX0c4D-KZhsay")
API_SECRET = os.environ.get("LIVEKIT_API_SECRET", "CPoOScgkxwnUqGTguMZ-965yh2A9u47zMs9nyOxsiSLi_Cty3nsf5fNgl9mNpZG5")

CANDIDATES = [
    {"id": 543, "name": "Trịnh Hoàng Long", "role": "Kỹ sư An toàn lao động HSE", "room": "interview-344741c1ec6b", "initial": "L", "color": (37, 99, 235)},
    {"id": 542, "name": "Đặng Quốc Bảo", "role": "Kỹ sư Giám sát HVAC & PCCC", "room": "interview-36bba347f63c", "initial": "B", "color": (16, 185, 129)},
    {"id": 541, "name": "Phan Thị Lan", "role": "Kỹ sư Giám sát Nội thất", "room": "interview-8dbeebd84111", "initial": "L", "color": (236, 72, 153)},
    {"id": 540, "name": "Bùi Anh Tuấn", "role": "Chỉ huy phó kiêm GS An toàn", "room": "interview-f3599a72bf70", "initial": "T", "color": (245, 158, 11)},
    {"id": 539, "name": "Đỗ Văn Cường", "role": "Giám sát Xây dựng Dân dụng", "room": "interview-c17c20aaa823", "initial": "C", "color": (14, 165, 233)},
    {"id": 538, "name": "Vũ Thu Hà", "role": "Kỹ sư QA/QC Kiểm định", "room": "interview-20bbe4b1d2c5", "initial": "H", "color": (139, 92, 246)},
    {"id": 537, "name": "Phạm Đức Huy", "role": "Kỹ sư GS Khung thép & Móng", "room": "interview-f4f52780b620", "initial": "H", "color": (20, 184, 166)},
    {"id": 536, "name": "Lê Thị Thảo", "role": "Kỹ sư Giám sát Cơ điện MEP", "room": "interview-df61f5de3093", "initial": "T", "color": (244, 63, 94)},
    {"id": 535, "name": "Trần Minh Quân", "role": "Giám sát thi công hoàn thiện", "room": "interview-2a7a3dabb47d", "initial": "Q", "color": (99, 102, 241)},
    {"id": 534, "name": "Nguyễn Hoàng Nam", "role": "Giám sát Kết cấu BTCT", "room": "interview-a702bbc72744", "initial": "N", "color": (59, 130, 246)},
]

WIDTH = 640
HEIGHT = 360
FPS = 10
FRAME_INTERVAL = 1.0 / FPS
AUDIO_RATE = 48000

# Try to load truetype font
font_title = None
font_sub = None
font_badge = None
font_initial = None
for font_path in [
    "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf",
    "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
]:
    if os.path.exists(font_path):
        try:
            font_title = ImageFont.truetype(font_path, 18)
            font_sub = ImageFont.truetype(font_path, 13)
            font_badge = ImageFont.truetype(font_path, 11)
            font_initial = ImageFont.truetype(font_path, 46)
            break
        except Exception:
            pass

if not font_title:
    font_title = font_sub = font_badge = font_initial = ImageFont.load_default()


def render_candidate_frame(cand: dict, frame_num: int) -> bytes:
    """Render a dynamic 640x360 video frame with animated avatar, audio wave, and telemetry."""
    img = Image.new("RGBA", (WIDTH, HEIGHT), (11, 17, 32, 255))
    draw = ImageDraw.Draw(img)

    # Subtle background room lighting
    draw.rectangle([0, 0, WIDTH, HEIGHT], fill=(13, 19, 33, 255))
    # Soft room depth gradient
    for y in range(0, HEIGHT, 16):
        alpha = int(10 + (y / HEIGHT) * 20)
        draw.rectangle([0, y, WIDTH, y + 16], fill=(20, 30, 50, alpha))

    # Inner camera border
    draw.rectangle([6, 6, WIDTH - 6, HEIGHT - 6], outline=(30, 41, 59, 180), width=1)

    # Animated subtle pulse for avatar
    pulse = math.sin(frame_num * 0.15) * 4
    cx, cy, base_r = 320, 135, 52
    r = int(base_r + pulse)
    color = cand["color"]

    # Avatar outer soft glow
    draw.ellipse([cx - r - 8, cy - r - 8, cx + r + 8, cy + r + 8], fill=(color[0], color[1], color[2], 30))
    draw.ellipse([cx - r - 4, cy - r - 4, cx + r + 4, cy + r + 4], fill=(color[0], color[1], color[2], 60))
    # Main avatar circle
    draw.ellipse([cx - r, cy - r, cx + r, cy + r], fill=color, outline=(255, 255, 255, 220), width=3)

    # Candidate Initial in center
    initial = cand.get("initial", cand["name"][0].upper())
    draw.text((cx - 16, cy - 28), initial, font=font_initial, fill=(255, 255, 255, 255))

    # Live speech wave bars under avatar
    num_bars = 16
    bar_width = 8
    gap = 4
    total_w = num_bars * (bar_width + gap) - gap
    start_x = (WIDTH - total_w) // 2
    base_y = 225

    for i in range(num_bars):
        bx = start_x + i * (bar_width + gap)
        # Periodic speaking waveform
        wave_h = int(math.sin(frame_num * 0.25 + i * 0.6) * 14 + math.cos(frame_num * 0.4 + i * 0.3) * 8 + 16)
        wave_h = max(4, min(36, wave_h))
        # Color gradient green to cyan
        bar_color = (34, 197, 94, 240) if i % 2 == 0 else (56, 189, 248, 240)
        draw.rounded_rectangle(
            [bx, base_y - wave_h // 2, bx + bar_width, base_y + wave_h // 2],
            radius=3,
            fill=bar_color
        )

    # Candidate Profile Bar at Bottom
    card_top = HEIGHT - 68
    draw.rectangle([14, card_top, WIDTH - 14, HEIGHT - 14], fill=(15, 23, 42, 230), outline=(51, 65, 85, 240), width=1)

    # Candidate Name
    draw.text((28, card_top + 10), cand["name"], font=font_title, fill=(248, 250, 252, 255))
    # Role / Position
    draw.text((28, card_top + 34), f"{cand['role']} · Công ty Square", font=font_sub, fill=(148, 163, 184, 255))

    # Right side status tag in bottom bar
    draw.rectangle([WIDTH - 130, card_top + 14, WIDTH - 28, card_top + 40], fill=(16, 185, 129, 30), outline=(16, 185, 129, 120), width=1)
    draw.ellipse([WIDTH - 120, card_top + 24, WIDTH - 114, card_top + 30], fill=(34, 197, 94, 255))
    draw.text((WIDTH - 108, card_top + 20), "TRỰC TIẾP", font=font_badge, fill=(52, 211, 153, 255))

    # Top-Left Camera Feed Telemetry
    draw.rectangle([14, 14, 185, 38], fill=(0, 0, 0, 190), outline=(30, 41, 59, 200), width=1)
    # Pulsing red/green recording dot
    dot_color = (239, 68, 68, 255) if (frame_num // 8) % 2 == 0 else (220, 38, 38, 150)
    draw.ellipse([22, 23, 28, 29], fill=dot_color)
    draw.text((34, 20), f"CAM 1 · 1080p · #{cand['id']}", font=font_badge, fill=(226, 232, 240, 255))

    arr = np.array(img)
    return arr.tobytes()


def generate_audio_chunk(frame_num: int, samples_count: int = 4800) -> bytes:
    """Generate 100ms (4800 samples) of realistic vocal amplitude audio at 48kHz."""
    t = np.linspace(0, 0.1, samples_count, False)
    # Periodic speaking pause (speaks 2s, pauses 1s)
    cycle = (frame_num % 30) < 20
    amplitude = 4500 if cycle else 200
    noise = np.random.normal(0, 50, samples_count)
    sig = (
        np.sin(2 * np.pi * 220 * t) * 0.5 +
        np.sin(2 * np.pi * 440 * t) * 0.3 +
        np.sin(2 * np.pi * 880 * t) * 0.2
    ) * amplitude + noise
    sig = np.clip(sig, -32767, 32767).astype(np.int16)
    return sig.tobytes()


async def run_candidate_client(cand: dict):
    """Maintain persistent connection and track streaming for a single candidate."""
    cand_id = cand["id"]
    room_name = cand["room"]
    cand_name = cand["name"]

    while True:
        logger.info("Candidate %s (#%s) connecting to room %s ...", cand_name, cand_id, room_name)
        room = rtc.Room()

        try:
            token = (
                api.AccessToken(API_KEY, API_SECRET)
                .with_identity(f"candidate_{cand_id}")
                .with_name(cand_name)
                .with_metadata(json.dumps({"role": "candidate", "name": cand_name}, ensure_ascii=False))
                .with_attributes({"role": "candidate", "participant_role": "candidate"})
                .with_grants(api.VideoGrants(
                    room_join=True,
                    room=room_name,
                    can_publish=True,
                    can_subscribe=True,
                ))
                .to_jwt()
            )

            await room.connect(LIVEKIT_URL, token)
            logger.info("Candidate %s successfully connected to room %s!", cand_name, room_name)

            # Publish Video Track (Camera)
            video_source = rtc.VideoSource(WIDTH, HEIGHT)
            video_track = rtc.LocalVideoTrack.create_video_track("camera", video_source)
            v_opts = rtc.TrackPublishOptions(source=rtc.TrackSource.SOURCE_CAMERA)
            await room.local_participant.publish_track(video_track, v_opts)

            # Publish Audio Track (Microphone)
            audio_source = rtc.AudioSource(AUDIO_RATE, 1)
            audio_track = rtc.LocalAudioTrack.create_audio_track("microphone", audio_source)
            a_opts = rtc.TrackPublishOptions(source=rtc.TrackSource.SOURCE_MICROPHONE)
            await room.local_participant.publish_track(audio_track, a_opts)

            logger.info("Candidate %s publishing Video & Audio tracks in %s", cand_name, room_name)

            frame_num = 0
            while room.connection_state == rtc.ConnectionState.CONN_CONNECTED:
                start_loop = time.perf_counter()

                # Push video frame
                frame_data = render_candidate_frame(cand, frame_num)
                video_frame = rtc.VideoFrame(WIDTH, HEIGHT, rtc.VideoBufferType.RGBA, frame_data)
                video_source.capture_frame(video_frame)

                # Push 100ms of 48kHz audio (4800 samples)
                audio_data = generate_audio_chunk(frame_num, 4800)
                audio_frame = rtc.AudioFrame(audio_data, AUDIO_RATE, 1, 4800)
                await audio_source.capture_frame(audio_frame)

                frame_num += 1

                elapsed = time.perf_counter() - start_loop
                sleep_time = max(0.01, FRAME_INTERVAL - elapsed)
                await asyncio.sleep(sleep_time)

        except Exception as exc:
            logger.warning("Candidate %s encountered error: %s. Reconnecting in 3s...", cand_name, exc)
            try:
                await room.disconnect()
            except Exception:
                pass
            await asyncio.sleep(3.0)


async def main():
    logger.info("=== STARTING 10 LIVE CANDIDATE SIMULATORS FOR SQUARE ===")
    logger.info("Connecting to LiveKit: %s", LIVEKIT_URL)
    
    tasks = [asyncio.create_task(run_candidate_client(cand)) for cand in CANDIDATES]
    await asyncio.gather(*tasks)


if __name__ == "__main__":
    asyncio.run(main())
