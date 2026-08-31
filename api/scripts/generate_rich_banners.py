import math
import os
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont, ImageFilter

BANNER_DIR = Path(__file__).resolve().parents[1] / "data" / "seed_images" / "banners"
BANNER_DIR.mkdir(parents=True, exist_ok=True)

def get_font(size: int, bold: bool = False):
    font_candidates = [
        "segoeuib.ttf" if bold else "segoeui.ttf",
        "arialbd.ttf" if bold else "arial.ttf",
        "tahomabd.ttf" if bold else "tahoma.ttf",
        "calibrib.ttf" if bold else "calibri.ttf",
    ]
    for font_name in font_candidates:
        try:
            return ImageFont.truetype(font_name, size)
        except Exception:
            continue
    return ImageFont.load_default()

def create_smooth_gradient(w: int, h: int, c_top_left, c_mid, c_bottom_right):
    base = Image.new("RGBA", (w, h), (0, 0, 0, 255))
    draw = ImageDraw.Draw(base)
    for y in range(h):
        ratio_y = y / h
        for x in range(0, w, 4):
            ratio_x = x / w
            diag = (ratio_x + ratio_y) / 2.0
            if diag < 0.5:
                sub_r = diag * 2.0
                r = int(c_top_left[0] * (1 - sub_r) + c_mid[0] * sub_r)
                g = int(c_top_left[1] * (1 - sub_r) + c_mid[1] * sub_r)
                b = int(c_top_left[2] * (1 - sub_r) + c_mid[2] * sub_r)
            else:
                sub_r = (diag - 0.5) * 2.0
                r = int(c_mid[0] * (1 - sub_r) + c_bottom_right[0] * sub_r)
                g = int(c_mid[1] * (1 - sub_r) + c_bottom_right[1] * sub_r)
                b = int(c_mid[2] * (1 - sub_r) + c_bottom_right[2] * sub_r)
            draw.rectangle([x, y, x + 4, y + 1], fill=(r, g, b, 255))
    return base

