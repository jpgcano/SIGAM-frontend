(function () {
    const config = window.SIGAM_CONFIG || {};
    const baseUrl = (config.API_BASE_URL || '').replace(/\/+$/, '') || 'http://localhost:4000/';

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

    window.SIGAM_API = {
        apiRequest,
        getToken,
        setToken,
        clearToken,
        setUser,
        getUser,
        clearUser
    };
})();
