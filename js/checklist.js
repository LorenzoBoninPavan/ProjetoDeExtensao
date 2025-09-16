// js/checklist.js
import { finalizarInspecao } from './firebase.js';
import {getAuth, onAuthStateChanged} from "firebase/auth";

//Lógica de autenticação
const auth = getAuth(app);
onAuthStateChanged(auth, (user) => {
    if (!user){
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

        // 1. Coleta os dados dos itens do checklist
        const checklistItems = [];
        for (let i = 1; i <= 8; i++) {
            const item = document.querySelector(`input[name="item${i}"]:checked`);
            checklistItems.push({
                item: i,
                resposta: item ? item.value : null
            });
        }
        
        const comentarios = document.querySelector('textarea').value;
        
        // 3. Coleta o status de aprovação
        const aprovacao = document.querySelector('input[name="approval"]:checked');

        // 4. Coleta os arquivos de foto
        const fotos = [
            document.getElementById('photo1'),
            document.getElementById('photo2'),
            document.getElementById('photo3')
        ];

        // Cria o objeto final com todos os dados coletados
        const dadosTela3 = {
            itens: checklistItems,
            comentarios: comentarios,
            aprovacao: aprovacao ? aprovacao.value : null,
            fotos: fotos
        };

        try {
            await finalizarInspecao(inspecaoId, dadosTela3);
            
            // Limpa o ID para um novo cadastro
            sessionStorage.removeItem('inspecaoId');
            
            // Redireciona para a página de sucesso
            window.location.href = 'sucesso.html'; 
        } catch (error) {
            alert("Erro ao finalizar o cadastro. Por favor, tente novamente.");
            console.error(error);
        }
    });
});