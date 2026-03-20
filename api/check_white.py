with open(r'c:\Users\leduc\Documents\square-tuyen-dung-1\api\apps\jobs\views\web_views.py', 'rb') as f:
    lines = f.readlines()
    line_448 = lines[447] # 0-indexed
    print(f"Line 448 (raw): {line_448}")
    print(f"Hex: {line_448.hex()}")
