/**
 * AMEZA Seller Dashboard - CSV Import Modal (Screen C)
 * Reusable modal component opened via 'open-import' event on products.html
 */

import { Icons } from './icons.js';
import { getProducts, saveProducts } from './data.js';
import { showToast, escapeHTML } from './shell.js';

let modalEl = null;
let currentStep = 1;
let parsedRows = [];
let validationResults = {
  valid: 48,
  warnings: 3,
  errors: 2,
  rows: []
};

// Demo state matching Image 3 exactly
const DEMO_PREVIEW_ROWS = [
  { row: 1, title: 'Wireless Headphones', sku: 'WH-001', price: '$99.00', status: 'Valid', issue: '-', type: 'valid' },
  { row: 2, title: 'Smart Watch', sku: 'SW-002', price: '$149.00', status: 'Valid', issue: '-', type: 'valid' },
  { row: 3, title: 'Laptop Stand', sku: 'LS-003', price: '$39.00', status: 'Valid', issue: '-', type: 'valid' },
  { row: 4, title: 'Water Bottle', sku: 'WB-004', price: '$19.00', status: 'Valid', issue: 'Missing category', type: 'warning' },
  { row: 5, title: 'Backpack', sku: 'BP-005', price: '$49.00', status: 'Valid', issue: 'Invalid brand', type: 'warning' },
  { row: 6, title: 'Running Shoes', sku: 'RS-006', price: '$89.00', status: 'Error', issue: 'Invalid price (text)', type: 'error' },
  { row: 7, title: 'Sunglasses', sku: 'SG-007', price: 'N/A', status: 'Error', issue: 'Missing SKU', type: 'error' },
  { row: 8, title: 'T-shirt', sku: 'TS-008', price: '$25.00', status: 'Valid', issue: '-', type: 'valid' },
  { row: 9, title: 'Jeans', sku: 'JN-009', price: '$45.00', status: 'Valid', issue: '-', type: 'valid' },
  { row: 10, title: 'Phone Case', sku: 'PC-010', price: '$15.00', status: 'Valid', issue: '-', type: 'valid' }
];

export function initImportModal() {
  createModalDOM();
  window.addEventListener('open-import', openImportModal);
}

function createModalDOM() {
  modalEl = document.createElement('div');
  modalEl.className = 'import-modal-overlay';
  modalEl.id = 'csv-import-modal-overlay';
  modalEl.setAttribute('role', 'dialog');
  modalEl.setAttribute('aria-modal', 'true');

  modalEl.innerHTML = `
    <div class="import-modal-card" id="csv-import-card">
      <!-- Modal Header -->
      <div class="modal-header">
        <h3 class="modal-title" style="font-size: 15px;">Import products by CSV</h3>
        <button class="modal-close-btn" id="btn-close-import" aria-label="Close dialog">${Icons.close}</button>
      </div>

      <!-- Stepper -->
      <div class="import-stepper" id="import-stepper">
        <div class="import-step-item active" data-step="1">
          <div class="import-step-circle">1</div>
          <span>Upload</span>
        </div>
        <div class="import-step-item" data-step="2">
          <div class="import-step-circle">2</div>
          <span>Map columns</span>
        </div>
        <div class="import-step-item" data-step="3">
          <div class="import-step-circle">3</div>
          <span>Validate</span>
        </div>
        <div class="import-step-item" data-step="4">
          <div class="import-step-circle">4</div>
          <span>Import</span>
        </div>
      </div>

      <!-- Step Content Area -->
      <div class="modal-body" id="import-body" style="padding: 20px 24px;">
        <!-- Filled dynamically per step -->
      </div>

      <!-- Modal Footer -->
      <div class="modal-footer" style="padding: 14px 24px; justify-content: space-between;">
        <button class="btn-header-secondary" id="btn-cancel-import">Cancel</button>
        <button class="btn-header-primary" id="btn-next-import">Import</button>
      </div>
    </div>
  `;

  document.body.appendChild(modalEl);

  // Close handlers
  modalEl.querySelector('#btn-close-import')?.addEventListener('click', closeImportModal);
  modalEl.querySelector('#btn-cancel-import')?.addEventListener('click', closeImportModal);
  modalEl.addEventListener('click', (e) => {
    if (e.target === modalEl) closeImportModal();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalEl.classList.contains('open')) {
      closeImportModal();
    }
  });

  modalEl.querySelector('#btn-next-import')?.addEventListener('click', handleNextStep);
}

export function openImportModal() {
  currentStep = 1;
  validationResults = {
    valid: 48,
    warnings: 3,
    errors: 2,
    rows: [...DEMO_PREVIEW_ROWS]
  };
  updateStepper();
  renderStepContent();
  modalEl.classList.add('open');
}

export function closeImportModal() {
  modalEl.classList.remove('open');
}

