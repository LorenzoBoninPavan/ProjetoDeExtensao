// checklist.js
import { auth, onAuthStateChanged, finalizarInspecao } from './firebase.js';

onAuthStateChanged(auth, (user) => {
    if (!user) {
        window.location.href = 'login.html';
    }
});

document.addEventListener('DOMContentLoaded', function () {
    const inspecaoId = sessionStorage.getItem('inspecaoId');

    if (!inspecaoId) {
        alert("Erro: ID da inspeção não encontrado. Retornando ao início.");
        window.location.href = 'identificacao.html';
        return;
    }

    const form = document.getElementById('checklistForm');

    form.addEventListener('submit', async function (event) {
        event.preventDefault();

        // Coleta os dados dos itens
        const checklistItems = [];
        for (let i = 1; i <= 8; i++) {
            const item = document.querySelector(`input[name="item${i}"]:checked`);
            checklistItems.push({
                item: i,
                resposta: item ? item.value : null
            });
        }

        const comentarios = document.querySelector('#comentarios').value;
        const aprovacao = document.querySelector('input[name="approval"]:checked');

        const fotosInputs = [
            document.getElementById('photo1'),
            document.getElementById('photo2'),
            document.getElementById('photo3')
        ];

        // Converte as fotos em Base64
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

        const dadosTela3 = {
            itens: checklistItems,
            comentarios: comentarios,
            aprovacao: aprovacao ? aprovacao.value : null,
            fotos: fotosBase64.filter(f => f !== null)
        };

        try {
            await finalizarInspecao(inspecaoId, dadosTela3);
            sessionStorage.removeItem('inspecaoId');
            window.location.href = 'sucesso.html';
        } catch (error) {
            alert("Erro ao finalizar o cadastro. Por favor, tente novamente.");
            console.error(error);
        }
    });
});
