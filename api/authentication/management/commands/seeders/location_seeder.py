import requests
from bs4 import BeautifulSoup
from common.models import City

def seed_locations():
    """
    Crawl 63 provinces of Vietnam from Wikipedia
    """
    url = "https://vi.wikipedia.org/wiki/Danh_s%C3%A1ch_c%C3%A1c_%C4%91%C6%A1n_v%E1%BB%8B_h%C3%A0nh_ch%C3%ADnh_c%E1%BA%A5p_t%E1%BB%89nh_Vi%E1%BB%87t_Nam"
    print(f"Bắt đầu crawl dữ liệu tỉnh thành từ: {url}")
    
    try:
        response = requests.get(url, timeout=10)
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Tìm bảng chứa danh sách tỉnh thành (thường là bảng có class 'wikitable')
        table = soup.find('table', {'class': 'wikitable'})
        if not table:
            print("Không tìm thấy bảng dữ liệu trên Wikipedia.")
            return

        rows = table.find_all('tr')
        count = 0
        for row in rows[1:]:  # Bỏ qua dòng tiêu đề
            cols = row.find_all('td')
            if len(cols) > 1:
                # Cột tên tỉnh thường nằm ở cột thứ 2 (index 1) hoặc có thẻ 'a'
                city_name = cols[1].text.strip()
                
                # Cleanup tên (ví dụ bỏ các phần chú thích [1], [2])
                import re
                city_name = re.sub(r'\[.*?\]', '', city_name)
                
                city, created = City.objects.get_or_create(name=city_name)
                if created:
                    count += 1
        
        print(f"Thành công! Đã thêm mới {count} tỉnh thành vào hệ thống.")
        
    except Exception as e:
        print(f"Lỗi khi crawl tỉnh thành: {str(e)}")
