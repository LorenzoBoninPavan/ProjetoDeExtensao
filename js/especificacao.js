import { auth, onAuthStateChanged, salvarEspecificacaoInspecao, getInspecaoById } from './firebase.js';

// Função auxiliar para exibir o nome da classe de forma legível
function formatClasseName(classe) {
    if (classe === 'cabo') return 'Cabo de Aço';
    return classe.charAt(0).toUpperCase() + classe.slice(1);
}

// Função para controlar a exibição dos blocos de campos
// Esta função é chamada automaticamente pelo script principal.
function displayFields(classeSelecionada) {
    // Mapeamento do valor da classe para o ID do bloco no HTML
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
    let currentClasse = null; // Variável para armazenar a classe da URL

    onAuthStateChanged(auth, (user) => {
        if (user) {
            const urlParams = new URLSearchParams(window.location.search);
            const inspecaoId = urlParams.get('id');
            // NOVO: A classe também pode vir da URL (se for novo cadastro)
            const classeUrl = urlParams.get('classe'); 

            if (inspecaoId) {
                currentInspectionId = inspecaoId;
                
                // Prioridade 1: Tentar carregar dados salvos.
                loadEspecificacaoData(inspecaoId, classeUrl); 

            } else {
                alert('ID da inspeção não encontrado. Retornando.');
                window.location.href = 'identificacao.html'; // Volta para a tela de identificação
            }
        } else {
            // Redireciona para o login se não estiver autenticado
            window.location.href = 'login.html';
        }
    });

    // Função para carregar dados do Firebase
    async function loadEspecificacaoData(inspecaoId, classeUrl) {
        try {
            const inspection = await getInspecaoById(inspecaoId);
            
            // Determina a classe: Preferencialmente da especificação salva, senão da identificação, senão da URL.
            let classeDefinida = classeUrl;

            // Se existir dados de identificação e for um novo cadastro
            if (inspection.identificacao && inspection.identificacao.classe) {
                classeDefinida = inspection.identificacao.classe;
            }

            // Se já houver especificações salvas
            if (inspection && inspection.especificacao && inspection.especificacao.classe) {
                classeDefinida = inspection.especificacao.classe;
            }
            
            if (!classeDefinida) {
                 alert('Classe do objeto não definida na inspeção. Retornando.');
                 window.location.href = `identificacao.html?id=${inspecaoId}`;
                 return;
            }

            currentClasse = classeDefinida; // Define a classe global
            
            // 1. Exibe a classe no campo de visualização (display)
            document.getElementById('classeDisplay').value = formatClasseName(currentClasse);
            document.getElementById('classeHidden').value = currentClasse; // Salva no hidden para uso fácil
            
            // 2. Exibe o formulário correto
            displayFields(currentClasse);
            
            // 3. Carrega os dados salvos, se existirem
            if (inspection && inspection.especificacao) {
                const esp = inspection.especificacao;

                if (currentClasse === 'cinta') {
                    document.getElementById('tipoCinta').value = esp.tipoCinta || '';
                    document.getElementById('fabricanteCinta').value = esp.fabricanteCinta || '';
                    document.getElementById('capacidadeCinta').value = esp.capacidadeCinta || '';
                    document.getElementById('comprimentoCinta').value = esp.comprimentoCinta || '';
                } else if (currentClasse === 'manilha') {
                    document.getElementById('tipoManilha').value = esp.tipoManilha || '';
                    document.getElementById('fabricanteManilha').value = esp.fabricanteManilha || '';
                    document.getElementById('capacidadeManilha').value = esp.capacidadeManilha || '';
                    document.getElementById('diametronominalManilha').value = esp.diametronominalManilha || '';
                } else if (currentClasse === 'cabo') {
                    document.getElementById('tipoCabo').value = esp.tipoCabo || '';
                    document.getElementById('fabricanteCabo').value = esp.fabricanteCabo || '';
                    document.getElementById('capacidadeCabo').value = esp.capacidadeCabo || '';
                    document.getElementById('comprimentoCabo').value = esp.comprimentoCabo || '';
                    document.getElementById('diametroCabo').value = esp.diametroCabo || '';
                    document.getElementById('terminacao1Cabo').value = esp.terminacao1Cabo || '';
                    document.getElementById('terminacao2Cabo').value = esp.terminacao2Cabo || '';
                }
            }

        } catch (error) {
            console.error('Erro ao carregar dados de especificação:', error);
            alert('Erro ao carregar dados de especificação.');
        }
    }

    if (especificacaoForm) {
        especificacaoForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!currentInspectionId || !currentClasse) {
                alert('Erro: Classe ou ID da inspeção não estão definidos.');
                return;
            }

            // Cria o objeto base para salvar
            const dadosTela2 = {
                classe: currentClasse, // Usa a classe carregada no DOMContentLoaded
            };
            
            // Coleta os dados específicos da classe selecionada
            if (currentClasse === 'cinta') {
                dadosTela2.tipoCinta = document.getElementById('tipoCinta').value;
                dadosTela2.fabricanteCinta = document.getElementById('fabricanteCinta').value;
                dadosTela2.capacidadeCinta = document.getElementById('capacidadeCinta').value;
                dadosTela2.comprimentoCinta = document.getElementById('comprimentoCinta').value;
            } else if (currentClasse === 'manilha') {
                dadosTela2.tipoManilha = document.getElementById('tipoManilha').value;
                dadosTela2.fabricanteManilha = document.getElementById('fabricanteManilha').value;
                dadosTela2.capacidadeManilha = document.getElementById('capacidadeManilha').value;
                dadosTela2.diametronominalManilha = document.getElementById('diametronominalManilha').value;
            } else if (currentClasse === 'cabo') {
                dadosTela2.tipoCabo = document.getElementById('tipoCabo').value;
                dadosTela2.fabricanteCabo = document.getElementById('fabricanteCabo').value;
                dadosTela2.capacidadeCabo = document.getElementById('capacidadeCabo').value;
                dadosTela2.comprimentoCabo = document.getElementById('comprimentoCabo').value;
                dadosTela2.diametroCabo = document.getElementById('diametroCabo').value;
                dadosTela2.terminacao1Cabo = document.getElementById('terminacao1Cabo').value;
                dadosTela2.terminacao2Cabo = document.getElementById('terminacao2Cabo').value;
            }
            

            try {
                await salvarEspecificacaoInspecao(currentInspectionId, dadosTela2);
                sessionStorage.setItem('inspecaoId', currentInspectionId); 
                
                alert('Especificações salvas com sucesso!');
                
                // Redireciona para o checklist, passando o ID e a CLASSE
                window.location.href = `checklist.html?id=${currentInspectionId}&classe=${currentClasse}`;

            } catch (error) {
                console.error('Erro ao salvar especificações:', error);
                alert('Erro ao salvar especificações: ' + error.message);
            }
        });
    }
});