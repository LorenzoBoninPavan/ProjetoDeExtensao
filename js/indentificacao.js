// Aguarda o carregamento completo do DOM
document.addEventListener('DOMContentLoaded', function() {
    // Seleciona o formulário pelo ID
    const form = document.getElementById('inspectionForm');

    // Adiciona um "ouvinte de evento" para a submissão do formulário
    form.addEventListener('submit', function(event) {
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

        // Valida o campo TAG APLICÁVEL
        if (tagInput.value.trim() === '') {
            tagInput.classList.add('error');
            isValid = false;
        }

        // Valida o campo SÉRIE
        if (serieInput.value.trim() === '') {
            serieInput.classList.add('error');
            isValid = false;
        }

        // Valida o campo DATA
        if (dataInput.value.trim() === '') {
            dataInput.classList.add('error');
            isValid = false;
        }

        // Valida o campo VALIDADE DE INSPEÇÃO
        if (validadeInput.value.trim() === '') {
            validadeInput.classList.add('error');
            isValid = false;
        }

        // Se o formulário não for válido, impede o envio
        if (!isValid) {
            event.preventDefault(); // Impede o redirecionamento
            alert('Por favor, preencha todos os campos obrigatórios.');
        }
    });
});