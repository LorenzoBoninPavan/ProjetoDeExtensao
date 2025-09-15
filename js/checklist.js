// js/checklist.js
import { finalizarInspecao } from './firebase.js';

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('checklistForm');
    const clearButton = document.querySelector('.button-clear');

    form.addEventListener('submit', async function(event) {
        event.preventDefault();

        // ... (resto do seu código de validação, que está correto) ...

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

        // Corrija a coleta dos arquivos de foto.
        const dadosForm = {
            itens: itens,
            comentarios: form.querySelector('textarea').value,
            aprovacao: form.querySelector('input[name="approval"]:checked')?.value,
            // Colete os arquivos de cada input
            fotos: [
                form.photo1.files[0],
                form.photo2.files[0],
                form.photo3.files[0]
            ].filter(file => file) // Filtra para remover valores nulos se não houver arquivo
        };

        try {
            // Chama a função finalizadora
            await finalizarInspecao(inspecaoId, dadosForm);
            sessionStorage.removeItem('inspecaoId'); // Limpa a sessão
            window.location.href = 'sucesso.html'; // Redireciona para a página de sucesso
        } catch (error) {
            alert("Erro ao finalizar a inspeção. Por favor, tente novamente.");
            console.error(error);
        }
    });

    // ... (sua função de limpar, que está correta) ...
});