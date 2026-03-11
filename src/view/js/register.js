async function register() {
    const name = document.getElementById('name').value.trim();
    const surname = document.getElementById('surname').value.trim();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    const role = document.getElementById('role').value;

    if (!name || !surname || !email || !password) {
        alert('Completa todos los campos requeridos.');
        return;
    }

    if (password !== confirmPassword) {
        alert('Las contrasenas no coinciden.');
        return;
    }

    if (!window.SIGAM_API) {
        alert('Config de API no cargada.');
        return;
    }

    try {
        await window.SIGAM_API.apiRequest('/api/auth/register', {
            method: 'POST',
            body: {
                nombre: `${name} ${surname}`.trim(),
                email,
                password,
                rol: role
            }
        });

        alert('Registro exitoso. Ahora inicia sesion.');
        window.location.href = 'login.html';
    } catch (error) {
        alert(error.message || 'Error de registro.');
    }
}
