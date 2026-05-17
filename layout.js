// layout.js - Alpine.js Template Engine with Router

async function loadTemplates() {
  const els = document.querySelectorAll('[data-include]');
  await Promise.all([...els].map(async el => {
    const res = await fetch(el.dataset.include);
    if (res.ok) el.innerHTML = await res.text();
  }));
}

document.addEventListener('alpine:init', () => {

  const allMenuItems = [
    { label: 'Dashboard', icon: 'icon-[tabler--dashboard]', href: '#/', page: 'pages/dashboard.html' },
    { label: 'Forms', icon: 'icon-[tabler--forms]', href: '#/form', page: 'pages/form.html' },
    { label: 'Orders', icon: 'icon-[tabler--list-details]', href: '#/table', page: 'pages/table.html' },
    { label: 'Invoice', icon: 'icon-[tabler--file-invoice]', href: '#/invoice', page: 'pages/invoice.html' },
    { label: 'POS', icon: 'icon-[tabler--shopping-cart]', href: '#/pos', page: 'pages/pos.html' },
    { label: 'Settings', icon: 'icon-[tabler--settings]', href: '#/settings', page: 'pages/settings.html' },
  ];

  // Global store
  Alpine.store('app', {
    pageTitle: '',
    breadcrumb: null,
    currentHash: location.hash || '#/',
    company: 'PT. Acme Indonesia',
    companies: ['PT. Acme Indonesia', 'CV. Berkah Digital', 'PT. Nusantara Tech'],
    user: { name: 'John Doe', email: 'john@acme.co.id', initials: 'JD' },
    sidebarOpen: false,
    profileOpen: false,
    drawerOpen: false,
    toastVisible: false,
    toastMessage: '',
    toastType: 'alert-success',

    toggleSidebar() { this.sidebarOpen = !this.sidebarOpen },
    closeSidebar() { this.sidebarOpen = false },
    toggleProfile() { this.profileOpen = !this.profileOpen },
    showToast(msg, type = 'alert-success') {
      this.toastMessage = msg; this.toastType = type; this.toastVisible = true;
      setTimeout(() => this.toastVisible = false, 3000);
    },
    openDrawer() { this.drawerOpen = true },
    closeDrawer() { this.drawerOpen = false },
  });

  // Router
  Alpine.data('router', () => ({
    async init() { this.navigate(); window.addEventListener('hashchange', () => this.navigate()); },
    async navigate() {
      const hash = location.hash.replace('#', '') || '/';
      Alpine.store('app').currentHash = '#' + hash;
      const item = allMenuItems.find(m => m.href === '#' + hash) || allMenuItems[0];
      Alpine.store('app').pageTitle = item.label;
      Alpine.store('app').breadcrumb = [{ label: item.label }];
      const page = document.getElementById('page');
      try {
        const res = await fetch(item.page);
        page.innerHTML = res.ok ? await res.text() : '<div class="alert alert-error text-xs">Page not found</div>';
        page.querySelectorAll('script').forEach(old => { const s = document.createElement('script'); if (old.src) s.src = old.src; else s.textContent = old.textContent; old.replaceWith(s); });
        Alpine.initTree(page);
      } catch (e) { page.innerHTML = '<div class="alert alert-warning text-xs">Failed to load</div>'; }
    }
  }));

  // Sidebar
  Alpine.data('sidebar', () => ({
    menu: allMenuItems.filter((_, i) => i === 0),
    mainMenu: allMenuItems.filter((_, i) => i > 0 && i < 5),
    systemMenu: allMenuItems.filter((_, i) => i >= 5),
    profileMenu: [
      { label: 'Profile', icon: 'icon-[tabler--user]', href: '#' },
      { label: 'Settings', icon: 'icon-[tabler--settings]', href: '#/settings' },
      { label: 'Billing', icon: 'icon-[tabler--credit-card]', href: '#' },
    ],
    isActive(href) { return Alpine.store('app').currentHash === href },
  }));

  // Footer nav
  Alpine.data('footerNav', () => ({
    items: [
      allMenuItems[2], // Invoice
      allMenuItems[3], // POS
      { ...allMenuItems[0], center: true }, // Dashboard
      allMenuItems[4], // Orders
      { label: 'Profile', icon: 'icon-[tabler--user]', href: '#' },
    ],
    isActive(href) { return Alpine.store('app').currentHash === href },
  }));
});

document.addEventListener('DOMContentLoaded', () => loadTemplates());
