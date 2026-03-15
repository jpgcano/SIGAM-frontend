// Admin bootstrapping (POO).
(function () {
  const AdminPage = window.SIGAM_PAGES && window.SIGAM_PAGES.AdminPage;
  if (!AdminPage) {
    console.error('AdminPage class not found.');
    return;
  }
  const page = new AdminPage();
  page.init();
})();
