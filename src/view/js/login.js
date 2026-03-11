async function login() {
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    if (!email || !password) {
        alert('Ingresa email y password.');
        return;
    }

    if (!window.SIGAM_API) {
        alert('Config de API no cargada.');
        return;
    }

    try {
        const data = await window.SIGAM_API.apiRequest('/api/auth/login', {
            method: 'POST',
            body: { email, password }
        });

        window.SIGAM_API.setToken(data.token);
        window.SIGAM_API.setUser(data.user);

        window.location.href = 'dashboard.html';
    } catch (error) {
        alert(error.message || 'Error de autenticacion.');
    }
}
