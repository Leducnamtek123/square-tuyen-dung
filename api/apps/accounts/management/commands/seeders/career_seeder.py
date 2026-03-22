"""
Career Seeder
Giữ toàn bộ 40 ngành nghề gốc (đa ngành) + bổ sung thêm các ngành
chuyên biệt cho lĩnh vực Xây dựng & Thiết kế từ ID 41 trở đi.
"""
from common.models import Career


def seed_careers():
    """Seed danh mục ngành nghề: giữ nguyên 40 ngành gốc + thêm xây dựng/thiết kế."""
    print("Bắt đầu nạp danh mục ngành nghề...")

    careers_data = [
        # ── 40 ngành gốc (giữ nguyên) ──────────────────────────────────────
        {"id": 1,  "name": "Kinh doanh / Bán hàng"},
        {"id": 2,  "name": "Công nghệ thông tin (IT - Phần mềm)"},
        {"id": 3,  "name": "Marketing / Truyền thông / Quảng cáo"},
        {"id": 4,  "name": "Dịch vụ khách hàng / Chăm sóc khách hàng"},
        {"id": 5,  "name": "Tài chính / Kế toán / Kiểm toán"},
        {"id": 6,  "name": "Nhân sự (HR) / Hành chính"},
        {"id": 7,  "name": "Logistics / Chuỗi cung ứng / Vận tải"},
        {"id": 8,  "name": "Sản xuất / Chế biến / Cơ khí"},
        {"id": 9,  "name": "Xây dựng / Kiến trúc / Kỹ thuật xây dựng"},
        {"id": 10, "name": "Y tế / Dược phẩm / Chăm sóc sức khỏe"},
        {"id": 11, "name": "Giáo dục / Đào tạo"},
        {"id": 12, "name": "Du lịch / Khách sạn / Nhà hàng"},
        {"id": 13, "name": "Bất động sản"},
        {"id": 14, "name": "Thiết kế / Đồ họa / Sáng tạo (UI/UX, Graphic)"},
        {"id": 15, "name": "Thương mại điện tử / E-commerce"},
        {"id": 16, "name": "Ngân hàng / Bảo hiểm"},
        {"id": 17, "name": "Kỹ thuật / Điện - Điện tử"},
        {"id": 18, "name": "Nghiên cứu & Phát triển sản phẩm (R&D)"},
        {"id": 19, "name": "Trí tuệ nhân tạo (AI) / Machine Learning"},
        {"id": 20, "name": "An ninh mạng / Cybersecurity"},
        {"id": 21, "name": "Năng lượng tái tạo / Môi trường"},
        {"id": 22, "name": "Bán lẻ / Siêu thị / FMCG"},
        {"id": 23, "name": "Pháp lý / Luật"},
        {"id": 24, "name": "Sản xuất nội dung / Media / Báo chí"},
        {"id": 25, "name": "Quản lý dự án"},
        {"id": 26, "name": "Biên phiên dịch / Ngoại ngữ"},
        {"id": 27, "name": "Công nghệ bán dẫn / Vi mạch"},
        {"id": 28, "name": "Sản xuất công nghệ cao"},
        {"id": 29, "name": "Nông nghiệp / Thủy sản / Lâm nghiệp"},
        {"id": 30, "name": "Ô tô / Cơ khí ô tô"},
        {"id": 31, "name": "Dược phẩm / Sinh học"},
        {"id": 32, "name": "Thời trang / May mặc"},
        {"id": 33, "name": "Sự kiện / Tổ chức sự kiện"},
        {"id": 34, "name": "Call center / Dịch vụ khách hàng trực tuyến"},
        {"id": 35, "name": "Quản trị kinh doanh / Quản lý"},
        {"id": 36, "name": "Kỹ sư cơ khí / Cơ điện"},
        {"id": 37, "name": "Digital Marketing"},
        {"id": 38, "name": "Data / Phân tích dữ liệu"},
        {"id": 39, "name": "Freelance / Remote / Làm việc tự do"},
        {"id": 40, "name": "Khác / Khác"},

        # ── Ngành chuyên biệt: Xây dựng & Thiết kế ────────────────────────
        {"id": 41, "name": "Kỹ sư Kết cấu / Địa kỹ thuật / Nền móng"},
        {"id": 42, "name": "Kỹ sư Cầu đường / Hạ tầng giao thông"},
        {"id": 43, "name": "Thiết kế nội thất / Kiến trúc nội thất"},
        {"id": 44, "name": "Kỹ sư Cơ điện M&E (Điện, HVAC, Plumbing)"},
        {"id": 45, "name": "Kỹ sư Phòng cháy chữa cháy (PCCC)"},
        {"id": 46, "name": "BIM Coordinator / BIM Manager"},
        {"id": 47, "name": "Giám sát thi công / Chỉ huy trưởng công trường"},
        {"id": 48, "name": "Dự toán công trình / Đo bóc khối lượng (QS)"},
        {"id": 49, "name": "An toàn lao động HSE công trình"},
        {"id": 50, "name": "Quản lý tòa nhà / Facility Management"},
        {"id": 51, "name": "Kiến trúc sư cảnh quan / Quy hoạch đô thị"},
        {"id": 52, "name": "Kinh doanh vật liệu xây dựng / Nội thất"},
        {"id": 53, "name": "Phát triển dự án xây dựng / Bất động sản"},
        {"id": 54, "name": "Pháp lý hợp đồng xây dựng / Đấu thầu"},
        {"id": 55, "name": "Công nhân kỹ thuật / Thợ lành nghề xây dựng"},
    ]

    created_count = 0
    updated_count = 0

    for item in careers_data:
        _, created = Career.objects.update_or_create(
            id=item["id"],
            defaults={"name": item["name"]},
        )
        if created:
            created_count += 1
        else:
            updated_count += 1

    print(
        "Thành công! "
        f"Đã tạo mới {created_count} ngành nghề, cập nhật {updated_count} ngành nghề."
    )
