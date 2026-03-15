// Centralized API client for SIGAM frontend.
// Handles base URL, auth token, and uniform error parsing.
(function () {
    const config = window.SIGAM_CONFIG || {};
    const baseUrl = (config.API_BASE_URL || '').replace(/\/+$/, '');
    const ticketsEndpoint = config.TICKETS_ENDPOINT || '/api/tickets';
    const activosEndpoint = config.ACTIVOS_ENDPOINT || '/api/activos';
    const repuestosEndpoint = config.REPUESTOS_ENDPOINT || '/api/repuestos';
    const dashboardEndpoint = config.DASHBOARD_ENDPOINT || '/api/dashboard';
    const categoriasEndpoint = config.CATEGORIAS_ENDPOINT || '/api/categorias';
    const categoriasTicketEndpoint = config.CATEGORIAS_TICKET_ENDPOINT || '/api/tickets/categorias';
    const proveedoresEndpoint = config.PROVEEDORES_ENDPOINT || '/api/proveedores';
    const usuariosEndpoint = config.USUARIOS_ENDPOINT || '/api/usuarios';
    const mantenimientosEndpoint = config.MANTENIMIENTOS_ENDPOINT || '/api/mantenimientos';

    function getToken() {
        return localStorage.getItem('sigam_token');
    }

    function setToken(token) {
        if (token) {
            localStorage.setItem('sigam_token', token);
        }
    }

    function clearToken() {
        localStorage.removeItem('sigam_token');
    }

    function setUser(user) {
        if (user) {
            localStorage.setItem('sigam_user', JSON.stringify(user));
        }
    }

    function getUser() {
        const raw = localStorage.getItem('sigam_user');
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    }

    function clearUser() {
        localStorage.removeItem('sigam_user');
    }

    function buildQueryString(params = {}) {
        const search = new URLSearchParams();
        Object.entries(params).forEach(([key, value]) => {
            if (value === undefined || value === null || value === "") {
                return;
            }
            search.append(key, String(value));
        });
        const query = search.toString();
        return query ? `?${query}` : "";
    }

    function sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    async function apiRequest(path, options = {}) {
        if (!baseUrl) {
            throw new Error('API base URL is not configured.');
        }
        const query = options.query ? buildQueryString(options.query) : "";
        const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}${query}`;
        const method = (options.method || 'GET').toUpperCase();
        const headers = Object.assign({}, options.headers || {});
        const token = getToken();

        if (token) {
            headers.Authorization = `Bearer ${token}`;
        }

        let body;
        if (options.body !== undefined) {
            headers['Content-Type'] = 'application/json';
            body = JSON.stringify(options.body);
        }

        const isAuthEndpoint = /\/api\/auth\/(login|register)/i.test(path);
        const maxRetries = isAuthEndpoint ? 0 : (options.maxRetries ?? (method === 'GET' ? 2 : 0));
        const retryOn429 = isAuthEndpoint ? false : (options.retryOn429 ?? (method === 'GET'));
        let attempt = 0;

        while (true) {
            const response = await fetch(url, { method, headers, body });
            const contentType = response.headers.get('content-type') || '';
            const isJson = contentType.includes('application/json');
            const payload = isJson ? await response.json() : await response.text();

            if (response.ok) {
                return payload;
            }

            if (response.status === 401) {
                clearToken();
                clearUser();
            }

            if (response.status === 429 && retryOn429 && attempt < maxRetries) {
                const retryAfter = Number.parseInt(response.headers.get('retry-after') || "0", 10);
                const waitMs = Number.isFinite(retryAfter) && retryAfter > 0
                    ? retryAfter * 1000
                    : 500 * Math.pow(2, attempt);
                attempt += 1;
                await sleep(waitMs);
                continue;
            }

            const message = isJson && payload && payload.message
                ? payload.message
                : `Request failed (${response.status})`;
            const error = new Error(message);
            error.status = response.status;
            error.payload = payload;
            throw error;
        }
    }

    function normalizeCollection(payload) {
        if (Array.isArray(payload)) {
            return payload;
        }
        if (payload && Array.isArray(payload.data)) {
            return payload.data;
        }
        if (payload && payload.data && Array.isArray(payload.data.data)) {
            return payload.data.data;
        }
        if (payload && payload.data && Array.isArray(payload.data.categorias)) {
            return payload.data.categorias;
        }
        if (payload && payload.data && Array.isArray(payload.data.categories)) {
            return payload.data.categories;
        }
        if (payload && Array.isArray(payload.tickets)) {
            return payload.tickets;
        }
        if (payload && Array.isArray(payload.activos)) {
            return payload.activos;
        }
        if (payload && Array.isArray(payload.repuestos)) {
            return payload.repuestos;
        }
        if (payload && Array.isArray(payload.categorias)) {
            return payload.categorias;
        }
        if (payload && Array.isArray(payload.categories)) {
            return payload.categories;
        }
        return [];
    }

    async function getTickets(params = {}) {
        const qs = new URLSearchParams(params).toString();
        const payload = await apiRequest(qs ? `${ticketsEndpoint}?${qs}` : ticketsEndpoint);
        return normalizeCollection(payload);
    }

    async function createTicket(body) {
        return apiRequest(ticketsEndpoint, { method: 'POST', body });
    }

    async function deleteTicket(ticketId) {
        const safeId = encodeURIComponent(ticketId);
        return apiRequest(`${ticketsEndpoint}/${safeId}`, { method: 'DELETE' });
    }

    async function getDashboard() {
        return apiRequest(dashboardEndpoint);
    }

    async function getActivos(params = {}) {
        const qs = new URLSearchParams(params).toString();
        const payload = await apiRequest(qs ? `${activosEndpoint}?${qs}` : activosEndpoint);
        return normalizeCollection(payload);
    }

    async function createActivo(body) {
        return apiRequest(activosEndpoint, { method: 'POST', body });
    }

    async function updateActivo(activoId, body) {
        const safeId = encodeURIComponent(activoId);
        return apiRequest(`${activosEndpoint}/${safeId}`, { method: 'PUT', body });
    }

    async function getCategorias(params = {}) {
        const payload = await apiRequest(categoriasEndpoint, {
            query: withPagination(params)
        });
        return normalizeCollection(payload);
    }

    async function getCategoriasTicket() {
        const payload = await apiRequest(categoriasTicketEndpoint);
        return normalizeCollection(payload);
    }

    async function getProveedores() {
        const payload = await apiRequest(proveedoresEndpoint);
        return normalizeCollection(payload);
    }

    async function getUsuarios(params = {}) {
        const payload = await apiRequest(usuariosEndpoint, {
            query: withPagination(params)
        });
        return normalizeCollection(payload);
    }

    async function createUsuario(body) {
        return apiRequest(usuariosEndpoint, { method: 'POST', body });
    }

    async function updateUsuarioRol(id, rol) {
        const safeId = encodeURIComponent(id);
        return apiRequest(`${usuariosEndpoint}/${safeId}/rol`, {
            method: 'PATCH',
            body: { rol }
        });
    }

    async function updateUsuarioPassword(id, password) {
        const safeId = encodeURIComponent(id);
        return apiRequest(`${usuariosEndpoint}/${safeId}/password`, {
            method: 'PATCH',
            body: { password }
        });
    }

    async function getMantenimientos() {
        const payload = await apiRequest(mantenimientosEndpoint);
        return normalizeCollection(payload);
    }

    async function createMantenimiento(body) {
        return apiRequest(mantenimientosEndpoint, { method: 'POST', body });
    }

    async function updateMantenimiento(id, body) {
        const safeId = encodeURIComponent(id);
        return apiRequest(`${mantenimientosEndpoint}/${safeId}`, { method: 'PUT', body });
    }

    async function deleteMantenimiento(id) {
        const safeId = encodeURIComponent(id);
        return apiRequest(`${mantenimientosEndpoint}/${safeId}`, { method: 'DELETE' });
    }

    async function getRepuestos(params = {}) {
        const payload = await apiRequest(repuestosEndpoint, {
            query: withPagination(params)
        });
        return normalizeCollection(payload);
    }

    async function getRepuestosBajoStock(params = {}) {
        const payload = await apiRequest(`${repuestosEndpoint}/bajo-stock`, {
            query: withPagination(params)
        });
        return normalizeCollection(payload);
    }

    async function createRepuesto(body) {
        return apiRequest(repuestosEndpoint, { method: 'POST', body });
    }

    async function updateRepuesto(repuestoId, body) {
        const safeId = encodeURIComponent(repuestoId);
        return apiRequest(`${repuestosEndpoint}/${safeId}`, { method: 'PUT', body });
    }

    async function deleteRepuesto(repuestoId) {
        const safeId = encodeURIComponent(repuestoId);
        return apiRequest(`${repuestosEndpoint}/${safeId}`, { method: 'DELETE' });
    }

    window.SIGAM_API = {
        apiRequest,
        getTickets,
        createTicket,
        deleteTicket,
        getDashboard,
        getActivos,
        getCategorias,
        createActivo,
        updateActivo,
        getProveedores,
        getUsuarios,
        createUsuario,
        updateUsuarioRol,
        updateUsuarioPassword,
        getMantenimientos,
        createMantenimiento,
        updateMantenimiento,
        deleteMantenimiento,
        getRepuestos,
        getRepuestosBajoStock,
        createRepuesto,
        updateRepuesto,
        deleteRepuesto,
        getToken,
        setToken,
        clearToken,
        setUser,
        getUser,
        clearUser
    };
})();
