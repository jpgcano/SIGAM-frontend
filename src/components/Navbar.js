import { router } from '../router.js';
import { getUser, clearStorage } from '../storage.js';
import '../css/navbar.css';

const ROLE_LABELS = {
  gerente: 'Manager',
  analista: 'Analyst',
  tecnico: 'Technician',
  auditor: 'Auditor',
  usuario: 'User'
};

const normalizeRole = (role) => {
  return String(role || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '');
};

const render = () => {
  return `
    <nav class="navbar navbar-expand-lg navbar-light bg-white border-bottom">
      <div class="container">
        <a class="navbar-brand d-flex align-items-center gap-2" href="/dashboard" data-route="/dashboard">
          <div class="bg-primary text-white rounded d-flex justify-content-center align-items-center" style="width: 35px; height: 35px">
          </div>
          <div>
            <strong>J-AXON</strong><br />
            <small class="text-muted">Anticipate the failure</small>
          </div>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menu">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="menu">
          <ul class="navbar-nav ms-4">
            <li class="nav-item">
              <a class="nav-link d-flex align-items-center gap-2" href="/dashboard" data-route="/dashboard">
                <i class="bi bi-speedometer2"></i>
                Dashboard
              </a>
            </li>
            <li class="nav-item">
              <a class="nav-link d-flex align-items-center gap-2" href="/admin" data-route="/admin" data-role="admin">
                <i class="bi bi-gear"></i>
                Admin
              </a>
            </li>
          </ul>
          <div class="ms-auto d-flex align-items-center gap-3">
            <div id="navbar-user" class="text-end d-none">
              <div class="fw-semibold" id="navbar-user-name"></div>
              <div class="small text-muted" id="navbar-user-email"></div>
            </div>
            <span id="navbar-user-role" class="badge bg-primary d-none"></span>
            <button id="navbar-logout" type="button" class="btn btn-sm btn-outline-secondary d-none">Logout</button>
          </div>
        </div>
      </div>
    </nav>
  `;
};

const init = () => {
  const links = document.querySelectorAll('[data-route]');
  const path = window.location.pathname;

  links.forEach((link) => {
    const route = link.getAttribute('data-route');
    if (route && route === path) {
      link.classList.add('active', 'fw-bold', 'text-primary');
    }
    link.addEventListener('click', (event) => {
      event.preventDefault();
      if (route) {
        router.navigateTo(route);
      }
    });
  });

  const user = getUser();
  if (!user) {
    return;
  }

  const nameEl = document.querySelector('#navbar-user-name');
  const emailEl = document.querySelector('#navbar-user-email');
  const roleEl = document.querySelector('#navbar-user-role');
  const userBox = document.querySelector('#navbar-user');
  const logoutBtn = document.querySelector('#navbar-logout');
  const adminLink = document.querySelector('[data-role="admin"]');

  const name = user.nombre || user.name || user.fullName || user.full_name || '';
  const email = user.email || user.correo || '';
  const roleRaw = user.rol || user.role || user.Rol || user.ROLE || '';
  const roleKey = normalizeRole(roleRaw);

  if (userBox && (name || email)) {
    userBox.classList.remove('d-none');
    if (nameEl) nameEl.textContent = name || 'User';
    if (emailEl) emailEl.textContent = email;
  }

  if (roleEl && roleRaw) {
    roleEl.classList.remove('d-none');
    roleEl.textContent = ROLE_LABELS[roleKey] || roleRaw;
  }

  if (adminLink && !['gerente', 'administrador', 'admin'].includes(roleKey)) {
    adminLink.classList.add('d-none');
  }

  if (logoutBtn) {
    logoutBtn.classList.remove('d-none');
    logoutBtn.addEventListener('click', () => {
      clearStorage();
      router.navigateTo('/login', { replace: true });
    });
  }
};

export const Navbar = { render, init };
export default Navbar;
