// Simple route guard based on token presence and allowed roles.
// Pages define window.SIGAM_PAGE_ROLES to restrict access by role.
import { getToken, getUser } from '../js/core/storage.js';

const token = getToken();
const user = getUser();

if (!token) {
  window.location.href = 'login.html';
} else {
  const allowedRoles = Array.isArray(window.SIGAM_PAGE_ROLES)
    ? window.SIGAM_PAGE_ROLES
    : null;

  if (allowedRoles && allowedRoles.length > 0) {
    const role = (user && (user.role || user.rol || user.ROLE || user.Rol)) || '';
    const normalizedRole = String(role).toLowerCase();
    const isAllowed = allowedRoles.some(
      (item) => String(item).toLowerCase() === normalizedRole
    );
    if (!isAllowed) {
      // Redirect to a more appropriate page if available, or login
      window.location.href = 'dashboard.html';
    }
  }
}
