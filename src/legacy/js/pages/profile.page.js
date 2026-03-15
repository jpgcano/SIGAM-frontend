// Profile page (POO).
(function () {
  const BasePage = window.SIGAM_UI && window.SIGAM_UI.BasePage;

  class ProfilePage extends BasePage {
    constructor() {
      super(document);
      this.api = window.SIGAM_API;

      this.nameInput = this.qs('#profileName');
      this.emailInput = this.qs('#profileEmail');
      this.roleInput = this.qs('#profileRole');
      this.lastAccessInput = this.qs('#profileLastAccess');

      this.passwordForm = this.qs('#passwordForm');
      this.newPassword = this.qs('#newPassword');
      this.confirmPassword = this.qs('#confirmPassword');
      this.passwordStatus = this.qs('#passwordStatus');
      this.passwordSubmit = this.qs('#passwordSubmit');

      this.logoutBtn = this.qs('#logoutBtn');
    }

    init() {
      this.loadProfile();
      this.bindEvents();
    }

    bindEvents() {
      if (this.passwordForm) {
        this.passwordForm.addEventListener('submit', (event) => this.handlePassword(event));
      }
      if (this.logoutBtn) {
        this.logoutBtn.addEventListener('click', () => this.handleLogout());
      }
    }

    loadProfile() {
      const user = this.api && this.api.getUser ? this.api.getUser() : null;
      if (!user) {
        this.setStatus(this.passwordStatus, 'No user session found.', 'error');
        return;
      }
      const name = user.nombre || user.name || user.fullName || user.full_name || 'User';
      const email = user.email || user.correo || '';
      const role = user.rol || user.role || user.Rol || user.ROLE || '';
      const lastAccess = user.ultimo_acceso || user.lastAccess || user.fecha_creacion || '';

      if (this.nameInput) this.nameInput.value = name;
      if (this.emailInput) this.emailInput.value = email;
      if (this.roleInput) this.roleInput.value = role || 'Usuario';
      if (this.lastAccessInput) this.lastAccessInput.value = lastAccess || '-';
    }

    setPasswordStatus(message, type) {
      if (!this.passwordStatus) return;
      this.passwordStatus.textContent = message || '';
      this.passwordStatus.classList.remove('text-success', 'text-danger', 'text-muted');
      if (type === 'success') {
        this.passwordStatus.classList.add('text-success');
      } else if (type === 'error') {
        this.passwordStatus.classList.add('text-danger');
      } else {
        this.passwordStatus.classList.add('text-muted');
      }
    }

    setSubmitting(isSubmitting) {
      if (!this.passwordSubmit) return;
      this.passwordSubmit.disabled = isSubmitting;
      this.passwordSubmit.textContent = isSubmitting ? 'Updating...' : 'Update Password';
    }

    async handlePassword(event) {
      event.preventDefault();
      this.setPasswordStatus('');

      const password = this.newPassword ? this.newPassword.value.trim() : '';
      const confirm = this.confirmPassword ? this.confirmPassword.value.trim() : '';

      if (!password || !confirm) {
        this.setPasswordStatus('Password is required.', 'error');
        return;
      }

      if (password !== confirm) {
        this.setPasswordStatus('Passwords do not match.', 'error');
        return;
      }

      const user = this.api && this.api.getUser ? this.api.getUser() : null;
      const userId = user && (user.id || user.id_usuario || user.userId);
      if (!userId) {
        this.setPasswordStatus('User id not found in session.', 'error');
        return;
      }

      if (!this.api || !this.api.updateUsuarioPassword) {
        this.setPasswordStatus('API not available.', 'error');
        return;
      }

      try {
        this.setSubmitting(true);
        await this.api.updateUsuarioPassword(userId, password);
        this.setPasswordStatus('Password updated successfully.', 'success');
        if (this.passwordForm) this.passwordForm.reset();
      } catch (error) {
        this.setPasswordStatus(error.message || 'Could not update password.', 'error');
      } finally {
        this.setSubmitting(false);
      }
    }

    handleLogout() {
      if (this.api && this.api.clearToken) this.api.clearToken();
      if (this.api && this.api.clearUser) this.api.clearUser();
      window.location.href = 'login.html';
    }
  }

  window.SIGAM_PAGES = window.SIGAM_PAGES || {};
  window.SIGAM_PAGES.ProfilePage = ProfilePage;
})();
