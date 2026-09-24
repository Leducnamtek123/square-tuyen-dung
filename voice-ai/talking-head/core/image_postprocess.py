"""Image post-processing algorithms for Talking Head AI Lip-Sync.

Kế thừa từ quy chuẩn opc007/ai-digital-human & lipku/LiveTalking:
- Ghép khung hình Wav2Lip trực tiếp vào vùng bbox khuôn mặt (paste_back_frame).
- Viền ghép được làm mềm (soft boundary feathering 6-8px) để tạo chuyển tiếp tự nhiên hoàn hảo.
- Loại bỏ hoàn toàn mặt nạ elip nhân tạo và Reinhard LAB color distortion vốn làm bợt hoặc tô đen vùng miệng.
"""

from __future__ import annotations

import cv2
import numpy as np


def clean_paste_back_frame(
    orig_frame: np.ndarray,
    pred_frame: np.ndarray,
    box: tuple[int, int, int, int],
    feather_px: int = 8,
) -> np.ndarray:
    """Ghép khuôn mặt/khẩu hình suy luận từ Wav2Lip vào khung hình gốc.

    Kế thừa trực tiếp từ LiveTalking & quy chuẩn opc007/ai-digital-human:
    - Nếu là hộp toàn bộ khuôn mặt (h >= 200px):
      Giữ nguyên 100% mắt, lông mày, trán và da gốc siêu nét 720p HD.
      Chỉ hòa trộn mềm mại vùng khẩu hình (môi & hàm dưới) từ Wav2Lip với gradient alpha mượt mà.
    - Bảo toàn 100% màu sắc tự nhiên của da, môi, son và răng.
    - Tuyệt đối không làm méo mó, biến dạng hay tạo vết đen trên cằm.

    Args:
        orig_frame: Khung hình gốc BGR (H, W, 3).
        pred_frame: Khung hình/vùng mặt đã suy luận từ Wav2Lip BGR (crop_h, crop_w, 3).
        box: Tọa độ bounding box (ymin, ymax, xmin, xmax).
        feather_px: Độ rộng viền làm mềm tính bằng pixel (mặc định 8px).

    Returns:
        np.ndarray: Khung hình hoàn thiện với khẩu hình tự nhiên.
    """
    ymin, ymax, xmin, xmax = box
    h = ymax - ymin
    w = xmax - xmin

    if h <= 0 or w <= 0:
        return orig_frame.copy()

    # Chuẩn hóa kích thước crop AI chất lượng cao Lanczos
    res_frame = cv2.resize(pred_frame.astype(np.uint8), (w, h), interpolation=cv2.INTER_LANCZOS4)
    orig_roi = orig_frame[ymin:ymax, xmin:xmax]

    # Kiểm tra kích thước hộp: nếu là hộp toàn khuôn mặt (h >= 18% chiều cao ảnh)
    # Giữ nguyên 100% mắt, mũi, trán, chân mày nguyên bản HD từ orig_frame.
    # Chỉ hòa trộn vùng khẩu hình (từ dưới sống mũi xuống cằm) để tránh méo mó khuôn mặt.
    is_full_face = h >= int(orig_frame.shape[0] * 0.18)

    if is_full_face:
        # y-profile: 0 ở mắt/mũi, chuyển tiếp mượt mà sang 1 ở vùng miệng, chuyển tiếp về 0 ở đáy cằm
        y_indices = np.arange(h, dtype=np.float32) / float(h)
        y_mask = np.zeros(h, dtype=np.float32)
        for idx, y_rel in enumerate(y_indices):
            if y_rel < 0.44:
                y_mask[idx] = 0.0
            elif y_rel < 0.56:
                t = (y_rel - 0.44) / (0.56 - 0.44)
                y_mask[idx] = t * t * (3.0 - 2.0 * t)
            elif y_rel <= 0.88:
                y_mask[idx] = 1.0
            elif y_rel <= 0.98:
                t = (0.98 - y_rel) / (0.98 - 0.88)
                y_mask[idx] = t * t * (3.0 - 2.0 * t)
            else:
                y_mask[idx] = 0.0

        # x-profile: làm mềm hai bên má để hòa hợp với da
        x_indices = np.arange(w, dtype=np.float32) / float(w)
        x_mask = np.ones(w, dtype=np.float32)
        edge_w = 0.14
        for idx, x_rel in enumerate(x_indices):
            if x_rel < edge_w:
                t = x_rel / edge_w
                x_mask[idx] = t * t * (3.0 - 2.0 * t)
            elif x_rel > (1.0 - edge_w):
                t = (1.0 - x_rel) / edge_w
                x_mask[idx] = t * t * (3.0 - 2.0 * t)

        mask = np.outer(y_mask, x_mask)
        ksize = int(min(h, w) * 0.05) // 2 * 2 + 1
        mask = cv2.GaussianBlur(mask, (ksize, ksize), 0)
    else:
        # Hộp crop miệng nhỏ: feather 4 cạnh
        feather = max(6, min(feather_px, int(min(h, w) * 0.10)))
        mask = np.ones((h, w), dtype=np.float32)
        for idx in range(feather):
            alpha = float(idx) / float(feather)
            mask[idx, :] = np.minimum(mask[idx, :], alpha)
            mask[h - 1 - idx, :] = np.minimum(mask[h - 1 - idx, :], alpha)
            mask[:, idx] = np.minimum(mask[:, idx], alpha)
            mask[:, w - 1 - idx] = np.minimum(mask[:, w - 1 - idx], alpha)
        mask = cv2.GaussianBlur(mask, (15, 15), 5.0)

    mask_3d = np.repeat(mask[:, :, np.newaxis], 3, axis=2)

    out = orig_frame.copy()
    blended = orig_roi.astype(np.float32) * (1.0 - mask_3d) + res_frame.astype(np.float32) * mask_3d
    out[ymin:ymax, xmin:xmax] = np.clip(blended, 0, 255).astype(np.uint8)

    return out


