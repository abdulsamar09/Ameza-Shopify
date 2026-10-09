/**
 * AMEZA Auth Reset Password Page Module — auth/js/pages/reset-password.js
 */

import { initLayout } from '/shared/js/core/layout.js';
import '/auth/js/auth.js';

export function initResetPasswordPage() {
  const Auth = window.AmezaAuth;
  const urlToken = new URLSearchParams(window.location.search).get('token');

  function showState(id) {
    ['reset-invalid-state','reset-success-state','reset-form-state'].forEach(s => {
      const el = document.getElementById(s);
      if (el) el.style.display = (s === id) ? 'block' : 'none';
    });
  }

  // Validate token on load
  if (!urlToken) {
    showState('reset-invalid-state');
    const msg = document.getElementById('reset-invalid-msg');
    if (msg) msg.textContent = 'No reset token found. Please request a new password reset link.';
  } else if (Auth && Auth.validateResetToken) {
    const validation = Auth.validateResetToken(urlToken);
    if (!validation.valid) {
      showState('reset-invalid-state');
      const msg = document.getElementById('reset-invalid-msg');
      if (msg) msg.textContent = validation.error;
    } else {
      showState('reset-form-state');
    }
  }

  // Password toggle
  function makeToggle(btnId, inputId, iconId) {
    const btn = document.getElementById(btnId);
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (!btn || !input || !icon) return;

    btn.addEventListener('click', () => {
      input.type = input.type === 'password' ? 'text' : 'password';
      icon.innerHTML = input.type === 'text'
        ? '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>'
        : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
    });
  }

  makeToggle('toggle-new-pass', 'new-password', 'eye-new');
  makeToggle('toggle-confirm-new', 'confirm-new-password', 'eye-confirm-new');

  // Password strength
  document.getElementById('new-password')?.addEventListener('input', function() {
    if (!Auth || !Auth.checkPasswordStrength) return;
    const result = Auth.checkPasswordStrength(this.value);
    const bar = document.getElementById('reset-strength-bar');
    const label = document.getElementById('reset-strength-label');
    if (bar) {
      bar.style.width = (result.score / 5 * 100) + '%';
      bar.style.backgroundColor = result.color;
    }
    if (label) {
      label.textContent = result.label;
      label.style.color = result.color;
    }
    const map = {
      'r-length': result.checks?.length,
      'r-upper': result.checks?.uppercase,
      'r-lower': result.checks?.lowercase,
      'r-num': result.checks?.number,
      'r-special': result.checks?.special
    };
    Object.entries(map).forEach(([id, met]) => document.getElementById(id)?.classList.toggle('met', !!met));
  });

  // Form submit
  document.getElementById('reset-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const newPass = document.getElementById('new-password')?.value;
    const confirm = document.getElementById('confirm-new-password')?.value;
    let valid = true;

    const strength = Auth && Auth.checkPasswordStrength ? Auth.checkPasswordStrength(newPass) : { score: 3 };
    if (!newPass || strength.score < 3) {
      document.getElementById('new-password')?.classList.add('error');
      document.getElementById('err-new-pass')?.classList.add('show');
      const errTxt = document.getElementById('err-new-pass-text');
      if (errTxt) errTxt.textContent = 'Please choose a stronger password.';
      valid = false;
    }
    if (newPass !== confirm) {
      document.getElementById('confirm-new-password')?.classList.add('error');
      document.getElementById('err-confirm-new')?.classList.add('show');
      const errTxt = document.getElementById('err-confirm-new-text');
      if (errTxt) errTxt.textContent = 'Passwords do not match.';
      valid = false;
    }
    if (!valid) return;

    const btn = document.getElementById('btn-reset');
    const spinner = document.getElementById('spinner-reset');
    const label = document.getElementById('btn-reset-label');
    if (btn) btn.disabled = true;
    if (spinner) spinner.classList.add('show');
    if (label) label.textContent = 'Resetting...';

    try {
      if (Auth && Auth.resetPassword) {
        const result = await Auth.resetPassword(urlToken, newPass);
        if (result.success) {
          showState('reset-success-state');
        } else {
          const alert = document.getElementById('reset-alert');
          if (alert) alert.className = 'auth-alert alert-error show';
          const msg = document.getElementById('reset-alert-msg');
          if (msg) msg.textContent = result.error || 'Something went wrong.';
        }
      }
    } catch(err) {
      const alert = document.getElementById('reset-alert');
      if (alert) alert.className = 'auth-alert alert-error show';
      const msg = document.getElementById('reset-alert-msg');
      if (msg) msg.textContent = 'Something went wrong. Please try again.';
    } finally {
      if (btn) btn.disabled = false;
      if (spinner) spinner.classList.remove('show');
      if (label) label.textContent = 'Reset Password';
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initLayout();
    initResetPasswordPage();
  });
} else {
  initLayout();
  initResetPasswordPage();
}

window.Ameza = window.Ameza || {};
window.Ameza.initResetPasswordPage = initResetPasswordPage;
