"""Recompute and smooth face coordinates for all avatar action videos.

This script uses FaceAlignment to detect the exact 256x256-compatible full face bounding box
for every frame of every action video, applying temporal moving average smoothing to eliminate jitter.
"""

import glob
import os
import pickle
from pathlib import Path
import cv2
import numpy as np
import torch
from avatars.wav2lip import face_detection

device = "cuda" if torch.cuda.is_available() else "cpu"
print(f"Using device: {device} for face detection")
detector = face_detection.FaceAlignment(
    face_detection.LandmarksType._2D, flip_input=False, device=device
)

avatar_dir = Path("data/avatars/ng_c_linh/actions")
action_videos = sorted(glob.glob(str(avatar_dir / "*.mp4")))
print(f"Found {len(action_videos)} action videos in {avatar_dir}")

for vpath in action_videos:
    vname = Path(vpath).name
    cap = cv2.VideoCapture(vpath)
    frames = []
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret or frame is None:
            break
        frames.append(frame)
    cap.release()

    total_frames = len(frames)
    print(f"\nProcessing {vname}: {total_frames} frames")
    if total_frames == 0:
        continue

    h, w = frames[0].shape[:2]
    batch_size = 16
    boxes = []

    for i in range(0, total_frames, batch_size):
        batch = frames[i : i + batch_size]
        dets = detector.get_detections_for_batch(np.array(batch))
        for d in dets:
            if d is None:
                # Fallback to standard proportions if detection misses a frame
                if boxes:
                    boxes.append(boxes[-1])
                else:
                    boxes.append([int(h * 0.20), int(h * 0.46), int(w * 0.33), int(w * 0.65)])
            else:
                y1 = max(0, int(d[1]))
                y2 = min(h, int(d[3]) + 10)
                x1 = max(0, int(d[0]))
                x2 = min(w, int(d[2]))
                boxes.append([y1, y2, x1, x2])

    boxes = np.array(boxes, dtype=np.int32)

    # Apply temporal moving average smoothing (window T=5)
    T = 5
    smoothed = np.zeros_like(boxes)
    for i in range(len(boxes)):
        if i + T > len(boxes):
            window = boxes[len(boxes) - T :]
        else:
            window = boxes[i : i + T]
        smoothed[i] = np.mean(window, axis=0).astype(np.int32)

    # Save to both .<video>.coords_256.npy and <video>.coords_256.npy
    out_npy1 = avatar_dir / f"{vname}.coords_256.npy"
    out_npy2 = avatar_dir / f".{vname}.coords_256.npy"
    np.save(str(out_npy1), smoothed)
    np.save(str(out_npy2), smoothed)
    print(f"Saved {smoothed.shape} coordinates to {out_npy1.name}")

    if vname == "idle.mp4":
        out_default = avatar_dir / "coords_256.npy"
        np.save(str(out_default), smoothed)
        print(f"Updated default {out_default.name}")

        # Also save coords.pkl for legacy LiveTalking loaders
        coords_pkl = Path("data/avatars/ng_c_linh/coords.pkl")
        coord_tuples = [(int(b[0]), int(b[1]), int(b[2]), int(b[3])) for b in smoothed]
        with open(coords_pkl, "wb") as f:
            pickle.dump(coord_tuples, f)
        print(f"Updated {coords_pkl}")

print("\nFace coordinates recomputation complete for all actions!")
