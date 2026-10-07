# Co Che Xac Thuc & Bao Mat API (Authentication & Security)

> **Phan he**: 04-api  
> **Tai lieu**: authentication.md  
> **Giao thuc**: JSON Web Token (JWT) & HMAC Webhook Signatures

---

## 1. Co Che Xac Thuc JWT (JSON Web Token)

He thong ap dung mo hinh cap doi Token: **Access Token** va **Refresh Token**:

- **Access Token**:
  - Thoi gian song: **60 phut**.
  - Chua thong tin: `user_id`, `email`, `role`, `company_id`.
  - Duoc truyen thong qua: Header `Authorization: Bearer <access_token>` hoac HttpOnly Cookie `access_token` (dam bao chong XSS tren Next.js).
- **Refresh Token**:
  - Thoi gian song: **14 ngay**.
  - Luu tru an toan trong HttpOnly Cookie hoac Redis store.
  - Dung de cap moi Access Token khi het han ma khong bat nguoi dung dang nhap lai:
    `POST /api/v1/auth/token/refresh/`

---

## 2. Dang Nhap Xa Hoi (Social OAuth2 Login)

Ho tro dang nhap mot cham bang tai khoan Google thong qua thu vien `drf-social-oauth2`:
- Endpoint: `POST /api/v1/auth/convert-token/`
- Payload:
```json
{
  "grant_type": "convert_token",
  "client_id": "<DJANGO_OAUTH_CLIENT_ID>",
  "client_secret": "<DJANGO_OAUTH_CLIENT_SECRET>",
  "backend": "google-oauth2",
  "token": "<GOOGLE_ID_TOKEN_FROM_CLIENT>"
}
```

---

## 3. Co Che Cap Phat Token Phong Van WebRTC (LiveKit Room Token)

Khi ung vien truy cap vao phong phong van Voice AI (`aila.infohr.vn/interview/<id>`), frontend goi backend de lay token WebRTC:

- **Endpoint**: `POST /api/v1/interview/join-room/`
- **Quy trinh cap token phia Backend**:
  1. Kiem tra phien phong van co ton tai va hop le.
  2. Kiem tra ung vien co dung la chu so huu cua ho so ung tuyen do hay khong.
  3. Su dung `livekit-api` de ky mot JWT token:
```python
from livekit import api

def generate_livekit_token(*, room_name: str, participant_identity: str, participant_name: str) -> str:
    token = api.AccessToken(settings.LIVEKIT_API_KEY, settings.LIVEKIT_API_SECRET) \
        .with_identity(participant_identity) \
        .with_name(participant_name) \
        .with_grants(api.VideoGrants(
            room_join=True,
            room=room_name,
            can_publish=True,
            can_subscribe=True,
        ))
    return token.to_jwt()
```

---

## 4. Xac Thuc Webhook Tu LiveKit (LiveKit Webhook Verification)

Cac su kien phong (`participant_joined`, `participant_left`, `room_finished`, `egress_ended`) duoc LiveKit Server gui ve backend qua webhook:

- **Endpoint**: `POST /api/v1/livekit/webhook`
- **Bao mat**: Backend su dung `TokenVerifier` cua LiveKit de kiem tra chu ky HMAC gui kem trong header `Authorization`. Neu chu ky khong khop voi `LIVEKIT_API_SECRET`, he thong tu choi xu ly ngay lap tuc (HTTP 401).
