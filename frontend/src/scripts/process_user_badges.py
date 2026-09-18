import os
import numpy as np
from PIL import Image

def make_transparent(input_path, output_path, is_webp=False, tolerance=25):
    img = Image.open(input_path).convert("RGBA")
    data = np.array(img)
    
    # Check top-left pixel color as background candidate
    bg_color = data[0, 0, :3]
    print(f"File: {input_path}, Background sample top-left: {bg_color}")
    
    # If background is close to white (e.g. > 240, 240, 240)
    # or close to top-left pixel
    r, g, b, a = data[:, :, 0], data[:, :, 1], data[:, :, 2], data[:, :, 3]
    
    # White background detection (r>240, g>240, b>240)
    white_mask = (r > 240) & (g > 240) & (b > 240)
    
    # Near top-left color mask
    bg_diff = np.abs(r.astype(int) - bg_color[0]) + np.abs(g.astype(int) - bg_color[1]) + np.abs(b.astype(int) - bg_color[2])
    bg_mask = bg_diff < tolerance
    
    combined_mask = white_mask | bg_mask
    data[combined_mask, 3] = 0 # set alpha to 0
    
    res_img = Image.fromarray(data)
    
    # Auto crop transparent bounding box
    bbox = res_img.getbbox()
    if bbox:
        res_img = res_img.crop(bbox)
        # Add small 2px padding
        padded = Image.new("RGBA", (res_img.width + 4, res_img.height + 4), (0, 0, 0, 0))
        padded.paste(res_img, (2, 2))
        res_img = padded
        
    if is_webp:
        res_img.save(output_path, "WEBP", quality=95)
    else:
        res_img.save(output_path, "PNG")
    print(f"Successfully processed {output_path}, final size: {res_img.size}")

target_dir = r"C:\Users\WIN10\Documents\square-tuyen-dung\frontend\public\images\badges"
os.makedirs(target_dir, exist_ok=True)

# 1. Process Logo-da-dang-ky-thuong-mai-dien-tu.webp -> dadangki.webp
dadangki_raw = r"C:\Users\WIN10\Downloads\Logo-da-dang-ky-thuong-mai-dien-tu.webp"
dadangki_out = os.path.join(target_dir, "dadangki.webp")
make_transparent(dadangki_raw, dadangki_out, is_webp=True)

# 2. Process images.png (DMCA) -> dmca.png
dmca_raw = r"C:\Users\WIN10\Downloads\images.png"
dmca_out = os.path.join(target_dir, "dmca.png")
make_transparent(dmca_raw, dmca_out, is_webp=False)
