/**
 * AMEZA Buyer Security Page Module — buyer/js/pages/security.js
 */

import { initLayout } from '/shared/js/core/layout.js';
import { getSession } from '/shared/js/core/session.js';
import { AccountUI } from '/buyer/js/account-ui.js';

export function initSecurityPage() {
  const Auth = window.AmezaAuth;
  const UI = AccountUI;
  const user = UI.requireAuth();
  if (!user) return;

  const sidebarEl = document.getElementById('account-sidebar');
  if (sidebarEl) {
    sidebarEl.innerHTML = UI.sidebarHTML(user, 'security');
    UI.initMobileSidebar();
  }

  const logoutBtn = document.getElementById('sidebar-logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      if (await UI.confirm({ title: 'Sign Out', description: 'Sign out?', confirmText: 'Sign Out', cancelText: 'Stay' })) {
        if (Auth && Auth.logout) Auth.logout();
        window.location.href = 'index.html';
      }
    });
  }

  // 1. Password Strength & Change Password
  const newPwInput = document.getElementById('new-password-sec');
  if (newPwInput && Auth && Auth.checkPasswordStrength) {
    newPwInput.addEventListener('input', function() {
      const r = Auth.checkPasswordStrength(this.value);
      const bar = document.getElementById('sec-strength-bar');
      const lbl = document.getElementById('sec-strength-label');
      if (bar) {
        bar.style.width = (r.score / 5 * 100) + '%';
        bar.style.backgroundColor = r.color;
      }
      if (lbl) {
        lbl.textContent = r.label;
        lbl.style.color = r.color;
      }
    });
  }

  const changePwForm = document.getElementById('change-pw-form');
  if (changePwForm) {
    changePwForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const current = document.getElementById('current-password')?.value;
      const newPw   = document.getElementById('new-password-sec')?.value;
      const confirm = document.getElementById('confirm-password-sec')?.value;
      const alert   = document.getElementById('pw-alert');
      const msg     = document.getElementById('pw-alert-msg');

      if (!current || !newPw || !confirm) {
        if (alert) alert.className = 'auth-alert alert-error show';
        if (msg) msg.textContent = 'All fields are required.';
        return;
      }
      if (newPw !== confirm) {
        if (alert) alert.className = 'auth-alert alert-error show';
        if (msg) msg.textContent = 'New passwords do not match.';
        return;
      }
      if (Auth && Auth.checkPasswordStrength) {
        const strength = Auth.checkPasswordStrength(newPw);
        if (strength.score < 3) {
          if (alert) alert.className = 'auth-alert alert-error show';
          if (msg) msg.textContent = 'Please choose a stronger password.';
          return;
        }
      }

      const btn = document.getElementById('btn-change-pw');
      const lbl = document.getElementById('btn-change-pw-label');
      if (btn) btn.disabled = true;
      if (lbl) lbl.textContent = 'Updating...';

      try {
        if (Auth && Auth.changePassword) {
          const result = await Auth.changePassword(user.id, { currentPassword: current, newPassword: newPw });
          if (result.success) {
            if (alert) alert.className = 'auth-alert alert-success show';
            if (msg) msg.textContent = 'Password updated successfully!';
            changePwForm.reset();
            const bar = document.getElementById('sec-strength-bar');
            const slbl = document.getElementById('sec-strength-label');
            if (bar) bar.style.width = '0';
            if (slbl) slbl.textContent = '';
            UI.toast('Password changed successfully.', 'success');
          } else {
            if (alert) alert.className = 'auth-alert alert-error show';
            if (msg) msg.textContent = result.error || 'Failed to update password.';
          }
        }
      } finally {
        if (btn) btn.disabled = false;
        if (lbl) lbl.textContent = 'Update Password';
      }
    });
  }

  // 2. 2FA Status & Flow
  let currentUser = (Auth && Auth.getCurrentUser) ? Auth.getCurrentUser() : user;
  let pendingTOTPSecret = null;

  function refresh2FAStatus() {
    currentUser = (Auth && Auth.getCurrentUser) ? Auth.getCurrentUser() : user;
    const twoFAEnabled = currentUser?.twoFAEnabled;
    const statusCard = document.getElementById('twofa-status-card');
    const rightEl = document.getElementById('twofa-status-right');
    const recoveryCard = document.getElementById('recovery-codes-card');

    if (statusCard) statusCard.className = `twofa-status-card ${twoFAEnabled ? 'twofa-status-enabled' : ''}`;

    if (rightEl) {
      if (twoFAEnabled) {
        rightEl.innerHTML = `
          <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
            <span class="twofa-status-badge enabled-badge"><svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg> Enabled</span>
            <button class="btn-danger" id="btn-disable-2fa" style="font-size:0.78rem; padding: 6px 14px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              Disable 2FA
            </button>
          </div>`;
        document.getElementById('btn-disable-2fa')?.addEventListener('click', () => {
          const setupFlow = document.getElementById('twofa-setup-flow');
          const disableFlow = document.getElementById('twofa-disable-flow');
          if (setupFlow) setupFlow.style.display = 'none';
          if (disableFlow) disableFlow.style.display = 'block';
        });
        if (recoveryCard) recoveryCard.style.display = 'block';
        renderRecoveryCodes();
      } else {
        rightEl.innerHTML = `
          <div style="display: flex; align-items: center; gap: 10px;">
            <span class="twofa-status-badge disabled-badge">Not Enabled</span>
            <button class="btn-section-action" id="btn-enable-2fa" style="font-size:0.78rem; padding: 7px 14px;">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="20 6 9 17 4 12"></polyline></svg>
              Enable 2FA
            </button>
          </div>`;
        document.getElementById('btn-enable-2fa')?.addEventListener('click', begin2FASetup);
        if (recoveryCard) recoveryCard.style.display = 'none';
      }
    }
  }

  async function begin2FASetup() {
    if (!Auth || !Auth.beginTwoFASetup) return;
    const result = await Auth.beginTwoFASetup(user.id);
    if (!result.success) { UI.toast(result.error, 'error'); return; }

    pendingTOTPSecret = result.secret;
    const setupFlow = document.getElementById('twofa-setup-flow');
    const recDisplay = document.getElementById('twofa-recovery-display');
    const disFlow = document.getElementById('twofa-disable-flow');
    if (setupFlow) setupFlow.style.display = 'block';
    if (recDisplay) recDisplay.style.display = 'none';
    if (disFlow) disFlow.style.display = 'none';

    const secretDisp = document.getElementById('twofa-secret-display');
    if (secretDisp) secretDisp.textContent = pendingTOTPSecret;

    const qrContainer = document.getElementById('twofa-qr-canvas');
    if (qrContainer) {
      qrContainer.innerHTML = '';
      if (typeof QRCode !== 'undefined') {
        new QRCode(qrContainer, {
          text: result.uri,
          width: 200,
          height: 200,
          colorDark: '#111827',
          colorLight: '#FFFFFF',
          correctLevel: QRCode.CorrectLevel.M,
        });
      } else {
        qrContainer.innerHTML = `<div style="padding:20px; text-align:center; font-size:0.82rem; color:var(--text-muted);">QR library not loaded. Use the secret key below.</div>`;
      }
    }
  }

  document.getElementById('btn-copy-secret')?.addEventListener('click', () => {
    if (pendingTOTPSecret) UI.copyToClipboard(pendingTOTPSecret, 'Secret key copied!');
  });

  document.getElementById('btn-confirm-2fa')?.addEventListener('click', async () => {
    const code = document.getElementById('twofa-verify-code')?.value.trim();
    const alertEl = document.getElementById('twofa-setup-alert');
    const alertMsg = document.getElementById('twofa-setup-alert-msg');

    if (!code || code.length < 6) {
      if (alertEl) alertEl.className = 'auth-alert alert-error show';
      if (alertMsg) alertMsg.textContent = 'Please enter the 6-digit code from your authenticator app.';
      return;
    }

    const btn = document.getElementById('btn-confirm-2fa');
    const lbl = document.getElementById('btn-confirm-2fa-label');
    if (btn) btn.disabled = true;
    if (lbl) lbl.textContent = 'Verifying...';

    try {
      if (Auth && Auth.confirmTwoFASetup) {
        const result = await Auth.confirmTwoFASetup(user.id, code);
        if (result.success) {
          const step1 = document.getElementById('twofa-step-1');
          const recDisp = document.getElementById('twofa-recovery-display');
          if (step1) step1.style.display = 'none';
          if (recDisp) recDisp.style.display = 'block';

          const grid = document.getElementById('new-recovery-codes');
          if (grid && result.recoveryCodes) {
            grid.innerHTML = result.recoveryCodes.map(c => `<div class="recovery-code-item">${c}</div>`).join('');
          }
          refresh2FAStatus();
          UI.toast('2FA enabled successfully!', 'success');
        } else {
          if (alertEl) alertEl.className = 'auth-alert alert-error show';
          if (alertMsg) alertMsg.textContent = result.error || 'Invalid code.';
        }
      }
    } finally {
      if (btn) btn.disabled = false;
      if (lbl) lbl.textContent = 'Enable 2FA';
    }
  });

  document.getElementById('btn-cancel-2fa')?.addEventListener('click', () => {
    const setupFlow = document.getElementById('twofa-setup-flow');
    const step1 = document.getElementById('twofa-step-1');
    if (setupFlow) setupFlow.style.display = 'none';
    if (step1) step1.style.display = 'block';
  });

  document.getElementById('btn-copy-recovery-codes')?.addEventListener('click', () => {
    const codes = Array.from(document.querySelectorAll('#new-recovery-codes .recovery-code-item')).map(el => el.textContent.trim()).join('\n');
    UI.copyToClipboard(codes, 'Recovery codes copied!');
  });

  document.getElementById('btn-done-2fa')?.addEventListener('click', () => {
    const setupFlow = document.getElementById('twofa-setup-flow');
    const recDisp = document.getElementById('twofa-recovery-display');
    if (setupFlow) setupFlow.style.display = 'none';
    if (recDisp) recDisp.style.display = 'none';
  });

  document.getElementById('btn-confirm-disable-2fa')?.addEventListener('click', async () => {
    const password = document.getElementById('disable-pw')?.value;
    const code     = document.getElementById('disable-code')?.value.trim();
    const alertEl  = document.getElementById('disable-2fa-alert');
    const alertMsg = document.getElementById('disable-2fa-alert-msg');

    if (!password || !code) {
      if (alertEl) alertEl.className = 'auth-alert alert-error show';
      if (alertMsg) alertMsg.textContent = 'Both password and verification code are required.';
      return;
    }

    const btn = document.getElementById('btn-confirm-disable-2fa');
    const lbl = document.getElementById('btn-disable-2fa-label');
    if (btn) btn.disabled = true;
    if (lbl) lbl.textContent = 'Disabling...';

    try {
      if (Auth && Auth.disableTwoFA) {
        const result = await Auth.disableTwoFA(user.id, { password, code });
        if (result.success) {
          const disFlow = document.getElementById('twofa-disable-flow');
          if (disFlow) disFlow.style.display = 'none';
          refresh2FAStatus();
          UI.toast('2FA has been disabled.', 'success');
        } else {
          if (alertEl) alertEl.className = 'auth-alert alert-error show';
          if (alertMsg) alertMsg.textContent = result.error || 'Failed to disable 2FA.';
        }
      }
    } finally {
      if (btn) btn.disabled = false;
      if (lbl) lbl.textContent = 'Disable 2FA';
    }
  });

  document.getElementById('btn-cancel-disable-2fa')?.addEventListener('click', () => {
    const disFlow = document.getElementById('twofa-disable-flow');
    if (disFlow) disFlow.style.display = 'none';
  });

  // 3. Recovery Codes
  function renderRecoveryCodes() {
    if (!Auth || !Auth.getRecoveryCodes) return;
    const storedCodes = Auth.getRecoveryCodes(user.id);
    const statusEl = document.getElementById('recovery-codes-status');
    const count = storedCodes ? storedCodes.length : 0;
    if (statusEl) {
      statusEl.innerHTML = `
        <div class="twofa-status-card" style="margin-bottom: 0;">
          <div>
            <div style="font-weight: 700; color: var(--dark);">${count} code${count !== 1 ? 's' : ''} remaining</div>
            <div style="font-size: 0.8rem; color: var(--text-muted);">Each code can be used once to sign in if you lose your authenticator.</div>
          </div>
          <span class="twofa-status-badge ${count < 2 ? 'disabled-badge' : 'enabled-badge'}">${count < 2 ? '⚠ Low' : '✓ OK'}</span>
        </div>`;
    }
  }

  document.getElementById('btn-regen-codes')?.addEventListener('click', () => {
    const regenForm = document.getElementById('regen-form');
    const regenRow = document.getElementById('regen-btn-row');
    const regenCodes = document.getElementById('regen-codes-display');
    if (regenForm) regenForm.style.display = 'block';
    if (regenRow) regenRow.style.display = 'none';
    if (regenCodes) regenCodes.style.display = 'none';
  });

  document.getElementById('btn-regen-cancel')?.addEventListener('click', () => {
    const regenForm = document.getElementById('regen-form');
    const regenRow = document.getElementById('regen-btn-row');
    if (regenForm) regenForm.style.display = 'none';
    if (regenRow) regenRow.style.display = 'block';
  });

  document.getElementById('btn-regen-confirm')?.addEventListener('click', async () => {
    const password = document.getElementById('regen-password')?.value;
    const alertEl  = document.getElementById('regen-alert');
    const alertMsg = document.getElementById('regen-alert-msg');

    if (!password) {
      if (alertEl) alertEl.className = 'auth-alert alert-error show';
      if (alertMsg) alertMsg.textContent = 'Please enter your password.';
      return;
    }

    if (Auth && Auth.regenerateRecoveryCodes) {
      const result = await Auth.regenerateRecoveryCodes(user.id, { password });
      if (result.success) {
        document.getElementById('regen-form').style.display = 'none';
        document.getElementById('regen-codes-display').style.display = 'block';
        document.getElementById('regen-codes-grid').innerHTML = result.recoveryCodes.map(c => `<div class="recovery-code-item">${c}</div>`).join('');
        renderRecoveryCodes();
        UI.toast('Recovery codes regenerated!', 'success');
      } else {
        if (alertEl) alertEl.className = 'auth-alert alert-error show';
        if (alertMsg) alertMsg.textContent = result.error || 'Failed.';
      }
    }
  });

  document.getElementById('btn-copy-regen-codes')?.addEventListener('click', () => {
    const codes = Array.from(document.querySelectorAll('#regen-codes-grid .recovery-code-item')).map(el => el.textContent.trim()).join('\n');
    UI.copyToClipboard(codes, 'New codes copied!');
  });

  // 4. Sessions
  function renderSessions() {
    if (!Auth || !Auth.getSession) return;
    const session = Auth.getSession();
    const container = document.getElementById('sessions-container');
    if (!container) return;
    if (!session) { container.innerHTML = '<p style="color:var(--text-muted);">No active sessions found.</p>'; return; }

    container.innerHTML = `
      <div class="session-card current-session">
        <div class="session-icon">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="2" y="3" width="20" height="14" rx="2"></rect><line x1="8" y1="21" x2="16" y2="21"></line><line x1="12" y1="17" x2="12" y2="21"></line></svg>
        </div>
        <div class="session-info">
          <strong>Current Session</strong>
          <small>Session ID: ${session.sessionId ? session.sessionId.substring(0, 20) + '...' : 'N/A'}</small>
          <small>Expires: ${UI.formatDate(session.expiresAt)}</small>
        </div>
        <span class="session-current-badge">Active Now</span>
      </div>
      <div style="margin-top: 12px; display: flex; gap: 10px;">
        <button class="btn-danger" id="btn-sign-out-all" style="font-size:0.82rem;">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
          Sign Out of All Sessions
        </button>
      </div>
    `;

    document.getElementById('btn-sign-out-all')?.addEventListener('click', async () => {
      const confirmed = await UI.confirm({ title: 'Sign Out Everywhere', description: 'This will sign you out of this session. Are you sure?', confirmText: 'Sign Out', dangerous: true });
      if (confirmed) {
        if (Auth && Auth.logout) Auth.logout();
        window.location.href = '/auth/login.html';
      }
    });
  }

  // 5. Delete Account
  document.getElementById('btn-show-delete-form')?.addEventListener('click', () => {
    document.getElementById('delete-account-form').style.display = 'block';
    document.getElementById('btn-show-delete-form').style.display = 'none';
  });

  document.getElementById('btn-cancel-delete')?.addEventListener('click', () => {
    document.getElementById('delete-account-form').style.display = 'none';
    document.getElementById('btn-show-delete-form').style.display = 'inline-flex';
  });

  document.getElementById('btn-confirm-delete')?.addEventListener('click', async () => {
    const password  = document.getElementById('delete-confirm-password')?.value;
    const checked   = document.getElementById('delete-understand-check')?.checked;
    const alertEl   = document.getElementById('delete-account-alert');
    const alertMsg  = document.getElementById('delete-account-alert-msg');

    if (!password) {
      if (alertEl) alertEl.className = 'auth-alert alert-error show';
      if (alertMsg) alertMsg.textContent = 'Please enter your password.';
      return;
    }
    if (!checked) {
      if (alertEl) alertEl.className = 'auth-alert alert-error show';
      if (alertMsg) alertMsg.textContent = 'Please check the confirmation box.';
      return;
    }

    const confirmed = await UI.confirm({
      title: '⚠️ Delete Account Permanently',
      description: 'This will permanently delete your account, all orders, addresses, and saved data. This CANNOT be undone. Are you absolutely sure?',
      confirmText: 'Delete My Account',
      cancelText: 'No, Keep My Account',
      dangerous: true,
    });

    if (!confirmed) return;

    const btn = document.getElementById('btn-confirm-delete');
    const lbl = document.getElementById('btn-delete-label');
    if (btn) btn.disabled = true;
    if (lbl) lbl.textContent = 'Deleting...';

    try {
      if (Auth && Auth.deleteAccount) {
        const result = await Auth.deleteAccount(user.id, { password });
        if (result.success) {
          UI.toast('Account deleted. Redirecting...', 'success');
          setTimeout(() => window.location.href = 'index.html', 1500);
        } else {
          if (alertEl) alertEl.className = 'auth-alert alert-error show';
          if (alertMsg) alertMsg.textContent = result.error || 'Failed to delete account.';
          if (btn) btn.disabled = false;
          if (lbl) lbl.textContent = 'Delete My Account Permanently';
        }
      }
    } catch {
      if (alertEl) alertEl.className = 'auth-alert alert-error show';
      if (alertMsg) alertMsg.textContent = 'Something went wrong. Please try again.';
      if (btn) btn.disabled = false;
      if (lbl) lbl.textContent = 'Delete My Account Permanently';
    }
  });

  refresh2FAStatus();
  renderSessions();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initLayout();
    initSecurityPage();
  });
} else {
  initLayout();
  initSecurityPage();
}

window.Ameza = window.Ameza || {};
window.Ameza.initSecurityPage = initSecurityPage;
