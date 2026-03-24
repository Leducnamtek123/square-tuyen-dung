import json
import logging
from pathlib import Path

from apps.locations.models import City, District, Ward

logger = logging.getLogger(__name__)

def seed_locations():
    """
    Import Vietnamese administrative units from JSON data
    """
    # Try multiple possible paths to find the JSON file
    base_dir = Path(__file__).resolve().parents[5]
    paths_to_try = [
        base_dir / 'data' / 'location_data' / 'simplified_json_generated_data_vn_units.json',
        Path('data/location_data/simplified_json_generated_data_vn_units.json'),
        base_dir / 'data' / 'location_data' / 'simplified_json_generated_data_vn_units.json',
    ]
    
    json_path = None
    for path in paths_to_try:
        if path.exists():
            json_path = str(path)
            break

    if not json_path:
        logger.error(f"Không tìm thấy file dữ liệu JSON tại các đường dẫn: {paths_to_try}")
        return

    logger.info(f"Bắt đầu nạp dữ liệu tỉnh thành từ: {json_path}")
    
    try:
        with open(json_path, 'r', encoding='utf-8') as f:
            data = json.load(f)

        city_count = 0
        district_count = 0
        ward_count = 0

        for province_data in data:
            # Match by code or name
            city = City.objects.filter(code=province_data['Code']).first()
            if not city:
                city = City.objects.filter(name=province_data['Name']).first()
                if not city:
                    city = City.objects.filter(name=province_data['FullName']).first()
            
            if city:
                city.code = province_data['Code']
                city.name = province_data['FullName']
                city.save()
            else:
                city = City.objects.create(
                    code=province_data['Code'],
                    name=province_data['FullName']
                )
                city_count += 1
            
            for district_data in (province_data.get('District') or []):
                district = District.objects.filter(code=district_data['Code']).first()
                if not district:
                    district = District.objects.filter(name=district_data['Name'], city=city).first()
                    if not district:
                        district = District.objects.filter(name=district_data['FullName'], city=city).first()
                
                if district:
                    district.code = district_data['Code']
                    district.name = district_data['FullName']
                    district.city = city
                    district.save()
                else:
                    district = District.objects.create(
                        code=district_data['Code'],
                        name=district_data['FullName'],
                        city=city
                    )
                    district_count += 1
                
                for ward_data in (district_data.get('Ward') or []):
                    # For wards, we use update_or_create as there are many
                    ward, created = Ward.objects.update_or_create(
                        code=ward_data['Code'],
                        defaults={
                            'name': ward_data['FullName'],
                            'district': district
                        }
                    )
                    if created:
                        ward_count += 1

        logger.info(f"Thành công! Đã nạp xong: {city_count} tỉnh thành mới, {district_count} quận huyện mới, {ward_count} phường xã mới.")
        logger.info(f"Tổng cộng hiện có: {City.objects.count()} tỉnh thành, {District.objects.count()} quận huyện, {Ward.objects.count()} phường xã.")
        
    except Exception as e:
        logger.error(f"Lỗi khi nạp dữ liệu: {str(e)}")
