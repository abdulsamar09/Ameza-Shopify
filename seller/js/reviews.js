/**
 * AMEZA Seller Central — Customer Reviews Engine (js/reviews.js)
 * Manages customer feedback, visual rating distribution bar charts,
 * verified buyer validation, inline merchant responses, photo lightboxes,
 * and dispute reporting to admin moderation.
 * USA compliance: US customer names, American English, Eastern Time.
 */

import { escapeHTML, showToast } from './shell.js';

const STORAGE_KEY = 'ameza_seller_reviews_v2';
const MODERATION_KEY = 'ameza_admin_moderation_queue';

const DEFAULT_REVIEWS = [
  {
    id: 'rev_001',
    productId: 'prod_100',
    productTitle: 'Classic Saddle Leather Belt',
    productVariant: 'Cognac / 34"',
    productThumb: '../assets/products/ul-belt.jpg',
    customerName: 'David Wilson',
    rating: 5,
    title: 'Remarkable quality and sturdy brass buckle',
    comment: 'The full grain leather is thick and smells incredible. Easily beats luxury retail brands at double the price. The edge finishing is smooth and has not cracked after 3 weeks of daily wear.',
    verified: true,
    helpfulCount: 14,
    createdAt: Date.now() - (2 * 86400 * 1000),
    photos: [
      '../assets/products/ul-belt.jpg'
    ],
    sellerReply: {
      sellerName: 'Ameza Official',
      comment: 'Thank you David! We source all our full-grain leather domestically, glad you love the grain and buckle hardware.',
      repliedAt: Date.now() - (1 * 86400 * 1000)
    },
    reported: false
  },
  {
    id: 'rev_002',
    productId: 'prod_101',
    productTitle: 'Full-Grain Slim Leather Wallet',
    productVariant: 'Tan / Standard',
    productThumb: '../assets/products/ul-wallet.jpg',
    customerName: 'Sarah Mitchell',
    rating: 5,
    title: 'Perfect minimalist front-pocket wallet',
    comment: 'Fits 6 cards and cash comfortably without any bulk. Stitching is immaculate and cards slide out with just the right amount of retention.',
    verified: true,
    helpfulCount: 9,
    createdAt: Date.now() - (4 * 86400 * 1000),
    photos: [
      '../assets/products/ul-wallet.jpg'
    ],
    sellerReply: {
      sellerName: 'Ameza Official',
      comment: 'Cheers Sarah! We spent months perfecting that ultra-slim pocket profile.',
      repliedAt: Date.now() - (3 * 86400 * 1000)
    },
    reported: false
  },
  {
    id: 'rev_003',
    productId: 'prod_549',
    productTitle: 'Unisex Winter Fleece Hoodie',
    productVariant: 'Olive Green / Large',
    productThumb: '../assets/wp_products/wp_52_0.webp',
    customerName: 'Michael Roberts',
    rating: 4,
    title: 'Warm fabric, slightly snug around cuffs',
    comment: 'The brushed fleece lining is super soft and cozy in cold temperatures. The wrist cuffs are slightly snug when putting on a watch, but overall fantastic garment.',
    verified: true,
    helpfulCount: 5,
    createdAt: Date.now() - (6 * 86400 * 1000),
    photos: [
      '../assets/wp_products/wp_52_0.webp',
      '../assets/wp_products/wp_239_0.webp'
    ],
    sellerReply: null,
    reported: false
  },
  {
    id: 'rev_004',
    productId: 'prod_114',
    productTitle: 'Artisan Chronograph Watch',
    productVariant: 'Stainless Steel / 42mm',
    productThumb: '../assets/products/silver-elegance-watch.png',
    customerName: 'Emily Carter',
    rating: 5,
    title: 'Precision movement and flawless crystal',
    comment: 'The sapphire crystal dial catches light beautifully. The chronograph sub-dials click crisply with zero hand wobble.',
    verified: true,
    helpfulCount: 18,
    createdAt: Date.now() - (9 * 86400 * 1000),
    photos: [
      '../assets/products/silver-elegance-watch.png'
    ],
    sellerReply: {
      sellerName: 'Ameza Official',
      comment: 'Thank you Emily! We calibrate each chronograph movement before boxing.',
      repliedAt: Date.now() - (8 * 86400 * 1000)
    },
    reported: false
  },
  {
    id: 'rev_005',
    productId: 'prod_205',
    productTitle: 'Studio Bluetooth ANC Headphones',
    productVariant: 'Midnight Black',
    productThumb: '../assets/products/tws-wireless-earbuds.png',
    customerName: 'Marcus Johnson',
    rating: 4,
    title: 'Superb sound isolation on cross-country flights',
    comment: 'Noise cancellation neutralized jet cabin drone completely. Battery lasted through the whole flight plus a 4-hour layover.',
    verified: true,
    helpfulCount: 7,
    createdAt: Date.now() - (12 * 86400 * 1000),
    photos: [],
    sellerReply: null,
    reported: false
  },
  {
    id: 'rev_006',
    productId: 'prod_100',
    productTitle: 'Classic Saddle Leather Belt',
    productVariant: 'Dark Brown / 36"',
    productThumb: '../assets/products/ul-belt.jpg',
    customerName: 'Jessica Taylor',
    rating: 3,
    title: 'Solid leather but sizing runs slightly small',
    comment: 'Belt width is fantastic and buckle feels indestructible. I recommend ordering one size up from your standard denim waist size.',
    verified: true,
    helpfulCount: 11,
    createdAt: Date.now() - (15 * 86400 * 1000),
    photos: [],
    sellerReply: null,
    reported: false
  },
  {
    id: 'rev_007',
    productId: 'prod_549',
    productTitle: 'Unisex Winter Fleece Hoodie',
    productVariant: 'Charcoal Grey / Medium',
    productThumb: '../assets/wp_products/wp_52_0.webp',
    customerName: 'Christopher Lee',
    rating: 5,
    title: 'My favorite everyday hoodie now',
    comment: 'Holds shape through the laundry machine without any shrinkage or pilling. Heavyweight feel without being stiff.',
    verified: true,
    helpfulCount: 3,
    createdAt: Date.now() - (18 * 86400 * 1000),
    photos: [],
    sellerReply: null,
    reported: false
  }
];

