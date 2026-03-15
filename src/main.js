import './services/env.js';
import './css/global.css';
import { router } from './router.js';
import { LoginPage } from './pages/Login.page.js';
import { RegisterPage } from './pages/Register.page.js';
import { DashboardPage } from './pages/Dashboard.page.js';
import { AdminPage } from './pages/Admin.page.js';
import { InventoryPage } from './pages/Inventory.page.js';
import { TicketsPage } from './pages/Tickets.page.js';
import { CalendarPage } from './pages/Calendar.page.js';
import { ReportsPage } from './pages/Reports.page.js';
import { ProfilePage } from './pages/Profile.page.js';
import { TicketDetailPage } from './pages/TicketDetail.page.js';

// Importar aquí estilos globales adicionales si fuera necesario
// import '../css/main.css';

document.addEventListener('DOMContentLoaded', () => {
    const normalizeRole = (role) => {
        return String(role || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase()
            .replace(/\s+/g, '');
    };

    const ROLE_HOME_MAP = {
        gerente: '/admin',
        administrador: '/admin',
        admin: '/admin',
        analista: '/dashboard',
        tecnico: '/dashboard',
        auditor: '/dashboard',
        usuario: '/dashboard'
    };

    router.setDefaultRouteResolver((user) => {
        const role = user && (user.role || user.rol || user.ROLE || user.Rol);
        const normalizedRole = normalizeRole(role);
        return ROLE_HOME_MAP[normalizedRole] || '/dashboard';
    });

    // --- Definición de Rutas ---

    // Ruta raíz: el router se encargará de redirigir según autenticación/rol.
    router.addRoute('/', {
        render: () => `
            <div class="container mt-5 text-center">
                <h1>SPA Iniciada</h1>
                <p class="lead">La refactorización ha comenzado correctamente.</p>
                <p>Navega a <a href="/login">/login</a> para empezar.</p>
            </div>
        `
    });

    // Página de Login
    router.addRoute('/login', LoginPage);

    // Placeholder para la página de Registro
    router.addRoute('/register', RegisterPage);

    // Dashboard Real
    router.addRoute('/dashboard', DashboardPage);

    // Inventario (restringido por rol)
    router.addRoute('/inventory', InventoryPage);

    // Tickets (restringido por rol)
    router.addRoute('/tickets', TicketsPage);

    // Calendario (restringido por rol)
    router.addRoute('/calendar', CalendarPage);

    // Reportes (restringido por rol)
    router.addRoute('/reports', ReportsPage);

    // Perfil (restringido por rol)
    router.addRoute('/profile', ProfilePage);

    // Ticket detail
    router.addRoute('/ticket-detail', TicketDetailPage);

    // Panel de administración (restringido por rol)
    router.addRoute('/admin', AdminPage);

    // Ruta para 404
    router.addRoute('/404', {
        render: () => `
            <div class="container mt-5 text-center">
                <h1>404 - Página no encontrada</h1>
                <p>La ruta que buscas no existe o ha sido movida.</p>
                <a href="/">Volver al inicio</a>
            </div>
        `
    });

    // Iniciar Router
    router.init();
});
