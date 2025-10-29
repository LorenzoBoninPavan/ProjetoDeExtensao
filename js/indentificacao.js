// identificacao.js
import { getAuth, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.13.0/firebase-auth.js";
import { app, iniciarNovoCadastroInspecao } from "./firebase.js";

// Lógica de autenticação
const auth = getAuth(app);
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'login.html';
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('inspectionForm');

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const tagInput = document.getElementById('tag');
        const serieInput = document.getElementById('name');
        const dataInput = document.getElementById('date');
        const validadeInput = document.getElementById('validacao');

        tagInput.classList.remove('error');
        serieInput.classList.remove('error');
        dataInput.classList.remove('error');
        validadeInput.classList.remove('error');

        let isValid = true;
        if (tagInput.value.trim() === '') { tagInput.classList.add('error'); isValid = false; }
        if (serieInput.value.trim() === '') { serieInput.classList.add('error'); isValid = false; }
        if (dataInput.value.trim() === '') { dataInput.classList.add('error'); isValid = false; }
        if (validadeInput.value.trim() === '') { validadeInput.classList.add('error'); isValid = false; }

        if (!isValid) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        // Captura as imagens e converte para Base64
        const fotosInputs = [
            document.getElementById('photo'),
            document.getElementById('photo2'),
            document.getElementById('photo3')
        ];

        const fotosBase64 = await Promise.all(
            fotosInputs.map(input => {
                const file = input.files[0];
                return new Promise(resolve => {
                    if (!file) return resolve(null);
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = () => resolve(null);
                    reader.readAsDataURL(file);
                });
            })
        );

        const dadosForm = {
            tag: tagInput.value,
            serie: serieInput.value,
            data: dataInput.value,
            validade: validadeInput.value,
            observacao: form.observacao.value,
            fotos: fotosBase64.filter(f => f !== null)
        };

        try {
            const inspecaoId = await iniciarNovoCadastroInspecao(dadosForm);
            sessionStorage.setItem('inspecaoId', inspecaoId);
            window.location.href = form.action;
        } catch (error) {
            alert("Erro ao iniciar a inspeção. Por favor, tente novamente.");
            console.error(error);
        }
    });
});
