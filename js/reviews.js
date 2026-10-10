/**
 * AMEZA Seller Central — Customer Reviews Engine (js/reviews.js)
 * Manages customer feedback, visual rating distribution bar charts,
 * verified buyer validation, and merchant response workflows.
 */

import { Icons } from './icons.js';
import { escapeHTML, showToast } from './shell.js';

const STORAGE_KEY = 'ameza_seller_reviews';

const DEFAULT_REVIEWS = [
  {
    id: 'rev_001',
    productId: 'prod_100',
    productTitle: 'Classic Saddle Leather Belt',
    customerName: 'David Wilson',
    rating: 5,
    title: 'Remarkable quality and sturdy brass buckle',
    comment: 'The full grain leather is thick and smells incredible. Easily beats luxury retail brands at double the price.',
    verified: true,
    createdAt: 1790901480622,
    sellerReply: {
      sellerName: 'Austin Leather Co',
      comment: 'Thank you David! We source all our full-grain leather domestically, glad you love the grain.',
      repliedAt: 1790987880622
    }
  },
  {
    id: 'rev_002',
    productId: 'prod_101',
    productTitle: 'Full-Grain Slim Wallet',
    customerName: 'Sarah Mitchell',
    rating: 5,
    title: 'Perfect minimalist front-pocket wallet',
    comment: 'Fits 6 cards and cash comfortably without any bulk. Stitching is immaculate.',
    verified: true,
    createdAt: 1790642280622,
    sellerReply: {
      sellerName: 'Austin Leather Co',
      comment: 'Cheers Sarah! We spent months perfecting that ultra-slim profile.',
      repliedAt: 1790728680622
    }
  },
  {
    id: 'rev_003',
    productId: 'prod_114',
    productTitle: 'Relaxed Linen Shirt',
    customerName: 'Michael Roberts',
    rating: 5,
    title: 'Ultimate summer shirt',
    comment: 'Light, airy, and breathes exceptionally well in summer heat. Highly recommend.',
    verified: true,
    createdAt: 1790296680622,
    sellerReply: {
      sellerName: 'Pacific Coastal Living',
      comment: 'Thanks Michael! That organic linen gets even softer with every single wash.',
      repliedAt: 1790383080622
    }
  },
  {
    id: 'rev_004',
    productId: 'prod_126',
    productTitle: 'Precision Chronograph 41mm',
    customerName: 'Emily Carter',
    rating: 4,
    title: 'Gorgeous watch, slightly stiff strap initially',
    comment: 'The dial details and meca-quartz movement are spot on. Leather strap took 3 days to soften up.',
    verified: true,
    createdAt: 1790037480622,
    sellerReply: {
      sellerName: 'Portland Artisan Goods',
      comment: 'Thanks Emily! The vegetable-tanned strap molds to your wrist over the first few days of wear.',
      repliedAt: 1790123880622
    }
  },
  {
    id: 'rev_005',
    productId: 'prod_108',
    productTitle: 'Active Noise-Cancelling Headphones',
    customerName: 'Marcus Johnson',
    rating: 4,
    title: 'Superb sound isolation on flights',
    comment: 'Battery life exceeded 30 hours on a cross-country trip. Bass response is punchy without distorting.',
    verified: true,
    createdAt: 1789778280622,
    sellerReply: null
  },
  {
    id: 'rev_006',
    productId: 'prod_100',
    productTitle: 'Classic Saddle Leather Belt',
    customerName: 'Jessica Taylor',
    rating: 3,
    title: 'Solid leather but sizing runs slightly small',
    comment: 'Belt width is fantastic and buckle feels indestructible. I recommend ordering one size up from your pant size.',
    verified: true,
    createdAt: 1789519080622,
    sellerReply: null
  }
];

export function getReviews() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return JSON.parse(saved);
  } catch (e) {
    console.error('Failed to parse reviews from localStorage', e);
  }
  return [...DEFAULT_REVIEWS];
}

export function saveReviews(reviews) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reviews));
}

let activeRatingFilter = 'all';
let searchQuery = '';
let sortBy = 'newest';

export function initReviews() {
  renderReviewsView();
  bindReviewsEvents();
}

