/**
 * AMEZA Auth Signup Page Module — auth/js/pages/signup.js
 */

import { initLayout } from '/shared/js/core/layout.js';
import '/auth/js/auth.js';

export function initSignupPage() {
  const Auth = window.AmezaAuth;

  // Redirect if already logged in
  if (Auth && Auth.isLoggedIn && Auth.isLoggedIn()) {
    window.location.href = '/buyer/';
    return;
  }

  // Password toggle helpers
  function makeToggle(btnId, inputId, iconId) {
    const btn = document.getElementById(btnId);
    const input = document.getElementById(inputId);
    const icon = document.getElementById(iconId);
    if (!btn || !input || !icon) return;

    btn.addEventListener('click', () => {
      if (input.type === 'password') {
        input.type = 'text';
        icon.innerHTML = '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>';
      } else {
        input.type = 'password';
        icon.innerHTML = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
      }
    });
  }

  makeToggle('toggle-signup-password', 'signup-password', 'eye-icon-signup');
  makeToggle('toggle-confirm-password', 'signup-confirm-password', 'eye-icon-confirm');

  // Password strength
  document.getElementById('signup-password')?.addEventListener('input', function() {
    const val = this.value;
    if (!Auth || !Auth.checkPasswordStrength) return;
    const result = Auth.checkPasswordStrength(val);

    const bar = document.getElementById('strength-bar');
    const label = document.getElementById('strength-label');
    if (bar) {
      bar.style.width = (result.score / 5 * 100) + '%';
      bar.style.backgroundColor = result.color;
    }
    if (label) {
      label.textContent = result.label;
      label.style.color = result.color;
    }

    const map = {
      'req-length': result.checks?.length,
      'req-uppercase': result.checks?.uppercase,
      'req-lowercase': result.checks?.lowercase,
      'req-number': result.checks?.number,
      'req-special': result.checks?.special,
    };
    Object.entries(map).forEach(([id, met]) => {
      document.getElementById(id)?.classList.toggle('met', !!met);
    });
  });

  function showErr(inputId, errId, msg) {
    document.getElementById(inputId)?.classList.add('error');
    const div = document.getElementById(errId);
    const txt = document.getElementById(errId + '-text');
    if (div) div.classList.add('show');
    if (txt) txt.textContent = msg;
  }

  function clearErr(inputId, errId) {
    document.getElementById(inputId)?.classList.remove('error');
    document.getElementById(errId)?.classList.remove('show');
  }

  ['signup-firstname','signup-lastname','signup-email','signup-password','signup-confirm-password'].forEach(id => {
    const errId = 'err-' + id.replace('signup-', '').replace('-password','').replace('-', '');
    document.getElementById(id)?.addEventListener('input', () => clearErr(id, errId));
  });

  function showAlertBox(msg, type = 'error') {
    const a = document.getElementById('signup-alert');
    const t = document.getElementById('signup-alert-msg');
    if (a && t) {
      a.className = `auth-alert alert-${type} show`;
      t.textContent = msg;
    }
  }

  document.getElementById('signup-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const firstName = document.getElementById('signup-firstname')?.value.trim();
    const lastName  = document.getElementById('signup-lastname')?.value.trim();
    const email     = document.getElementById('signup-email')?.value.trim();
    const phone     = document.getElementById('signup-phone')?.value.trim();
    const password  = document.getElementById('signup-password')?.value;
    const confirm   = document.getElementById('signup-confirm-password')?.value;
    const terms     = document.getElementById('terms-checkbox')?.checked;

    let valid = true;

    if (!firstName) { showErr('signup-firstname','err-firstname','First name is required.'); valid = false; }
    if (!lastName)  { showErr('signup-lastname','err-lastname','Last name is required.'); valid = false; }
    if (!email)     { showErr('signup-email','err-email','Email address is required.'); valid = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showErr('signup-email','err-email','Please enter a valid email.'); valid = false; }

    const strength = Auth && Auth.checkPasswordStrength ? Auth.checkPasswordStrength(password) : { score: 3 };
    if (!password)  { showErr('signup-password','err-password','Password is required.'); valid = false; }
    else if (strength.score < 3) { showErr('signup-password','err-password','Please choose a stronger password (at least "Fair").'); valid = false; }

    if (!confirm)   { showErr('signup-confirm-password','err-confirm','Please confirm your password.'); valid = false; }
    else if (password !== confirm) { showErr('signup-confirm-password','err-confirm','Passwords do not match.'); valid = false; }

    if (!terms) {
      const errTerms = document.getElementById('err-terms');
      const errText = document.getElementById('err-terms-text');
      if (errTerms) errTerms.classList.add('show');
      if (errText) errText.textContent = 'You must accept the Terms & Conditions to continue.';
      valid = false;
    }

    if (!valid) return;

    const btn = document.getElementById('btn-signup');
    const spinner = document.getElementById('spinner-signup');
    const label = document.getElementById('btn-signup-label');
    if (btn) btn.disabled = true;
    if (spinner) spinner.classList.add('show');
    if (label) label.textContent = 'Creating Account...';

    try {
      if (!Auth || !Auth.register) throw new Error('Auth engine not loaded');
      const result = await Auth.register({ firstName, lastName, email, phone, password });
      if (result.success) {
        showAlertBox('Account created successfully! Redirecting to your dashboard...', 'success');
        setTimeout(() => {
          const params = new URLSearchParams(window.location.search);
          const redirect = params.get('redirect');
          window.location.href = redirect ? decodeURIComponent(redirect) : '/buyer/';
        }, 800);
      } else {
        showAlertBox(result.error || 'Something went wrong. Please try again.');
        if (btn) btn.disabled = false;
        if (spinner) spinner.classList.remove('show');
        if (label) label.textContent = 'Create Account';
      }
    } catch (err) {
      console.error('Signup error:', err);
      showAlertBox('Something went wrong. Please try again.');
      if (btn) btn.disabled = false;
      if (spinner) spinner.classList.remove('show');
      if (label) label.textContent = 'Create Account';
    }
  });
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initLayout();
    initSignupPage();
  });
} else {
  initLayout();
  initSignupPage();
}

window.Ameza = window.Ameza || {};
window.Ameza.initSignupPage = initSignupPage;
