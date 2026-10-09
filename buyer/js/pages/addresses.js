/**
 * AMEZA Buyer Addresses Page Module — buyer/js/pages/addresses.js
 */

import { initLayout } from '/shared/js/core/layout.js';
import { getSession } from '/shared/js/core/session.js';
import { escapeHTML } from '/shared/js/core/utils.js';
import { AccountUI } from '/buyer/js/account-ui.js';

export function initAddressesPage() {
  const Auth = window.AmezaAuth;
  const UI = AccountUI;

  const session = getSession() || (Auth && Auth.getCurrentUser && Auth.getCurrentUser());
  if (!session) {
    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/auth/login.html?redirect=${returnUrl}`;
    return;
  }

  // Sidebar
  const sidebar = document.getElementById('account-sidebar');
  if (sidebar) {
    sidebar.innerHTML = UI.sidebarHTML(session, 'addresses');
    UI.initMobileSidebar();
  }

  const container = document.getElementById('addresses-list') || document.getElementById('addresses-grid');
  let editingAddressId = null;

  function loadAddresses() {
    if (Auth && typeof Auth.getAddresses === 'function') {
      return Auth.getAddresses(session.id || session.userId);
    }
    try {
      const raw = localStorage.getItem('ameza_addresses_' + (session.id || session.userId));
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function saveAddresses(list) {
    localStorage.setItem('ameza_addresses_' + (session.id || session.userId), JSON.stringify(list));
  }

  function renderAddresses() {
    if (!container) return;
    const addresses = loadAddresses();

    if (addresses.length === 0) {
      container.innerHTML = `
        <div style="text-align: center; padding: 40px 16px; color: var(--text-muted);">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" style="margin: 0 auto 12px; display:block; opacity:0.4;"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
          <p style="font-weight: 700; color: var(--dark); margin-bottom: 4px;">No Saved Addresses</p>
          <p style="font-size: 0.85rem;">Add a shipping address for faster, single-click checkout.</p>
        </div>
      `;
      return;
    }

    container.innerHTML = addresses.map(addr => `
      <div class="address-card ${addr.isDefault ? 'default-card' : ''}" style="padding: 18px; border: 1.5px solid ${addr.isDefault ? 'var(--primary, #7DBA35)' : 'var(--border)'}; border-radius: var(--radius-lg); margin-bottom: 14px; background: #FFF; position:relative;">
        ${addr.isDefault ? `<span style="position:absolute; top:12px; right:12px; background:var(--primary-light, #F3F8EE); color:var(--primary-dark, #5B8828); font-size:0.75rem; font-weight:800; padding:3px 8px; border-radius:4px;">Default</span>` : ''}
        <div style="font-weight: 800; font-size: 1rem; color: var(--dark); margin-bottom: 4px;">${escapeHTML(addr.firstName || '')} ${escapeHTML(addr.lastName || '')}</div>
        <div style="font-size: 0.88rem; color: var(--text-muted); line-height: 1.5;">
          ${escapeHTML(addr.line1 || '')}${addr.line2 ? '<br>' + escapeHTML(addr.line2) : ''}<br>
          ${escapeHTML(addr.city || '')}, ${escapeHTML(addr.state || '')} ${escapeHTML(addr.zip || '')}<br>
          ${escapeHTML(addr.country || 'United States')}
          ${addr.phone ? `<br><span style="font-size:0.8rem;">Phone: ${escapeHTML(addr.phone)}</span>` : ''}
        </div>
        <div style="margin-top: 14px; display: flex; gap: 8px;">
          <button type="button" class="btn-edit-addr" data-id="${addr.id}" style="padding: 5px 12px; font-size: 0.8rem; font-weight:700; border-radius: 6px; border: 1px solid var(--border); background: #FFF; cursor:pointer;">Edit</button>
          ${!addr.isDefault ? `<button type="button" class="btn-default-addr" data-id="${addr.id}" style="padding: 5px 12px; font-size: 0.8rem; font-weight:700; border-radius: 6px; border: 1px solid var(--border); background: #FFF; cursor:pointer;">Set as Default</button>` : ''}
          <button type="button" class="btn-delete-addr" data-id="${addr.id}" style="padding: 5px 12px; font-size: 0.8rem; font-weight:700; border-radius: 6px; border: 1px solid #FECACA; color:#EF4444; background: #FFF; cursor:pointer; margin-left:auto;">Delete</button>
        </div>
      </div>
    `).join('');

    container.querySelectorAll('.btn-edit-addr').forEach(b => {
      b.onclick = () => {
        const id = b.getAttribute('data-id');
        const addr = loadAddresses().find(a => String(a.id) === String(id));
        if (addr) showForm(addr);
      };
    });

    container.querySelectorAll('.btn-default-addr').forEach(b => {
      b.onclick = () => {
        const id = b.getAttribute('data-id');
        const list = loadAddresses();
        list.forEach(a => { a.isDefault = String(a.id) === String(id); });
        saveAddresses(list);
        if (Auth && Auth.setDefaultAddress) Auth.setDefaultAddress(session.id || session.userId, id);
        UI.toast('Default address updated');
        renderAddresses();
      };
    });

    container.querySelectorAll('.btn-delete-addr').forEach(b => {
      b.onclick = async () => {
        const id = b.getAttribute('data-id');
        const confirmed = await UI.confirm({ title: 'Delete Address', description: 'Are you sure you want to remove this saved address?' });
        if (confirmed) {
          const list = loadAddresses().filter(a => String(a.id) !== String(id));
          if (list.length > 0 && !list.some(a => a.isDefault)) list[0].isDefault = true;
          saveAddresses(list);
          if (Auth && Auth.deleteAddress) Auth.deleteAddress(session.id || session.userId, id);
          UI.toast('Address removed');
          renderAddresses();
        }
      };
    });
  }

  const formWrap = document.getElementById('address-form-container');
  const addBtn = document.getElementById('btn-add-address');
  const cancelBtn = document.getElementById('btn-cancel-address');
  const saveBtn = document.getElementById('btn-save-address');

  function showForm(addr = {}) {
    editingAddressId = addr.id || null;
    if (formWrap) {
      formWrap.style.display = 'block';
      const titleEl = document.getElementById('address-form-title');
      if (titleEl) titleEl.textContent = editingAddressId ? 'Edit Address' : 'Add New Address';
      const fields = document.getElementById('address-form-fields');
      if (fields) fields.innerHTML = UI.addressFormHTML(addr);
      formWrap.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function hideForm() {
    editingAddressId = null;
    if (formWrap) formWrap.style.display = 'none';
  }

  if (addBtn) addBtn.onclick = () => showForm();
  if (cancelBtn) cancelBtn.onclick = hideForm;

  if (saveBtn) {
    saveBtn.onclick = () => {
      const data = UI.readAddressForm ? UI.readAddressForm() : {
        firstName: document.getElementById('addr-firstname')?.value || '',
        lastName: document.getElementById('addr-lastname')?.value || '',
        line1: document.getElementById('addr-line1')?.value || '',
        city: document.getElementById('addr-city')?.value || '',
        state: document.getElementById('addr-state')?.value || '',
        zip: document.getElementById('addr-zip')?.value || '',
        country: document.getElementById('addr-country')?.value || 'United States',
      };

      if (!data.firstName || !data.line1 || !data.city || !data.zip) {
        UI.toast('Please fill all required fields', 'error');
        return;
      }

      const list = loadAddresses();
      if (editingAddressId) {
        const idx = list.findIndex(a => String(a.id) === String(editingAddressId));
        if (idx !== -1) list[idx] = { ...list[idx], ...data };
        UI.toast('Address updated successfully');
      } else {
        const newAddr = { ...data, id: 'addr_' + Date.now(), isDefault: list.length === 0 };
        list.push(newAddr);
        UI.toast('New address saved');
      }
      saveAddresses(list);
      hideForm();
      renderAddresses();
    };
  }

  renderAddresses();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initLayout();
    initAddressesPage();
  });
} else {
  initLayout();
  initAddressesPage();
}

window.Ameza = window.Ameza || {};
window.Ameza.initAddressesPage = initAddressesPage;
