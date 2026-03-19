import { api } from "./api-client.js";
import SIGAM_CONFIG from "./config.js";
import { normalizeCollection } from "../utils/normalize.js";

export const fetchActivos = async () => {
  const payload = await api.apiRequest(`${SIGAM_CONFIG.ACTIVOS_ENDPOINT}?limit=500&offset=0`);
  return normalizeCollection(payload);
};

export const fetchCategorias = async () => {
  const endpoint = SIGAM_CONFIG.CATEGORIAS_TICKET_ENDPOINT || "/api/tickets/categorias";
  const payload = await api.apiRequest(endpoint);
  return normalizeCollection(payload);
};

export const fetchTickets = async (query = {}) => {
  const search = new URLSearchParams(query).toString();
  const path = search ? `${SIGAM_CONFIG.TICKETS_ENDPOINT}?${search}` : SIGAM_CONFIG.TICKETS_ENDPOINT;
  const payload = await api.apiRequest(path);
  return normalizeCollection(payload);
};

export const createTicket = async (body) => {
  return api.apiRequest(SIGAM_CONFIG.TICKETS_ENDPOINT, { method: "POST", body });
};