function renderReviewsView() {
  const container = document.getElementById('reviews-content-container');
  if (!container) return;

  const reviews = getReviews();

  // Calculate rating stats
  const total = reviews.length;
  const ratingCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  let sumRatings = 0;
  reviews.forEach(r => {
    ratingCounts[r.rating] = (ratingCounts[r.rating] || 0) + 1;
    sumRatings += r.rating;
  });
  const avgRating = total > 0 ? (sumRatings / total).toFixed(1) : '5.0';
  const unansweredCount = reviews.filter(r => !r.sellerReply).length;

  // Filter reviews
  let filtered = reviews.filter(r => {
    if (activeRatingFilter === '5' && r.rating !== 5) return false;
    if (activeRatingFilter === '4' && r.rating !== 4) return false;
    if (activeRatingFilter === '3-down' && r.rating > 3) return false;
    if (activeRatingFilter === 'unanswered' && r.sellerReply) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchText = (r.customerName + ' ' + r.productTitle + ' ' + r.title + ' ' + r.comment).toLowerCase();
      return matchText.includes(q);
    }
    return true;
  });

  // Sort reviews
  if (sortBy === 'newest') {
    filtered.sort((a, b) => b.createdAt - a.createdAt);
  } else if (sortBy === 'highest') {
    filtered.sort((a, b) => b.rating - a.rating);
  } else if (sortBy === 'lowest') {
    filtered.sort((a, b) => a.rating - b.rating);
  }

  container.innerHTML = `
    <!-- Page Header -->
    <div class="page-header" style="margin-bottom: 24px;">
      <div>
        <h1 class="page-title">Customer Reviews & Ratings</h1>
        <p class="page-subtitle">Track buyer satisfaction, respond to verified customer feedback, and maintain your store rating.</p>
      </div>
      <div class="page-header-actions">
        <button id="btn-export-reviews" class="btn-header-secondary" style="display: flex; align-items: center; gap: 8px;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Export Reviews
        </button>
      </div>
    </div>

    <!-- 1. Rating Overview Card -->
    <div class="dashboard-card" style="padding: 24px; background: var(--bg-surface); border: 1px solid var(--border); border-radius: 12px; margin-bottom: 24px;">
      <div style="display: grid; grid-template-columns: 220px 1fr 240px; gap: 32px; align-items: center;">
        <!-- Left: Big Score -->
        <div style="text-align: center; border-right: 1px solid var(--border-subtle); padding-right: 24px;">
          <div style="font-size: 52px; font-weight: 800; color: var(--text-main); line-height: 1;">${avgRating}</div>
          <div style="color: #F59E0B; font-size: 20px; margin: 8px 0;">
            ${renderStars(Math.round(parseFloat(avgRating)))}
          </div>
          <div style="font-size: 13px; color: var(--text-secondary); font-weight: 600;">Based on ${total} verified ratings</div>
        </div>

        <!-- Center: Breakdown Bar Chart -->
        <div style="display: flex; flex-direction: column; gap: 8px;">
          ${[5, 4, 3, 2, 1].map(star => {
            const count = ratingCounts[star] || 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return `
              <div style="display: flex; align-items: center; gap: 12px; font-size: 12.5px;">
                <span style="min-width: 45px; color: var(--text-secondary); font-weight: 600;">${star} star</span>
                <div style="flex: 1; height: 8px; background: var(--border-subtle); border-radius: 4px; overflow: hidden;">
                  <div style="width: ${pct}%; height: 100%; background: #F59E0B; border-radius: 4px; transition: width 0.4s ease;"></div>
                </div>
                <span style="min-width: 35px; text-align: right; color: var(--text-secondary); font-weight: 600;">${pct}%</span>
                <span style="min-width: 25px; text-align: right; color: var(--text-tertiary); font-size: 11px;">(${count})</span>
              </div>
            `;
          }).join('')}
        </div>

        <!-- Right: Satisfaction Metrics -->
        <div style="border-left: 1px solid var(--border-subtle); padding-left: 24px; display: flex; flex-direction: column; gap: 14px;">
          <div>
            <div style="font-size: 11.5px; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Verified Buyers</div>
            <div style="font-size: 18px; font-weight: 800; color: #10B981; margin-top: 2px;">98.4%</div>
          </div>
          <div>
            <div style="font-size: 11.5px; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Response Rate</div>
            <div style="font-size: 18px; font-weight: 800; color: #3B82F6; margin-top: 2px;">${Math.round(((total - unansweredCount) / total) * 100)}%</div>
          </div>
          <div>
            <div style="font-size: 11.5px; color: var(--text-secondary); text-transform: uppercase; font-weight: 700; letter-spacing: 0.5px;">Awaiting Reply</div>
            <div style="font-size: 18px; font-weight: 800; color: ${unansweredCount > 0 ? '#F59E0B' : 'var(--text-main)'}; margin-top: 2px;">${unansweredCount} review${unansweredCount === 1 ? '' : 's'}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 2. Main Reviews List Card -->
    <div class="card-products" style="background: var(--bg-surface); border: 1px solid var(--border); border-radius: 12px; overflow: hidden;">
      <!-- Filter Tabs -->
      <div class="products-tabs-row" id="review-tabs" style="display: flex; gap: 8px; padding: 12px 18px; border-bottom: 1px solid var(--border-subtle); background: var(--bg-surface);">
        <button class="tab-btn ${activeRatingFilter === 'all' ? 'active' : ''}" data-filter="all">All (${total})</button>
        <button class="tab-btn ${activeRatingFilter === '5' ? 'active' : ''}" data-filter="5">5 Stars (${ratingCounts[5] || 0})</button>
        <button class="tab-btn ${activeRatingFilter === '4' ? 'active' : ''}" data-filter="4">4 Stars (${ratingCounts[4] || 0})</button>
        <button class="tab-btn ${activeRatingFilter === '3-down' ? 'active' : ''}" data-filter="3-down">3 Stars & Below (${(ratingCounts[3] || 0) + (ratingCounts[2] || 0) + (ratingCounts[1] || 0)})</button>
        <button class="tab-btn ${activeRatingFilter === 'unanswered' ? 'active' : ''}" data-filter="unanswered">Awaiting Reply (${unansweredCount})</button>
      </div>

      <!-- Toolbar -->
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 14px 18px; border-bottom: 1px solid var(--border-subtle); flex-wrap: wrap; gap: 12px;">
        <div style="position: relative; width: 340px;">
          <span style="position: absolute; left: 12px; top: 50%; transform: translateY(-50%); color: var(--text-tertiary);">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          </span>
          <input type="text" id="review-search-input" value="${escapeHTML(searchQuery)}" placeholder="Search by customer, product, or keyword..." class="search-field" style="width: 100%; padding-left: 36px; height: 36px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-page); color: var(--text-main);">
        </div>

        <div style="display: flex; gap: 10px; align-items: center;">
          <span style="font-size: 12.5px; color: var(--text-secondary);">Sort:</span>
          <select id="review-sort-select" style="height: 36px; border: 1px solid var(--border); border-radius: 6px; padding: 0 12px; background: var(--bg-page); color: var(--text-main); font-size: 13px;">
            <option value="newest" ${sortBy === 'newest' ? 'selected' : ''}>Newest First</option>
            <option value="highest" ${sortBy === 'highest' ? 'selected' : ''}>Highest Rating</option>
            <option value="lowest" ${sortBy === 'lowest' ? 'selected' : ''}>Lowest Rating</option>
          </select>
        </div>
      </div>

      <!-- Reviews Feed List -->
      <div style="padding: 12px 18px; display: flex; flex-direction: column; gap: 16px;">
        ${filtered.length === 0 ? `
          <div style="text-align: center; padding: 48px; color: var(--text-secondary);">
            <div style="font-size: 32px; margin-bottom: 8px;">⭐</div>
            <div style="font-weight: 700; font-size: 15px; margin-bottom: 4px;">No reviews found</div>
            <div style="font-size: 12px;">Try clearing your filters or search terms.</div>
          </div>
        ` : filtered.map(r => {
          const initials = r.customerName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
          const dateStr = new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

          return `
            <div class="review-item-card" data-review-id="${r.id}" style="padding: 20px; border: 1px solid var(--border-subtle); border-radius: 10px; background: var(--bg-surface);">
              <!-- Top Row: Avatar + Customer + Rating + Date -->
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 12px;">
                  <div style="width: 40px; height: 40px; border-radius: 50%; background: var(--primary-green-light); color: var(--primary-green-dark); font-weight: 800; font-size: 13px; display: flex; align-items: center; justify-content: center;">
                    ${escapeHTML(initials)}
                  </div>
                  <div>
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <span style="font-weight: 700; color: var(--text-main); font-size: 14px;">${escapeHTML(r.customerName)}</span>
                      ${r.verified ? `<span class="status-pill status-paid" style="font-size: 10.5px; padding: 2px 8px;">&check; Verified Buyer</span>` : ''}
                    </div>
                    <div style="font-size: 12px; color: var(--text-secondary); margin-top: 2px;">
                      Purchased: <strong style="color: var(--text-main);">${escapeHTML(r.productTitle)}</strong>
                    </div>
                  </div>
                </div>

                <div style="text-align: right;">
                  <div style="color: #F59E0B; font-size: 15px; letter-spacing: 2px;">
                    ${renderStars(r.rating)}
                  </div>
                  <div style="font-size: 11.5px; color: var(--text-tertiary); margin-top: 3px;">
                    ${escapeHTML(dateStr)}
                  </div>
                </div>
              </div>

              <!-- Review Body -->
              <div style="margin-bottom: 14px; padding-left: 52px;">
                <h3 style="font-size: 14px; font-weight: 700; color: var(--text-main); margin-bottom: 6px;">${escapeHTML(r.title)}</h3>
                <p style="font-size: 13px; color: var(--text-secondary); line-height: 1.5;">${escapeHTML(r.comment)}</p>
              </div>

              <!-- Seller Reply or Action -->
              <div style="padding-left: 52px;">
                ${r.sellerReply ? `
                  <div style="background: var(--bg-page); border-left: 3px solid var(--primary-green-dark); padding: 12px 16px; border-radius: 0 8px 8px 0;">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                      <span style="font-size: 12px; font-weight: 700; color: var(--primary-green-dark);">
                        <i class="fa-solid fa-reply" style="margin-right: 4px;"></i> Reply from ${escapeHTML(r.sellerReply.sellerName)}
                      </span>
                      <span style="font-size: 11px; color: var(--text-tertiary);">
                        ${new Date(r.sellerReply.repliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                    <p style="font-size: 12.5px; color: var(--text-main); margin: 0; line-height: 1.45;">${escapeHTML(r.sellerReply.comment)}</p>
                  </div>
                ` : `
                  <div>
                    <button type="button" class="btn-toggle-reply btn-header-secondary" data-review-id="${r.id}" style="font-size: 12px; padding: 6px 12px;">
                      <i class="fa-solid fa-reply" style="margin-right: 6px;"></i> Reply to Buyer
                    </button>
                    <!-- Inline Reply Box (Hidden by default) -->
                    <div id="reply-box-${r.id}" style="display: none; margin-top: 10px; background: var(--bg-page); padding: 12px; border-radius: 8px; border: 1px solid var(--border);">
                      <textarea id="reply-text-${r.id}" rows="2" placeholder="Write a professional, helpful response to ${escapeHTML(r.customerName)}..." style="width: 100%; border: 1px solid var(--border); border-radius: 6px; padding: 8px 10px; font-size: 12.5px; background: var(--bg-surface); color: var(--text-main); font-family: inherit; resize: vertical;"></textarea>
                      <div style="display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px;">
                        <button type="button" class="btn-cancel-reply btn-header-secondary" data-review-id="${r.id}" style="font-size: 11.5px; padding: 4px 10px;">Cancel</button>
                        <button type="button" class="btn-submit-reply btn-header-primary" data-review-id="${r.id}" style="font-size: 11.5px; padding: 4px 12px;">Post Reply</button>
                      </div>
                    </div>
                  </div>
                `}
              </div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;
}

