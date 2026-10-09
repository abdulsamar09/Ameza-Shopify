/**
 * AMEZA Auth Verify Email Page Module — auth/js/pages/verify-email.js
 */

import { initLayout } from '/shared/js/core/layout.js';
import '/auth/js/auth.js';

export function initVerifyEmailPage() {
  const Auth = window.AmezaAuth;
  let pendingUserId = sessionStorage.getItem('ameza_pending_verify_uid');
  let pendingToken  = sessionStorage.getItem('ameza_pending_verify_token');
  let resendTimer = null;
  let resendSeconds = 0;

  function showState(stateId) {
    ['verify-default-state', 'verify-success-state', 'verify-expired-state'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = (id === stateId) ? 'block' : 'none';
    });
  }

  function showAlert(msg, type = 'error') {
    const a = document.getElementById('verify-alert');
    const t = document.getElementById('verify-alert-msg');
    if (a && t) {
      a.className = `auth-alert alert-${type} show`;
      t.textContent = msg;
    }
  }

  const urlParams = new URLSearchParams(window.location.search);
  const urlToken = urlParams.get('token');
  if (urlToken && Auth && Auth.verifyEmail) {
    const result = Auth.verifyEmail(urlToken);
    if (result.success) {
      sessionStorage.removeItem('ameza_pending_verify_uid');
      sessionStorage.removeItem('ameza_pending_verify_token');
      showState('verify-success-state');
      Auth.createSession && Auth.createSession(result.userId);
    } else {
      showState('verify-expired-state');
      const expMsg = document.getElementById('expired-msg');
      if (expMsg) expMsg.textContent = result.error;
    }
  } else {
    showState('verify-default-state');

    if (pendingUserId && Auth && Auth.findUserById) {
      const user = Auth.findUserById(pendingUserId);
      if (user) {
        const emailDisp = document.getElementById('verify-email-display');
        if (emailDisp) emailDisp.textContent = user.email;
        if (user.emailVerified) {
          showState('verify-success-state');
        }
      }
    }

    if (pendingToken) {
      const tokenBox = document.getElementById('dev-token-box');
      const tokenDisplay = document.getElementById('dev-token-display');
      if (tokenBox) tokenBox.style.display = 'block';
      if (tokenDisplay) tokenDisplay.textContent = `verify-email.html?token=${pendingToken}`;
    }
  }

  // Demo verify button
  document.getElementById('btn-verify-demo')?.addEventListener('click', () => {
    if (!pendingUserId) {
      showAlert('No pending verification found. Please sign up first.', 'error');
      return;
    }
    const token = pendingToken || (Auth && Auth.findUserById && Auth.findUserById(pendingUserId)?.verifyToken);
    if (!token) {
      showAlert('Verification token not found.', 'error');
      return;
    }
    if (Auth && Auth.verifyEmail) {
      const result = Auth.verifyEmail(token);
      if (result.success) {
        sessionStorage.removeItem('ameza_pending_verify_uid');
        sessionStorage.removeItem('ameza_pending_verify_token');
        showState('verify-success-state');
      } else {
        showAlert(result.error, 'error');
      }
    }
  });

  function startResendCountdown(seconds = 60) {
    resendSeconds = seconds;
    const btn = document.getElementById('btn-resend');
    const countdown = document.getElementById('resend-countdown');
    if (btn) btn.disabled = true;

    if (resendTimer) clearInterval(resendTimer);
    resendTimer = setInterval(() => {
      resendSeconds--;
      if (countdown) countdown.textContent = `You can resend in ${resendSeconds}s`;
      if (resendSeconds <= 0) {
        clearInterval(resendTimer);
        if (btn) btn.disabled = false;
        if (countdown) countdown.textContent = '';
      }
    }, 1000);
  }

  document.getElementById('btn-resend')?.addEventListener('click', () => {
    if (!pendingUserId) {
      showAlert('No pending verification found. Please sign up first.', 'error');
      return;
    }
    if (Auth && Auth.resendVerificationEmail) {
      const result = Auth.resendVerificationEmail(pendingUserId);
      if (result.success) {
        pendingToken = result.token;
        sessionStorage.setItem('ameza_pending_verify_token', pendingToken);
        const tokenDisplay = document.getElementById('dev-token-display');
        const tokenBox = document.getElementById('dev-token-box');
        if (tokenDisplay) tokenDisplay.textContent = `verify-email.html?token=${pendingToken}`;
        if (tokenBox) tokenBox.style.display = 'block';
        showAlert('Verification email resent (demo). Check the token box above.', 'success');
        startResendCountdown(60);
      } else {
        showAlert(result.error, 'error');
      }
    }
  });

  document.getElementById('change-email-link')?.addEventListener('click', (e) => {
    e.preventDefault();
    const newEmail = prompt('Enter your new email address:');
    if (newEmail && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) {
      if (pendingUserId && Auth && Auth.updateUser) {
        Auth.updateUser(pendingUserId, {
          email: newEmail.toLowerCase().trim(),
          emailVerified: false,
        });
        if (Auth.resendVerificationEmail) {
          const resendResult = Auth.resendVerificationEmail(pendingUserId);
          if (resendResult.success) {
            pendingToken = resendResult.token;
            sessionStorage.setItem('ameza_pending_verify_token', pendingToken);
          }
        }
        const emailDisp = document.getElementById('verify-email-display');
        if (emailDisp) emailDisp.textContent = newEmail.toLowerCase().trim();
        showAlert('Email updated. Please verify your new address.', 'success');
      }
    } else if (newEmail) {
      alert('Please enter a valid email address.');
    }
  });

  startResendCountdown(60);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    initLayout();
    initVerifyEmailPage();
  });
} else {
  initLayout();
  initVerifyEmailPage();
}

window.Ameza = window.Ameza || {};
window.Ameza.initVerifyEmailPage = initVerifyEmailPage;
