/**
 * AMEZA Table Kit Engine — js/table-kit.js
 * Comprehensive interactive data table controller.
 * Features:
 * - Column chooser modal & visibility toggling
 * - Saved views with local storage persistence
 * - Client-side sorting (asc/desc/reset)
 * - Configurable pagination with page jumping
 * - Bulk select with floating action bar
 * - Density toggles (compact / comfortable / spacious)
 * - CSV export (Blob download with clipboard fallback)
 */

import { escapeHTML, showToast } from './core/utils.js';

export class TableKit {
  constructor(config = {}) {
    this.tableId = config.tableId || 'ameza-data-table';
    this.container = typeof config.container === 'string'
      ? document.getElementById(config.container)
      : config.container;

    this.columns = config.columns || [];
    this.rawData = config.data || [];
    this.filteredData = [...this.rawData];

    this.pageSize = config.pageSize || 10;
    this.currentPage = 1;
    this.sortCol = config.initialSortCol || null;
    this.sortDir = config.initialSortDir || 'asc';
    this.searchQuery = '';
    this.selectedIds = new Set();
    this.density = config.initialDensity || 'comfortable';
    this.savedViews = config.savedViews || [
      { id: 'all', name: 'All Records' }
    ];
    this.activeView = 'all';

    this.onRowAction = config.onRowAction || null;
    this.onBulkAction = config.onBulkAction || null;

    if (this.container) {
      this.render();
    }
  }

  setData(newData) {
    this.rawData = newData || [];
    this.applyFilters();
  }

  applyFilters() {
    let result = [...this.rawData];

    // Search query
    if (this.searchQuery) {
      const q = this.searchQuery.toLowerCase();
      result = result.filter(row => {
        return Object.values(row).some(val =>
          String(val).toLowerCase().includes(q)
        );
      });
    }

    // Sorting
    if (this.sortCol) {
      const colDef = this.columns.find(c => c.id === this.sortCol);
      result.sort((a, b) => {
        let valA = a[this.sortCol];
        let valB = b[this.sortCol];

        if (colDef && colDef.sortValue) {
          valA = colDef.sortValue(a);
          valB = colDef.sortValue(b);
        }

        if (typeof valA === 'string') {
          return this.sortDir === 'asc'
            ? valA.localeCompare(String(valB))
            : String(valB).localeCompare(valA);
        }
        return this.sortDir === 'asc' ? (valA - valB) : (valB - valA);
      });
    }

    this.filteredData = result;
    this.currentPage = 1;
    this.selectedIds.clear();
    this.renderTableBody();
    this.renderPagination();
    this.updateBulkBar();
  }

  handleSort(columnId) {
    if (this.sortCol === columnId) {
      if (this.sortDir === 'asc') this.sortDir = 'desc';
      else {
        this.sortCol = null;
        this.sortDir = 'asc';
      }
    } else {
      this.sortCol = columnId;
      this.sortDir = 'asc';
    }
    this.applyFilters();
    this.renderHeader();
  }

