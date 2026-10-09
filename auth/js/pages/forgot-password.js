/**
 * AMEZA Auth Forgot Password Page Module — auth/js/pages/forgot-password.js
 */

import { initLayout } from '/shared/js/core/layout.js';
import '/auth/js/auth.js';

export function initForgotPasswordPage() {
  const Auth = window.AmezaAuth;

  if (Auth && Auth.isLoggedIn && Auth.isLoggedIn()) {
    window.location.href = '/buyer/';
    return;
  }

  const emailInput = document.getElementById('forgot-email');
  const errForgot = document.getElementById('err-forgot-email');
  const errForgotText = document.getElementById('err-forgot-email-text');

  emailInput?.addEventListener('input', () => {
    emailInput.classList.remove('error');
    errForgot?.classList.remove('show');
  });

  document.getElementById('forgot-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = emailInput?.value.trim();

    if (!email) {
      emailInput?.classList.add('error');
      errForgot?.classList.add('show');
      if (errForgotText) errForgotText.textContent = 'Please enter your email address.';
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      emailInput?.classList.add('error');
      errForgot?.classList.add('show');
      if (errForgotText) errForgotText.textContent = 'Please enter a valid email address.';
      return;
    }

    const btn = document.getElementById('btn-forgot');
    const spinner = document.getElementById('spinner-forgot');
    const label = document.getElementById('btn-forgot-label');
    if (btn) btn.disabled = true;
    if (spinner) spinner.classList.add('show');
    if (label) label.textContent = 'Sending...';

    // Simulate network delay
    await new Promise(r => setTimeout(r, 800));

    try {
      if (Auth && Auth.requestPasswordReset) {
        const result = Auth.requestPasswordReset(email);

        const formState = document.getElementById('forgot-form-state');
        const subState = document.getElementById('forgot-submitted-state');
        if (formState) formState.style.display = 'none';
        if (subState) subState.style.display = 'block';

        const tokenBox = document.getElementById('dev-reset-token-box');
        if (result.token) {
          const tokenUrl = `reset-password.html?token=${result.token}`;
          const tokenDisp = document.getElementById('dev-reset-token-display');
          const link = document.getElementById('dev-reset-link');
          if (tokenDisp) tokenDisp.textContent = tokenUrl;
          if (link) {
            link.href = tokenUrl;
            link.textContent = 'Open Reset Page →';
          }
          if (tokenBox) tokenBox.style.display = 'block';
        } else {
          if (tokenBox) tokenBox.style.display = 'none';
        }
      }
    } finally {
      if (btn) btn.disabled = false;
      if (spinner) spinner.classList.remove('show');
      if (label) label.textContent = 'Send Reset Link';
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initLayout();
    initForgotPasswordPage();
  });
} else {
  initLayout();
  initForgotPasswordPage();
}

window.Ameza = window.Ameza || {};
window.Ameza.initForgotPasswordPage = initForgotPasswordPage;
