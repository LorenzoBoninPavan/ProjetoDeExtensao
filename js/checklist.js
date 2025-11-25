// js/checklist.js
import { auth, onAuthStateChanged, finalizarInspecao } from './firebase.js';
import { CHECKLIST_DATA } from './checklist-data.js';

// ------------------------------
// GERA HTML DAS PERGUNTAS
// ------------------------------
function generateChecklistRows(questions, prefix, classe) {
    return questions.map((question, index) => {
        const inputName = `item_${classe}_${prefix}_${index + 1}`;
        return `
            <tr>
                <td>${question}</td>
                <td><input type="radio" name="${inputName}" value="na" required></td>
                <td><input type="radio" name="${inputName}" value="sim" required></td>
                <td><input type="radio" name="${inputName}" value="nao" required></td>
            </tr>
        `;
    }).join('');
}

// ------------------------------
// RENDERIZA CHECKLIST NA TELA
// ------------------------------
function renderChecklist(classe) {
    const data = CHECKLIST_DATA[classe];

    if (!data) {
        alert("Checklist para a classe não encontrado!");
        return;
    }

    // Checklist principal
    document.getElementById('checklist-body').innerHTML =
        generateChecklistRows(data.main, "main", classe);

    // Checklist de terminação
    const termContainer = document.getElementById('terminacao-checklist-container');
    const termBody = document.getElementById('terminacao-checklist-body');

    if (data.terminacao.length > 0) {
        termContainer.style.display = "block";
        termBody.innerHTML =
            generateChecklistRows(data.terminacao, "term", classe);
    } else {
        termContainer.style.display = "none";
    }
}

// ------------------------------
// VERIFICA LOGIN
// ------------------------------
onAuthStateChanged(auth, (user) => {
    if (!user) window.location.href = "login.html";
});

// ------------------------------
// LÓGICA PRINCIPAL DA PÁGINA
// ------------------------------
document.addEventListener("DOMContentLoaded", () => {

    // --- RECUPERA ID E CLASSE ---
    const params = new URLSearchParams(window.location.search);
    const idURL = params.get("id");
    const classe = params.get("classe")?.toLowerCase();

    const finalId = idURL || sessionStorage.getItem("inspecaoId");

    if (!finalId || !classe) {
        alert("Erro ao carregar inspeção. ID ou classe ausentes.");
        window.location.href = "identificacao.html";
        return;
    }

    // Renderiza perguntas
    renderChecklist(classe);

    // Formulário
    const form = document.getElementById("checklistForm");

    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        // ------------------------------
        // COLETAR RESPOSTAS
        // ------------------------------
        const checklistItems = {};
        const elements = form.elements;

        for (let el of elements) {
            if (el.type === "radio" && el.name.startsWith("item_") && el.checked) {
                checklistItems[el.name] = el.value;
            }
        }

        // Comentários
        const comentarios = document.getElementById("comentarios").value;

        // Aprovação
        const aprovacao = document.querySelector('input[name="approval"]:checked');
        if (!aprovacao) {
            alert("Selecione se está Aprovado ou Reprovado.");
            return;
        }

        // ------------------------------
        // FOTOS DO CHECKLIST
        // ------------------------------
        const fotosInputs = [
            document.getElementById("photo1"),
            document.getElementById("photo2"),
            document.getElementById("photo3"),
        ];

        const fotosBase64 = await Promise.all(
            fotosInputs.map((input) => {
                const file = input.files[0];
                return new Promise((resolve) => {
                    if (!file) return resolve(null);
                    const reader = new FileReader();
                    reader.onload = () => resolve(reader.result);
                    reader.onerror = () => resolve(null);
                    reader.readAsDataURL(file);
                });
            })
        );

        // ------------------------------
        // OBJETO FINAL
        // ------------------------------
        const dadosTela3 = {
            classe,
            itens: checklistItems,
            comentarios,
            aprovacao: aprovacao.value,
            fotos: fotosBase64.filter((f) => f !== null),
        };

        // ------------------------------
        // SALVAR NO FIREBASE
        // ------------------------------
        try {
            await finalizarInspecao(finalId, dadosTela3);

            // Salva o ID para gerar o PDF na próxima tela
            sessionStorage.setItem("lastInspectionId", finalId);

            // Remove ID temporário usado no fluxo
            sessionStorage.removeItem("inspecaoId");

            alert("Inspeção finalizada com sucesso!");
            window.location.href = "sucesso.html";

        } catch (error) {
            console.error("Erro ao finalizar inspeção:", error);
            alert("Erro ao finalizar. Tente novamente.");
        }

    });
});
