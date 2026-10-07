# Tong Quan REST & WebSocket API (API Conventions)

> **Phan he**: 04-api  
> **Tai lieu**: overview.md  
> **Base URL**: `https://infohr.vn/api/v1/`  
> **Swagger UI**: `https://infohr.vn/swagger/`

---

## 1. Nguyen Tac Thiet Ke & Quy Chuan URI

- **Tieu chuan kien truc**: RESTful JSON API theo chuan OpenAPI 3.0.
- **Phien ban hoa (Versioning)**: Dat tien to version trong URI: `/api/v1/<resource>/`.
- **Dinh dang du lieu trao doi**: `application/json` voi ma hoa UTF-8 cho ca Request va Response.
- **Ten tai nguyen**: Danh tu so nhieu, chu thuong, ngan cach bang dau gach ngang kebab-case (Vi du: `/job-posts/`, `/applied-profiles/`, `/interview-scripts/`).

---

## 2. Cau Truc Response Chuan (Standard Response Envelope)

Tat ca cac phan hoi tu API bat buoc tuan thu cau truc envelope dong nhat:

### 2.1. Phan hoi thanh cong (Success Response)
```json
{
  "success": true,
  "data": {
    "id": 101,
    "title": "Senior Python Backend Engineer",
    "status": "ACTIVE"
  },
  "message": "Tao tin tuyen dung thanh cong.",
  "meta": {
    "timestamp": "2026-10-07T11:30:00Z"
  }
}
```

### 2.2. Phan hoi phan trang (Paginated Response)
```json
{
  "success": true,
  "data": [
    { "id": 1, "title": "React Frontend Developer" },
    { "id": 2, "title": "DevOps Engineer" }
  ],
  "meta": {
    "page": 1,
    "page_size": 20,
    "total_items": 45,
    "total_pages": 3,
    "has_next": true,
    "has_prev": false
  }
}
```

### 2.3. Phan hoi loi (Error Response)
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Du lieu gui len khong hop le.",
    "details": {
      "salary_min": ["Muc luong toi thieu khong duoc am."],
      "email": ["Email nay da ton tai trong he thong."]
    }
  },
  "meta": {
    "timestamp": "2026-10-07T11:30:00Z"
  }
}
```

---

## 3. Bang Ma Loi HTTP Chuan (HTTP Status Codes)

| Ma HTTP | Y nghia | Khi nao su dung |
| :--- | :--- | :--- |
| `200 OK` | Thanh cong | Yeu cau GET, PUT, PATCH hoac DELETE da xu ly xong. |
| `201 Created` | Da tao moi | Yeu cau POST tao moi mot thuc the thanh cong. |
| `204 No Content` | Thanh cong khong tra ve body | Thuong dung cho cac lenh DELETE thanh cong. |
| `400 Bad Request` | Loi du lieu dau vao | Payload sai dinh dang, loi validation hoac vi pham rang buoc nghiep vu. |
| `401 Unauthorized` | Chua xac thuc | Khong gui token JWT hoac token da het han/khong hop le. |
| `403 Forbidden` | Khong co quyen truy cap | Da xac thuc nhung tai khoan khong co quyen tren tai nguyen yeu cau. |
| `404 Not Found` | Khong tim thay | Id tai nguyen khong ton tai trong he thong hoac khong thuoc quyen so huu. |
| `409 Conflict` | Xung dot trang thai | Vi pham khoa bat bien (Vi du: Phong van dang dien ra, bang luong da khoa). |
| `429 Too Many Requests`| Vuot han muc goi API | Bi he thong Rate Limiter chan do gui qua nhieu request trong mot phut. |
| `500 Server Error` | Loi may chu noi bo | Ngoai le chua duoc bat trong code backend. |
