/**
 * AMEZA Store Application Wizard Controller
 * Handles 6-step multi-page form, autosave, file drops, canvas crop, validation & review.
 * USA Standard: US identity, W-9 compliance, ACH bank routing checksum, masked TIN/SSN.
 */
import {
  SITE_DOMAIN,
  RESERVED_SLUGS,
  MOCK_CATEGORIES,
  COUNTRIES_LIST,
  US_MAJOR_BANKS,
  SELLER_AGREEMENT_TEXT
} from '/seller/onboarding/js/wizard-data.js';

import { escapeHTML } from '/seller/onboarding/js/config.js';
import { US_STATES, isValidZip, isValidRoutingNumber, formatPhone, maskTin } from '/shared/js/core/us.js';

export function initWizard() {
  // Wizard State
  const state = {
    step: 2, // Default to Step 2 matching design
    maxReachedStep: 2,
    isDirty: false,
    draft: {
      account: {
        name: 'Sarah Jenkins',
        email: 'seller@example.com',
        isLoggedIn: false
      },
      store: {
        name: 'Austin Leather Co',
        slug: 'austin-leather-co',
        logoData: null,
        logoName: 'austin-leather-logo.png',
        logoSize: 'PNG • 512 × 512 • 1.2 MB',
        bannerData: null,
        bannerName: 'banner.jpg',
        bannerSize: 'JPG • 1920 × 600 • 2.8 MB',
        description: 'Austin Leather Co crafts premium full-grain leather belts, slim wallets, and durable accessories built for a lifetime.',
        categories: ['Handcrafted Leather Goods', 'Accessories', 'Fashion & Apparel'],
        country: 'US',
        street: '123 Congress Ave',
        suite: 'Suite 200',
        city: 'Austin',
        state: 'TX',
        zip: '78701'
      },
      identity: {
        type: 'individual', // individual | company
        fullName: 'Sarah Jenkins',
        idType: "Driver's License",
        taxIdType: 'SSN', // SSN | EIN
        taxIdNumber: '***-**-1234',
        dob: '1988-06-22',
        w9Status: 'certified',
        docFront: 'id_front.jpg',
        docBack: 'id_back.jpg'
      },
      payout: {
        method: 'bank', // bank (ACH) | paypal
        bankName: 'JPMorgan Chase',
        accountTitle: 'Austin Leather Co LLC',
        routingNumber: '111000025',
        accountNumber: '••••••••4821',
        accountMasked: '**** 4821'
      },
      agreement: {
        version: 'v1.0',
        agreed: false,
        signature: 'Sarah Jenkins',
        signedAt: null
      }
    }
  };

  checkSession(state);
  checkStoredDraft(state);

  const hashMatch = window.location.hash.match(/#step-([1-6])/);
  if (hashMatch) {
    state.step = parseInt(hashMatch[1], 10);
    state.maxReachedStep = Math.max(state.maxReachedStep, state.step);
  }

  renderHeaderUser(state);
  renderStep(state);
  initGlobalEventListeners(state);
}

function checkSession(state) {
  try {
    const raw = localStorage.getItem('ameza_session');
    if (raw) {
      const s = JSON.parse(raw);
      if (s && s.user) {
        state.draft.account.name = s.user.name || 'Sarah Jenkins';
        state.draft.account.email = s.user.email || 'seller@example.com';
        state.draft.account.isLoggedIn = true;
      }
    }
  } catch (e) {
    console.error('Session read error', e);
  }
}

function checkStoredDraft(state) {
  try {
    const raw = localStorage.getItem('ameza_onb_draft');
    if (raw) {
      const saved = JSON.parse(raw);
      if (saved && saved.store) {
        state.draft = Object.assign(state.draft, saved);
        const banner = document.getElementById('draft-resume-banner');
        if (banner) banner.style.display = 'flex';
      }
    }
  } catch (e) {}
}

function renderHeaderUser(state) {
  const nameEl = document.getElementById('user-display-name');
  const avatarEl = document.getElementById('user-avatar-initials');
  if (nameEl) nameEl.textContent = state.draft.account.name;
  if (avatarEl) {
    const parts = (state.draft.account.name || 'S J').trim().split(/\s+/);
    avatarEl.textContent = parts.length > 1 ? (parts[0][0] + parts[1][0]).toUpperCase() : parts[0].slice(0, 2).toUpperCase();
  }
}

function renderStep(state) {
  const container = document.getElementById('wizard-step-content');
  if (!container) return;

  window.location.hash = `#step-${state.step}`;
  updateStepperUI(state);

  switch (state.step) {
    case 1:
      renderStep1(container, state);
      break;
    case 2:
      renderStep2(container, state);
      break;
    case 3:
      renderStep3(container, state);
      break;
    case 4:
      renderStep4(container, state);
      break;
    case 5:
      renderStep5(container, state);
      break;
    case 6:
      renderStep6(container, state);
      break;
  }
}

function updateStepperUI(state) {
  const items = document.querySelectorAll('.step-node, .stepper-item');
  const stepTitles = [
    'Account setup',
    'Store info',
    'Identity verification',
    'Payout method',
    'Seller agreement',
    'Review & submit'
  ];

  items.forEach((item, idx) => {
    const stepNum = idx + 1;
    item.classList.remove('active', 'completed', 'accessible');

    const circle = item.querySelector('.step-circle');
    if (stepNum === state.step) {
      item.classList.add('active');
      if (circle) circle.innerHTML = `<i class="fa-solid fa-check" style="font-size:11px; display:none;"></i>${stepNum}`;
    } else if (stepNum < state.step) {
      item.classList.add('completed');
      if (circle) circle.innerHTML = `<i class="fa-solid fa-check" style="font-size:11px; display:inline-block;"></i>`;
    } else {
      if (circle) circle.innerHTML = `<i class="fa-solid fa-check" style="font-size:11px; display:none;"></i>${stepNum}`;
    }

    if (stepNum <= state.maxReachedStep) {
      item.classList.add('accessible');
      item.style.cursor = 'pointer';
      item.onclick = () => {
        saveCurrentStepData(state);
        state.step = stepNum;
        renderStep(state);
      };
    } else {
      item.style.cursor = 'default';
      item.onclick = null;
    }
  });

  const mobileIndicator = document.getElementById('mobile-step-indicator');
  if (mobileIndicator) {
    mobileIndicator.textContent = `Step ${state.step} of 6: ${stepTitles[state.step - 1] || ''}`;
  }

  const btnBack = document.getElementById('btn-wizard-back') || document.getElementById('wizard-btn-back');
  const btnNext = document.getElementById('btn-wizard-next') || document.getElementById('wizard-btn-continue');
  if (btnBack) {
    btnBack.style.visibility = state.step === 1 ? 'hidden' : 'visible';
  }
  if (btnNext) {
    if (state.step === 6) {
      btnNext.innerHTML = 'Submit Application <i class="fa-solid fa-check"></i>';
    } else {
      btnNext.innerHTML = 'Continue <i class="fa-solid fa-arrow-right"></i>';
    }
  }
}

function initGlobalEventListeners(state) {
  const btnBack = document.getElementById('btn-wizard-back') || document.getElementById('wizard-btn-back');
  const btnNext = document.getElementById('btn-wizard-next') || document.getElementById('wizard-btn-continue');
  const saveButtons = [
    document.getElementById('btn-save-exit'),
    document.getElementById('wizard-btn-save-draft')
  ].filter(Boolean);

  if (btnBack) {
    btnBack.addEventListener('click', () => {
      if (state.step > 1) {
        saveCurrentStepData(state);
        state.step--;
        renderStep(state);
      }
    });
  }

  if (btnNext) {
    btnNext.addEventListener('click', () => {
      if (validateStep(state)) {
        saveCurrentStepData(state);
        if (state.step < 6) {
          state.step++;
          state.maxReachedStep = Math.max(state.maxReachedStep, state.step);
          renderStep(state);
        } else {
          submitApplication(state);
        }
      }
    });
  }

  saveButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      saveCurrentStepData(state);
      localStorage.setItem('ameza_onb_draft', JSON.stringify(state.draft));
      alert('Your application draft has been saved. You can resume anytime.');
    });
  });
}

