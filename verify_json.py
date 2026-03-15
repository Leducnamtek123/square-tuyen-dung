import json
with open('api/data/location_data/simplified_json_generated_data_vn_units.json', 'r', encoding='utf-8') as f:
    data = json.load(f)
print(f"Total provinces: {len(data)}")
dist_count = 0
ward_count = 0
for p in data:
    dist_count += len(p.get('District', []))
    for d in p.get('District', []):
        ward_count += len(d.get('Ward', []))
print(f"Total districts: {dist_count}")
print(f"Total wards: {ward_count}")
