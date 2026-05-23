# Quảng Cáo Tân Thành

> Website giới thiệu dịch vụ in ấn & bảng hiệu quảng cáo tại 129 Thạch Lam, Tân Phú, TP.HCM.

[![GitHub](https://img.shields.io/badge/GitHub-Public-blue)](https://github.com/alexanderloong/quang-cao-tan-thanh)

---

## Tính năng

- **Landing page** giới thiệu dịch vụ: Bảng hiệu LED, In ấn khổ lớn, Decal, CNC & Laser
- **Portfolio** có bộ lọc theo danh mục + lightbox xem ảnh phóng to
- **Form báo giá** tích hợp Google Apps Script → tự động lưu Google Sheet + gửi email thông báo
- **Testimonials** cuộn vô tận (dual-row marquee)
- **Mobile-first**, responsive 4 breakpoint (≤479 / 480–767 / 768–1023 / 1024+)
- **Dark mode neon** với Be Vietnam Pro font
- Scroll animations, typewriter effect, counter animation, hero particles

---

## Công nghệ

| Công nghệ | Mục đích |
|---|---|
| HTML5 / CSS3 / Vanilla JS | Core (không framework) |
| Google Apps Script | Nhận form POST → lưu Sheet + gửi Gmail |
| Google Sheets | Lưu trữ đơn liên hệ |
| Google Fonts | Be Vietnam Pro, Bebas Neue |

---

## Cấu trúc thư mục

```
quang-cao-tan-thanh/
├── index.html                  # Entry point
├── css/
│   └── style.css               # Toàn bộ styles (BEM, CSS Variables)
├── js/
│   └── main.js                 # Animations, form submit, portfolio filter
├── assets/
│   └── images/
│       ├── hero-bg.jpg
│       ├── about-workshop.jpg
│       └── portfolio/          # Ảnh công trình (6 ảnh)
├── google-apps-script.js       # Code Apps Script (reference, deploy riêng)
├── .gitignore
├── CHANGELOG.md
└── README.md
```

---

## Thiết lập Google Apps Script

1. Vào [script.google.com](https://script.google.com) → tạo project mới (Standalone)
2. Copy toàn bộ nội dung `google-apps-script.js` vào editor
3. **Deploy → New deployment → Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
4. Copy URL deployment → dán vào `GAS_URL` trong `js/main.js` (dòng 470)

---

## Chạy local

Dự án là static HTML — mở thẳng `index.html` trên browser hoặc dùng Live Server (VS Code extension).

```bash
# Nếu có Node.js
npx live-server .
```

---

## Liên hệ

**Quảng Cáo Tân Thành**
- Địa chỉ: 129 Thạch Lam, Tân Phú, TP.HCM
- Hotline: 0777 772 255
- Email: tanthanhads@gmail.com