function renderStars(rating) {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= rating) {
      stars += '★';
    } else {
      stars += '☆';
    }
  }
  return stars;
}

function bindReviewsEvents() {
  // Tabs
  document.querySelectorAll('#review-tabs .tab-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      activeRatingFilter = btn.getAttribute('data-filter');
      renderReviewsView();
      bindReviewsEvents();
    });
  });

  // Search
  const searchInput = document.getElementById('review-search-input');
  searchInput?.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderReviewsView();
    bindReviewsEvents();
    const el = document.getElementById('review-search-input');
    if (el) {
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
  });

  // Sort
  document.getElementById('review-sort-select')?.addEventListener('change', (e) => {
    sortBy = e.target.value;
    renderReviewsView();
    bindReviewsEvents();
  });

  // Toggle inline reply form
  document.querySelectorAll('.btn-toggle-reply').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-review-id');
      const box = document.getElementById(`reply-box-${id}`);
      if (box) {
        box.style.display = box.style.display === 'none' ? 'block' : 'none';
        if (box.style.display === 'block') {
          document.getElementById(`reply-text-${id}`)?.focus();
        }
      }
    });
  });

  // Cancel reply
  document.querySelectorAll('.btn-cancel-reply').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-review-id');
      const box = document.getElementById(`reply-box-${id}`);
      if (box) box.style.display = 'none';
    });
  });

  // Submit reply
  document.querySelectorAll('.btn-submit-reply').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-review-id');
      const textarea = document.getElementById(`reply-text-${id}`);
      const text = textarea?.value.trim();

      if (!text) {
        showToast('Please type a reply message before posting.', 'error');
        return;
      }

      const reviews = getReviews();
      const target = reviews.find(r => r.id === id);
      if (target) {
        target.sellerReply = {
          sellerName: 'Ameza Official Store',
          comment: text,
          repliedAt: Date.now()
        };
        saveReviews(reviews);
        renderReviewsView();
        bindReviewsEvents();
        showToast('Your merchant response was posted successfully!', 'success');
      }
    });
  });

  // Export CSV
  document.getElementById('btn-export-reviews')?.addEventListener('click', () => {
    const reviews = getReviews();
    const rows = [
      ['ID', 'Product', 'Customer', 'Rating', 'Title', 'Comment', 'Verified', 'Date', 'Seller Replied'],
      ...reviews.map(r => [
        r.id,
        `"${r.productTitle}"`,
        `"${r.customerName}"`,
        r.rating,
        `"${r.title}"`,
        `"${r.comment}"`,
        r.verified ? 'Yes' : 'No',
        new Date(r.createdAt).toISOString(),
        r.sellerReply ? 'Yes' : 'No'
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'ameza_customer_reviews.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast('Customer reviews exported to CSV', 'success');
  });
}
