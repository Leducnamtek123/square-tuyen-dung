# He Thong Thiet Ke Chuan Thuong Hieu Square (Square Design System)

> **Phan he**: 07-design  
> **Tai lieu**: design-system.md  
> **Nhan dien thuong hieu**: Square (square.vn) & InfoHR Platform  
> **Cong nghe UI**: Tailwind CSS v4, CSS Variables, Shadcn UI Tokens

---

## 1. Triet Ly Thiet Ke (Design Philosophy)

He thong thiet ke cua Square Tuyen Dung (InfoHR) duoc xay dung dua tren 4 gia tri cot loi:

1. **Chuyen nghiep & Minh bach (Enterprise Clarity)**:
   - Giao dien tap trung vao du lieu ro rang, de doc, giam thieu tieng on thi giac (Visual Noise).
   - Bo cuc luoi Bento Grid can doi, khoang cach thoang dang, cau truc thong tin nhat quan giua cac cong.
2. **Nang dong & Hien dai (Tech-Forward Vitality)**:
   - Mau cam chu dao cua thuong hieu Square mang den nang luong tich cuc, ket hop voi gam mau xanh cong nghe the hien su tin cay.
   - Hieu ung chuyen dong micro-interaction nhe nhang (transition duration 150-200ms) giup trai nghiem muot ma ma khong gay cham tre thao tac.
3. **Thich ung da nen tang (Multi-Device Responsive)**:
   - Giao dien hoat dong lien mach tu man hinh dien thoai (375px), may tinh bang (768px), laptop (1024px) den man hinh may tinh de ban lon (1440px+).
4. **Tiep can pho quat (Universal Accessibility)**:
   - Tuan thu chat che tieu chuan tuong phan WCAG 2.1 AA va ho tro ca Light Mode va Dark Mode hoan chinh.

---

## 2. He Thong Luoi & Khoang Cach (Spacing & Layout Grid)

He thong ap dung quy tac buoc nhay 4px va 8px cua Tailwind CSS:

- **Don vi co ban**: `4px` (`0.25rem`)
- **Khoang cach thuong dung**:
  - `p-1` (4px) / `p-2` (8px): Khoang cach nho ben trong badge, button icon.
  - `p-4` (16px) / `p-6` (24px): Padding tieu chuan cua the Card, Modal, Form dialog.
  - `gap-4` (16px) / `gap-6` (24px): Khoang cach giua cac cot luoi hoac thanh phan trong danh sach.
  - `py-8` (32px) / `py-12` (48px): Khoang cach phan chia cac section chinh tren trang.
- **Bo goc (Border Radius Tokens)**:
  - Small (`rounded-sm`): `2px` - Su dung cho checkbox, badge nho.
  - Medium (`rounded-md`): `6px` - Su dung cho input, button, select.
  - Large (`rounded-lg`): `8px` - Su dung cho card, dropdown container.
  - Extra Large (`rounded-xl`): `12px` - Su dung cho modal dialog, widget dashboard.
  - Full (`rounded-full`): `9999px` - Su dung cho avatar, pill tag.
