/**
 * AMEZA Admin Console — Taxonomy & Category Management Engine (js/admin-categories.js)
 * Manages hierarchical category tree, commission overrides, and catalog mappings.
 */
import { escapeHTML } from '/shared/js/core/utils.js';

const STORAGE_KEY = 'ameza_catalog_categories';

const DEFAULT_CATEGORIES = [
  {
    id: 'clothing',
    name: 'Clothing & Fashion',
    slug: 'clothing',
    emoji: '👗',
    itemCount: 16,
    commissionRatePct: 10,
    active: true,
    subcategories: [
      { id: 'mens-clothing', name: "Men's Apparel", slug: 'mens-clothing', itemCount: 7, commissionRatePct: 10, active: true },
      { id: 'womens-clothing', name: "Women's Apparel", slug: 'womens-clothing', itemCount: 6, commissionRatePct: 10, active: true },
      { id: 'linen-collection', name: 'Linen & Casuals', slug: 'linen-collection', itemCount: 3, commissionRatePct: 10, active: true }
    ]
  },
  {
    id: 'leather-goods',
    name: 'Leather Belts & Wallets',
    slug: 'leather-goods',
    emoji: '👜',
    itemCount: 14,
    commissionRatePct: 12,
    active: true,
    subcategories: [
      { id: 'belts', name: 'Full Grain Belts', slug: 'belts', itemCount: 6, commissionRatePct: 12, active: true },
      { id: 'wallets', name: 'Slim Wallets & Cardholders', slug: 'wallets', itemCount: 5, commissionRatePct: 12, active: true },
      { id: 'leather-bags', name: 'Weekender Bags & Totes', slug: 'leather-bags', itemCount: 3, commissionRatePct: 12, active: true }
    ]
  },
  {
    id: 'electronics',
    name: 'Smart Electronics',
    slug: 'electronics',
    emoji: '🎧',
    itemCount: 12,
    commissionRatePct: 8,
    active: true,
    subcategories: [
      { id: 'audio', name: 'Wireless Audio & Earbuds', slug: 'audio', itemCount: 5, commissionRatePct: 8, active: true },
      { id: 'accessories', name: 'MagSafe & Fast Chargers', slug: 'accessories', itemCount: 4, commissionRatePct: 8, active: true },
      { id: 'smart-home', name: 'Connected Home Hubs', slug: 'smart-home', itemCount: 3, commissionRatePct: 8, active: true }
    ]
  },
  {
    id: 'watches',
    name: 'Horology & Watches',
    slug: 'watches',
    emoji: '⌚',
    itemCount: 9,
    commissionRatePct: 15,
    active: true,
    subcategories: [
      { id: 'automatic-watches', name: 'Automatic Mechanical', slug: 'automatic-watches', itemCount: 4, commissionRatePct: 15, active: true },
      { id: 'chronographs', name: 'Chronographs', slug: 'chronographs', itemCount: 3, commissionRatePct: 15, active: true },
      { id: 'minimalist-watches', name: 'Minimalist Quartz', slug: 'minimalist-watches', itemCount: 2, commissionRatePct: 15, active: true }
    ]
  }
];

export function getCategories() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse categories', e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_CATEGORIES));
}

export function saveCategories(categories) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
}

let collapsedState = {};
let searchQuery = '';

export function initAdminCategories() {
  renderCategoriesView();
  bindCategoriesEvents();
}



