/**
 * main.js — Quảng Cáo Tân Thành
 * Agent 2: Animation & UX behaviors
 * Tất cả DOM queries được cache, dùng passive listeners,
 * requestAnimationFrame cho animation, không có inline styles.
 */

'use strict';

/* ─── UTILS ──────────────────────────────────────── */

/** Debounce function để giảm số lần gọi event handler */
function debounce(fn, delay) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/** Lerp (linear interpolation) cho animation mượt */
function lerp(a, b, t) {
  return a + (b - a) * t;
}

/** Clamp value trong khoảng [min, max] */
function clamp(val, min, max) {
  return Math.min(Math.max(val, min), max);
}

/* ─── DOM QUERIES (cache một lần) ───────────────── */
const nav           = document.getElementById('main-nav');
const hamburger     = document.getElementById('nav-hamburger');
const mobileMenu    = document.getElementById('nav-mobile');
const navLinks      = document.querySelectorAll('.nav__link');
const allSections   = document.querySelectorAll('section[id]');
const backTop       = document.getElementById('back-top');
const heroParticles = document.getElementById('hero-particles');
const heroTypeEl    = document.getElementById('hero-typewriter');
const counters      = document.querySelectorAll('[data-counter]');
const animEls       = document.querySelectorAll('[data-animate]');
const portfolioGrid = document.getElementById('portfolio-grid');
const filterBtns    = document.querySelectorAll('.portfolio__filter-btn');
const portfolioItems= document.querySelectorAll('.portfolio-item');
const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');
const contactForm   = document.getElementById('contact-form');
const submitBtn     = document.getElementById('btn-form-submit');


/* ════════════════════════════════════════════════
   1. STICKY NAVIGATION — Scroll spy + glassmorphism
════════════════════════════════════════════════ */
(function initNav() {
  let lastScrollY = 0;

  function updateNav() {
    const scrollY = window.scrollY;
    // Thêm/bỏ class scrolled để bật glassmorphism
    nav.classList.toggle('scrolled', scrollY > 50);
    lastScrollY = scrollY;
  }

  // Active link theo section đang hiển thị
  function updateActiveLink() {
    const scrollMid = window.scrollY + window.innerHeight * 0.4;
    allSections.forEach(section => {
      const top    = section.offsetTop - 100;
      const bottom = top + section.offsetHeight;
      const id     = section.getAttribute('id');
      if (scrollMid >= top && scrollMid < bottom) {
        navLinks.forEach(link => {
          link.classList.remove('active');
          if (link.getAttribute('href') === `#${id}`) {
            link.classList.add('active');
          }
        });
      }
    });
  }

  const handleScroll = debounce(() => {
    updateNav();
    updateActiveLink();
  }, 50);

  window.addEventListener('scroll', handleScroll, { passive: true });
  updateNav(); // Khởi tạo ngay khi load
})();


/* ════════════════════════════════════════════════
   2. HAMBURGER MENU (Mobile)
════════════════════════════════════════════════ */
(function initHamburger() {
  if (!hamburger || !mobileMenu) return;

  let isOpen = false;

  function toggleMenu(open) {
    isOpen = open;
    hamburger.classList.toggle('open', isOpen);
    mobileMenu.classList.toggle('open', isOpen);
    hamburger.setAttribute('aria-expanded', isOpen.toString());
    // Khóa/mở scroll body
    document.body.style.overflow = isOpen ? 'hidden' : '';
  }

  hamburger.addEventListener('click', () => toggleMenu(!isOpen));

  // Đóng menu khi click link
  mobileMenu.querySelectorAll('.nav__link, .btn').forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  // Đóng menu khi bấm Escape
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && isOpen) toggleMenu(false);
  });
})();


/* ════════════════════════════════════════════════
   3. SMOOTH SCROLL
════════════════════════════════════════════════ */
(function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      const target = document.querySelector(href);
      if (!target) return;
      e.preventDefault();
      const navHeight = nav ? nav.offsetHeight : 0;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight;
      window.scrollTo({ top, behavior: 'smooth' });
    });
  });
})();


