// Profile bootstrapping (POO).
(function () {
  const ProfilePage = window.SIGAM_PAGES && window.SIGAM_PAGES.ProfilePage;
  if (!ProfilePage) {
    console.error('ProfilePage class not found.');
    return;
  }
  const page = new ProfilePage();
  page.init();
})();
