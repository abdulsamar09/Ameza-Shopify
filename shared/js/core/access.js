/**
 * AMEZA Access & RBAC Guard — shared/js/core/access.js
 * Inspects body data-access attribute and enforces role-based redirection.
 */

import { getSession } from './session.js';

export function checkAccess() {
  const accessRequired = document.body.getAttribute('data-access') || 'public';
  if (accessRequired === 'public') return true;

  const session = getSession();

  // If not logged in, redirect to login
  if (!session) {
    const returnUrl = encodeURIComponent(window.location.pathname + window.location.search);
    window.location.href = `/auth/login.html?return=${returnUrl}`;
    return false;
  }

  const role = (session.role || 'buyer').toLowerCase();

  switch (accessRequired) {
    case 'buyer':
      if (role !== 'buyer' && role !== 'seller' && role !== 'admin') {
        window.location.href = '/auth/login.html';
        return false;
      }
      break;

    case 'seller':
      if (role !== 'seller' && role !== 'admin') {
        window.location.href = '/onboarding/sell-with-us.html';
        return false;
      }
      break;

    case 'admin':
    case 'staff':
      if (role !== 'admin' && role !== 'staff') {
        window.location.href = '/admin/login.html';
        return false;
      }
      break;
  }

  return true;
}

// Auto-evaluate access when script mounts
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', checkAccess);
  } else {
    checkAccess();
  }
}
