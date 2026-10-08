/**
 * AMEZA Seller Onboarding - Landing Page Interaction Logic
 */
import {
  STATS_CONFIG,
  STEPS_CONFIG,
  FEATURES_CONFIG,
  COMMISSION_SETTINGS,
  TESTIMONIALS_CONFIG,
  FAQ_CONFIG,
  escapeHTML
} from './config.js';

export function initLanding() {
  renderAuthHeader();
  renderStats();
  renderSteps();
  renderFeatures();
  renderCommissionTable();
  renderTestimonials();
  renderFAQ();
  injectFAQSchema();
  initHeaderInteractions();
  initStatsObserver();
}

/**
 * 1. Check logged-in state (read-only from ameza_session)
 */
function renderAuthHeader() {
  try {
    const sessionRaw = localStorage.getItem('ameza_session');
    if (sessionRaw) {
      const session = JSON.parse(sessionRaw);
      const signinBtn = document.getElementById('header-signin-btn');
      if (signinBtn && session && session.user) {
        signinBtn.textContent = session.user.name || 'My Account';
        signinBtn.href = '../account.html';
      }
    }
  } catch (e) {
    console.error('Error reading ameza_session', e);
  }
}

/**
 * 2. Render Stats Band
 */
function renderStats() {
  const container = document.getElementById('stats-band-container');
  if (!container) return;

  const iconMap = {
    store: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    cart: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>',
    box: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>',
    star: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>'
  };

  container.innerHTML = STATS_CONFIG.map(item => `
    <div class="stat-item">
      <div class="stat-icon-wrapper">${iconMap[item.icon] || iconMap.store}</div>
      <div class="stat-number" data-target="${item.targetNumber}" data-display="${item.displayNumber}">${item.displayNumber}</div>
      <div class="stat-label">${escapeHTML(item.label)}</div>
    </div>
  `).join('');
}

/**
 * 3. Render 4 Steps
 */
function renderSteps() {
  const container = document.getElementById('steps-container');
  if (!container) return;

  const iconMap = {
    'user-plus': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>',
    'store': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
    'cloud-arrow-up': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg>',
    'rocket': '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4.5 16.5c-1.5 1.26-2 5-2 5s3.74-.5 5-2c.71-.84.7-2.13-.09-2.91a2.18 2.18 0 0 0-2.91-.09z"/><path d="m12 15-3-3a22 22 0 0 1 2-3.95A12.88 12.88 0 0 1 22 2c0 2.72-.78 7.5-6 11a22.35 22.35 0 0 1-4 2z"/></svg>'
  };

  container.innerHTML = STEPS_CONFIG.map(s => `
    <div class="step-col">
      <div class="step-badge">${s.step}</div>
      <div class="step-icon-circle">${iconMap[s.icon] || iconMap.store}</div>
      <h3 class="step-title">${escapeHTML(s.title)}</h3>
      <p class="step-desc">${escapeHTML(s.description)}</p>
    </div>
  `).join('');
}

/**
 * 4. Render 8 Feature Cards
 */
function renderFeatures() {
  const container = document.getElementById('features-container');
  if (!container) return;

  const iconMap = {
    'percent': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="19" y1="5" x2="5" y2="19"/><circle cx="6.5" cy="6.5" r="2.5"/><circle cx="17.5" cy="17.5" r="2.5"/></svg>',
    'globe': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    'shield-check': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>',
    'bullhorn': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M11 5L6 9H2v6h4l5 4V5z"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>',
    'cubes': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>',
    'headset': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>',
    'truck-fast': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>',
    'arrow-trend-up': '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>'
  };

  container.innerHTML = FEATURES_CONFIG.map(f => `
    <div class="feature-card">
      <div class="feature-icon-circle">${iconMap[f.icon] || iconMap.percent}</div>
      <h3 class="feature-title">${escapeHTML(f.title)}</h3>
      <p class="feature-desc">${escapeHTML(f.description)}</p>
    </div>
  `).join('');
}

/**
 * 5. Render Commission Settings Table
 */
function renderCommissionTable() {
  const tbody = document.getElementById('commission-table-body');
  if (!tbody) return;

  tbody.innerHTML = COMMISSION_SETTINGS.categories.map(c => {
    const exampleVal = (c.rate * 1.00).toFixed(2);
    return `
      <tr>
        <td style="font-weight: 600;">${escapeHTML(c.category)}</td>
        <td><span class="rate-pill">${c.rate}%</span></td>
        <td style="font-weight: 600; color: var(--text);">$${exampleVal}</td>
      </tr>
    `;
  }).join('');

  if (COMMISSION_SETTINGS.showPromoRibbon) {
    const promoBox = document.getElementById('commission-promo-box');
    if (promoBox) {
      promoBox.style.display = 'block';
      promoBox.textContent = COMMISSION_SETTINGS.promoText;
    }
  }
}

