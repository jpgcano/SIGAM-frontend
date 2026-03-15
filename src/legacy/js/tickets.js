// Tickets bootstrapping (POO).
(function () {
  const TicketsPage = window.SIGAM_PAGES && window.SIGAM_PAGES.TicketsPage;
  if (!TicketsPage) {
    console.error('TicketsPage class not found.');
    return;
  }
  const page = new TicketsPage();
  page.init();
})();
