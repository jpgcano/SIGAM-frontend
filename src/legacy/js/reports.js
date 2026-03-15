// Reports bootstrapping (POO).
(function () {
  const ReportsPage = window.SIGAM_PAGES && window.SIGAM_PAGES.ReportsPage;
  if (!ReportsPage) {
    console.error('ReportsPage class not found.');
    return;
  }
  const page = new ReportsPage();
  page.init();
})();