export function getReviews() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_REVIEWS));
  return JSON.parse(JSON.stringify(DEFAULT_REVIEWS));
}

export function saveReviews(data) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

let activeStarFilter = 'all'; // 'all' | '5' | '4' | '3' | '2' | '1' | 'unreplied'
let searchQuery = '';
let sortBy = 'newest'; // 'newest' | 'highest' | 'lowest' | 'helpful' | 'unreplied'
let productFilter = 'all';
let displayLimit = 6;
let openReportModalId = null;

export function initReviews() {
  renderReviewsView();
}

function renderStarsSVG(rating) {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    if (rating >= i) {
      stars += '<i class="fa-solid fa-star" style="color:#F59E0B;"></i>';
    } else if (rating >= i - 0.5) {
      stars += '<i class="fa-solid fa-star-half-stroke" style="color:#F59E0B;"></i>';
    } else {
      stars += '<i class="fa-regular fa-star" style="color:#D1D5DB;"></i>';
    }
  }
  return stars;
}

function renderReviewsView() {
  const container = document.getElementById('reviews-content-container');
  if (!container) return;

  const reviews = getReviews();
  const total = reviews.length;

  // Compute rating counts and average from the single source dataset
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sumScore = 0;
  reviews.forEach(r => {
    ratingCounts[r.rating] = (ratingCounts[r.rating] || 0) + 1;
    sumScore += r.rating;
  });

  const avgRating = total > 0 ? (sumScore / total).toFixed(1) : '5.0';
  const unrepliedCount = reviews.filter(r => !r.sellerReply).length;

  // Distribution percentages summing exactly to 100%
  const distribution = {};
  [5, 4, 3, 2, 1].forEach(star => {
    distribution[star] = total > 0 ? Math.round((ratingCounts[star] / total) * 100) : 0;
  });

  // Extract distinct product titles for filter dropdown
  const uniqueProducts = Array.from(new Set(reviews.map(r => r.productTitle)));

  // Filter dataset
  let filtered = reviews.filter(r => {
    if (activeStarFilter === 'unreplied' && r.sellerReply) return false;
    if (['1', '2', '3', '4', '5'].includes(activeStarFilter) && r.rating !== parseInt(activeStarFilter, 10)) {
      return false;
    }
    if (productFilter !== 'all' && r.productTitle !== productFilter) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const combined = `${r.customerName} ${r.productTitle} ${r.title} ${r.comment}`.toLowerCase();
      if (!combined.includes(q)) return false;
    }
    return true;
  });

  // Sort dataset
  if (sortBy === 'newest') {
    filtered.sort((a, b) => b.createdAt - a.createdAt);
  } else if (sortBy === 'highest') {
    filtered.sort((a, b) => b.rating - a.rating || b.createdAt - a.createdAt);
  } else if (sortBy === 'lowest') {
    filtered.sort((a, b) => a.rating - b.rating || b.createdAt - a.createdAt);
  } else if (sortBy === 'helpful') {
    filtered.sort((a, b) => (b.helpfulCount || 0) - (a.helpfulCount || 0));
  } else if (sortBy === 'unreplied') {
    filtered.sort((a, b) => (a.sellerReply ? 1 : 0) - (b.sellerReply ? 1 : 0));
  }

  const visibleList = filtered.slice(0, displayLimit);

  container.innerHTML = `
    <div class="reviews-page-wrapper">
      <!-- Top Page Header -->
      <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; margin-bottom:20px;">
        <div>
          <h1 class="page-title" style="margin:0; font-size:24px; font-weight:800; color:var(--text-main);">Reviews</h1>
          <p class="page-subtitle" style="margin:4px 0 0; font-size:13px; color:var(--text-muted);">Manage buyer reviews, rating breakdowns, verified customer feedback, and inline responses.</p>
        </div>
        <div class="page-header-actions" style="display:flex; gap:10px;">
          <button type="button" class="btn-header-secondary" id="btn-export-reviews" data-action="export-reviews"
            style="padding:10px 16px; border:1px solid var(--border); background:var(--bg-surface); border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; min-height:44px; display:inline-flex; align-items:center; gap:8px;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            Export CSV
          </button>
        </div>
      </div>

      <!-- Main Layout: Left Overall Rating + Right Review Feed (Stacks on Mobile) -->
      <div class="reviews-two-col-layout" style="display:grid; grid-template-columns:320px 1fr; gap:24px; align-items:start;">
        <!-- Left Column: Overall Rating Card -->
        <div class="reviews-rating-card dashboard-card" style="padding:22px; background:var(--bg-surface); border:1px solid var(--border); border-radius:12px; position:sticky; top:80px;">
          <h2 style="font-size:15px; font-weight:800; margin:0 0 14px; color:var(--text-main);">Overall Rating</h2>
          
          <div style="text-align:center; padding-bottom:18px; border-bottom:1px solid var(--border);">
            <div style="font-size:48px; font-weight:800; color:var(--text-main); line-height:1;">${avgRating}</div>
            <div style="font-size:18px; margin:8px 0; display:flex; justify-content:center; gap:4px;">
              ${renderStarsSVG(parseFloat(avgRating))}
            </div>
            <div style="font-size:12.5px; color:var(--text-muted); font-weight:600;">Based on ${total} verified customer reviews</div>
          </div>

          <!-- 5 Distribution Bars with Percentages (Clicking filters) -->
          <div style="display:flex; flex-direction:column; gap:8px; margin-top:18px;">
            <div style="font-size:11.5px; font-weight:700; text-transform:uppercase; color:var(--text-muted); margin-bottom:2px;">Rating Distribution</div>
            ${[5, 4, 3, 2, 1].map(star => {
              const count = ratingCounts[star] || 0;
              const pct = distribution[star] || 0;
              const isSelected = activeStarFilter === String(star);
              return `
                <div class="rating-dist-row" data-action="filter-star" data-star="${star}"
                  style="display:flex; align-items:center; gap:10px; font-size:12.5px; cursor:pointer; padding:4px 6px; border-radius:6px; background:${isSelected ? 'rgba(127,183,60,0.1)' : 'transparent'}; transition:background 0.15s ease;">
                  <span style="min-width:42px; font-weight:700; color:var(--text-main); display:inline-flex; align-items:center; gap:4px;">
                    ${star} <i class="fa-solid fa-star" style="color:#F59E0B; font-size:11px;"></i>
                  </span>
                  <div style="flex:1; height:8px; background:var(--bg-hover, #E5E7EB); border-radius:99px; overflow:hidden;">
                    <div style="width:${pct}%; height:100%; background:${isSelected ? 'var(--primary, #7FB73C)' : '#F59E0B'}; border-radius:99px; transition:width 0.3s ease;"></div>
                  </div>
                  <span style="min-width:34px; text-align:right; font-weight:700; color:var(--text-main);">${pct}%</span>
                  <span style="min-width:28px; text-align:right; color:var(--text-muted); font-size:11px;">(${count})</span>
                </div>
              `;
            }).join('')}
          </div>

          <div style="margin-top:20px; padding-top:16px; border-top:1px solid var(--border); display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:12px; color:var(--text-muted); font-weight:600;">Unreplied reviews</span>
            <span class="badge ${unrepliedCount > 0 ? 'badge-warning' : 'badge-success'}" style="font-size:11.5px; font-weight:700; padding:2px 8px; border-radius:10px;">
              ${unrepliedCount} pending
            </span>
          </div>
        </div>

        <!-- Right Column: Review Feed, Filters & Tabs Card -->
        <div class="reviews-feed-card dashboard-card" style="background:var(--bg-surface); border:1px solid var(--border); border-radius:12px; overflow:hidden;">
          <!-- Tabs Row (Scrolls horizontally on mobile) -->
          <div class="reviews-tabs-bar" style="display:flex; gap:8px; padding:12px 18px; border-bottom:1px solid var(--border); overflow-x:auto;">
            <button type="button" class="tab-btn ${activeStarFilter === 'all' ? 'active' : ''}" data-star="all" style="padding:8px 14px; border:none; background:transparent; font-size:13px; font-weight:700; cursor:pointer; min-height:44px; border-bottom:2px solid ${activeStarFilter === 'all' ? 'var(--text-main)' : 'transparent'}; white-space:nowrap;">All (${total})</button>
            <button type="button" class="tab-btn ${activeStarFilter === '5' ? 'active' : ''}" data-star="5" style="padding:8px 14px; border:none; background:transparent; font-size:13px; font-weight:700; cursor:pointer; min-height:44px; border-bottom:2px solid ${activeStarFilter === '5' ? 'var(--text-main)' : 'transparent'}; white-space:nowrap;">5 Star (${ratingCounts[5]})</button>
            <button type="button" class="tab-btn ${activeStarFilter === '4' ? 'active' : ''}" data-star="4" style="padding:8px 14px; border:none; background:transparent; font-size:13px; font-weight:700; cursor:pointer; min-height:44px; border-bottom:2px solid ${activeStarFilter === '4' ? 'var(--text-main)' : 'transparent'}; white-space:nowrap;">4 Star (${ratingCounts[4]})</button>
            <button type="button" class="tab-btn ${activeStarFilter === '3' ? 'active' : ''}" data-star="3" style="padding:8px 14px; border:none; background:transparent; font-size:13px; font-weight:700; cursor:pointer; min-height:44px; border-bottom:2px solid ${activeStarFilter === '3' ? 'var(--text-main)' : 'transparent'}; white-space:nowrap;">3 Star (${ratingCounts[3]})</button>
            <button type="button" class="tab-btn ${activeStarFilter === 'unreplied' ? 'active' : ''}" data-star="unreplied" style="padding:8px 14px; border:none; background:transparent; font-size:13px; font-weight:700; cursor:pointer; min-height:44px; border-bottom:2px solid ${activeStarFilter === 'unreplied' ? 'var(--text-main)' : 'transparent'}; white-space:nowrap;">Unreplied (${unrepliedCount})</button>
          </div>

          <!-- Toolbar: Search, Product Filter, Sort Dropdown -->
          <div style="display:flex; justify-content:space-between; align-items:center; padding:14px 18px; border-bottom:1px solid var(--border); flex-wrap:wrap; gap:12px;">
            <div style="position:relative; width:260px; max-width:100%;">
              <span style="position:absolute; left:12px; top:50%; transform:translateY(-50%); color:var(--text-muted);">
                <i class="fa-solid fa-magnifying-glass"></i>
              </span>
              <input type="text" id="reviews-search-input" value="${escapeHTML(searchQuery)}" placeholder="Search reviews..."
                style="width:100%; padding-left:36px; height:40px; border:1px solid var(--border); border-radius:8px; font-size:16px; background:var(--bg-page); color:var(--text-main); box-sizing:border-box;">
            </div>

            <div style="display:flex; gap:10px; align-items:center; flex-wrap:wrap;">
              <select id="reviews-product-filter" style="height:40px; border:1px solid var(--border); border-radius:8px; padding:0 12px; background:var(--bg-page); color:var(--text-main); font-size:13px; max-width:200px;">
                <option value="all" ${productFilter === 'all' ? 'selected' : ''}>All Products</option>
                ${uniqueProducts.map(p => `
                  <option value="${escapeHTML(p)}" ${productFilter === p ? 'selected' : ''}>${escapeHTML(p)}</option>
                `).join('')}
              </select>

              <select id="reviews-sort-select" style="height:40px; border:1px solid var(--border); border-radius:8px; padding:0 12px; background:var(--bg-page); color:var(--text-main); font-size:13px;">
                <option value="newest" ${sortBy === 'newest' ? 'selected' : ''}>Most recent</option>
                <option value="highest" ${sortBy === 'highest' ? 'selected' : ''}>Highest rating</option>
                <option value="lowest" ${sortBy === 'lowest' ? 'selected' : ''}>Lowest rating</option>
                <option value="helpful" ${sortBy === 'helpful' ? 'selected' : ''}>Most helpful</option>
                <option value="unreplied" ${sortBy === 'unreplied' ? 'selected' : ''}>Unreplied first</option>
              </select>
            </div>
          </div>

          <!-- Reviews Feed Items -->
          <div style="padding:18px; display:flex; flex-direction:column; gap:18px;">
            ${visibleList.length === 0 ? `
              <div style="text-align:center; padding:48px 20px; color:var(--text-muted);">
                <div style="font-size:32px; margin-bottom:8px;">⭐</div>
                <div style="font-size:15px; font-weight:700; color:var(--text-main); margin-bottom:4px;">No reviews found</div>
                <div style="font-size:13px;">Try clearing search keywords or star rating filters.</div>
              </div>
            ` : visibleList.map(r => {
              const initials = r.customerName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
              const dateStr = new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

              return `
                <div class="review-card-item" data-review-id="${r.id}" style="border:1px solid var(--border); border-radius:10px; padding:18px; background:var(--bg-surface);">
                  <!-- Top Row: Customer Info + Rating + Date + Report Menu -->
                  <div style="display:flex; justify-content:space-between; align-items:flex-start; margin-bottom:12px; flex-wrap:wrap; gap:10px;">
                    <div style="display:flex; align-items:center; gap:12px;">
                      <div class="user-avatar-initials" style="width:40px; height:40px; border-radius:50%; background:var(--primary, #7FB73C); color:#fff; font-weight:800; font-size:14px; display:flex; align-items:center; justify-content:center; flex-shrink:0;">
                        ${escapeHTML(initials)}
                      </div>
                      <div>
                        <div style="display:flex; align-items:center; gap:8px;">
                          <strong style="font-size:14.5px; color:var(--text-main);">${escapeHTML(r.customerName)}</strong>
                          ${r.verified ? `<span class="badge badge-success" style="font-size:10.5px; padding:2px 8px; border-radius:4px; font-weight:700;">&check; Verified purchase</span>` : ''}
                        </div>
                        <div style="display:flex; align-items:center; gap:8px; margin-top:2px;">
                          <div style="font-size:13px; display:flex; gap:2px;">
                            ${renderStarsSVG(r.rating)}
                          </div>
                          <span style="font-size:12px; color:var(--text-muted);">&bull; ${escapeHTML(dateStr)}</span>
                        </div>
                      </div>
                    </div>

                    <!-- Report Menu -->
                    <div style="position:relative;">
                      ${r.reported ? `
                        <span style="font-size:11px; font-weight:700; color:#DC2626; background:#FEE2E2; padding:3px 8px; border-radius:4px;">
                          Reported, under review
                        </span>
                      ` : `
                        <button type="button" class="btn-report-review" data-action="open-report" data-review-id="${r.id}"
                          style="border:none; background:none; color:var(--text-muted); font-size:12px; cursor:pointer; padding:6px 10px; border-radius:6px;">
                          <i class="fa-regular fa-flag"></i> Report
                        </button>
                      `}
                    </div>
                  </div>

                  <!-- Product Reference Line -->
                  <div style="display:flex; align-items:center; gap:10px; padding:8px 12px; border-radius:8px; background:var(--bg-surface-alt, #F8FAFC); border:1px solid var(--border-subtle, #E2E8F0); margin-bottom:12px;">
                    <img src="${escapeHTML(r.productThumb)}" alt="${escapeHTML(r.productTitle)}" style="width:36px; height:36px; border-radius:6px; object-fit:cover; border:1px solid var(--border);">
                    <div style="font-size:12.5px;">
                      <span style="font-weight:700; color:var(--text-main);">${escapeHTML(r.productTitle)}</span>
                      <span style="color:var(--text-muted); margin-left:6px;">(${escapeHTML(r.productVariant)})</span>
                    </div>
                  </div>

                  <!-- Review Headline & Text -->
                  <div style="margin-bottom:12px;">
                    <div style="font-size:14px; font-weight:700; color:var(--text-main); margin-bottom:4px;">${escapeHTML(r.title)}</div>
                    <p style="font-size:13px; color:var(--text-secondary); line-height:1.6; margin:0;">${escapeHTML(r.comment)}</p>
                  </div>

                  <!-- Photos (Up to 3 thumbnails with lightbox) -->
                  ${r.photos && r.photos.length > 0 ? `
                    <div style="display:flex; gap:10px; margin-bottom:14px; flex-wrap:wrap;">
                      ${r.photos.map((ph, idx) => `
                        <div class="review-photo-thumb" data-action="open-photo-lightbox" data-src="${escapeHTML(ph)}"
                          style="width:72px; height:72px; border-radius:8px; overflow:hidden; border:1px solid var(--border); cursor:pointer; box-shadow:0 1px 3px rgba(0,0,0,0.06);">
                          <img src="${escapeHTML(ph)}" alt="Photo ${idx + 1}" style="width:100%; height:100%; object-fit:cover;">
                        </div>
                      `).join('')}
                    </div>
                  ` : ''}

                  <!-- Reply Box or Existing Reply -->
                  ${r.sellerReply ? `
                    <div class="seller-reply-box" style="padding:14px; background:var(--bg-surface-alt, #F8FAF7); border-left:3px solid var(--primary, #7FB73C); border-radius:6px; margin-top:10px;">
                      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                        <strong style="font-size:13px; color:var(--text-main); display:flex; align-items:center; gap:6px;">
                          <i class="fa-solid fa-reply" style="font-size:11px; color:var(--primary, #7FB73C);"></i> Your reply (${escapeHTML(r.sellerReply.sellerName)})
                        </strong>
                        <div style="display:flex; gap:8px;">
                          <button type="button" class="btn-edit-reply" data-action="edit-reply" data-review-id="${r.id}" style="border:none; background:none; font-size:12px; color:var(--text-muted); cursor:pointer;">Edit</button>
                          <button type="button" class="btn-delete-reply" data-action="delete-reply" data-review-id="${r.id}" style="border:none; background:none; font-size:12px; color:#DC2626; cursor:pointer;">Delete</button>
                        </div>
                      </div>
                      <p style="font-size:13px; color:var(--text-secondary); margin:0; line-height:1.5;">${escapeHTML(r.sellerReply.comment)}</p>
                    </div>
                  ` : `
                    <div class="reply-composer-wrap" style="margin-top:10px; padding-top:12px; border-top:1px dashed var(--border);">
                      <div style="display:flex; flex-direction:column; gap:8px;">
                        <textarea class="reply-textarea" data-review-id="${r.id}" placeholder="Reply to this review publicly as Ameza Official..." maxlength="500" rows="2"
                          style="width:100%; padding:10px 12px; border:1px solid var(--border); border-radius:8px; font-size:16px; background:var(--bg-page); color:var(--text-main); box-sizing:border-box;"></textarea>
                        
                        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:8px;">
                          <span class="char-counter" style="font-size:11.5px; color:var(--text-muted);">0 / 500 characters</span>
                          <button type="button" class="btn-post-reply" data-action="post-reply" data-review-id="${r.id}"
                            style="padding:8px 18px; border:none; background:var(--dark, #111827); color:#fff; border-radius:6px; font-size:13px; font-weight:700; cursor:pointer; min-height:44px; display:inline-flex; align-items:center; gap:6px;">
                            <span>Reply</span>
                            <i class="fa-solid fa-paper-plane" style="font-size:11px;"></i>
                          </button>
                        </div>
                      </div>
                    </div>
                  `}
                </div>
              `;
            }).join('')}

            <!-- Load More Button -->
            ${filtered.length > displayLimit ? `
              <div style="text-align:center; padding-top:10px;">
                <button type="button" id="btn-load-more-reviews" style="padding:10px 24px; border:1px solid var(--border); background:var(--bg-surface); border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; min-height:44px;">
                  Load more (${filtered.length - displayLimit} remaining)
                </button>
              </div>
            ` : ''}
          </div>
        </div>
      </div>

      <!-- Lightbox Modal -->
      <div id="reviews-lightbox-modal" class="returns-lightbox-overlay" style="display:none;">
        <button type="button" class="btn-close-lightbox" id="btn-close-rev-lightbox">&times;</button>
        <img id="reviews-lightbox-img" src="" alt="Enlarged review photo" style="max-width:90%; max-height:85vh; border-radius:8px; box-shadow:0 8px 30px rgba(0,0,0,0.5);">
      </div>

      <!-- Report Modal -->
      <div id="report-review-modal" class="returns-modal-backdrop" style="display:none;">
        <div class="returns-modal-dialog" style="background:var(--bg-surface); padding:24px; border-radius:12px; max-width:440px; width:92%; margin:40px auto; border:1px solid var(--border); box-shadow:0 12px 36px rgba(0,0,0,0.2);">
          <h3 style="font-size:17px; font-weight:800; margin:0 0 6px; color:#DC2626;">Report Review to Moderation</h3>
          <p style="font-size:13px; color:var(--text-secondary); margin:0 0 16px;">
            Select a violation reason to flag this review for marketplace moderation review.
          </p>

          <div style="display:flex; flex-direction:column; gap:8px; margin-bottom:16px;">
            ${['Spam or promotional links', 'Offensive or abusive language', 'Fake or competitor review', 'Incorrect product delivered / shipping issue', 'Other policy violation'].map((opt, oIdx) => `
              <label style="display:flex; align-items:center; gap:8px; font-size:13px; cursor:pointer; padding:6px 0;">
                <input type="radio" name="report-reason-radio" value="${opt}" ${oIdx === 0 ? 'checked' : ''} style="width:16px; height:16px;">
                <span>${opt}</span>
              </label>
            `).join('')}
          </div>

          <div style="display:flex; justify-content:flex-end; gap:10px;">
            <button type="button" id="btn-cancel-report" style="padding:10px 16px; border:1px solid var(--border); background:none; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; min-height:44px;">Cancel</button>
            <button type="button" id="btn-confirm-report" style="padding:10px 20px; border:none; background:#DC2626; color:#fff; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; min-height:44px;">Submit Report</button>
          </div>
        </div>
      </div>
    </div>
  `;

  bindEvents();
}

