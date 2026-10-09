/**
 * AMEZA Buyer Profile Page Module — buyer/js/pages/profile.js
 */

import { initLayout } from '/shared/js/core/layout.js';
import { getSession, setSession } from '/shared/js/core/session.js';
import { escapeHTML } from '/shared/js/core/utils.js';
import { AccountUI } from '/buyer/js/account-ui.js';

export function initProfilePage() {
  const session = getSession() || (window.AmezaAuth && window.AmezaAuth.getCurrentUser && window.AmezaAuth.getCurrentUser());
  if (!session) {
    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/auth/login.html?redirect=${returnUrl}`;
    return;
  }

  // Sidebar
  const sidebar = document.getElementById('account-sidebar');
  if (sidebar) {
    sidebar.innerHTML = AccountUI.sidebarHTML(session, 'profile');
    AccountUI.initMobileSidebar();
  }

  // Populate form fields
  const firstInput = document.getElementById('profile-firstname') || document.getElementById('input-first-name');
  const lastInput = document.getElementById('profile-lastname') || document.getElementById('input-last-name');
  const emailInput = document.getElementById('profile-email') || document.getElementById('input-email');
  const phoneInput = document.getElementById('profile-phone') || document.getElementById('input-phone');

  if (firstInput) firstInput.value = session.firstName || '';
  if (lastInput) lastInput.value = session.lastName || '';
  if (emailInput) emailInput.value = session.email || '';
  if (phoneInput) phoneInput.value = session.phone || '';

  const saveBtn = document.getElementById('btn-save-profile') || document.getElementById('profile-save-btn');
  if (saveBtn) {
    saveBtn.onclick = (e) => {
      e.preventDefault();
      const updated = {
        ...session,
        firstName: firstInput?.value.trim() || session.firstName,
        lastName: lastInput?.value.trim() || session.lastName,
        phone: phoneInput?.value.trim() || session.phone
      };

      setSession(updated);
      if (window.AmezaAuth && window.AmezaAuth.updateProfile) {
        window.AmezaAuth.updateProfile(session.id || session.userId, updated);
      }
      AccountUI.toast('Profile updated successfully');
      AccountUI.populateSidebarUser(updated);
    };
  }
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initLayout();
    initProfilePage();
  });
} else {
  initLayout();
  initProfilePage();
}

window.Ameza = window.Ameza || {};
window.Ameza.initProfilePage = initProfilePage;
