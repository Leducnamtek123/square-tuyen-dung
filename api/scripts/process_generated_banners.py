#!/usr/bin/env python3
"""
Process AI-generated realistic photo banners into retina-ready seed assets for Square.
Web: 2400 x 750 (16:5)
Mobile: 1200 x 1200 (1:1)
"""

import sys
from pathlib import Path
from PIL import Image, ImageEnhance, ImageOps

ARTIFACT_DIR = Path(r"C:\Users\WIN10\.gemini\antigravity-ide\brain\9371808a-7a41-4905-9ef2-9f855f961e9f")
DEST_DIR = Path(__file__).resolve().parent.parent / "data" / "seed_images" / "banners"

MAPPINGS = {
    "home_square_recruitment": "banner_square_recruitment",
    "home_construction": "banner_construction_site",
    "home_real_estate": "banner_real_estate",
    "home_interior": "banner_interior_team",
    "home_architecture": "banner_architecture_bim",
    "home_ai_interview": "banner_ai_interview",
    "home_mep_engineering": "banner_mep_engineer",
    "home_project_management": "banner_project_manager",
    "right_hiring": "banner_right_hiring",
    "right_cv_builder": "banner_right_cv",
    "right_ai_assistant": "banner_right_ai",
    "right_hrm_suite": "banner_right_hrm",
    "right_employer_verify": "banner_right_verify",
}


def find_latest_artifact(pattern_prefix: str) -> Path:
    matches = list(ARTIFACT_DIR.glob(f"{pattern_prefix}_*.jpg"))
    if not matches:
        raise FileNotFoundError(f"Could not find artifact matching {pattern_prefix}_*.jpg")
    matches.sort(key=lambda p: p.stat().st_mtime, reverse=True)
    return matches[0]


def crop_and_resize(img: Image.Image, target_w: int, target_h: int) -> Image.Image:
    # Use PIL ImageOps.fit with centered crop and Lanczos filter
    fitted = ImageOps.fit(img, (target_w, target_h), method=Image.Resampling.LANCZOS, centering=(0.5, 0.45))
    
    # Slight color/contrast polish for vivid clarity
    enhancer = ImageEnhance.Color(fitted)
    fitted = enhancer.enhance(1.05)
    
    enhancer = ImageEnhance.Contrast(fitted)
    fitted = enhancer.enhance(1.03)
    
    return fitted


def main():
    DEST_DIR.mkdir(parents=True, exist_ok=True)
    print(f"Processing generated photorealistic banners to: {DEST_DIR}")
    
    count = 0
    for target_key, prefix in MAPPINGS.items():
        src_file = find_latest_artifact(prefix)
        print(f"Loading {src_file.name} -> {target_key} ...")
        
        with Image.open(src_file) as raw_img:
            rgb_img = raw_img.convert("RGB")
            
            # 1. Web Version: 2400 x 750 (Retina 16:5)
            web_img = crop_and_resize(rgb_img, 2400, 750)
            web_dest = DEST_DIR / f"{target_key}_web.jpg"
            web_img.save(web_dest, format="JPEG", quality=95, optimize=True)
            print(f"  [OK] Saved {web_dest.name} ({web_img.size})")
            
            # 2. Mobile Version: 1200 x 1200 (Retina 1:1)
            mob_img = crop_and_resize(rgb_img, 1200, 1200)
            mob_dest = DEST_DIR / f"{target_key}_mobile.jpg"
            mob_img.save(mob_dest, format="JPEG", quality=95, optimize=True)
            print(f"  [OK] Saved {mob_dest.name} ({mob_img.size})")
            
            count += 2
            
    print(f"\nSUCCESS: Processed {count} realistic photographic banner assets!")


if __name__ == "__main__":
    main()
