# Quy Tac Bat Buoc & Gioi Han (Rules & Constraints)

> **Phan he**: 10-ai  
> **Tai lieu**: rules-and-constraints.md  
> **Pham vi**: Toan bo cac tro ly AI va lap trinh vien

---

## 1. Quy Tac Cam Dung Dau Em Dash (No Em Dash Rule)

- **Quy tac bat buoc**: **TUYET DOI KHONG SU DUNG DAU EM DASH (-)** trong bat ky file tai lieu nao, commit message nao hoac phan tra loi nao.
- **Giai phap thay the**: Su dung dau gach ngang don gian (`-`), dau hai cham (`:`) hoac dau gach noi co khoang trang (` - `).

---

## 2. Quy Tac Quoc Te Hoa (i18n Multi-Language Rule)

- Khong hardcode chuoi ky tu tieng Viet truc tiep ben trong component logic cua frontend.
- Tat ca cac chuoi van ban giao dien phai duoc goi thong qua hook da ngon ngu `useTranslation()` (i18next):
  ```typescript
  // ❌ SAI: Hardcode text tieng Viet
  <button>Xac nhan ung tuyen</button>

  // ✅ DUNG: Su dung i18n key
  <button>{t('job.apply.confirmButton')}</button>
  ```
- Duy tri cap nhat dong bo giua cac file ngon ngu `vi.json` va `en.json`.

---

## 3. Quy Tac Bao Ve Du Lieu & Moi Truong (Secret Hygiene)

1. Khong bao gio in toan bo noi dung cac file co chua tu khoa `.env`, `password`, `secret_key`, `token` ra console hay transcript.
2. Khong tao cac file tam chua thong tin chung thuc (nhu `.pem`, `.crt`) o thu muc goc ma khong co ly do va khong them vao `.gitignore`.

---

## 4. Quy Tac Service Layer O Backend

- `views.py` khong duoc chua logic ghi database phuc tap hoac goi nhieu model truc tiep.
- Tat ca logic tao, sua, xoa, tinh toan bat buoc viet trong `services.py`.
- Tat ca logic truy van doc phuc tap bat buoc viet trong `selectors.py`.
