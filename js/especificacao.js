// js/especificacao.js

import { salvarEspecificacaoInspecao } from './firebase.js';

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('especificacaoForm');

    // Adiciona o único event listener para o formulário
    form.addEventListener('submit', async function(event) {
        event.preventDefault(); // Impede o envio do formulário por padrão

        // Seleciona todos os <select> do formulário
        const selects = form.querySelectorAll('select');
        let isValid = true;
        
        // Remove a classe de erro de todos os campos antes de validar novamente
        form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));

        // Valida se cada <select> foi preenchido com uma opção válida
        selects.forEach(select => {
            if (select.value === '') {
                isValid = false;
                select.classList.add('error');
            }
        });

        // Se o formulário não for válido, mostra um alerta e para a execução
        if (!isValid) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return; // Interrompe a função aqui
        }

        // Se a validação passar, continua com a lógica do Firebase
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
            await salvarEspecificacaoInspecao(inspecaoId, dadosForm);
            window.location.href = form.action; // Redireciona para 'checklist.html'
        } catch (error) {
            alert("Erro ao salvar as especificações. Por favor, tente novamente.");
            console.error(error); // Ajuda a depurar o erro no console
        }
    });
});