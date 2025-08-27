document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('especificacaoForm');

    // Adiciona o event listener para o formulário
    form.addEventListener('submit', function(event) {
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

        // Se o formulário não for válido, impede o envio e mostra um alerta
        if (!isValid) {
            event.preventDefault();
            alert('Por favor, preencha todos os campos obrigatórios.');
        }
    });
});
