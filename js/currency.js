/**
 * AMEZA Currency Switcher Engine — js/currency.js
 * High-performance multi-currency conversion, formatting & inline top-bar dropdown.
 */

'use strict';

(function() {
  const CURRENCY_STORAGE_KEY = 'ameza_currency';

  // Supported Currencies & Standard Exchange Rates (Base: USD = 1.00)
  const CURRENCIES = {
    USD: { code: 'USD', symbol: '$', name: 'US Dollar', rate: 1.0, flag: '🇺🇸', decimals: 2 },
    PKR: { code: 'PKR', symbol: 'Rs ', name: 'Pakistani Rupee', rate: 278.5, flag: '🇵🇰', decimals: 0 },
    EUR: { code: 'EUR', symbol: '€', name: 'Euro', rate: 0.92, flag: '🇪🇺', decimals: 2 },
    GBP: { code: 'GBP', symbol: '£', name: 'British Pound', rate: 0.79, flag: '🇬🇧', decimals: 2 },
    AED: { code: 'AED', symbol: 'AED ', name: 'UAE Dirham', rate: 3.67, flag: '🇦🇪', decimals: 2 },
    SAR: { code: 'SAR', symbol: 'SAR ', name: 'Saudi Riyal', rate: 3.75, flag: '🇸🇦', decimals: 2 },
    INR: { code: 'INR', symbol: '₹', name: 'Indian Rupee', rate: 83.5, flag: '🇮🇳', decimals: 0 },
    CAD: { code: 'CAD', symbol: 'CA$', name: 'Canadian Dollar', rate: 1.36, flag: '🇨🇦', decimals: 2 },
    AUD: { code: 'AUD', symbol: 'AU$', name: 'Australian Dollar', rate: 1.52, flag: '🇦🇺', decimals: 2 },
    TRY: { code: 'TRY', symbol: '₺', name: 'Turkish Lira', rate: 32.5, flag: '🇹🇷', decimals: 2 },
    JPY: { code: 'JPY', symbol: '¥', name: 'Japanese Yen', rate: 155.0, flag: '🇯🇵', decimals: 0 },
    CNY: { code: 'CNY', symbol: '¥', name: 'Chinese Yuan', rate: 7.23, flag: '🇨🇳', decimals: 2 },
  };

  const AmezaCurrency = {
    currencies: CURRENCIES,

    /**
     * Get active currency code (default: USD)
     */
    getCurrencyCode() {
      try {
        const stored = localStorage.getItem(CURRENCY_STORAGE_KEY);
        if (stored && CURRENCIES[stored]) return stored;
      } catch (e) {}
      return 'USD';
    },

    /**
     * Get active currency configuration
     */
    getCurrency() {
      const code = this.getCurrencyCode();
      return CURRENCIES[code] || CURRENCIES.USD;
    },

    /**
     * Convert USD numeric amount to active currency
     */
    convert(amountUSD) {
      const num = Number(amountUSD) || 0;
      const curr = this.getCurrency();
      return num * curr.rate;
    },

    /**
     * Format a USD amount into localized active currency string
     * e.g., 99.99 -> "$99.99" (USD) or "Rs 27,847" (PKR) or "€91.99" (EUR)
     */
    format(amountUSD, showDecimals = true) {
      const num = Number(amountUSD) || 0;
      const curr = this.getCurrency();
      const converted = num * curr.rate;
      const fractionDigits = showDecimals ? curr.decimals : 0;

      const formattedNumber = converted.toLocaleString('en-US', {
        minimumFractionDigits: fractionDigits,
        maximumFractionDigits: fractionDigits
      });

      return `${curr.symbol}${formattedNumber}`;
    },

    /**
     * Set active currency and dispatch update event across application
     */
    setCurrency(code) {
      if (!CURRENCIES[code]) return;
      try {
        localStorage.setItem(CURRENCY_STORAGE_KEY, code);
      } catch (e) {}

      this.closeAllDropdowns();
      this.updateTopBarLabels();

      // Dispatch global change event for app.js and travel-engine.js
      window.dispatchEvent(new CustomEvent('ameza:currency-changed', {
        detail: {
          currency: code,
          config: CURRENCIES[code]
        }
      }));

      // Show toast if AccountUI or toast function exists
      if (window.AccountUI && window.AccountUI.toast) {
        window.AccountUI.toast(`Currency switched to ${CURRENCIES[code].name} (${code})`, 'success');
      }

      // If on account page without complex custom listeners, re-run account order renderer
      if (window.location.pathname.includes('account-') || window.location.pathname.includes('account.html')) {
        setTimeout(() => {
          if (typeof window.renderOrders === 'function') {
            window.renderOrders();
          }
        }, 100);
      }
    },

    /**
     * Close all open currency dropdowns
     */
    closeAllDropdowns() {
      document.querySelectorAll('.top-bar-currency-wrapper.is-open').forEach(wrapper => {
        wrapper.classList.remove('is-open');
        const btn = wrapper.querySelector('.top-bar-currency-btn');
        if (btn) btn.setAttribute('aria-expanded', 'false');
      });
    },

    /**
     * Toggle a specific dropdown wrapper
     */
    toggleDropdown(wrapper) {
      if (!wrapper) return;
      const isOpen = wrapper.classList.contains('is-open');
      this.closeAllDropdowns();
      if (!isOpen) {
        wrapper.classList.add('is-open');
        const btn = wrapper.querySelector('.top-bar-currency-btn');
        if (btn) btn.setAttribute('aria-expanded', 'true');
      }
    },

    /**
     * Generate HTML for the dropdown menu
     */
    getDropdownMenuHTML() {
      const activeCode = this.getCurrencyCode();
      const itemsHTML = Object.values(CURRENCIES).map(c => {
        const isActive = c.code === activeCode;
        return `
          <button type="button" class="currency-dropdown-item ${isActive ? 'active' : ''}" data-currency-code="${c.code}">
            <div class="currency-item-left">
              <span class="currency-item-flag">${c.flag}</span>
              <div class="currency-item-info">
                <span class="currency-item-code">${c.code}</span>
                <span class="currency-item-name">${c.name}</span>
              </div>
            </div>
            <span class="currency-item-symbol">${c.symbol.trim()}</span>
          </button>
        `;
      }).join('');

      return `
        <div class="top-bar-currency-dropdown" role="menu">
          <div class="currency-dropdown-header">
            <span class="currency-dropdown-title">
              <span>Select Currency</span>
              <i class="fa-solid fa-coins" style="color:var(--primary, #7DBA35); font-size:0.75rem;"></i>
            </span>
          </div>
          <div class="currency-dropdown-list">
            ${itemsHTML}
          </div>
        </div>
      `;
    },

    /**
     * Update all top bar currency labels and inject inline dropdown in DOM
     */
    updateTopBarLabels() {
      const curr = this.getCurrency();
      const displayText = `${curr.code} (${curr.symbol.trim()})`;

      // 1. Text containers
      document.querySelectorAll('.current-currency-text').forEach(el => {
        el.textContent = displayText;
      });

      // 2. Find and convert any top-bar currency trigger into a full dropdown component
      document.querySelectorAll('.top-bar-right').forEach(topBarRight => {
        let wrapper = topBarRight.querySelector('.top-bar-currency-wrapper');

        if (!wrapper) {
          // Look for any existing currency placeholder (span with fa-globe, etc.)
          const candidates = topBarRight.querySelectorAll('.top-bar-link, span, button');
          let targetEl = null;
          for (const el of candidates) {
            if (el.innerHTML.includes('fa-globe') || el.classList.contains('top-bar-currency-btn') || el.getAttribute('data-action') === 'open-currency-modal') {
              targetEl = el;
              break;
            }
          }

          wrapper = document.createElement('div');
          wrapper.className = 'top-bar-currency-wrapper';

          if (targetEl) {
            targetEl.replaceWith(wrapper);
          } else {
            topBarRight.appendChild(wrapper);
          }
        }

        // Render button + dropdown inside wrapper
        wrapper.innerHTML = `
          <button type="button" class="top-bar-currency-btn" aria-expanded="false" aria-haspopup="true" title="Current Currency: ${curr.name} (${curr.code}) — Click to change">
            <i class="fa-solid fa-globe"></i>
            <span class="current-currency-text">${displayText}</span>
            <i class="fa-solid fa-chevron-down currency-chevron"></i>
          </button>
          ${this.getDropdownMenuHTML()}
        `;

        // Attach toggle click
        const btn = wrapper.querySelector('.top-bar-currency-btn');
        btn.addEventListener('click', (e) => {
          e.preventDefault();
          e.stopPropagation();
          this.toggleDropdown(wrapper);
        });

        // Attach click handlers to currency items
        wrapper.querySelectorAll('.currency-dropdown-item').forEach(item => {
          item.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            const code = item.getAttribute('data-currency-code');
            this.setCurrency(code);
          });
        });
      });
    },

    /**
     * Backwards compatibility for any legacy trigger
     */
    openModal() {
      const firstWrapper = document.querySelector('.top-bar-currency-wrapper');
      if (firstWrapper) {
        this.toggleDropdown(firstWrapper);
      }
    },

    closeModal() {
      this.closeAllDropdowns();
    },

    /**
     * Initialize on page load
     */
    init() {
      this.updateTopBarLabels();

      // Close currency dropdowns on outside click
      document.addEventListener('click', (e) => {
        if (!e.target.closest('.top-bar-currency-wrapper')) {
          this.closeAllDropdowns();
        }
        
        // Handle services nav dropdown toggle and outside click
        const servicesBtn = e.target.closest('.services-nav-btn');
        if (servicesBtn) {
          e.preventDefault();
          const dropdown = servicesBtn.closest('.services-nav-dropdown');
          if (dropdown) {
            dropdown.classList.toggle('is-open');
          }
        } else if (!e.target.closest('.services-nav-dropdown')) {
          document.querySelectorAll('.services-nav-dropdown.is-open').forEach(d => d.classList.remove('is-open'));
        }
      });

      // Close on Escape key
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          this.closeAllDropdowns();
          document.querySelectorAll('.services-nav-dropdown.is-open').forEach(d => d.classList.remove('is-open'));
        }
      });
    }
  };

  // Export globally
  window.AmezaCurrency = AmezaCurrency;

  // Auto-init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => AmezaCurrency.init());
  } else {
    AmezaCurrency.init();
  }
})();
