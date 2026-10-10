/**
 * AMEZA Seller Dashboard - Add / Edit Product Controller (Screen B)
 * Plain Vanilla ES Modules - High Fidelity & Fully Interactive
 */

import { Icons } from './icons.js';
import { getProducts, saveProducts, COMMISSION_RATE, CATEGORIES_LIST, BRANDS_LIST, formatMoney } from './data.js';
import { showToast, escapeHTML } from '/seller/js/dashboard-shell.js';

let isDirty = false;
let editProductId = null;

// Product form state
let formState = {
  title: 'Premium Wireless Headphones',
  description: '<p>High-fidelity noise-cancelling wireless headphones with 40-hour battery life and ergonomic memory-foam cushions.</p>',
  media: [
    {
      url: '',
      isCover: true,
      name: 'white-headphones.png',
      svg: `<svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#D1D5DB" stroke-width="1.5"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" fill="#E5E7EB"/></svg>`
    },
    {
      url: '',
      isCover: false,
      name: 'dark-headphones.png',
      svg: `<svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#1F2937" stroke-width="1.5"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" fill="#374151"/></svg>`
    },
    {
      url: '',
      isCover: false,
      name: 'case.png',
      svg: `<svg width="60" height="60" viewBox="0 0 24 24" fill="#9CA3AF"><circle cx="12" cy="12" r="8"/><path d="M12 4a8 8 0 0 0-8 8h16a8 8 0 0 0-8-8z" fill="#D1D5DB"/><circle cx="12" cy="12" r="3" fill="#6B7280"/></svg>`
    }
  ],
  price: 99.00,
  compareAtPrice: 129.00,
  cost: 60.00,
  sku: 'AMZ-001',
  barcode: '123456789012',
  quantity: 50,
  weight: 0.5,
  weightUnit: 'kg',
  status: 'Draft',
  category: 'Electronics',
  brand: 'Ameza Audio',
  tags: ['headphones', 'wireless', 'audio'],
  options: {
    color: ['Black', 'White', 'Silver'],
    size: ['S', 'M', 'L', 'XL']
  },
  variants: [
    { name: 'Black / M', price: 99.00, sku: 'SKU-001-BLK-M', inventory: 20 },
    { name: 'White / L', price: 99.00, sku: 'SKU-002-WHT-L', inventory: 15 },
    { name: 'Silver / XL', price: 99.00, sku: 'SKU-003-SLV-XL', inventory: 10 }
  ]
};

export function initAddProduct() {
  checkEditMode();
  bindFormInputs();
  bindMedia();
  bindRichTextEditor();
  bindVariants();
  bindOrganization();
  bindActions();
  updateCalculations();
}

function checkEditMode() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (id) {
    editProductId = parseInt(id, 10);
    const products = getProducts();
    const existing = products.find(p => p.id === editProductId);
    if (existing) {
      document.getElementById('page-heading-title').textContent = 'Edit product';
      formState.title = existing.name;
      formState.price = existing.price / 100;
      formState.compareAtPrice = existing.compareAtPrice ? existing.compareAtPrice / 100 : formState.price * 1.3;
      formState.cost = existing.cost ? existing.cost / 100 : formState.price * 0.6;
      formState.sku = existing.sku;
      formState.quantity = existing.inventory;
      formState.category = existing.category;
      formState.status = existing.status === 'Active' ? 'Active' : 'Draft';
      if (existing.brand) formState.brand = existing.brand;
      if (existing.tags) formState.tags = existing.tags;
      populateFields();
    }
  }
}

function populateFields() {
  const titleInput = document.getElementById('product-title-input');
  if (titleInput) titleInput.value = formState.title;

  const descEditor = document.getElementById('product-desc-editor');
  if (descEditor) descEditor.innerHTML = formState.description;

  const priceInput = document.getElementById('product-price-input');
  if (priceInput) priceInput.value = formState.price.toFixed(2);

  const compInput = document.getElementById('product-compare-input');
  if (compInput) compInput.value = formState.compareAtPrice.toFixed(2);

  const costInput = document.getElementById('product-cost-input');
  if (costInput) costInput.value = formState.cost.toFixed(2);

  const skuInput = document.getElementById('product-sku-input');
  if (skuInput) skuInput.value = formState.sku;

  const qtyInput = document.getElementById('product-qty-input');
  if (qtyInput) qtyInput.value = formState.quantity;
}

