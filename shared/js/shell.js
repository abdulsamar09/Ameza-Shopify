/**
 * AMEZA Seller Dashboard - Reusable Application Shell
 * Renders Top Bar, Sidebar Navigation, Command Palette, Notification & User Menus, and Toast
 */

import { Icons } from './icons.js';
import { NAV_ITEMS, NOTIFICATIONS } from './data.js';

import { escapeHTML } from './core/utils.js';
export { escapeHTML };

let notificationList = [...NOTIFICATIONS];

export function initShell(activePageId = 'home') {
  // 1. Render Top Bar
  const topbarEl = document.getElementById('app-topbar');
  if (topbarEl) {
    topbarEl.className = 'top-bar';
    topbarEl.innerHTML = `
      <div class="top-bar-left">
        <button class="mobile-hamburger-btn" id="btn-hamburger" aria-label="Toggle navigation drawer">
          ${Icons.menu}
        </button>
        <a href="/seller/index.html" class="brand-link" title="AMEZA Seller Central">
          ${Icons.logoMark}
          <span class="brand-title">AMEZA</span>
        </a>
      </div>

      <div class="top-bar-center">
        <div class="search-input-wrap" id="btn-open-palette" role="button" tabindex="0" aria-label="Search pages (Ctrl K)">
          <span class="search-icon">${Icons.search}</span>
          <span class="search-placeholder">Search</span>
          <kbd class="search-kbd">Ctrl K</kbd>
        </div>
      </div>

      <div class="top-bar-right">
        <!-- Notification Bell Trigger -->
        <button class="top-action-btn" id="btn-notif-toggle" title="Notifications" aria-label="Notifications" aria-haspopup="true">
          ${Icons.bell}
          <span class="notif-badge" id="notif-count-badge">${notificationList.filter(n => n.unread).length}</span>
        </button>

        <!-- Notification Popover -->
        <div class="dropdown-menu-popover" id="notif-popover" style="width: 320px;">
          <div class="dropdown-header-row">
            <span>Notifications</span>
            <button type="button" id="btn-mark-all-read" style="background:none; border:none; color:var(--primary-green-dark); font-size:11px; font-weight:700; cursor:pointer;">
              Mark all as read
            </button>
          </div>
          <div id="notif-list-container" style="max-height: 280px; overflow-y: auto;">
            ${renderNotificationItems()}
          </div>
        </div>

        <!-- User Profile Trigger -->
        <button class="user-profile-btn" id="btn-user-toggle" aria-label="User profile menu" aria-haspopup="true">
          <div class="user-avatar-circle">AO</div>
          <span class="user-name">Ameza Official</span>
          <span class="chevron-icon">${Icons.chevronDown}</span>
        </button>

        <!-- User Profile Popover -->
        <div class="dropdown-menu-popover" id="user-popover" style="min-width: 200px;">
          <div style="padding: 10px 16px; border-bottom: 1px solid var(--border-subtle);">
            <div style="font-weight: 700; font-size: 13px;">Ameza Official</div>
            <div style="font-size: 11.5px; color: var(--text-tertiary);">merchant@ameza.com</div>
          </div>
          <a href="settings.html" class="dropdown-item">
            ${Icons.settings} <span>Store Profile</span>
          </a>
          <a href="${window.location.pathname.includes('/seller/') ? '../index.html' : 'index.html'}" class="dropdown-item">
            ${Icons.home} <span>Switch to Buying</span>
          </a>
          <button type="button" class="dropdown-item" id="btn-toggle-theme">
            <span id="theme-icon">🌙</span> <span id="theme-label">Dark theme</span>
          </button>
          <div class="dropdown-divider"></div>
          <button type="button" class="dropdown-item" id="btn-logout" style="color: #CF222E;">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            <span>Log out</span>
          </button>
        </div>
      </div>
    `;
  }

  // 2. Render Sidebar
  const sidebarEl = document.getElementById('app-sidebar');
  if (sidebarEl) {
    sidebarEl.className = 'sidebar';
    sidebarEl.innerHTML = `
      <ul class="sidebar-nav-list" role="navigation" aria-label="Main menu">
        ${NAV_ITEMS.map(item => {
          const isActive = item.id === activePageId;
          const badgeHtml = item.badge ? `<span class="sidebar-badge">${escapeHTML(item.badge)}</span>` : '';
          return `
            <li class="sidebar-item">
              <a href="${item.url}" class="sidebar-link ${isActive ? 'active' : ''}" data-nav-id="${item.id}">
                <div class="sidebar-link-content">
                  <span class="sidebar-link-icon">${Icons[item.icon] || ''}</span>
                  <span>${escapeHTML(item.label)}</span>
                </div>
                ${badgeHtml}
              </a>
            </li>
          `;
        }).join('')}
      </ul>

      <div class="sidebar-footer">
        <a href="/storefront/store.html" target="_blank" rel="noopener noreferrer" class="btn-view-store">
          ${Icons.externalLink}
          <span>View my store</span>
        </a>
      </div>
    `;
  }

  // 3. Render Command Palette Modal (Ctrl+K)
  renderCommandPalette();

  // 4. Render Toast Container
  if (!document.getElementById('toast-container')) {
    const toastBox = document.createElement('div');
    toastBox.id = 'toast-container';
    toastBox.className = 'toast-container';
    document.body.appendChild(toastBox);
  }

  // 5. Render Mobile Backdrop
  if (!document.getElementById('sidebar-backdrop')) {
    const backdrop = document.createElement('div');
    backdrop.id = 'sidebar-backdrop';
    backdrop.className = 'sidebar-backdrop';
    document.body.appendChild(backdrop);
  }

  // Bind Shell Interactive Behaviors
  bindShellEvents();
  initTheme();
}

