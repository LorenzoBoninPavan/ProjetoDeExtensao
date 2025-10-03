// Não sei como essa tela vai funcionar com a inclusão das classes, mas aqui é a segunda parte do cadastro
import { salvarEspecificacaoInspecao } from './firebase.js';
import { getAuth, onAuthStateChanged } from "firebase/auth";

//Lógica de autenticação
const auth = getAuth(app);
onAuthStateChanged(auth, (user) => {
    if (!user) {
        // Se o usuário não estiver logado, redirecione para a página de login
        window.location.href = 'login.html';
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const inspecaoId = sessionStorage.getItem('inspecaoId');

    if (!inspecaoId) {
        alert("Erro: ID da inspeção não encontrado. Retornando ao início.");
        window.location.href = 'identificacao.html';
        return;
    }

    const form = document.getElementById('especificacaoForm');

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const dadosTela2 = {
            tipo: document.getElementById('tipo').value,
            fabricante: document.getElementById('fabricante').value,
            capacidade: document.getElementById('capacidade').value,
            bitola: document.getElementById('bitola').value,
        };

        try {
            await salvarEspecificacaoInspecao(inspecaoId, dadosTela2);
            
            window.location.href = 'checklist.html'; 
        } catch (error) {
            alert("Erro ao salvar as especificações. Por favor, tente novamente.");
            console.error(error);
        }
    });
});