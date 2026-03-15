// Base UI page class with DOM helpers and status handling.
(function () {
  class BasePage {
    constructor(root = document) {
      this.root = root;
    }

    qs(selector) {
      return this.root.querySelector(selector);
    }

    qsa(selector) {
      return Array.from(this.root.querySelectorAll(selector));
    }

    setStatus(el, message, type) {
      if (!el) return;
      el.textContent = message || '';
      el.style.color = '#6b7280';
      if (type === 'error') el.style.color = '#dc2626';
      if (type === 'success') el.style.color = '#059669';
    }
  }

  window.SIGAM_UI = window.SIGAM_UI || {};
  window.SIGAM_UI.BasePage = BasePage;
})();