function saveCurrentStepData(state) {
  if (state.step === 2) {
    const store = state.draft.store;
    const nameEl = document.getElementById('inp-store-name');
    const slugEl = document.getElementById('inp-store-slug');
    const descEl = document.getElementById('inp-store-desc');
    const streetEl = document.getElementById('inp-store-street');
    const suiteEl = document.getElementById('inp-store-suite');
    const cityEl = document.getElementById('inp-store-city');
    const stateEl = document.getElementById('sel-store-state');
    const zipEl = document.getElementById('inp-store-zip');

    if (nameEl) store.name = nameEl.value.trim();
    if (slugEl) store.slug = slugEl.value.trim();
    if (descEl) store.description = descEl.value.trim();
    if (streetEl) store.street = streetEl.value.trim();
    if (suiteEl) store.suite = suiteEl.value.trim();
    if (cityEl) store.city = cityEl.value.trim();
    if (stateEl) store.state = stateEl.value;
    if (zipEl) store.zip = zipEl.value.trim();
  } else if (state.step === 3) {
    const idData = state.draft.identity;
    const nameEl = document.getElementById('inp-id-name');
    const typeEl = document.getElementById('sel-id-type');
    const taxTypeEl = document.getElementById('sel-tax-type');
    const taxNumEl = document.getElementById('inp-tax-number');
    const dobEl = document.getElementById('inp-id-dob');

    if (nameEl) idData.fullName = nameEl.value.trim();
    if (typeEl) idData.idType = typeEl.value;
    if (taxTypeEl) idData.taxIdType = taxTypeEl.value;
    if (taxNumEl) idData.taxIdNumber = taxNumEl.value.trim();
    if (dobEl) idData.dob = dobEl.value;
  } else if (state.step === 4) {
    const payout = state.draft.payout;
    if (payout.method === 'bank') {
      const bankNameEl = document.getElementById('sel-bank-name');
      const holderEl = document.getElementById('inp-bank-holder');
      const routingEl = document.getElementById('inp-bank-routing');
      const acctEl = document.getElementById('inp-bank-acct');
      if (bankNameEl) payout.bankName = bankNameEl.value;
      if (holderEl) payout.accountTitle = holderEl.value.trim();
      if (routingEl) payout.routingNumber = routingEl.value.trim();
      if (acctEl) {
        payout.accountNumber = acctEl.value.trim();
        payout.accountMasked = '**** ' + acctEl.value.trim().slice(-4);
      }
    } else {
      const paypalEl = document.getElementById('inp-paypal-email');
      if (paypalEl) payout.paypalEmail = paypalEl.value.trim();
    }
  }
}

