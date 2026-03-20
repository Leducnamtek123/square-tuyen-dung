with open(r'c:\Users\leduc\Documents\square-tuyen-dung-1\api\apps\jobs\views\web_views.py', 'rb') as f:
    lines = f.readlines()
    for i in range(447, 455):
        print(f"Line {i+1}: {lines[i]}")
