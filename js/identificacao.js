// Importa funcionalidades de autenticação e manipulação de dados do Firebase.
import { auth, onAuthStateChanged, iniciarNovoCadastroInspecao, getInspecaoById } from './firebase.js';

// Função para converter FileList para Array de Base64
// Início da função que converte arquivos de foto em texto (Base64).
function getBase64Photos(files) {
    // Cria um array de promessas para ler cada arquivo.
    const promises = Array.from(files).map(fileInput => {
        // Obtém o primeiro arquivo do input (se houver).
        const file = fileInput.files[0];
        // Retorna uma nova Promessa (lógica assíncrona).
        return new Promise(resolve => {
            // Se não houver arquivo, resolve com nulo.
            if (!file) return resolve(null);
            // Cria um leitor de arquivos do navegador.
            const reader = new FileReader();
            // Quando a leitura estiver completa, resolve com o resultado (Base64).
            reader.onload = () => resolve(reader.result);
            // Em caso de erro, resolve com nulo.
            reader.onerror = () => resolve(null);
            // Inicia a leitura do arquivo como Data URL (Base64).
            reader.readAsDataURL(file);
        });
    });
    // Espera que todas as promessas de leitura de fotos terminem.
    return Promise.all(promises);
}

// Escuta o evento de carregamento completo do HTML.
document.addEventListener('DOMContentLoaded', () => {
    // Obtém a referência ao formulário principal de identificação.
    const inspectionForm = document.getElementById('inspectionForm');
    // Variável para armazenar o ID do usuário logado (UID).
    let currentUserId = null;
    // Variável para armazenar o ID da inspeção atual (para edição).
    let currentInspectionId = null;

    // Monitora o estado de autenticação do usuário (login/logout).
    onAuthStateChanged(auth, (user) => {
        // Se o usuário estiver logado:
        if (user) {
            // Armazena o ID do usuário.
            currentUserId = user.uid;
            // Lê os parâmetros da URL (busca por '?id=...').
            const urlParams = new URLSearchParams(window.location.search);
            // Tenta obter o ID da inspeção na URL.
            const inspecaoId = urlParams.get('id');
            // Se um ID for encontrado (modo edição):
            if (inspecaoId) {
                // Define o ID da inspeção atual.
                currentInspectionId = inspecaoId;
                // Chama a função para carregar dados do Firebase.
                loadInspectionData(inspecaoId);
            }
        // Se o usuário NÃO estiver logado:
        } else {
            // Redireciona para a tela de login.
            window.location.href = 'login.html';
        }
    });

    // Função assíncrona para carregar dados de uma inspeção existente.
    async function loadInspectionData(inspecaoId) {
        try {
            // Busca o documento de inspeção no Firebase pelo ID.
            const inspection = await getInspecaoById(inspecaoId);
            // Se a inspeção e os dados de 'identificacao' existirem:
            if (inspection && inspection.identificacao) { 
                // Armazena os dados de identificação.
                const idData = inspection.identificacao;
                // Preenche o campo 'tag' com o valor salvo.
                document.getElementById('tag').value = idData.tag || '';
                // Preenche o campo 'classe' com o valor salvo.
                document.getElementById('classe').value = idData.classe || ''; 
                // Preenche o campo 'série/nome' com o valor salvo.
                document.getElementById('name').value = idData.serie || '';
                // Preenche o campo 'data' com o valor salvo.
                document.getElementById('date').value = idData.data || '';
                // Preenche o campo 'validade' com o valor salvo.
                document.getElementById('validacao').value = idData.validade || '';
                // Preenche o campo 'observacao' com o valor salvo.
                document.getElementById('observacao').value = idData.observacao || '';
                
                // NOTA: O input de arquivo não pode ser preenchido com fotos em Base64 salvas.
            } else {
                // Se a inspeção não tem identificação (ID existe, mas sem dados iniciais).
                console.log('Inspeção encontrada, mas sem dados de identificação. Iniciando novo preenchimento.');
                // Mantém o ID existente para preencher e salvar.
                currentInspectionId = inspecaoId; 
            }
        } catch (error) {
            // Loga qualquer erro ao tentar buscar dados no Firebase.
            console.error('Erro ao carregar dados da inspeção:', error);
            // Exibe um alerta de erro para o usuário.
            alert('Erro ao carregar dados da inspeção.');
        }
    }

    // Verifica se o formulário existe no HTML.
    if (inspectionForm) {
        // Adiciona um escutador de evento para a submissão do formulário.
        inspectionForm.addEventListener('submit', async (e) => {
            // Previne o comportamento padrão de recarregar a página.
            e.preventDefault();

            // Validação: Se o usuário não estiver logado, para a submissão.
            if (!currentUserId) {
                alert('Usuário não autenticado.');
                return;
            }
            
            // Pega o valor selecionado no campo 'classe'.
            const classeSelecionada = document.getElementById('classe').value;

            // Validação: Se a classe não foi selecionada, exibe alerta.
            if (!classeSelecionada) {
                alert('Por favor, selecione o TIPO DO OBJETO.');
                return;
            }
            
            // Chama a função para converter as 3 fotos em Base64.
            const fotosBase64 = await getBase64Photos([
                document.getElementById('photo'),
                document.getElementById('photo2'),
                document.getElementById('photo3')
            ]);
            
            // Cria um objeto com todos os dados coletados do formulário (Tela 1).
            const dadosTela1 = {
                tag: document.getElementById('tag').value,
                classe: classeSelecionada, 
                serie: document.getElementById('name').value,
                data: document.getElementById('date').value,
                validade: document.getElementById('validacao').value,
                observacao: document.getElementById('observacao').value,
                // Filtra nulos e salva o array de fotos em Base64.
                fotos: fotosBase64.filter(f => f !== null)
            };

            try {
                // Variável para armazenar o ID final da inspeção.
                let inspecaoId;
                // Se já houver um ID (modo edição):
                if (currentInspectionId) {
                    // Usa o ID existente.
                    inspecaoId = currentInspectionId;
                    // NOTA: O código idealmente chamaria uma função de atualização aqui.
                } else {
                    // Se é um novo cadastro (sem ID):
                    // Inicia e salva os dados no Firebase, obtendo o novo ID.
                    inspecaoId = await iniciarNovoCadastroInspecao(currentUserId, dadosTela1);
                    console.log("Nova inspeção criada:", inspecaoId);
                }
                
                // Redireciona para a próxima tela, passando o ID e a CLASSE.
                window.location.href = `especificacao.html?id=${inspecaoId}&classe=${classeSelecionada}`;
                
            } catch (error) {
                // Trata erros no salvamento ou criação da inspeção.
                console.error('Erro ao salvar identificação:', error);
                alert('Erro ao salvar identificação: ' + error.message);
            }
        });
    }
});