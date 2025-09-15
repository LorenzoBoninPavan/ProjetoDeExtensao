// js/especificacao.js
import { salvarEspecificacaoInspecao } from './firebase.js';

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('especificacaoForm');

    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        // ... (resto do seu código de validação, que está correto) ...

        const inspecaoId = sessionStorage.getItem('inspecaoId');
        if (!inspecaoId) {
            alert("Erro: ID da inspeção não encontrado. Por favor, volte e reinicie o processo.");
            return;
        }

        const dadosForm = {
            tipo: form.tipo.value,
            fabricante: form.fabricante.value,
            capacidade: form.capacidade.value,
            bitola: form.bitola.value
        };

        try {
            // Chama a nova função criada no firebase.js
            await salvarEspecificacaoInspecao(inspecaoId, dadosForm);
            window.location.href = 'checklist.html'; // Redireciona para a proxima página
        } catch (error) {
            alert("Erro ao salvar as especificações. Por favor, tente novamente.");
            console.error(error);
        }
    });
});