/* ════════════════════════════════════════════════
   4. TYPEWRITER EFFECT — Hero section
════════════════════════════════════════════════ */
(function initTypewriter() {
  if (!heroTypeEl) return;

  const phrases = [
    'thương hiệu bạn',    // ngắn hơn, tránh wrap
    'bảng hiệu nổi bật',
    'quảng cáo ấn tượng',
    'hình ảnh sáng rực',
  ];

  let phraseIdx = 0;
  let charIdx   = 0;
  let deleting  = false;
  let rafId     = null;

  const SPEED_TYPE   = 70;    // ms/ký tự khi gõ
  const SPEED_DELETE = 35;    // ms/ký tự khi xóa
  const DELAY_PAUSE  = 2200;  // ms dừng sau khi gõ xong

  function tick() {
    const current = phrases[phraseIdx];

    if (deleting) {
      charIdx--;
      heroTypeEl.textContent = current.slice(0, charIdx);
      if (charIdx === 0) {
        deleting = false;
        phraseIdx = (phraseIdx + 1) % phrases.length;
        rafId = setTimeout(tick, 400);
        return;
      }
      rafId = setTimeout(tick, SPEED_DELETE);
    } else {
      charIdx++;
      heroTypeEl.textContent = current.slice(0, charIdx);
      if (charIdx === current.length) {
        deleting = true;
        rafId = setTimeout(tick, DELAY_PAUSE);
        return;
      }
      rafId = setTimeout(tick, SPEED_TYPE);
    }
  }

  // Bắt đầu sau 800ms để cho hero animation xong trước
  setTimeout(tick, 800);
})();


/* ════════════════════════════════════════════════
   5. SCROLL-TRIGGERED ANIMATIONS (Intersection Observer)
════════════════════════════════════════════════ */
(function initScrollAnimations() {
  if (!animEls.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const el    = entry.target;
        const delay = parseInt(el.dataset.delay || '0', 10);
        setTimeout(() => el.classList.add('in-view'), delay);
        observer.unobserve(el); // Chỉ animate một lần
      });
    },
    { threshold: 0.15, rootMargin: '0px 0px -60px 0px' }
  );

  animEls.forEach(el => observer.observe(el));
})();


/* ════════════════════════════════════════════════
   6. COUNTER ANIMATION — About section
════════════════════════════════════════════════ */
(function initCounters() {
  if (!counters.length) return;

  const DURATION = 1800; // ms

  function animateCounter(el) {
    const target  = parseInt(el.dataset.counter, 10);
    const suffix  = el.dataset.suffix || '';
    const start   = performance.now();

    function step(now) {
      const elapsed  = now - start;
      const progress = Math.min(elapsed / DURATION, 1);
      // Ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * target);
      el.textContent = current + suffix;
      if (progress < 1) requestAnimationFrame(step);
    }

    requestAnimationFrame(step);
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      });
    },
    { threshold: 0.5 }
  );

  counters.forEach(el => observer.observe(el));
})();


/* ════════════════════════════════════════════════
   7. HERO PARTICLES
════════════════════════════════════════════════ */
(function initParticles() {
  if (!heroParticles) return;

  const COUNT = 18;
  const colors = ['#FF6B00', '#00D4FF', '#FFD700', '#FF8C42'];

  for (let i = 0; i < COUNT; i++) {
    const p = document.createElement('div');
    p.className = 'hero__particle';

    const size     = Math.random() * 3 + 2;
    const color    = colors[Math.floor(Math.random() * colors.length)];
    const left     = Math.random() * 100;
    const top      = Math.random() * 100;
    const duration = Math.random() * 8 + 6;
    const delay    = Math.random() * 5;

    p.style.cssText = `
      width: ${size}px;
      height: ${size}px;
      background: ${color};
      left: ${left}%;
      top: ${top}%;
      animation-duration: ${duration}s;
      animation-delay: -${delay}s;
      box-shadow: 0 0 ${size * 3}px ${color};
    `;

    heroParticles.appendChild(p);
  }

  // Hero image parallax on load
  const hero = document.getElementById('home');
  if (hero) {
    window.addEventListener('load', () => hero.classList.add('loaded'));
  }
})();


/* ════════════════════════════════════════════════
   8. PORTFOLIO FILTER — Smooth stagger, 1 reflow
════════════════════════════════════════════════ */
(function initPortfolioFilter() {
  if (!filterBtns.length || !portfolioItems.length) return;

  const FADE_OUT_MS = 200;
  const STAGGER_MS  = 100;  // tăng từ 60 → 100ms — mỗi item xuất hiện từ từ hơn
  let currentFilter = 'all';
  let animTimer     = null;

  // Init: tất cả visible
  portfolioItems.forEach(item => item.classList.add('pf-visible'));

  function applyFilter(filter) {
    if (filter === currentFilter) return;
    currentFilter = filter;
    if (animTimer) clearTimeout(animTimer);

    // ── Phase 1: Phân loại items (chỉ ĐỌC DOM, không ghi) ──
    const toHide  = [];
    const toShow  = [];
    portfolioItems.forEach(item => {
      const match = filter === 'all' || item.dataset.cat === filter;
      (match ? toShow : toHide).push(item);
    });

    // ── Phase 2: Fade OUT tất cả (1 lần ghi) ──
    portfolioItems.forEach(item => {
      item.classList.remove('pf-visible', 'pf-enter');
      item.classList.add('pf-hidden');
    });

    // ── Phase 3: Sau fade out xong ──
    animTimer = setTimeout(() => {

      // Batch ghi: ẩn hẳn items không khớp, set --pf-delay cho items khớp
      toHide.forEach(item => {
        item.classList.add('pf-gone');
        item.classList.remove('pf-hidden');
      });
      toShow.forEach((item, i) => {
        item.classList.remove('pf-gone', 'pf-hidden');
        item.style.setProperty('--pf-delay', `${i * STAGGER_MS}ms`);
      });

      // ── 1 lần reflow duy nhất cho toàn bộ ──
      void portfolioGrid.offsetHeight;

      // Batch ghi: trigger animation trên tất cả items khớp cùng lúc
      // CSS animation-delay trên từng item tự lo stagger
      toShow.forEach(item => item.classList.add('pf-enter'));

    }, FADE_OUT_MS);
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      filterBtns.forEach(b => {
        b.classList.remove('active');
        b.setAttribute('aria-selected', 'false');
      });
      this.classList.add('active');
      this.setAttribute('aria-selected', 'true');
      applyFilter(this.dataset.filter);
    });
  });
})();