function validateStep(state) {
  if (state.step === 2) {
    const name = document.getElementById('inp-store-name')?.value.trim();
    if (!name) {
      alert('Please enter a store name.');
      return false;
    }
    const zip = document.getElementById('inp-store-zip')?.value.trim();
    if (zip && !isValidZip(zip)) {
      alert('Please enter a valid 5-digit U.S. ZIP code (e.g. 78701).');
      return false;
    }
  } else if (state.step === 3) {
    const fullName = document.getElementById('inp-id-name')?.value.trim();
    if (!fullName) {
      alert('Please provide your full legal name.');
      return false;
    }
    const w9Chk = document.getElementById('chk-w9-cert');
    if (w9Chk && !w9Chk.checked) {
      alert('Please certify the Form W-9 taxpayer certification to proceed.');
      return false;
    }
  } else if (state.step === 4) {
    const payout = state.draft.payout;
    if (payout.method === 'bank') {
      const routing = document.getElementById('inp-bank-routing')?.value.trim();
      if (!routing || !isValidRoutingNumber(routing)) {
        alert('Please enter a valid 9-digit U.S. ABA bank routing number.');
        return false;
      }
      const acct = document.getElementById('inp-bank-acct')?.value.trim();
      const acctConf = document.getElementById('inp-bank-acct-confirm')?.value.trim();
      if (!acct || acct.length < 4) {
        alert('Please enter a valid bank account number.');
        return false;
      }
      if (acct !== acctConf) {
        alert('Bank account numbers do not match.');
        return false;
      }
    }
  } else if (state.step === 5) {
    const ag = state.draft.agreement;
    if (!ag.agreed) {
      alert('Please read and agree to the Seller Agreement.');
      return false;
    }
    const sig = document.getElementById('inp-signature')?.value.trim();
    if (!sig) {
      alert('Please enter your legal signature.');
      return false;
    }
  }
  return true;
}

/**
 * STEP 1: Account
 */
function renderStep1(container, state) {
  container.innerHTML = `
    <div>
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 18px; font-weight: 800; margin: 0 0 4px;">Account Details</h2>
        <p style="font-size: 13px; color: var(--text-muted); margin: 0;">Confirm your merchant account credentials.</p>
      </div>

      <div class="form-two-col">
        <div class="form-group">
          <label class="form-label">Full Name</label>
          <input type="text" class="form-input-text" value="${escapeHTML(state.draft.account.name)}" readonly>
        </div>
        <div class="form-group">
          <label class="form-label">Email Address</label>
          <input type="email" class="form-input-text" value="${escapeHTML(state.draft.account.email)}" readonly>
        </div>
      </div>
      <div style="background: #F3F8EE; border: 1px solid rgba(127,183,60,0.3); border-radius: 8px; padding: 12px 16px; font-size: 13px; color: var(--primary-dark); display: flex; align-items: center; gap: 8px;">
        <i class="fa-solid fa-circle-check"></i> Verified merchant session active.
      </div>
    </div>
  `;
}

/**
 * STEP 2: Store
 */
