import { auth, onAuthStateChanged, finalizarInspecao } from './firebase.js';

// --- 1. DEFINIÇÃO DE DADOS DINÂMICOS (REVISADO) ---
// Define as perguntas específicas para cada classe
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
        terminacao: [] // Não aplicável
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
        terminacao: [] // Não aplicável
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
        terminacao: [
            "T1. Spatilho Deformado?",
            "T2. Presilha com sianis de abrasão ou amassamento severo, trinca ou desprendendo-se?",
            "T3. Olhal com rompimentos por diâmetro excessivo de pinos?",
            "T4. Existem arrames partidos?",
            "T5. Sinais de Desgates acentuados?",
        ]
    }
};

/**
 * Função auxiliar para gerar linhas do checklist
 * @param {string[]} questions - Array de strings com as perguntas.
 * @param {string} prefix - Prefixo para o nome do input (ex: 'main' ou 'term').
 * @param {string} classe - Classe do objeto (ex: 'cabo').
 * @returns {string} HTML das linhas da tabela.
 */
function generateChecklistRows(questions, prefix, classe) {
    let rowsHTML = '';
    
    questions.forEach((question, index) => {
        const itemNumber = index + 1;
        // Nome do input formatado: item_<CLASSE>_<PREFIXO>_<NUMERO>
        const inputName = `item_${classe}_${prefix}_${itemNumber}`; 

        rowsHTML += `
            <tr>
                <td>${question}</td>
                <td><input type="radio" name="${inputName}" value="na" required></td>
                <td><input type="radio" name="${inputName}" value="sim" required></td>
                <td><input type="radio" name="${inputName}" value="nao" required></td>
            </tr>
        `;
    });
    return rowsHTML;
}

// --- 2. FUNÇÃO DE RENDERIZAÇÃO DA TABELA ---
function renderChecklist(classe) {
    const checklistData = CHECKLIST_DATA[classe];
    
    if (!checklistData) {
        console.error(`Checklist não definido para a classe: ${classe}`);
        return; 
    }

    // Renderiza itens principais
    const checklistBody = document.getElementById('checklist-body');
    if (checklistBody) {
        checklistBody.innerHTML = generateChecklistRows(checklistData.main, 'main', classe);
    }
    
    // Renderiza itens de Terminação (Se existir)
    const terminacaoContainer = document.getElementById('terminacao-checklist-container');
    const terminacaoBody = document.getElementById('terminacao-checklist-body');

    if (checklistData.terminacao && checklistData.terminacao.length > 0) {
        if (terminacaoContainer && terminacaoBody) {
            terminacaoContainer.style.display = 'block'; // Mostra o container
            terminacaoBody.innerHTML = generateChecklistRows(checklistData.terminacao, 'term', classe);
        }
    } else {
        if (terminacaoContainer) {
            terminacaoContainer.style.display = 'none'; // Esconde o container
        }
    }
}

// --- 3. LÓGICA PRINCIPAL ---
onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'login.html';
    }
});

document.addEventListener('DOMContentLoaded', function () {
    // 1. OBTÉM ID E CLASSE
    const urlParams = new URLSearchParams(window.location.search);
    const inspecaoIdURL = urlParams.get('id');
    const classeObjeto = urlParams.get('classe').toLowerCase(); // Garante minúsculas

    // O ID final da inspeção é obtido da URL (preferencial) ou do SessionStorage (fallback)
    const finalInspectionId = inspecaoIdURL || sessionStorage.getItem('inspecaoId');

    if (!finalInspectionId || !classeObjeto) {
        alert("Erro: ID da inspeção ou Classe não encontrados. Retornando ao início.");
        window.location.href = 'identificacao.html';
        return;
    }

    // 2. RENDERIZA OS CHECKLISTS CORRETOS (Principal e Terminação)
    renderChecklist(classeObjeto);
    
    // 3. LÓGICA DO FORMULÁRIO
    const form = document.getElementById('checklistForm');

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        // COLETANDO DADOS DINÂMICOS
        const checklistItems = {};
        const formElements = form.elements;

        for (let i = 0; i < formElements.length; i++) {
            const element = formElements[i];
            
            // Procura por itens de rádio do checklist dinâmico
            if (element.type === 'radio' && element.name.startsWith('item_') && element.checked) {
                // Salva no objeto usando o nome do input como chave
                checklistItems[element.name] = element.value;
            }
        }
        
        // COLETANDO DADOS ESTÁTICOS (Comentários e Aprovação)
        const comentarios = document.querySelector('#comentarios').value;
        const aprovacaoElement = document.querySelector('input[name="approval"]:checked');

        // VALIDAÇÃO BÁSICA
        if (!aprovacaoElement) {
             alert('Por favor, selecione se o objeto está Aprovado ou Reprovado.');
             return;
        }

        // LÓGICA DE FOTOS EM BASE64 (MANTIDA INTACTA)
        const fotosInputs = [
            document.getElementById('photo1'),
            document.getElementById('photo2'),
            document.getElementById('photo3')
        ];

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
        const dadosTela3 = {
            classe: classeObjeto, 
            itens: checklistItems, // Salva o objeto de itens (chave: valor)
            comentarios: comentarios,
            aprovacao: aprovacaoElement.value,
            fotos: fotosBase64.filter(f => f !== null)
        };

        try {
            // A função finalizeInspecao no seu firebase.js deve estar configurada
            // para salvar este novo bloco de dados sob o ID da inspeção.
            await finalizarInspecao(finalInspectionId, dadosTela3);
            sessionStorage.removeItem('inspecaoId');
            alert('Inspeção finalizada com sucesso!');
            window.location.href = 'sucesso.html';
        } catch (error) {
            alert("Erro ao finalizar o cadastro. Por favor, tente novamente.");
            console.error(error);
        }
    });
});