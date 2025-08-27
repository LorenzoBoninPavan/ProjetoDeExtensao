document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('checklistForm');
    const clearButton = document.querySelector('.button-clear');

    // Validação do formulário (botão Salvar)
    form.addEventListener('submit', function(event) {
        const radioGroups = ['item1', 'item2', 'item3', 'item4', 'item5', 'item6', 'item7', 'item8', 'approval'];
        let allGroupsAreChecked = true;
        
        // Remove a classe de erro de todas as linhas antes de validar novamente
        document.querySelectorAll('tr').forEach(tr => tr.classList.remove('error'));

        radioGroups.forEach(groupName => {
            const groupInputs = document.querySelectorAll(`input[name="${groupName}"]`);
            const isChecked = Array.from(groupInputs).some(radio => radio.checked);

            if (!isChecked) {
                allGroupsAreChecked = false;
                // Encontra a linha da tabela (tr) pai do grupo e adiciona a classe de erro
                const firstInput = groupInputs[0];
                let row = firstInput.closest('tr');
                if (row) {
                    row.classList.add('error');
                }
            }
        });

        if (!allGroupsAreChecked) {
            event.preventDefault(); // Impede o envio do formulário
            alert('Por favor, selecione uma opção para todos os itens do checklist e para o status de aprovação/reprovação.');
        }
    });

    // Função para limpar o checklist (botão Limpar)
    clearButton.addEventListener('click', function() {
        // Desmarca todos os botões de rádio
        const radioInputs = document.querySelectorAll('input[type="radio"]');
        radioInputs.forEach(radio => {
            radio.checked = false;
        });

        // Limpa a área de texto
        const textarea = document.querySelector('textarea');
        if (textarea) {
            textarea.value = '';
        }
        
        // Limpa os inputs de arquivo
        const fileInputs = document.querySelectorAll('input[type="file"]');
        fileInputs.forEach(input => {
            input.value = '';
        });

        // Remove a classe de erro de todas as linhas
        document.querySelectorAll('tr').forEach(tr => tr.classList.remove('error'));
    });
});