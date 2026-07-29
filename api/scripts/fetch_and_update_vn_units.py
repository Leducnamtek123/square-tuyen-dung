import urllib.request
import json
import os
import sys
from pathlib import Path

def clean_short_name(name, division_type):
    """
    Extract clean short name from full name based on division type.
    """
    prefixes = [
        "Thành phố ", "Tỉnh ", "Quận ", "Huyện ", "Thị xã ", "Phường ", "Xã ", "Thị trấn "
    ]
    for prefix in prefixes:
        if name.startswith(prefix):
            return name[len(prefix):]
    return name

def fetch_and_convert():
    url = "https://provinces.open-api.vn/api/?depth=3"
    print(f"Fetching latest data from {url}...")
    req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
    with urllib.request.urlopen(req) as response:
        raw_data = json.loads(response.read().decode('utf-8'))

    print(f"Fetched {len(raw_data)} provinces/cities.")

    converted_provinces = []
    total_districts = 0
    total_wards = 0

    for p in raw_data:
        p_code = str(p['code']).zfill(2)
        p_full_name = p['name']
        p_name = clean_short_name(p_full_name, p.get('division_type', ''))
        
        districts_list = []
        for d in p.get('districts', []):
            d_code = str(d['code']).zfill(3)
            d_full_name = d['name']
            d_name = clean_short_name(d_full_name, d.get('division_type', ''))
            
            wards_list = []
            for w in d.get('wards', []):
                w_code = str(w['code']).zfill(5)
                w_full_name = w['name']
                w_name = clean_short_name(w_full_name, w.get('division_type', ''))
                
                wards_list.append({
                    "Code": w_code,
                    "Name": w_name,
                    "FullName": w_full_name,
                    "CodeName": w.get('codename', ''),
                    "DistrictCode": d_code
                })
                total_wards += 1

            # Ensure custom new wards for Go Vap (code 764) like An Hoi Dong and An Hoi Tay are included
            if d_code == "764":
                ward_codes = [w["Code"] for w in wards_list]
                custom_wards = [
                    {"Code": "AN-HOI-DONG", "Name": "An Hội Đông", "FullName": "Phường An Hội Đông", "CodeName": "phuong_an_hoi_dong", "DistrictCode": "764"},
                    {"Code": "AN-HOI-TAY", "Name": "An Hội Tây", "FullName": "Phường An Hội Tây", "CodeName": "phuong_an_hoi_tay", "DistrictCode": "764"}
                ]
                for cw in custom_wards:
                    if cw["Code"] not in ward_codes:
                        wards_list.append(cw)
                        total_wards += 1

            districts_list.append({
                "Code": d_code,
                "Name": d_name,
                "FullName": d_full_name,
                "CodeName": d.get('codename', ''),
                "ProvinceCode": p_code,
                "Ward": wards_list
            })
            total_districts += 1

        converted_provinces.append({
            "Code": p_code,
            "Name": p_name,
            "FullName": p_full_name,
            "CodeName": p.get('codename', ''),
            "District": districts_list
        })

    print(f"Converted total: {len(converted_provinces)} provinces, {total_districts} districts, {total_wards} wards.")
    
    output_path = Path(__file__).resolve().parents[1] / "data" / "location_data" / "simplified_json_generated_data_vn_units.json"
    print(f"Writing to {output_path}...")
    with open(output_path, 'w', encoding='utf-8') as f:
        json.dump(converted_provinces, f, ensure_ascii=False, indent=1)
    
    print("Done writing JSON file successfully!")

if __name__ == '__main__':
    fetch_and_convert()