function updateStepper() {
  const steps = modalEl.querySelectorAll('.import-step-item');
  steps.forEach(item => {
    const s = parseInt(item.dataset.step, 10);
    item.classList.remove('active', 'completed');
    const circle = item.querySelector('.import-step-circle');

    if (s < currentStep) {
      item.classList.add('completed');
      circle.innerHTML = Icons.check;
    } else if (s === currentStep) {
      item.classList.add('active');
      circle.textContent = s;
    } else {
      circle.textContent = s;
    }
  });

  const nextBtn = modalEl.querySelector('#btn-next-import');
  if (currentStep === 1) nextBtn.textContent = 'Import';
  else if (currentStep === 2) nextBtn.textContent = 'Validate';
  else if (currentStep === 3) nextBtn.textContent = 'Import';
  else if (currentStep === 4) nextBtn.textContent = 'Done';
}

function renderStepContent() {
  const body = modalEl.querySelector('#import-body');
  if (!body) return;

  if (currentStep === 1) {
    // Step 1: Upload + Demo Preview matching Image 3
    body.innerHTML = `
      <!-- Upload Dropzone -->
      <div class="import-dropzone" id="csv-dropzone">
        <div style="color: var(--text-tertiary); margin-bottom: 8px;">
          ${Icons.cloudUpload}
        </div>
        <div style="font-size: 13.5px; font-weight: 600; color: var(--text-main); margin-bottom: 4px;">
          Drag and drop your CSV file here
        </div>
        <div style="font-size: 12px; color: var(--text-secondary); margin-bottom: 8px;">
          or <span style="color: var(--primary-green-dark); font-weight:600; text-decoration:underline;">click to browse</span>
        </div>
        <div style="font-size: 11.5px; color: var(--text-tertiary); margin-bottom: 12px;">
          Supported format: CSV (max 10MB)
        </div>
        <input type="file" id="csv-file-input" accept=".csv" style="display:none;">
        <div style="display:flex; justify-content:center; gap: 16px; align-items:center;">
          <a href="#" id="link-download-sample" style="font-size:12px; font-weight:600; color:var(--primary-green-dark); text-decoration:underline;">
            Download sample CSV
          </a>
          <span style="color:var(--text-tertiary); font-size:11px;">•</span>
          <a href="#" id="link-use-demo-file" style="font-size:12px; font-weight:600; color:var(--text-secondary); text-decoration:underline;">
            Use demo file
          </a>
        </div>
      </div>

      <!-- Validation Preview Panel -->
      <div class="validation-header-row">
        <div style="font-size: 13.5px; font-weight: 700; color: var(--text-main);">Validation preview</div>
        <div style="display:flex; align-items:center; gap: 8px;">
          <span class="val-badge-chip val-chip-valid">
            ${Icons.check} 48 valid
          </span>
          <span class="val-badge-chip val-chip-warning">
            ${Icons.alertTriangle} 3 warnings
          </span>
          <span class="val-badge-chip val-chip-error">
            ${Icons.alertCircle} 2 errors
          </span>
        </div>
      </div>

      <!-- Validation Preview Table -->
      <div class="validation-table-box">
        <table class="val-table">
          <thead>
            <tr>
              <th style="width: 40px;">Row</th>
              <th>Title</th>
              <th>SKU</th>
              <th>Price</th>
              <th>Status</th>
              <th>Issues</th>
            </tr>
          </thead>
          <tbody>
            ${DEMO_PREVIEW_ROWS.map(r => `
              <tr class="${r.type === 'warning' ? 'val-row-warning' : (r.type === 'error' ? 'val-row-error' : '')}">
                <td style="color:var(--text-tertiary); font-size:11px;">
                  <span style="display:inline-flex; align-items:center; gap:4px;">
                    ${r.type === 'valid' ? `<span style="color:var(--primary-green-dark);">${Icons.check}</span>` : (r.type === 'warning' ? `<span style="color:#B45309;">${Icons.alertTriangle}</span>` : `<span style="color:#DC2626;">${Icons.close}</span>`)}
                    ${r.row}
                  </span>
                </td>
                <td style="font-weight: 500;">${escapeHTML(r.title)}</td>
                <td style="font-family: monospace; font-size: 11px; color: var(--text-secondary);">${escapeHTML(r.sku)}</td>
                <td>${escapeHTML(r.price)}</td>
                <td>
                  <span class="badge ${r.status === 'Valid' ? 'badge-success' : 'badge-danger'}" style="font-size: 10.5px; padding: 1px 7px;">
                    ${escapeHTML(r.status)}
                  </span>
                </td>
                <td style="font-size: 11.5px; color: ${r.type === 'warning' ? '#B45309' : (r.type === 'error' ? '#DC2626' : 'var(--text-tertiary)')};">
                  ${escapeHTML(r.issue)}
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `;

    bindStep1UploadEvents();
  } else if (currentStep === 4) {
    // Step 4: Import Complete Summary
    body.innerHTML = `
      <div style="text-align:center; padding: 40px 20px;">
        <div style="width: 56px; height: 56px; border-radius: 50%; background: var(--primary-green-light); color: var(--primary-green-dark); display: flex; align-items: center; justify-content: center; margin: 0 auto 16px; font-size: 24px;">
          ${Icons.check}
        </div>
        <h3 style="font-size: 18px; font-weight: 700; color: var(--text-main); margin-bottom: 8px;">Import Complete!</h3>
        <p style="font-size: 13.5px; color: var(--text-secondary); max-width: 440px; margin: 0 auto 20px;">
          <strong>46 products</strong> were successfully imported into your store catalog as Draft listings. 2 error rows were skipped.
        </p>
        <button class="btn-header-primary" id="btn-view-imported" style="margin: 0 auto;">
          View products
        </button>
      </div>
    `;

    body.querySelector('#btn-view-imported')?.addEventListener('click', () => {
      closeImportModal();
      window.location.reload();
    });
  }
}

function bindStep1UploadEvents() {
  const dropzone = modalEl.querySelector('#csv-dropzone');
  const fileInput = modalEl.querySelector('#csv-file-input');

  dropzone?.addEventListener('click', (e) => {
    if (e.target.id === 'link-download-sample' || e.target.id === 'link-use-demo-file') return;
    fileInput?.click();
  });

  modalEl.querySelector('#link-download-sample')?.addEventListener('click', (e) => {
    e.preventDefault();
    downloadSampleCSV();
  });

  modalEl.querySelector('#link-use-demo-file')?.addEventListener('click', (e) => {
    e.preventDefault();
    showToast('Loaded demo CSV dataset (48 valid, 3 warnings, 2 errors)');
  });

  fileInput?.addEventListener('change', (e) => {
    if (e.target.files && e.target.files[0]) {
      parseUploadedCSV(e.target.files[0]);
    }
  });

  dropzone?.addEventListener('dragover', (e) => {
    e.preventDefault();
    dropzone.classList.add('dragover');
  });

  dropzone?.addEventListener('dragleave', () => {
    dropzone.classList.remove('dragover');
  });

  dropzone?.addEventListener('drop', (e) => {
    e.preventDefault();
    dropzone.classList.remove('dragover');
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      parseUploadedCSV(e.dataTransfer.files[0]);
    }
  });
}

function parseUploadedCSV(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    const text = e.target.result;
    const lines = parseCSVText(text);
    if (lines.length <= 1) {
      alert('CSV file appears empty or invalid.');
      return;
    }
    showToast(`Parsed ${lines.length - 1} rows from ${file.name}`);
  };
  reader.readAsText(file);
}

function parseCSVText(text) {
  // Hand-written robust parser handling quotes and commas
  const rows = [];
  let currentRow = [];
  let currentVal = '';
  let inQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        currentVal += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      currentRow.push(currentVal.trim());
      currentVal = '';
    } else if ((char === '\r' || char === '\n') && !inQuotes) {
      if (char === '\r' && nextChar === '\n') i++;
      currentRow.push(currentVal.trim());
      if (currentRow.length > 1 || (currentRow.length === 1 && currentRow[0] !== '')) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentVal = '';
    } else {
      currentVal += char;
    }
  }

  if (currentVal || currentRow.length > 0) {
    currentRow.push(currentVal.trim());
    rows.push(currentRow);
  }

  return rows;
}

function downloadSampleCSV() {
  const csvContent = 'data:text/csv;charset=utf-8,' +
    'Title,SKU,Price,Category,Brand,Stock\n' +
    'Wireless Headphones,WH-001,99.00,Electronics,Ameza Audio,50\n' +
    'Smart Watch,SW-002,149.00,Electronics,Ameza Audio,25\n' +
    'Laptop Stand,LS-003,39.00,Accessories,Urban Craft,80\n' +
    'Water Bottle,WB-004,19.00,Home & Living,Ameza Living,100\n' +
    'Backpack Pro,BP-005,49.00,Bags,Ameza Gear,40\n';

  const encodedUri = encodeURI(csvContent);
  const link = document.createElement('a');
  link.setAttribute('href', encodedUri);
  link.setAttribute('download', 'ameza_sample_products.csv');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  showToast('Downloaded sample CSV file');
}

function handleNextStep() {
  if (currentStep === 1) {
    // Proceed with Import
    currentStep = 4;
    updateStepper();
    renderStepContent();

    // Add imported sample products to mock data
    const existing = getProducts();
    const importedSample = {
      id: Date.now(),
      name: 'Wireless Headphones (Imported)',
      sku: 'WH-001',
      status: 'Draft',
      inventory: 50,
      category: 'Electronics',
      price: 9900,
      sales: 0,
      thumb: 'thumbHeadphones',
      brand: 'Ameza Audio'
    };
    existing.unshift(importedSample);
    saveProducts(existing);
    showToast('46 products imported into catalog');
  } else if (currentStep === 4) {
    closeImportModal();
    window.location.reload();
  }
}