function showAdminToast(msg, type = 'success') {
  const toast = document.createElement('div');
  toast.style.position = 'fixed';
  toast.style.bottom = '24px';
  toast.style.right = '24px';
  toast.style.padding = '12px 20px';
  toast.style.borderRadius = '8px';
  toast.style.fontSize = '13.5px';
  toast.style.fontWeight = '600';
  toast.style.color = '#FFFFFF';
  toast.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
  toast.style.zIndex = '9999';
  toast.style.transition = 'all 0.3s ease';
  toast.style.background = type === 'error' ? '#EF4444' : type === 'info' ? '#3B82F6' : '#10B981';
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

function renderCategoriesView() {
  const container = document.getElementById('categories-container');
  if (!container) return;

  const categories = getCategories();

  // Metrics
  let totalSubcats = 0;
  let totalProducts = 0;
  let commissionSum = 0;
  categories.forEach(c => {
    totalProducts += c.itemCount || 0;
    commissionSum += (c.commissionRatePct || 10);
    totalSubcats += (c.subcategories || []).length;
  });
  const avgCommission = categories.length > 0 ? (commissionSum / categories.length).toFixed(1) : '10.0';

  // Filter if search
  const filtered = categories.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    const matchParent = c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q);
    const matchSub = (c.subcategories || []).some(s => s.name.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q));
    return matchParent || matchSub;
  });

  container.innerHTML = `
    <!-- Top Action Header -->
    <header class="seller-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <div>
        <h1 style="font-size: 1.6rem; font-weight: 800; color: var(--dark); margin: 0;">Catalog Taxonomy & Categories</h1>
        <p style="color: var(--text-muted); font-size: 0.88rem; margin: 4px 0 0;">Manage parent categories, sub-classifications, product assignments, and category commission rates.</p>
      </div>
      <div style="display: flex; gap: 10px;">
        <button type="button" id="btn-export-taxonomy" class="btn-secondary" style="height: 38px; padding: 0 16px; border: 1px solid var(--border); border-radius: 6px; background: #FFFFFF; font-weight: 600; font-size: 13px; cursor: pointer;">
          Export Taxonomy
        </button>
        <button type="button" id="btn-new-category" class="btn-primary" style="height: 38px; padding: 0 18px; border-radius: 6px; font-weight: 700; font-size: 13px; cursor: pointer;">
          + New Category
        </button>
      </div>
    </header>

    <!-- Metrics Row -->
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
      <div class="seller-card" style="padding: 18px; border-radius: 10px;">
        <div style="font-size: 11.5px; font-weight: 700; text-transform: uppercase; color: var(--text-muted);">Parent Categories</div>
        <div style="font-size: 26px; font-weight: 800; color: var(--dark); margin-top: 4px;">${categories.length}</div>
        <div style="font-size: 11.5px; color: #10B981; margin-top: 4px;">Active in main navigation</div>
      </div>
      <div class="seller-card" style="padding: 18px; border-radius: 10px;">
        <div style="font-size: 11.5px; font-weight: 700; text-transform: uppercase; color: var(--text-muted);">Subcategories</div>
        <div style="font-size: 26px; font-weight: 800; color: var(--dark); margin-top: 4px;">${totalSubcats}</div>
        <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 4px;">Nested classifications</div>
      </div>
      <div class="seller-card" style="padding: 18px; border-radius: 10px;">
        <div style="font-size: 11.5px; font-weight: 700; text-transform: uppercase; color: var(--text-muted);">Products Mapped</div>
        <div style="font-size: 26px; font-weight: 800; color: var(--dark); margin-top: 4px;">${totalProducts}</div>
        <div style="font-size: 11.5px; color: #10B981; margin-top: 4px;">100% catalog coverage</div>
      </div>
      <div class="seller-card" style="padding: 18px; border-radius: 10px;">
        <div style="font-size: 11.5px; font-weight: 700; text-transform: uppercase; color: var(--text-muted);">Avg. Commission Rate</div>
        <div style="font-size: 26px; font-weight: 800; color: #10B981; margin-top: 4px;">${avgCommission}%</div>
        <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 4px;">Baseline platform fee</div>
      </div>
    </div>

    <!-- Tree Table Card -->
    <div class="seller-card" style="border-radius: 12px; overflow: hidden; padding: 0;">
      <!-- Toolbar -->
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid var(--border); background: #FAFBF9;">
        <div style="position: relative; width: 340px;">
          <input type="text" id="cat-search-input" value="${escapeHTML(searchQuery)}" placeholder="Search categories, subcategories, or slug..." style="width: 100%; height: 36px; padding: 0 12px; border: 1px solid var(--border); border-radius: 6px; font-size: 13px; background: #FFFFFF;">
        </div>
        <div style="display: flex; gap: 8px;">
          <button type="button" id="btn-expand-all" style="background: none; border: 1px solid var(--border); border-radius: 6px; padding: 6px 12px; font-size: 12px; cursor: pointer; color: var(--text-muted);">Expand All</button>
          <button type="button" id="btn-collapse-all" style="background: none; border: 1px solid var(--border); border-radius: 6px; padding: 6px 12px; font-size: 12px; cursor: pointer; color: var(--text-muted);">Collapse All</button>
        </div>
      </div>

      <!-- Hierarchical Tree Table -->
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border); background: #F9FAFB; font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">
              <th style="padding: 12px 20px; width: 380px;">Category & Classification</th>
              <th style="padding: 12px 16px;">URL Slug</th>
              <th style="padding: 12px 16px; text-align: center;">Products</th>
              <th style="padding: 12px 16px; text-align: center;">Default Commission</th>
              <th style="padding: 12px 16px; text-align: center;">Status</th>
              <th style="padding: 12px 20px; text-align: right;">Actions</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.map(cat => {
              const isCollapsed = !!collapsedState[cat.id];
              const subcats = cat.subcategories || [];

              return `
                <!-- Parent Category Row -->
                <tr style="border-bottom: 1px solid var(--border); background: #FFFFFF; font-size: 13.5px;" data-cat-id="${cat.id}">
                  <td style="padding: 14px 20px;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                      <button type="button" class="btn-toggle-collapse" data-id="${cat.id}" style="background: none; border: none; cursor: pointer; color: var(--text-muted); font-size: 12px; width: 20px; text-align: center;">
                        ${isCollapsed ? '▶' : '▼'}
                      </button>
                      <span style="font-size: 18px;">${cat.emoji || '📁'}</span>
                      <strong style="color: var(--dark); font-size: 14px;">${escapeHTML(cat.name)}</strong>
                      <span style="font-size: 11px; background: #E5E7EB; padding: 2px 6px; border-radius: 4px; color: #4B5563;">${subcats.length} sub</span>
                    </div>
                  </td>
                  <td style="padding: 14px 16px; font-family: monospace; font-size: 12.5px; color: #4B5563;">
                    /${escapeHTML(cat.slug)}
                  </td>
                  <td style="padding: 14px 16px; text-align: center; font-weight: 700; color: var(--dark);">
                    ${cat.itemCount || 0}
                  </td>
                  <td style="padding: 14px 16px; text-align: center;">
                    <span style="background: #ECFDF5; color: #047857; font-weight: 800; padding: 3px 10px; border-radius: 6px; font-size: 12px;">
                      ${cat.commissionRatePct || 10}%
                    </span>
                  </td>
                  <td style="padding: 14px 16px; text-align: center;">
                    <span style="background: #DEF7EC; color: #03543F; font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 999px;">
                      ${cat.active ? 'Active' : 'Hidden'}
                    </span>
                  </td>
                  <td style="padding: 14px 20px; text-align: right;">
                    <div style="display: inline-flex; gap: 6px;">
                      <button type="button" class="btn-add-subcat" data-parent-id="${cat.id}" data-parent-name="${escapeHTML(cat.name)}" title="Add Subcategory" style="padding: 4px 8px; border: 1px solid var(--border); border-radius: 4px; background: #FFFFFF; font-size: 11.5px; cursor: pointer;">
                        + Sub
                      </button>
                      <button type="button" class="btn-edit-category" data-cat-id="${cat.id}" data-is-sub="false" title="Edit Category" style="padding: 4px 8px; border: 1px solid var(--border); border-radius: 4px; background: #FFFFFF; font-size: 11.5px; cursor: pointer;">
                        Edit
                      </button>
                      <button type="button" class="btn-delete-category" data-cat-id="${cat.id}" data-is-sub="false" title="Delete" style="padding: 4px 8px; border: 1px solid #FECACA; border-radius: 4px; background: #FEF2F2; color: #DC2626; font-size: 11.5px; cursor: pointer;">
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>

                <!-- Nested Subcategories -->
                ${!isCollapsed ? subcats.map(sub => `
                  <tr style="border-bottom: 1px solid #F3F4F6; background: #F9FAFB; font-size: 13px;" data-sub-id="${sub.id}">
                    <td style="padding: 10px 20px 10px 48px;">
                      <div style="display: flex; align-items: center; gap: 8px;">
                        <span style="color: #9CA3AF;">└─</span>
                        <span style="color: var(--dark); font-weight: 600;">${escapeHTML(sub.name)}</span>
                      </div>
                    </td>
                    <td style="padding: 10px 16px; font-family: monospace; font-size: 12px; color: #6B7280;">
                      /${escapeHTML(cat.slug)}/${escapeHTML(sub.slug)}
                    </td>
                    <td style="padding: 10px 16px; text-align: center; color: #4B5563;">
                      ${sub.itemCount || 0}
                    </td>
                    <td style="padding: 10px 16px; text-align: center;">
                      <span style="color: #6B7280; font-size: 12px;">
                        ${sub.commissionRatePct || cat.commissionRatePct || 10}%
                      </span>
                    </td>
                    <td style="padding: 10px 16px; text-align: center;">
                      <span style="background: #DEF7EC; color: #03543F; font-size: 10.5px; font-weight: 600; padding: 2px 6px; border-radius: 999px;">
                        Active
                      </span>
                    </td>
                    <td style="padding: 10px 20px; text-align: right;">
                      <div style="display: inline-flex; gap: 6px;">
                        <button type="button" class="btn-edit-category" data-cat-id="${sub.id}" data-parent-id="${cat.id}" data-is-sub="true" style="padding: 3px 6px; border: 1px solid var(--border); border-radius: 4px; background: #FFFFFF; font-size: 11px; cursor: pointer;">
                          Edit
                        </button>
                        <button type="button" class="btn-delete-category" data-cat-id="${sub.id}" data-parent-id="${cat.id}" data-is-sub="true" style="padding: 3px 6px; border: 1px solid #FECACA; border-radius: 4px; background: #FEF2F2; color: #DC2626; font-size: 11px; cursor: pointer;">
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                `).join('') : ''}
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Category Slide-over Drawer Backdrop & Drawer -->
    <div id="category-drawer-backdrop" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 10000; backdrop-filter: blur(2px);"></div>
    <div id="category-drawer" style="position: fixed; top: 0; right: -480px; width: 440px; height: 100vh; background: #FFFFFF; box-shadow: -4px 0 25px rgba(0,0,0,0.15); z-index: 10001; transition: right 0.3s ease; display: flex; flex-direction: column;">
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 20px; border-bottom: 1px solid var(--border);">
        <h2 id="drawer-title" style="font-size: 16px; font-weight: 800; color: var(--dark); margin: 0;">Add Category</h2>
        <button type="button" id="btn-close-cat-drawer" style="background: none; border: none; font-size: 20px; cursor: pointer; color: var(--text-muted);">&times;</button>
      </div>

      <div style="flex: 1; overflow-y: auto; padding: 20px; display: flex; flex-direction: column; gap: 16px;">
        <input type="hidden" id="drawer-cat-id" value="">
        <input type="hidden" id="drawer-is-sub" value="false">

        <div>
          <label style="display: block; font-size: 12.5px; font-weight: 700; color: var(--dark); margin-bottom: 6px;">Category Name</label>
          <input type="text" id="drawer-name" placeholder="e.g. Footwear & Shoes" style="width: 100%; height: 38px; padding: 0 12px; border: 1px solid var(--border); border-radius: 6px; font-size: 13.5px;">
        </div>

        <div>
          <label style="display: block; font-size: 12.5px; font-weight: 700; color: var(--dark); margin-bottom: 6px;">URL Slug</label>
          <input type="text" id="drawer-slug" placeholder="e.g. footwear-shoes" style="width: 100%; height: 38px; padding: 0 12px; border: 1px solid var(--border); border-radius: 6px; font-family: monospace; font-size: 13px;">
        </div>

        <div>
          <label style="display: block; font-size: 12.5px; font-weight: 700; color: var(--dark); margin-bottom: 6px;">Parent Category</label>
          <select id="drawer-parent" style="width: 100%; height: 38px; padding: 0 12px; border: 1px solid var(--border); border-radius: 6px; font-size: 13.5px;">
            <option value="">None (Top-Level Category)</option>
            ${categories.map(c => `<option value="${c.id}">${c.emoji || ''} ${escapeHTML(c.name)}</option>`).join('')}
          </select>
        </div>

        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 12px;">
          <div>
            <label style="display: block; font-size: 12.5px; font-weight: 700; color: var(--dark); margin-bottom: 6px;">Icon / Emoji</label>
            <input type="text" id="drawer-emoji" value="📁" style="width: 100%; height: 38px; padding: 0 12px; border: 1px solid var(--border); border-radius: 6px; font-size: 16px;">
          </div>
          <div>
            <label style="display: block; font-size: 12.5px; font-weight: 700; color: var(--dark); margin-bottom: 6px;">Commission Rate (%)</label>
            <input type="number" id="drawer-commission" value="10" min="0" max="50" step="0.5" style="width: 100%; height: 38px; padding: 0 12px; border: 1px solid var(--border); border-radius: 6px; font-size: 13.5px; font-weight: 700;">
          </div>
        </div>

        <div>
          <label style="display: block; font-size: 12.5px; font-weight: 700; color: var(--dark); margin-bottom: 6px;">Status</label>
          <select id="drawer-status" style="width: 100%; height: 38px; padding: 0 12px; border: 1px solid var(--border); border-radius: 6px; font-size: 13.5px;">
            <option value="true">Active (Visible on storefront)</option>
            <option value="false">Hidden / Inactive</option>
          </select>
        </div>
      </div>

      <div style="padding: 16px 20px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; gap: 10px; background: #F9FAFB;">
        <button type="button" id="btn-cancel-drawer" style="padding: 8px 16px; border: 1px solid var(--border); border-radius: 6px; background: #FFFFFF; font-size: 13px; font-weight: 600; cursor: pointer;">Cancel</button>
        <button type="button" id="btn-save-category-drawer" class="btn-primary" style="padding: 8px 18px; border-radius: 6px; font-size: 13px; font-weight: 700; cursor: pointer;">Save Category</button>
      </div>
    </div>
  `;
}

function openDrawer(catData = null, parentId = null) {
  const drawer = document.getElementById('category-drawer');
  const backdrop = document.getElementById('category-drawer-backdrop');
  if (!drawer || !backdrop) return;

  const title = document.getElementById('drawer-title');
  const idInput = document.getElementById('drawer-cat-id');
  const isSubInput = document.getElementById('drawer-is-sub');
  const nameInput = document.getElementById('drawer-name');
  const slugInput = document.getElementById('drawer-slug');
  const parentSelect = document.getElementById('drawer-parent');
  const emojiInput = document.getElementById('drawer-emoji');
  const commInput = document.getElementById('drawer-commission');
  const statusSelect = document.getElementById('drawer-status');

  if (catData) {
    title.textContent = `Edit Category: ${catData.name}`;
    idInput.value = catData.id;
    nameInput.value = catData.name;
    slugInput.value = catData.slug;
    parentSelect.value = parentId || '';
    emojiInput.value = catData.emoji || '📁';
    commInput.value = catData.commissionRatePct || 10;
    statusSelect.value = catData.active !== false ? 'true' : 'false';
    isSubInput.value = parentId ? 'true' : 'false';
  } else {
    title.textContent = parentId ? 'Add Subcategory' : 'Add New Category';
    idInput.value = '';
    nameInput.value = '';
    slugInput.value = '';
    parentSelect.value = parentId || '';
    emojiInput.value = parentId ? '🏷️' : '📁';
    commInput.value = 10;
    statusSelect.value = 'true';
    isSubInput.value = parentId ? 'true' : 'false';
  }

  backdrop.style.display = 'block';
  drawer.style.right = '0';
}

function closeDrawer() {
  const drawer = document.getElementById('category-drawer');
  const backdrop = document.getElementById('category-drawer-backdrop');
  if (drawer) drawer.style.right = '-480px';
  if (backdrop) backdrop.style.display = 'none';
}

function bindCategoriesEvents() {
  // Search
  const searchInput = document.getElementById('cat-search-input');
  searchInput?.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderCategoriesView();
    bindCategoriesEvents();
    const el = document.getElementById('cat-search-input');
    if (el) {
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
  });

  // Expand / collapse all
  document.getElementById('btn-expand-all')?.addEventListener('click', () => {
    collapsedState = {};
    renderCategoriesView();
    bindCategoriesEvents();
  });

  document.getElementById('btn-collapse-all')?.addEventListener('click', () => {
    const cats = getCategories();
    cats.forEach(c => collapsedState[c.id] = true);
    renderCategoriesView();
    bindCategoriesEvents();
  });

  // Toggle single row collapse
  document.querySelectorAll('.btn-toggle-collapse').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.getAttribute('data-id');
      collapsedState[id] = !collapsedState[id];
      renderCategoriesView();
      bindCategoriesEvents();
    });
  });

  // Open drawer buttons
  document.getElementById('btn-new-category')?.addEventListener('click', () => {
    openDrawer(null, null);
  });

  document.querySelectorAll('.btn-add-subcat').forEach(btn => {
    btn.addEventListener('click', () => {
      const parentId = btn.getAttribute('data-parent-id');
      openDrawer(null, parentId);
    });
  });

  document.querySelectorAll('.btn-edit-category').forEach(btn => {
    btn.addEventListener('click', () => {
      const catId = btn.getAttribute('data-cat-id');
      const isSub = btn.getAttribute('data-is-sub') === 'true';
      const parentId = btn.getAttribute('data-parent-id');

      const cats = getCategories();
      let target = null;
      if (isSub) {
        const parent = cats.find(c => c.id === parentId);
        target = (parent?.subcategories || []).find(s => s.id === catId);
      } else {
        target = cats.find(c => c.id === catId);
      }

      if (target) {
        openDrawer(target, parentId);
      }
    });
  });

  // Delete category
  document.querySelectorAll('.btn-delete-category').forEach(btn => {
    btn.addEventListener('click', () => {
      const catId = btn.getAttribute('data-cat-id');
      const isSub = btn.getAttribute('data-is-sub') === 'true';
      const parentId = btn.getAttribute('data-parent-id');

      if (!confirm(`Are you sure you want to delete this category?`)) return;

      let cats = getCategories();
      if (isSub) {
        const parent = cats.find(c => c.id === parentId);
        if (parent) {
          parent.subcategories = (parent.subcategories || []).filter(s => s.id !== catId);
        }
      } else {
        cats = cats.filter(c => c.id !== catId);
      }

      saveCategories(cats);
      renderCategoriesView();
      bindCategoriesEvents();
      showAdminToast('Category deleted successfully');
    });
  });

  // Drawer events
  document.getElementById('btn-close-cat-drawer')?.addEventListener('click', closeDrawer);
  document.getElementById('btn-cancel-drawer')?.addEventListener('click', closeDrawer);
  document.getElementById('category-drawer-backdrop')?.addEventListener('click', closeDrawer);

  // Auto-slugify name
  document.getElementById('drawer-name')?.addEventListener('input', (e) => {
    const slugInput = document.getElementById('drawer-slug');
    if (slugInput && !slugInput.dataset.manual) {
      slugInput.value = e.target.value.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    }
  });

  document.getElementById('drawer-slug')?.addEventListener('input', (e) => {
    e.target.dataset.manual = 'true';
  });

  // Save drawer
  document.getElementById('btn-save-category-drawer')?.addEventListener('click', () => {
    const id = document.getElementById('drawer-cat-id').value;
    const isSub = document.getElementById('drawer-is-sub').value === 'true';
    const name = document.getElementById('drawer-name').value.trim();
    const slug = document.getElementById('drawer-slug').value.trim();
    const parentId = document.getElementById('drawer-parent').value;
    const emoji = document.getElementById('drawer-emoji').value.trim() || '📁';
    const commission = parseFloat(document.getElementById('drawer-commission').value) || 10;
    const active = document.getElementById('drawer-status').value === 'true';

    if (!name || !slug) {
      showAdminToast('Category name and slug are required', 'error');
      return;
    }

    let cats = getCategories();

    if (id) {
      // Edit existing
      if (isSub && parentId) {
        const parent = cats.find(c => c.id === parentId);
        const sub = (parent?.subcategories || []).find(s => s.id === id);
        if (sub) {
          sub.name = name;
          sub.slug = slug;
          sub.commissionRatePct = commission;
          sub.active = active;
        }
      } else {
        const parent = cats.find(c => c.id === id);
        if (parent) {
          parent.name = name;
          parent.slug = slug;
          parent.emoji = emoji;
          parent.commissionRatePct = commission;
          parent.active = active;
        }
      }
      showAdminToast(`Updated category "${name}"`);
    } else {
      // Create new
      const newId = slug;
      if (parentId) {
        const parent = cats.find(c => c.id === parentId);
        if (parent) {
          parent.subcategories = parent.subcategories || [];
          parent.subcategories.push({
            id: newId,
            name,
            slug,
            itemCount: 0,
            commissionRatePct: commission,
            active
          });
        }
      } else {
        cats.push({
          id: newId,
          name,
          slug,
          emoji,
          itemCount: 0,
          commissionRatePct: commission,
          active,
          subcategories: []
        });
      }
      showAdminToast(`Created new category "${name}"`);
    }

    saveCategories(cats);
    closeDrawer();
    renderCategoriesView();
    bindCategoriesEvents();
  });

  // Export taxonomy CSV
  document.getElementById('btn-export-taxonomy')?.addEventListener('click', () => {
    const cats = getCategories();
    const rows = [
      ['Level', 'Parent ID', 'Category ID', 'Name', 'Slug', 'Commission Pct', 'Products Count', 'Active'],
    ];

    cats.forEach(c => {
      rows.push(['Parent', 'ROOT', c.id, `"${c.name}"`, c.slug, `${c.commissionRatePct}%`, c.itemCount || 0, c.active ? 'Yes' : 'No']);
      (c.subcategories || []).forEach(s => {
        rows.push(['Subcategory', c.id, s.id, `"${s.name}"`, s.slug, `${s.commissionRatePct || c.commissionRatePct}%`, s.itemCount || 0, s.active ? 'Yes' : 'No']);
      });
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'ameza_catalog_taxonomy.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showAdminToast('Downloaded taxonomy CSV report');
  });
}