function renderNotificationItems() {
  if (!notificationList.length) {
    return `<div style="padding: 16px; text-align: center; color: var(--text-tertiary); font-size: 12px;">No new notifications</div>`;
  }
  return notificationList.map(item => `
    <div style="padding: 10px 16px; border-bottom: 1px solid var(--border-subtle); background-color: ${item.unread ? 'var(--primary-green-light)' : 'transparent'};">
      <div style="font-weight: 600; font-size: 12.5px; color: var(--text-main);">${escapeHTML(item.title)}</div>
      <div style="font-size: 11.5px; color: var(--text-secondary); margin-top: 2px;">${escapeHTML(item.desc)}</div>
      <div style="font-size: 10.5px; color: var(--text-tertiary); margin-top: 4px;">${escapeHTML(item.time)}</div>
    </div>
  `).join('');
}

function renderCommandPalette() {
  if (document.getElementById('command-palette-backdrop')) return;
  const palette = document.createElement('div');
  palette.id = 'command-palette-backdrop';
  palette.className = 'command-palette-backdrop';
  palette.innerHTML = `
    <div class="command-palette-dialog" role="dialog" aria-modal="true" aria-label="Command search">
      <div class="command-search-header">
        ${Icons.search}
        <input type="text" class="command-search-input" id="command-search-input" placeholder="Search pages, orders, settings..." autocomplete="off" />
        <kbd class="search-kbd">ESC to close</kbd>
      </div>
      <div class="command-list-wrap" id="command-list">
        ${NAV_ITEMS.map((item, idx) => `
          <a href="${item.url}" class="command-item ${idx === 0 ? 'selected' : ''}" data-idx="${idx}">
            <div style="display:flex; align-items:center; gap:10px;">
              <span>${Icons[item.icon]}</span>
              <strong>${escapeHTML(item.label)}</strong>
            </div>
            <span style="font-size:11.5px; color:var(--text-tertiary);">${item.url}</span>
          </a>
        `).join('')}
      </div>
      <div class="command-footer">
        <span>Use &uarr; &darr; to navigate, Enter to open</span>
        <span>AMEZA Admin</span>
      </div>
    </div>
  `;
  document.body.appendChild(palette);
}

