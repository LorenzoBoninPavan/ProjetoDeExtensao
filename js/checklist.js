// Importa funcionalidades do Firebase (autenticação e função para finalizar a inspeção).
import { auth, onAuthStateChanged, finalizarInspecao } from './firebase.js';

// --- 1. DEFINIÇÃO DE DADOS DINÂMICOS ---
// Objeto que contém todas as perguntas de checklist, separadas por classe.
const CHECKLIST_DATA = {
    'cinta': {
        main: [
            "1. Existem sinais de Abrasão?",
            "2. Existem cortes Longitudinais?",
            "3. Existem redução de seção?",
            "4. Existem sinais de Corrosão?",
            "5. Existem sinais de danos por fricção ou Sobreaquecimento?",
            "6. Existem sinais de Ataque Químico?",
            "7. Etiqueta ilegível ou sem etiqueta",
        ],
        terminacao: [] // A classe 'cinta' não tem checklist de terminação.
    },
    'manilha': {
        main: [
            "1. Existem sinais de cisalhamento ou deformação no pino?",
            "2. Existem dificuldades para encaixar o pino?",
            "3. Existe redução considerável da seção?",
            "4. Existem sinais de corrosão?",
            "5. Existem sinais de sobreaquecimento?",
            "6. Existem trincas ou fissuras?",
            "7. Existem deformações do acessório?",
            "8. Caso com porca, esta possui normalidade?",
        ],
        terminacao: [] // A classe 'manilha' não tem checklist de terminação.
    },
    'cabo': {
        main: [
            "1. Pernas Rompidas?",
            "2. Alma Exposta?",
            "3. Existem Arames Rombidos(6 fios 3.d ou 15 fios x 30.d)?",
            "4. 3 ou mais arames rompidos em uma Perna x Passo?",
            "5. 2 ou mais arames rompidos no interior x Passo",
            "6. 2 ou mais arames rompidos próximos?",
            "7. 2 ou mais arames rompidos próximos a terminações(6x25)",
            "8. 3 ou mais arames rompidos próximos a terminações (6x36)",
            "9. Existem sinais de Sobreaquecimento?",
            "10. Existem Dobras?",
            "11. Existem Pernas ou arames fora da posição?",
            "12. Existem sinais de corrosão interna ou externa?",
            "13. Existem redução maior que 7,5% no diâmetro",
        ],
        // O cabo de aço possui um checklist extra para as terminações.
        terminacao: [
            "T1. Sapatilho Deformado?",
            "T2. Presilha com sianis de abrasão ou amassamento severo, trinca ou desprendendo-se?",
            "T3. Olhal com rompimentos por diâmetro excessivo de pinos?",
            "T4. Existem arrames partidos?",
            "T5. Sinais de Desgates acentuados?",
        ]
    }
};

/**
 * Função auxiliar para gerar linhas do checklist em HTML.
 */
function generateChecklistRows(questions, prefix, classe) {
    // Inicializa a string HTML.
    let rowsHTML = '';
    
    // Itera sobre cada pergunta.
    questions.forEach((question, index) => {
        // Calcula o número do item (começa em 1).
        const itemNumber = index + 1;
        // Cria um nome de input exclusivo para cada item (ex: item_cabo_main_1).
        const inputName = `item_${classe}_${prefix}_${itemNumber}`; 

        // Concatena a linha da tabela (<tr>) no HTML.
        rowsHTML += `
            <tr>
                <td>${question}</td>
                <td><input type="radio" name="${inputName}" value="na" required></td>
                <td><input type="radio" name="${inputName}" value="sim" required></td>
                <td><input type="radio" name="${inputName}" value="nao" required></td>
            </tr>
        `;
    });
    // Retorna o HTML completo das linhas.
    return rowsHTML;
}

// --- 2. FUNÇÃO DE RENDERIZAÇÃO DA TABELA ---
// Função principal que insere o checklist correto no HTML.
function renderChecklist(classe) {
    // Obtém o objeto de dados específico para a classe.
    const checklistData = CHECKLIST_DATA[classe];
    
    // Se os dados da classe não estiverem definidos, exibe erro e para.
    if (!checklistData) {
        console.error(`Checklist não definido para a classe: ${classe}`);
        return; 
    }

    // Encontra a área do corpo do checklist principal.
    const checklistBody = document.getElementById('checklist-body');
    // Se a área existir, insere o HTML das perguntas principais.
    if (checklistBody) {
        checklistBody.innerHTML = generateChecklistRows(checklistData.main, 'main', classe);
    }
    
    // Encontra o container e o corpo do checklist de Terminação.
    const terminacaoContainer = document.getElementById('terminacao-checklist-container');
    const terminacaoBody = document.getElementById('terminacao-checklist-body');

    // Verifica se a classe possui perguntas de terminação.
    if (checklistData.terminacao && checklistData.terminacao.length > 0) {
        // Se houver perguntas, exibe o container de terminação.
        if (terminacaoContainer && terminacaoBody) {
            terminacaoContainer.style.display = 'block'; 
            // Insere o HTML das perguntas de terminação.
            terminacaoBody.innerHTML = generateChecklistRows(checklistData.terminacao, 'term', classe);
        }
    } else {
        // Se não houver perguntas de terminação, esconde o container.
        if (terminacaoContainer) {
            terminacaoContainer.style.display = 'none'; 
        }
    }
}