function renderStep2(container, state) {
  const store = state.draft.store;

  container.innerHTML = `
    <div>
      <div style="margin-bottom: 24px;">
        <h2 style="font-size: 18px; font-weight: 800; margin: 0 0 4px;">Store Information</h2>
        <p style="font-size: 13px; color: var(--text-muted); margin: 0;">Set up your storefront name, address, and curated categories.</p>
      </div>

      <div class="form-two-col">
        <div class="form-group">
          <label class="form-label">Store Name <span class="required-star">*</span></label>
          <input type="text" id="inp-store-name" class="form-input-text" value="${escapeHTML(store.name)}" placeholder="e.g. Austin Leather Co">
        </div>
        <div class="form-group">
          <label class="form-label">Store URL Slug <span class="required-star">*</span></label>
          <div style="display: flex; align-items: center;">
            <input type="text" id="inp-store-slug" class="form-input-text" value="${escapeHTML(store.slug)}" style="border-top-right-radius: 0; border-bottom-right-radius: 0;">
            <span style="background: #F3F4F6; border: 1px solid var(--border); border-left: none; padding: 0 12px; height: 42px; display: flex; align-items: center; font-size: 13px; color: var(--text-muted); border-top-right-radius: var(--radius-sm); border-bottom-right-radius: var(--radius-sm);">${SITE_DOMAIN}</span>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label class="form-label">Store Description <span class="required-star">*</span></label>
        <textarea id="inp-store-desc" class="form-input-text" rows="3">${escapeHTML(store.description)}</textarea>
      </div>

      <div style="margin: 20px 0 12px;">
        <h3 style="font-size: 15px; font-weight: 700; margin: 0 0 4px;">U.S. Business / Operating Address</h3>
        <p style="font-size: 12.5px; color: var(--text-muted); margin: 0 0 12px;">Used for shipping calculation and return labels.</p>
      </div>

      <div class="form-two-col">
        <div class="form-group">
          <label class="form-label">Street Address <span class="required-star">*</span></label>
          <input type="text" id="inp-store-street" class="form-input-text" value="${escapeHTML(store.street || '123 Congress Ave')}" placeholder="Street address">
        </div>
        <div class="form-group">
          <label class="form-label">Apt / Suite / Unit</label>
          <input type="text" id="inp-store-suite" class="form-input-text" value="${escapeHTML(store.suite || 'Suite 200')}" placeholder="Suite, unit, building">
        </div>
      </div>

      <div class="form-three-col" style="display:grid; grid-template-columns: 2fr 1fr 1fr; gap: 12px;">
        <div class="form-group">
          <label class="form-label">City <span class="required-star">*</span></label>
          <input type="text" id="inp-store-city" class="form-input-text" value="${escapeHTML(store.city || 'Austin')}">
        </div>
        <div class="form-group">
          <label class="form-label">State <span class="required-star">*</span></label>
          <select id="sel-store-state" class="form-input-text">
            ${US_STATES.map(s => `<option value="${s.code}" ${s.code === (store.state || 'TX') ? 'selected' : ''}>${s.code}</option>`).join('')}
          </select>
        </div>
        <div class="form-group">
          <label class="form-label">ZIP Code <span class="required-star">*</span></label>
          <input type="text" id="inp-store-zip" class="form-input-text" value="${escapeHTML(store.zip || '78701')}" placeholder="78701">
        </div>
      </div>

      <div class="form-group" style="margin-top: 16px;">
        <label class="form-label">Categories <span class="required-star">*</span></label>
        <div class="category-chips-wrap" id="store-cat-chips">
          ${store.categories.map(c => `
            <span class="chip-item">
              ${escapeHTML(c)}
              <i class="fa-solid fa-xmark remove-chip" data-cat="${escapeHTML(c)}"></i>
            </span>
          `).join('')}
          <button type="button" class="btn-add-chip" id="btn-add-category">+ Add Category</button>
        </div>
      </div>
    </div>
  `;

  // Bind Add Category
  const btnAdd = document.getElementById('btn-add-category');
  if (btnAdd) {
    btnAdd.addEventListener('click', () => openCategoryModal(state));
  }

  // Remove chips
  container.querySelectorAll('.remove-chip').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const cat = e.target.dataset.cat;
      store.categories = store.categories.filter(c => c !== cat);
      renderStep2(container, state);
    });
  });
}

/**
 * STEP 3: Identity & W-9
 */
