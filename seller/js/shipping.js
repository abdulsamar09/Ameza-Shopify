/**
 * AMEZA Seller Central — Shipping Zones, Rates & Vacation Mode Engine (js/shipping.js)
 * Manages regional postal zones, flat rates, handling times, free shipping thresholds,
 * and storefront Vacation Mode locks.
 * USA compliance: USD cents formatting, American English, USPS carrier standards.
 */

import { escapeHTML, showToast } from '/seller/js/dashboard-shell.js';
import { formatMoney } from '/shared/js/core/utils.js';

const SHIPPING_STORAGE_KEY = 'ameza_seller_shipping_config';
const VACATION_STORAGE_KEY = 'ameza_seller_vacation_mode';

export const US_REGIONS_STATES = {
  'Contiguous US': [
    'AL', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD', 'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ', 'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
  ],
  'Alaska and Hawaii': ['AK', 'HI'],
  'US Territories': ['PR', 'GU', 'VI', 'AS', 'MP']
};

export const DEFAULT_SHIPPING_CONFIG = {
  activeProfile: 'prof_general',
  profiles: [
    {
      id: 'prof_general',
      name: 'General profile (Default)',
      description: 'Standard domestic parcel rates for all catalog products',
      productCount: 48,
      zones: [
        {
          id: 'zone_contiguous',
          name: 'Contiguous United States (Lower 48)',
          states: US_REGIONS_STATES['Contiguous US'],
          rates: [
            { id: 'rate_1', name: 'Standard Delivery (USPS Ground Advantage)', condition: 'None', conditionValue: null, priceCents: 599 },
            { id: 'rate_2', name: 'Free Standard Shipping (Over $100)', condition: 'Order price >= $100.00', conditionValue: 10000, priceCents: 0 },
            { id: 'rate_3', name: 'Express Delivery (USPS Priority Mail)', condition: 'None', conditionValue: null, priceCents: 1299 },
            { id: 'rate_4', name: 'Overnight Air Courier', condition: 'None', conditionValue: null, priceCents: 2499 }
          ]
        },
        {
          id: 'zone_ak_hi',
          name: 'Alaska and Hawaii',
          states: US_REGIONS_STATES['Alaska and Hawaii'],
          rates: [
            { id: 'rate_5', name: 'Standard Non-Contiguous Delivery', condition: 'None', conditionValue: null, priceCents: 999 },
            { id: 'rate_6', name: 'Priority Non-Contiguous Express', condition: 'None', conditionValue: null, priceCents: 1999 }
          ]
        },
        {
          id: 'zone_territories',
          name: 'US Territories (PR, GU, VI)',
          states: US_REGIONS_STATES['US Territories'],
          rates: [
            { id: 'rate_7', name: 'Standard Postal Delivery', condition: 'None', conditionValue: null, priceCents: 1299 }
          ]
        }
      ]
    },
    {
      id: 'prof_fragile',
      name: 'Fragile & Bulky Goods',
      description: 'Heavy leather goods, delicate chronographs and crated merchandise',
      productCount: 3,
      zones: [
        {
          id: 'zone_fragile_us',
          name: 'All 50 US States',
          states: [...US_REGIONS_STATES['Contiguous US'], ...US_REGIONS_STATES['Alaska and Hawaii']],
          rates: [
            { id: 'rate_f1', name: 'Reinforced Insured Freight', condition: 'Order weight > 5 lb', conditionValue: 5, priceCents: 1899 },
            { id: 'rate_f2', name: 'Standard Crated Transit', condition: 'None', conditionValue: null, priceCents: 1499 }
          ]
        }
      ]
    }
  ],
  handlingTime: '1-2 days', // 'Same day' | '1-2 days' | '3-5 days'
  freeShippingThresholdCents: 10000 // $100.00
};