function markDirty() {
  if (!isDirty) {
    isDirty = true;
    const bar = document.getElementById('unsaved-bar');
    if (bar) bar.classList.add('active');
  }
}

function unmarkDirty() {
  isDirty = false;
  const bar = document.getElementById('unsaved-bar');
  if (bar) bar.classList.remove('active');
}

function bindFormInputs() {
  window.addEventListener('beforeunload', (e) => {
    if (isDirty) {
      e.preventDefault();
      e.returnValue = '';
    }
  });

  const titleInput = document.getElementById('product-title-input');
  titleInput?.addEventListener('input', (e) => {
    formState.title = e.target.value;
    markDirty();
  });

  const priceInput = document.getElementById('product-price-input');
  priceInput?.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    formState.price = isNaN(val) ? 0 : val;
    markDirty();
    updateCalculations();
  });

  const compInput = document.getElementById('product-compare-input');
  compInput?.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    formState.compareAtPrice = isNaN(val) ? 0 : val;
    markDirty();
    updateCalculations();
  });

  const costInput = document.getElementById('product-cost-input');
  costInput?.addEventListener('input', (e) => {
    const val = parseFloat(e.target.value);
    formState.cost = isNaN(val) ? 0 : val;
    markDirty();
    updateCalculations();
  });

  const skuInput = document.getElementById('product-sku-input');
  skuInput?.addEventListener('input', (e) => {
    formState.sku = e.target.value;
    markDirty();
  });

  const qtyInput = document.getElementById('product-qty-input');
  qtyInput?.addEventListener('input', (e) => {
    const val = parseInt(e.target.value, 10);
    formState.quantity = isNaN(val) ? 0 : val;
    markDirty();
  });
}

function updateCalculations() {
  const price = formState.price;
  const comp = formState.compareAtPrice;
  const cost = formState.cost;

  // Margin & Profit
  const profit = Math.max(0, price - cost);
  const marginPct = price > 0 ? ((profit / price) * 100).toFixed(1) : '0.0';

  const marginValEl = document.getElementById('stat-margin-val');
  if (marginValEl) marginValEl.textContent = `${marginPct}%`;

  const profitValEl = document.getElementById('stat-profit-val');
  if (profitValEl) profitValEl.textContent = `$ ${profit.toFixed(2)}`;

  // Discount badge
  const discountBadge = document.getElementById('compare-discount-badge');
  if (discountBadge) {
    if (comp > price && price > 0) {
      const discount = Math.round(((comp - price) / comp) * 100);
      discountBadge.textContent = `-${discount}% off`;
      discountBadge.style.display = 'inline-block';
    } else {
      discountBadge.style.display = 'none';
    }
  }

  // Estimated Commission card
  const commission = Math.round(price * COMMISSION_RATE * 100) / 100;
  const youEarn = Math.max(0, price - commission);

  const commTextEl = document.getElementById('commission-headline-text');
  if (commTextEl) {
    commTextEl.textContent = `${Math.round(COMMISSION_RATE * 100)}% - you earn $${youEarn.toFixed(2)}`;
  }

  const commBreakdownEl = document.getElementById('commission-breakdown-text');
  if (commBreakdownEl) {
    commBreakdownEl.textContent = `$${price.toFixed(2)} - $${commission.toFixed(2)} (${Math.round(COMMISSION_RATE * 100)}%) commission = $${youEarn.toFixed(2)}`;
  }
}

function bindRichTextEditor() {
  const editor = document.getElementById('product-desc-editor');
  if (!editor) return;

  editor.addEventListener('input', () => {
    formState.description = sanitizeHtml(editor.innerHTML);
    markDirty();
  });

  document.querySelectorAll('.rte-btn[data-command]').forEach(btn => {
    btn.addEventListener('click', () => {
      const cmd = btn.dataset.command;
      if (cmd === 'createLink') {
        const url = prompt('Enter link URL:');
        if (url) document.execCommand(cmd, false, url);
      } else {
        document.execCommand(cmd, false, null);
      }
      editor.focus();
      markDirty();
    });
  });
}

