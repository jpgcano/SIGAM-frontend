// Centralized endpoints/config (runtime env aware).
import config from '../config.js';

const baseUrl = (config.API_BASE_URL || '').replace(/\/+$/, '');

const endpoints = {
  baseUrl,
  dashboard: config.DASHBOARD_ENDPOINT || '/api/dashboard',
  tickets: config.TICKETS_ENDPOINT || '/api/tickets',
  activos: config.ACTIVOS_ENDPOINT || '/api/activos',
  repuestos: config.REPUESTOS_ENDPOINT || '/api/repuestos',
  categorias: config.CATEGORIAS_ENDPOINT || '/api/categorias',
  categoriasTicket: config.CATEGORIAS_TICKET_ENDPOINT || '/api/tickets/categorias',
  proveedores: config.PROVEEDORES_ENDPOINT || '/api/proveedores',
  usuarios: config.USUARIOS_ENDPOINT || '/api/usuarios',
  mantenimientos: config.MANTENIMIENTOS_ENDPOINT || '/api/mantenimientos'
};

export default endpoints;
