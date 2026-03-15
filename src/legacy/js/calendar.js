// Calendar bootstrapping (POO).
(function () {
  const CalendarPage = window.SIGAM_PAGES && window.SIGAM_PAGES.CalendarPage;
  if (!CalendarPage) {
    console.error('CalendarPage class not found.');
    return;
  }
  const page = new CalendarPage();
  page.init();
})();
