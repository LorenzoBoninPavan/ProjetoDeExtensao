import { auth, onAuthStateChanged, iniciarNovoCadastroInspecao, getInspecaoById } from './firebase.js';

// Função para converter FileList para Array de Base64
function getBase64Photos(files) {
    const promises = Array.from(files).map(fileInput => {
        const file = fileInput.files[0];
        return new Promise(resolve => {
            if (!file) return resolve(null);
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = () => resolve(null);
            reader.readAsDataURL(file);
        });
    });
    return Promise.all(promises);
}


document.addEventListener('DOMContentLoaded', () => {
    const inspectionForm = document.getElementById('inspectionForm');
    let currentUserId = null;
    let currentInspectionId = null;

    onAuthStateChanged(auth, (user) => {
        if (user) {
            currentUserId = user.uid;
            const urlParams = new URLSearchParams(window.location.search);
            const inspecaoId = urlParams.get('id');
            if (inspecaoId) {
                currentInspectionId = inspecaoId;
                loadInspectionData(inspecaoId);
            }
        } else {
            window.location.href = 'login.html';
        }
    });

    async function loadInspectionData(inspecaoId) {
        try {
            const inspection = await getInspecaoById(inspecaoId);
            if (inspection && inspection.identificacao) { // Verifica a sub-coleção identificacao
                // Carrega os campos existentes
                const idData = inspection.identificacao;
                document.getElementById('tag').value = idData.tag || '';
                document.getElementById('classe').value = idData.classe || ''; 
                document.getElementById('name').value = idData.serie || '';
                document.getElementById('date').value = idData.data || '';
                document.getElementById('validacao').value = idData.validade || '';
                document.getElementById('observacao').value = idData.observacao || '';
                
                // NOTA: Não carregamos as fotos em base64 de volta para os inputs de arquivo.
            } else {
                // Se a inspeção existe mas não tem 'identificacao' (caso improvável, mas seguro)
                console.log('Inspeção encontrada, mas sem dados de identificação. Iniciando novo preenchimento.');
                currentInspectionId = inspecaoId; // Mantém o ID se ele já existia
            }
        } catch (error) {
            console.error('Erro ao carregar dados da inspeção:', error);
            alert('Erro ao carregar dados da inspeção.');
        }
    }

    if (inspectionForm) {
        inspectionForm.addEventListener('submit', async (e) => {
            e.preventDefault();

            if (!currentUserId) {
                alert('Usuário não autenticado.');
                return;
            }
            
            const classeSelecionada = document.getElementById('classe').value;

            if (!classeSelecionada) {
                alert('Por favor, selecione o TIPO / CLASSE DO OBJETO.');
                return;
            }
            
            // Coletar fotos em Base64
            const fotosBase64 = await getBase64Photos([
                document.getElementById('photo'),
                document.getElementById('photo2'),
                document.getElementById('photo3')
            ]);
            

            const dadosTela1 = {
                tag: document.getElementById('tag').value,
                classe: classeSelecionada, 
                serie: document.getElementById('name').value,
                data: document.getElementById('date').value,
                validade: document.getElementById('validacao').value,
                observacao: document.getElementById('observacao').value,
                fotos: fotosBase64.filter(f => f !== null)
            };

            try {
                let inspecaoId;
                if (currentInspectionId) {

                    inspecaoId = currentInspectionId;
                    // Se for edição, idealmente você usaria 'salvarIdentificacaoInspecao(inspecaoId, dadosTela1)'
                } else {
                    // Se for novo, inicia um novo cadastro e salva os dados da tela 1
                    inspecaoId = await iniciarNovoCadastroInspecao(currentUserId, dadosTela1);
                    console.log("Nova inspeção criada:", inspecaoId);
                }
                
                window.location.href = `especificacao.html?id=${inspecaoId}&classe=${classeSelecionada}`;
                
            } catch (error) {
                console.error('Erro ao salvar identificação:', error);
                alert('Erro ao salvar identificação: ' + error.message);
            }
        });
    }
});