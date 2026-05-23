# Changelog — Quảng Cáo Tân Thành

Tất cả thay đổi đáng kể của dự án được ghi lại tại đây.  
Định dạng theo [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [1.0.0] — 2026-05-23

### Thêm mới
- `index.html` — Landing page đầy đủ 7 section: Hero, About, Services, Process, Portfolio, Testimonials, Contact
- `css/style.css` — Hệ thống design đầy đủ, dark mode neon, responsive 4 breakpoint
- `js/main.js` — Toàn bộ JS behaviors:
  - Sticky nav + scroll spy
  - Hamburger menu mobile
  - Smooth scroll
  - Typewriter effect (Hero)
  - Scroll-triggered animations (IntersectionObserver)
  - Counter animation (About stats)
  - Hero particles
  - Portfolio filter + stagger animation
  - Lightbox xem ảnh
  - Contact form validation + submit lên Google Apps Script
  - Back-to-top button
  - Image fallback canvas
- `google-apps-script.js` — Google Apps Script nhận POST form, lưu Google Sheet, gửi email HTML thông báo
- `assets/images/` — Hero background, ảnh xưởng, 6 ảnh portfolio AI-generated
- `.gitignore` — Phù hợp Windows + VS Code + vanilla JS project
- `README.md` — Tài liệu dự án

### Tích hợp
- Google Apps Script Web App (Standalone) làm backend form
- Google Sheets tự động tạo và lưu đơn liên hệ
- Gmail gửi email HTML thông báo kèm nút Chat Zalo + Gọi trực tiếp

### Kỹ thuật
- Dùng `fetch` với `mode: no-cors` để gửi POST đến GAS
- `PropertiesService` để lưu Spreadsheet ID (tránh lỗi `getActiveSpreadsheet()` null với standalone script)
- Google Fonts với `display=optional` để tránh FOUT
- BEM naming convention cho CSS
- Passive event listeners cho scroll performance
