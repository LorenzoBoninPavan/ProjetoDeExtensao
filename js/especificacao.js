import { auth, onAuthStateChanged, salvarEspecificacaoInspecao, getInspecaoById } from './firebase.js';

// Função para controlar a exibição dos blocos de campos
function displayFields(classeSelecionada) {
    // Esconde todos os blocos de campos específicos primeiro
    const especificos = document.querySelectorAll('.classe-fields');
    especificos.forEach(div => div.style.display = 'none');

    if (classeSelecionada && classeSelecionada !== "") {
        // Monta o ID do bloco a ser mostrado (ex: 'classe-a-fields')
        const idDoBloco = `classe-${classeSelecionada.toLowerCase().replace('classe_', '')}-fields`;
        const blocoASerMostrado = document.getElementById(idDoBloco);
        
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
            // Redirect to login if not authenticated
            window.location.href = 'login.html';
        }
    });

    // Função modificada para carregar e exibir o formulário correto
    async function loadEspecificacaoData(inspecaoId) {
        try {
            const inspection = await getInspecaoById(inspecaoId);
            
            // Verifica se há dados de especificação e se a CLASSE foi salva
            if (inspection && inspection.especificacao && inspection.especificacao.classe) {
                const classeSalva = inspection.especificacao.classe;

                // 1. Define a classe no dropdown (ex: 'CLASSE_A')
                document.getElementById('tipo').value = classeSalva;
                
                // 2. Exibe o formulário correto
                displayFields(classeSalva);
                
                // 3. Carrega os dados salvos nos campos específicos
                if (classeSalva === 'CLASSE_A') {
                    document.getElementById('fabricanteA').value = inspection.especificacao.fabricante || '';
                    document.getElementById('capacidadeA').value = inspection.especificacao.capacidade || '';
                    document.getElementById('bitolaCaboA').value = inspection.especificacao.bitolaCabo || '';
                    document.getElementById('alturaElevacaoA').value = inspection.especificacao.alturaElevacao || '';
                } else if (classeSalva === 'CLASSE_B') {
                    document.getElementById('cargaB').value = inspection.especificacao.cargaNominal || '';
                    document.getElementById('fatorSegurancaB').value = inspection.especificacao.fatorSeguranca || '';
                    document.getElementById('materialCintaB').value = inspection.especificacao.materialCinta || '';
                } else if (classeSalva === 'CLASSE_C') {
                    document.getElementById('materialC').value = inspection.especificacao.materialGrau || '';
                    document.getElementById('cargaTrabSeguraC').value = inspection.especificacao.cargaTrabSegura || '';
                    document.getElementById('normaAplicavelC').value = inspection.especificacao.normaAplicavel || '';
                }
                
            } else {
                // Se for um novo cadastro ou não tiver classe salva, esconde os campos específicos
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
            
            // Coleta os dados específicos da classe selecionada
            if (classeSelecionada === 'CLASSE_A') {
                dadosTela2.fabricante = document.getElementById('fabricanteA').value;
                dadosTela2.capacidade = document.getElementById('capacidadeA').value;
                dadosTela2.bitolaCabo = document.getElementById('bitolaCaboA').value;
                dadosTela2.alturaElevacao = document.getElementById('alturaElevacaoA').value;
            } else if (classeSelecionada === 'CLASSE_B') {
                dadosTela2.cargaNominal = document.getElementById('cargaB').value;
                dadosTela2.fatorSeguranca = document.getElementById('fatorSegurancaB').value;
                dadosTela2.materialCinta = document.getElementById('materialCintaB').value;
            } else if (classeSelecionada === 'CLASSE_C') {
                dadosTela2.materialGrau = document.getElementById('materialC').value;
                dadosTela2.cargaTrabSegura = document.getElementById('cargaTrabSeguraC').value;
                dadosTela2.normaAplicavel = document.getElementById('normaAplicavelC').value;
            }
            
            // Os campos que você tinha antes (tipo, fabricante, capacidade, bitola)
            // foram agora incorporados como campos específicos dentro de CLASSE_A, B ou C
            // ou podem ser removidos, se forem redundantes.

            try {
                // Salva todos os dados (incluindo a 'classe')
                await salvarEspecificacaoInspecao(currentInspectionId, dadosTela2);
                sessionStorage.setItem('inspecaoId', currentInspectionId); 
                
                alert('Especificações salvas com sucesso!');
                
                // Redireciona para o checklist. É crucial passar a classe daqui.
                window.location.href = `checklist.html?id=${currentInspectionId}&classe=${classeSelecionada}`;

            } catch (error) {
                console.error('Erro ao salvar especificações:', error);
                alert('Erro ao salvar especificações: ' + error.message);
            }
        });
    }
});