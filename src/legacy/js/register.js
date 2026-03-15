// Register bootstrapping (POO).
(function () {
  const RegisterPage = window.SIGAM_PAGES && window.SIGAM_PAGES.RegisterPage;
  if (!RegisterPage) {
    console.error('RegisterPage class not found.');
    return;
  }
  const page = new RegisterPage();
  page.init();
})();
