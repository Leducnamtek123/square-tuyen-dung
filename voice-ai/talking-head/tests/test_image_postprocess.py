"""Unit tests for image post-processing algorithms and direct FFmpeg memory pipe.

Kế thừa từ quy chuẩn opc007/ai-digital-human và LiveTalking.
"""

import os
import tempfile
import numpy as np
import pytest

from core.image_postprocess import (
    apply_soft_elliptical_mask,
    reinhard_lab_color_transfer,
    unsharp_mask,
)
from core.ffmpeg_pipe import stream_frames_to_ffmpeg


def test_unsharp_mask():
    # Test unsharp masking preserves dimensions and data type
    img = np.full((128, 128, 3), 120, dtype=np.uint8)
    # Add a sharp edge in the middle
    img[60:70, :, :] = 200
    sharpened = unsharp_mask(img, strength=0.35)

    assert sharpened.shape == img.shape
    assert sharpened.dtype == np.uint8
    # Edge contrast should be enhanced or maintained
    assert int(sharpened[64, 64, 0]) >= int(img[64, 64, 0])


def test_reinhard_lab_color_transfer():
    # Create orig ROI with warm tone (high A/B in LAB) and AI ROI with pale/cold tone
    orig_roi = np.full((64, 64, 3), [80, 100, 220], dtype=np.uint8)  # BGR warm reddish
    ai_roi = np.full((64, 64, 3), [180, 180, 180], dtype=np.uint8)   # BGR pale grayish

    matched = reinhard_lab_color_transfer(orig_roi, ai_roi)

    assert matched.shape == ai_roi.shape
    assert matched.dtype == np.uint8
    # Mean of matched ROI should be close to orig_roi rather than original ai_roi
    # Red channel (BGR index 2) should increase towards orig_roi
    assert abs(int(matched[:, :, 2].mean()) - int(orig_roi[:, :, 2].mean())) < 15
    assert abs(int(matched[:, :, 0].mean()) - int(orig_roi[:, :, 0].mean())) < 15


def test_apply_soft_elliptical_mask():
    h, w = 720, 1280
    orig_frame = np.full((h, w, 3), 50, dtype=np.uint8)
    box = (300, 500, 500, 700)  # ymin, ymax, xmin, xmax (crop 200x200)
    ai_mouth_crop = np.full((200, 200, 3), 220, dtype=np.uint8)

    blended = apply_soft_elliptical_mask(orig_frame, ai_mouth_crop, box)

    assert blended.shape == orig_frame.shape
    assert blended.dtype == np.uint8

    # The outer frame should remain completely untouched (100% original pixel value 50)
    assert blended[0, 0, 0] == 50
    assert blended[100, 100, 0] == 50
    assert blended[600, 1000, 0] == 50

    # The mouth center should be predominantly the AI mouth crop (around 220)
    ymin, ymax, xmin, xmax = box
    crop_h = ymax - ymin
    crop_w = xmax - xmin
    center_y = ymin + int(crop_h * 0.55)
    center_x = xmin + int(crop_w * 0.5)
    assert blended[center_y, center_x, 0] > 180


def test_stream_frames_to_ffmpeg():
    # Generate 10 dummy frames (1280x720)
    width, height, fps = 640, 360, 25
    frames = [np.full((height, width, 3), (i * 20) % 255, dtype=np.uint8) for i in range(10)]

    with tempfile.TemporaryDirectory() as tmpdir:
        # Create a dummy silent wav file with ffmpeg
        dummy_audio = os.path.join(tmpdir, "silent.wav")
        import subprocess
        subprocess.run(
            [
                "ffmpeg", "-y", "-f", "lavfi", "-i", "anullsrc=r=16000:cl=mono",
                "-t", "0.4", "-c:a", "pcm_s16le", dummy_audio
            ],
            check=True,
            capture_output=True
        )

        output_video = os.path.join(tmpdir, "output.mp4")
        res_path = stream_frames_to_ffmpeg(
            frames=frames,
            audio_path=dummy_audio,
            output_path=output_video,
            fps=fps,
            width=width,
            height=height
        )

        assert os.path.exists(res_path)
        assert os.path.getsize(res_path) > 1000
