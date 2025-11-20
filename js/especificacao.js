// Importa funcionalidades do Firebase para autenticação, salvamento de especificações e busca de dados.
import { auth, onAuthStateChanged, salvarEspecificacaoInspecao, getInspecaoById } from './firebase.js';

// Função auxiliar para exibir o nome da classe de forma legível.
function formatClasseName(classe) {
    // Retorna 'Cabo de Aço' se a classe for 'cabo'.
    if (classe === 'cabo') return 'Cabo de Aço';
    // Capitaliza a primeira letra para 'Cinta' ou 'Manilha'.
    return classe.charAt(0).toUpperCase() + classe.slice(1);
}

// Função para controlar a exibição dos blocos de campos (Cinta, Manilha ou Cabo).
function displayFields(classeSelecionada) {
    // Mapeamento do valor da classe para o ID do bloco no HTML.
    const idMap = {
        'cinta': 'classe-cinta-fields',
        'manilha': 'classe-manilha-fields',
        'cabo': 'classe-cabo-fields',
    };

    // Seleciona todos os blocos específicos de classe.
    const especificos = document.querySelectorAll('.classe-fields');
    // Esconde todos os blocos de campos específicos primeiro.
    especificos.forEach(div => div.style.display = 'none');

    // Se a classe selecionada existir no mapeamento:
    if (classeSelecionada && idMap[classeSelecionada]) {
        // Encontra o bloco HTML a ser mostrado.
        const blocoASerMostrado = document.getElementById(idMap[classeSelecionada]);
        
        // Se o bloco foi encontrado:
        if (blocoASerMostrado) {
            // Oculta todos e exibe apenas o bloco correspondente à classe.
            blocoASerMostrado.style.display = 'block';
        }
    }
}

// Inicia o script quando o HTML estiver totalmente carregado.
document.addEventListener('DOMContentLoaded', () => {
    // Obtém o formulário de especificações.
    const especificacaoForm = document.getElementById('especificacaoForm');
    // ID da inspeção atual.
    let currentInspectionId = null;
    // Classe do objeto (Cinta, Manilha ou Cabo).
    let currentClasse = null; 

    // Monitora o estado de autenticação.
    onAuthStateChanged(auth, (user) => {
        // Se o usuário está logado:
        if (user) {
            // Lê os parâmetros da URL.
            const urlParams = new URLSearchParams(window.location.search);
            // Obtém o ID da inspeção.
            const inspecaoId = urlParams.get('id');
            // Obtém a classe da URL.
            const classeUrl = urlParams.get('classe'); 

            // Se o ID da inspeção foi passado:
            if (inspecaoId) {
                // Define o ID da inspeção.
                currentInspectionId = inspecaoId;
                
                // Carrega os dados (busca classe e dados salvos).
                loadEspecificacaoData(inspecaoId, classeUrl); 

            } else {
                // Se o ID não foi passado, alerta e volta para a Identificação.
                alert('ID da inspeção não encontrado. Retornando.');
                window.location.href = 'identificacao.html'; 
            }
        } else {
            // Redireciona para o login se não estiver autenticado.
            window.location.href = 'login.html';
        }
    });

    // Função assíncrona para carregar dados do Firebase.
    async function loadEspecificacaoData(inspecaoId, classeUrl) {
        try {
            // Busca o documento de inspeção.
            const inspection = await getInspecaoById(inspecaoId);
            
            // Variável local para determinar a classe.
            let classeDefinida = classeUrl;

            // Prioridade 2: Pega a classe salva na tela de Identificação (se existir).
            if (inspection.identificacao && inspection.identificacao.classe) {
                classeDefinida = inspection.identificacao.classe;
            }

            // Prioridade 1: Pega a classe salva na tela de Especificações (se já foi preenchida).
            if (inspection && inspection.especificacao && inspection.especificacao.classe) {
                classeDefinida = inspection.especificacao.classe;
            }
            
            // Verifica se a classe foi definida.
            if (!classeDefinida) {
                 // Alerta e retorna para a tela de Identificação.
                 alert('Classe do objeto não definida na inspeção. Retornando.');
                 window.location.href = `identificacao.html?id=${inspecaoId}`;
                 return;
            }

            // Armazena a classe definida globalmente.
            currentClasse = classeDefinida; 
            
            // 1. Exibe o nome da classe formatado no campo de visualização.
            document.getElementById('classeDisplay').value = formatClasseName(currentClasse);
            // Salva a classe no campo escondido.
            document.getElementById('classeHidden').value = currentClasse; 
            
            // 2. Chama a função que exibe/esconde os campos com base na classe.
            displayFields(currentClasse);
            
            // 3. Carrega os dados salvos, se existirem.
            if (inspection && inspection.especificacao) {
                // Pega o objeto de especificações salvas.
                const esp = inspection.especificacao;

                // Preenche os campos específicos para a classe 'cinta'.
                if (currentClasse === 'cinta') {
                    document.getElementById('tipoCinta').value = esp.tipoCinta || '';
                    document.getElementById('fabricanteCinta').value = esp.fabricanteCinta || '';
                    document.getElementById('capacidadeCinta').value = esp.capacidadeCinta || '';
                    document.getElementById('comprimentoCinta').value = esp.comprimentoCinta || '';
                // Preenche os campos específicos para a classe 'manilha'.
                } else if (currentClasse === 'manilha') {
                    document.getElementById('tipoManilha').value = esp.tipoManilha || '';
                    document.getElementById('fabricanteManilha').value = esp.fabricanteManilha || '';
                    document.getElementById('capacidadeManilha').value = esp.capacidadeManilha || '';
                    document.getElementById('diametronominalManilha').value = esp.diametronominalManilha || '';
                // Preenche os campos específicos para a classe 'cabo'.
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
            // Trata erros ao carregar os dados.
            console.error('Erro ao carregar dados de especificação:', error);
            alert('Erro ao carregar dados de especificação.');
        }
    }

    // Verifica se o formulário existe.
    if (especificacaoForm) {
        // Adiciona um escutador de evento para a submissão.
        especificacaoForm.addEventListener('submit', async (e) => {
            // Previne o envio padrão do formulário.
            e.preventDefault();

            // Validação de segurança.
            if (!currentInspectionId || !currentClasse) {
                alert('Erro: Classe ou ID da inspeção não estão definidos.');
                return;
            }

            // Cria o objeto base para salvar os dados da Tela 2.
            const dadosTela2 = {
                // Inclui a classe para referência futura.
                classe: currentClasse, 
            };
            
            // Coleta os dados específicos da classe selecionada, garantindo que só os campos relevantes sejam salvos.
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
                // Chama a função do Firebase para salvar as especificações no ID atual.
                await salvarEspecificacaoInspecao(currentInspectionId, dadosTela2);
                // Salva o ID em sessionStorage (redundância para o próximo script).
                sessionStorage.setItem('inspecaoId', currentInspectionId); 
                
                alert('Especificações salvas com sucesso!');
                
                // Redireciona para o checklist, passando o ID e a CLASSE.
                window.location.href = `checklist.html?id=${currentInspectionId}&classe=${currentClasse}`;

            } catch (error) {
                // Trata erros no salvamento.
                console.error('Erro ao salvar especificações:', error);
                alert('Erro ao salvar especificações: ' + error.message);
            }
        });
    }
});