function bindEvents() {
  const container = document.getElementById('reviews-content-container');
  if (!container) return;

  // Star tabs
  container.querySelectorAll('.reviews-tabs-bar .tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeStarFilter = btn.getAttribute('data-star');
      displayLimit = 6;
      renderReviewsView();
    });
  });

  // Star distribution row clicks
  container.querySelectorAll('.rating-dist-row').forEach(row => {
    row.addEventListener('click', () => {
      const star = row.getAttribute('data-star');
      activeStarFilter = activeStarFilter === star ? 'all' : star;
      displayLimit = 6;
      renderReviewsView();
    });
  });

  // Search input
  const searchInput = document.getElementById('reviews-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value;
      renderReviewsView();
    });
  }

  // Product filter
  const prodSelect = document.getElementById('reviews-product-filter');
  if (prodSelect) {
    prodSelect.addEventListener('change', (e) => {
      productFilter = e.target.value;
      renderReviewsView();
    });
  }

  // Sort select
  const sortSelect = document.getElementById('reviews-sort-select');
  if (sortSelect) {
    sortSelect.addEventListener('change', (e) => {
      sortBy = e.target.value;
      renderReviewsView();
    });
  }

  // Textarea char counter
  container.querySelectorAll('.reply-textarea').forEach(tx => {
    tx.addEventListener('input', (e) => {
      const counter = tx.closest('.reply-composer-wrap')?.querySelector('.char-counter');
      if (counter) {
        counter.textContent = `${e.target.value.length} / 500 characters`;
      }
    });
  });

  // Post reply
  container.querySelectorAll('[data-action="post-reply"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const revId = btn.getAttribute('data-review-id');
      const textarea = btn.closest('.reply-composer-wrap')?.querySelector('.reply-textarea');
      if (!textarea || !textarea.value.trim()) return;

      const reviews = getReviews();
      const target = reviews.find(r => r.id === revId);
      if (target) {
        target.sellerReply = {
          sellerName: 'Ameza Official',
          comment: textarea.value.trim(),
          repliedAt: Date.now()
        };
        saveReviews(reviews);
        showToast('Reply published successfully!', 'success');
        renderReviewsView();
      }
    });
  });

  // Edit reply
  container.querySelectorAll('[data-action="edit-reply"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const revId = btn.getAttribute('data-review-id');
      const reviews = getReviews();
      const target = reviews.find(r => r.id === revId);
      if (target && target.sellerReply) {
        const prevComment = target.sellerReply.comment;
        target.sellerReply = null; // revert to composer
        saveReviews(reviews);
        renderReviewsView();
        
        // Populate text in newly rendered composer
        const newCard = container.querySelector(`[data-review-id="${revId}"]`);
        const tx = newCard?.querySelector('.reply-textarea');
        if (tx) {
          tx.value = prevComment;
          tx.focus();
        }
      }
    });
  });

  // Delete reply
  container.querySelectorAll('[data-action="delete-reply"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const revId = btn.getAttribute('data-review-id');
      const reviews = getReviews();
      const target = reviews.find(r => r.id === revId);
      if (target) {
        target.sellerReply = null;
        saveReviews(reviews);
        showToast('Reply removed', 'info');
        renderReviewsView();
      }
    });
  });

  // Lightbox
  container.querySelectorAll('[data-action="open-photo-lightbox"]').forEach(ph => {
    ph.addEventListener('click', () => {
      const src = ph.getAttribute('data-src');
      const modal = document.getElementById('reviews-lightbox-modal');
      const img = document.getElementById('reviews-lightbox-img');
      if (modal && img) {
        img.src = src;
        modal.style.display = 'flex';
      }
    });
  });

  document.getElementById('btn-close-rev-lightbox')?.addEventListener('click', () => {
    const modal = document.getElementById('reviews-lightbox-modal');
    if (modal) modal.style.display = 'none';
  });

  // Report Modal
  container.querySelectorAll('[data-action="open-report"]').forEach(btn => {
    btn.addEventListener('click', () => {
      openReportModalId = btn.getAttribute('data-review-id');
      const modal = document.getElementById('report-review-modal');
      if (modal) modal.style.display = 'block';
    });
  });

  document.getElementById('btn-cancel-report')?.addEventListener('click', () => {
    const modal = document.getElementById('report-review-modal');
    if (modal) modal.style.display = 'none';
    openReportModalId = null;
  });

  document.getElementById('btn-confirm-report')?.addEventListener('click', () => {
    if (!openReportModalId) return;
    const reason = document.querySelector('input[name="report-reason-radio"]:checked')?.value || 'Flagged by seller';
    const reviews = getReviews();
    const target = reviews.find(r => r.id === openReportModalId);
    if (target) {
      target.reported = true;
      saveReviews(reviews);

      // Add to admin moderation queue in localStorage
      try {
        const rawQueue = localStorage.getItem(MODERATION_KEY) || '[]';
        const queue = JSON.parse(rawQueue);
        queue.unshift({
          id: 'mod_' + Date.now(),
          type: 'review_report',
          reviewId: target.id,
          productTitle: target.productTitle,
          customerName: target.customerName,
          reason,
          timestamp: Date.now()
        });
        localStorage.setItem(MODERATION_KEY, JSON.stringify(queue));
      } catch (e) {}

      showToast('Review reported to AMEZA moderation', 'warning');
      const modal = document.getElementById('report-review-modal');
      if (modal) modal.style.display = 'none';
      openReportModalId = null;
      renderReviewsView();
    }
  });

  // Load more
  document.getElementById('btn-load-more-reviews')?.addEventListener('click', () => {
    displayLimit += 6;
    renderReviewsView();
  });

  // Export CSV
  document.getElementById('btn-export-reviews')?.addEventListener('click', () => {
    const reviews = getReviews();
    const headers = ['Review ID', 'Product Title', 'Customer Name', 'Rating', 'Title', 'Comment', 'Verified', 'Date'];
    const rows = reviews.map(r => [
      r.id,
      `"${r.productTitle.replace(/"/g, '""')}"`,
      `"${r.customerName.replace(/"/g, '""')}"`,
      r.rating,
      `"${r.title.replace(/"/g, '""')}"`,
      `"${r.comment.replace(/"/g, '""')}"`,
      r.verified,
      `"${new Date(r.createdAt).toISOString().slice(0, 10)}"`
    ]);
    const csv = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const a = document.createElement('a');
    a.href = encodeURI(csv);
    a.download = `ameza_reviews_${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    showToast('Customer reviews exported to CSV', 'success');
  });
}
