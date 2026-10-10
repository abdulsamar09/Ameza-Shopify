/**
 * AMEZA Admin Console — Audit Log & Diff Explorer Engine (js/admin-audit.js)
 * Visualizes chronological audit events, actor attribution, and before/after JSON diffs
 * formatted in 12-hour US Eastern Time.
 */

import { getAuditLogs } from '/shared/js/api/audit.api.js';
import { escapeHTML } from '/shared/js/core/utils.js';

let searchQuery = '';
let actionFilter = 'all';
let typeFilter = 'all';

export function initAdminAudit() {
  renderAuditView();
  bindAuditEvents();
}

/**
 * Formats a UNIX epoch timestamp into 12-hour US Eastern Time:
 * MM/DD/YYYY, h:mm:ss A [ET]
 */
export function formatEasternTime(epochMs) {
  const date = new Date(epochMs);
  const options = {
    timeZone: 'America/New_York',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: true
  };
  const formatted = new Intl.DateTimeFormat('en-US', options).format(date);
  return `${formatted} [ET]`;
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

function renderAuditView() {
  const container = document.getElementById('audit-container');
  if (!container) return;

  const logs = getAuditLogs();

  const filtered = logs.filter(item => {
    if (actionFilter !== 'all' && item.action.toLowerCase() !== actionFilter.toLowerCase()) return false;
    if (typeFilter !== 'all' && item.target.type.toLowerCase() !== typeFilter.toLowerCase()) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = (
        item.action + ' ' +
        item.actor.name + ' ' +
        item.actor.email + ' ' +
        item.target.type + ' ' +
        item.target.name + ' ' +
        item.ip + ' ' +
        (item.changes || []).join(' ')
      ).toLowerCase();
      return match.includes(q);
    }
    return true;
  });

  // Action count metrics
  const approvedCount = logs.filter(l => l.action === 'Approved').length;
  const updatedCount = logs.filter(l => l.action === 'Updated').length;
  const createdCount = logs.filter(l => l.action === 'Created').length;
  const deletedCount = logs.filter(l => l.action === 'Deleted').length;

  container.innerHTML = `
    <!-- Top Action Header -->
    <header class="seller-header" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
      <div>
        <h1 style="font-size: 1.6rem; font-weight: 800; color: var(--dark); margin: 0;">Platform Audit Trail & Security Ledger</h1>
        <p style="color: var(--text-muted); font-size: 0.88rem; margin: 4px 0 0;">Immutable, tamper-evident log of administrative modifications, commission overrides, and staff operations.</p>
      </div>
      <div style="display: flex; gap: 10px;">
        <button type="button" id="btn-export-audit-csv" class="btn-primary" style="height: 38px; padding: 0 18px; border-radius: 6px; font-weight: 700; font-size: 13px; cursor: pointer; display: flex; align-items: center; gap: 8px;">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path><polyline points="7 10 12 15 17 10"></polyline><line x1="12" y1="15" x2="12" y2="3"></line></svg>
          Export Audit CSV
        </button>
      </div>
    </header>

    <!-- Stats Row -->
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px;">
      <div class="seller-card" style="padding: 18px; border-radius: 10px;">
        <div style="font-size: 11.5px; font-weight: 700; text-transform: uppercase; color: var(--text-muted);">Approved Actions</div>
        <div style="font-size: 26px; font-weight: 800; color: #10B981; margin-top: 4px;">${approvedCount}</div>
        <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 4px;">Sellers & payouts authorized</div>
      </div>
      <div class="seller-card" style="padding: 18px; border-radius: 10px;">
        <div style="font-size: 11.5px; font-weight: 700; text-transform: uppercase; color: var(--text-muted);">Updated Records</div>
        <div style="font-size: 26px; font-weight: 800; color: #3B82F6; margin-top: 4px;">${updatedCount}</div>
        <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 4px;">Commissions & catalog edits</div>
      </div>
      <div class="seller-card" style="padding: 18px; border-radius: 10px;">
        <div style="font-size: 11.5px; font-weight: 700; text-transform: uppercase; color: var(--text-muted);">Created Entities</div>
        <div style="font-size: 26px; font-weight: 800; color: #8B5CF6; margin-top: 4px;">${createdCount}</div>
        <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 4px;">Orders & taxonomies</div>
      </div>
      <div class="seller-card" style="padding: 18px; border-radius: 10px;">
        <div style="font-size: 11.5px; font-weight: 700; text-transform: uppercase; color: var(--text-muted);">Deleted Objects</div>
        <div style="font-size: 26px; font-weight: 800; color: #EF4444; margin-top: 4px;">${deletedCount}</div>
        <div style="font-size: 11.5px; color: var(--text-muted); margin-top: 4px;">Pages & pruned records</div>
      </div>
    </div>

    <!-- Main Audit Log Table Card -->
    <div class="seller-card" style="border-radius: 12px; overflow: hidden; padding: 0;">
      <!-- Toolbar -->
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 16px 20px; border-bottom: 1px solid var(--border); background: #FAFBF9; flex-wrap: wrap; gap: 12px;">
        <div style="position: relative; width: 340px;">
          <input type="text" id="audit-search-input" value="${escapeHTML(searchQuery)}" placeholder="Search actor, target, IP, or changes..." style="width: 100%; height: 36px; padding: 0 12px; border: 1px solid var(--border); border-radius: 6px; font-size: 13px; background: #FFFFFF;">
        </div>

        <div style="display: flex; gap: 10px; align-items: center;">
          <select id="audit-action-filter" style="height: 36px; border: 1px solid var(--border); border-radius: 6px; padding: 0 12px; background: #FFFFFF; font-size: 13px;">
            <option value="all" ${actionFilter === 'all' ? 'selected' : ''}>All Actions</option>
            <option value="Approved" ${actionFilter === 'Approved' ? 'selected' : ''}>Approved</option>
            <option value="Updated" ${actionFilter === 'Updated' ? 'selected' : ''}>Updated</option>
            <option value="Created" ${actionFilter === 'Created' ? 'selected' : ''}>Created</option>
            <option value="Deleted" ${actionFilter === 'Deleted' ? 'selected' : ''}>Deleted</option>
          </select>

          <select id="audit-type-filter" style="height: 36px; border: 1px solid var(--border); border-radius: 6px; padding: 0 12px; background: #FFFFFF; font-size: 13px;">
            <option value="all" ${typeFilter === 'all' ? 'selected' : ''}>All Target Types</option>
            <option value="Seller" ${typeFilter === 'Seller' ? 'selected' : ''}>Seller</option>
            <option value="Commission" ${typeFilter === 'Commission' ? 'selected' : ''}>Commission</option>
            <option value="Product" ${typeFilter === 'Product' ? 'selected' : ''}>Product</option>
            <option value="Order" ${typeFilter === 'Order' ? 'selected' : ''}>Order</option>
            <option value="Content" ${typeFilter === 'Content' ? 'selected' : ''}>Content</option>
          </select>
        </div>
      </div>

      <!-- Table View -->
      <div style="overflow-x: auto;">
        <table style="width: 100%; border-collapse: collapse; text-align: left;">
          <thead>
            <tr style="border-bottom: 1px solid var(--border); background: #F9FAFB; font-size: 12px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px;">
              <th style="padding: 12px 20px;">Timestamp (US Eastern)</th>
              <th style="padding: 12px 16px;">Actor</th>
              <th style="padding: 12px 16px; text-align: center;">Action</th>
              <th style="padding: 12px 16px;">Target Entity</th>
              <th style="padding: 12px 16px;">IP Address</th>
              <th style="padding: 12px 16px;">Attributes Changed</th>
              <th style="padding: 12px 20px; text-align: right;">Diff Inspector</th>
            </tr>
          </thead>
          <tbody>
            ${filtered.length === 0 ? `
              <tr>
                <td colspan="7" style="text-align: center; padding: 48px; color: var(--text-muted);">
                  <div style="font-size: 28px; margin-bottom: 8px;">📋</div>
                  <div style="font-weight: 700; font-size: 15px;">No audit events found</div>
                  <div style="font-size: 12px; margin-top: 4px;">Adjust filters or search parameters.</div>
                </td>
              </tr>
            ` : filtered.map(log => {
              const formattedTime = formatEasternTime(log.timestamp);
              
              let actionBadgeBg = '#DEF7EC';
              let actionBadgeColor = '#03543F';
              if (log.action === 'Updated') {
                actionBadgeBg = '#E1EFFE';
                actionBadgeColor = '#1E429F';
              } else if (log.action === 'Created') {
                actionBadgeBg = '#EDEBFE';
                actionBadgeColor = '#5521B5';
              } else if (log.action === 'Deleted') {
                actionBadgeBg = '#FDE8E8';
                actionBadgeColor = '#9B1C1C';
              }

              let roleBadgeBg = '#F3F4F6';
              let roleBadgeColor = '#4B5563';
              if (log.actor.role === 'Super admin') {
                roleBadgeBg = '#FEF3C7';
                roleBadgeColor = '#92400E';
              }

              return `
                <tr style="border-bottom: 1px solid var(--border); font-size: 13px; background: #FFFFFF;">
                  <td style="padding: 14px 20px; font-family: monospace; font-size: 12px; color: #374151; white-space: nowrap;">
                    <div style="font-weight: 600;">${escapeHTML(formattedTime)}</div>
                    <div style="font-size: 10.5px; color: #9CA3AF; margin-top: 2px;">ID: ${escapeHTML(log.id)}</div>
                  </td>
                  <td style="padding: 14px 16px;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                      <div style="width: 28px; height: 28px; border-radius: 50%; background: #E5E7EB; color: #374151; font-size: 11px; font-weight: 800; display: flex; align-items: center; justify-content: center;">
                        ${escapeHTML(log.actor.initials || 'AD')}
                      </div>
                      <div>
                        <div style="font-weight: 700; color: var(--dark); font-size: 12.5px;">${escapeHTML(log.actor.email)}</div>
                        <span style="font-size: 10px; padding: 1px 6px; border-radius: 4px; background: ${roleBadgeBg}; color: ${roleBadgeColor}; font-weight: 700;">
                          ${escapeHTML(log.actor.role)}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td style="padding: 14px 16px; text-align: center;">
                    <span style="display: inline-block; padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 700; background: ${actionBadgeBg}; color: ${actionBadgeColor};">
                      ${escapeHTML(log.action)}
                    </span>
                  </td>
                  <td style="padding: 14px 16px;">
                    <div>
                      <span style="font-size: 11px; font-weight: 700; color: #6B7280; text-transform: uppercase;">[${escapeHTML(log.target.type)}]</span>
                      <strong style="color: var(--dark); margin-left: 4px;">${escapeHTML(log.target.name)}</strong>
                    </div>
                  </td>
                  <td style="padding: 14px 16px; font-family: monospace; font-size: 11.5px; color: #6B7280;">
                    ${escapeHTML(log.ip)}
                  </td>
                  <td style="padding: 14px 16px;">
                    <div style="display: flex; flex-wrap: wrap; gap: 4px;">
                      ${(log.changes || []).map(ch => `
                        <code style="background: #F3F4F6; padding: 2px 6px; border-radius: 4px; font-size: 11px; color: #1F2937;">${escapeHTML(ch)}</code>
                      `).join('')}
                    </div>
                  </td>
                  <td style="padding: 14px 20px; text-align: right;">
                    <button type="button" class="btn-inspect-diff" data-log-id="${log.id}" style="padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px; background: #FFFFFF; font-size: 12px; font-weight: 600; cursor: pointer; color: var(--dark);">
                      View Diff &rarr;
                    </button>
                  </td>
                </tr>
              `;
            }).join('')}
          </tbody>
        </table>
      </div>
    </div>

    <!-- Diff Modal Backdrop & Modal -->
    <div id="diff-modal-backdrop" style="display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.55); z-index: 10000; backdrop-filter: blur(2px);"></div>
    <div id="diff-modal" style="display: none; position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%); width: 760px; max-width: 95vw; max-height: 85vh; background: #FFFFFF; border-radius: 12px; box-shadow: 0 20px 50px rgba(0,0,0,0.25); z-index: 10001; flex-direction: column; overflow: hidden;">
      <div style="display: flex; justify-content: space-between; align-items: center; padding: 18px 24px; border-bottom: 1px solid var(--border); background: #FAFBF9;">
        <div>
          <h2 id="diff-modal-title" style="font-size: 16px; font-weight: 800; color: var(--dark); margin: 0;">Audit Diff Inspector</h2>
          <div id="diff-modal-meta" style="font-size: 12px; color: var(--text-muted); margin-top: 4px;"></div>
        </div>
        <button type="button" id="btn-close-diff-modal" style="background: none; border: none; font-size: 24px; cursor: pointer; color: var(--text-muted);">&times;</button>
      </div>

      <div style="flex: 1; overflow-y: auto; padding: 24px;">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px;">
          <!-- Before State Box -->
          <div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
              <span style="font-size: 12px; font-weight: 700; color: #DC2626; text-transform: uppercase;">
                &minus; Before State
              </span>
              <span style="font-size: 11px; color: var(--text-muted);">Prior Values</span>
            </div>
            <pre id="diff-before-pre" style="background: #FEF2F2; border: 1px solid #FECACA; border-radius: 8px; padding: 14px; font-family: monospace; font-size: 12px; color: #991B1B; overflow-x: auto; max-height: 340px; margin: 0; line-height: 1.45;"></pre>
          </div>

          <!-- After State Box -->
          <div>
            <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 8px;">
              <span style="font-size: 12px; font-weight: 700; color: #059669; text-transform: uppercase;">
                &plus; After State
              </span>
              <span style="font-size: 11px; color: var(--text-muted);">Committed Values</span>
            </div>
            <pre id="diff-after-pre" style="background: #ECFDF5; border: 1px solid #A7F3D0; border-radius: 8px; padding: 14px; font-family: monospace; font-size: 12px; color: #065F46; overflow-x: auto; max-height: 340px; margin: 0; line-height: 1.45;"></pre>
          </div>
        </div>
      </div>

      <div style="padding: 14px 24px; border-top: 1px solid var(--border); display: flex; justify-content: flex-end; background: #F9FAFB;">
        <button type="button" id="btn-dismiss-diff-modal" style="padding: 8px 18px; border: 1px solid var(--border); border-radius: 6px; background: #FFFFFF; font-size: 13px; font-weight: 600; cursor: pointer;">Close Inspector</button>
      </div>
    </div>
  `;
}

