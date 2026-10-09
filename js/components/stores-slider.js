/**
 * AMEZA Marketplace - Stores Slider & Directory Component
 */
import { STORES_LIST, getStoreBySlug } from '../data/stores-data.js';

/**
 * Creates HTML for a single compact store card ("thori information k sath small card")
 */
export function createStoreCardHTML(store) {
  const followKey = `ameza_mkt_follow_${store.slug}`;
  const isFollowing = typeof localStorage !== 'undefined' && localStorage.getItem(followKey) === 'true';

  return `
    <article class="store-card store-card-compact" data-slug="${escapeHTML(store.slug)}" data-category="${escapeHTML(store.categoryKey || 'all')}">
      <!-- Compact Banner -->
      <div class="store-card-banner" style="background-image: url('${store.banner}');">
        ${store.badge ? `<span class="store-card-badge">${escapeHTML(store.badge)}</span>` : ''}
      </div>

      <!-- Card Content -->
      <div class="store-card-body">
        <!-- Compact Avatar -->
        <div class="store-avatar-wrap" style="background: ${store.monogramColor};">
          <span class="store-avatar-text" style="color: ${store.textColor || '#FFFFFF'};">${escapeHTML(store.monogram)}</span>
          <i class="fa-solid fa-circle-check store-verified-icon" title="Verified Merchant"></i>
        </div>

        <!-- Store Title -->
        <div class="store-meta-top">
          <a href="store.html?slug=${encodeURIComponent(store.slug)}" class="store-name-link" title="${escapeHTML(store.name)}">
            ${escapeHTML(store.name)}
          </a>
        </div>

        <!-- Location -->
        <div class="store-location-tag">
          <i class="fa-solid fa-location-dot"></i>
          <span>${escapeHTML(store.location)}</span>
        </div>

        <!-- Stats Strip: Rating + Products Count -->
        <div class="store-stats-strip">
          <span class="store-rating-badge">
            <i class="fa-solid fa-star"></i> ${store.rating.toFixed(1)}
            <span class="store-reviews-num">(${store.reviewsCount})</span>
          </span>
          <span class="store-stat-divider">&bull;</span>
          <span class="store-stat-item">${store.productsCount} Products</span>
        </div>

        <!-- Short Specialty Tag -->
        <div class="store-category-chip">
          <i class="fa-solid fa-tag"></i>
          <span>${escapeHTML(store.category)}</span>
        </div>

        <!-- Actions -->
        <div class="store-card-actions">
          <a href="store.html?slug=${encodeURIComponent(store.slug)}" class="btn-visit-store">
            <span>Visit Store</span>
            <i class="fa-solid fa-arrow-right"></i>
          </a>
          <button type="button" class="btn-store-follow ${isFollowing ? 'following' : ''}" data-slug="${escapeHTML(store.slug)}" aria-label="Follow Store" title="${isFollowing ? 'Following' : 'Follow'}">
            <i class="fa-${isFollowing ? 'solid' : 'regular'} fa-heart"></i>
          </button>
        </div>
      </div>
    </article>
  `;
}

/**
 * Initializes the Homepage Top Stores carousel
 */
export function initHomeStoresSlider() {
  const track = document.getElementById('top-stores-track');
  if (!track) return;

  // Render cards
  track.innerHTML = STORES_LIST.map(createStoreCardHTML).join('');

  // Setup navigation arrows
  const btnPrev = document.getElementById('btn-stores-prev');
  const btnNext = document.getElementById('btn-stores-next');

  if (btnPrev && btnNext) {
    btnPrev.addEventListener('click', () => {
      track.scrollBy({ left: -280, behavior: 'smooth' });
    });
    btnNext.addEventListener('click', () => {
      track.scrollBy({ left: 280, behavior: 'smooth' });
    });

    const updateArrowState = () => {
      btnPrev.disabled = track.scrollLeft <= 10;
      btnNext.disabled = track.scrollLeft + track.clientWidth >= track.scrollWidth - 10;
    };

    track.addEventListener('scroll', updateArrowState, { passive: true });
    updateArrowState();
  }

  // Bind follow buttons
  track.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn-store-follow');
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();

    const slug = btn.getAttribute('data-slug');
    const followKey = `ameza_mkt_follow_${slug}`;
    const currentlyFollowing = btn.classList.contains('following');
    const nextState = !currentlyFollowing;

    localStorage.setItem(followKey, String(nextState));
    btn.classList.toggle('following', nextState);
    const icon = btn.querySelector('i');
    if (icon) {
      icon.className = nextState ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
    }
    btn.setAttribute('title', nextState ? 'Following' : 'Follow');
  });
}

function escapeHTML(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}
