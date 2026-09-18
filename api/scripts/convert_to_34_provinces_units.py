import urllib.request
import json
import os
import sys
from pathlib import Path

def clean_short_name(name):
    prefixes = [
        "Thành phố ", "Tỉnh ", "Quận ", "Huyện ", "Thị xã ", "Phường ", "Xã ", "Thị trấn ", "Đặc khu "
    ]
    for prefix in prefixes:
        if name.startswith(prefix):
            return name[len(prefix):]
    return name

def fetch_and_convert_34_provinces():
    url = "https://raw.githubusercontent.com/zuydd/vn-geo/main/json/tree.json"
    print(f"Fetching 34-province dataset from {url}...")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        raw_data = json.loads(response.read().decode('utf-8'))

    print(f"Fetched {len(raw_data)} provinces/cities.")

    converted_provinces = []
    total_districts = 0
    total_wards = 0

    for p in raw_data:
        p_code = str(p['code']).zfill(2)
        p_full_name = p.get('fullName') or p.get('name')
        p_name = clean_short_name(p_full_name)
        
        # Group wards by district if district information is available,
        # or create district structures per province to maintain City -> District -> Ward relationship
        wards = p.get('wards', [])
        
        # Group wards by their district name or type if available, or create default district(s)
        district_groups = {}
        for w in wards:
            d_name_raw = w.get('districtName') or w.get('district') or f"Đơn vị hành chính {p_name}"
            if d_name_raw not in district_groups:
                district_groups[d_name_raw] = []
            district_groups[d_name_raw].append(w)
        
        districts_list = []
        d_index = 1
        for d_name, d_wards in district_groups.items():
            d_code = f"{p_code}{str(d_index).zfill(2)}"
            d_full_name = d_name if d_name.startswith(("Quận", "Huyện", "Thị xã", "Thành phố", "Đơn vị")) else f"Quận/Huyện {d_name}"
            d_short_name = clean_short_name(d_full_name)
            
            wards_list = []
            for w in d_wards:
                w_code = str(w['code']).zfill(5)
                w_full_name = w.get('fullName') or w.get('name')
                w_short_name = clean_short_name(w_full_name)
                
                wards_list.append({
                    "Code": w_code,
                    "Name": w_short_name,
                    "FullName": w_full_name,
                    "CodeName": w.get('slug', ''),
                    "DistrictCode": d_code
                })
                total_wards += 1

            districts_list.append({
                "Code": d_code,
                "Name": d_short_name,
                "FullName": d_full_name,
                "CodeName": w.get('slug', '').split('_')[0] if d_wards else '',
                "ProvinceCode": p_code,
                "Ward": wards_list
            })
            total_districts += 1
            d_index += 1

        converted_provinces.append({
            "Code": p_code,
            "Name": p_name,
            "FullName": p_full_name,
            "CodeName": p.get('slug', ''),
            "District": districts_list
        })

    print(f"Converted total: {len(converted_provinces)} provinces, {total_districts} districts, {total_wards} wards.")
    
    output_path = Path(__file__).resolve().parents[1] / "data" / "location_data" / "simplified_json_generated_data_vn_units.json"
    print(f"Writing to {output_path}...")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(converted_provinces, f, ensure_ascii=False, indent=1)
    
    print("Done writing 34-province JSON file successfully!")

if __name__ == '__main__':
    fetch_and_convert_34_provinces()