function openDiffModal(logId) {
  const logs = getAuditLogs();
  const log = logs.find(l => l.id === logId);
  if (!log) return;

  const modal = document.getElementById('diff-modal');
  const backdrop = document.getElementById('diff-modal-backdrop');
  const title = document.getElementById('diff-modal-title');
  const meta = document.getElementById('diff-modal-meta');
  const beforePre = document.getElementById('diff-before-pre');
  const afterPre = document.getElementById('diff-after-pre');

  title.textContent = `Audit Diff: ${log.action} ${log.target.type} (${log.target.name})`;
  meta.textContent = `Executed by ${log.actor.email} on ${formatEasternTime(log.timestamp)} from IP ${log.ip}`;

  beforePre.textContent = log.before ? JSON.stringify(log.before, null, 2) : 'null (Entity created)';
  afterPre.textContent = log.after ? JSON.stringify(log.after, null, 2) : 'null (Entity deleted)';

  backdrop.style.display = 'block';
  modal.style.display = 'flex';
}

function closeDiffModal() {
  const modal = document.getElementById('diff-modal');
  const backdrop = document.getElementById('diff-modal-backdrop');
  if (modal) modal.style.display = 'none';
  if (backdrop) backdrop.style.display = 'none';
}

function bindAuditEvents() {
  // Search
  const searchInput = document.getElementById('audit-search-input');
  searchInput?.addEventListener('input', (e) => {
    searchQuery = e.target.value;
    renderAuditView();
    bindAuditEvents();
    const el = document.getElementById('audit-search-input');
    if (el) {
      el.focus();
      el.setSelectionRange(el.value.length, el.value.length);
    }
  });

  // Action filter
  document.getElementById('audit-action-filter')?.addEventListener('change', (e) => {
    actionFilter = e.target.value;
    renderAuditView();
    bindAuditEvents();
  });

  // Type filter
  document.getElementById('audit-type-filter')?.addEventListener('change', (e) => {
    typeFilter = e.target.value;
    renderAuditView();
    bindAuditEvents();
  });

  // Inspect diff buttons
  document.querySelectorAll('.btn-inspect-diff').forEach(btn => {
    btn.addEventListener('click', () => {
      const logId = btn.getAttribute('data-log-id');
      openDiffModal(logId);
    });
  });

  // Close modal
  document.getElementById('btn-close-diff-modal')?.addEventListener('click', closeDiffModal);
  document.getElementById('btn-dismiss-diff-modal')?.addEventListener('click', closeDiffModal);
  document.getElementById('diff-modal-backdrop')?.addEventListener('click', closeDiffModal);

  // Export CSV
  document.getElementById('btn-export-audit-csv')?.addEventListener('click', () => {
    const logs = getAuditLogs();
    const rows = [
      ['Audit ID', 'Timestamp Eastern Time', 'Actor Name', 'Actor Email', 'Actor Role', 'Action', 'Target Type', 'Target Name', 'IP Address', 'Modified Fields', 'Before JSON', 'After JSON'],
      ...logs.map(l => [
        l.id,
        `"${formatEasternTime(l.timestamp)}"`,
        `"${l.actor.name}"`,
        `"${l.actor.email}"`,
        l.actor.role,
        l.action,
        l.target.type,
        `"${l.target.name}"`,
        l.ip,
        `"${(l.changes || []).join(', ')}"`,
        `"${JSON.stringify(l.before || {}).replace(/"/g, '""')}"`,
        `"${JSON.stringify(l.after || {}).replace(/"/g, '""')}"`
      ])
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(e => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'ameza_platform_audit_trail.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showAdminToast('Platform audit log exported to CSV');
  });
}
