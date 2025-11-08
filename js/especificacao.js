// especificacao.js
import { auth, onAuthStateChanged, salvarEspecificacaoInspecao, getInspecaoById } from './firebase.js';

// Função para controlar a exibição dos blocos de campos
function displayFields(classeSelecionada) {
    // Mapeamento do valor do dropdown para o ID do bloco no HTML
    const idMap = {
        'cinta': 'classe-cinta-fields',
        'manilha': 'classe-manilha-fields',
        'cabo': 'classe-cabo-fields',
    };

    // Esconde todos os blocos de campos específicos primeiro
    const especificos = document.querySelectorAll('.classe-fields');
    especificos.forEach(div => div.style.display = 'none');

    if (classeSelecionada && idMap[classeSelecionada]) {
        const blocoASerMostrado = document.getElementById(idMap[classeSelecionada]);
        
        if (blocoASerMostrado) {
            blocoASerMostrado.style.display = 'block';
        }
    }
}

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
            // Redireciona para o login se não estiver autenticado
            window.location.href = 'login.html';
        }
    });

    // Função para carregar dados do Firebase (ATUALIZADA)
    async function loadEspecificacaoData(inspecaoId) {
        try {
            const inspection = await getInspecaoById(inspecaoId);
            
            if (inspection && inspection.especificacao && inspection.especificacao.classe) {
                const esp = inspection.especificacao;
                const classeSalva = esp.classe;

                // 1. Define a classe no dropdown
                document.getElementById('tipo').value = classeSalva;
                
                // 2. Exibe o formulário correto
                displayFields(classeSalva);
                
                // 3. Carrega os dados salvos nos campos específicos
                if (classeSalva === 'cinta') {
                    // CINTA: 4 Campos
                    document.getElementById('tipoCinta').value = esp.tipoCinta || '';
                    document.getElementById('fabricanteCinta').value = esp.fabricanteCinta || '';
                    document.getElementById('capacidadeCinta').value = esp.capacidadeCinta || '';
                    document.getElementById('comprimentoCinta').value = esp.comprimentoCinta || '';
                } else if (classeSalva === 'manilha') {
                    // MANILHA: 4 Campos
                    document.getElementById('tipoManilha').value = esp.tipoManilha || '';
                    document.getElementById('fabricanteManilha').value = esp.fabricanteManilha || '';
                    document.getElementById('capacidadeManilha').value = esp.capacidadeManilha || '';
                    document.getElementById('diametronominalManilha').value = esp.diametronominalManilha || '';
                } else if (classeSalva === 'cabo') {
                    // CABO DE AÇO: 7 Campos (5 principais + 2 Terminações)
                    document.getElementById('tipoCabo').value = esp.tipoCabo || '';
                    document.getElementById('fabricanteCabo').value = esp.fabricanteCabo || '';
                    document.getElementById('capacidadeCabo').value = esp.capacidadeCabo || '';
                    document.getElementById('comprimentoCabo').value = esp.comprimentoCabo || '';
                    document.getElementById('diametroCabo').value = esp.diametroCabo || '';
                    // CAMPOS COMPLEMENTARES
                    document.getElementById('terminacao1Cabo').value = esp.terminacao1Cabo || '';
                    document.getElementById('terminacao2Cabo').value = esp.terminacao2Cabo || '';
                }
                
            } else {
                console.log('Nenhuma especificação ou classe encontrada. Iniciando formulário.');
                displayFields('');
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

            // A CLASSE é o valor do campo 'tipo'
            const classeSelecionada = document.getElementById('tipo').value;

            if (!classeSelecionada) {
                alert('Por favor, selecione o Tipo/Classe do Objeto.');
                return;
            }

            // Cria o objeto base para salvar
            const dadosTela2 = {
                classe: classeSelecionada, // SALVA A CLASSE NO FIREBASE
            };
            
            // Coleta os dados específicos da classe selecionada (ATUALIZADA)
            if (classeSelecionada === 'cinta') {
                // CINTA: 4 Campos
                dadosTela2.tipoCinta = document.getElementById('tipoCinta').value;
                dadosTela2.fabricanteCinta = document.getElementById('fabricanteCinta').value;
                dadosTela2.capacidadeCinta = document.getElementById('capacidadeCinta').value;
                dadosTela2.comprimentoCinta = document.getElementById('comprimentoCinta').value;
            } else if (classeSelecionada === 'manilha') {
                // MANILHA: 4 Campos
                dadosTela2.tipoManilha = document.getElementById('tipoManilha').value;
                dadosTela2.fabricanteManilha = document.getElementById('fabricanteManilha').value;
                dadosTela2.capacidadeManilha = document.getElementById('capacidadeManilha').value;
                dadosTela2.diametronominalManilha = document.getElementById('diametronominalManilha').value;
            } else if (classeSelecionada === 'cabo') {
                // CABO DE AÇO: 7 Campos (5 principais + 2 Terminações)
                dadosTela2.tipoCabo = document.getElementById('tipoCabo').value;
                dadosTela2.fabricanteCabo = document.getElementById('fabricanteCabo').value;
                dadosTela2.capacidadeCabo = document.getElementById('capacidadeCabo').value;
                dadosTela2.comprimentoCabo = document.getElementById('comprimentoCabo').value;
                dadosTela2.diametroCabo = document.getElementById('diametroCabo').value;
                // CAMPOS COMPLEMENTARES
                dadosTela2.terminacao1Cabo = document.getElementById('terminacao1Cabo').value;
                dadosTela2.terminacao2Cabo = document.getElementById('terminacao2Cabo').value;
            }
            

            try {
                // Salva todos os dados (incluindo a 'classe')
                await salvarEspecificacaoInspecao(currentInspectionId, dadosTela2);
                sessionStorage.setItem('inspecaoId', currentInspectionId); 
                
                alert('Especificações salvas com sucesso!');
                
                // Redireciona e passa a CLASSE para o checklist
                window.location.href = `checklist.html?id=${currentInspectionId}&classe=${classeSelecionada}`;

            } catch (error) {
                console.error('Erro ao salvar especificações:', error);
                alert('Erro ao salvar especificações: ' + error.message);
            }
        });
    }
});