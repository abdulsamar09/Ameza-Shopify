/**
 * AMEZA Multi-Vendor Marketplace Demo Controller & Role Switcher — js/demo-bar.js
 * Injects a persistent top bar allowing immediate role-switching,
 * virtual time advancement (+7 days), interactive 12-step demo checklist,
 * self-test invariant launcher, and demo state reset.
 */

import { DEMO_IDENTITIES, SeedService } from './api/seed.js';
import { CmsAPI, applyThemeVariables } from './api/cms.api.js';

export const DemoController = {
  init() {
    // Ensure seed data exists
    SeedService.init(false);
    applyThemeVariables();
    this.renderBar();
  },

  getCurrentRole() {
    try {
      const session = JSON.parse(localStorage.getItem('ameza_session') || 'null');
      return session?.role || 'customer';
    } catch (e) {
      return 'customer';
    }
  },

  getCurrentUser() {
    try {
      const session = JSON.parse(localStorage.getItem('ameza_session') || 'null');
      return session?.user || DEMO_IDENTITIES.CUSTOMER;
    } catch (e) {
      return DEMO_IDENTITIES.CUSTOMER;
    }
  },

  switchRole(roleKey) {
    const target = DEMO_IDENTITIES[roleKey];
    if (!target) return;

    const session = {
      userId: target.id || target.userId,
      user: target,
      role: target.role,
      expiresAt: Date.now() + 86400000 * 30
    };

    localStorage.setItem('ameza_session', JSON.stringify(session));

    // Redirect or refresh appropriately
    if (target.role === 'seller') {
      window.location.href = 'seller/index.html';
    } else if (target.role === 'super_admin' || target.role === 'staff') {
      window.location.href = 'admin-moderation.html';
    } else {
      window.location.href = 'index.html';
    }
  },

  advanceTime(days = 7) {
    const currentOffset = parseInt(localStorage.getItem('ameza_time_offset_days') || '0', 10);
    const newOffset = currentOffset + days;
    localStorage.setItem('ameza_time_offset_days', newOffset.toString());

    // Evaluate sub-orders hold period
    try {
      const subOrders = JSON.parse(localStorage.getItem('ameza_marketplace_sub_orders') || '[]');
      const ledger = JSON.parse(localStorage.getItem('ameza_ledger_entries') || '[]');
      const simulatedNow = Date.now() + (newOffset * 86400000);

      let releasedCount = 0;
      subOrders.forEach(sub => {
        if (sub.deliveredAt && sub.holdUntil && simulatedNow >= sub.holdUntil && sub.status !== 'disputed' && sub.status !== 'refunded') {
          // Transition pending ledger entries to available
          ledger.forEach(entry => {
            if (entry.subOrderId === sub.id && entry.bucket === 'pending') {
              entry.bucket = 'available';
              releasedCount++;
            }
          });
        }
      });

      localStorage.setItem('ameza_ledger_entries', JSON.stringify(ledger));
      alert(`⏱️ Virtual clock advanced by +${days} days!\n\nSimulated hold period elapsed. ${releasedCount} pending funds entries released into Available balance.`);
      window.location.reload();
    } catch (e) {
      console.error('Time advancement error:', e);
    }
  },

  resetDemo() {
    if (confirm('⚠️ Are you sure you want to reset all demo data back to clean defaults?')) {
      SeedService.reset();
      localStorage.removeItem('ameza_time_offset_days');
      alert('✨ Demo environment successfully re-seeded with realistic US marketplace data!');
      window.location.href = 'index.html';
    }
  },

  openDemoGuide() {
    let guideModal = document.getElementById('ameza-demo-guide-modal');
    if (!guideModal) {
      this.createDemoGuideModal();
      guideModal = document.getElementById('ameza-demo-guide-modal');
    }
    if (guideModal) {
      guideModal.style.display = 'flex';
    }
  },

  createDemoGuideModal() {
    const modal = document.createElement('div');
    modal.id = 'ameza-demo-guide-modal';
    modal.style.cssText = `
      position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 100000;
      display: none; align-items: center; justify-content: center; padding: 20px;
      backdrop-filter: blur(4px); font-family: 'Plus Jakarta Sans', sans-serif;
    `;

    modal.innerHTML = `
      <div style="background: #FFFFFF; border-radius: 16px; max-width: 680px; width: 100%; max-height: 90vh; overflow-y: auto; padding: 28px; box-shadow: 0 25px 50px -12px rgba(0,0,0,0.25);">
        <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #E5E7EB; padding-bottom: 16px; margin-bottom: 20px;">
          <div>
            <h2 style="font-size: 1.35rem; font-weight: 800; color: #111827; margin: 0;">🚀 AMEZA Demo Guide & Interactive Checklist</h2>
            <p style="font-size: 0.85rem; color: #6B7280; margin: 4px 0 0;">Click through each step to test the fully functional US multi-vendor marketplace.</p>
          </div>
          <button onclick="document.getElementById('ameza-demo-guide-modal').style.display='none'" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #9CA3AF;">&times;</button>
        </div>

        <div style="display: flex; flex-direction: column; gap: 12px; font-size: 0.88rem;">
          <div style="border: 1px solid #E5E7EB; border-radius: 10px; padding: 12px; background: #F9FAFB;">
            <div style="font-weight: 700; color: #111827;">1. Buyer Checkout & Multi-Vendor Split</div>
            <p style="color: #4B5563; margin: 4px 0 8px;">Browse store, add items from Austin Leather Co & AMEZA Official, apply coupon <code>AMEZA20</code>, and complete test card checkout.</p>
            <a href="index.html" class="btn-sm" style="display: inline-block; background: #7FB73C; color: #fff; padding: 4px 12px; border-radius: 6px; text-decoration: none; font-weight: 600;">Go to Storefront →</a>
          </div>

          <div style="border: 1px solid #E5E7EB; border-radius: 10px; padding: 12px; background: #F9FAFB;">
            <div style="font-weight: 700; color: #111827;">2. Seller Fulfilment & USPS / UPS Dispatch</div>
            <p style="color: #4B5563; margin: 4px 0 8px;">Switch to <strong>Seller 1 (Austin Leather Co)</strong>, view orders, update status to Shipped/Delivered with USPS / UPS tracking.</p>
            <button onclick="window.AmezaDemo.switchRole('SELLER_1')" style="background: #111827; color: #fff; padding: 4px 12px; border-radius: 6px; border: none; cursor: pointer; font-weight: 600;">Switch to Seller 1</button>
          </div>

          <div style="border: 1px solid #E5E7EB; border-radius: 10px; padding: 12px; background: #F9FAFB;">
            <div style="font-weight: 700; color: #111827;">3. Virtual Time Hold Release (+7 Days)</div>
            <p style="color: #4B5563; margin: 4px 0 8px;">Click <strong>"+7 Days"</strong> on the top bar to fast-forward the holding period and release pending earnings to Available balance.</p>
            <button onclick="window.AmezaDemo.advanceTime(7)" style="background: #3B82F6; color: #fff; padding: 4px 12px; border-radius: 6px; border: none; cursor: pointer; font-weight: 600;">Fast-forward +7 Days</button>
          </div>

          <div style="border: 1px solid #E5E7EB; border-radius: 10px; padding: 12px; background: #F9FAFB;">
            <div style="font-weight: 700; color: #111827;">4. Merchant Payouts & Admin Approval</div>
            <p style="color: #4B5563; margin: 4px 0 8px;">Request a payout via ACH Routing / Checking, switch to <strong>Super Admin</strong>, and mark it Paid with reference code.</p>
            <button onclick="window.AmezaDemo.switchRole('SUPER_ADMIN')" style="background: #111827; color: #fff; padding: 4px 12px; border-radius: 6px; border: none; cursor: pointer; font-weight: 600;">Switch to Super Admin</button>
          </div>

          <div style="border: 1px solid #E5E7EB; border-radius: 10px; padding: 12px; background: #F9FAFB;">
            <div style="font-weight: 700; color: #111827;">5. Seller Onboarding Wizard & Moderation</div>
            <p style="color: #4B5563; margin: 4px 0 8px;">Complete the 4-step merchant application with EIN / SSN & US bank info, then review/approve it in Admin Moderation.</p>
            <a href="onboarding/apply.html" style="display: inline-block; background: #7FB73C; color: #fff; padding: 4px 12px; border-radius: 6px; text-decoration: none; font-weight: 600;">Open Seller Wizard →</a>
          </div>

          <div style="border: 1px solid #E5E7EB; border-radius: 10px; padding: 12px; background: #F9FAFB;">
            <div style="font-weight: 700; color: #111827;">6. Staff RBAC Permission Restriction</div>
            <p style="color: #4B5563; margin: 4px 0 8px;">Switch to <strong>Staff (Support Specialist)</strong> and observe that Finance, Commission rates, and System Settings are strictly inaccessible.</p>
            <button onclick="window.AmezaDemo.switchRole('STAFF_SUPPORT')" style="background: #6366F1; color: #fff; padding: 4px 12px; border-radius: 6px; border: none; cursor: pointer; font-weight: 600;">Switch to Support Staff</button>
          </div>

          <div style="border: 1px solid #E5E7EB; border-radius: 10px; padding: 12px; background: #F9FAFB;">
            <div style="font-weight: 700; color: #111827;">7. Automated Invariant Self-Test</div>
            <p style="color: #4B5563; margin: 4px 0 8px;">Run the continuous self-checking test suite verifying rounding invariants, ledger double-entry math, and XSS safety.</p>
            <a href="selftest.html" style="display: inline-block; background: #10B981; color: #fff; padding: 4px 12px; border-radius: 6px; text-decoration: none; font-weight: 600;">Run Automated Self-Test →</a>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);
  },

  renderBar() {
    // Top demo bar removed per user request: "yeah bar delete karo sai"
    const existing = document.getElementById('ameza-demo-topbar');
    if (existing) {
      existing.remove();
    }
  }
};

// Expose globally
if (typeof window !== 'undefined') {
  window.AmezaDemo = DemoController;
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => DemoController.init());
  } else {
    DemoController.init();
  }
}