/**
 * 6. Render Testimonials
 */
function renderTestimonials() {
  const container = document.getElementById('testimonials-container');
  if (!container) return;

  const starSvg = '<svg width="14" height="14" viewBox="0 0 24 24" fill="#7FB73C" stroke="#7FB73C" stroke-width="1"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>';

  container.innerHTML = TESTIMONIALS_CONFIG.map(t => `
    <div class="testimonial-card">
      <div>
        <div class="testimonial-header">
          <div class="testimonial-avatar" style="background-color: ${t.color};">${escapeHTML(t.initial)}</div>
          <div>
            <div class="testimonial-name">${escapeHTML(t.name)}</div>
            <div class="testimonial-biz">${escapeHTML(t.business)}</div>
          </div>
        </div>
        <p class="testimonial-quote">"${escapeHTML(t.quote)}"</p>
      </div>
      <div class="testimonial-stars">
        ${starSvg.repeat(t.stars)}
      </div>
    </div>
  `).join('');
}

/**
 * 7. Render FAQ Accordion
 */
function renderFAQ() {
  const container = document.getElementById('faq-container');
  if (!container) return;

  container.innerHTML = FAQ_CONFIG.map((faq, idx) => `
    <div class="faq-item ${idx === 0 ? 'open' : ''}" data-faq="${idx}">
      <button class="faq-trigger-btn" aria-expanded="${idx === 0 ? 'true' : 'false'}" aria-controls="faq-ans-${idx}">
        <span>${escapeHTML(faq.question)}</span>
        <span class="faq-icon">&plus;</span>
      </button>
      <div class="faq-content" id="faq-ans-${idx}" role="region">
        <p>${escapeHTML(faq.answer)}</p>
      </div>
    </div>
  `).join('');

  // Accordion Toggle Logic
  container.addEventListener('click', (e) => {
    const btn = e.target.closest('.faq-trigger-btn');
    if (!btn) return;
    const item = btn.closest('.faq-item');
    const wasOpen = item.classList.contains('open');

    // Close others
    container.querySelectorAll('.faq-item').forEach(i => {
      i.classList.remove('open');
      const b = i.querySelector('.faq-trigger-btn');
      if (b) b.setAttribute('aria-expanded', 'false');
    });

    if (!wasOpen) {
      item.classList.add('open');
      btn.setAttribute('aria-expanded', 'true');
    }
  });
}

/**
 * 8. Inject FAQPage JSON-LD
 */
function injectFAQSchema() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': FAQ_CONFIG.map(f => ({
      '@type': 'Question',
      'name': f.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': f.answer
      }
    }))
  };

  const script = document.createElement('script');
  script.type = 'application/ld+json';
  script.textContent = JSON.stringify(schema);
  document.head.appendChild(script);
}

/**
 * 9. Header Dropdown, Search & Mobile Nav
 */
function initHeaderInteractions() {
  // Categories Dropdown
  const catBtn = document.getElementById('nav-categories-btn');
  const catMenu = document.getElementById('categories-dropdown-menu');

  if (catBtn && catMenu) {
    catBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      catMenu.classList.toggle('show');
    });

    document.addEventListener('click', (e) => {
      if (!catMenu.contains(e.target) && e.target !== catBtn) {
        catMenu.classList.remove('show');
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        catMenu.classList.remove('show');
      }
    });
  }

  // Mobile Hamburger Toggle
  const hamburgerBtn = document.getElementById('hamburger-toggle-btn');
  const mobileNav = document.getElementById('mobile-nav-panel');

  if (hamburgerBtn && mobileNav) {
    hamburgerBtn.addEventListener('click', () => {
      mobileNav.classList.toggle('open');
    });
  }
}

/**
 * 10. Stats Number Count-up Animation with IntersectionObserver
 */
function initStatsObserver() {
  const statElements = document.querySelectorAll('.stat-number');
  if (!statElements.length) return;

  let animated = false;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting && !animated) {
        animated = true;
        statElements.forEach(el => animateCountUp(el));
      }
    });
  }, { threshold: 0.3 });

  const band = document.getElementById('stats-band-card');
  if (band) observer.observe(band);
}

function animateCountUp(el) {
  const displayVal = el.getAttribute('data-display');
  // For standard count-up simulation:
  let start = 0;
  const duration = 1200;
  const startTime = performance.now();

  function update(time) {
    const elapsed = time - startTime;
    const progress = Math.min(elapsed / duration, 1);
    // Smooth easeOutQuad
    const ease = 1 - (1 - progress) * (1 - progress);

    if (progress < 1) {
      requestAnimationFrame(update);
    } else {
      el.textContent = displayVal;
    }
  }

  requestAnimationFrame(update);
}
