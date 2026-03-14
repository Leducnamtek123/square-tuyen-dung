from common.models import Career

def seed_careers():
    """
    Seed Square-specific careers based on Vietnam Standard Industrial Classification (VSIC)
    """
    print("Bắt đầu nạp danh mục ngành nghề...")
    
    careers_data = [
        # Nhóm Xây dựng (Chuẩn Square)
        "Xây dựng nhà các loại",
        "Xây dựng công trình kỹ thuật dân dụng",
        "Hoạt động xây dựng chuyên dụng",
        "Trình diễn và lắp đặt cửa, cửa sổ",
        "Sơn và trang trí kính",
        "Lắp đặt hệ thống điện",
        "Lắp đặt hệ thống cấp thoát nước, lò sưởi và điều hoà không khí",
        "Hoàn thiện công trình xây dựng",
        
        # Nhóm Kiến trúc & Kỹ thuật
        "Hoạt động kiến trúc",
        "Tư vấn kỹ thuật và các hoạt động liên quan",
        "Thiết kế chuyên dụng (nội thất, thời trang, đồ họa)",
        "Thiết kế công nghiệp",
        
        # Nhóm bổ trợ
        "Kinh doanh bất động sản",
        "Quản lý dự án xây dựng",
        "Giám sát thi công xây dựng",
        "Bán buôn vật liệu xây dựng",
        "Công nghệ thông tin (Software)",
        "Marketing / Quảng cáo",
        "Kế toán / Kiểm toán",
        "Nhân sự / Hành chính"
    ]
    
    count = 0
    for name in careers_data:
        _, created = Career.objects.get_or_create(name=name)
        if created:
            count += 1
            
    print(f"Thành công! Đã thêm {count} ngành nghề mới vào hệ thống.")