def apply_soft_elliptical_mask(
    orig_frame: np.ndarray,
    ai_mouth_crop: np.ndarray,
    box: tuple[int, int, int, int],
) -> np.ndarray:
    """Wrapper an toàn chuyển tiếp sang clean_paste_back_frame để duy trì backward compatibility."""
    return clean_paste_back_frame(orig_frame, ai_mouth_crop, box, feather_px=8)


def reinhard_lab_color_transfer(orig_roi: np.ndarray, ai_roi: np.ndarray) -> np.ndarray:
    """Chuyển đổi màu sắc LAB từ ảnh gốc sang ảnh AI theo giải thuật Reinhard, an toàn và chính xác."""
    try:
        orig_lab = cv2.cvtColor(orig_roi, cv2.COLOR_BGR2LAB).astype(np.float32)
        ai_lab = cv2.cvtColor(ai_roi, cv2.COLOR_BGR2LAB).astype(np.float32)

        for i in range(3):
            orig_mean, orig_std = float(orig_lab[:, :, i].mean()), float(orig_lab[:, :, i].std() + 1e-5)
            ai_mean, ai_std = float(ai_lab[:, :, i].mean()), float(ai_lab[:, :, i].std() + 1e-5)
            ai_lab[:, :, i] = (ai_lab[:, :, i] - ai_mean) * (orig_std / ai_std) + orig_mean

        matched = cv2.cvtColor(np.clip(ai_lab, 0, 255).astype(np.uint8), cv2.COLOR_LAB2BGR)
        return matched
    except Exception:
        return ai_roi.copy()


def unsharp_mask(image: np.ndarray, strength: float = 0.2) -> np.ndarray:
    """Làm nét nhẹ nhàng viền môi và răng.

    Args:
        image: Ảnh BGR đầu vào uint8.
        strength: Hệ số tăng cường độ nét (mặc định 0.2).

    Returns:
        np.ndarray: Ảnh đã được làm nét.
    """
    if strength <= 0:
        return image.copy()

    blurred = cv2.GaussianBlur(image, (3, 3), 0.8)
    sharpened = cv2.addWeighted(image, 1.0 + strength, blurred, -strength, 0)
    return sharpened
