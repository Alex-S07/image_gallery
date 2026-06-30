/**
 * Image Gallery — script.js
 * Handles:
 *  - Thumbnail click → update featured image with fade transition
 *  - Featured image click → open lightbox
 *  - Lightbox prev / next navigation
 *  - Keyboard navigation (Escape, ArrowLeft, ArrowRight)
 */

(function () {
  'use strict';

  /* ── DOM refs ─────────────────────────────────────── */
  const featuredImg    = document.getElementById('featured-image');
  const featuredLabel  = document.getElementById('featured-label');
  const featuredCont   = document.getElementById('featured-container');
  const thumbGrid      = document.getElementById('thumbnail-grid');
  const thumbItems     = Array.from(thumbGrid.querySelectorAll('.thumb-item'));

  const lightbox       = document.getElementById('lightbox');
  const lightbackdrop  = document.getElementById('lightbox-backdrop');
  const lightboxImg    = document.getElementById('lightbox-image');
  const lightboxCapt   = document.getElementById('lightbox-caption');
  const btnClose       = document.getElementById('lightbox-close');
  const btnPrev        = document.getElementById('lightbox-prev');
  const btnNext        = document.getElementById('lightbox-next');

  /* ── State ────────────────────────────────────────── */
  let currentIndex = 0; // index of the currently active thumbnail

  /* ── Helpers ──────────────────────────────────────── */

  /**
   * Swap featured image with a smooth fade transition.
   * @param {string} src   - Full-size image URL
   * @param {string} label - Caption string
   * @param {number} idx   - Thumbnail index
   */
  function setFeatured(src, label, idx) {
    if (idx === currentIndex) return;

    // Fade out
    featuredImg.classList.add('fade-out');

    setTimeout(() => {
      featuredImg.src        = src;
      featuredLabel.textContent = label;
      currentIndex = idx;

      // Update active thumbnail
      thumbItems.forEach((t, i) => t.classList.toggle('active', i === idx));

      // Fade back in after src loads
      featuredImg.onload = () => featuredImg.classList.remove('fade-out');
      // Fallback if image is already cached
      if (featuredImg.complete) featuredImg.classList.remove('fade-out');
    }, 260);
  }

  /* ── Thumbnail click handler ──────────────────────── */
  thumbItems.forEach((item, idx) => {
    item.addEventListener('click', () => {
      const src   = item.dataset.src;
      const label = item.dataset.label;
      setFeatured(src, label, idx);
    });
  });

  /* ── Lightbox ─────────────────────────────────────── */

  function openLightbox(idx) {
    const item  = thumbItems[idx];
    const src   = item.dataset.src;
    const label = item.dataset.label;

    lightboxImg.src          = src;
    lightboxCapt.textContent = label;
    currentIndex             = idx;

    lightbox.classList.add('open');
    lightbackdrop.classList.add('open');
    document.body.style.overflow = 'hidden';

    lightboxImg.style.animation = 'none';
    requestAnimationFrame(() => {
      lightboxImg.style.animation = '';
    });
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightbackdrop.classList.remove('open');
    document.body.style.overflow = '';
  }

  function lightboxNav(dir) {
    const next = (currentIndex + dir + thumbItems.length) % thumbItems.length;
    openLightbox(next);
  }

  /* Featured image click → open lightbox at current thumb */
  featuredCont.addEventListener('click', () => openLightbox(currentIndex));

  /* Lightbox controls */
  btnClose.addEventListener('click', closeLightbox);
  lightbackdrop.addEventListener('click', closeLightbox);
  btnPrev.addEventListener('click', (e) => { e.stopPropagation(); lightboxNav(-1); });
  btnNext.addEventListener('click', (e) => { e.stopPropagation(); lightboxNav(1); });

  /* Keyboard */
  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   lightboxNav(-1);
    if (e.key === 'ArrowRight')  lightboxNav(1);
  });

  /* Touch / swipe support for lightbox */
  let touchStartX = 0;
  lightbox.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].clientX;
  }, { passive: true });

  lightbox.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) lightboxNav(dx < 0 ? 1 : -1);
  }, { passive: true });

  /* ── Lazy-load progressive reveal via IntersectionObserver ── */
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    thumbItems.forEach(item => observer.observe(item));
  }

})();
