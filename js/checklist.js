// js/checklist.js

import { finalizarChecklistInspecao } from './firebase.js';

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('checklistForm');
    const clearButton = document.querySelector('.button-clear');

    // Validação e envio do formulário (botão Salvar)
    form.addEventListener('submit', async function(event) {
        event.preventDefault(); // Impede o envio do formulário por padrão

        const radioGroups = ['item1', 'item2', 'item3', 'item4', 'item5', 'item6', 'item7', 'item8', 'approval'];
        let allGroupsAreChecked = true;
        
        // Remove a classe de erro de todas as linhas antes de validar novamente
        document.querySelectorAll('tr').forEach(tr => tr.classList.remove('error'));

        radioGroups.forEach(groupName => {
            const groupInputs = document.querySelectorAll(`input[name="${groupName}"]`);
            const isChecked = Array.from(groupInputs).some(radio => radio.checked);

            if (!isChecked) {
                allGroupsAreChecked = false;
                const firstInput = groupInputs[0];
                let row = firstInput.closest('tr');
                if (row) {
                    row.classList.add('error');
                }
            }
        });

        if (!allGroupsAreChecked) {
            alert('Por favor, selecione uma opção para todos os itens do checklist e para o status de aprovação/reprovação.');
            return; // Interrompe a função aqui
        }

        // Se a validação passar, continua com a lógica do Firebase
        const inspecaoId = sessionStorage.getItem('inspecaoId');
        if (!inspecaoId) {
            alert("Erro: ID da inspeção não encontrado. Por favor, volte e reinicie o processo.");
            return;
        }
        
        const itens = {};
        for (let i = 1; i <= 8; i++) {
            const item = form.querySelector(`input[name="item${i}"]:checked`);
            itens[`item${i}`] = item ? item.value : 'na';
        }

        const dadosForm = {
            itens: itens,
            comentarios: form.querySelector('textarea').value,
            fotos: [form.photo1, form.photo2, form.photo3],
            aprovacao: form.querySelector('input[name="approval"]:checked')?.value
        };

        try {
            await finalizarChecklistInspecao(inspecaoId, dadosForm);
            sessionStorage.removeItem('inspecaoId'); // Limpa a sessão após a finalização
            window.location.href = form.action; // Redireciona para 'sucesso.html'
        } catch (error) {
            alert("Erro ao finalizar a inspeção. Por favor, tente novamente.");
            console.error(error); // Ajuda a depurar o erro no console
        }
    });

    // Função para limpar o checklist (botão Limpar)
    clearButton.addEventListener('click', function() {
        const radioInputs = document.querySelectorAll('input[type="radio"]');
        radioInputs.forEach(radio => {
            radio.checked = false;
        });

        const textarea = document.querySelector('textarea');
        if (textarea) {
            textarea.value = '';
        }
        
        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => {
            input.value = '';
        });

        document.querySelectorAll('tr').forEach(tr => tr.classList.remove('error'));
    });
});