function sanitizeHtml(html) {
  // Allow-list: p, br, strong, b, em, i, u, ul, ol, li, a, h2, h3, code
  const temp = document.createElement('div');
  temp.innerHTML = html;
  const allowed = ['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'UL', 'OL', 'LI', 'A', 'H2', 'H3', 'CODE'];

  function clean(node) {
    for (let i = node.childNodes.length - 1; i >= 0; i--) {
      const child = node.childNodes[i];
      if (child.nodeType === 1) { // Element
        if (!allowed.includes(child.nodeName)) {
          child.replaceWith(...child.childNodes);
        } else {
          // Remove dangerous attributes
          for (let a = child.attributes.length - 1; a >= 0; a--) {
            const attr = child.attributes[a].name.toLowerCase();
            if (attr !== 'href' && attr !== 'target') child.removeAttribute(attr);
          }
          clean(child);
        }
      }
    }
  }
  clean(temp);
  return temp.innerHTML;
}

function bindMedia() {
  renderMediaTiles();

  const fileInput = document.getElementById('media-file-input');
  fileInput?.addEventListener('change', (e) => {
    const files = Array.from(e.target.files);
    handleAddedFiles(files);
  });

  const uploadArea = document.getElementById('media-upload-area');
  uploadArea?.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = 'var(--primary-green)';
  });
  uploadArea?.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = '#CBD5E1';
  });
  uploadArea?.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#CBD5E1';
    if (e.dataTransfer.files) {
      handleAddedFiles(Array.from(e.dataTransfer.files));
    }
  });

  document.getElementById('btn-add-media-url')?.addEventListener('click', () => {
    const url = prompt('Enter Image URL:');
    if (url) {
      formState.media.push({
        url,
        isCover: formState.media.length === 0,
        name: 'url-image.jpg'
      });
      markDirty();
      renderMediaTiles();
      showToast('Media added from URL');
    }
  });
}

function handleAddedFiles(files) {
  const validFiles = files.filter(f => f.type.startsWith('image/')).slice(0, 8 - formState.media.length);
  if (validFiles.length === 0) return;

  validFiles.forEach(file => {
    const url = URL.createObjectURL(file);
    formState.media.push({
      url,
      isCover: formState.media.length === 0,
      name: file.name
    });
  });

  markDirty();
  renderMediaTiles();
  showToast(`Added ${validFiles.length} image(s)`);
}

function renderMediaTiles() {
  const container = document.getElementById('media-tiles-container');
  if (!container) return;

  container.innerHTML = formState.media.map((item, idx) => `
    <div class="media-tile" data-index="${idx}">
      ${item.url
        ? `<img src="${escapeHTML(item.url)}" alt="${escapeHTML(item.name)}">`
        : (item.svg || Icons.thumbHeadphones)}
      ${item.isCover ? `<span class="media-badge-cover">Cover</span>` : ''}
      <button class="media-tile-delete" data-action="delete-media" data-index="${idx}" aria-label="Remove image">
        ${Icons.close}
      </button>
    </div>
  `).join('');

  container.querySelectorAll('[data-action="delete-media"]').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const idx = parseInt(btn.dataset.index, 10);
      formState.media.splice(idx, 1);
      if (formState.media.length > 0 && !formState.media.some(m => m.isCover)) {
        formState.media[0].isCover = true;
      }
      markDirty();
      renderMediaTiles();
    });
  });
}

function bindVariants() {
  renderVariantOptions();
  renderVariantsTable();

  document.getElementById('btn-apply-price-all')?.addEventListener('click', () => {
    formState.variants.forEach(v => v.price = formState.price);
    renderVariantsTable();
    showToast(`Applied $${formState.price.toFixed(2)} to all variants`);
    markDirty();
  });
}

function renderVariantOptions() {
  const colorContainer = document.getElementById('options-color-chips');
  if (colorContainer) {
    colorContainer.innerHTML = formState.options.color.map(c => `
      <span class="option-chip selected">${escapeHTML(c)}</span>
    `).join('') + `<button class="add-option-btn" id="btn-add-color-opt">+ Add option</button>`;

    document.getElementById('btn-add-color-opt')?.addEventListener('click', () => {
      const val = prompt('Enter new color option:');
      if (val) {
        formState.options.color.push(val.trim());
        markDirty();
        renderVariantOptions();
      }
    });
  }

  const sizeContainer = document.getElementById('options-size-chips');
  if (sizeContainer) {
    sizeContainer.innerHTML = formState.options.size.map(s => `
      <span class="option-chip selected">${escapeHTML(s)}</span>
    `).join('') + `<button class="add-option-btn" id="btn-add-size-opt">+ Add option</button>`;

    document.getElementById('btn-add-size-opt')?.addEventListener('click', () => {
      const val = prompt('Enter new size option:');
      if (val) {
        formState.options.size.push(val.trim());
        markDirty();
        renderVariantOptions();
      }
    });
  }
}

