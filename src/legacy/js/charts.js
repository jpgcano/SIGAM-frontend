// Dashboard bootstrapping (POO).
(function () {
  const DashboardPage = window.SIGAM_PAGES && window.SIGAM_PAGES.DashboardPage;
  if (!DashboardPage) {
    console.error('DashboardPage class not found.');
    return;
  }
  const page = new DashboardPage();
  page.init();
})();
