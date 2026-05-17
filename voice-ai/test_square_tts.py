import requests
import json
import time

url = "http://localhost:8298/v1/audio/speech"
payload = {
    "input": "Xin chào! Đây là bản tin thử nghiệm âm thanh từ cụm dịch vụ Square AI. Hệ thống nói đã hoạt động cực kỳ mượt mà. Xin chào! Đây là bản tin thử nghiệm âm thanh từ cụm dịch vụ Square AI. Hệ thống nói đã hoạt động cực kỳ mượt mà. Xin chào! Đây là bản tin thử nghiệm âm thanh từ cụm dịch vụ Square AI. Hệ thống nói đã hoạt động cực kỳ mượt mà.Xin chào! Đây là bản tin thử nghiệm âm thanh từ cụm dịch vụ Square AI. Hệ thống nói đã hoạt động cực kỳ mượt mà.Xin chào! Đây là bản tin thử nghiệm âm thanh từ cụm dịch vụ Square AI. Hệ thống nói đã hoạt động cực kỳ mượt mà.",
    "model": "tts-1",
    "voice": "Ly",
    "response_format": "mp3"
}

output_file = "square_tts_audio_ready.mp3"

print(f"Đang gửi yêu cầu TTS tới {url}...")
start_time = time.time()
try:
    response = requests.post(url, json=payload, timeout=120)
    elapsed = time.time() - start_time
    print(f"Mã trạng thái (Status Code): {response.status_code}")
    print(f"Thời gian xử lý: {elapsed:.2f} giây")
    
    if response.status_code == 200:
        with open(output_file, "wb") as f:
            f.write(response.content)
        print(f"Thành công rực rỡ! Đã lưu file tại: {output_file}")
    else:
        print(f"Lỗi từ server: {response.text}")
except Exception as e:
    print(f"Kết nối thất bại: {e}")
