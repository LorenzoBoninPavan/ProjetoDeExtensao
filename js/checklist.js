// js/checklist.js
import { auth, onAuthStateChanged, finalizarInspecao } from './firebase.js';
import { CHECKLIST_DATA } from './checklist-data.js';

// Gera linhas HTML do checklist
function generateChecklistRows(questions, prefix, classe) {
    let rowsHTML = '';
    questions.forEach((question, index) => {
        const inputName = `item_${classe}_${prefix}_${index + 1}`;
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

// Renderiza checklist
function renderChecklist(classe) {
    const data = CHECKLIST_DATA[classe];
    if (!data) {
        alert("Classe inválida no checklist.");
        return;
    }

    document.getElementById('checklist-body').innerHTML =
        generateChecklistRows(data.main, "main", classe);

    const termContainer = document.getElementById('terminacao-checklist-container');
    const termBody = document.getElementById('terminacao-checklist-body');

    if (data.terminacao.length > 0) {
        termContainer.style.display = "block";
        termBody.innerHTML = generateChecklistRows(data.terminacao, "term", classe);
    } else {
        termContainer.style.display = "none";
    }
}

// Login check
onAuthStateChanged(auth, (user) => {
    if (!user) window.location.href = 'login.html';
});

// EXECUÇÃO PRINCIPAL
document.addEventListener('DOMContentLoaded', function () {
    const urlParams = new URLSearchParams(window.location.search);
    const idURL = urlParams.get('id');
    const classe = urlParams.get('classe')?.toLowerCase();

    const finalId = idURL || sessionStorage.getItem('inspecaoId');

    if (!finalId || !classe) {
        alert("Erro: ID ou classe não encontrados.");
        window.location.href = 'identificacao.html';
        return;
    }

    renderChecklist(classe);

    const form = document.getElementById('checklistForm');

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        const checklistItems = {};
        const elements = form.elements;

        for (let el of elements) {
            if (el.type === "radio" && el.name.startsWith("item_") && el.checked) {
                checklistItems[el.name] = el.value;
            }
        }

        const comentarios = document.querySelector('#comentarios').value;
        const aprovacao = document.querySelector('input[name="approval"]:checked');

        if (!aprovacao) {
            alert("Selecione Aprovado ou Reprovado.");
            return;
        }

        // Fotos do checklist
        const fotoInputs = [
            document.getElementById('photo1'),
            document.getElementById('photo2'),
            document.getElementById('photo3')
        ];

        const fotosBase64 = await Promise.all(
            fotoInputs.map(input => {
                const file = input.files[0];
                return new Promise(resolve => {
                    if (!file) return resolve(null);
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.readAsDataURL(file);
                });
            })
        );

        const dadosTela3 = {
            classe: classe,
            itens: checklistItems,
            comentarios,
            aprovacao: aprovacao.value,
            fotos: fotosBase64.filter(f => f !== null)
        };

        await finalizarInspecao(finalId, dadosTela3);
        sessionStorage.removeItem('inspecaoId');
        alert("Inspeção finalizada!");
        window.location.href = "sucesso.html";
    });
});
