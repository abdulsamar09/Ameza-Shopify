/**
 * AMEZA Mock Client & Data Provider — js/api/mock-client.js
 * Universal asynchronous loader for all /mock/*.json datasets.
 * Includes simulated network latency (100ms - 200ms) for realistic loading states.
 */

const cache = new Map();

/**
 * Loads a mock dataset from /mock/<filename>.json.
 * Works seamlessly in both browser (fetch) and Node.js environments.
 * @param {string} endpoint - Name of mock file (e.g., 'products', 'sellers', 'orders')
 * @param {boolean} [forceRefresh=false]
 * @returns {Promise<any>}
 */
export async function fetchMock(endpoint, forceRefresh = false) {
  const cleanName = endpoint.replace(/^\/?mock\//, '').replace(/\.json$/, '');
  const cacheKey = cleanName;

  if (!forceRefresh && cache.has(cacheKey)) {
    return JSON.parse(JSON.stringify(cache.get(cacheKey)));
  }

  // In browser
  if (typeof window !== 'undefined' && typeof window.fetch === 'function') {
    // Add realistic 120ms micro-latency for UI skeleton/loading validation
    await new Promise(r => setTimeout(r, 120));

    // Determine correct relative path from current URL
    let basePath = 'mock/';
    // If inside a subfolder (like /design-review or /seller/ etc)
    const pathname = window.location.pathname;
    if (pathname.includes('/seller/') || pathname.includes('/admin/')) {
      basePath = '../mock/';
    }

    try {
      const res = await fetch(`${basePath}${cleanName}.json`);
      if (!res.ok) {
        throw new Error(`Failed to load mock dataset: ${cleanName}.json (${res.status})`);
      }
      const data = await res.json();
      cache.set(cacheKey, data);
      return JSON.parse(JSON.stringify(data));
    } catch (err) {
      console.warn(`[AMEZA Mock Client] Fetch error for ${cleanName}:`, err);
      throw err;
    }
  }

  // In Node.js environment
  if (typeof process !== 'undefined' && process.versions && process.versions.node) {
    const fs = await import('fs');
    const path = await import('path');
    const mockFile = path.resolve(process.cwd(), 'mock', `${cleanName}.json`);
    const content = fs.readFileSync(mockFile, 'utf8');
    const data = JSON.parse(content);
    cache.set(cacheKey, data);
    return JSON.parse(JSON.stringify(data));
  }

  return null;
}

// Global browser exposure
if (typeof window !== 'undefined') {
  window.AmezaMockClient = { fetchMock };
}