// --- 3. LÓGICA PRINCIPAL ---
// Monitora o estado de autenticação para garantir que o usuário esteja logado.
onAuthStateChanged(auth, (user) => {
    // Se não estiver logado, redireciona para o login.
    if (!user) {
        window.location.href = 'login.html';
    }
});

// Inicia o script quando o HTML estiver totalmente carregado.
document.addEventListener('DOMContentLoaded', function () {
    // 1. OBTÉM ID E CLASSE
    // Lê os parâmetros da URL.
    const urlParams = new URLSearchParams(window.location.search);
    // Obtém o ID da inspeção (preferencial).
    const inspecaoIdURL = urlParams.get('id');
    // Obtém a classe e a converte para minúsculas.
    const classeObjeto = urlParams.get('classe').toLowerCase(); 

    // Define o ID final, usando a URL ou SessionStorage como alternativa.
    const finalInspectionId = inspecaoIdURL || sessionStorage.getItem('inspecaoId');

    // Validação de segurança: verifica se ID e Classe foram encontrados.
    if (!finalInspectionId || !classeObjeto) {
        alert("Erro: ID da inspeção ou Classe não encontrados. Retornando ao início.");
        // Volta para a primeira tela.
        window.location.href = 'identificacao.html';
        return;
    }

    // 2. RENDERIZA OS CHECKLISTS CORRETOS (Principal e Terminação)
    // Insere as perguntas dinamicamente no HTML.
    renderChecklist(classeObjeto);
    
    // 3. LÓGICA DO FORMULÁRIO
    // Obtém o formulário de checklist.
    const form = document.getElementById('checklistForm');

    // Adiciona o escutador de evento para a submissão.
    form.addEventListener('submit', async function (event) {
        // Previne o envio padrão.
        event.preventDefault();

        // COLETANDO DADOS DINÂMICOS
        // Objeto para armazenar as respostas (sim/nao/na).
        const checklistItems = {};
        // Obtém todos os elementos do formulário.
        const formElements = form.elements;

        // Itera sobre todos os elementos.
        for (let i = 0; i < formElements.length; i++) {
            const element = formElements[i];
            
            // Procura por itens de rádio do checklist dinâmico que foram marcados.
            if (element.type === 'radio' && element.name.startsWith('item_') && element.checked) {
                // Salva a resposta no objeto (ex: item_cinta_main_1: 'sim').
                checklistItems[element.name] = element.value;
            }
        }
        
        // COLETANDO DADOS ESTÁTICOS (Comentários e Aprovação)
        const comentarios = document.querySelector('#comentarios').value;
        // Obtém o radio button de aprovação que está marcado.
        const aprovacaoElement = document.querySelector('input[name="approval"]:checked');

        // VALIDAÇÃO BÁSICA: verifica se a aprovação foi selecionada.
        if (!aprovacaoElement) {
             alert('Por favor, selecione se o objeto está Aprovado ou Reprovado.');
             return;
        }

        // LÓGICA DE FOTOS EM BASE64 (MANTIDA INTACTA)
        // Array com os inputs de foto.
        const fotosInputs = [
            document.getElementById('photo1'),
            document.getElementById('photo2'),
            document.getElementById('photo3')
        ];

        // Converte as fotos em Base64 de forma assíncrona.
        const fotosBase64 = await Promise.all(
            fotosInputs.map(input => {
                const file = input.files[0];
                return new Promise(resolve => {
                    if (!file) return resolve(null);
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = () => resolve(null);
                    reader.readAsDataURL(file);
                });
            })
        );
        // FIM DA LÓGICA DE FOTOS

        // PREPARANDO DADOS PARA SALVAR
        // Objeto final com todos os dados do checklist.
        const dadosTela3 = {
            classe: classeObjeto, 
            itens: checklistItems, // Respostas dinâmicas.
            comentarios: comentarios,
            aprovacao: aprovacaoElement.value,
            // Array de fotos em Base64.
            fotos: fotosBase64.filter(f => f !== null)
        };

        try {
            // Chama a função do Firebase para salvar o bloco final de dados.
            await finalizarInspecao(finalInspectionId, dadosTela3);
            // Remove o ID do armazenamento local, indicando o fim da inspeção.
            sessionStorage.removeItem('inspecaoId');
            alert('Inspeção finalizada com sucesso!');
            // Redireciona para a tela de sucesso/confirmação.
            window.location.href = 'sucesso.html';
        } catch (error) {
            // Trata erros na finalização.
            alert("Erro ao finalizar o cadastro. Por favor, tente novamente.");
            console.error(error);
        }
    });
});