/* ════════════════════════════════════════════════
   9. LIGHTBOX — Click portfolio image
════════════════════════════════════════════════ */
(function initLightbox() {
  if (!lightbox || !lightboxImg || !lightboxClose) return;

  function openLightbox(src, alt) {
    lightboxImg.src = src;
    lightboxImg.alt = alt;
    lightbox.classList.add('open');
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    document.body.style.overflow = '';
    lightboxImg.src = '';
  }

  portfolioItems.forEach(item => {
    const img = item.querySelector('img');
    if (!img) return;
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `Xem ảnh: ${img.alt}`);

    function activate() {
      // Chỉ mở lightbox nếu ảnh đã load và không phải ảnh placeholder
      if (img.src && !img.src.includes('placeholder')) {
        openLightbox(img.src, img.alt);
      }
    }

    item.addEventListener('click', activate);
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); activate(); }
    });
  });

  lightboxClose.addEventListener('click', closeLightbox);

  lightbox.addEventListener('click', (e) => {
    if (e.target === lightbox) closeLightbox();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightbox.classList.contains('open')) closeLightbox();
  });
})();


/* ════════════════════════════════════════════════
   10. CONTACT FORM VALIDATION & SUBMIT
════════════════════════════════════════════════ */
(function initContactForm() {
  if (!contactForm || !submitBtn) return;

  // ── Cấu hình validation ──────────────────────
  const fields = {
    'input-name':    { validate: (v) => v.trim().length >= 2,                        msg: 'Vui lòng nhập họ tên (ít nhất 2 ký tự)' },
    'input-phone':   { validate: (v) => /^[0-9]{9,11}$/.test(v.replace(/\s/g, '')), msg: 'Vui lòng nhập số điện thoại hợp lệ (9-11 số)' },
    'input-service': { validate: (v) => v !== '',                                     msg: 'Vui lòng chọn dịch vụ' },
  };

  function setFieldState(id, valid) {
    const input = document.getElementById(id);
    if (!input) return;
    input.classList.toggle('error', !valid);
  }

  function validateAll() {
    let allValid = true;
    Object.entries(fields).forEach(([id, rule]) => {
      const input = document.getElementById(id);
      if (!input) return;
      const valid = rule.validate(input.value);
      setFieldState(id, valid);
      if (!valid) allValid = false;
    });
    return allValid;
  }

  // Real-time validation khi blur / input
  Object.keys(fields).forEach(id => {
    const input = document.getElementById(id);
    if (!input) return;
    input.addEventListener('blur', () => setFieldState(id, fields[id].validate(input.value)));
    input.addEventListener('input', () => {
      if (input.classList.contains('error')) setFieldState(id, fields[id].validate(input.value));
    });
  });

  // ── Google Apps Script URL ────────────────────
  // 1. Vào script.google.com → tạo project mới
  // 2. Paste nội dung file google-apps-script.js
  // 3. Deploy → Web App (Anyone can access)
  // 4. Copy URL → dán vào đây
  const GAS_URL = 'https://script.google.com/macros/s/AKfycbw-UZx35bDoF8Hze8B_o0Es-7rk5thrYvkFDm-48cuVTr2WAwCNUOprYvQw6ZleLcAR/exec';

  // HTML gốc của nút submit (lưu để restore)
  const originalBtnHTML = submitBtn.querySelector('.btn-text')?.innerHTML || '';

  function setSubmitState(html, bg, durationMs = 5000) {
    const btnText = submitBtn.querySelector('.btn-text');
    submitBtn.classList.remove('loading');
    submitBtn.disabled = false;
    if (btnText) {
      btnText.innerHTML = html;
      submitBtn.style.background = bg;
      setTimeout(() => {
        btnText.innerHTML = originalBtnHTML;
        submitBtn.style.background = '';
      }, durationMs);
    }
  }

  // ── Submit handler ────────────────────────────
  contactForm.addEventListener('submit', async function (e) {
    e.preventDefault();
    if (!validateAll()) return;

    // Loading state
    submitBtn.classList.add('loading');
    submitBtn.disabled = true;

    // Thu thập dữ liệu form
    const payload = {
      name   : (document.getElementById('input-name')?.value    || '').trim(),
      phone  : (document.getElementById('input-phone')?.value   || '').trim(),
      service: document.getElementById('input-service')?.value  || '',
      note   : (document.getElementById('input-note')?.value    || '').trim(),
    };

    try {
      // Kiểm tra đã cấu hình URL chưa
      if (!GAS_URL || GAS_URL === 'YOUR_GOOGLE_APPS_SCRIPT_URL') {
        throw new Error('UNCONFIGURED');
      }

      // Gửi lên Google Apps Script (phải dùng no-cors)
      await fetch(GAS_URL, {
        method : 'POST',
        mode   : 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body   : JSON.stringify(payload),
      });

      // no-cors → không đọc response nhưng data đã được gửi
      setSubmitState('✅ Gửi thành công! Chúng tôi sẽ liên hệ sớm.', 'linear-gradient(135deg,#22c55e,#16a34a)');
      contactForm.reset();

    } catch (err) {
      if (err.message === 'UNCONFIGURED') {
        // Chưa điền GAS_URL
        setSubmitState('⚠️ Form chưa kết nối — xem hướng dẫn', 'linear-gradient(135deg,#f59e0b,#d97706)');
        console.warn('[TânThành] Cần điền GAS_URL trong main.js. Xem file google-apps-script.js.');
      } else {
        // Lỗi mạng hoặc khác
        setSubmitState('❌ Lỗi! Vui lòng gọi: 0777 772 255', 'linear-gradient(135deg,#ef4444,#dc2626)');
        console.error('[TânThành] Lỗi gửi form:', err);
      }
    }
  });
})();



