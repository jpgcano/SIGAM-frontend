import { api } from '../api.js';
import '../css/pages/admin.css';
import Navbar from '../components/Navbar.js';

export const AdminPage = {
  render: async () => {
    const navbarHTML = await Navbar.render();
    
    return `
      ${navbarHTML}
      
      <div class="p-4 bg-light min-vh-100 admin-container">

        <!-- Encabezado de la página -->
        <div class="mb-4">
          <h4 class="fw-bold mb-1">Administration Panel</h4>
          <small class="text-muted">System management</small>
        </div>

        <!-- Tarjetas de Estadísticas -->
        <div class="row g-4 mb-4 admin-stats">
          <!-- Total de usuarios -->
          <div class="col-md-3">
            <div class="card border-0 shadow-sm p-4 rounded-4">
              <div class="d-flex justify-content-between">
                <div>
                  <small class="text-muted">Total Users</small>
                  <h4 id="statUsers" class="fw-bold mt-2">0</h4>
                </div>
                <i class="bi bi-people text-primary fs-4"></i>
              </div>
            </div>
          </div>

          <!-- Activos gestionados -->
          <div class="col-md-3">
            <div class="card border-0 shadow-sm p-4 rounded-4">
              <div class="d-flex justify-content-between">
                <div>
                  <small class="text-muted">Managed Assets</small>
                  <h4 id="statAssets" class="fw-bold mt-2">0</h4>
                </div>
                <i class="bi bi-hdd-stack text-primary fs-4"></i>
              </div>
            </div>
          </div>

          <!-- Tickets pendientes -->
          <div class="col-md-3">
            <div class="card border-0 shadow-sm p-4 rounded-4">
              <div class="d-flex justify-content-between">
                <div>
                  <small class="text-muted">Pending Tickets</small>
                  <h4 id="statTickets" class="fw-bold mt-2">0</h4>
                </div>
                <i class="bi bi-ticket text-primary fs-4"></i>
              </div>
            </div>
          </div>

          <!-- Estado del sistema -->
          <div class="col-md-3">
            <div class="card border-0 shadow-sm p-4 rounded-4">
              <div class="d-flex justify-content-between">
                <div>
                  <small class="text-muted">System Status</small>
                  <h5 class="fw-bold text-success mt-2">Optimal</h5>
                  <small class="text-muted">99.8% uptime</small>
                </div>
                <i class="bi bi-bar-chart text-primary fs-4"></i>
              </div>
            </div>
          </div>
        </div>

        <!-- Menú de Configuración -->
        <ul class="nav nav-pills mb-4" id="admin-tabs">
          <li class="nav-item">
            <button class="nav-link active" data-section="users">Users</button>
          </li>
          <li class="nav-item">
            <button class="nav-link" data-section="configuration">Configuration</button>
          </li>
          <li class="nav-item">
            <button class="nav-link" data-section="security">Security</button>
          </li>
          <li class="nav-item">
            <button class="nav-link" data-section="backup">Backup</button>
          </li>
        </ul>

        <!-- Sección Gestión de Usuarios -->
        <div id="section-users" class="card border-0 shadow-sm rounded-4 p-4 admin-section">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h6 class="fw-semibold mb-0">User Management</h6>
            <button class="btn btn-dark rounded-pill px-3" data-bs-toggle="modal" data-bs-target="#userModal">
              + New User
            </button>
          </div>

          <!-- Filtros -->
          <div class="row mb-3">
            <div class="col-md-6">
              <div class="input-group">
                <span class="input-group-text"><i class="bi bi-search"></i></span>
                <input id="searchInput" type="text" class="form-control" placeholder="Search users...">
              </div>
            </div>
            <div class="col-md-3">
              <select id="roleFilter" class="form-select">
                <option value="">All Roles</option>
                <option value="Gerente">Manager</option>
                <option value="Analista">Analyst</option>
                <option value="Tecnico">Technician</option>
                <option value="Auditor">Auditor</option>
                <option value="Usuario">User</option>
              </select>
            </div>
          </div>

          <!-- Tabla -->
          <div class="table-responsive">
            <div id="adminStatus" class="small text-muted mb-2" aria-live="polite"></div>
            <table class="table align-middle">
              <thead class="text-muted">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Last Access</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody id="userTable"></tbody>
            </table>
          </div>
        </div>

        <!-- Placeholder para otras secciones (simplificado para la migración) -->
        <div id="section-configuration" class="card border-0 shadow-sm rounded-4 p-4 admin-section d-none">
           <h6>System Configuration (Placeholder)</h6>
        </div>
        <div id="section-security" class="card border-0 shadow-sm rounded-4 p-4 admin-section d-none">
           <h6>Security Settings (Placeholder)</h6>
        </div>
        <div id="section-backup" class="card border-0 shadow-sm rounded-4 p-4 admin-section d-none">
           <h6>Backup Management (Placeholder)</h6>
        </div>

      </div>

      <!-- Modal Usuarios -->
      <div class="modal fade" id="userModal">
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">User</h5>
            </div>
            <div class="modal-body">
              <input id="name" class="form-control mb-2" placeholder="Name">
              <input id="email" class="form-control mb-2" placeholder="Email">
              <select id="role" class="form-select">
                <option value="Usuario">User</option>
                <option value="Analista">Analyst</option>
                <option value="Tecnico">Technician</option>
                <option value="Gerente">Manager</option>
                <option value="Auditor">Auditor</option>
              </select>
              <input id="password" type="password" class="form-control mt-2" placeholder="Password">
              <input type="hidden" id="editIndex">
            </div>
            <div class="modal-footer">
              <button class="btn btn-secondary" data-bs-dismiss="modal">Cancel</button>
              <button class="btn btn-dark" id="saveUserBtn">Save</button>
            </div>
          </div>
        </div>
      </div>
    `;
  },

  init: () => {
    Navbar.init();
    console.log('Admin Page Initialized');
    
    // Lógica básica de pestañas (Tabs)
    const tabs = document.querySelectorAll('#admin-tabs .nav-link');
    const sections = document.querySelectorAll('.admin-section');

    tabs.forEach(tab => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        
        // UI Tabs
        tabs.forEach(t => t.classList.remove('active'));
        e.target.classList.add('active');

        // UI Secciones
        const targetId = `section-${e.target.dataset.section}`;
        sections.forEach(section => {
          if (section.id === targetId) {
            section.classList.remove('d-none');
          } else {
            section.classList.add('d-none');
          }
        });
      });
    });

    // Aquí deberíamos importar o mover la lógica de ../js/admin.js 
    // y adaptarla para que no dependa de variables globales.
    // Por ahora solo conectamos el botón del modal como ejemplo.
    const saveBtn = document.getElementById('saveUserBtn');
    if(saveBtn) {
        saveBtn.addEventListener('click', () => {
            alert('Save logic implementation pending in SPA migration');
        });
    }
  }
};
