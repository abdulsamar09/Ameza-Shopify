/**
 * AMEZA Marketplace - Single Product Page Controller (product.html)
 * Implements:
 * - 1-Row Add to Cart + Buy Now
 * - 1-Row Quantity Stepper + Wishlist Button
 * - Size / Dimensions Dropdown + Color Circles
 * - Image Gallery Arrow Controls (Prev/Next) + Carousel Indicator Dots
 * - You May Also Like Slider / Carousel with Left/Right Controls
 * - Reviews Tab "Write a Review" Interactive Form & Real-time Submission
 * - Slide-Out Cart Drawer Integration
 */

import { STORE_DATA } from './store-page.js';
import { PRODUCTS as CATALOG_PRODUCTS } from './products-data.js';
import { initCartDrawer } from './cart-drawer.js';
import { formatMoney } from './core/utils.js';

export function initProductPage() {
  // Initialize the slide-out cart drawer on product page
  initCartDrawer();

  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id') || 'ul-1';

  // Find product from catalog data or store catalog or default to backpack
  const catalogMatch = CATALOG_PRODUCTS.find(p => String(p.id) === String(productId));
  const storeMatch = STORE_DATA.products.find(p => String(p.id) === String(productId));
  const product = catalogMatch || storeMatch || STORE_DATA.products[0];

  // Gallery Images List for this product (8 images total)
  const galleryImages = [
    product.image,
    'assets/products/ul-backpack.jpg',
    'assets/products/ul-messenger.jpg',
    'assets/products/ul-wallet.jpg',
    'assets/products/ul-belt.jpg',
    'assets/products/ul-tote.jpg',
    'assets/products/ul-cardholder.jpg',
    'assets/products/ul-doppkit.jpg'
  ];

  let currentImageIndex = 0;

  // DOM Elements
  const mainImageEl = document.getElementById('pdp-main-image');
  const thumbsContainer = document.getElementById('pdp-thumbs-column');
  const dotsContainer = document.getElementById('pdp-carousel-dots');
  const btnGalleryPrev = document.getElementById('gallery-prev');
  const btnGalleryNext = document.getElementById('gallery-next');

  const titleEl = document.getElementById('pdp-product-title');
  const breadcrumbCurrentEl = document.getElementById('breadcrumb-product-name');
  const priceCurrentEl = document.getElementById('pdp-price-current');
  const priceCompareEl = document.getElementById('pdp-price-compare');
  const discountTagEl = document.getElementById('pdp-discount-tag');

  const sizeSelect = document.getElementById('pdp-size-select');
  const selectedSizeLabel = document.getElementById('selected-size-label');
  const selectedColorLabel = document.getElementById('selected-color-label');

  const quantityInput = document.getElementById('pdp-quantity-input');
  const btnQtyMinus = document.getElementById('btn-qty-minus');
  const btnQtyPlus = document.getElementById('btn-qty-plus');
  const btnWishlistRow = document.getElementById('btn-pdp-wishlist-action');
  const btnGalleryWishlist = document.getElementById('btn-pdp-wishlist');

  const btnAddToCart = document.getElementById('btn-add-to-cart');
  const btnBuyNow = document.getElementById('btn-buy-now');
  const cartBadge = document.getElementById('header-cart-badge');
  const wishlistBadge = document.getElementById('header-wishlist-badge');

  // Populate Product Basic Info
  const priceCents = Number(product.priceCents !== undefined ? product.priceCents : product.price) || 0;
  const compareAtCents = Number(product.compareAtCents || product.compareAtPriceCents || product.compareAtPrice || product.oldPrice || 0);
  const hasDiscount = compareAtCents > priceCents && priceCents > 0;
  const discountPct = hasDiscount ? Math.round(((compareAtCents - priceCents) / compareAtCents) * 100) : 0;

  if (titleEl) titleEl.textContent = product.name;
  if (breadcrumbCurrentEl) breadcrumbCurrentEl.textContent = product.name;
  if (priceCurrentEl) priceCurrentEl.textContent = formatMoney(priceCents);
  if (priceCompareEl) {
    if (hasDiscount) {
      priceCompareEl.textContent = formatMoney(compareAtCents);
      priceCompareEl.style.display = '';
    } else {
      priceCompareEl.textContent = '';
      priceCompareEl.style.display = 'none';
    }
  }
  if (discountTagEl) {
    if (hasDiscount) {
      discountTagEl.textContent = `-${discountPct}%`;
      discountTagEl.style.display = '';
    } else {
      discountTagEl.textContent = '';
      discountTagEl.style.display = 'none';
    }
  }

  // Populate Vertical Thumbnails
  if (thumbsContainer) {
    thumbsContainer.innerHTML = galleryImages.map((img, idx) => `
      <div class="pdp-thumb-card ${idx === 0 ? 'active' : ''}" data-index="${idx}" data-img="${img}">
        <img src="${img}" alt="Thumbnail ${idx + 1}" loading="lazy">
      </div>
    `).join('');
  }

  // Populate Carousel Indicator Dots (all images)
  if (dotsContainer) {
    dotsContainer.innerHTML = galleryImages.map((_, idx) => `
      <span class="pdp-dot ${idx === 0 ? 'active' : ''}" data-index="${idx}" title="Slide ${idx + 1}"></span>
    `).join('');
  }

  // Function to switch main gallery image
  function switchMainImage(idx) {
    if (idx < 0) idx = galleryImages.length - 1;
    if (idx >= galleryImages.length) idx = 0;
    currentImageIndex = idx;
    const src = galleryImages[currentImageIndex];

    if (mainImageEl) {
      mainImageEl.style.opacity = '0.4';
      setTimeout(() => {
        mainImageEl.src = src;
        mainImageEl.style.opacity = '1';
      }, 120);
    }

    document.querySelectorAll('.pdp-thumb-card').forEach((th, i) => {
      th.classList.toggle('active', i === currentImageIndex);
    });

    document.querySelectorAll('.pdp-dot').forEach((dot, i) => {
      dot.classList.toggle('active', i === currentImageIndex);
    });
  }

  // Gallery Controls (Arrows & Dots & Thumbs)
  if (btnGalleryPrev) {
    btnGalleryPrev.addEventListener('click', () => switchMainImage(currentImageIndex - 1));
  }
  if (btnGalleryNext) {
    btnGalleryNext.addEventListener('click', () => switchMainImage(currentImageIndex + 1));
  }

  if (dotsContainer) {
    dotsContainer.addEventListener('click', (e) => {
      const dot = e.target.closest('.pdp-dot');
      if (dot) {
        const idx = Number(dot.dataset.index);
        switchMainImage(idx);
      }
    });
  }

  if (thumbsContainer) {
    thumbsContainer.addEventListener('click', (e) => {
      const card = e.target.closest('.pdp-thumb-card');
      if (card) {
        const idx = Number(card.dataset.index);
        switchMainImage(idx);
      }
    });
  }

  // Size Dropdown Selection
  let selectedSize = 'Standard Commuter · 24L';
  if (sizeSelect) {
    sizeSelect.addEventListener('change', (e) => {
      const selectedOption = e.target.options[e.target.selectedIndex];
      selectedSize = selectedOption.text;
      if (selectedSizeLabel) selectedSizeLabel.textContent = selectedSize;
    });
  }

  // Color Swatch Circle Selection
  let selectedColor = 'Tan Brown';
  const swatchButtons = document.querySelectorAll('.color-swatch-btn');
  swatchButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      swatchButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedColor = btn.dataset.name || 'Tan Brown';
      if (selectedColorLabel) selectedColorLabel.textContent = selectedColor;
    });
  });

  // Quantity Controls
  let quantity = 1;
  if (btnQtyMinus && quantityInput) {
    btnQtyMinus.addEventListener('click', () => {
      if (quantity > 1) {
        quantity--;
        quantityInput.value = quantity;
      }
    });
  }
  if (btnQtyPlus && quantityInput) {
    btnQtyPlus.addEventListener('click', () => {
      if (quantity < 99) {
        quantity++;
        quantityInput.value = quantity;
      }
    });
  }
  if (quantityInput) {
    quantityInput.addEventListener('change', () => {
      let val = parseInt(quantityInput.value, 10);
      if (isNaN(val) || val < 1) val = 1;
      if (val > 99) val = 99;
      quantity = val;
      quantityInput.value = quantity;
    });
  }

  // Add to Cart Logic with Cart Drawer trigger
  function handleAddToCart(goToCheckout = false) {
    try {
      let cart = JSON.parse(localStorage.getItem('ameza_cart') || '[]');
      const variantKey = `${product.id}-${selectedColor}-${selectedSize}`;
      const existing = cart.find(item => item.id === variantKey || item.id === product.id);

      if (existing) {
        existing.quantity = (existing.quantity || 1) + quantity;
      } else {
        cart.push({
          id: String(product.id),
          name: product.name,
          price: Number(product.priceCents !== undefined ? product.priceCents : product.price) || 0,
          image: product.image,
          category: product.category || 'Apparel',
          variant: `${selectedColor} · ${selectedSize}`,
          quantity: quantity,
          sellerId: product.sellerId || product.seller_id || STORE_DATA.slug,
          sellerName: product.sellerName || product.seller_name || STORE_DATA.name
        });
      }
      localStorage.setItem('ameza_cart', JSON.stringify(cart));
      updateCartBadge();

      // Dispatch global sync event
      window.dispatchEvent(new CustomEvent('ameza:cart-updated', { detail: { cart } }));

      if (goToCheckout) {
        window.location.href = 'checkout.html';
      } else {
        // Feedback on button
        if (btnAddToCart) {
          const originalText = btnAddToCart.innerHTML;
          btnAddToCart.innerHTML = '<i class="fa-solid fa-check"></i> Added!';
          setTimeout(() => {
            btnAddToCart.innerHTML = originalText;
          }, 1500);
        }
        showToast(`Added ${quantity}x "${product.name}" to cart!`);

        // Slide out cart drawer
        if (typeof window.openCartDrawer === 'function') {
          window.openCartDrawer();
        }
      }
    } catch (e) {
      console.error('Cart add error', e);
    }
  }

  if (btnAddToCart) {
    btnAddToCart.addEventListener('click', () => handleAddToCart(false));
  }

  if (btnBuyNow) {
    btnBuyNow.addEventListener('click', () => handleAddToCart(true));
  }

  // Wishlist Handling
  function toggleWishlist() {
    try {
      let wishlist = JSON.parse(localStorage.getItem('ameza_wishlist') || '[]');
      const idx = wishlist.indexOf(product.id);
      let added = false;

      if (idx > -1) {
        wishlist.splice(idx, 1);
        syncWishlistUI(false);
      } else {
        wishlist.push(product.id);
        syncWishlistUI(true);
        added = true;
      }

      localStorage.setItem('ameza_wishlist', JSON.stringify(wishlist));
      updateWishlistBadge();
      showToast(added ? 'Saved to your wishlist' : 'Removed from your wishlist');
    } catch (e) {}
  }

  function syncWishlistUI(isSaved) {
    if (btnWishlistRow) {
      btnWishlistRow.classList.toggle('active', isSaved);
      const icon = btnWishlistRow.querySelector('i');
      if (icon) icon.className = isSaved ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
      const text = document.getElementById('wishlist-btn-text');
      if (text) text.textContent = isSaved ? 'Saved in Wishlist' : 'Add to Wishlist';
    }
    if (btnGalleryWishlist) {
      btnGalleryWishlist.classList.toggle('active', isSaved);
      const icon = btnGalleryWishlist.querySelector('i');
      if (icon) icon.className = isSaved ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
    }
  }

  if (btnWishlistRow) btnWishlistRow.addEventListener('click', toggleWishlist);
  if (btnGalleryWishlist) btnGalleryWishlist.addEventListener('click', toggleWishlist);

  // Check initial wishlist state
  const initialWishlist = JSON.parse(localStorage.getItem('ameza_wishlist') || '[]');
  syncWishlistUI(initialWishlist.includes(product.id));

  function updateCartBadge() {
    try {
      const cart = JSON.parse(localStorage.getItem('ameza_cart') || '[]');
      const total = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
      if (cartBadge) {
        cartBadge.textContent = total;
        cartBadge.style.display = total > 0 ? 'flex' : 'none';
      }
    } catch (e) {}
  }

  function updateWishlistBadge() {
    try {
      const wishlist = JSON.parse(localStorage.getItem('ameza_wishlist') || '[]');
      if (wishlistBadge) {
        wishlistBadge.textContent = wishlist.length;
        wishlistBadge.style.display = wishlist.length > 0 ? 'flex' : 'none';
      }
    } catch (e) {}
  }

  // Tabs Switching
  const tabNavBtns = document.querySelectorAll('.pdp-tab-nav-btn');
  const tabPanels = document.querySelectorAll('.pdp-tab-panel');

  tabNavBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabNavBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));
      btn.classList.add('active');
      const targetId = btn.dataset.tab;
      const targetPanel = document.getElementById(`tab-${targetId}`);
      if (targetPanel) targetPanel.classList.add('active');
    });
  });

  // =========================================================================
  // WRITE A REVIEW FORM HANDLING (User Explicit Requirement)
  // =========================================================================
  const reviewFormBox = document.getElementById('pdp-review-form-box');
  const btnToggleReviewForm = document.getElementById('btn-toggle-review-form');
  const btnQuickWriteReview = document.getElementById('btn-quick-write-review');
  const btnCancelReview = document.getElementById('btn-cancel-review');
  const reviewForm = document.getElementById('pdp-add-review-form');
  const starPicker = document.getElementById('star-picker');
  const starRatingInput = document.getElementById('review-input-rating');
  const starRatingText = document.getElementById('star-rating-text');
  const reviewsFeed = document.getElementById('pdp-reviews-feed');
  const reviewsHeading = document.getElementById('tab-reviews-heading');
  const reviewsCountBadge = document.getElementById('pdp-reviews-count-badge');
  const tabReviewsCount = document.getElementById('tab-reviews-count');

  let currentRating = 5;
  const ratingLabels = {
    1: '1.0 - Poor',
    2: '2.0 - Fair',
    3: '3.0 - Good',
    4: '4.0 - Very Good',
    5: '5.0 - Excellent'
  };

  function openReviewForm() {
    // Switch to Reviews tab
    const reviewsTabBtn = document.querySelector('[data-tab="reviews"]');
    if (reviewsTabBtn) reviewsTabBtn.click();

    if (reviewFormBox) {
      reviewFormBox.classList.add('show');
      const nameInput = document.getElementById('review-input-name');
      if (nameInput) nameInput.focus();
    }
  }

  if (btnToggleReviewForm) btnToggleReviewForm.addEventListener('click', openReviewForm);
  if (btnQuickWriteReview) btnQuickWriteReview.addEventListener('click', openReviewForm);

  if (btnCancelReview) {
    btnCancelReview.addEventListener('click', () => {
      if (reviewFormBox) reviewFormBox.classList.remove('show');
    });
  }

  // Interactive Star Rating Picker
  if (starPicker) {
    const starBtns = starPicker.querySelectorAll('.star-pick-btn');
    starBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const rating = parseInt(btn.dataset.rating, 10);
        currentRating = rating;
        if (starRatingInput) starRatingInput.value = rating;
        if (starRatingText) starRatingText.textContent = ratingLabels[rating] || `${rating}.0`;

        starBtns.forEach(b => {
          const r = parseInt(b.dataset.rating, 10);
          b.classList.toggle('active', r <= rating);
        });
      });
    });
  }

  // Handle Review Submission
  if (reviewForm) {
    reviewForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('review-input-name').value.trim();
      const email = document.getElementById('review-input-email').value.trim();
      const title = document.getElementById('review-input-title').value.trim();
      const body = document.getElementById('review-input-body').value.trim();

      if (!name || !title || !body) return;

      const starsHtml = Array.from({ length: 5 }, (_, i) => 
        i < currentRating 
          ? '<i class="fa-solid fa-star"></i>' 
          : '<i class="fa-regular fa-star" style="color:#CBD5E1;"></i>'
      ).join('');

      const newReviewCard = document.createElement('div');
      newReviewCard.className = 'pdp-review-card';
      newReviewCard.style.cssText = 'border-bottom: 1px solid var(--border-subtle); padding-bottom: 16px; animation: fadeInDown 0.3s ease;';
      newReviewCard.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 6px;">
          <strong>${escapeHtml(name)} <span style="font-size:11px; background:#EBF8EC; color:#166534; padding:2px 6px; border-radius:4px; font-weight:600; margin-left:6px;"><i class="fa-solid fa-circle-check"></i> Verified Buyer</span></strong>
          <div style="color:var(--star); font-size:12px;">${starsHtml}</div>
        </div>
        <h5 style="font-size:14px; font-weight:700; margin:0 0 4px; color:var(--text);">${escapeHtml(title)}</h5>
        <p style="font-size: 13.5px; color: var(--text-muted); margin:0 0 6px;">${escapeHtml(body)}</p>
        <span style="font-size: 12px; color: var(--text-light);">United States &middot; Just now</span>
      `;

      if (reviewsFeed) {
        reviewsFeed.prepend(newReviewCard);
      }

      // Update counters
      const updatedTotal = 79;
      if (reviewsHeading) reviewsHeading.textContent = `Customer Reviews (${updatedTotal})`;
      if (reviewsCountBadge) reviewsCountBadge.textContent = `(${updatedTotal} reviews)`;
      if (tabReviewsCount) tabReviewsCount.textContent = updatedTotal;

      // Reset & close form
      reviewForm.reset();
      if (reviewFormBox) reviewFormBox.classList.remove('show');
      showToast('Thank you! Your verified review has been published.');
    });
  }

  // =========================================================================
  // YOU MAY ALSO LIKE SLIDER / CAROUSEL (User Explicit Requirement)
  // =========================================================================
  const relatedGrid = document.getElementById('pdp-related-grid');
  const relatedSliderContainer = document.getElementById('pdp-related-slider');
  const btnSliderPrev = document.getElementById('slider-arrow-prev');
  const btnSliderNext = document.getElementById('slider-arrow-next');

  if (relatedGrid) {
    const relatedProducts = STORE_DATA.products.filter(p => p.id !== product.id);
    relatedGrid.innerHTML = relatedProducts.map(p => {
      const formattedPrice = (p.price / 100).toFixed(2);
      return `
        <div class="store-product-card" data-id="${p.id}">
          <div class="card-media-box">
            <span class="card-badge-pill badge-new">NEW</span>
            <a href="product.html?id=${p.id}" style="display:block; width:100%; height:100%;">
              <img src="${p.image}" alt="${p.name}" loading="lazy">
            </a>
          </div>
          <div class="card-info-body">
            <h3 class="card-product-title">
              <a href="product.html?id=${p.id}" style="color:inherit; text-decoration:none;">${p.name}</a>
            </h3>
            <div class="card-rating-line">
              <i class="fa-solid fa-star" style="color: #111827; font-size: 12px;"></i>
              <span class="card-rating-num">${p.rating}</span>
              <span class="card-rating-reviews">(${p.reviews})</span>
            </div>
            <div class="card-price-row">
              <span class="card-price-current">$${formattedPrice}</span>
              <span class="card-discount-tag">-20%</span>
            </div>
            <button class="btn-card-add-cart" data-rel-cart="${p.id}">
              <i class="fa-solid fa-cart-shopping"></i> Add to cart
            </button>
          </div>
        </div>
      `;
    }).join('');

    // Wire up slider arrow scrolling
    if (btnSliderPrev && relatedSliderContainer) {
      btnSliderPrev.addEventListener('click', () => {
        relatedSliderContainer.scrollBy({ left: -270, behavior: 'smooth' });
      });
    }
    if (btnSliderNext && relatedSliderContainer) {
      btnSliderNext.addEventListener('click', () => {
        relatedSliderContainer.scrollBy({ left: 270, behavior: 'smooth' });
      });
    }

    // Related cards add to cart
    relatedGrid.addEventListener('click', (e) => {
      const btn = e.target.closest('[data-rel-cart]');
      if (btn) {
        const id = btn.dataset.relCart;
        const relProd = STORE_DATA.products.find(p => p.id === id);
        if (relProd) {
          let cart = JSON.parse(localStorage.getItem('ameza_cart') || '[]');
          const exist = cart.find(i => i.id === relProd.id);
          if (exist) exist.quantity = (exist.quantity || 1) + 1;
          else {
            cart.push({
              id: relProd.id,
              name: relProd.name,
              price: relProd.price,
              image: relProd.image,
              category: relProd.category,
              variant: 'Standard Commuter',
              quantity: 1,
              sellerId: STORE_DATA.slug,
              sellerName: STORE_DATA.name
            });
          }
          localStorage.setItem('ameza_cart', JSON.stringify(cart));
          updateCartBadge();
          window.dispatchEvent(new CustomEvent('ameza:cart-updated', { detail: { cart } }));
          showToast(`Added "${relProd.name}" to cart`);
          if (typeof window.openCartDrawer === 'function') {
            window.openCartDrawer();
          }
        }
      }
    });
  }

  // Initial State
  updateCartBadge();
  updateWishlistBadge();
}

function showToast(msg) {
  let toast = document.getElementById('store-global-toast');
  if (!toast) {
    toast = document.createElement('div');
    toast.id = 'store-global-toast';
    toast.className = 'store-toast';
    document.body.appendChild(toast);
  }
  toast.innerHTML = `<i class="fa-solid fa-check" style="color:var(--primary);"></i> ${msg}`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

function escapeHtml(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
