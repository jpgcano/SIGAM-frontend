import { router } from '../router.js';
import { api } from '../api-client.js';

// Importamos los estilos específicos de la página.
// Vite se encargará de inyectarlos en el head.
import '../css/pages/login.css';

/**
 * Renderiza el HTML de la página de login.
 * @returns {string} El contenido HTML de la página.
 */
const render = () => {
    // Extraemos el contenido del body del antiguo login.html
    return `
        <div class="page-login">
            <div class="container">
                <h2>Login</h2>
                <form id="loginForm" novalidate>
                    <input type="email" id="email" placeholder="Email" required>
                    <input type="password" id="password" placeholder="Password" required>
                    <div id="loginStatus" class="form-status" aria-live="polite"></div>
                    <button id="loginBtn" type="submit">Enter</button>
                </form>
                <p>Don't you have an account?
                <a href="/register" id="navigateToRegister">Register</a>
                </p>
            </div>
        </div>
    `;
};

/**
 * Inicializa los event listeners y la lógica de la página de login.
 */
const init = () => {
    const loginForm = document.getElementById('loginForm');
    const loginStatus = document.getElementById('loginStatus');
    const registerLink = document.getElementById('navigateToRegister');
    const submitBtn = document.getElementById('loginBtn');

    if (!loginForm || !loginStatus) {
        return;
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        if (!email || !password) {
            loginStatus.textContent = 'Enter email and password.';
            return;
        }

        loginStatus.textContent = 'Processing...';
        if (submitBtn) {
            submitBtn.disabled = true;
        }

        try {
            const { user } = await api.auth.login(email, password);
            loginStatus.textContent = 'Login successful. Redirecting...';
            const target = router.getDefaultRoute(user);
            router.navigateTo(target || '/dashboard');
        } catch (error) {
            loginStatus.textContent = error.message || 'Invalid credentials. Please try again.';
        } finally {
            if (submitBtn) {
                submitBtn.disabled = false;
            }
        }
    });

    // Manejamos la navegación al registro a través del router
    if (registerLink) {
        registerLink.addEventListener('click', (e) => {
            e.preventDefault();
            router.navigateTo(e.target.getAttribute('href'));
        });
    }
};

export const LoginPage = { render, init, meta: { bodyClass: 'page-login' } };