export function getShippingConfig() {
  try {
    const raw = localStorage.getItem(SHIPPING_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  localStorage.setItem(SHIPPING_STORAGE_KEY, JSON.stringify(DEFAULT_SHIPPING_CONFIG));
  return JSON.parse(JSON.stringify(DEFAULT_SHIPPING_CONFIG));
}

export function saveShippingConfig(cfg) {
  localStorage.setItem(SHIPPING_STORAGE_KEY, JSON.stringify(cfg));
}

export function getVacationMode() {
  try {
    const raw = localStorage.getItem(VACATION_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { enabled: false, startDate: '', endDate: '', message: 'Our workshop is taking a short seasonal break. Orders will resume dispatch soon.' };
}

export function saveVacationMode(vac) {
  localStorage.setItem(VACATION_STORAGE_KEY, JSON.stringify(vac));
}

export function initShipping() {
  const container = document.getElementById('shipping-content-container');
  if (!container) return;

  let config = getShippingConfig();
  let vacation = getVacationMode();
  let isDirty = false;

  function renderView() {
    const currentProfile = config.profiles.find(p => p.id === config.activeProfile) || config.profiles[0];
    const thresholdDollars = (config.freeShippingThresholdCents / 100).toFixed(2);
    
    // Live Progress Demo calculation: simulated cart at $87.50
    const sampleCartCents = 8750;
    const remainingCents = Math.max(0, config.freeShippingThresholdCents - sampleCartCents);
    const progressPercent = Math.min(100, Math.round((sampleCartCents / config.freeShippingThresholdCents) * 100));

    container.innerHTML = `
      <div class="shipping-page-wrapper">
        <!-- Top Page Header -->
        <div class="page-header" style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:16px; margin-bottom:20px;">
          <div>
            <h1 class="page-title" style="margin:0; font-size:24px; font-weight:800; color:var(--text-main);">Shipping</h1>
            <p class="page-subtitle" style="margin:4px 0 0; font-size:13px; color:var(--text-muted);">Configure regional delivery zones, USPS flat rates, handling windows, and vacation pauses.</p>
          </div>
          <div class="page-header-actions" style="display:flex; gap:10px;">
            <button type="button" id="btn-save-shipping-top" class="btn-header-primary"
              style="padding:10px 24px; border:none; background:var(--dark, #111827); color:#FFFFFF; border-radius:8px; font-size:13.5px; font-weight:700; cursor:pointer; min-height:44px; display:inline-flex; align-items:center; gap:8px;"
              ${!isDirty ? 'disabled style="opacity:0.6; cursor:not-allowed;"' : ''}>
              <i class="fa-solid fa-floppy-disk"></i>
              <span>Save</span>
            </button>
          </div>
        </div>

        <!-- Vacation Mode Amber Alert Banner (When Active) -->
        ${vacation.enabled ? `
          <div class="vacation-active-banner" style="display:flex; align-items:center; justify-content:space-between; padding:14px 18px; background:#FEF3C7; border:1px solid #F59E0B; border-radius:10px; margin-bottom:20px; color:#92400E; flex-wrap:wrap; gap:10px;">
            <div style="display:flex; align-items:center; gap:10px;">
              <span style="font-size:20px;">⏸️</span>
              <div>
                <strong style="font-size:14px;">Your store is currently paused (Vacation Mode)</strong>
                <div style="font-size:12.5px; margin-top:2px;">Product purchases are temporarily paused on the storefront: "${escapeHTML(vacation.message)}"</div>
              </div>
            </div>
            <button type="button" id="btn-resume-store" style="padding:6px 14px; border:1px solid #D97706; background:#fff; color:#92400E; border-radius:6px; font-size:12px; font-weight:700; cursor:pointer; min-height:36px;">
              Resume Store Now
            </button>
          </div>
        ` : ''}

        <!-- Section 1: Shipping Profiles Card -->
        <div class="dashboard-card" style="padding:22px; background:var(--bg-surface); border:1px solid var(--border); border-radius:12px; margin-bottom:20px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px; margin-bottom:16px;">
            <div>
              <h2 style="font-size:16px; font-weight:800; margin:0; color:var(--text-main);">Shipping Profiles</h2>
              <p style="font-size:13px; color:var(--text-muted); margin:4px 0 0;">Group different products into dedicated shipping rate classes.</p>
            </div>
            <button type="button" id="btn-create-profile" class="btn-subtle" style="padding:8px 14px; border:1px solid var(--border); background:var(--bg-surface); border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; min-height:44px; display:inline-flex; align-items:center; gap:6px;">
              <i class="fa-solid fa-plus"></i>
              <span>Create profile</span>
            </button>
          </div>

          <div class="profiles-list-grid" style="display:grid; grid-template-columns:repeat(auto-fit, minmax(280px, 1fr)); gap:14px;">
            ${config.profiles.map(prof => {
              const isActive = prof.id === config.activeProfile;
              return `
                <div class="profile-card-item ${isActive ? 'active-profile' : ''}" data-profile-id="${prof.id}"
                  style="padding:16px; border:2px solid ${isActive ? 'var(--primary, #7FB73C)' : 'var(--border)'}; border-radius:10px; background:${isActive ? 'rgba(127,183,60,0.04)' : 'var(--bg-surface)'}; cursor:pointer; transition:all 0.15s ease;">
                  <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                    <strong style="font-size:14px; color:var(--text-main);">${escapeHTML(prof.name)}</strong>
                    ${isActive ? '<span style="font-size:11px; font-weight:800; color:#059669; background:#D1FAE5; padding:2px 8px; border-radius:10px;">Editing</span>' : ''}
                  </div>
                  <p style="font-size:12px; color:var(--text-muted); margin:0 0 10px; line-height:1.4;">${escapeHTML(prof.description)}</p>
                  <div style="font-size:11.5px; font-weight:700; color:var(--text-secondary);">${prof.productCount} products assigned &bull; ${prof.zones.length} zone(s)</div>
                </div>
              `;
            }).join('')}
          </div>
        </div>

        <!-- Section 2: Active Profile Zones & Rates Editor -->
        <div class="dashboard-card" style="padding:22px; background:var(--bg-surface); border:1px solid var(--border); border-radius:12px; margin-bottom:20px;">
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:18px;">
            <div>
              <h2 style="font-size:16px; font-weight:800; margin:0; color:var(--text-main);">Shipping Zones &amp; Rates</h2>
              <p style="font-size:13px; color:var(--text-muted); margin:4px 0 0;">Configured for: <strong>${escapeHTML(currentProfile.name)}</strong></p>
            </div>
            <button type="button" id="btn-add-zone" class="btn-subtle" style="padding:8px 14px; border:1px solid var(--border); background:var(--bg-surface); border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; min-height:44px; display:inline-flex; align-items:center; gap:6px;">
              <i class="fa-solid fa-map-location-dot"></i>
              <span>Add zone</span>
            </button>
          </div>

          <!-- Zones Accordion / Cards List -->
          <div class="zones-container" style="display:flex; flex-direction:column; gap:20px;">
            ${currentProfile.zones.map((zone, zIdx) => `
              <div class="zone-card" style="border:1px solid var(--border); border-radius:10px; overflow:hidden;">
                <!-- Zone Header -->
                <div style="padding:14px 18px; background:var(--bg-surface-alt, #F8FAFC); border-bottom:1px solid var(--border); display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:10px;">
                  <div>
                    <strong style="font-size:14.5px; color:var(--text-main);">${escapeHTML(zone.name)}</strong>
                    <div style="font-size:12px; color:var(--text-muted); margin-top:2px;">
                      Includes ${zone.states.length} states/regions (${zone.states.slice(0, 8).join(', ')}${zone.states.length > 8 ? '...' : ''})
                    </div>
                  </div>
                  <div style="display:flex; gap:8px;">
                    <button type="button" class="btn-add-rate" data-zone-index="${zIdx}" style="padding:6px 12px; border:1px solid var(--border); background:#fff; border-radius:6px; font-size:12px; font-weight:700; cursor:pointer; min-height:36px;">
                      + Add rate
                    </button>
                    ${currentProfile.zones.length > 1 ? `
                      <button type="button" class="btn-delete-zone" data-zone-index="${zIdx}" style="border:none; background:none; color:#DC2626; font-size:13px; cursor:pointer; padding:6px 8px;">
                        <i class="fa-regular fa-trash-can"></i>
                      </button>
                    ` : ''}
                  </div>
                </div>

                <!-- Rates Table (Desktop) / Cards (Mobile) -->
                <div class="table-responsive">
                  <table class="rates-table" style="width:100%; border-collapse:collapse; font-size:13px;">
                    <thead>
                      <tr style="text-align:left; border-bottom:1px solid var(--border); font-size:12px; color:var(--text-muted); background:var(--bg-surface);">
                        <th style="padding:10px 16px;">Rate Name</th>
                        <th style="padding:10px 16px;">Condition</th>
                        <th style="padding:10px 16px; text-align:right;">Price</th>
                        <th style="padding:10px 16px; width:44px;"></th>
                      </tr>
                    </thead>
                    <tbody>
                      ${zone.rates.map((rate, rIdx) => `
                        <tr style="border-bottom:1px solid var(--border-subtle, #F1F5F9);">
                          <td style="padding:12px 16px;">
                            <input type="text" class="input-rate-name" data-zone-index="${zIdx}" data-rate-index="${rIdx}" value="${escapeHTML(rate.name)}"
                              style="width:100%; max-width:280px; padding:6px 10px; border:1px solid var(--border); border-radius:6px; font-size:13px; font-weight:600; color:var(--text-main); background:var(--bg-page);">
                          </td>
                          <td style="padding:12px 16px; color:var(--text-secondary);">
                            <select class="select-rate-cond" data-zone-index="${zIdx}" data-rate-index="${rIdx}" style="padding:6px 10px; border:1px solid var(--border); border-radius:6px; font-size:12.5px; background:var(--bg-page); color:var(--text-main);">
                              <option value="None" ${rate.condition === 'None' ? 'selected' : ''}>No conditions</option>
                              <option value="price" ${rate.condition.includes('price') ? 'selected' : ''}>Order price based</option>
                              <option value="weight" ${rate.condition.includes('weight') ? 'selected' : ''}>Weight tier (lb)</option>
                            </select>
                          </td>
                          <td style="padding:12px 16px; text-align:right;">
                            <div style="display:inline-flex; align-items:center; gap:4px;">
                              <span style="font-weight:700; color:var(--text-muted);">$</span>
                              <input type="number" step="0.01" min="0" class="input-rate-price" data-zone-index="${zIdx}" data-rate-index="${rIdx}" value="${(rate.priceCents / 100).toFixed(2)}"
                                style="width:84px; padding:6px 8px; border:1px solid var(--border); border-radius:6px; font-size:14px; font-weight:700; text-align:right; color:var(--text-main); background:var(--bg-page);">
                            </div>
                          </td>
                          <td style="padding:12px 16px; text-align:right;">
                            <button type="button" class="btn-delete-rate" data-zone-index="${zIdx}" data-rate-index="${rIdx}" style="border:none; background:none; color:var(--text-muted); cursor:pointer; padding:6px;" title="Remove rate">
                              &times;
                            </button>
                          </td>
                        </tr>
                      `).join('')}
                    </tbody>
                  </table>
                </div>
              </div>
            `).join('')}
          </div>
        </div>

        <!-- Section 3 & 4 Grid: Handling Time & Free Shipping Threshold -->
        <div style="display:grid; grid-template-columns:repeat(auto-fit, minmax(320px, 1fr)); gap:20px; margin-bottom:20px;">
          <!-- Card 3: Handling Time -->
          <div class="dashboard-card" style="padding:22px; background:var(--bg-surface); border:1px solid var(--border); border-radius:12px;">
            <h2 style="font-size:15px; font-weight:800; margin:0 0 6px; color:var(--text-main);">Handling Time</h2>
            <p style="font-size:12.5px; color:var(--text-muted); margin:0 0 14px;">Lead time required between buyer checkout and postal carrier dispatch scan.</p>
            
            <div style="display:flex; flex-direction:column; gap:10px;">
              ${['Same day', '1-2 days', '3-5 days'].map(opt => `
                <label style="display:flex; align-items:center; gap:10px; padding:10px 14px; border:1px solid ${config.handlingTime === opt ? 'var(--primary, #7FB73C)' : 'var(--border)'}; border-radius:8px; cursor:pointer; background:${config.handlingTime === opt ? 'rgba(127,183,60,0.04)' : 'transparent'};">
                  <input type="radio" name="handling-time-opt" value="${opt}" ${config.handlingTime === opt ? 'checked' : ''} style="width:18px; height:18px;">
                  <div>
                    <strong style="font-size:13.5px; color:var(--text-main);">${opt} dispatch</strong>
                    <div style="font-size:11.5px; color:var(--text-muted);">${opt === 'Same day' ? 'Orders before 2 PM ET ship out same afternoon' : opt === '1-2 days' ? 'Standard domestic merchant fulfillment window' : 'Made-to-order artisan merchandise'}</div>
                  </div>
                </label>
              `).join('')}
            </div>
          </div>

          <!-- Card 4: Free Shipping Threshold & Live Cart Bar Preview -->
          <div class="dashboard-card" style="padding:22px; background:var(--bg-surface); border:1px solid var(--border); border-radius:12px;">
            <h2 style="font-size:15px; font-weight:800; margin:0 0 6px; color:var(--text-main);">Free Shipping Threshold</h2>
            <p style="font-size:12.5px; color:var(--text-muted); margin:0 0 14px;">Minimum cart subtotal to unlock 100% free standard USPS parcel shipping.</p>

            <div style="margin-bottom:16px;">
              <label style="display:block; font-size:12px; font-weight:700; color:var(--text-muted); margin-bottom:4px;">Threshold Amount (USD)</label>
              <div style="position:relative; max-width:180px;">
                <span style="position:absolute; left:12px; top:50%; transform:translateY(-50%); font-weight:700; color:var(--text-muted);">$</span>
                <input type="number" id="input-shipping-threshold" step="5" min="0" value="${thresholdDollars}"
                  style="width:100%; padding:10px 12px 10px 28px; border:1px solid var(--border); border-radius:8px; font-size:16px; font-weight:700; background:var(--bg-page); color:var(--text-main); box-sizing:border-box;">
              </div>
            </div>

            <!-- Live Cart Drawer Progress Bar Preview -->
            <div style="padding:14px; border:1px dashed var(--primary, #7FB73C); border-radius:10px; background:var(--bg-surface-alt, #F8FAF7);">
              <span style="font-size:11px; font-weight:800; text-transform:uppercase; color:var(--primary, #7FB73C); letter-spacing:0.5px; display:block; margin-bottom:6px;">Live Cart Preview (Sample $87.50 Cart)</span>
              
              <div id="preview-threshold-text" style="font-size:12.5px; font-weight:700; color:var(--text-main); margin-bottom:6px;">
                Add ${formatMoney(remainingCents)} more for FREE shipping!
              </div>

              <!-- Animated Progress Bar -->
              <div style="width:100%; height:8px; background:#E2E8F0; border-radius:99px; overflow:hidden;">
                <div id="preview-progress-fill" style="width:${progressPercent}%; height:100%; background:var(--primary, #7FB73C); transition:width 0.3s ease;"></div>
              </div>
            </div>
          </div>
        </div>

        <!-- Section 5: Vacation Mode Card -->
        <div class="dashboard-card" style="padding:22px; background:var(--bg-surface); border:1px solid var(--border); border-radius:12px;">
          <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:12px; margin-bottom:14px;">
            <div>
              <h2 style="font-size:15px; font-weight:800; margin:0 0 4px; color:var(--text-main);">Vacation Mode</h2>
              <p style="font-size:13px; color:var(--text-muted); margin:0;">Temporarily pause store listings and checkout purchases while you take time away.</p>
            </div>
            <label style="position:relative; display:inline-block; width:50px; height:26px; cursor:pointer;">
              <input type="checkbox" id="chk-vacation-toggle" ${vacation.enabled ? 'checked' : ''} style="opacity:0; width:0; height:0;">
              <span class="vacation-switch-slider" style="position:absolute; inset:0; background:${vacation.enabled ? 'var(--primary, #7FB73C)' : '#CBD5E1'}; border-radius:26px; transition:0.2s;"></span>
              <span style="position:absolute; top:3px; left:${vacation.enabled ? '27px' : '3px'}; width:20px; height:20px; background:#fff; border-radius:50%; transition:0.2s;"></span>
            </label>
          </div>

          <div id="vacation-details-fields" style="display:${vacation.enabled ? 'block' : 'none'}; padding-top:10px; border-top:1px solid var(--border);">
            <div style="margin-bottom:12px;">
              <label style="display:block; font-size:12px; font-weight:700; color:var(--text-muted); margin-bottom:4px;">Store Notice Message to Buyers</label>
              <input type="text" id="input-vacation-msg" value="${escapeHTML(vacation.message)}"
                style="width:100%; padding:10px 12px; border:1px solid var(--border); border-radius:8px; font-size:14px; background:var(--bg-page); color:var(--text-main); box-sizing:border-box;">
            </div>
            <div style="display:grid; grid-template-columns:1fr 1fr; gap:12px; max-width:400px;">
              <div>
                <label style="display:block; font-size:12px; font-weight:700; color:var(--text-muted); margin-bottom:4px;">Pause From</label>
                <input type="date" id="input-vacation-start" value="${vacation.startDate || '2026-10-10'}" style="width:100%; height:40px; padding:0 10px; border:1px solid var(--border); border-radius:6px; background:var(--bg-page); color:var(--text-main); font-size:14px; box-sizing:border-box;">
              </div>
              <div>
                <label style="display:block; font-size:12px; font-weight:700; color:var(--text-muted); margin-bottom:4px;">Resume Date</label>
                <input type="date" id="input-vacation-end" value="${vacation.endDate || '2026-10-25'}" style="width:100%; height:40px; padding:0 10px; border:1px solid var(--border); border-radius:6px; background:var(--bg-page); color:var(--text-main); font-size:14px; box-sizing:border-box;">
              </div>
            </div>
          </div>
        </div>

        <!-- Sticky Unsaved Changes Footer Bar -->
        <div id="shipping-sticky-save-bar" style="display:${isDirty ? 'flex' : 'none'}; position:sticky; bottom:16px; background:var(--dark, #111827); color:#fff; padding:14px 20px; border-radius:10px; box-shadow:0 8px 30px rgba(0,0,0,0.3); justify-content:space-between; align-items:center; z-index:90; margin-top:24px;">
          <span style="font-size:13.5px; font-weight:600;">You have unsaved changes in your shipping configuration</span>
          <div style="display:flex; gap:10px;">
            <button type="button" id="btn-discard-shipping" style="padding:8px 14px; border:1px solid rgba(255,255,255,0.2); background:transparent; color:#fff; border-radius:6px; font-size:12.5px; font-weight:700; cursor:pointer;">Discard</button>
            <button type="button" id="btn-save-shipping-sticky" style="padding:8px 20px; border:none; background:var(--primary, #7FB73C); color:#fff; border-radius:6px; font-size:13px; font-weight:700; cursor:pointer;">Save changes</button>
          </div>
        </div>
      </div>

      <!-- Add Zone Modal -->
      <div id="add-zone-modal" class="returns-modal-backdrop" style="display:none;">
        <div class="returns-modal-dialog" style="background:var(--bg-surface); padding:24px; border-radius:12px; max-width:520px; width:92%; margin:40px auto; border:1px solid var(--border); box-shadow:0 12px 36px rgba(0,0,0,0.2);">
          <h3 style="font-size:17px; font-weight:800; margin:0 0 6px; color:var(--text-main);">Add Shipping Zone</h3>
          <p style="font-size:13px; color:var(--text-secondary); margin:0 0 16px;">Specify a zone title and select US states/territories to include.</p>

          <div style="margin-bottom:14px;">
            <label style="display:block; font-size:12px; font-weight:700; margin-bottom:4px; color:var(--text-main);">Zone Name *</label>
            <input type="text" id="input-new-zone-name" placeholder="e.g. West Coast Express" style="width:100%; padding:10px 12px; border:1px solid var(--border); border-radius:8px; font-size:14px; background:var(--bg-page); color:var(--text-main); box-sizing:border-box;">
          </div>

          <div style="margin-bottom:16px;">
            <label style="display:block; font-size:12px; font-weight:700; margin-bottom:6px; color:var(--text-main);">Select US States (Searchable Multi-Select)</label>
            <input type="text" id="input-search-states" placeholder="Filter states (e.g. CA, NY, TX)..." style="width:100%; padding:8px 12px; border:1px solid var(--border); border-radius:6px; font-size:13px; margin-bottom:8px; background:var(--bg-page); color:var(--text-main); box-sizing:border-box;">
            
            <div id="zone-states-checkbox-list" style="max-height:180px; overflow-y:auto; border:1px solid var(--border); border-radius:6px; padding:10px; display:grid; grid-template-columns:repeat(auto-fill, minmax(70px, 1fr)); gap:6px;">
              ${Object.values(US_REGIONS_STATES).flat().map(st => `
                <label class="state-chk-label" style="display:flex; align-items:center; gap:4px; font-size:12px; cursor:pointer;">
                  <input type="checkbox" value="${st}" checked class="chk-zone-state">
                  <span>${st}</span>
                </label>
              `).join('')}
            </div>
          </div>

          <div style="display:flex; justify-content:flex-end; gap:10px;">
            <button type="button" id="btn-cancel-add-zone" style="padding:10px 16px; border:1px solid var(--border); background:none; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; min-height:44px;">Cancel</button>
            <button type="button" id="btn-confirm-add-zone" style="padding:10px 20px; border:none; background:var(--dark, #111827); color:#fff; border-radius:8px; font-size:13px; font-weight:700; cursor:pointer; min-height:44px;">Create Zone</button>
          </div>
        </div>
      </div>
    `;

    bindEvents();
  }

  function bindEvents() {
    // 1. Profile switching
    container.querySelectorAll('.profile-card-item').forEach(card => {
      card.addEventListener('click', () => {
        config.activeProfile = card.getAttribute('data-profile-id');
        renderView();
      });
    });

    // 2. Mark Dirty helper
    const markDirty = () => {
      isDirty = true;
      const topBtn = document.getElementById('btn-save-shipping-top');
      if (topBtn) {
        topBtn.removeAttribute('disabled');
        topBtn.style.opacity = '1';
        topBtn.style.cursor = 'pointer';
      }
      const stickyBar = document.getElementById('shipping-sticky-save-bar');
      if (stickyBar) stickyBar.style.display = 'flex';
    };

    // 3. Rate editing inputs
    container.querySelectorAll('.input-rate-name').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const zIdx = parseInt(e.target.getAttribute('data-zone-index'), 10);
        const rIdx = parseInt(e.target.getAttribute('data-rate-index'), 10);
        const prof = config.profiles.find(p => p.id === config.activeProfile);
        if (prof?.zones[zIdx]?.rates[rIdx]) {
          prof.zones[zIdx].rates[rIdx].name = e.target.value;
          markDirty();
        }
      });
    });

    container.querySelectorAll('.input-rate-price').forEach(inp => {
      inp.addEventListener('input', (e) => {
        const zIdx = parseInt(e.target.getAttribute('data-zone-index'), 10);
        const rIdx = parseInt(e.target.getAttribute('data-rate-index'), 10);
        const val = parseFloat(e.target.value) || 0;
        const prof = config.profiles.find(p => p.id === config.activeProfile);
        if (prof?.zones[zIdx]?.rates[rIdx]) {
          prof.zones[zIdx].rates[rIdx].priceCents = Math.round(val * 100);
          markDirty();
        }
      });
    });

    container.querySelectorAll('.select-rate-cond').forEach(sel => {
      sel.addEventListener('change', (e) => {
        const zIdx = parseInt(e.target.getAttribute('data-zone-index'), 10);
        const rIdx = parseInt(e.target.getAttribute('data-rate-index'), 10);
        const prof = config.profiles.find(p => p.id === config.activeProfile);
        if (prof?.zones[zIdx]?.rates[rIdx]) {
          prof.zones[zIdx].rates[rIdx].condition = e.target.value;
          markDirty();
        }
      });
    });

    // 4. Delete rate
    container.querySelectorAll('.btn-delete-rate').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const zIdx = parseInt(btn.getAttribute('data-zone-index'), 10);
        const rIdx = parseInt(btn.getAttribute('data-rate-index'), 10);
        const prof = config.profiles.find(p => p.id === config.activeProfile);
        if (prof?.zones[zIdx]?.rates) {
          prof.zones[zIdx].rates.splice(rIdx, 1);
          markDirty();
          renderView();
        }
      });
    });

    // 5. Add rate to zone
    container.querySelectorAll('.btn-add-rate').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const zIdx = parseInt(btn.getAttribute('data-zone-index'), 10);
        const prof = config.profiles.find(p => p.id === config.activeProfile);
        if (prof?.zones[zIdx]) {
          prof.zones[zIdx].rates.push({
            id: 'rate_' + Date.now(),
            name: 'Standard Courier',
            condition: 'None',
            conditionValue: null,
            priceCents: 599
          });
          markDirty();
          renderView();
        }
      });
    });

    // 6. Delete zone
    container.querySelectorAll('.btn-delete-zone').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const zIdx = parseInt(btn.getAttribute('data-zone-index'), 10);
        const prof = config.profiles.find(p => p.id === config.activeProfile);
        if (prof && prof.zones.length > 1) {
          prof.zones.splice(zIdx, 1);
          markDirty();
          renderView();
        }
      });
    });

    // 7. Add zone modal
    const addZoneBtn = document.getElementById('btn-add-zone');
    const addZoneModal = document.getElementById('add-zone-modal');
    if (addZoneBtn && addZoneModal) {
      addZoneBtn.addEventListener('click', () => {
        addZoneModal.style.display = 'block';
      });

      document.getElementById('btn-cancel-add-zone')?.addEventListener('click', () => {
        addZoneModal.style.display = 'none';
      });

      document.getElementById('input-search-states')?.addEventListener('input', (e) => {
        const q = e.target.value.toUpperCase();
        addZoneModal.querySelectorAll('.state-chk-label').forEach(lbl => {
          lbl.style.display = lbl.textContent.toUpperCase().includes(q) ? 'flex' : 'none';
        });
      });

      document.getElementById('btn-confirm-add-zone')?.addEventListener('click', () => {
        const name = document.getElementById('input-new-zone-name')?.value.trim() || 'Custom US Zone';
        const states = Array.from(addZoneModal.querySelectorAll('.chk-zone-state:checked')).map(c => c.value);
        const prof = config.profiles.find(p => p.id === config.activeProfile);
        if (prof) {
          prof.zones.push({
            id: 'zone_' + Date.now(),
            name,
            states: states.length > 0 ? states : ['CA', 'OR', 'WA'],
            rates: [
              { id: 'rate_' + Date.now(), name: 'Standard Rate', condition: 'None', conditionValue: null, priceCents: 699 }
            ]
          });
          markDirty();
          addZoneModal.style.display = 'none';
          renderView();
        }
      });
    }

    // 8. Handling Time Radios
    container.querySelectorAll('input[name="handling-time-opt"]').forEach(r => {
      r.addEventListener('change', (e) => {
        config.handlingTime = e.target.value;
        markDirty();
      });
    });

    // 9. Free shipping threshold input
    const threshInput = document.getElementById('input-shipping-threshold');
    if (threshInput) {
      threshInput.addEventListener('input', (e) => {
        const val = parseFloat(e.target.value) || 0;
        config.freeShippingThresholdCents = Math.round(val * 100);
        markDirty();

        // Update live preview dynamically
        const sampleCartCents = 8750;
        const remaining = Math.max(0, config.freeShippingThresholdCents - sampleCartCents);
        const pct = Math.min(100, Math.round((sampleCartCents / config.freeShippingThresholdCents) * 100));
        
        const previewTxt = document.getElementById('preview-threshold-text');
        if (previewTxt) {
          previewTxt.textContent = remaining > 0 ? `Add ${formatMoney(remaining)} more for FREE shipping!` : 'Unlocked! You have FREE shipping!';
        }
        const previewFill = document.getElementById('preview-progress-fill');
        if (previewFill) {
          previewFill.style.width = `${pct}%`;
        }
      });
    }

    // 10. Vacation mode toggle
    const vacToggle = document.getElementById('chk-vacation-toggle');
    if (vacToggle) {
      vacToggle.addEventListener('change', (e) => {
        vacation.enabled = e.target.checked;
        saveVacationMode(vacation);
        showToast(vacation.enabled ? 'Vacation mode activated. Storefront purchasing paused.' : 'Vacation mode turned off.', vacation.enabled ? 'warning' : 'success');
        renderView();
      });
    }

    // Resume store button from banner
    document.getElementById('btn-resume-store')?.addEventListener('click', () => {
      vacation.enabled = false;
      saveVacationMode(vacation);
      showToast('Store reopened! Product sales resumed.', 'success');
      renderView();
    });

    // 11. Vacation message & dates
    document.getElementById('input-vacation-msg')?.addEventListener('input', (e) => {
      vacation.message = e.target.value;
      saveVacationMode(vacation);
    });

    // 12. Save shipping config handlers
    const doSave = () => {
      saveShippingConfig(config);
      isDirty = false;
      showToast('Shipping profiles and rates saved successfully!', 'success');
      renderView();
    };

    document.getElementById('btn-save-shipping-top')?.addEventListener('click', doSave);
    document.getElementById('btn-save-shipping-sticky')?.addEventListener('click', doSave);

    document.getElementById('btn-discard-shipping')?.addEventListener('click', () => {
      config = getShippingConfig();
      isDirty = false;
      showToast('Unsaved shipping changes discarded', 'info');
      renderView();
    });
  }

  renderView();
}
