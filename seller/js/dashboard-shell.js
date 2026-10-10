/**
 * AMEZA Dashboard Shell Engine — js/dashboard-shell.js
 * Universal layout wrapper for /seller and /admin dashboards.
 * Features:
 * - Collapsible desktop sidebar + responsive mobile drawer & bottom bar
 * - Dark navy (#111827) styling for Admin with green active indicator
 * - Top bar with title, breadcrumbs, global search, and date-range popover with "Compare"
 * - Live accent color picker that updates --primary immediately
 * - Light/Dark mode switcher with persistent data-theme
 * - Prototype Identity Switcher (Customer / Seller / Admin / Staff)
 * - Notification bell with unread list
 * - Customize Dashboard trigger button
 */

import { escapeHTML, showToast } from '/shared/js/core/utils.js';

export const IDENTITIES = {
  customer: {
    id: 'cust_sarah_jenkins',
    name: 'Sarah Jenkins',
    role: 'Customer',
    email: 'sarah.jenkins@example.com.au',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80',
    initials: 'SJ'
  },
  seller: {
    id: 'seller_melb_123',
    name: 'Jack Callahan',
    storeName: 'Austin Leather Co',
    role: 'Seller',
    email: 'jack@melbourneleather.com.au',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&q=80',
    initials: 'JC'
  },
  admin: {
    id: 'admin_alexander_vance',
    name: 'Alexander Vance',
    role: 'Super Admin',
    email: 'admin@ameza.store',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=120&q=80',
    initials: 'AV'
  },
  staff: {
    id: 'staff_marcus_reed',
    name: 'Marcus Reed',
    role: 'Catalog Staff',
    email: 'marcus.catalog@ameza.store',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80',
    initials: 'MR'
  }
};

export const COLOR_SWATCHES = [
  { name: 'AMEZA Green', primary: '#7FB73C', dark: '#6CA030', light: '#F3F8EE' },
  { name: 'Pacific Blue', primary: '#0284C7', dark: '#0369A1', light: '#E0F2FE' },
  { name: 'Royal Purple', primary: '#8B5CF6', dark: '#7C3AED', light: '#F3E8FF' },
  { name: 'Amber Gold', primary: '#D97706', dark: '#B45309', light: '#FEF3C7' },
  { name: 'Crimson Rose', primary: '#E11D48', dark: '#BE123C', light: '#FFE4E6' },
  { name: 'Deep Emerald', primary: '#059669', dark: '#047857', light: '#D1FAE5' }
];

