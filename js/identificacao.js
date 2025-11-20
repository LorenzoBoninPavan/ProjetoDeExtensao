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
            if (inspection) {
                // Carrega os campos existentes
                document.getElementById('tag').value = inspection.identificacao.tag || '';
                // NOVO: Carregar a classe
                document.getElementById('classe').value = inspection.identificacao.classe || ''; 
                document.getElementById('name').value = inspection.identificacao.serie || '';
                document.getElementById('date').value = inspection.identificacao.data || '';
                document.getElementById('validacao').value = inspection.identificacao.validade || '';
                document.getElementById('observacao').value = inspection.identificacao.observacao || '';
                
                // NOTA: Não carregamos as fotos em base64 de volta para os inputs de arquivo por questões de segurança e funcionalidade do navegador.
            } else {
                alert('Inspeção não encontrada.');
                window.location.href = 'index.html';
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
                // NOVO: Coletar a classe
                classe: classeSelecionada, 
                serie: document.getElementById('name').value,
                data: document.getElementById('date').value,
                validade: document.getElementById('validacao').value,
                observacao: document.getElementById('observacao').value,
                fotos: fotosBase64.filter(f => f !== null) // Filtra nulos
            };

            try {
                let inspecaoId;
                if (currentInspectionId) {
                    inspecaoId = currentInspectionId;
                } else {
                    inspecaoId = await iniciarNovoCadastroInspecao(currentUserId, dadosTela1);
                    console.log("Nova inspeção criada:", inspecaoId);
                }
                
                // Redireciona para a ESPECIFICAÇÃO, passando o ID
                window.location.href = `especificacao.html?id=${inspecaoId}`;
                
            } catch (error) {
                console.error('Erro ao salvar identificação:', error);
                alert('Erro ao salvar identificação: ' + error.message);
            }
        });
    }
});