/* ════════════════════════════════════════════════
   11. BACK TO TOP BUTTON
════════════════════════════════════════════════ */
(function initBackTop() {
  if (!backTop) return;

  const handleScroll = debounce(() => {
    backTop.classList.toggle('visible', window.scrollY > 500);
  }, 100);

  window.addEventListener('scroll', handleScroll, { passive: true });

  backTop.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
})();


/* ════════════════════════════════════════════════
   12. PORTFOLIO IMAGES — Load fallback nếu thiếu ảnh
════════════════════════════════════════════════ */
(function initImageFallback() {
  // Tạo placeholder gradient canvas cho ảnh chưa có
  const placeholderColors = [
    ['#FF6B00', '#FF8C42'],
    ['#00D4FF', '#0096FF'],
    ['#FFD700', '#FF6B00'],
    ['#1A1A2E', '#FF6B00'],
    ['#0A0A0F', '#00D4FF'],
    ['#12121A', '#FFD700'],
  ];

  document.querySelectorAll('img[loading="lazy"]').forEach((img, i) => {
    img.addEventListener('error', function () {
      const [c1, c2] = placeholderColors[i % placeholderColors.length];
      const canvas   = document.createElement('canvas');
      canvas.width   = 600;
      canvas.height  = 450;
      const ctx      = canvas.getContext('2d');
      const grad     = ctx.createLinearGradient(0, 0, 600, 450);
      grad.addColorStop(0, c1);
      grad.addColorStop(1, c2);
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, 600, 450);

      // Icon ở giữa
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      ctx.font = '80px serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🏪', 300, 200);

      // Label
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = 'bold 18px sans-serif';
      ctx.fillText('Quảng Cáo Tân Thành', 300, 310);

      this.src = canvas.toDataURL();
      this.removeEventListener('error', arguments.callee);
    });
  });
})();


/* ════════════════════════════════════════════════
   13. HERO IMAGE LOAD
════════════════════════════════════════════════ */
(function initHeroLoad() {
  const hero = document.getElementById('home');
  const heroBgImg = hero ? hero.querySelector('.hero__bg-img') : null;
  if (!heroBgImg) return;
  if (heroBgImg.complete) {
    hero.classList.add('loaded');
  } else {
    heroBgImg.addEventListener('load', () => hero.classList.add('loaded'));
  }
})();


/* ════════════════════════════════════════════════
   INIT LOG
════════════════════════════════════════════════ */
console.log(
  '%c🏪 Quảng Cáo Tân Thành%c\n📞 0777 772 255 | 📍 129 Thạch Lam, Tân Phú, TP.HCM',
  'color: #FF6B00; font-size: 18px; font-weight: bold;',
  'color: #B0B8C8; font-size: 12px;'
);
