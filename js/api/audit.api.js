/**
 * AMEZA Admin Console — Platform Audit Log API (js/api/audit.api.js)
 * Provides immutable audit logging for administrative actions,
 * commission changes, payout authorizations, and security events.
 */

const STORAGE_KEY = 'ameza_audit_log';

const DEFAULT_AUDIT_LOGS = [
  {
    id: 'aud_01',
    action: 'Approved',
    actor: {
      name: 'admin@example.com',
      email: 'admin@example.com',
      role: 'Super admin',
      initials: 'AT'
    },
    target: {
      type: 'Seller',
      name: 'Austin Leather Co',
      icon: 'store'
    },
    timestamp: 1787013480622,
    ip: '203.0.113.12',
    changes: ['status', 'w9Status'],
    before: {
      status: 'under_review',
      w9Status: 'pending'
    },
    after: {
      status: 'approved',
      w9Status: 'verified'
    }
  },
  {
    id: 'aud_02',
    action: 'Updated',
    actor: {
      name: 'admin@example.com',
      email: 'admin@example.com',
      role: 'Super admin',
      initials: 'AT'
    },
    target: {
      type: 'Commission',
      name: 'Portland Artisan Goods (12%)',
      icon: 'percent'
    },
    timestamp: 1788741480622,
    ip: '203.0.113.12',
    changes: ['commissionRatePct'],
    before: {
      commissionRatePct: 10
    },
    after: {
      commissionRatePct: 12
    }
  },
  {
    id: 'aud_03',
    action: 'Updated',
    actor: {
      name: 'maria.smith@example.com',
      email: 'maria.smith@example.com',
      role: 'Staff',
      initials: 'MS'
    },
    target: {
      type: 'Product',
      name: 'Gaming Laptop',
      icon: 'box'
    },
    timestamp: 1790296680622,
    ip: '203.0.113.67',
    changes: ['priceCents', 'inventory'],
    before: {
      id: 7821,
      title: 'Gaming Laptop',
      priceCents: 129900,
      inventory: 15,
      status: 'active'
    },
    after: {
      id: 7821,
      title: 'Gaming Laptop',
      priceCents: 124900,
      inventory: 25,
      status: 'active'
    }
  },
  {
    id: 'aud_04',
    action: 'Created',
    actor: {
      name: 'jack.callahan@example.com',
      email: 'jack.callahan@example.com',
      role: 'Seller',
      initials: 'JD'
    },
    target: {
      type: 'Order',
      name: '#ORD-10042',
      icon: 'cart'
    },
    timestamp: 1790901480622,
    ip: '203.0.113.18',
    changes: ['orderStatus'],
    before: null,
    after: {
      id: 'ORD-10042',
      status: 'confirmed',
      subtotalCents: 14999
    }
  },
  {
    id: 'aud_05',
    action: 'Deleted',
    actor: {
      name: 'admin@example.com',
      email: 'admin@example.com',
      role: 'Super admin',
      initials: 'AT'
    },
    target: {
      type: 'Content',
      name: 'Outdated Promotion Page',
      icon: 'file'
    },
    timestamp: 1791160680622,
    ip: '203.0.113.12',
    changes: ['status'],
    before: {
      title: 'Outdated Promotion Page',
      status: 'published'
    },
    after: {
      title: 'Outdated Promotion Page',
      status: 'deleted'
    }
  }
];

export function getAuditLogs() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed to parse audit log from localStorage', e);
  }
  return JSON.parse(JSON.stringify(DEFAULT_AUDIT_LOGS));
}

export function saveAuditLogs(logs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
}

export function logAuditEvent(action, actor, target, changes, before, after) {
  const logs = getAuditLogs();
  const entry = {
    id: `aud_${Date.now()}`,
    action,
    actor: actor || {
      name: 'admin@example.com',
      email: 'admin@example.com',
      role: 'Super admin',
      initials: 'AT'
    },
    target: target || {
      type: 'System',
      name: 'Platform Setting',
      icon: 'gear'
    },
    timestamp: Date.now(),
    ip: '203.0.113.12',
    changes: Array.isArray(changes) ? changes : [changes],
    before: before || null,
    after: after || null
  };
  logs.unshift(entry);
  saveAuditLogs(logs);
  return entry;
}
