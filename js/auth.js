import { auth, registerUser, loginUser, logoutUser, onAuthStateChanged } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const errorMessageElement = document.getElementById('errorMessage');

    // Check if user is already logged in
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in, redirect to index.html if not already there
            if (!window.location.pathname.includes('index.html') && !window.location.pathname.includes('identificacao.html') && !window.location.pathname.includes('especificacao.html') && !window.location.pathname.includes('checklist.html') && !window.location.pathname.includes('sucesso.html')) {
                window.location.href = 'index.html';
            }
        } else {
            // User is signed out, redirect to login.html if not already there
            if (!window.location.pathname.includes('login.html') && !window.location.pathname.includes('register.html')) {
                window.location.href = 'login.html';
            }
        }
    });

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = loginForm.email.value;
            const password = loginForm.password.value;
            try {
                await loginUser(email, password);
                window.location.href = 'index.html'; // Redirect to main page after login
            } catch (error) {
                errorMessageElement.textContent = 'Erro ao fazer login: ' + error.message;
                console.error('Login error:', error);
            }
        });
    }

    if (registerForm) {
        registerForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = registerForm.email.value;
            const password = registerForm.password.value;
            const confirmPassword = registerForm.confirmPassword.value;

            if (password !== confirmPassword) {
                errorMessageElement.textContent = 'As senhas não coincidem.';
                return;
            }

            try {
                await registerUser(email, password);
                alert('Registro realizado com sucesso! Você pode fazer login agora.');
                window.location.href = 'login.html'; // Redirect to login page after registration
            } catch (error) {
                errorMessageElement.textContent = 'Erro ao registrar: ' + error.message;
                console.error('Registration error:', error);
            }
        });
    }

    // Logout functionality (if a logout button exists on the page)
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', async () => {
            try {
                await logoutUser();
                window.location.href = 'login.html';
            } catch (error) {
                console.error('Logout error:', error);
            }
        });
    }
});

