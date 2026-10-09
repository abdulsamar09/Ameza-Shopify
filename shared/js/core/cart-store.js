/**
 * AMEZA Cart State Store — shared/js/core/cart-store.js
 * Single source of truth for cart persistence, counts, and minor-unit subtotal calculations.
 */

const CART_KEY = 'ameza_cart_v2';
const LEGACY_KEY = 'ameza_cart';

export function getCart() {
  try {
    const raw = localStorage.getItem(CART_KEY) || localStorage.getItem(LEGACY_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function saveCart(cart) {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
    localStorage.setItem(LEGACY_KEY, JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent('ameza:cart-updated', { detail: { cart } }));
  } catch (e) {
    console.error('[CartStore] Failed to save cart:', e);
  }
}

export function getCartCount() {
  const cart = getCart();
  return cart.reduce((sum, item) => sum + (Number(item.quantity) || 1), 0);
}

export function getCartSubtotalCents() {
  const cart = getCart();
  return cart.reduce((sum, item) => {
    const priceCents = Number(item.priceCents !== undefined ? item.priceCents : item.price) || 0;
    const qty = Number(item.quantity) || 1;
    return sum + (priceCents * qty);
  }, 0);
}
