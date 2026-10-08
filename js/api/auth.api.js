/**
 * AMEZA Auth API Engine — js/api/auth.api.js
 * Interfaces with Supabase Auth with seamless fallback to client-side auth.
 */

import { config } from './client.js';

export const AuthAPI = {
  isConfigured() {
    return config.isConfigured();
  },

  async signUp({ email, password, firstName, lastName, phone }) {
    if (this.isConfigured()) {
      try {
        const res = await fetch(`${config.supabaseUrl}/auth/v1/signup`, {
          method: 'POST',
          headers: {
            'apikey': config.supabaseKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email,
            password,
            data: { first_name: firstName, last_name: lastName, phone }
          })
        });
        const data = await res.json();
        if (!res.ok) {
          return { success: false, error: data.error_description || data.msg || 'Registration failed' };
        }
        return { success: true, user: data.user, session: data.session };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    // Fallback to window.AmezaAuth
    if (window.AmezaAuth && typeof window.AmezaAuth.register === 'function') {
      return window.AmezaAuth.register({ email, password, firstName, lastName, phone });
    }
    return { success: false, error: 'Auth system unavailable' };
  },

  async signIn({ email, password }) {
    if (this.isConfigured()) {
      try {
        const res = await fetch(`${config.supabaseUrl}/auth/v1/token?grant_type=password`, {
          method: 'POST',
          headers: {
            'apikey': config.supabaseKey,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) {
          return { success: false, error: data.error_description || data.msg || 'Invalid credentials' };
        }

        const session = {
          userId: data.user.id,
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          expiresAt: Date.now() + (data.expires_in * 1000),
          user: {
            id: data.user.id,
            email: data.user.email,
            firstName: data.user.user_metadata?.first_name || '',
            lastName: data.user.user_metadata?.last_name || '',
            phone: data.user.user_metadata?.phone || '',
            role: 'customer'
          }
        };

        localStorage.setItem('ameza_session', JSON.stringify(session));
        return { success: true, session, user: session.user };
      } catch (err) {
        return { success: false, error: err.message };
      }
    }

    // Fallback to window.AmezaAuth
    if (window.AmezaAuth && typeof window.AmezaAuth.login === 'function') {
      return window.AmezaAuth.login({ email, password });
    }
    return { success: false, error: 'Auth system unavailable' };
  },

  async signOut() {
    localStorage.removeItem('ameza_session');
    if (window.AmezaAuth && typeof window.AmezaAuth.logout === 'function') {
      window.AmezaAuth.logout();
    }
  },

  getCurrentUser() {
    const session = JSON.parse(localStorage.getItem('ameza_session') || 'null');
    if (session && session.user && (!session.expiresAt || Date.now() < session.expiresAt)) {
      return session.user;
    }
    if (window.AmezaAuth && typeof window.AmezaAuth.getCurrentUser === 'function') {
      return window.AmezaAuth.getCurrentUser();
    }
    return null;
  },

  isLoggedIn() {
    return Boolean(this.getCurrentUser());
  }
};
