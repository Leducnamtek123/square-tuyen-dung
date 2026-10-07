# Tieu Chuan Kha Nang Tiep Can (Accessibility - a11y)

> **Phan he**: 06-frontend  
> **Tai lieu**: accessibility-a11y.md  
> **Tieu chuan**: Web Content Accessibility Guidelines (WCAG) 2.1 AA

---

## 1. Nguyen Tac Kha Nang Tiep Can (Core A11y Principles)

Giao dien InfoHR duoc thiet ke de moi nguoi dung, bao gom nguoi khiem thi, khiem thinh hoac nguoi chi su dung ban phim, deu co the su dung thuan tien va de dang:

1. **Cam nhan duoc (Perceivable)**:
   - Moi the `<img>` bat buoc co thuoc tinh `alt` mo ta ro rang y nghia cua hinh anh (hoac `alt=""` neu la anh trang tri thuan tuy).
   - Tuan thu ty le tuong phan mau sac (Color Contrast Ratio) toi thieu **4.5:1** cho van ban thuong va **3:1** cho van ban lon hoac cac nut bam quan trong.
2. **Van hanh duoc (Operable)**:
   - Toan bo he thong nut bam, dropdown, modal va form phai co the dieu huong hoan toan bang ban phim (`Tab`, `Shift+Tab`, `Enter`, `Space`, `Escape`).
   - Khong bao gio duoc dung CSS `outline: none` ma khong bo sung lop thay the nhu `focus-visible:ring-2 focus-visible:ring-primary`.
3. **Hieu duoc (Understandable)**:
   - Thong bao loi bieu mau phai ro rang, co lien ket `aria-describedby` voi truong nhap lieu bi loi.
   - Tranh dung cac thuat ngu ky thuat kho hieu tren giao dien nguoi dung.
4. **On dinh (Robust)**:
   - Su dung the HTML co y nghia ngu phap (`<header>`, `<main>`, `<nav>`, `<aside>`, `<footer>`, `<section>`) thay vi long hang loat the `<div>`.

---

## 2. Ung Dung ARIA Voi Radix UI & Shadcn UI

He thong tan dung toi da cac component primitives cua **Radix UI** vi da duoc tich hop san toan bo logic WAI-ARIA:
- Cac Dialog/Modal tu dong khoa focus (Focus Trap) ben trong modal khi mo va tra lai vi tri focus truoc do khi dong bang phim `Escape`.
- Cac Dropdown Menu tu dong ho tro phim mui ten `Up`/`Down` de chon lua phan tu.
- Bang du lieu `AdminDataGrid` su dung day du cac thuoc tinh `role="table"`, `role="row"`, `role="columnheader"` va `role="cell"`.