def add_glow_orb(img: Image.Image, cx: int, cy: int, radius: int, color_rgb, alpha=60):
    overlay = Image.new("RGBA", img.size, (0, 0, 0, 0))
    draw = ImageDraw.Draw(overlay)
    draw.ellipse([cx - radius, cy - radius, cx + radius, cy + radius], fill=(*color_rgb, alpha))
    overlay = overlay.filter(ImageFilter.GaussianBlur(radius // 2))
    img.alpha_composite(overlay)

def draw_grid_lines(draw: ImageDraw.Draw, w: int, h: int, color_rgba=(255, 255, 255, 12), step=80):
    for x in range(0, w, step):
        draw.line([(x, 0), (x, h)], fill=color_rgba, width=1)
    for y in range(0, h, step):
        draw.line([(0, y), (w, y)], fill=color_rgba, width=1)

def draw_pill(draw: ImageDraw.Draw, x: int, y: int, text: str, font, bg_rgba, text_rgb, icon_prefix=""):
    full_text = f"{icon_prefix} {text}".strip()
    bbox = draw.textbbox((0, 0), full_text, font=font)
    tw, th = bbox[2] - bbox[0], bbox[3] - bbox[1]
    px, py = 24, 12
    card_w, card_h = tw + px * 2, th + py * 2
    r = card_h // 2
    draw.rounded_rectangle([x, y, x + card_w, y + card_h], radius=r, fill=bg_rgba, outline=(255, 255, 255, 60), width=1)
    draw.text((x + px, y + py - 2), full_text, font=font, fill=text_rgb)
    return card_w, card_h

def build_banner_asset(cfg: dict, is_web: bool) -> Image.Image:
    w, h = (2400, 750) if is_web else (1200, 1200)
    bg = create_smooth_gradient(w, h, cfg["colors"]["start"], cfg["colors"]["mid"], cfg["colors"]["end"])
    
    # Ambient glows
    for orb in cfg.get("orbs", []):
        ox = int(orb["x"] * w)
        oy = int(orb["y"] * h)
        add_glow_orb(bg, ox, oy, int(orb["r"] * (w / 2400.0)), orb["color"], orb.get("alpha", 70))

    draw = ImageDraw.Draw(bg)
    draw_grid_lines(draw, w, h, (255, 255, 255, 10), step=70 if is_web else 50)

    # Decorative background shapes
    accent_c = cfg["colors"]["accent"]
    
    if is_web:
        # Web layout (16:5): Left content & Right Graphic Showcase
        cx_vis, cy_vis = int(w * 0.72), int(h * 0.5)
        
        # Right showcase background cards
        draw.rounded_rectangle([cx_vis - 420, cy_vis - 260, cx_vis + 460, cy_vis + 260], radius=32, fill=(15, 23, 42, 140), outline=(255, 255, 255, 30), width=2)
        draw.rounded_rectangle([cx_vis - 380, cy_vis - 220, cx_vis + 420, cy_vis + 220], radius=24, fill=(*cfg["colors"]["mid"], 90), outline=(*accent_c, 80), width=2)
        
        # Graphic motif in the showcase
        motif = cfg["motif"]
        if motif == "radar_network":
            for r in [60, 120, 180, 240]:
                draw.ellipse([cx_vis - r, cy_vis - r, cx_vis + r, cy_vis + r], outline=(*accent_c, 50), width=2)
            draw.line([(cx_vis - 260, cy_vis), (cx_vis + 260, cy_vis)], fill=(*accent_c, 60), width=2)
            draw.line([(cx_vis, cy_vis - 260), (cx_vis, cy_vis + 260)], fill=(*accent_c, 60), width=2)
            # Nodes
            nodes = [(-140, -80), (120, -110), (-90, 130), (160, 90), (0, 0)]
            for nx, ny in nodes:
                px, py = cx_vis + nx, cy_vis + ny
                draw.ellipse([px - 14, py - 14, px + 14, py + 14], fill=(*accent_c, 240), outline=(255, 255, 255, 255), width=3)
                draw.line([(cx_vis, cy_vis), (px, py)], fill=(*accent_c, 100), width=2)

        elif motif == "blueprint_isometric":
            for i in range(5):
                bx = cx_vis - 200 + i * 90
                by = cy_vis + 140 - i * 40
                bw = 70
                bh = 120 + (i % 3) * 60
                draw.rectangle([bx, by - bh, bx + bw, by], fill=(*accent_c, 160), outline=(255, 255, 255, 200), width=2)
                draw.polygon([(bx, by - bh), (bx + bw // 2, by - bh - 30), (bx + bw, by - bh)], fill=(255, 255, 255, 220))

        elif motif == "ai_brain_spark":
            for angle_deg in range(0, 360, 30):
                rad = math.radians(angle_deg)
                x1 = cx_vis + int(math.cos(rad) * 70)
                y1 = cy_vis + int(math.sin(rad) * 70)
                x2 = cx_vis + int(math.cos(rad) * 220)
                y2 = cy_vis + int(math.sin(rad) * 220)
                draw.line([(x1, y1), (x2, y2)], fill=(*accent_c, 120), width=3)
                draw.ellipse([x2 - 10, y2 - 10, x2 + 10, y2 + 10], fill=(255, 255, 255, 240))
            draw.ellipse([cx_vis - 80, cy_vis - 80, cx_vis + 80, cy_vis + 80], fill=(*cfg["colors"]["start"], 230), outline=(*accent_c, 255), width=4)

        elif motif == "verified_shield":
            pts = [
                (cx_vis, cy_vis - 160),
                (cx_vis + 140, cy_vis - 100),
                (cx_vis + 120, cy_vis + 60),
                (cx_vis, cy_vis + 170),
                (cx_vis - 120, cy_vis + 60),
                (cx_vis - 140, cy_vis - 100),
            ]
            draw.polygon(pts, fill=(*accent_c, 210), outline=(255, 255, 255, 240))
            draw.line([(cx_vis - 50, cy_vis), (cx_vis - 10, cy_vis + 45), (cx_vis + 60, cy_vis - 50)], fill=(255, 255, 255, 255), width=16)

        elif motif == "cv_document":
            draw.rounded_rectangle([cx_vis - 140, cy_vis - 180, cx_vis + 140, cy_vis + 180], radius=16, fill=(255, 255, 255, 240), outline=(*accent_c, 255), width=4)
            draw.ellipse([cx_vis - 100, cy_vis - 140, cx_vis - 40, cy_vis - 80], fill=(*accent_c, 220))
            draw.rectangle([cx_vis - 20, cy_vis - 130, cx_vis + 100, cy_vis - 110], fill=(30, 41, 59, 200))
            draw.rectangle([cx_vis - 20, cy_vis - 100, cx_vis + 70, cy_vis - 86], fill=(100, 116, 139, 180))
            for ly in range(cy_vis - 40, cy_vis + 140, 32):
                draw.rounded_rectangle([cx_vis - 100, ly, cx_vis + 100, ly + 14], radius=4, fill=(203, 213, 225, 220))

        elif motif == "hrm_analytics":
            bars = [120, 190, 140, 240, 290, 210]
            for bi, bh in enumerate(bars):
                bx = cx_vis - 200 + bi * 70
                by = cy_vis + 130
                draw.rounded_rectangle([bx, by - bh, bx + 44, by], radius=8, fill=(*accent_c, 220), outline=(255, 255, 255, 200), width=2)
            pts = [(cx_vis - 180 + bi * 70, cy_vis + 130 - bh - 20) for bi, bh in enumerate(bars)]
            for i in range(len(pts) - 1):
                draw.line([pts[i], pts[i+1]], fill=(255, 255, 255, 255), width=6)
                draw.ellipse([pts[i][0] - 8, pts[i][1] - 8, pts[i][0] + 8, pts[i][1] + 8], fill=(*accent_c, 255), outline=(255, 255, 255, 255), width=2)

        else:
            draw.ellipse([cx_vis - 180, cy_vis - 180, cx_vis + 180, cy_vis + 180], fill=(*accent_c, 180), outline=(255, 255, 255, 255), width=4)
            draw.ellipse([cx_vis - 110, cy_vis - 110, cx_vis + 110, cy_vis + 110], fill=(*cfg["colors"]["start"], 220), outline=(255, 255, 255, 180), width=3)

        # Floating badges on right showcase
        font_pill = get_font(26, bold=True)
        draw_pill(draw, cx_vis - 340, cy_vis - 230, cfg.get("stat_1", "Square Top 1"), font_pill, (15, 23, 42, 220), (255, 255, 255), "⚡")
        draw_pill(draw, cx_vis + 120, cy_vis + 160, cfg.get("stat_2", "Tuyển dụng 24/7"), font_pill, (15, 23, 42, 220), (accent_c), "★")

        # Left Text Layout
        lx = 140
        # Category Tag
        font_tag = get_font(26, bold=True)
        draw_pill(draw, lx, 110, cfg["tag"], font_tag, (*accent_c, 210), (255, 255, 255), "✦")

        # Main Title (h1)
        font_title = get_font(66, bold=True)
        draw.text((lx, 185), cfg["title_line_1"], font=font_title, fill=(255, 255, 255))
        if cfg.get("title_line_2"):
            draw.text((lx, 265), cfg["title_line_2"], font=font_title, fill=accent_c)

        # Subtitle / Description
        font_sub = get_font(30, bold=False)
        desc_y = 360 if cfg.get("title_line_2") else 285
        draw.text((lx, desc_y), cfg["subtitle"], font=font_sub, fill=(226, 232, 240))
        if cfg.get("sub_items"):
            draw.text((lx, desc_y + 48), cfg["sub_items"], font=get_font(24, bold=True), fill=(148, 163, 184))

        # CTA Button
        btn_y = 520
        btn_w, btn_h = 360, 76
        draw.rounded_rectangle([lx, btn_y, lx + btn_w, btn_y + btn_h], radius=38, fill=(*accent_c, 255), outline=(255, 255, 255, 200), width=2)
        font_btn = get_font(30, bold=True)
        btn_text = f"{cfg['btn_text']}  →"
        bbox = draw.textbbox((0, 0), btn_text, font=font_btn)
        tw = bbox[2] - bbox[0]
        draw.text((lx + (btn_w - tw) // 2, btn_y + 18), btn_text, font=font_btn, fill=(255, 255, 255))

    else:
        # Mobile layout (1:1 - 1200x1200)
        cx, cy = w // 2, h // 2
        draw.rounded_rectangle([70, 70, w - 70, h - 70], radius=40, fill=(15, 23, 42, 160), outline=(255, 255, 255, 40), width=2)
        draw.ellipse([cx - 160, 240, cx + 160, 560], fill=(*accent_c, 190), outline=(255, 255, 255, 240), width=4)
        
        motif = cfg["motif"]
        if motif == "verified_shield":
            draw.line([(cx - 45, 390), (cx - 10, 435), (cx + 55, 350)], fill=(255, 255, 255, 255), width=16)
        elif motif == "cv_document":
            draw.rounded_rectangle([cx - 70, 310, cx + 70, 490], radius=12, fill=(255, 255, 255, 240))
            draw.rectangle([cx - 45, 350, cx + 45, 365], fill=(30, 41, 59, 220))
            draw.rectangle([cx - 45, 385, cx + 45, 397], fill=(100, 116, 139, 200))
            draw.rectangle([cx - 45, 415, cx + 25, 427], fill=(100, 116, 139, 200))
        elif motif == "ai_brain_spark":
            draw.ellipse([cx - 45, 355, cx + 45, 445], fill=(255, 255, 255, 255))
            for ang in [0, 90, 180, 270]:
                rad = math.radians(ang)
                draw.line([(cx, 400), (cx + int(math.cos(rad) * 90), 400 + int(math.sin(rad) * 90))], fill=(255, 255, 255, 255), width=6)
        else:
            draw.polygon([(cx, 310), (cx + 80, 460), (cx - 80, 460)], fill=(255, 255, 255, 240))

        # Tag
        font_tag = get_font(28, bold=True)
        draw_pill(draw, cx - 180, 120, cfg["tag"], font_tag, (*accent_c, 220), (255, 255, 255), "✦")

        # Title
        font_title = get_font(52, bold=True)
        bbox = draw.textbbox((0, 0), cfg["title_line_1"], font=font_title)
        tw = bbox[2] - bbox[0]
        draw.text((cx - tw // 2, 620), cfg["title_line_1"], font=font_title, fill=(255, 255, 255))
        
        if cfg.get("title_line_2"):
            bbox2 = draw.textbbox((0, 0), cfg["title_line_2"], font=font_title)
            tw2 = bbox2[2] - bbox2[0]
            draw.text((cx - tw2 // 2, 685), cfg["title_line_2"], font=font_title, fill=accent_c)

        # Subtitle
        font_sub = get_font(26, bold=False)
        sub_text = cfg["subtitle"]
        bbox_sub = draw.textbbox((0, 0), sub_text, font=font_sub)
        tw_sub = bbox_sub[2] - bbox_sub[0]
        draw.text((cx - tw_sub // 2, 780), sub_text, font=font_sub, fill=(203, 213, 225))

        if cfg.get("stat_1"):
            font_pill = get_font(24, bold=True)
            draw_pill(draw, cx - 180, 840, cfg["stat_1"], font_pill, (15, 23, 42, 220), (accent_c), "★")

        # Mobile CTA Button
        btn_y = 960
        btn_w, btn_h = 420, 84
        draw.rounded_rectangle([cx - btn_w // 2, btn_y, cx + btn_w // 2, btn_y + btn_h], radius=42, fill=(*accent_c, 255), outline=(255, 255, 255, 200), width=2)
        font_btn = get_font(32, bold=True)
        btn_text = f"{cfg['btn_text']}  →"
        bbox = draw.textbbox((0, 0), btn_text, font=font_btn)
        tw = bbox[2] - bbox[0]
        draw.text((cx - tw // 2, btn_y + 22), btn_text, font=font_btn, fill=(255, 255, 255))

    return bg.convert("RGB")


# Catalog of 13 banners with distinct color palettes and themes
BANNERS_CONFIG = {
    "home_square_recruitment": {
        "tag": "SQUARE RECRUITMENT 2026",
        "title_line_1": "NỀN TẢNG TUYỂN DỤNG",
        "title_line_2": "NGÀNH DỰ ÁN TRỌNG ĐIỂM",
        "subtitle": "Kết nối hơn 50.000 kỹ sư và chuyên gia với các doanh nghiệp đầu ngành",
        "sub_items": "Xây dựng · Bất động sản · Nội thất · Kiến trúc · Quản lý dự án",
        "btn_text": "Khám phá việc làm",
        "stat_1": "Top 1 Nền tảng Dự án",
        "stat_2": "50.000+ Ứng viên",
        "motif": "radar_network",
        "colors": {
            "start": (10, 25, 47),
            "mid": (30, 58, 138),
            "end": (2, 132, 199),
            "accent": (245, 158, 11),
        },
        "orbs": [
            {"x": 0.8, "y": 0.3, "r": 350, "color": (59, 130, 246), "alpha": 90},
            {"x": 0.2, "y": 0.7, "r": 280, "color": (245, 158, 11), "alpha": 60},
        ],
    },
    "home_construction": {
        "tag": "CONSTRUCTION & SITE ENGINEERING",
        "title_line_1": "KỸ SƯ XÂY DỰNG",
        "title_line_2": "& GIÁM SÁT CÔNG TRƯỜNG",
        "subtitle": "Chốt đội ngũ chỉ huy trưởng, kỹ sư hiện trường và QA/QC vững tay nghề",
        "sub_items": "Site Engineer · Chỉ huy trưởng · An toàn HSE · Kết cấu hạ tầng",
        "btn_text": "Xem cơ hội ngay",
        "stat_1": "1.200+ Việc làm Hot",
        "stat_2": "Lương đến 60M+",
        "motif": "blueprint_isometric",
        "colors": {
            "start": (15, 23, 42),
            "mid": (30, 41, 59),
            "end": (22, 101, 52),
            "accent": (249, 115, 22),
        },
        "orbs": [
            {"x": 0.75, "y": 0.4, "r": 320, "color": (249, 115, 22), "alpha": 80},
            {"x": 0.9, "y": 0.8, "r": 260, "color": (34, 197, 94), "alpha": 70},
        ],
    },
    "home_real_estate": {
        "tag": "REAL ESTATE & PROJECT SALES",
        "title_line_1": "BẤT ĐỘNG SẢN CAO CẤP",
        "title_line_2": "& PHÁT TRIỂN DỰ ÁN",
        "subtitle": "Tuyển dụng chuyên viên tư vấn đầu tư, quản lý sàn và giám đốc kinh doanh",
        "sub_items": "Phát triển quỹ đất · Quản lý sàn F1 · Chuyên viên tư vấn đầu tư",
        "btn_text": "Tìm việc BĐS",
        "stat_1": "Hoa hồng không giới hạn",
        "stat_2": "800+ Dự án VIP",
        "motif": "luxury_circles",
        "colors": {
            "start": (8, 19, 37),
            "mid": (29, 78, 216),
            "end": (79, 70, 229),
            "accent": (234, 179, 8),
        },
        "orbs": [
            {"x": 0.8, "y": 0.3, "r": 340, "color": (234, 179, 8), "alpha": 80},
            {"x": 0.3, "y": 0.8, "r": 240, "color": (79, 70, 229), "alpha": 60},
        ],
    },
    "home_interior": {
        "tag": "INTERIOR DESIGN & FIT-OUT",
        "title_line_1": "THIẾT KẾ NỘI THẤT",
        "title_line_2": "& THI CÔNG FIT-OUT",
        "subtitle": "Tuyển Kiến trúc sư Nội thất, 3D Visualizer và Quản lý triển khai thực tế",
        "sub_items": "3D Render · Fit-out Manager · Thiết kế Concept · Vật liệu cao cấp",
        "btn_text": "Xem việc phù hợp",
        "stat_1": "Showroom & Villa",
        "stat_2": "Thẩm mỹ đỉnh cao",
        "motif": "luxury_circles",
        "colors": {
            "start": (17, 24, 39),
            "mid": (154, 52, 18),
            "end": (217, 119, 6),
            "accent": (245, 158, 11),
        },
        "orbs": [
            {"x": 0.75, "y": 0.35, "r": 360, "color": (217, 119, 6), "alpha": 90},
            {"x": 0.85, "y": 0.75, "r": 250, "color": (239, 68, 68), "alpha": 70},
        ],
    },
    "home_architecture": {
        "tag": "ARCHITECTURE & BIM TECHNOLOGY",
        "title_line_1": "KIẾN TRÚC & MÔ HÌNH BIM",
        "title_line_2": "QUY HOẠCH ĐÔ THỊ",
        "subtitle": "KTS chủ trì, BIM Manager, Kỹ sư kết cấu và Chuyên gia quy hoạch dự án",
        "sub_items": "Revit · BIM Coordinator · KTS Concept · Kết cấu công trình",
        "btn_text": "Khám phá ngành",
        "stat_1": "Chuẩn BIM Quốc Tế",
        "stat_2": "Dự án Biểu Tượng",
        "motif": "blueprint_isometric",
        "colors": {
            "start": (9, 13, 22),
            "mid": (14, 116, 144),
            "end": (99, 102, 241),
            "accent": (6, 182, 212),
        },
        "orbs": [
            {"x": 0.75, "y": 0.4, "r": 340, "color": (6, 182, 212), "alpha": 90},
            {"x": 0.85, "y": 0.8, "r": 280, "color": (99, 102, 241), "alpha": 70},
        ],
    },
    "home_ai_interview": {
        "tag": "AI INTERVIEW & SKILLS MATCH",
        "title_line_1": "PHỎNG VẤN AI THÔNG MINH",
        "title_line_2": "& ĐÁNH GIÁ NĂNG LỰC 24/7",
        "subtitle": "Trợ lý AI phỏng vấn trực tiếp, phân tích kỹ năng và đề xuất việc làm chuẩn xác",
        "sub_items": "Voice AI · Báo cáo năng lực chi tiết · Gợi ý việc làm tức thì",
        "btn_text": "Trải nghiệm AI",
        "stat_1": "AI Match 98%",
        "stat_2": "Phỏng vấn tức thì",
        "motif": "ai_brain_spark",
        "colors": {
            "start": (30, 27, 75),
            "mid": (79, 70, 229),
            "end": (6, 182, 212),
            "accent": (168, 85, 247),
        },
        "orbs": [
            {"x": 0.75, "y": 0.35, "r": 350, "color": (168, 85, 247), "alpha": 90},
            {"x": 0.85, "y": 0.75, "r": 280, "color": (6, 182, 212), "alpha": 80},
        ],
    },
    "home_mep_engineering": {
        "tag": "MEP & SMART INFRASTRUCTURE",
        "title_line_1": "KỸ SƯ CƠ ĐIỆN MEP",
        "title_line_2": "& NĂNG LƯỢNG THÔNG MINH",
        "subtitle": "Hàng trăm vị trí Kỹ sư HVAC, Điện nhẹ ELV, PCCC & Tự động hóa công trình",
        "sub_items": "HVAC · Điện - Tự động hóa · Cấp thoát nước · Hệ thống PCCC",
        "btn_text": "Khám phá việc MEP",
        "stat_1": "500+ Việc làm MEP",
        "stat_2": "Đãi ngộ hấp dẫn",
        "motif": "radar_network",
        "colors": {
            "start": (4, 47, 46),
            "mid": (5, 150, 105),
            "end": (132, 204, 22),
            "accent": (16, 185, 129),
        },
        "orbs": [
            {"x": 0.75, "y": 0.4, "r": 340, "color": (16, 185, 129), "alpha": 90},
            {"x": 0.85, "y": 0.8, "r": 260, "color": (132, 204, 22), "alpha": 70},
        ],
    },
    "home_project_management": {
        "tag": "PROJECT MANAGEMENT & QS",
        "title_line_1": "QUẢN LÝ DỰ ÁN (PM)",
        "title_line_2": "& DỰ TOÁN ĐẤU THẦU (QS)",
        "subtitle": "Kết nối Giám đốc Ban QLDA, Chuyên viên Dự toán QS & Quản lý Chi phí Cao cấp",
        "sub_items": "Project Manager · Quantity Surveyor · Quản lý hợp đồng FIDIC",
        "btn_text": "Xem vị trí Hot",
        "stat_1": "Vị trí Cấp Cao",
        "stat_2": "Tổng thầu Uy Tín",
        "motif": "hrm_analytics",
        "colors": {
            "start": (24, 24, 27),
            "mid": (37, 99, 235),
            "end": (225, 29, 72),
            "accent": (239, 68, 68),
        },
        "orbs": [
            {"x": 0.75, "y": 0.35, "r": 340, "color": (225, 29, 72), "alpha": 80},
            {"x": 0.85, "y": 0.75, "r": 280, "color": (37, 99, 235), "alpha": 80},
        ],
    },
    # Right Sidebar Ads
    "right_hiring": {
        "tag": "TUYỂN DỤNG NHANH 24H",
        "title_line_1": "ĐĂNG TIN TUYỂN DỤNG",
        "title_line_2": "TIẾP CẬN 50.000+ KỸ SƯ",
        "subtitle": "Thu hút ứng viên chất lượng ngành dự án tức thì",
        "btn_text": "Đăng tin ngay",
        "stat_1": "50.000+ Ứng viên",
        "stat_2": "Tuyển nhanh 24h",
        "motif": "radar_network",
        "colors": {
            "start": (15, 23, 42),
            "mid": (37, 99, 235),
            "end": (30, 58, 138),
            "accent": (245, 158, 11),
        },
        "orbs": [
            {"x": 0.5, "y": 0.4, "r": 320, "color": (245, 158, 11), "alpha": 80},
        ],
    },
    "right_cv_builder": {
        "tag": "CV BUILDER PRO",
        "title_line_1": "TẠO CV CHUẨN NGHỀ",
        "title_line_2": "HOÀN TOÀN MIỄN PHÍ",
        "subtitle": "Mẫu CV thiết kế riêng cho ngành Xây dựng & Kiến trúc",
        "btn_text": "Tạo CV ngay",
        "stat_1": "Mẫu Chuẩn ATS",
        "stat_2": "Đánh giá bởi AI",
        "motif": "cv_document",
        "colors": {
            "start": (59, 7, 100),
            "mid": (147, 51, 234),
            "end": (225, 29, 72),
            "accent": (236, 72, 153),
        },
        "orbs": [
            {"x": 0.5, "y": 0.4, "r": 320, "color": (236, 72, 153), "alpha": 90},
        ],
    },
    "right_ai_assistant": {
        "tag": "SMART AI RECRUITER",
        "title_line_1": "TRỢ LÝ AI SÀNG LỌC",
        "title_line_2": "TIẾT KIỆM 80% THỜI GIAN",
        "subtitle": "Tự động phân tích CV và xếp hạng ứng viên phù hợp",
        "btn_text": "Khám phá AI",
        "stat_1": "Sàng lọc 5 giây",
        "stat_2": "Chính xác 98%",
        "motif": "ai_brain_spark",
        "colors": {
            "start": (8, 51, 68),
            "mid": (14, 116, 144),
            "end": (6, 182, 212),
            "accent": (56, 189, 248),
        },
        "orbs": [
            {"x": 0.5, "y": 0.4, "r": 320, "color": (56, 189, 248), "alpha": 90},
        ],
    },
    "right_hrm_suite": {
        "tag": "HRM ENTERPRISE SUITE",
        "title_line_1": "QUẢN TRỊ NHÂN SỰ HRM",
        "title_line_2": "CHẤM CÔNG & LƯƠNG TỰ ĐỘNG",
        "subtitle": "Hệ thống quản lý hợp đồng và nhân sự công trường",
        "btn_text": "Trải nghiệm HRM",
        "stat_1": "Tự động 100%",
        "stat_2": "Dành cho nhà thầu",
        "motif": "hrm_analytics",
        "colors": {
            "start": (6, 78, 59),
            "mid": (13, 148, 136),
            "end": (16, 185, 129),
            "accent": (52, 211, 153),
        },
        "orbs": [
            {"x": 0.5, "y": 0.4, "r": 320, "color": (52, 211, 153), "alpha": 90},
        ],
    },
    "right_employer_verify": {
        "tag": "VERIFIED EMPLOYER",
        "title_line_1": "DOANH NGHIỆP TÍCH XANH",
        "title_line_2": "TĂNG 300% ỨNG TUYỂN",
        "subtitle": "Khẳng định uy tín và tiếp cận top ứng viên chất lượng",
        "btn_text": "Xác thực ngay",
        "stat_1": "Tích Xanh Uy Tín",
        "stat_2": "Hồ sơ ưu tiên",
        "motif": "verified_shield",
        "colors": {
            "start": (23, 37, 84),
            "mid": (30, 58, 138),
            "end": (217, 119, 6),
            "accent": (245, 158, 11),
        },
        "orbs": [
            {"x": 0.5, "y": 0.4, "r": 320, "color": (245, 158, 11), "alpha": 90},
        ],
    },
}

def generate_all_banners():
    print(f"Generating rich banners to {BANNER_DIR} ...")
    count = 0
    for key, cfg in BANNERS_CONFIG.items():
        # Web version (2400x750)
        web_img = build_banner_asset(cfg, is_web=True)
        web_path = BANNER_DIR / f"{key}_web.jpg"
        web_img.save(web_path, format="JPEG", quality=95)
        print(f"  [OK] Saved {web_path.name} ({web_img.size})")

        # Mobile version (1200x1200)
        mob_img = build_banner_asset(cfg, is_web=False)
        mob_path = BANNER_DIR / f"{key}_mobile.jpg"
        mob_img.save(mob_path, format="JPEG", quality=95)
        print(f"  [OK] Saved {mob_path.name} ({mob_img.size})")
        count += 2

    print(f"\nSUCCESS! Generated {count} retina banner image assets.")

if __name__ == "__main__":
    generate_all_banners()