function renderVariantsTable() {
  const tbody = document.getElementById('variants-table-body');
  if (!tbody) return;

  tbody.innerHTML = formState.variants.map((v, i) => `
    <tr>
      <td>
        <div style="display:flex; align-items:center; gap: 8px;">
          <div style="width: 24px; height: 24px; border-radius: 4px; background: #eee; display:flex; align-items:center; justify-content:center;">
            ${Icons.thumbHeadphones}
          </div>
          <span style="font-weight: 500;">${escapeHTML(v.name)}</span>
        </div>
      </td>
      <td>
        <div class="input-with-prefix" style="width: 90px;">
          <span class="input-prefix" style="font-size:12px;">$</span>
          <input type="number" class="form-input" data-variant-field="price" data-index="${i}" value="${v.price.toFixed(2)}" step="0.01" style="height: 30px; font-size: 12.5px; padding-left: 20px;">
        </div>
      </td>
      <td>
        <input type="text" class="form-input" data-variant-field="sku" data-index="${i}" value="${escapeHTML(v.sku)}" style="height: 30px; font-size: 12px; width: 140px;">
      </td>
      <td>
        <input type="number" class="form-input" data-variant-field="inventory" data-index="${i}" value="${v.inventory}" style="height: 30px; font-size: 12.5px; width: 70px;">
      </td>
      <td style="text-align: right;">
        <button class="btn-icon-dots" data-action="remove-variant" data-index="${i}" aria-label="Remove variant">
          ${Icons.close}
        </button>
      </td>
    </tr>
  `).join('');

  tbody.querySelectorAll('[data-variant-field]').forEach(input => {
    input.addEventListener('input', (e) => {
      const idx = parseInt(e.target.dataset.index, 10);
      const field = e.target.dataset.variantField;
      if (field === 'price') formState.variants[idx].price = parseFloat(e.target.value) || 0;
      else if (field === 'sku') formState.variants[idx].sku = e.target.value;
      else if (field === 'inventory') formState.variants[idx].inventory = parseInt(e.target.value, 10) || 0;
      markDirty();
    });
  });

  tbody.querySelectorAll('[data-action="remove-variant"]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.index, 10);
      formState.variants.splice(idx, 1);
      markDirty();
      renderVariantsTable();
    });
  });
}

function bindOrganization() {
  // Category search
  const catInput = document.getElementById('org-category-input');
  const catDropdown = document.getElementById('org-category-dropdown');
  if (catInput && catDropdown) {
    catInput.value = formState.category;
    catInput.addEventListener('focus', () => renderCategoryList(''));
    catInput.addEventListener('input', (e) => renderCategoryList(e.target.value));

    function renderCategoryList(query) {
      const filtered = CATEGORIES_LIST.filter(c => c.toLowerCase().includes(query.toLowerCase()));
      catDropdown.innerHTML = filtered.map(c => `
        <div class="combobox-item" data-cat-val="${c}">${c}</div>
      `).join('');
      catDropdown.classList.add('open');

      catDropdown.querySelectorAll('[data-cat-val]').forEach(item => {
        item.addEventListener('click', () => {
          formState.category = item.dataset.catVal;
          catInput.value = formState.category;
          catDropdown.classList.remove('open');
          markDirty();
        });
      });
    }

    document.addEventListener('click', (e) => {
      if (!catInput.contains(e.target) && !catDropdown.contains(e.target)) {
        catDropdown.classList.remove('open');
      }
    });
  }

  // Brand search
  const brandInput = document.getElementById('org-brand-input');
  const brandDropdown = document.getElementById('org-brand-dropdown');
  if (brandInput && brandDropdown) {
    brandInput.value = formState.brand;
    brandInput.addEventListener('focus', () => renderBrandList(''));
    brandInput.addEventListener('input', (e) => renderBrandList(e.target.value));

    function renderBrandList(query) {
      const filtered = BRANDS_LIST.filter(b => b.toLowerCase().includes(query.toLowerCase()));
      brandDropdown.innerHTML = filtered.map(b => `
        <div class="combobox-item" data-brand-val="${b}">${b}</div>
      `).join('');
      brandDropdown.classList.add('open');

      brandDropdown.querySelectorAll('[data-brand-val]').forEach(item => {
        item.addEventListener('click', () => {
          formState.brand = item.dataset.brandVal;
          brandInput.value = formState.brand;
          brandDropdown.classList.remove('open');
          markDirty();
        });
      });
    }

    document.addEventListener('click', (e) => {
      if (!brandInput.contains(e.target) && !brandDropdown.contains(e.target)) {
        brandDropdown.classList.remove('open');
      }
    });
  }

  // Tags
  renderTagChips();
  const tagInput = document.getElementById('org-tag-input');
  tagInput?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = tagInput.value.trim().replace(',', '');
      if (val && !formState.tags.includes(val)) {
        formState.tags.push(val);
        tagInput.value = '';
        renderTagChips();
        markDirty();
      }
    } else if (e.key === 'Backspace' && tagInput.value === '' && formState.tags.length > 0) {
      formState.tags.pop();
      renderTagChips();
      markDirty();
    }
  });

  // Status dropdown with dot
  const statusSelect = document.getElementById('product-status-select');
  const statusDot = document.getElementById('status-dot');
  if (statusSelect && statusDot) {
    statusSelect.value = formState.status;
    statusSelect.addEventListener('change', (e) => {
      formState.status = e.target.value;
      statusDot.style.backgroundColor = formState.status === 'Active' ? 'var(--primary-green)' : '#9CA3AF';
      markDirty();
    });
  }
}

