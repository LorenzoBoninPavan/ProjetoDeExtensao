// firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.13.2/firebase-app.js";
import { 
  getAuth, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-auth.js";
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs, 
  getDoc, 
  Timestamp 
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-firestore.js";
import { 
  getStorage, 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from "https://www.gstatic.com/firebasejs/10.13.2/firebase-storage.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBsA6D-8gW5m2im1MQhclAbstgCJFNzFqo",
  authDomain: "extensaoteste-3225e.firebaseapp.com",
  databaseURL: "https://extensaoteste-3225e-default-rtdb.firebaseio.com",
  projectId: "extensaoteste-3225e",
  storageBucket: "extensaoteste-3225e.firebasestorage.app",
  messagingSenderId: "332553633501",
  appId: "1:332553633501:web:6ccec53b5749694c14a534"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

/**
 * Converte arquivos de imagem em Base64
 */
async function converterImagensBase64(arquivos) {
  const base64List = [];
  for (const file of arquivos) {
    const reader = new FileReader();
    const base64Promise = new Promise((resolve, reject) => {
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
    });
    reader.readAsDataURL(file);
    base64List.push(await base64Promise);
  }
  return base64List;
}

/**
 * Cria nova inspeção com dados da tela de identificação
 */
export async function iniciarNovoCadastroInspecao(userId, dados) {
  try {
    const fotosInputs = dados.fotos || [];
    const arquivos = fotosInputs
      .map(input => input.files?.[0])
      .filter(file => !!file);

    const fotosBase64 = await converterImagensBase64(arquivos);

    const colRef = collection(db, "inspecoes");
    const docRef = await addDoc(colRef, {
      userId: userId,
      identificacao: {
        tag: dados.tag,
        serie: dados.serie,
        data: dados.data,
        validade: dados.validade,
        observacao: dados.observacao,
        fotos: fotosBase64
      },
      status: "em_andamento",
      criadoEm: Timestamp.now()
    });

    console.log("Inspeção criada com ID:", docRef.id);
    return docRef.id;
  } catch (error) {
    console.error("Erro ao criar inspeção:", error);
    throw error;
  }
}

/**
 * Buscar inspeção por ID
 */
export const getInspecaoById = async (inspecaoId) => {
  const docRef = doc(db, "inspecoes", inspecaoId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
};

/**
 * Salvar dados da tela de especificação
 */
export const salvarEspecificacaoInspecao = async (inspecaoId, dadosTela2) => {
  try {
    const inspecaoRef = doc(db, "inspecoes", inspecaoId);
    await updateDoc(inspecaoRef, {
      especificacao: {
        tipo: dadosTela2.tipo || '',
        fabricante: dadosTela2.fabricante || '',
        capacidade: dadosTela2.capacidade || '',
        bitola: dadosTela2.bitola || ''
      },
      status: "especificacao_concluida",
      atualizadoEm: Timestamp.now()
    });
    console.log("Especificação salva com sucesso:", inspecaoId);
  } catch (error) {
    console.error("Erro ao salvar especificação:", error);
    throw error;
  }
};

/**
 * Finalizar inspeção (checklist)
 */
export async function finalizarInspecao(id, dadosChecklist) {
  try {
    const docRef = doc(db, "inspecoes", id);
    await updateDoc(docRef, {
      checklist: dadosChecklist,
      status: "finalizada",
      finalizadoEm: Timestamp.now()
    });
    console.log("Inspeção finalizada:", id);
  } catch (error) {
    console.error("Erro ao finalizar inspeção:", error);
    throw error;
  }
}

/**
 * Buscar todas as inspeções do usuário
 */
export const getInspecoesByUserId = async (userId) => {
  const q = query(collection(db, "inspecoes"), where("userId", "==", userId));
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};

/**
 * Deletar uma inspeção (chamada no index.js)
 */
export const deleteInspecao = async (inspecaoId) => {
  try {
    const docRef = doc(db, "inspecoes", inspecaoId);
    await deleteDoc(docRef);
    console.log(`Inspeção ${inspecaoId} deletada com sucesso.`);
  } catch (error) {
    console.error("Erro ao deletar inspeção:", error);
    throw error;
  }
};

// --- Autenticação ---
export const registerUser = async (email, password) => {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await addDoc(collection(db, "users"), {
    uid: userCredential.user.uid,
    email: userCredential.user.email,
    createdAt: Timestamp.now()
  });
  return userCredential;
};

export const loginUser = async (email, password) =>
  signInWithEmailAndPassword(auth, email, password);

export const logoutUser = async () => signOut(auth);

export {
  auth,
  onAuthStateChanged,
  db,
  storage
};
