// js/indentificacao.js
import { iniciarNovoCadastroInspecao } from './firebase.js';

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('inspectionForm');

    form.addEventListener('submit', async function (event) {
        event.preventDefault(); // Impede o envio do formulário padrão

        const tagInput = document.getElementById('tag');
        const serieInput = document.getElementById('name');
        const dataInput = document.getElementById('date');
        const validadeInput = document.getElementById('validacao');
        
        // Remove a classe de erro para validação
        tagInput.classList.remove('error');
        serieInput.classList.remove('error');
        dataInput.classList.remove('error');
        validadeInput.classList.remove('error');

        let isValid = true;
        
        // Validação dos campos obrigatórios
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

        if (!isValid) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        // Prepara os dados do formulário para enviar ao Firebase
        const dadosForm = {
            tag: form.tag.value,
            serie: form.name.value,
            data: form.date.value,
            validade: form.validacao.value,
            observacao: form.observacao.value,
            fotos: [
                document.getElementById('photo'),
                document.getElementById('photo2'),
                document.getElementById('photo3')
            ]
        };

        try {
            // Inicia o cadastro no Firebase e obtém o ID
            const inspecaoId = await iniciarNovoCadastroInspecao(dadosForm);
            
            // Armazena o ID no navegador para a próxima tela
            sessionStorage.setItem('inspecaoId', inspecaoId); 
            
            // Redireciona para a próxima página
            window.location.href = form.action;
        } catch (error) {
            alert("Erro ao iniciar a inspeção. Por favor, tente novamente.");
            console.error(error);
        }
    });
});