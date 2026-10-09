/**
 * AMEZA Session Engine — shared/js/core/session.js
 * Central management of authenticated user sessions and RBAC checks.
 */

export const SESSION_KEY = 'ameza_session';
export const TOKEN_KEY = 'ameza_auth_token';

/**
 * Retrieves the current session object, or null if guest.
 * @returns {Object|null}
 */
export function getSession() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    console.warn('[Session] Failed to read session data:', e);
    return null;
  }
}

/**
 * Persists an authenticated user session.
 * @param {Object} session
 */
export function setSession(session) {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    window.dispatchEvent(new CustomEvent('ameza:session-change', { detail: session }));
  } catch (e) {
    console.error('[Session] Failed to persist session:', e);
  }
}

/**
 * Clears authentication state across storage keys.
 */
export function clearSession() {
  localStorage.removeItem(SESSION_KEY);
  localStorage.removeItem(TOKEN_KEY);
  window.dispatchEvent(new CustomEvent('ameza:session-change', { detail: null }));
}

/**
 * Checks if current user possesses one of the designated roles.
 * @param {string|string[]} roles
 * @returns {boolean}
 */
export function hasRole(roles) {
  const session = getSession();
  if (!session || !session.role) return false;
  const roleList = Array.isArray(roles) ? roles : [roles];
  return roleList.includes(session.role.toLowerCase());
}
