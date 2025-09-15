// js/especificacao.js
import { salvarEspecificacaoInspecao } from './firebase.js';

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

        // Aqui é onde você faz a adaptação
        const dadosTela2 = {
            // Use os IDs do seu HTML para coletar os valores corretos
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