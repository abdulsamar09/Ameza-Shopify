/**
 * AMEZA Auth Login Page Module — auth/js/pages/login.js
 */

import { initLayout } from '/shared/js/core/layout.js';
import '/auth/js/auth.js';

export function initLoginPage() {
  const Auth = window.AmezaAuth;

  // Redirect if already logged in
  if (Auth && Auth.isLoggedIn && Auth.isLoggedIn()) {
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get('redirect');
    window.location.href = redirect ? decodeURIComponent(redirect) : '/buyer/';
    return;
  }

  let pendingUserId = null; // holds userId during 2FA challenge

  // Password toggle
  const toggleBtn = document.getElementById('toggle-login-password');
  const input = document.getElementById('login-password');
  const icon = document.getElementById('eye-icon-login');
  if (toggleBtn && input && icon) {
    toggleBtn.addEventListener('click', () => {
      if (input.type === 'password') {
        input.type = 'text';
        icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
      } else {
        input.type = 'password';
        icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
      }
    });
  }

  function showFieldError(fieldId, errorId, message) {
    const field = document.getElementById(fieldId);
    const errorDiv = document.getElementById(errorId);
    const errorText = document.getElementById(errorId + '-text');
    if (field) field.classList.add('error');
    if (errorDiv) errorDiv.classList.add('show');
    if (errorText) errorText.textContent = message;
  }

  function clearFieldError(fieldId, errorId) {
    const field = document.getElementById(fieldId);
    const errorDiv = document.getElementById(errorId);
    if (field) field.classList.remove('error');
    if (errorDiv) errorDiv.classList.remove('show');
  }

  function showAlert(message, type = 'error') {
    const alert = document.getElementById('login-alert');
    const msg = document.getElementById('login-alert-msg');
    if (alert && msg) {
      alert.className = `auth-alert alert-${type} show`;
      msg.textContent = message;
      alert.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }

  function hideAlert() {
    const alert = document.getElementById('login-alert');
    if (alert) alert.classList.remove('show');
  }

  function setLoading(loading) {
    const btn = document.getElementById('btn-login');
    const spinner = document.getElementById('spinner-login');
    const label = document.getElementById('btn-login-label');
    if (btn) btn.disabled = loading;
    if (spinner) spinner.classList.toggle('show', loading);
    if (label) label.textContent = loading ? 'Signing In...' : 'Sign In';
  }

  document.getElementById('login-email')?.addEventListener('input', () => clearFieldError('login-email', 'login-email-error'));
  document.getElementById('login-password')?.addEventListener('input', () => clearFieldError('login-password', 'login-password-error'));

  // Login form submit
  document.getElementById('login-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    hideAlert();

    const email = document.getElementById('login-email')?.value.trim();
    const password = document.getElementById('login-password')?.value;
    const remember = document.getElementById('remember-me')?.checked || false;

    let valid = true;
    if (!email) {
      showFieldError('login-email', 'login-email-error', 'Please enter your email address.');
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showFieldError('login-email', 'login-email-error', 'Please enter a valid email address.');
      valid = false;
    }
    if (!password) {
      showFieldError('login-password', 'login-password-error', 'Please enter your password.');
      valid = false;
    }
    if (!valid) return;

    setLoading(true);
    try {
      if (!Auth || !Auth.login) {
        throw new Error('Auth engine not loaded');
      }
      const result = await Auth.login({ email, password, remember });

      if (result.requiresTwoFA) {
        pendingUserId = result.userId;
        const loginForm = document.getElementById('login-form');
        const twoFaChallenge = document.getElementById('twofa-challenge');
        if (loginForm) loginForm.style.display = 'none';
        if (twoFaChallenge) twoFaChallenge.style.display = 'block';
        document.getElementById('twofa-code')?.focus();
      } else if (result.success) {
        showAlert('Login successful! Redirecting to your dashboard...', 'success');
        setTimeout(() => {
          const params = new URLSearchParams(window.location.search);
          const redirect = params.get('redirect');
          window.location.href = redirect ? decodeURIComponent(redirect) : '/buyer/';
        }, 500);
      } else {
        showAlert(result.error || 'Incorrect email or password.');
        setLoading(false);
      }
    } catch (err) {
      console.error('Login error:', err);
      showAlert('Something went wrong. Please try again.');
      setLoading(false);
    }
  });

  // 2FA verify
  document.getElementById('btn-verify-2fa')?.addEventListener('click', async () => {
    const code = document.getElementById('twofa-code')?.value.trim();
    const remember = document.getElementById('remember-me')?.checked || false;

    if (!code) {
      showAlert('Please enter your 6-digit authentication code.');
      return;
    }

    const spinner = document.getElementById('spinner-2fa');
    const label = document.getElementById('btn-2fa-label');
    const btn = document.getElementById('btn-verify-2fa');
    if (btn) btn.disabled = true;
    if (spinner) spinner.classList.add('show');
    if (label) label.textContent = 'Verifying...';

    try {
      if (Auth && Auth.completeTwoFALogin) {
        const result = await Auth.completeTwoFALogin({ userId: pendingUserId, code, remember });
        if (result.success) {
          const params = new URLSearchParams(window.location.search);
          const redirect = params.get('redirect');
          window.location.href = redirect ? decodeURIComponent(redirect) : '/buyer/';
        } else {
          showAlert(result.error || 'Invalid code. Please try again.');
        }
      }
    } catch (err) {
      showAlert('Something went wrong. Please try again.');
    } finally {
      if (btn) btn.disabled = false;
      if (spinner) spinner.classList.remove('show');
      if (label) label.textContent = 'Verify Code';
    }
  });

  document.getElementById('twofa-code')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('btn-verify-2fa')?.click();
  });

  document.getElementById('btn-back-to-login')?.addEventListener('click', () => {
    pendingUserId = null;
    const loginForm = document.getElementById('login-form');
    const twoFaChallenge = document.getElementById('twofa-challenge');
    if (loginForm) loginForm.style.display = 'block';
    if (twoFaChallenge) twoFaChallenge.style.display = 'none';
    hideAlert();
  });

  document.getElementById('use-recovery-code-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    const codeInput = document.getElementById('twofa-code');
    if (codeInput) {
      codeInput.placeholder = 'XXXXX-XXXXX (recovery code)';
      codeInput.inputMode = 'text';
      codeInput.maxLength = 11;
      codeInput.focus();
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initLayout();
    initLoginPage();
  });
} else {
  initLayout();
  initLoginPage();
}

window.Ameza = window.Ameza || {};
window.Ameza.initLoginPage = initLoginPage;
