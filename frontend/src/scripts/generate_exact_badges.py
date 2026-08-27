import os
from PIL import Image, ImageDraw, ImageFont

target_dir = r"C:\Users\WIN10\Documents\square-tuyen-dung\frontend\public\images\badges"
os.makedirs(target_dir, exist_ok=True)

# ----------------------------------------------------
# 1. Create pixel-perfect DMCA.png badge (Exact match to Image 3)
# ----------------------------------------------------
# Width 130px, Height 26px (retina scale 2x: 260x52)
scale = 2
w, h = 135 * scale, 28 * scale
img_dmca = Image.new("RGBA", (w, h), (0, 0, 0, 0))
draw_dmca = ImageDraw.Draw(img_dmca)

# Rounded rectangle container
r = 4 * scale
split_x = int(w * 0.42)

# Left box: Dark Green #0d5c2d
draw_dmca.rounded_rectangle([0, 0, w, h], radius=r, fill="#559933")
draw_dmca.rounded_rectangle([0, 0, split_x, h], radius=r, fill="#0a5226")
# Cover right corners of left box to make seam straight
draw_dmca.rectangle([split_x - r, 0, split_x, h], fill="#0a5226")

# Draw "DMCA" text on left & "PROTECTED" on right
try:
    font_bold = ImageFont.truetype("arialbd.ttf", 15 * scale)
    font_sub = ImageFont.truetype("arialbd.ttf", 13 * scale)
except:
    font_bold = ImageFont.load_default()
    font_sub = ImageFont.load_default()

# Centering text
# Left text: DMCA
draw_dmca.text((split_x / 2, h / 2), "DMCA", fill="#ffffff", font=font_bold, anchor="mm")
# Right text: PROTECTED
draw_dmca.text((split_x + (w - split_x) / 2, h / 2), "PROTECTED", fill="#ffffff", font=font_sub, anchor="mm")

# Save dmca.png
dmca_path = os.path.join(target_dir, "dmca.png")
img_dmca.save(dmca_path, "PNG")
print(f"Saved {dmca_path}")


# ----------------------------------------------------
# 2. Create pixel-perfect "Đã Đăng Ký Bộ Công Thương" badge (Exact match to Image 3)
# ----------------------------------------------------
# Width 140px, Height 46px (retina scale 2x: 280x92)
w_moit, h_moit = 150 * scale, 52 * scale
img_moit = Image.new("RGBA", (w_moit, h_moit), (0, 0, 0, 0))
draw_moit = ImageDraw.Draw(img_moit)

# Red background #d32f2f
r_moit = 6 * scale
draw_moit.rounded_rectangle([0, 0, w_moit, h_moit], radius=r_moit, fill="#c92a2a")

# Left Seal: Blue/Gold circular emblem
seal_cx, seal_cy = 28 * scale, h_moit // 2
seal_r = 20 * scale

# Outer white border of seal
draw_moit.ellipse([seal_cx - seal_r, seal_cy - seal_r, seal_cx + seal_r, seal_cy + seal_r], fill="#1c7ed6", outline="#ffffff", width=2 * scale)

# Inner gold star & cogwheel motif
draw_moit.ellipse([seal_cx - seal_r + 4 * scale, seal_cy - seal_r + 4 * scale, seal_cx + seal_r - 4 * scale, seal_cy + seal_r - 4 * scale], fill="#ffd43b")
draw_moit.ellipse([seal_cx - seal_r + 8 * scale, seal_cy - seal_r + 8 * scale, seal_cx + seal_r - 8 * scale, seal_cy + seal_r - 8 * scale], fill="#1c7ed6")

# Star in center
star_r = 5 * scale
draw_moit.ellipse([seal_cx - star_r, seal_cy - star_r, seal_cx + star_r, seal_cy + star_r], fill="#fcc419")

# Text on Right:
# Line 1: ĐÃ ĐĂNG KÝ
# Line 2: BỘ CÔNG THƯƠNG
try:
    font_moit_1 = ImageFont.truetype("arialbd.ttf", 13 * scale)
    font_moit_2 = ImageFont.truetype("arialbd.ttf", 11 * scale)
except:
    font_moit_1 = ImageFont.load_default()
    font_moit_2 = ImageFont.load_default()

text_x = 55 * scale
draw_moit.text((text_x, 17 * scale), "ĐÃ ĐĂNG KÝ", fill="#ffffff", font=font_moit_1, anchor="lm")
draw_moit.text((text_x, 35 * scale), "BỘ CÔNG THƯƠNG", fill="#ffffff", font=font_moit_2, anchor="lm")

# Save dadangki.webp
dadangki_path = os.path.join(target_dir, "dadangki.webp")
img_moit.save(dadangki_path, "WEBP", quality=98)
print(f"Saved {dadangki_path}")
