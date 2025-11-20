import { auth, onAuthStateChanged, salvarEspecificacaoInspecao, getInspecaoById } from './firebase.js';

// Função auxiliar para exibir o nome da classe de forma legível
function formatClasseName(classe) {
    if (classe === 'cabo') return 'Cabo de Aço';
    return classe.charAt(0).toUpperCase() + classe.slice(1);
}

// Função para controlar a exibição dos blocos de campos
function displayFields(classeSelecionada) {
    const idMap = {
        'cinta': 'classe-cinta-fields',
        'manilha': 'classe-manilha-fields',
        'cabo': 'classe-cabo-fields',
    };

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
    let currentClasse = null;

    onAuthStateChanged(auth, (user) => {
        if (user) {
            const urlParams = new URLSearchParams(window.location.search);
            const inspecaoId = urlParams.get('id');
            const classeUrl = urlParams.get('classe'); 

            if (inspecaoId) {
                currentInspectionId = inspecaoId;
                loadEspecificacaoData(inspecaoId, classeUrl); 

            } else {
                alert('ID da inspeção não encontrado na URL. Retornando ao início.');
                window.location.href = 'identificacao.html'; 
            }
        } else {
            window.location.href = 'login.html';
        }
    });

    async function loadEspecificacaoData(inspecaoId, classeUrl) {
        try {
            const inspection = await getInspecaoById(inspecaoId);
            
            let classeDefinida = null;

            // 1. Prioridade: Classe já salva no bloco de especificações (edição).
            if (inspection && inspection.especificacao && inspection.especificacao.classe) {
                classeDefinida = inspection.especificacao.classe;
            } 
            // 2. Segunda Prioridade: Classe salva no bloco de identificação.
            else if (inspection && inspection.identificacao && inspection.identificacao.classe) {
                classeDefinida = inspection.identificacao.classe;
            }
            // 3. Terceira Prioridade: Classe que veio na URL.
            else if (classeUrl) {
                classeDefinida = classeUrl;
            }
            // 4. Última Chance: Classe salva no Session Storage (Fallback).
            else if (sessionStorage.getItem('classeObjeto')) {
                classeDefinida = sessionStorage.getItem('classeObjeto');
            }
            
            if (!classeDefinida) {
                 alert('Classe do objeto não definida na inspeção. Retornando para o início do cadastro.');
                 window.location.href = `identificacao.html?id=${inspecaoId}`;
                 return;
            }

            currentClasse = classeDefinida; // Define a classe global
            
            // 1. Exibe a classe no campo de visualização (display)
            const classeDisplay = document.getElementById('classeDisplay');
            if(classeDisplay) classeDisplay.value = formatClasseName(currentClasse);
            
            const classeHidden = document.getElementById('classeHidden');
            if(classeHidden) classeHidden.value = currentClasse;
            
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
            alert('Erro ao carregar dados de especificação: Verifique a conexão ou o ID.');
        }
    }

    if (especificacaoForm) {
        especificacaoForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!currentInspectionId || !currentClasse) {
                alert('Erro: Classe ou ID da inspeção não estão definidos.');
                return;
            }

            const dadosTela2 = {
                classe: currentClasse,
            };
            
            // Coleta de dados dinâmicos da classe
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
                console.log('1. Tentando salvar especificações para o ID:', currentInspectionId);
                console.log('   Dados a serem salvos:', dadosTela2);
                
                // --- CHAMA A FUNÇÃO CORRIGIDA NO FIREBASE ---
                await salvarEspecificacaoInspecao(currentInspectionId, dadosTela2);
                
                console.log('2. Especificações salvas com sucesso no Firebase.');

                sessionStorage.setItem('inspecaoId', currentInspectionId); 
                
                // Redireciona para o checklist, passando o ID e a CLASSE
                window.location.href = `checklist.html?id=${currentInspectionId}&classe=${currentClasse}`;

            } catch (error) {
                console.error('ERRO CRÍTICO AO SALVAR ESPECIFICAÇÕES:', error);
                alert('Erro ao salvar especificações. Verifique o console para detalhes.');
            }
        });
    }
});