// Register page (POO).
(function () {
  const BasePage = window.SIGAM_UI && window.SIGAM_UI.BasePage;

  class RegisterPage extends BasePage {
    constructor() {
      super(document);
      this.api = window.SIGAM_API;

      this.form = this.qs('#registerForm');
      this.nameInput = this.qs('#name');
      this.surnameInput = this.qs('#surname');
      this.emailInput = this.qs('#email');
      this.passwordInput = this.qs('#password');
      this.confirmInput = this.qs('#confirmPassword');
      this.roleInput = this.qs('#role');
      this.statusEl = this.qs('#registerStatus');
      this.submitBtn = this.qs('#registerBtn');
    }

    init() {
      if (!this.form) return;
      this.form.addEventListener('submit', (event) => this.handleSubmit(event));
    }

    setSubmitting(isSubmitting) {
      if (!this.submitBtn) return;
      this.submitBtn.disabled = isSubmitting;
      this.submitBtn.textContent = isSubmitting ? 'Creating...' : 'Create Account';
    }

    async handleSubmit(event) {
      event.preventDefault();
      this.setStatus(this.statusEl, '');

      const name = this.nameInput ? this.nameInput.value.trim() : '';
      const surname = this.surnameInput ? this.surnameInput.value.trim() : '';
      const email = this.emailInput ? this.emailInput.value.trim() : '';
      const password = this.passwordInput ? this.passwordInput.value : '';
      const confirmPassword = this.confirmInput ? this.confirmInput.value : '';
      const role = this.roleInput ? this.roleInput.value : 'Usuario';

      if (!name || !surname || !email || !password) {
        this.setStatus(this.statusEl, 'Please complete all required fields.', 'error');
        return;
      }

      if (password !== confirmPassword) {
        this.setStatus(this.statusEl, 'Passwords do not match.', 'error');
        return;
      }

      if (!this.api) {
        this.setStatus(this.statusEl, 'API config not loaded.', 'error');
        return;
      }

      try {
        this.setSubmitting(true);
        await this.api.apiRequest('/api/auth/register', {
          method: 'POST',
          body: {
            nombre: `${name} ${surname}`.trim(),
            email,
            password,
            rol: role
          }
        });

        this.setStatus(this.statusEl, 'Registration successful. Redirecting...', 'success');
        window.location.href = 'login.html';
      } catch (error) {
        this.setStatus(this.statusEl, error.message || 'Registration error.', 'error');
      } finally {
        this.setSubmitting(false);
      }
    }
  }

  window.SIGAM_PAGES = window.SIGAM_PAGES || {};
  window.SIGAM_PAGES.RegisterPage = RegisterPage;
})();
