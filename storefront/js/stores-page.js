/**
 * AMEZA Marketplace - All Stores Directory Page Controller (stores-page.js)
 */
import { STORES_LIST } from './data/stores-data.js';
import { createStoreCardHTML } from './components/stores-slider.js';

export function initStoresPage() {
  const grid = document.getElementById('stores-directory-grid');
  const countDisplay = document.getElementById('stores-count-display');
  const emptyState = document.getElementById('stores-empty-state');
  const searchInput = document.getElementById('stores-search-input');
  const pillsContainer = document.getElementById('stores-category-pills');
  const resetBtn = document.getElementById('btn-reset-store-filters');

  if (!grid) return;

  let activeFilter = 'all';
  let searchQuery = '';

  function renderStores() {
    const q = searchQuery.toLowerCase().trim();
    const filtered = STORES_LIST.filter(store => {
      // Category filter
      if (activeFilter !== 'all' && store.categoryKey !== activeFilter) {
        return false;
      }
      // Search query
      if (q) {
        const matchesName = store.name.toLowerCase().includes(q);
        const matchesLocation = store.location.toLowerCase().includes(q);
        const matchesTagline = store.tagline.toLowerCase().includes(q);
        const matchesCategory = store.category.toLowerCase().includes(q);
        if (!matchesName && !matchesLocation && !matchesTagline && !matchesCategory) {
          return false;
        }
      }
      return true;
    });

    if (filtered.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      if (countDisplay) countDisplay.textContent = '0 stores';
    } else {
      if (emptyState) emptyState.style.display = 'none';
      grid.innerHTML = filtered.map(createStoreCardHTML).join('');
      if (countDisplay) {
        countDisplay.textContent = `${filtered.length} verified store${filtered.length === 1 ? '' : 's'}`;
      }
    }
  }

  // Filter Pills click listener
  if (pillsContainer) {
    pillsContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.store-pill-btn');
      if (!btn) return;

      pillsContainer.querySelectorAll('.store-pill-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      activeFilter = btn.getAttribute('data-filter') || 'all';
      renderStores();
    });
  }

  // Search input listener
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderStores();
    });
  }

  // Reset filters button
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      searchQuery = '';
      if (searchInput) searchInput.value = '';
      activeFilter = 'all';
      if (pillsContainer) {
        pillsContainer.querySelectorAll('.store-pill-btn').forEach(b => {
          b.classList.toggle('active', b.getAttribute('data-filter') === 'all');
        });
      }
      renderStores();
    });
  }

  // Follow button delegation
  grid.addEventListener('click', (e) => {
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

  // Initial render
  renderStores();
}

// Auto-boot on DOM ready
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initStoresPage);
  } else {
    initStoresPage();
  }
}
