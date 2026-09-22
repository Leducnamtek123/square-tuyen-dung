"""Image post-processing algorithms for Talking Head AI Lip-Sync.

Kế thừa từ quy chuẩn opc007/ai-digital-human và LiveTalking:
- Soft Elliptical Mouth Mask: Bảo toàn 100% da má, cằm, mắt, tóc và nền gốc.
- Reinhard LAB Color Transfer: Khử bợt màu son và tái da bằng cân bằng mean & variance trong không gian L*a*b*.
- Unsharp Masking: Tăng độ nét răng và viền môi khi cử động.
"""

from __future__ import annotations

import cv2
import numpy as np


def apply_soft_elliptical_mask(
    orig_frame: np.ndarray,
    ai_mouth_crop: np.ndarray,
    box: tuple[int, int, int, int],
) -> np.ndarray:
    """Ghép vùng miệng AI vào khung hình gốc bằng mặt nạ elip làm mờ biên mềm mại.

    Args:
        orig_frame: Khung hình gốc BGR (H, W, 3).
        ai_mouth_crop: Vùng miệng đã suy luận từ Wav2Lip BGR (crop_h, crop_w, 3) hoặc kích thước bất kỳ.
        box: Tọa độ bounding box (ymin, ymax, xmin, xmax).

    Returns:
        np.ndarray: Khung hình hoàn thiện với khẩu hình AI được hòa trộn tự nhiên.
    """
    ymin, ymax, xmin, xmax = box
    crop_h = ymax - ymin
    crop_w = xmax - xmin

    if crop_h <= 0 or crop_w <= 0:
        return orig_frame.copy()

    # Chuẩn hóa kích thước crop AI nếu khác kích thước vùng đích
    if ai_mouth_crop.shape[0] != crop_h or ai_mouth_crop.shape[1] != crop_w:
        ai_mouth_crop = cv2.resize(ai_mouth_crop, (crop_w, crop_h), interpolation=cv2.INTER_LINEAR)

    # 1. Tạo mặt nạ elip mềm tập trung quanh vùng môi
    mask = np.zeros((crop_h, crop_w), dtype=np.float32)
    center = (int(crop_w * 0.5), int(crop_h * 0.55))
    axes = (int(crop_w * 0.42), int(crop_h * 0.35))
    cv2.ellipse(mask, center, axes, 0, 0, 360, 1.0, -1)

    # 2. Gaussian blur làm mềm chuyển tiếp cạnh (kernel 19x19, sigma 5)
    mask = cv2.GaussianBlur(mask, (19, 19), 5)
    mask_3d = np.repeat(mask[:, :, np.newaxis], 3, axis=2)

    # 3. Lấy ROI gốc và hòa trộn alpha
    out_frame = orig_frame.copy()
    orig_roi = out_frame[ymin:ymax, xmin:xmax].astype(np.float32)
    ai_roi = ai_mouth_crop.astype(np.float32)

    blended_roi = orig_roi * (1.0 - mask_3d) + ai_roi * mask_3d
    out_frame[ymin:ymax, xmin:xmax] = np.clip(blended_roi, 0, 255).astype(np.uint8)

    return out_frame


def reinhard_lab_color_transfer(orig_roi: np.ndarray, ai_roi: np.ndarray) -> np.ndarray:
    """Cân bằng màu Reinhard trong không gian màu CIE L*a*b*.

    Khử hiện tượng bợt màu son môi và bạc da do mô hình Wav2Lip sinh ra.
    Khớp giá trị Mean và Standard Deviation của từng kênh L, A, B giữa ROI gốc và ROI AI.

    Args:
        orig_roi: Vùng ảnh khuôn mặt gốc BGR (H, W, 3).
        ai_roi: Vùng ảnh miệng do AI sinh ra BGR (H, W, 3).

    Returns:
        np.ndarray: Vùng ảnh miệng AI đã được hiệu chỉnh màu sắc theo ROI gốc.
    """
    if orig_roi.size == 0 or ai_roi.size == 0:
        return ai_roi.copy()

    # Đảm bảo kích thước đồng nhất trước khi tính toán
    if orig_roi.shape[:2] != ai_roi.shape[:2]:
        orig_roi = cv2.resize(orig_roi, (ai_roi.shape[1], ai_roi.shape[0]), interpolation=cv2.INTER_LINEAR)

    orig_lab = cv2.cvtColor(orig_roi, cv2.COLOR_BGR2LAB).astype(np.float32)
    ai_lab = cv2.cvtColor(ai_roi, cv2.COLOR_BGR2LAB).astype(np.float32)

    for c in range(3):
        mu_orig = float(orig_lab[:, :, c].mean())
        std_orig = float(orig_lab[:, :, c].std()) + 1e-5

        mu_ai = float(ai_lab[:, :, c].mean())
        std_ai = float(ai_lab[:, :, c].std()) + 1e-5

        ai_lab[:, :, c] = ((ai_lab[:, :, c] - mu_ai) * (std_orig / std_ai)) + mu_orig

    ai_matched = cv2.cvtColor(np.clip(ai_lab, 0, 255).astype(np.uint8), cv2.COLOR_LAB2BGR)
    return ai_matched


def unsharp_mask(image: np.ndarray, strength: float = 0.35) -> np.ndarray:
    """Làm nét cục bộ ảnh (Unsharp Masking) tăng chi tiết viền môi và răng.

    Args:
        image: Ảnh BGR đầu vào uint8.
        strength: Hệ số tăng cường độ nét (mặc định 0.35).

    Returns:
        np.ndarray: Ảnh đã được làm nét.
    """
    if strength <= 0:
        return image.copy()

    blurred = cv2.GaussianBlur(image, (5, 5), 1.0)
    sharpened = cv2.addWeighted(image, 1.0 + strength, blurred, -strength, 0)
    return sharpened
