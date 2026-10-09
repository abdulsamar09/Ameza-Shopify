/**
 * AMEZA Back to Top Engine — shared/js/core/back-to-top.js
 * Universal smooth scrolling back-to-top controller for storefront and dashboard areas.
 */

export function initBackToTop() {
  if (document.getElementById('global-back-to-top')) return;

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.id = 'global-back-to-top';
  btn.className = 'back-to-top-btn';
  btn.setAttribute('aria-label', 'Back to top');
  btn.setAttribute('title', 'Back to top');
  btn.innerHTML = '<i class="fa-solid fa-arrow-up"></i>';
  document.body.appendChild(btn);

  window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
      btn.classList.add('is-visible');
    } else {
      btn.classList.remove('is-visible');
    }
  }, { passive: true });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBackToTop);
  } else {
    initBackToTop();
  }
}
