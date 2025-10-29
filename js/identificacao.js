import { auth, onAuthStateChanged, iniciarNovoCadastroInspecao, getInspecaoById } from './firebase.js';

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
        document.getElementById('tag').value = inspection.identificacao.tag || '';
        document.getElementById('name').value = inspection.identificacao.serie || '';
        document.getElementById('date').value = inspection.identificacao.data || '';
        document.getElementById('validacao').value = inspection.identificacao.validade || '';
        document.getElementById('observacao').value = inspection.identificacao.observacao || '';
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

      const dadosTela1 = {
        tag: document.getElementById('tag').value,
        serie: document.getElementById('name').value,
        data: document.getElementById('date').value,
        validade: document.getElementById('validacao').value,
        observacao: document.getElementById('observacao').value,
        fotos: [
          document.getElementById('photo'),
          document.getElementById('photo2'),
          document.getElementById('photo3')
        ]
      };

      try {
        let inspecaoId;
        if (currentInspectionId) {
          inspecaoId = currentInspectionId;
        } else {
          inspecaoId = await iniciarNovoCadastroInspecao(currentUserId, dadosTela1);
          console.log("Nova inspeção criada:", inspecaoId);
        }

        window.location.href = `especificacao.html?id=${inspecaoId}`;
      } catch (error) {
        console.error('Erro ao salvar identificação:', error);
        alert('Erro ao salvar identificação: ' + error.message);
      }
    });
  }
});
