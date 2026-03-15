// CRUD page helpers for submit buttons.
(function () {
  const ListPage = window.SIGAM_UI && window.SIGAM_UI.ListPage;

  class CrudPage extends ListPage {
    setSubmitting(button, isSubmitting, label = 'Save') {
      if (!button) return;
      button.disabled = isSubmitting;
      button.textContent = isSubmitting ? 'Saving...' : label;
    }
  }

  window.SIGAM_UI = window.SIGAM_UI || {};
  window.SIGAM_UI.CrudPage = CrudPage;
})();
