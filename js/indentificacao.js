// js/indentificacao.js

// Importa a função do Firebase
import { iniciarNovoCadastroInspecao } from './firebase.js';

// Aguarda o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', function () {
    // Seleciona o formulário pelo ID
    const form = document.getElementById('inspectionForm');

    // Adiciona um único ouvinte de evento para a submissão do formulário
    form.addEventListener('submit', async function (event) {
        event.preventDefault(); // Impede o envio do formulário por padrão

        // Seleciona os campos obrigatórios
        const tagInput = document.getElementById('tag');
        const serieInput = document.getElementById('name');
        const dataInput = document.getElementById('date');
        const validadeInput = document.getElementById('validacao');

        // Remove a classe de erro de todos os campos antes de validar novamente
        tagInput.classList.remove('error');
        serieInput.classList.remove('error');
        dataInput.classList.remove('error');
        validadeInput.classList.remove('error');

        let isValid = true;

        // Validação dos campos
        if (tagInput.value.trim() === '') {
            tagInput.classList.add('error');
            isValid = false;
        }
        if (serieInput.value.trim() === '') {
            serieInput.classList.add('error');
            isValid = false;
        }
        if (dataInput.value.trim() === '') {
            dataInput.classList.add('error');
            isValid = false;
        }
        if (validadeInput.value.trim() === '') {
            validadeInput.classList.add('error');
            isValid = false;
        }

        // Se o formulário não for válido, exibe um alerta e para a execução
        if (!isValid) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return; // Interrompe a função aqui
        }

        // Se a validação passar, continua com a lógica do Firebase
        const form = event.target;
        const dadosForm = {
            tag: form.tag.value,
            serie: form.name.value,
            data: form.date.value,
            validade: form.validacao.value,
            observacao: form.observacao.value,
            fotos: [form.photo, form.photo2, form.photo3]
        };

        try {
            const inspecaoId = await iniciarNovoCadastroInspecao(dadosForm);
            sessionStorage.setItem('inspecaoId', inspecaoId); // Armazena o ID
            window.location.href = form.action; // Redireciona para a próxima página
        } catch (error) {
            alert("Erro ao iniciar a inspeção. Por favor, tente novamente.");
            console.error(error); // Ajuda a depurar o erro no console
        }
    });
});