import { router } from '../router.js';
import { api } from '../api.js';
import '../css/pages/register.css';

/**
 * Renderiza el HTML de la página de registro.
 */
const render = () => {
    return `
        <div class="page-register">
            <div class="container">
                <h2>Create Account</h2>

                <form id="registerForm" novalidate>
                    <input type="text" id="name" placeholder="Name" required>
                    <input type="text" id="surname" placeholder="Surname" required>
                    <input type="email" id="email" placeholder="Email" required>
                    <input type="password" id="password" placeholder="Password" required>
                    <input type="password" id="confirmPassword" placeholder="Confirm Password" required>
                    <select id="role">
                        <option value="Usuario">User</option>
                        <option value="Analista">Analyst</option>
                        <option value="Tecnico">Technician</option>
                        <option value="Gerente">Manager</option>
                        <option value="Auditor">Auditor</option>
                    </select>
                    <div id="registerStatus" class="form-status" aria-live="polite"></div>
                    <button id="registerBtn" type="submit">Create Account</button>
                </form>

                <p>Do you already have an account?
                <a href="/login" id="navigateToLogin">Login</a>
                </p>
            </div>
        </div>
    `;
};

/**
 * Lógica e inicialización de eventos.
 */
const init = () => {
    const form = document.getElementById('registerForm');
    const statusDiv = document.getElementById('registerStatus');
    const loginLink = document.getElementById('navigateToLogin');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value;
        const surname = document.getElementById('surname').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const role = document.getElementById('role').value;

        if (password !== confirmPassword) {
            statusDiv.textContent = 'Passwords do not match';
            statusDiv.style.color = 'red';
            return;
        }

        statusDiv.textContent = 'Creating account...';
        statusDiv.style.color = 'inherit';

        try {
            await api.auth.register({ name, surname, email, password, role });
            alert('Account created successfully! Please login.');
            router.navigateTo('/login');
        } catch (error) {
            statusDiv.textContent = error.message || 'Registration failed.';
            statusDiv.style.color = 'red';
        }
    });

    loginLink.addEventListener('click', (e) => {
        e.preventDefault();
        router.navigateTo('/login');
    });
};

export const RegisterPage = { render, init };