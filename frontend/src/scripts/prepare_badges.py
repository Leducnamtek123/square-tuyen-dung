import os
from PIL import Image, ImageOps

artifact_dir = r"C:\Users\WIN10\.gemini\antigravity-ide\brain\f90ae810-5630-42bc-bcf6-5428c69edc52"
target_dir = r"C:\Users\WIN10\Documents\square-tuyen-dung\frontend\public\images\badges"
os.makedirs(target_dir, exist_ok=True)

# 1. Process dadangki_badge
dadangki_src = os.path.join(artifact_dir, "dadangki_badge_1787722335023.jpg")
if os.path.exists(dadangki_src):
    img = Image.open(dadangki_src).convert("RGBA")
    # Crop central circular emblem
    # Image size is typically 1792x1024 or similar (16:9)
    w, h = img.size
    # The badge is nicely centered in the image
    # Let's find bounding box around the emblem (not pure white)
    # Convert white background to transparent or clean cropped
    bbox = (int(w * 0.25), int(h * 0.08), int(w * 0.75), int(h * 0.92))
    cropped = img.crop(bbox)
    
    # Save as webp
    dadangki_out = os.path.join(target_dir, "dadangki.webp")
    cropped.save(dadangki_out, "WEBP", quality=95)
    print(f"Saved {dadangki_out}")

# 2. Process dmca_badge
dmca_src = os.path.join(artifact_dir, "dmca_badge_1787722359737.jpg")
if os.path.exists(dmca_src):
    img = Image.open(dmca_src).convert("RGBA")
    w, h = img.size
    # Crop the horizontal badge banner in center
    bbox = (int(w * 0.07), int(h * 0.30), int(w * 0.93), int(h * 0.70))
    cropped = img.crop(bbox)
    
    # Save as png
    dmca_out = os.path.join(target_dir, "dmca.png")
    cropped.save(dmca_out, "PNG")
    print(f"Saved {dmca_out}")

print("All badges processed successfully!")