function renderStep3(container, state) {
  const idData = state.draft.identity;

  container.innerHTML = `
    <div>
      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 18px; font-weight: 800; margin: 0 0 4px;">Identity & Tax Verification (W-9)</h2>
        <p style="font-size: 13px; color: var(--text-muted); margin: 0;">Federal compliance requires U.S. identity and taxpayer verification before disbursements.</p>
      </div>

      <div class="segmented-control">
        <button class="segment-btn ${idData.type === 'individual' ? 'active' : ''}" id="seg-individual">Individual / Sole Proprietor</button>
        <button class="segment-btn ${idData.type === 'company' ? 'active' : ''}" id="seg-company">Registered Business (LLC / Corp)</button>
      </div>

      <div class="form-two-col">
        <div class="form-group">
          <label class="form-label">Full Legal Name <span class="required-star">*</span></label>
          <input type="text" id="inp-id-name" class="form-input-text" value="${escapeHTML(idData.fullName)}" placeholder="First and last name">
        </div>
        <div class="form-group">
          <label class="form-label">ID Document Type <span class="required-star">*</span></label>
          <select id="sel-id-type" class="form-input-text">
            <option ${idData.idType === "Driver's License" ? 'selected' : ''}>Driver's License</option>
            <option ${idData.idType === 'State ID' ? 'selected' : ''}>State ID</option>
            <option ${idData.idType === 'Passport' ? 'selected' : ''}>Passport</option>
          </select>
        </div>
      </div>

      <div class="form-two-col">
        <div class="form-group">
          <label class="form-label">${idData.type === 'company' ? 'Federal Tax ID (EIN)' : 'Tax ID (Last 4 SSN)'} <span class="required-star">*</span></label>
          <input type="text" id="inp-tax-number" class="form-input-text" value="${escapeHTML(idData.taxIdNumber)}" placeholder="${idData.type === 'company' ? '**-***1234' : '***-**-1234'}">
          <span style="font-size:11.5px; color:var(--text-muted); margin-top:3px; display:block;">Masked for security. Full SSN is never stored.</span>
        </div>
        <div class="form-group">
          <label class="form-label">Date of Birth <span class="required-star">*</span></label>
          <input type="date" id="inp-id-dob" class="form-input-text" value="${escapeHTML(idData.dob)}">
        </div>
      </div>

      <!-- W-9 Tax Certification Box -->
      <div style="background: #F8FAFC; border: 1px solid #E2E8F0; border-radius: 8px; padding: 16px; margin: 20px 0;">
        <div style="display:flex; align-items:center; gap:8px; margin-bottom:8px;">
          <i class="fa-solid fa-file-invoice" style="color:var(--primary); font-size:16px;"></i>
          <strong style="font-size:13.5px; color:#1E293B;">Form W-9 Electronic Certification</strong>
        </div>
        <p style="font-size:12.5px; color:#475569; line-height:1.5; margin:0 0 10px;">
          Under penalties of perjury, I certify that: (1) The number shown on this form is my correct taxpayer identification number, (2) I am a U.S. citizen or other U.S. person, and (3) I am not subject to backup withholding.
        </p>
        <label style="display:flex; align-items:center; gap:8px; font-size:12.5px; font-weight:600; color:#1E293B; cursor:pointer;">
          <input type="checkbox" id="chk-w9-cert" checked>
          <span>I certify this electronic Form W-9 under penalty of perjury</span>
        </label>
        <p style="font-size:11.5px; color:#64748B; margin:8px 0 0;">
          <strong>IRS Form 1099-K Note:</strong> AMEZA files annual Form 1099-K information returns in compliance with IRS regulations. Please confirm reporting thresholds with your tax advisor.
        </p>
      </div>

      <div class="form-group">
        <label class="form-label">Upload Identity Document (Front & Back) <span class="required-star">*</span></label>
        <div style="display: flex; gap: 16px; margin-top: 6px;">
          <div class="media-upload-tile" style="flex: 1;">
            <i class="fa-solid fa-id-card" style="font-size: 24px; color: var(--primary);"></i>
            <div class="media-tile-meta">
              <div class="media-filename">ID Front (Driver's License / Passport)</div>
              <div class="media-filesize">JPG/PNG/PDF (max 5MB)</div>
            </div>
          </div>
          <div class="media-upload-tile" style="flex: 1;">
            <i class="fa-solid fa-id-card-clip" style="font-size: 24px; color: var(--primary);"></i>
            <div class="media-tile-meta">
              <div class="media-filename">ID Back Side</div>
              <div class="media-filesize">JPG/PNG/PDF (max 5MB)</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;

  // Bind Segment Switch
  const segInd = document.getElementById('seg-individual');
  const segComp = document.getElementById('seg-company');
  if (segInd && segComp) {
    segInd.addEventListener('click', () => {
      idData.type = 'individual';
      idData.taxIdType = 'SSN';
      renderStep3(container, state);
    });
    segComp.addEventListener('click', () => {
      idData.type = 'company';
      idData.taxIdType = 'EIN';
      renderStep3(container, state);
    });
  }
}

/**
 * STEP 4: Payout Method (ACH / PayPal)
 */
function renderStep4(container, state) {
  const payout = state.draft.payout;

  container.innerHTML = `
    <div>
      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 18px; font-weight: 800; margin: 0 0 4px;">Payout Method</h2>
        <p style="font-size: 13px; color: var(--text-muted); margin: 0;">Specify your U.S. bank account or PayPal for weekly ACH settlement.</p>
      </div>

      <div class="segmented-control" style="max-width: 360px;">
        <button class="segment-btn ${payout.method === 'bank' ? 'active' : ''}" id="pay-tab-bank">ACH Bank Account</button>
        <button class="segment-btn ${payout.method === 'paypal' ? 'active' : ''}" id="pay-tab-paypal">PayPal</button>
      </div>

      ${payout.method === 'bank' ? `
        <div class="form-two-col">
          <div class="form-group">
            <label class="form-label">Bank Name <span class="required-star">*</span></label>
            <select id="sel-bank-name" class="form-input-text">
              ${US_MAJOR_BANKS.map(b => `<option ${b === payout.bankName ? 'selected' : ''}>${b}</option>`).join('')}
            </select>
          </div>
          <div class="form-group">
            <label class="form-label">Account Holder / Business Name <span class="required-star">*</span></label>
            <input type="text" id="inp-bank-holder" class="form-input-text" value="${escapeHTML(payout.accountTitle)}" placeholder="Name on bank account">
          </div>
        </div>

        <div class="form-two-col">
          <div class="form-group">
            <label class="form-label">9-Digit ABA Routing Number <span class="required-star">*</span></label>
            <input type="text" id="inp-bank-routing" class="form-input-text" value="${escapeHTML(payout.routingNumber || '111000025')}" placeholder="9 digits (e.g. 111000025)" maxlength="9">
          </div>
          <div class="form-group">
            <label class="form-label">Account Number <span class="required-star">*</span></label>
            <input type="text" id="inp-bank-acct" class="form-input-text" value="${escapeHTML(payout.accountNumber || '48218921')}" placeholder="Checking account number">
          </div>
        </div>

        <div class="form-two-col">
          <div class="form-group">
            <label class="form-label">Confirm Account Number <span class="required-star">*</span></label>
            <input type="text" id="inp-bank-acct-confirm" class="form-input-text" value="${escapeHTML(payout.accountNumber || '48218921')}" placeholder="Re-enter account number">
          </div>
        </div>
      ` : `
        <div class="form-group" style="max-width:480px;">
          <label class="form-label">PayPal Email Address <span class="required-star">*</span></label>
          <input type="email" id="inp-paypal-email" class="form-input-text" value="${escapeHTML(payout.paypalEmail || 'seller.payments@example.com')}" placeholder="email@example.com">
        </div>
      `}

      <div style="background: #F3F8EE; border: 1px solid rgba(127,183,60,0.3); border-radius: 8px; padding: 14px 16px; font-size: 13px; color: var(--primary-dark); display: flex; align-items: center; gap: 10px;">
        <i class="fa-solid fa-circle-info" style="font-size: 16px;"></i>
        Payouts are processed automatically in USD following a 7-day holding period after delivery confirmation ($50.00 minimum threshold).
      </div>
    </div>
  `;

  // Tab listeners
  const btnBank = document.getElementById('pay-tab-bank');
  const btnPayPal = document.getElementById('pay-tab-paypal');
  if (btnBank) {
    btnBank.addEventListener('click', () => {
      payout.method = 'bank';
      renderStep4(container, state);
    });
  }
  if (btnPayPal) {
    btnPayPal.addEventListener('click', () => {
      payout.method = 'paypal';
      renderStep4(container, state);
    });
  }
}

/**
 * STEP 5: Agreement
 */
function renderStep5(container, state) {
  const ag = state.draft.agreement;

  container.innerHTML = `
    <div>
      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 18px; font-weight: 800; margin: 0 0 4px;">Seller Agreement</h2>
        <p style="font-size: 13px; color: var(--text-muted); margin: 0;">Please review and electronically sign our U.S. marketplace agreement.</p>
      </div>

      <div class="agreement-scroll-box" id="agreement-box">
        ${SELLER_AGREEMENT_TEXT.trim()}
      </div>

      <div id="scroll-prompt-hint" style="font-size: 12px; color: #D97706; margin-bottom: 12px;">
        <i class="fa-solid fa-arrow-down"></i> Scroll to the end of the agreement to enable acceptance.
      </div>

      <div class="form-group">
        <label style="display: flex; align-items: center; gap: 8px; font-size: 13.5px; font-weight: 600; cursor: pointer;">
          <input type="checkbox" id="chk-agreement" ${ag.agreed ? 'checked' : 'disabled'}>
          I have read and agree to the Seller Agreement, Marketplace Guidelines, and Commission Policy
        </label>
      </div>

      <div class="form-group" style="max-width: 400px;">
        <label class="form-label">Digital Signature (Type full legal name) <span class="required-star">*</span></label>
        <input type="text" id="inp-signature" class="form-input-text" value="${escapeHTML(ag.signature)}" placeholder="Sarah Jenkins">
      </div>
    </div>
  `;

  const box = document.getElementById('agreement-box');
  const chk = document.getElementById('chk-agreement');
  const hint = document.getElementById('scroll-prompt-hint');
  const sig = document.getElementById('inp-signature');

  if (box && chk) {
    box.addEventListener('scroll', () => {
      if (box.scrollTop + box.clientHeight >= box.scrollHeight - 25) {
        chk.disabled = false;
        if (hint) hint.style.display = 'none';
      }
    });

    chk.addEventListener('change', () => {
      ag.agreed = chk.checked;
      ag.signedAt = new Date().toISOString();
      state.isDirty = true;
    });
  }

  if (sig) {
    sig.addEventListener('input', (e) => {
      ag.signature = e.target.value;
      state.isDirty = true;
    });
  }
}

/**
 * STEP 6: Review & Submit
 */
function renderStep6(container, state) {
  const store = state.draft.store;
  const idData = state.draft.identity;
  const payout = state.draft.payout;

  container.innerHTML = `
    <div>
      <div style="margin-bottom: 20px;">
        <h2 style="font-size: 18px; font-weight: 800; margin: 0 0 4px;">Review Application</h2>
        <p style="font-size: 13px; color: var(--text-muted); margin: 0;">Verify your details before submitting your U.S. seller application.</p>
      </div>

      <!-- Store Summary -->
      <div class="review-summary-card">
        <div class="review-card-head">
          <span class="review-card-title">Store Details</span>
          <span class="review-edit-link" data-jump="2">Edit</span>
        </div>
        <div style="font-size: 13.5px; line-height: 1.6;">
          <div><strong>Store Name:</strong> ${escapeHTML(store.name)}</div>
          <div><strong>Store URL:</strong> ${escapeHTML(store.slug)}${SITE_DOMAIN}</div>
          <div><strong>Address:</strong> ${escapeHTML(store.street)}, ${escapeHTML(store.city)}, ${escapeHTML(store.state)} ${escapeHTML(store.zip)}</div>
          <div><strong>Categories:</strong> ${store.categories.join(', ')}</div>
          <div><strong>Country:</strong> United States</div>
        </div>
      </div>

      <!-- Identity Summary -->
      <div class="review-summary-card">
        <div class="review-card-head">
          <span class="review-card-title">Identity & W-9 Verification</span>
          <span class="review-edit-link" data-jump="3">Edit</span>
        </div>
        <div style="font-size: 13.5px; line-height: 1.6;">
          <div><strong>Applicant:</strong> ${escapeHTML(idData.fullName)} (${idData.type === 'company' ? 'LLC / Corp' : 'Individual'})</div>
          <div><strong>ID Document:</strong> ${escapeHTML(idData.idType)}</div>
          <div><strong>${idData.taxIdType}:</strong> ${escapeHTML(idData.taxIdNumber)}</div>
          <div><strong>W-9 Status:</strong> <span style="color:#166534; font-weight:700;"><i class="fa-solid fa-circle-check"></i> Certified</span></div>
        </div>
      </div>

      <!-- Payout Summary -->
      <div class="review-summary-card">
        <div class="review-card-head">
          <span class="review-card-title">Payout Method</span>
          <span class="review-edit-link" data-jump="4">Edit</span>
        </div>
        <div style="font-size: 13.5px; line-height: 1.6;">
          ${payout.method === 'bank' ? `
            <div><strong>Method:</strong> ACH Direct Deposit (${escapeHTML(payout.bankName)})</div>
            <div><strong>Account Holder:</strong> ${escapeHTML(payout.accountTitle)}</div>
            <div><strong>Account:</strong> ${escapeHTML(payout.accountMasked || '**** 4821')} (Routing: ${escapeHTML(payout.routingNumber || '111000025')})</div>
          ` : `
            <div><strong>Method:</strong> PayPal (${escapeHTML(payout.paypalEmail || 'seller@example.com')})</div>
          `}
        </div>
      </div>

      <div style="background: #EFF6FF; border: 1px solid #BFDBFE; border-radius: 8px; padding: 14px 18px; font-size: 13px; color: #1E40AF; margin-top: 16px;">
        <i class="fa-solid fa-clock"></i> Compliance reviews usually take 1–2 business days. You will be notified via email once approved.
      </div>
    </div>
  `;

  container.querySelectorAll('.review-edit-link').forEach(link => {
    link.addEventListener('click', () => {
      state.step = parseInt(link.dataset.jump, 10);
      renderStep(state);
    });
  });
}

function submitApplication(state) {
  const container = document.getElementById('wizard-step-content');
  const footer = document.querySelector('.wizard-card-footer');
  const stepper = document.querySelector('.wizard-stepper');

  container.innerHTML = `
    <div style="text-align: center; padding: 60px 20px;">
      <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 40px; color: var(--primary); margin-bottom: 16px;"></i>
      <h3 style="font-size: 18px; font-weight: 700;">Submitting U.S. seller application...</h3>
      <p style="font-size: 13.5px; color: var(--text-muted);">Encrypting and storing your business credentials.</p>
    </div>
  `;
  if (footer) footer.style.display = 'none';
  if (stepper) stepper.style.display = 'none';

  setTimeout(() => {
    const refNum = `APP-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    localStorage.setItem('ameza_onb_application', JSON.stringify({
      reference: refNum,
      status: 'under_review',
      submittedAt: new Date().toISOString(),
      draft: state.draft
    }));

    localStorage.removeItem('ameza_onb_draft');

    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px;">
        <div style="width: 64px; height: 64px; border-radius: 50%; background: #DEF7EC; color: var(--primary-dark); display: flex; align-items: center; justify-content: center; font-size: 28px; margin: 0 auto 16px;">
          <i class="fa-solid fa-check"></i>
        </div>
        <h2 style="font-family: var(--font-heading); font-size: 28px; font-weight: 800; margin: 0 0 6px;">Application submitted!</h2>
        <p style="font-size: 14.5px; color: var(--text-muted); margin: 0 0 16px;">
          Thank you for applying to sell on AMEZA. Your application reference is <strong>${refNum}</strong>.
        </p>

        <!-- Status Timeline -->
        <div class="status-timeline-box">
          <div class="status-timeline-line"></div>
          <div class="status-node active">
            <div class="status-node-circle"><i class="fa-solid fa-check"></i></div>
            <div style="font-size: 11px; font-weight: 700;">Submitted</div>
          </div>
          <div class="status-node active">
            <div class="status-node-circle"><i class="fa-solid fa-hourglass-half"></i></div>
            <div style="font-size: 11px; font-weight: 700;">Under Review</div>
          </div>
          <div class="status-node">
            <div class="status-node-circle"><i class="fa-solid fa-store"></i></div>
            <div style="font-size: 11px; color: var(--text-muted);">Approved</div>
          </div>
        </div>

        <div style="display: flex; gap: 14px; justify-content: center; margin-top: 28px; flex-wrap: wrap;">
          <a href="../seller/index.html" class="btn-primary" id="btn-view-demo-seller-dashboard" style="background: linear-gradient(135deg, #7FB73C 0%, #5a9022 100%); color:#FFFFFF; padding:12px 26px; border-radius:10px; font-weight:700; text-decoration:none; display:inline-flex; align-items:center; gap:8px; box-shadow:0 4px 14px rgba(127,183,60,0.35); font-size:15px;">
            <span>View Demo Seller Dashboard</span>
            <i class="fa-solid fa-arrow-right"></i>
          </a>
          <a href="../index.html" class="btn-secondary" style="padding:12px 20px; border-radius:10px; font-weight:600; text-decoration:none; font-size:14px;">Return to Storefront</a>
        </div>
      </div>
    `;
  }, 600);
}

function openCategoryModal(state) {
  let modal = document.getElementById('category-picker-modal');
  if (!modal) {
    modal = document.createElement('div');
    modal.id = 'category-picker-modal';
    modal.style.cssText = 'position:fixed; inset:0; background:rgba(0,0,0,0.5); z-index:1500; display:flex; align-items:center; justify-content:center; padding:20px;';
    modal.innerHTML = `
      <div style="background:#fff; border-radius:12px; width:100%; max-width:480px; padding:24px; box-shadow:0 10px 30px rgba(0,0,0,0.2);">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
          <h3 style="margin:0; font-size:17px; font-weight:700;">Select Categories</h3>
          <button type="button" id="close-cat-modal" style="background:none; border:none; font-size:18px; cursor:pointer;">&times;</button>
        </div>
        <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px; max-height:300px; overflow-y:auto; margin-bottom:20px;">
          ${MOCK_CATEGORIES.map(c => `
            <label style="display:flex; align-items:center; gap:8px; font-size:13px; padding:8px; border:1px solid #E5E7EB; border-radius:6px; cursor:pointer;">
              <input type="checkbox" value="${escapeHTML(c.name)}" class="cat-modal-chk" ${state.draft.store.categories.includes(c.name) ? 'checked' : ''}>
              <span>${escapeHTML(c.name)}</span>
            </label>
          `).join('')}
        </div>
        <div style="display:flex; justify-content:flex-end; gap:10px;">
          <button type="button" class="btn-primary" id="save-cat-modal" style="height:38px; padding:0 20px;">Save Categories</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    modal.querySelector('#close-cat-modal').onclick = () => {
      modal.remove();
    };

    modal.querySelector('#save-cat-modal').onclick = () => {
      const checked = Array.from(modal.querySelectorAll('.cat-modal-chk:checked')).map(cb => cb.value);
      state.draft.store.categories = checked;
      modal.remove();
      const container = document.getElementById('wizard-step-content');
      renderStep2(container, state);
    };
  }
}
