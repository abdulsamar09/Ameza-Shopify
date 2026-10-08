/**
 * AMEZA Core Utilities — js/core/utils.js
 * Single source of truth for HTML escaping, currency formatting, and UI helpers.
 */

/**
 * Universal HTML entity escaping to prevent XSS.
 * @param {*} str - Input to escape.
 * @returns {string} Sanitized string.
 */
export function escapeHTML(str) {
  if (str === null || str === undefined) return '';
  if (typeof str !== 'string') str = String(str);
  return str.replace(/[&<>'"]/g, tag => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    "'": '&#39;',
    '"': '&quot;'
  }[tag] || tag));
}

/**
 * Strips dangerous HTML tags while keeping safe text.
 * @param {*} str 
 * @returns {string}
 */
export function sanitizeHTML(str) {
  return escapeHTML(str);
}

/**
 * Formats minor units (cents) into a localized currency string.
 * @param {number} cents - Amount in integer cents (e.g., 2999 = $29.99).
 * @param {string} currency - 3-letter currency code (default: 'USD').
 * @returns {string} Formatted price string.
 */
export function formatMoney(cents, currency = 'USD') {
  if (cents === null || cents === undefined || isNaN(cents)) {
    cents = 0;
  }
  const intCents = Math.round(Number(cents));
  if (typeof window !== 'undefined' && window.AmezaCurrency && typeof window.AmezaCurrency.formatCents === 'function') {
    return window.AmezaCurrency.formatCents(intCents);
  }
  const dollars = intCents / 100;
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(dollars);
  } catch (e) {
    return `$${dollars.toFixed(2)}`;
  }
}

/**
 * Format date string into human-readable format.
 * @param {string|Date} dateStr 
 * @param {Object} options 
 * @returns {string}
 */
export function formatDate(dateStr, options = { month: 'short', day: 'numeric', year: 'numeric' }) {
  if (!dateStr) return '—';
  try {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? String(dateStr) : d.toLocaleDateString('en-US', options);
  } catch (e) {
    return String(dateStr);
  }
}

/**
 * Generate a random alphanumeric unique ID.
 * @param {string} prefix 
 * @returns {string}
 */
export function generateId(prefix = 'id') {
  return `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

/**
 * Debounce a function call.
 * @param {Function} fn 
 * @param {number} delay 
 * @returns {Function}
 */
export function debounce(fn, delay = 250) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), delay);
  };
}

/**
 * Universal Toast notification.
 * @param {string} message 
 * @param {'success'|'error'|'warning'|'info'} type 
 * @param {number} duration 
 */
export function showToast(message, type = 'info', duration = 3000) {
  let container = document.getElementById('ameza-toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'ameza-toast-container';
    container.className = 'toast-container';
    container.setAttribute('aria-live', 'polite');
    container.setAttribute('aria-atomic', 'true');
    document.body.appendChild(container);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type} toast-enter`;
  
  const iconMap = {
    success: '<i class="fa-solid fa-circle-check"></i>',
    error: '<i class="fa-solid fa-circle-exclamation"></i>',
    warning: '<i class="fa-solid fa-triangle-exclamation"></i>',
    info: '<i class="fa-solid fa-circle-info"></i>'
  };

  toast.innerHTML = `
    <span class="toast-icon">${iconMap[type] || iconMap.info}</span>
    <span class="toast-message">${escapeHTML(message)}</span>
    <button type="button" class="toast-close" aria-label="Close">&times;</button>
  `;

  const removeToast = () => {
    toast.classList.remove('toast-enter');
    toast.classList.add('toast-exit');
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 200);
  };

  toast.querySelector('.toast-close').addEventListener('click', removeToast);
  container.appendChild(toast);

  if (duration > 0) {
    setTimeout(removeToast, duration);
  }
}

// Global browser window attachment for compatibility across legacy files and tests
if (typeof window !== 'undefined') {
  window.escapeHTML = escapeHTML;
  window.sanitizeHTML = sanitizeHTML;
  window.formatMoney = formatMoney;
  window.showToast = showToast;
  window.AmezaUtils = { escapeHTML, sanitizeHTML, formatMoney, formatDate, generateId, debounce, showToast };
}
