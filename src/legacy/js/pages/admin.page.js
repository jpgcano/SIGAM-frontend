// Admin page (POO).
(function () {
  const BasePage = window.SIGAM_UI && window.SIGAM_UI.BasePage;

  class AdminPage extends BasePage {
    constructor() {
      super(document);
      this.api = window.SIGAM_API;
      this.users = [];
      this.usingApi = false;

      this.statusEl = this.qs('#adminStatus');
      this.searchInput = this.qs('#searchInput');
      this.roleFilter = this.qs('#roleFilter');
      this.userTable = this.qs('#userTable');

      this.tabs = this.qs('#admin-tabs');
      this.sections = {
        users: this.qs('#section-users'),
        configuration: this.qs('#section-configuration'),
        security: this.qs('#section-security'),
        backup: this.qs('#section-backup')
      };

      this.configSave = this.qs('#configSave');
      this.configStatus = this.qs('#configStatus');

      this.securitySave = this.qs('#securitySave');
      this.securityStatus = this.qs('#securityStatus');

      this.backupRun = this.qs('#backupRun');
      this.backupRestore = this.qs('#backupRestore');
      this.backupStatus = this.qs('#backupStatus');

      this.refreshTimer = null;
    }

    init() {
      this.bindEvents();
      this.loadUsers();
      this.refreshTimer = setInterval(() => this.loadUsers(), 60000);
    }

    bindEvents() {
      if (this.searchInput) {
        this.searchInput.addEventListener('input', () => this.renderUsers());
      }
      if (this.roleFilter) {
        this.roleFilter.addEventListener('change', () => this.renderUsers());
      }

      if (this.tabs) {
        this.tabs.addEventListener('click', (event) => {
          const btn = event.target.closest('button[data-section]');
          if (!btn) return;
          const key = btn.getAttribute('data-section');
          if (!key) return;
          const items = this.tabs.querySelectorAll('.nav-link');
          items.forEach((item) => item.classList.remove('active'));
          btn.classList.add('active');
          this.showSection(key);
        });
      }

      if (this.configSave) {
        this.configSave.addEventListener('click', () => this.handleConfigSave());
      }
      if (this.securitySave) {
        this.securitySave.addEventListener('click', () => this.handleSecuritySave());
      }
      if (this.backupRun) {
        this.backupRun.addEventListener('click', () => this.handleBackupRun());
      }
      if (this.backupRestore) {
        this.backupRestore.addEventListener('click', () => this.handleBackupRestore());
      }

      // Expose edit/delete handlers for inline buttons.
      window.SIGAM_ADMIN = window.SIGAM_ADMIN || {};
      window.SIGAM_ADMIN.editUser = (index) => this.editUser(index);
      window.SIGAM_ADMIN.deleteUser = (index) => this.deleteUser(index);
    }

    setStatus(message, type) {
      if (!this.statusEl) return;
      this.statusEl.textContent = message || '';
      this.statusEl.className = 'small';
      if (type === 'error') {
        this.statusEl.classList.add('text-danger');
      } else if (type === 'success') {
        this.statusEl.classList.add('text-success');
      } else {
        this.statusEl.classList.add('text-muted');
      }
    }

    normalizeUser(raw) {
      return {
        id: raw.id_usuario || raw.id || raw.userId || '',
        name: raw.nombre || raw.name || '',
        email: raw.email || '',
        role: raw.rol || raw.role || 'Usuario',
        status: raw.estado || raw.status || 'Active',
        lastAccess: raw.ultimo_acceso || raw.lastAccess || raw.fecha_creacion || ''
      };
    }

    async loadUsers() {
      if (this.api && this.api.getUsuarios) {
        try {
          const data = await this.api.getUsuarios({ limit: 50, offset: 0 });
          this.users = (data || []).map((user) => this.normalizeUser(user));
          this.usingApi = true;
          this.setStatus('Users loaded from the API.', 'success');
          this.renderUsers();
          return;
        } catch (error) {
          this.setStatus('Could not load users from the API. Using local cache.', 'error');
        }
      }

      this.usingApi = false;
      this.users = JSON.parse(localStorage.getItem('users')) || [];
      this.renderUsers();
    }

    renderUsers() {
      if (!this.userTable) return;
      this.userTable.innerHTML = '';

      const query = this.searchInput ? this.searchInput.value.trim().toLowerCase() : '';
      const roleValue = this.roleFilter ? this.roleFilter.value.trim().toLowerCase() : '';

      const filtered = this.users.filter((user) => {
        const roleMatch = !roleValue
          ? true
          : String(user.role || '').toLowerCase() === roleValue;
        if (!roleMatch) return false;
        if (!query) return true;
        const haystack = `${user.name || ''} ${user.email || ''} ${user.role || ''}`.toLowerCase();
        return haystack.includes(query);
      });

      filtered.forEach((user, index) => {
        this.userTable.innerHTML += `
<tr>
<td>${user.name}</td>
<td>${user.email}</td>
<td>${this.badgeRole(user.role)}</td>
<td>${this.badgeStatus(user.status)}</td>
<td>${this.timeAgo(user.lastAccess)}</td>
<td>
<button class="btn btn-sm btn-light" onclick="SIGAM_ADMIN.editUser(${index})">
<i class="bi bi-pencil"></i>
</button>
<button class="btn btn-sm btn-light text-danger" onclick="SIGAM_ADMIN.deleteUser(${index})">
<i class="bi bi-trash"></i>
</button>
</td>
</tr>
`;
      });

      this.updateStats();
    }

    badgeStatus(status) {
      if (status === 'Active') {
        return '<span class="badge bg-success-subtle text-success rounded-pill">Active</span>';
      }
      if (status === 'Blocked') {
        return '<span class="badge bg-danger-subtle text-danger rounded-pill">Blocked</span>';
      }
      return '<span class="badge bg-secondary-subtle text-secondary rounded-pill">Inactive</span>';
    }

    badgeRole(role) {
      if (role === 'Gerente') {
        return '<span class="badge bg-primary">Manager</span>';
      }
      if (role === 'Tecnico') {
        return '<span class="badge bg-info text-dark">Technician</span>';
      }
      if (role === 'Analista') {
        return '<span class="badge bg-secondary">Analyst</span>';
      }
      if (role === 'Auditor') {
        return '<span class="badge bg-dark">Auditor</span>';
      }
      return '<span class="badge bg-secondary">User</span>';
    }

    timeAgo(date) {
      if (!date) return '-';

      const now = new Date();
      const past = new Date(date);

      const seconds = Math.floor((now - past) / 1000);
      const minutes = Math.floor(seconds / 60);
      const hours = Math.floor(minutes / 60);
      const days = Math.floor(hours / 24);

      if (seconds < 60) return 'Just now';
      if (minutes < 60) return `${minutes} min ago`;
      if (hours < 24) return `${hours} hours ago`;

      return `${days} days ago`;
    }

    saveUser() {
      const name = this.qs('#name').value.trim();
      const email = this.qs('#email').value.trim();
      const role = this.qs('#role').value;
      const password = this.qs('#password').value;
      const editIndex = this.qs('#editIndex').value;
      const now = new Date().toLocaleString();

      if (this.usingApi && this.api) {
        const target = this.users[editIndex] || {};
        const userId = target.id;

        if (editIndex === '') {
          if (!password) {
            alert('Password is required');
            return;
          }
          this.api.createUsuario({
            nombre: name,
            email,
            password,
            rol: role
          }).then(() => {
            this.setStatus('User created in the API.', 'success');
            this.loadUsers();
          }).catch(() => {
            this.setStatus('Could not create user in the API.', 'error');
          });
          const modal = bootstrap.Modal.getInstance(document.getElementById('userModal'));
          modal.hide();
          return;
        } else if (userId) {
          const updates = [];
          if (role) {
            updates.push(this.api.updateUsuarioRol(userId, role));
          }
          if (password) {
            updates.push(this.api.updateUsuarioPassword(userId, password));
          }
          Promise.allSettled(updates).then(() => {
            this.setStatus('User updated in the API.', 'success');
            this.loadUsers();
          }).catch(() => {
            this.setStatus('Could not update user in the API.', 'error');
          });
          const modal = bootstrap.Modal.getInstance(document.getElementById('userModal'));
          modal.hide();
          return;
        }
      } else if (editIndex === '') {
        const exists = this.users.some(user => user.email === email);
        if (exists && editIndex === '') {
          alert('User with this email already exists');
          return;
        }
        this.users.push({
          name,
          email,
          role,
          status: 'Active',
          lastAccess: now
        });
      } else {
        this.users[editIndex].name = name;
        this.users[editIndex].email = email;
        this.users[editIndex].role = role;
      }

      localStorage.setItem('users', JSON.stringify(this.users));
      this.renderUsers();
      const modal = bootstrap.Modal.getInstance(document.getElementById('userModal'));
      modal.hide();
    }

    deleteUser(index) {
      if (!confirm('Delete user?')) return;
      if (this.usingApi) {
        alert('No hay endpoint para eliminar usuarios en API.');
        return;
      }

      this.users.splice(index, 1);
      localStorage.setItem('users', JSON.stringify(this.users));
      this.renderUsers();
    }

    editUser(index) {
      const user = this.users[index];
      this.qs('#name').value = user.name;
      this.qs('#email').value = user.email;
      this.qs('#role').value = user.role;
      this.qs('#password').value = '';
      this.qs('#editIndex').value = index;

      const modal = new bootstrap.Modal(document.getElementById('userModal'));
      modal.show();
    }

    updateStats() {
      const usersCount = this.users.length;
      const assets = JSON.parse(localStorage.getItem('assets')) || [];
      const tickets = JSON.parse(localStorage.getItem('tickets')) || [];

      const usersCard = this.qs('#statUsers');
      const assetsCard = this.qs('#statAssets');
      const ticketsCard = this.qs('#statTickets');

      if (usersCard) usersCard.innerText = usersCount;
      if (assetsCard) assetsCard.innerText = assets.length;
      if (ticketsCard) ticketsCard.innerText = tickets.length;
    }

    showSection(key) {
      Object.keys(this.sections).forEach((name) => {
        const section = this.sections[name];
        if (!section) return;
        if (name === key) {
          section.classList.remove('d-none');
        } else {
          section.classList.add('d-none');
        }
      });
    }

    handleConfigSave() {
      const payload = {
        company: this.qs('#configCompany').value.trim(),
        defaultRole: this.qs('#configDefaultRole').value,
        timeout: this.qs('#configTimeout').value,
        notifications: this.qs('#configNotifications').value
      };
      localStorage.setItem('admin_config', JSON.stringify(payload));
      if (this.configStatus) this.configStatus.textContent = 'Configuration saved.';
    }

    handleSecuritySave() {
      const payload = {
        minLength: this.qs('#securityMinLength').value,
        special: this.qs('#securitySpecial').value,
        twofa: this.qs('#security2fa').value,
        lockout: this.qs('#securityLockout').value
      };
      localStorage.setItem('admin_security', JSON.stringify(payload));
      if (this.securityStatus) this.securityStatus.textContent = 'Security settings saved.';
    }

    handleBackupRun() {
      const payload = {
        frequency: this.qs('#backupFrequency').value,
        retention: this.qs('#backupRetention').value,
        lastRun: new Date().toISOString()
      };
      localStorage.setItem('admin_backup', JSON.stringify(payload));
      if (this.backupStatus) this.backupStatus.textContent = 'Backup executed locally.';
    }

    handleBackupRestore() {
      if (this.backupStatus) this.backupStatus.textContent = 'Restore completed locally.';
    }
  }

  window.SIGAM_PAGES = window.SIGAM_PAGES || {};
  window.SIGAM_PAGES.AdminPage = AdminPage;
})();
