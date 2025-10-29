import { auth, onAuthStateChanged, salvarEspecificacaoInspecao, getInspecaoById } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {
    const especificacaoForm = document.getElementById('especificacaoForm');
    let currentInspectionId = null;

    onAuthStateChanged(auth, (user) => {
        if (user) {
            const urlParams = new URLSearchParams(window.location.search);
            const inspecaoId = urlParams.get('id');
            if (inspecaoId) {
                currentInspectionId = inspecaoId;
                loadEspecificacaoData(inspecaoId);
            } else {
                alert('ID da inspeção não encontrado. Redirecionando para a página inicial.');
                window.location.href = 'index.html';
            }
        } else {
            // Redirect to login if not authenticated
            window.location.href = 'login.html';
        }
    });

    async function loadEspecificacaoData(inspecaoId) {
        try {
            const inspection = await getInspecaoById(inspecaoId);
            if (inspection && inspection.especificacao) {
                document.getElementById('tipo').value = inspection.especificacao.tipo || '';
                document.getElementById('fabricante').value = inspection.especificacao.fabricante || '';
                document.getElementById('capacidade').value = inspection.especificacao.capacidade || '';
                document.getElementById('bitola').value = inspection.especificacao.bitola || '';
            } else {
                console.log('Nenhuma especificação encontrada para esta inspeção, ou inspeção não existe.');
            }
        } catch (error) {
            console.error('Erro ao carregar dados de especificação:', error);
            alert('Erro ao carregar dados de especificação.');
        }
    }

    if (especificacaoForm) {
        especificacaoForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!currentInspectionId) {
                alert('ID da inspeção não disponível.');
                return;
            }

            const dadosTela2 = {
                tipo: document.getElementById('tipo').value,
                fabricante: document.getElementById('fabricante').value,
                capacidade: document.getElementById('capacidade').value,
                bitola: document.getElementById('bitola').value,
            };

            try {
                await salvarEspecificacaoInspecao(currentInspectionId, dadosTela2);
                sessionStorage.setItem('inspecaoId', currentInspectionId); 
                alert('Especificações salvas com sucesso!');
                window.location.href = 'checklist.html';

            } catch (error) {
                console.error('Erro ao salvar especificações:', error);
                alert('Erro ao salvar especificações: ' + error.message);
            }
        });
    }
});