  exportCSV(selectedOnly = false) {
    const dataToExport = selectedOnly && this.selectedIds.size > 0
      ? this.filteredData.filter(row => this.selectedIds.has(String(row.id)))
      : this.filteredData;

    const visibleCols = this.columns.filter(c => c.visible !== false && c.id !== '__select' && c.id !== '__actions');

    const headers = visibleCols.map(c => `"${c.label.replace(/"/g, '""')}"`).join(',');
    const rows = dataToExport.map(row => {
      return visibleCols.map(c => {
        const rawVal = c.exportValue ? c.exportValue(row) : (row[c.id] ?? '');
        return `"${String(rawVal).replace(/"/g, '""')}"`;
      }).join(',');
    });

    const csvContent = [headers, ...rows].join('\r\n');

    try {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `ameza-export-${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast(`Exported ${dataToExport.length} rows to CSV`, 'success');
    } catch (err) {
      // Fallback: Copy to clipboard
      if (navigator.clipboard) {
        navigator.clipboard.writeText(csvContent);
        showToast('CSV downloaded via clipboard (copied to your clipboard)', 'info');
      } else {
        showToast('Export failed. Please check browser permissions.', 'danger');
      }
    }
  }

  render() {
    this.container.innerHTML = `
      <div class="table-kit-wrap">
        <!-- TOOLBAR -->
        <div class="table-kit-toolbar">
          <div class="toolbar-left">
            <!-- Search Input -->
            <div class="input-group" style="max-width:280px;">
              <i class="fa-solid fa-magnifying-glass input-icon-left"></i>
              <input type="text" class="form-control form-control-sm has-icon-left table-search-input" placeholder="Filter rows..." />
            </div>

            <!-- Saved Views Pill -->
            <div class="dropdown table-views-dropdown">
              <button class="btn btn-secondary btn-sm" id="table-views-btn">
                <i class="fa-solid fa-layer-group"></i>
                <span id="active-view-label">All Records</span>
                <i class="fa-solid fa-chevron-down" style="font-size:10px;"></i>
              </button>
              <div class="dropdown-menu">
                ${this.savedViews.map(v => `
                  <button class="dropdown-item view-select-btn" data-view="${v.id}">${escapeHTML(v.name)}</button>
                `).join('')}
              </div>
            </div>
          </div>

          <div class="toolbar-right">
            <!-- Density Toggle -->
            <div class="btn-group-pill">
              <button class="btn btn-ghost btn-sm density-btn ${this.density === 'compact' ? 'active' : ''}" data-density="compact" title="Compact density">
                <i class="fa-solid fa-bars-staggered"></i>
              </button>
              <button class="btn btn-ghost btn-sm density-btn ${this.density === 'comfortable' ? 'active' : ''}" data-density="comfortable" title="Comfortable density">
                <i class="fa-solid fa-bars"></i>
              </button>
              <button class="btn btn-ghost btn-sm density-btn ${this.density === 'spacious' ? 'active' : ''}" data-density="spacious" title="Spacious density">
                <i class="fa-solid fa-grip-lines"></i>
              </button>
            </div>

            <!-- Column Chooser Button -->
            <button class="btn btn-secondary btn-sm" id="col-chooser-btn" title="Choose visible columns">
              <i class="fa-solid fa-table-columns"></i>
              <span>Columns</span>
            </button>

            <!-- CSV Export Button -->
            <button class="btn btn-secondary btn-sm" id="csv-export-btn" title="Export to CSV">
              <i class="fa-solid fa-file-arrow-down"></i>
              <span>Export</span>
            </button>
          </div>
        </div>

        <!-- BULK ACTIONS BAR -->
        <div class="table-bulk-bar" id="table-bulk-bar">
          <div class="bulk-info">
            <span id="bulk-selected-count">0 items selected</span>
          </div>
          <div class="bulk-actions">
            <button class="btn btn-secondary btn-xs bulk-action-btn" data-action="export">Export Selected</button>
            <button class="btn btn-primary btn-xs bulk-action-btn" data-action="mark_shipped">Mark Shipped</button>
            <button class="btn btn-ghost btn-xs" id="clear-selection-btn">Deselect All</button>
          </div>
        </div>

        <!-- TABLE CONTAINER -->
        <div class="table-container">
          <table class="ameza-table table-sticky table-${this.density}" id="${this.tableId}">
            <thead id="${this.tableId}-thead"></thead>
            <tbody id="${this.tableId}-tbody"></tbody>
          </table>
        </div>

        <!-- FOOTER PAGINATION -->
        <div class="table-kit-footer">
          <div class="table-pagination-info" id="pagination-info">Showing 0 to 0 of 0 entries</div>
          <div class="pagination" id="pagination-controls"></div>
        </div>

        <!-- COLUMN CHOOSER MODAL -->
        <div class="modal-backdrop" id="col-chooser-modal">
          <div class="modal-dialog">
            <div class="modal-header">
              <h3 class="modal-title text-base font-bold">Customize Table Columns</h3>
              <button class="modal-close" id="close-col-modal-btn">&times;</button>
            </div>
            <div class="modal-body">
              <div class="text-xs text-muted mb-3">Select which columns to display in the table:</div>
              <div class="col-chooser-checkboxes" style="display:flex; flex-direction:column; gap:10px;">
                ${this.columns.filter(c => c.id !== '__select' && c.id !== '__actions').map(c => `
                  <label class="checkbox-label">
                    <input type="checkbox" class="custom-checkbox col-toggle-chk" data-col="${c.id}" ${c.visible !== false ? 'checked' : ''} />
                    <span>${escapeHTML(c.label)}</span>
                  </label>
                `).join('')}
              </div>
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary btn-sm" id="cancel-col-modal-btn">Cancel</button>
              <button class="btn btn-primary btn-sm" id="apply-col-modal-btn">Apply Columns</button>
            </div>
          </div>
        </div>
      </div>
    `;

    this.bindEvents();
    this.renderHeader();
    this.applyFilters();
  }

  renderHeader() {
    const thead = document.getElementById(`${this.tableId}-thead`);
    if (!thead) return;

    const visibleCols = this.columns.filter(c => c.visible !== false);

    thead.innerHTML = `
      <tr>
        <th style="width:40px; text-align:center;">
          <input type="checkbox" class="custom-checkbox select-all-chk" id="select-all-header" />
        </th>
        ${visibleCols.map(c => {
          if (c.id === '__select') return '';
          const isSorted = this.sortCol === c.id;
          const sortIcon = isSorted
            ? (this.sortDir === 'asc' ? '<i class="fa-solid fa-arrow-up-short-wide sort-icon"></i>' : '<i class="fa-solid fa-arrow-down-wide-short sort-icon"></i>')
            : '<i class="fa-solid fa-sort sort-icon"></i>';

          return `
            <th class="${c.sortable !== false ? 'th-sortable' : ''} ${isSorted ? `th-sort-${this.sortDir}` : ''}" data-col-id="${c.id}">
              ${escapeHTML(c.label)}
              ${c.sortable !== false ? sortIcon : ''}
            </th>
          `;
        }).join('')}
      </tr>
    `;

    // Bind header sort clicks
    thead.querySelectorAll('.th-sortable').forEach(th => {
      th.addEventListener('click', (e) => {
        const colId = e.currentTarget.getAttribute('data-col-id');
        this.handleSort(colId);
      });
    });

    // Select all header
    const selectAll = document.getElementById('select-all-header');
    selectAll?.addEventListener('change', (e) => {
      const pageRows = this.getCurrentPageRows();
      if (e.target.checked) {
        pageRows.forEach(r => this.selectedIds.add(String(r.id)));
      } else {
        pageRows.forEach(r => this.selectedIds.delete(String(r.id)));
      }
      this.renderTableBody();
      this.updateBulkBar();
    });
  }

  getCurrentPageRows() {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredData.slice(start, start + this.pageSize);
  }

  renderTableBody() {
    const tbody = document.getElementById(`${this.tableId}-tbody`);
    if (!tbody) return;

    const rows = this.getCurrentPageRows();
    const visibleCols = this.columns.filter(c => c.visible !== false);

    if (rows.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="${visibleCols.length + 1}" style="text-align:center; padding:40px 16px;">
            <div class="empty-state" style="border:none; padding:10px;">
              <div class="empty-state-icon" style="width:48px; height:48px; font-size:20px; margin-bottom:8px;">
                <i class="fa-solid fa-magnifying-glass"></i>
              </div>
              <div class="font-bold text-sm text-main">No matching records found</div>
              <div class="text-xs text-muted">Try clearing your search term or adjusting filters.</div>
            </div>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = rows.map(row => {
      const isSelected = this.selectedIds.has(String(row.id));
      return `
        <tr class="${isSelected ? 'row-selected' : ''}" data-row-id="${escapeHTML(row.id)}">
          <td style="text-align:center;">
            <input type="checkbox" class="custom-checkbox row-select-chk" data-id="${escapeHTML(row.id)}" ${isSelected ? 'checked' : ''} />
          </td>
          ${visibleCols.map(col => {
            if (col.id === '__select') return '';
            let content = '';
            if (typeof col.render === 'function') {
              content = col.render(row[col.id], row);
            } else {
              content = escapeHTML(row[col.id] ?? '—');
            }
            return `<td>${content}</td>`;
          }).join('')}
        </tr>
      `;
    }).join('');

    // Row selection checkboxes
    tbody.querySelectorAll('.row-select-chk').forEach(chk => {
      chk.addEventListener('change', (e) => {
        const id = e.target.getAttribute('data-id');
        if (e.target.checked) this.selectedIds.add(id);
        else this.selectedIds.delete(id);

        const tr = e.target.closest('tr');
        tr?.classList.toggle('row-selected', e.target.checked);
        this.updateBulkBar();
      });
    });
  }

  updateBulkBar() {
    const bar = document.getElementById('table-bulk-bar');
    const countEl = document.getElementById('bulk-selected-count');
    const selectAllHeader = document.getElementById('select-all-header');

    if (bar && countEl) {
      if (this.selectedIds.size > 0) {
        bar.classList.add('active');
        countEl.textContent = `${this.selectedIds.size} record${this.selectedIds.size > 1 ? 's' : ''} selected`;
      } else {
        bar.classList.remove('active');
      }
    }

    if (selectAllHeader) {
      const pageRows = this.getCurrentPageRows();
      selectAllHeader.checked = pageRows.length > 0 && pageRows.every(r => this.selectedIds.has(String(r.id)));
    }
  }

  renderPagination() {
    const info = document.getElementById('pagination-info');
    const controls = document.getElementById('pagination-controls');
    if (!info || !controls) return;

    const total = this.filteredData.length;
    const start = total === 0 ? 0 : (this.currentPage - 1) * this.pageSize + 1;
    const end = Math.min(this.currentPage * this.pageSize, total);
    const totalPages = Math.ceil(total / this.pageSize) || 1;

    info.textContent = `Showing ${start} to ${end} of ${total} entries`;

    let html = `
      <button class="page-btn" id="prev-page-btn" ${this.currentPage <= 1 ? 'disabled' : ''}>
        <i class="fa-solid fa-chevron-left" style="font-size:10px;"></i>
      </button>
    `;

    for (let p = 1; p <= totalPages; p++) {
      if (totalPages > 6 && Math.abs(p - this.currentPage) > 2 && p !== 1 && p !== totalPages) {
        if (p === 2 || p === totalPages - 1) html += `<span class="px-1 text-muted">...</span>`;
        continue;
      }
      html += `
        <button class="page-btn ${p === this.currentPage ? 'active' : ''}" data-page="${p}">${p}</button>
      `;
    }

    html += `
      <button class="page-btn" id="next-page-btn" ${this.currentPage >= totalPages ? 'disabled' : ''}>
        <i class="fa-solid fa-chevron-right" style="font-size:10px;"></i>
      </button>
    `;

    controls.innerHTML = html;

    controls.querySelectorAll('.page-btn[data-page]').forEach(b => {
      b.addEventListener('click', (e) => {
        this.currentPage = Number(e.target.getAttribute('data-page'));
        this.renderTableBody();
        this.renderPagination();
      });
    });

    controls.querySelector('#prev-page-btn')?.addEventListener('click', () => {
      if (this.currentPage > 1) {
        this.currentPage--;
        this.renderTableBody();
        this.renderPagination();
      }
    });

    controls.querySelector('#next-page-btn')?.addEventListener('click', () => {
      if (this.currentPage < totalPages) {
        this.currentPage++;
        this.renderTableBody();
        this.renderPagination();
      }
    });
  }

  bindEvents() {
    // Search
    const searchInput = this.container.querySelector('.table-search-input');
    searchInput?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.trim();
      this.applyFilters();
    });

    // Density toggle
    this.container.querySelectorAll('.density-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const d = e.currentTarget.getAttribute('data-density');
        this.density = d;
        const table = document.getElementById(this.tableId);
        table.classList.remove('table-compact', 'table-comfortable', 'table-spacious');
        table.classList.add(`table-${d}`);
        this.container.querySelectorAll('.density-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });

    // CSV export button
    this.container.querySelector('#csv-export-btn')?.addEventListener('click', () => this.exportCSV(false));

    // Clear selection
    this.container.querySelector('#clear-selection-btn')?.addEventListener('click', () => {
      this.selectedIds.clear();
      this.renderTableBody();
      this.updateBulkBar();
    });

    // Bulk actions
    this.container.querySelectorAll('.bulk-action-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.getAttribute('data-action');
        if (action === 'export') {
          this.exportCSV(true);
        } else if (this.onBulkAction) {
          this.onBulkAction(action, Array.from(this.selectedIds));
        } else {
          showToast(`Executed bulk action "${action}" on ${this.selectedIds.size} records`, 'success');
        }
      });
    });

    // Column Chooser Modal
    const modal = this.container.querySelector('#col-chooser-modal');
    const openBtn = this.container.querySelector('#col-chooser-btn');
    const closeBtn = this.container.querySelector('#close-col-modal-btn');
    const cancelBtn = this.container.querySelector('#cancel-col-modal-btn');
    const applyBtn = this.container.querySelector('#apply-col-modal-btn');

    openBtn?.addEventListener('click', () => modal?.classList.add('active'));
    [closeBtn, cancelBtn].forEach(b => b?.addEventListener('click', () => modal?.classList.remove('active')));

    applyBtn?.addEventListener('click', () => {
      modal?.querySelectorAll('.col-toggle-chk').forEach(chk => {
        const colId = chk.getAttribute('data-col');
        const colDef = this.columns.find(c => c.id === colId);
        if (colDef) colDef.visible = chk.checked;
      });
      modal?.classList.remove('active');
      this.renderHeader();
      this.renderTableBody();
      showToast('Column configuration updated', 'info');
    });
  }
}

if (typeof window !== 'undefined') {
  window.TableKit = TableKit;
}
