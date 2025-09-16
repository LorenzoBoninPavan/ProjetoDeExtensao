// js/auth.js
import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { app } from "./firebase.js";

const auth = getAuth(app);

document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('loginForm');
    const signupLink = document.getElementById('signupLink');

    loginForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const email = loginForm.email.value;
        const password = loginForm.password.value;

        try {
            await signInWithEmailAndPassword(auth, email, password);
            alert("Login realizado com sucesso!");
            window.location.href = 'index.html'; // Redireciona para a página principal após o login
        } catch (error) {
            alert("Erro de login: " + error.message);
            console.error(error);
        }
    });

    // Lógica para cadastrar um novo usuário ao clicar no link
    signupLink.addEventListener('click', async (event) => {
        event.preventDefault();
        const email = prompt("Digite seu e-mail para cadastro:");
        const password = prompt("Digite sua senha para cadastro:");
        
        if (email && password) {
            try {
                await createUserWithEmailAndPassword(auth, email, password);
                alert("Cadastro realizado com sucesso! Você já pode fazer login.");
            } catch (error) {
                alert("Erro de cadastro: " + error.message);
                console.error(error);
            }
        }
    });
});