/**
 * AMEZA Account UI Helper — js/account-ui.js
 * Shared utilities for all account pages.
 * Requires auth.js to be loaded first.
 */

'use strict';

const AccountUI = {

  // ─── Toast Notifications ──────────────────────────────────────
  toast(message, type = 'success') {
    const container = document.getElementById('account-toast-container');
    if (!container) return;
    const el = document.createElement('div');
    el.className = `account-toast toast-${type}`;
    const icon = type === 'success'
      ? '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>'
      : '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line></svg>';
    el.innerHTML = icon + message;
    container.appendChild(el);
    setTimeout(() => {
      el.style.opacity = '0';
      el.style.transform = 'translateX(80px)';
      el.style.transition = 'all 0.3s ease';
      setTimeout(() => el.remove(), 300);
    }, 3500);
  },

  // ─── Confirmation Modal ───────────────────────────────────────
  confirm({ title, description, confirmText = 'Confirm', cancelText = 'Cancel', dangerous = false }) {
    return new Promise(resolve => {
      const overlay = document.createElement('div');
      overlay.className = 'account-modal-overlay';
      overlay.innerHTML = `
        <div class="account-modal-box" role="dialog" aria-modal="true" aria-labelledby="modal-title">
          <div class="account-modal-title" id="modal-title">${title}</div>
          <div class="account-modal-desc">${description}</div>
          <div class="account-modal-actions">
            <button class="btn-modal-cancel" id="modal-cancel">${cancelText}</button>
            <button class="${dangerous ? 'btn-modal-confirm-danger' : 'btn-section-action'}" id="modal-confirm">${confirmText}</button>
          </div>
        </div>
      `;
      document.body.appendChild(overlay);
      setTimeout(() => overlay.classList.add('active'), 10);

      overlay.querySelector('#modal-cancel').addEventListener('click', () => {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
        resolve(false);
      });
      overlay.querySelector('#modal-confirm').addEventListener('click', () => {
        overlay.classList.remove('active');
        setTimeout(() => overlay.remove(), 300);
        resolve(true);
      });
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          overlay.classList.remove('active');
          setTimeout(() => overlay.remove(), 300);
          resolve(false);
        }
      });
    });
  },

  // ─── Page Protection ──────────────────────────────────────────
  requireAuth() {
    if (!window.AmezaAuth || !window.AmezaAuth.isLoggedIn()) {
      const url = encodeURIComponent(window.location.href);
      window.location.href = `login.html?redirect=${url}`;
      return null;
    }
    return window.AmezaAuth.getCurrentUser();
  },

  // ─── Sidebar Active State ─────────────────────────────────────
  setActiveSidebarItem(page) {
    document.querySelectorAll('.account-nav-item').forEach(item => {
      item.classList.remove('active');
    });
    const active = document.querySelector(`[data-nav="${page}"]`);
    if (active) active.classList.add('active');
  },

  // ─── Mobile Sidebar Toggle ────────────────────────────────────
  initMobileSidebar() {
    const toggle = document.getElementById('account-mobile-nav-toggle');
    const sidebar = document.getElementById('account-sidebar');
    if (!toggle || !sidebar) return;

    toggle.addEventListener('click', () => {
      const open = sidebar.classList.toggle('mobile-open');
      toggle.innerHTML = open
        ? `<span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> My Account</span>
           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="18 15 12 9 6 15"></polyline></svg>`
        : `<span><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg> My Account</span>
           <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"></polyline></svg>`;
    });
  },

  // ─── Populate Sidebar User Info ───────────────────────────────
  populateSidebarUser(user) {
    const nameEl = document.getElementById('sidebar-user-name');
    const emailEl = document.getElementById('sidebar-user-email');
    const avatarEl = document.getElementById('sidebar-avatar');
    if (nameEl) nameEl.textContent = `${user.firstName} ${user.lastName}`;
    if (emailEl) emailEl.textContent = user.email;
    if (avatarEl) avatarEl.textContent = user.firstName.charAt(0).toUpperCase();
  },

  // ─── Order Status Badge ───────────────────────────────────────
  statusBadge(status) {
    const s = (status || 'pending').toLowerCase();
    const map = { delivered: 'status-delivered', processing: 'status-processing', shipped: 'status-shipped', cancelled: 'status-cancelled', pending: 'status-pending' };
    const cls = map[s] || 'status-pending';
    return `<span class="order-status-badge ${cls}">${status || 'Pending'}</span>`;
  },

  // ─── Format Date ──────────────────────────────────────────────
  formatDate(ts) {
    if (!ts) return '—';
    const d = new Date(ts);
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  },

  // ─── Format Price ─────────────────────────────────────────────
  formatPrice(amount) {
    if (window.AmezaCurrency && typeof window.AmezaCurrency.format === 'function') {
      return window.AmezaCurrency.format(amount);
    }
    return '$' + (Number(amount) || 0).toFixed(2);
  },

  // ─── Password strength bar update ────────────────────────────
  updateStrengthBar(password, barId, labelId, reqMap) {
    const result = window.AmezaAuth.checkPasswordStrength(password);
    const bar = document.getElementById(barId);
    const label = document.getElementById(labelId);
    if (bar) { bar.style.width = (result.score / 5 * 100) + '%'; bar.style.backgroundColor = result.color; }
    if (label) { label.textContent = result.label; label.style.color = result.color; }
    if (reqMap) {
      const checks = result.checks;
      Object.entries(reqMap).forEach(([reqId, checkKey]) => {
        const el = document.getElementById(reqId);
        if (el) el.classList.toggle('met', checks[checkKey]);
      });
    }
    return result;
  },

  // ─── Copy to clipboard ───────────────────────────────────────
  async copyToClipboard(text, successMsg = 'Copied!') {
    try {
      await navigator.clipboard.writeText(text);
      this.toast(successMsg, 'success');
    } catch {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.cssText = 'position:fixed;opacity:0;';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      ta.remove();
      this.toast(successMsg, 'success');
    }
  },

  // ─── Address form HTML ────────────────────────────────────────
  addressFormHTML(address = {}) {
    return `
      <div class="account-form-row">
        <div class="account-form-group">
          <label>First Name <span style="color:var(--badge-sale)">*</span></label>
          <input type="text" class="account-input" id="addr-firstname" value="${address.firstName || ''}" placeholder="John" required>
        </div>
        <div class="account-form-group">
          <label>Last Name <span style="color:var(--badge-sale)">*</span></label>
          <input type="text" class="account-input" id="addr-lastname" value="${address.lastName || ''}" placeholder="Doe" required>
        </div>
      </div>
      <div class="account-form-group">
        <label>Company <span style="font-size:0.78rem; color:var(--text-muted);">(optional)</span></label>
        <input type="text" class="account-input" id="addr-company" value="${address.company || ''}" placeholder="Company name">
      </div>
      <div class="account-form-group">
        <label>Address Line 1 <span style="color:var(--badge-sale)">*</span></label>
        <input type="text" class="account-input" id="addr-line1" value="${address.line1 || ''}" placeholder="123 Main Street" required>
      </div>
      <div class="account-form-group">
        <label>Address Line 2 <span style="font-size:0.78rem; color:var(--text-muted);">(optional)</span></label>
        <input type="text" class="account-input" id="addr-line2" value="${address.line2 || ''}" placeholder="Apt, Suite, Unit, etc.">
      </div>
      <div class="account-form-row">
        <div class="account-form-group">
          <label>City <span style="color:var(--badge-sale)">*</span></label>
          <input type="text" class="account-input" id="addr-city" value="${address.city || ''}" placeholder="New York" required>
        </div>
        <div class="account-form-group">
          <label>State / Province</label>
          <input type="text" class="account-input" id="addr-state" value="${address.state || ''}" placeholder="NY">
        </div>
      </div>
      <div class="account-form-row">
        <div class="account-form-group">
          <label>Postal / ZIP Code <span style="color:var(--badge-sale)">*</span></label>
          <input type="text" class="account-input" id="addr-zip" value="${address.zip || ''}" placeholder="10001" required>
        </div>
        <div class="account-form-group">
          <label>Country <span style="color:var(--badge-sale)">*</span></label>
          <input type="text" class="account-input" id="addr-country" value="${address.country || 'United States'}" placeholder="United States" required>
        </div>
      </div>
      <div class="account-form-group">
        <label>Phone <span style="font-size:0.78rem; color:var(--text-muted);">(optional)</span></label>
        <input type="tel" class="account-input" id="addr-phone" value="${address.phone || ''}" placeholder="+1 (555) 000-0000">
      </div>
    `;
  },

  // ─── Read address form values ─────────────────────────────────
  readAddressForm() {
    return {
      firstName: document.getElementById('addr-firstname')?.value.trim() || '',
      lastName: document.getElementById('addr-lastname')?.value.trim() || '',
      company: document.getElementById('addr-company')?.value.trim() || '',
      line1: document.getElementById('addr-line1')?.value.trim() || '',
      line2: document.getElementById('addr-line2')?.value.trim() || '',
      city: document.getElementById('addr-city')?.value.trim() || '',
      state: document.getElementById('addr-state')?.value.trim() || '',
      zip: document.getElementById('addr-zip')?.value.trim() || '',
      country: document.getElementById('addr-country')?.value.trim() || '',
      phone: document.getElementById('addr-phone')?.value.trim() || '',
    };
  },

  // ─── Shared sidebar HTML ──────────────────────────────────────
  sidebarHTML(user, activePage) {
    const pages = [
      { key: 'overview', label: 'Account Overview', href: 'account.html', icon: '<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline>' },
      { key: 'orders', label: 'My Orders', href: 'account-orders.html', icon: '<path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path><line x1="3" y1="6" x2="21" y2="6"></line><path d="M16 10a4 4 0 0 1-8 0"></path>' },
      { key: 'profile', label: 'Personal Info', href: 'account-profile.html', icon: '<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle>' },
      { key: 'addresses', label: 'Addresses', href: 'account-addresses.html', icon: '<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle>' },
      { key: 'wishlist', label: 'Wishlist', href: 'account-wishlist.html', icon: '<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>' },
      { key: 'security', label: 'Security', href: 'account-security.html', icon: '<rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path>' },
    ];

    return `
      <div class="account-sidebar-header">
        <div style="display: flex; align-items: center; gap: 12px;">
          <div class="account-avatar" id="sidebar-avatar">${user.firstName.charAt(0).toUpperCase()}</div>
          <div>
            <div class="account-sidebar-name" id="sidebar-user-name">${user.firstName} ${user.lastName}</div>
            <div class="account-sidebar-email" id="sidebar-user-email">${user.email}</div>
            <div class="account-sidebar-badge">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Premium Member
            </div>
          </div>
        </div>
      </div>
      <nav class="account-nav" aria-label="Account navigation">
        ${pages.map(p => `
          <a href="${p.href}" class="account-nav-item ${activePage === p.key ? 'active' : ''}" data-nav="${p.key}" aria-current="${activePage === p.key ? 'page' : 'false'}">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">${p.icon}</svg>
            ${p.label}
          </a>
        `).join('')}
        <button class="account-nav-item nav-logout" id="sidebar-logout-btn" aria-label="Sign out">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          Sign Out
        </button>
      </nav>
    `;
  },

  // ─── Shared header HTML for account pages ─────────────────────
  headerHTML(user) {
    return `
  <div class="top-bar">
    <div class="container top-bar-inner">
      <div class="top-bar-left">
        <span class="top-bar-badge"><i class="fa-solid fa-tag"></i> Special Offer</span>
        <span>Free Worldwide Express Shipping on all orders over $100 &bull; 30-Day Easy Returns</span>
      </div>
      <div class="top-bar-right">
        <a href="account-orders.html" class="top-bar-link"><i class="fa-solid fa-clipboard-list"></i> Track Order</a>
        <span style="opacity:0.4;">|</span>
        <span class="top-bar-link"><i class="fa-solid fa-globe"></i> USD ($)</span>
      </div>
    </div>
  </div>`;
  },

};

window.AccountUI = AccountUI;
