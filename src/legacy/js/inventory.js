// Inventory bootstrapping (POO).
(function () {
  const InventoryPage = window.SIGAM_PAGES && window.SIGAM_PAGES.InventoryPage;
  if (!InventoryPage) {
    console.error('InventoryPage class not found.');
    return;
  }
  const page = new InventoryPage();
  page.init();
})();