export const DashboardShell = {
  currentRole: 'seller',
  sidebarCollapsed: false,

  /**
   * Initializes the shell layout on a target container or wraps existing main content.
   */
  init(options = {}) {
    this.currentRole = options.role || (window.location.pathname.includes('admin') ? 'admin' : 'seller');
    this.title = options.title || (this.currentRole === 'admin' ? 'Admin Portal' : 'Seller Hub');
    this.activeNav = options.activeNav || 'dashboard';
    this.breadcrumbs = options.breadcrumbs || [
      { label: this.currentRole === 'admin' ? 'Admin' : 'Seller', href: '#' },
      { label: this.title, href: '#', active: true }
    ];

    this.applySavedTheme();
    this.applySavedAccent();
    this.renderShell(options);
    this.bindEvents();
  },

  applySavedTheme() {
    const saved = localStorage.getItem('ameza_theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
  },

  applySavedAccent() {
    const saved = localStorage.getItem('ameza_accent_color');
    if (saved) {
      this.setAccentColor(saved, false);
    }
  },

  setAccentColor(hex, save = true) {
    document.documentElement.style.setProperty('--primary', hex);
    // Approximate darker hover shade
    const swatch = COLOR_SWATCHES.find(s => s.primary.toLowerCase() === hex.toLowerCase());
    const darkHex = swatch ? swatch.dark : hex;
    document.documentElement.style.setProperty('--primary-dark', darkHex);
    if (save) {
      localStorage.setItem('ameza_accent_color', hex);
      showToast(`Accent color updated to ${swatch ? swatch.name : hex}`, 'info');
    }
  },

  renderShell(options) {
    const isAdmin = this.currentRole === 'admin';
    const activeIdentity = IDENTITIES[this.currentRole] || IDENTITIES.seller;

    // Navigation item definitions
    const sellerNav = [
      { id: 'dashboard', label: 'Dashboard', icon: 'fa-chart-pie', href: 'seller/index.html' },
      { id: 'products', label: 'Products & Stock', icon: 'fa-box-archive', href: 'seller-products.html' },
      { id: 'orders', label: 'Orders & Shipments', icon: 'fa-dolly', href: 'seller-orders.html', badge: '6' },
      { id: 'payouts', label: 'Payouts & Ledger', icon: 'fa-wallet', href: 'seller-payouts.html' },
      { id: 'reviews', label: 'Reviews & Feedback', icon: 'fa-star', href: '#' },
      { id: 'storefront', label: 'View Public Store', icon: 'fa-arrow-up-right-from-square', href: 'store.html?vendor=austin-leather-co' }
    ];

    const adminNav = [
      { id: 'dashboard', label: 'Overview', icon: 'fa-gauge-high', href: '#' },
      { id: 'moderation', label: 'Product Moderation', icon: 'fa-shield-halved', href: 'admin-moderation.html', badge: '3' },
      { id: 'merchants', label: 'Merchants & KYC', icon: 'fa-users-gear', href: '#' },
      { id: 'finance', label: 'Finance & Split Ledger', icon: 'fa-scale-balanced', href: 'admin-finance.html' },
      { id: 'cms', label: 'CMS & Promotions', icon: 'fa-sliders', href: 'admin-cms.html' },
      { id: 'settings', label: 'Platform Settings', icon: 'fa-gear', href: 'admin-settings.html' }
    ];

    const navItems = isAdmin ? adminNav : sellerNav;

    // Check if shell already exists
    let shellWrap = document.getElementById('ameza-shell-wrapper');
    if (!shellWrap) {
      shellWrap = document.createElement('div');
      shellWrap.id = 'ameza-shell-wrapper';
      shellWrap.className = `ameza-shell ${isAdmin ? 'shell-admin' : 'shell-seller'}`;

      // Wrap existing body content
      const existingContent = document.getElementById('shell-content-root') || document.querySelector('main') || document.body;
      const contentHtml = existingContent !== document.body ? existingContent.outerHTML : '';

      shellWrap.innerHTML = `
        <!-- SIDEBAR -->
        <aside class="shell-sidebar ${isAdmin ? 'sidebar-dark-admin' : ''}" id="shell-sidebar">
          <div class="sidebar-header">
            <a href="prototype-index.html" class="sidebar-brand">
              <span class="brand-logo-circle">A</span>
              <div class="brand-text">
                <span class="brand-title">AMEZA</span>
                <span class="brand-subtitle">${isAdmin ? 'Admin Portal' : 'Seller Hub'}</span>
              </div>
            </a>
            <button class="sidebar-collapse-btn" id="sidebar-collapse-toggle" title="Toggle Sidebar">
              <i class="fa-solid fa-angles-left"></i>
            </button>
          </div>

          <nav class="sidebar-menu">
            ${navItems.map(item => `
              <a href="${item.href}" class="sidebar-link ${this.activeNav === item.id ? 'active' : ''}" data-nav="${item.id}">
                <i class="fa-solid ${item.icon} link-icon"></i>
                <span class="link-label">${escapeHTML(item.label)}</span>
                ${item.badge ? `<span class="badge badge-primary sidebar-badge">${item.badge}</span>` : ''}
              </a>
            `).join('')}
          </nav>

          <div class="sidebar-footer">
            <div class="identity-badge-card" id="identity-switcher-trigger">
              <div class="avatar avatar-sm">${activeIdentity.initials}</div>
              <div class="identity-info">
                <span class="identity-name">${escapeHTML(activeIdentity.name)}</span>
                <span class="identity-role">${escapeHTML(activeIdentity.role)}</span>
              </div>
              <i class="fa-solid fa-chevron-up toggle-caret"></i>
            </div>
          </div>
        </aside>

        <!-- MAIN LAYOUT WRAPPER -->
        <div class="shell-main-wrap">
          <!-- TOP BAR -->
          <header class="shell-topbar" id="shell-topbar">
            <div class="topbar-left">
              <button class="btn btn-ghost btn-icon mobile-menu-toggle" id="mobile-sidebar-toggle" aria-label="Open navigation menu">
                <i class="fa-solid fa-bars"></i>
              </button>
              <div class="topbar-title-wrap">
                <nav class="breadcrumb">
                  ${this.breadcrumbs.map(b => `
                    <span class="breadcrumb-item ${b.active ? 'active' : ''}">
                      ${b.active ? escapeHTML(b.label) : `<a href="${b.href}">${escapeHTML(b.label)}</a>`}
                    </span>
                    ${!b.active ? '<span class="breadcrumb-separator"><i class="fa-solid fa-chevron-right"></i></span>' : ''}
                  `).join('')}
                </nav>
                <h1 class="topbar-page-title">${escapeHTML(this.title)}</h1>
              </div>
            </div>

            <!-- Global Search Bar -->
            <div class="topbar-center">
              <div class="input-group topbar-search-group">
                <i class="fa-solid fa-magnifying-glass input-icon-left"></i>
                <input type="text" class="form-control has-icon-left" id="global-search-input" placeholder="Search orders, products, customers... (Cmd+K)" />
                <kbd class="search-kbd-hint">⌘K</kbd>
              </div>
            </div>

            <!-- Action Controls -->
            <div class="topbar-right">
              <!-- Date Range Popover Button -->
              <div class="dropdown" id="date-range-dropdown">
                <button class="btn btn-secondary btn-sm date-picker-trigger" id="date-picker-btn">
                  <i class="fa-regular fa-calendar"></i>
                  <span id="date-range-label">Last 30 Days</span>
                  <i class="fa-solid fa-chevron-down" style="font-size:10px;"></i>
                </button>
                <div class="dropdown-menu date-range-menu p-3" style="width:300px;">
                  <div class="date-presets mb-3">
                    <button class="btn btn-ghost btn-xs date-preset-btn active" data-preset="30d">Last 30 Days</button>
                    <button class="btn btn-ghost btn-xs date-preset-btn" data-preset="7d">Last 7 Days</button>
                    <button class="btn btn-ghost btn-xs date-preset-btn" data-preset="today">Today</button>
                    <button class="btn btn-ghost btn-xs date-preset-btn" data-preset="quarter">This Quarter</button>
                  </div>
                  <div class="form-group mb-2">
                    <label class="checkbox-label">
                      <input type="checkbox" class="custom-checkbox" id="compare-period-chk" checked />
                      <span>Compare to previous period</span>
                    </label>
                  </div>
                  <button class="btn btn-primary btn-xs w-100" id="apply-date-range">Apply Range</button>
                </div>
              </div>

              <!-- Customize Dashboard Button -->
              <button class="btn btn-secondary btn-sm" id="customize-dashboard-btn" title="Edit and reorder widgets">
                <i class="fa-solid fa-table-cells-large"></i>
                <span>Customize</span>
              </button>

              <!-- Live Accent Color Swatches Popover -->
              <div class="dropdown" id="accent-color-dropdown">
                <button class="btn btn-ghost btn-icon btn-sm" title="Change Theme Accent Color">
                  <i class="fa-solid fa-palette" style="color:var(--primary);"></i>
                </button>
                <div class="dropdown-menu p-3" style="min-width:210px;">
                  <div class="text-xs font-semibold text-muted mb-2">PRIMARY ACCENT COLOR</div>
                  <div class="swatches-grid" style="display:grid; grid-template-columns:repeat(3, 1fr); gap:8px;">
                    ${COLOR_SWATCHES.map(s => `
                      <button class="color-swatch-btn" data-color="${s.primary}" title="${s.name}" style="background-color:${s.primary}; height:28px; border-radius:6px; border:2px solid transparent; cursor:pointer;"></button>
                    `).join('')}
                  </div>
                </div>
              </div>

              <!-- Theme Toggle -->
              <button class="btn btn-ghost btn-icon btn-sm" id="theme-toggle-btn" title="Toggle Light / Dark Mode">
                <i class="fa-regular fa-moon" id="theme-icon"></i>
              </button>

              <!-- Notifications Bell -->
              <div class="dropdown" id="notif-dropdown">
                <button class="btn btn-ghost btn-icon btn-sm notif-btn" id="notif-bell-btn">
                  <i class="fa-regular fa-bell"></i>
                  <span class="notif-unread-dot"></span>
                </button>
                <div class="dropdown-menu notif-menu">
                  <div class="notif-menu-header">
                    <span class="font-bold text-sm">Notifications</span>
                    <button class="btn-ghost text-xs text-muted" id="mark-notifs-read">Mark all as read</button>
                  </div>
                  <div class="notif-list" id="notif-list-container">
                    <div class="notif-item unread">
                      <div class="notif-item-icon text-primary"><i class="fa-solid fa-cart-shopping"></i></div>
                      <div class="notif-item-text">
                        <div class="font-semibold text-xs">New Order #ORD-AU-10065</div>
                        <div class="text-muted text-xs">$245.00 via Card &bull; 12m ago</div>
                      </div>
                    </div>
                    <div class="notif-item unread">
                      <div class="notif-item-icon text-warning"><i class="fa-solid fa-triangle-exclamation"></i></div>
                      <div class="notif-item-text">
                        <div class="font-semibold text-xs">Low Stock Warning</div>
                        <div class="text-muted text-xs">Slim Wallet has 3 units left</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Persona Identity Switcher -->
              <div class="dropdown" id="persona-dropdown">
                <button class="btn btn-ghost p-1 d-flex align-items-center gap-2" id="persona-btn">
                  <div class="avatar avatar-sm avatar-badge">${activeIdentity.initials}<span class="avatar-badge-dot"></span></div>
                </button>
                <div class="dropdown-menu persona-menu" style="min-width:240px; right:0;">
                  <div class="p-2 border-bottom">
                    <div class="text-xs text-muted font-bold">SWITCH PROTOTYPE ROLE</div>
                  </div>
                  <button class="dropdown-item switch-role-btn" data-role="seller">
                    <div class="avatar avatar-xs">JC</div>
                    <div>
                      <div class="font-semibold text-xs">Jack Callahan</div>
                      <div class="text-muted text-xs">Seller (Austin Leather Co)</div>
                    </div>
                  </button>
                  <button class="dropdown-item switch-role-btn" data-role="admin">
                    <div class="avatar avatar-xs" style="background:#111827;">AV</div>
                    <div>
                      <div class="font-semibold text-xs">Alexander Vance</div>
                      <div class="text-muted text-xs">Super Admin (AMEZA)</div>
                    </div>
                  </button>
                  <button class="dropdown-item switch-role-btn" data-role="staff">
                    <div class="avatar avatar-xs" style="background:#4B5563;">MR</div>
                    <div>
                      <div class="font-semibold text-xs">Marcus Reed</div>
                      <div class="text-muted text-xs">Staff (Moderation)</div>
                    </div>
                  </button>
                  <button class="dropdown-item switch-role-btn" data-role="customer">
                    <div class="avatar avatar-xs" style="background:#E11D48;">SJ</div>
                    <div>
                      <div class="font-semibold text-xs">Sarah Jenkins</div>
                      <div class="text-muted text-xs">Customer (Shopper)</div>
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </header>

          <!-- MAIN INJECTED BODY -->
          <main class="shell-body" id="shell-body">
            ${contentHtml}
          </main>
        </div>

        <!-- MOBILE BOTTOM NAVIGATION -->
        <nav class="mobile-bottom-nav">
          <a href="/seller/index.html" class="mob-nav-link ${this.activeNav === 'dashboard' ? 'active' : ''}">
            <i class="fa-solid fa-chart-pie"></i>
            <span>Dashboard</span>
          </a>
          <a href="seller-products.html" class="mob-nav-link ${this.activeNav === 'products' ? 'active' : ''}">
            <i class="fa-solid fa-box-archive"></i>
            <span>Products</span>
          </a>
          <a href="seller-orders.html" class="mob-nav-link ${this.activeNav === 'orders' ? 'active' : ''}">
            <i class="fa-solid fa-dolly"></i>
            <span>Orders</span>
          </a>
          <a href="seller-payouts.html" class="mob-nav-link ${this.activeNav === 'payouts' ? 'active' : ''}">
            <i class="fa-solid fa-wallet"></i>
            <span>Payouts</span>
          </a>
          <button class="mob-nav-link" id="mobile-more-btn">
            <i class="fa-solid fa-ellipsis"></i>
            <span>More</span>
          </button>
        </nav>
      `;

      if (existingContent !== document.body) {
        existingContent.replaceWith(shellWrap);
      } else {
        document.body.prepend(shellWrap);
      }
    }
  },

  bindEvents() {
    // 1. Sidebar desktop collapse toggle
    const collapseBtn = document.getElementById('sidebar-collapse-toggle');
    const sidebar = document.getElementById('shell-sidebar');
    if (collapseBtn && sidebar) {
      collapseBtn.addEventListener('click', () => {
        this.sidebarCollapsed = !this.sidebarCollapsed;
        sidebar.classList.toggle('collapsed', this.sidebarCollapsed);
      });
    }

    // 2. Mobile sidebar drawer toggle
    const mobToggle = document.getElementById('mobile-sidebar-toggle');
    const mobMore = document.getElementById('mobile-more-btn');
    if (mobToggle && sidebar) {
      mobToggle.addEventListener('click', () => sidebar.classList.toggle('mobile-open'));
    }
    if (mobMore && sidebar) {
      mobMore.addEventListener('click', () => sidebar.classList.toggle('mobile-open'));
    }

    // 3. Theme toggle
    const themeBtn = document.getElementById('theme-toggle-btn');
    const themeIcon = document.getElementById('theme-icon');
    const updateThemeIcon = (theme) => {
      if (themeIcon) {
        themeIcon.className = theme === 'dark' ? 'fa-regular fa-sun' : 'fa-regular fa-moon';
      }
    };
    const currentTheme = document.documentElement.getAttribute('data-theme') || 'light';
    updateThemeIcon(currentTheme);

    if (themeBtn) {
      themeBtn.addEventListener('click', () => {
        const next = document.documentElement.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', next);
        localStorage.setItem('ameza_theme', next);
        updateThemeIcon(next);
        showToast(`Switched to ${next} theme`, 'info');
      });
    }

    // 4. Accent Color Swatches
    document.querySelectorAll('.color-swatch-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const color = e.currentTarget.getAttribute('data-color');
        if (color) this.setAccentColor(color);
      });
    });

    // 5. Persona Switcher
    document.querySelectorAll('.switch-role-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const targetRole = e.currentTarget.getAttribute('data-role');
        if (targetRole) {
          localStorage.setItem('ameza_active_role', targetRole);
          showToast(`Switched active identity to ${IDENTITIES[targetRole]?.name || targetRole}`, 'success');
          setTimeout(() => {
            if (targetRole === 'admin') window.location.href = 'admin-moderation.html';
            else if (targetRole === 'seller') window.location.href = 'seller/index.html';
            else if (targetRole === 'customer') window.location.href = 'account.html';
            else window.location.reload();
          }, 350);
        }
      });
    });

    // 6. Customize Dashboard Button
    const custBtn = document.getElementById('customize-dashboard-btn');
    if (custBtn) {
      custBtn.addEventListener('click', () => {
        window.dispatchEvent(new CustomEvent('ameza:toggle-customize'));
      });
    }

    // 7. Global Search Shortcut (Cmd/Ctrl + K)
    const searchInput = document.getElementById('global-search-input');
    window.addEventListener('keydown', (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchInput?.focus();
        searchInput?.select();
      }
    });

    // 8. Simple dropdown outside click close
    document.addEventListener('click', (e) => {
      document.querySelectorAll('.dropdown').forEach(dd => {
        if (!dd.contains(e.target)) {
          dd.querySelector('.dropdown-menu')?.classList.remove('show');
        }
      });
    });

    // Dropdown toggles
    document.querySelectorAll('.dropdown > button').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const menu = btn.parentElement.querySelector('.dropdown-menu');
        if (menu) menu.classList.toggle('show');
      });
    });
  }
};

// Global Exposure
if (typeof window !== 'undefined') {
  window.DashboardShell = DashboardShell;
}
