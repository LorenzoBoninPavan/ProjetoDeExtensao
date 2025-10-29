import { auth, onAuthStateChanged, getInspecoesByUserId, deleteInspecao } from './firebase.js';

document.addEventListener('DOMContentLoaded', () => {
    const checklistTableBody = document.getElementById('checklistTableBody');

    // Listen for authentication state changes
    onAuthStateChanged(auth, (user) => {
        if (user) {
            // User is signed in, load their inspections
            loadUserInspections(user.uid);
        } else {
            // User is signed out, clear the table
            checklistTableBody.innerHTML = '';
        }
    });

    async function loadUserInspections(userId) {
        try {
            const inspections = await getInspecoesByUserId(userId);
            checklistTableBody.innerHTML = ''; // Clear existing rows

            if (inspections.length === 0) {
                checklistTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center;">Nenhuma inspeção encontrada.</td></tr>';
                return;
            }

            inspections.forEach(inspection => {
                const row = checklistTableBody.insertRow();
                row.innerHTML = `
                    <td>${inspection.identificacao.tag || 'N/A'}</td>
                    <td>${inspection.identificacao.data || 'N/A'}</td>
                    <td>${inspection.identificacao.serie || 'N/A'}</td>
                    <td>${inspection.status || 'N/A'}</td>
                    <td>
                        <a href="identificacao.html?id=${inspection.id}"><img src="img/editar.png" alt="Editar" title="Editar"></a>
                    </td>
                    <td>
                        ${inspection.status === 'finalizado' ?
                            `<img src="img/Aprovado.png" class="status-icon" alt="Aprovado" title="Aprovado">` :
                            `<img src="img/Reprovado.png" class="status-icon" alt="Reprovado" title="Reprovado">`
                        }
                    </td>
                    <td>
                        ${inspection.status === 'finalizado' ?
                            `<img src="img/pdf.png" alt="Gerar PDF" title="Gerar PDF" onclick="openPDF('${inspection.id}')">` :
                            `<img src="img/pdf.png" class="disabled" alt="PDF Indisponível" title="PDF Indisponível">`
                        }
                    </td>
                    <td>
                        <button class="delete-button" data-id="${inspection.id}">Excluir</button>
                    </td>
                `;
            });

            // Add event listeners for delete buttons
            document.querySelectorAll('.delete-button').forEach(button => {
                button.addEventListener('click', async (e) => {
                    const inspectionId = e.target.dataset.id;
                    if (confirm('Tem certeza que deseja excluir esta inspeção?')) {
                        await deleteInspecao(inspectionId);
                        loadUserInspections(userId); // Reload inspections after deletion
                    }
                });
            });

        } catch (error) {
            console.error('Erro ao carregar inspeções:', error);
            checklistTableBody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: red;">Erro ao carregar inspeções.</td></tr>';
        }
    }

    // Global function to open PDF (placeholder for now)
    window.openPDF = (inspectionId) => {
        alert(`Gerar PDF para inspeção ID: ${inspectionId}`);
        // Here you would implement the actual PDF generation logic, 
        // possibly by fetching inspection details and generating a PDF on the fly or from a template.
    };
});

