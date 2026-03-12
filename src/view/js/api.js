(function () {
    const config = window.SIGAM_CONFIG || {};
    const baseUrl = (config.API_BASE_URL || '').replace(/\/+$/, '');
    const ticketsEndpoint = config.TICKETS_ENDPOINT || '/tickets';
    const dashboardEndpoint = config.DASHBOARD_ENDPOINT || '/api/dashboard';

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

    async function apiRequest(path, options = {}) {
        if (!baseUrl) {
            throw new Error('API base URL is not configured.');
        }
        const url = `${baseUrl}${path.startsWith('/') ? path : `/${path}`}`;
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

        const response = await fetch(url, { method, headers, body });
        const contentType = response.headers.get('content-type') || '';
        const isJson = contentType.includes('application/json');
        const payload = isJson ? await response.json() : await response.text();

        if (!response.ok) {
            const message = isJson && payload && payload.message
                ? payload.message
                : `Request failed (${response.status})`;
            const error = new Error(message);
            error.status = response.status;
            error.payload = payload;
            throw error;
        }

        return payload;
    }

    function normalizeCollection(payload) {
        if (Array.isArray(payload)) {
            return payload;
        }
        if (payload && Array.isArray(payload.data)) {
            return payload.data;
        }
        if (payload && Array.isArray(payload.tickets)) {
            return payload.tickets;
        }
        return [];
    }

    async function getTickets() {
        const payload = await apiRequest(ticketsEndpoint);
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

    window.SIGAM_API = {
        apiRequest,
        getTickets,
        createTicket,
        deleteTicket,
        getDashboard,
        getToken,
        setToken,
        clearToken,
        setUser,
        getUser,
        clearUser
    };
})();
