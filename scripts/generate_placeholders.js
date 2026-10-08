const fs = require('fs');
const path = require('path');

const pages = [
  { id: 'returns', title: 'Returns', subtitle: 'Manage merchant return requests and inspection clearances.', icon: 'fa-rotate-left' },
  { id: 'products', title: 'Products', subtitle: 'Add, edit, and organize catalog listings and variants.', icon: 'fa-tags' },
  { id: 'inventory', title: 'Inventory', subtitle: 'Track warehouse stock levels and configure reorder thresholds.', icon: 'fa-cubes' },
  { id: 'reviews', title: 'Reviews', subtitle: 'Read verified customer feedback and reply to buyer questions.', icon: 'fa-star' },
  { id: 'messages', title: 'Messages', subtitle: 'Communicate directly with buyers regarding product inquiries.', icon: 'fa-comments' },
  { id: 'earnings', title: 'Earnings', subtitle: 'View real-time sales revenue, platform fees, and gross margins.', icon: 'fa-money-bill-wave' },
  { id: 'payouts', title: 'Payouts', subtitle: 'Track double-entry ledger payouts and schedule bank transfers.', icon: 'fa-building-columns' },
  { id: 'discounts', title: 'Discounts', subtitle: 'Create coupon codes, percentage sales, and automatic cart promos.', icon: 'fa-percent' },
  { id: 'shipping', title: 'Shipping', subtitle: 'Configure regional delivery zones, carrier flat rates, and express couriers.', icon: 'fa-truck-fast' },
  { id: 'analytics', title: 'Analytics', subtitle: 'Review conversion funnels, buyer retention, and top-selling SKUs.', icon: 'fa-chart-pie' },
  { id: 'settings', title: 'Settings', subtitle: 'Manage store information, brand banner, policies, and staff access.', icon: 'fa-gear' }
];

pages.forEach(p => {
  const filePath = path.join(__dirname, '..', `${p.id}.html`);
  const html = `<!DOCTYPE html>
<html lang="en" data-theme="light">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${p.title} | AMEZA Seller Central</title>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
  <link rel="stylesheet" href="css/dashboard.css">
  <link rel="icon" type="image/png" href="assets/ameza-logo.png">
</head>
<body>
  <header id="app-topbar"></header>
  <div class="app-layout">
    <aside id="app-sidebar"></aside>
    <main class="main-content" role="main">
      <div class="page-header">
        <div>
          <h1 class="page-title">${p.title}</h1>
          <p class="page-subtitle">${p.subtitle}</p>
        </div>
      </div>
      <div class="placeholder-card">
        <div class="placeholder-icon"><i class="fa-solid ${p.icon}"></i></div>
        <h2 style="font-size: 1.3rem; font-weight: 700; margin-bottom: 8px;">${p.title} Hub</h2>
        <p style="color: var(--text-secondary); max-width: 440px; margin: 0 auto 20px;">
          This is a placeholder page for ${p.title.toLowerCase()}. Use the sidebar navigation or command palette (Ctrl+K) to browse other screens.
        </p>
        <a href="index.html" class="btn-header-action" style="text-decoration: none;">&larr; Back to Dashboard Home</a>
      </div>
    </main>
  </div>
  <script type="module">
    import { initShell } from './js/shell.js';
    initShell('${p.id}');
  </script>
</body>
</html>`;
  fs.writeFileSync(filePath, html);
  console.log(`Generated ${p.id}.html`);
});