function renderTagChips() {
  const container = document.getElementById('org-tag-chips');
  if (!container) return;

  container.innerHTML = formState.tags.map((t, idx) => `
    <span class="option-chip" style="font-size: 11.5px; padding: 2px 8px;">
      ${escapeHTML(t)}
      <button class="filter-chip-remove" data-tag-idx="${idx}" aria-label="Remove tag">${Icons.close}</button>
    </span>
  `).join('');

  container.querySelectorAll('[data-tag-idx]').forEach(btn => {
    btn.addEventListener('click', () => {
      const idx = parseInt(btn.dataset.tagIdx, 10);
      formState.tags.splice(idx, 1);
      renderTagChips();
      markDirty();
    });
  });
}

function bindActions() {
  // Discard
  document.getElementById('btn-discard')?.addEventListener('click', () => {
    if (confirm('Discard all unsaved changes?')) {
      unmarkDirty();
      window.location.reload();
    }
  });

  // Save buttons (both sticky bar and header)
  document.querySelectorAll('[data-action="save-product"]').forEach(btn => {
    btn.addEventListener('click', handleSaveProduct);
  });
}

function handleSaveProduct() {
  // Validation
  if (!formState.title || formState.title.trim() === '') {
    alert('Product Title is required.');
    document.getElementById('product-title-input')?.focus();
    return;
  }

  if (formState.price <= 0) {
    alert('Please enter a valid price greater than $0.');
    document.getElementById('product-price-input')?.focus();
    return;
  }

  if (!formState.sku || formState.sku.trim() === '') {
    alert('SKU is required.');
    document.getElementById('product-sku-input')?.focus();
    return;
  }

  const products = getProducts();

  // If Active is chosen, store status as "Pending review" (moderation rule)
  const finalStatus = formState.status === 'Active' ? 'Pending review' : 'Draft';

  if (editProductId) {
    const idx = products.findIndex(p => p.id === editProductId);
    if (idx !== -1) {
      products[idx] = {
        ...products[idx],
        name: formState.title.trim(),
        price: Math.round(formState.price * 100),
        compareAtPrice: Math.round(formState.compareAtPrice * 100),
        cost: Math.round(formState.cost * 100),
        sku: formState.sku.trim(),
        inventory: formState.quantity,
        category: formState.category,
        brand: formState.brand,
        status: finalStatus,
        tags: formState.tags
      };
      saveProducts(products);
      showToast('Product updated successfully!');
    }
  } else {
    const newProduct = {
      id: Date.now(),
      name: formState.title.trim(),
      sku: formState.sku.trim(),
      status: finalStatus,
      inventory: formState.quantity,
      category: formState.category,
      price: Math.round(formState.price * 100),
      compareAtPrice: Math.round(formState.compareAtPrice * 100),
      cost: Math.round(formState.cost * 100),
      sales: 0,
      thumb: 'thumbHeadphones',
      tags: formState.tags,
      brand: formState.brand
    };
    products.unshift(newProduct);
    saveProducts(products);
    showToast(finalStatus === 'Pending review'
      ? 'Product submitted for review! (Will go live upon moderation approval)'
      : 'Product saved as Draft');
  }

  unmarkDirty();
  setTimeout(() => {
    window.location.href = 'products.html';
  }, 600);
}
