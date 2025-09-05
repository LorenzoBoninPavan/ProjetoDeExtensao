// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCzCm96EItcYNk1gDhi1m4hqpRSLA_VDW8",
  authDomain: "projetoextensao-e17d2.firebaseapp.com",
  projectId: "projetoextensao-e17d2",
  storageBucket: "projetoextensao-e17d2.firebasestorage.app",
  messagingSenderId: "232178796571",
  appId: "1:232178796571:web:74484c89a6ae5ed31d90be",
  measurementId: "G-B795YQF10P"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export { db };

const salvarInspecao = async () => {
  try {
    await db.collection("inspecoes").doc("Inspecao1").set({
      tag: "teste",
      responsavel: "Felype",
      data: new Date(),
      status: "pendente"
    });
    console.log("Inspeção salva com sucesso!");
  } catch (error) {
    console.error("Erro ao salvar inspeção:", error);
  }
};

db.collection("testeConexao").add({
  mensagem: "Firebase conectado!",
  timestamp: new Date()
})
.then(() => {
  console.log("✅ Conexão funcionando!");
})
.catch((error) => {
  console.error("❌ Erro na conexão:", error);
});