function bindShellEvents() {
  // Notification popover toggle
  const notifBtn = document.getElementById('btn-notif-toggle');
  const notifPopover = document.getElementById('notif-popover');
  const userBtn = document.getElementById('btn-user-toggle');
  const userPopover = document.getElementById('user-popover');

  notifBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    userPopover?.classList.remove('active');
    notifPopover?.classList.toggle('active');
  });

  userBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    notifPopover?.classList.remove('active');
    userPopover?.classList.toggle('active');
  });

  // Mark all notifications read
  document.getElementById('btn-mark-all-read')?.addEventListener('click', () => {
    notificationList.forEach(n => n.unread = false);
    const container = document.getElementById('notif-list-container');
    if (container) container.innerHTML = renderNotificationItems();
    const badge = document.getElementById('notif-count-badge');
    if (badge) badge.textContent = '0';
    showToast('All notifications marked as read', 'info');
  });

  // Global close popovers on outer click
  document.addEventListener('click', (e) => {
    if (!notifPopover?.contains(e.target) && e.target !== notifBtn) {
      notifPopover?.classList.remove('active');
    }
    if (!userPopover?.contains(e.target) && e.target !== userBtn) {
      userPopover?.classList.remove('active');
    }
  });

  // Mobile Drawer Toggle
  const hamburgerBtn = document.getElementById('btn-hamburger');
  const sidebar = document.getElementById('app-sidebar');
  const backdrop = document.getElementById('sidebar-backdrop');

  const openDrawer = () => {
    sidebar?.classList.add('open');
    backdrop?.classList.add('active');
  };
  const closeDrawer = () => {
    sidebar?.classList.remove('open');
    backdrop?.classList.remove('active');
  };

  hamburgerBtn?.addEventListener('click', openDrawer);
  backdrop?.addEventListener('click', closeDrawer);

  // Command Palette Open & Close
  const paletteBackdrop = document.getElementById('command-palette-backdrop');
  const paletteInput = document.getElementById('command-search-input');
  const openPaletteBtn = document.getElementById('btn-open-palette');

  const openPalette = () => {
    if (paletteBackdrop) {
      paletteBackdrop.classList.add('active');
      paletteInput?.focus();
      if (paletteInput) paletteInput.value = '';
      filterCommandItems('');
    }
  };

  const closePalette = () => {
    paletteBackdrop?.classList.remove('active');
  };

  openPaletteBtn?.addEventListener('click', openPalette);

  paletteBackdrop?.addEventListener('click', (e) => {
    if (e.target === paletteBackdrop) closePalette();
  });

  // Keyboard shortcut Ctrl+K or Cmd+K
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
      e.preventDefault();
      if (paletteBackdrop?.classList.contains('active')) {
        closePalette();
      } else {
        openPalette();
      }
    }
    if (e.key === 'Escape' && paletteBackdrop?.classList.contains('active')) {
      closePalette();
    }
  });

  // Filter command palette
  paletteInput?.addEventListener('input', (e) => {
    filterCommandItems(e.target.value.toLowerCase().trim());
  });

  // Keyboard navigation inside Command Palette
  paletteInput?.addEventListener('keydown', (e) => {
    const list = document.getElementById('command-list');
    const items = Array.from(list?.querySelectorAll('.command-item:not([style*="display: none"])') || []);
    if (!items.length) return;

    let selectedIdx = items.findIndex(el => el.classList.contains('selected'));

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedIdx = (selectedIdx + 1) % items.length;
      items.forEach((el, i) => el.classList.toggle('selected', i === selectedIdx));
      items[selectedIdx]?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedIdx = (selectedIdx - 1 + items.length) % items.length;
      items.forEach((el, i) => el.classList.toggle('selected', i === selectedIdx));
      items[selectedIdx]?.scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIdx >= 0 && items[selectedIdx]) {
        window.location.href = items[selectedIdx].getAttribute('href');
      }
    }
  });

  // Logout handler
  document.getElementById('btn-logout')?.addEventListener('click', () => {
    showToast('Logged out of seller session. Redirecting...', 'info');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
  });
}

function filterCommandItems(query) {
  const list = document.getElementById('command-list');
  const items = list?.querySelectorAll('.command-item');
  let firstVisible = null;

  items?.forEach(item => {
    const text = item.textContent.toLowerCase();
    if (!query || text.includes(query)) {
      item.style.display = 'flex';
      item.classList.remove('selected');
      if (!firstVisible) firstVisible = item;
    } else {
      item.style.display = 'none';
      item.classList.remove('selected');
    }
  });

  if (firstVisible) {
    firstVisible.classList.add('selected');
  }
}

// Dark Mode Management
function initTheme() {
  const urlParams = new URLSearchParams(window.location.search);
  const themeParam = urlParams.get('theme');
  const savedTheme = themeParam || localStorage.getItem('ameza_dashboard_theme') || 'light';
  applyTheme(savedTheme);

  const themeToggle = document.getElementById('btn-toggle-theme');
  themeToggle?.addEventListener('click', () => {
    const current = document.documentElement.getAttribute('data-theme') || 'light';
    const next = current === 'dark' ? 'light' : 'dark';
    applyTheme(next);
    showToast(`Switched to ${next} mode`, 'info');
  });
}

function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  localStorage.setItem('ameza_dashboard_theme', theme);
  const label = document.getElementById('theme-label');
  const icon = document.getElementById('theme-icon');
  if (label && icon) {
    if (theme === 'dark') {
      label.textContent = 'Light theme';
      icon.textContent = '☀️';
    } else {
      label.textContent = 'Dark theme';
      icon.textContent = '🌙';
    }
  }
}

// Floating Toast Notification
export function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = 'toast';
  const iconSvg = type === 'success' ? Icons.checkCircle : `<span style="color:var(--primary-green);">●</span>`;
  toast.innerHTML = `${iconSvg} <span>${escapeHTML(message)}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    toast.style.transition = 'all 0.25s ease';
    setTimeout(() => toast.remove(), 250);
  }, 3500);
}
