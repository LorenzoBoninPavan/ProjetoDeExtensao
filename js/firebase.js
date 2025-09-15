// firebase.js
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, setDoc, addDoc, updateDoc, Timestamp } from "firebase/firestore";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

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
const storage = getStorage(app);

// Exporta o banco de dados e o storage para serem usados em outros arquivos
export { db, storage };

// --- Funções para gerenciar o cadastro em múltiplas telas ---

/**
 * Inicia um novo cadastro de inspeção, salvando os dados da primeira tela
 * e as fotos associadas, e retorna o ID do novo documento.
 * @param {object} dadosTela1 - Objeto com os dados de identificação e as fotos.
 * @returns {string} O ID do novo documento criado no Firestore.
 */
export const iniciarNovoCadastroInspecao = async (dadosTela1) => {
    try {
        const fotoInputs = dadosTela1.fotos;
        const fotoUrls = [];
        
        // Coleta todos os arquivos de todos os inputs de foto
        // O .filter(file => file) é importante para remover inputs de arquivo vazios
        const arquivosParaUpload = fotoInputs.flatMap(input => Array.from(input.files)).filter(file => file);

        if (arquivosParaUpload.length > 0) {
            for (const file of arquivosParaUpload) {
                const storageRef = ref(storage, `inspecoes/${dadosTela1.tag || 'sem_tag'}/${file.name}`);
                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);
                fotoUrls.push(url);
            }
        }

        const novaInspecaoRef = await addDoc(collection(db, "inspecoes"), {
            identificacao: {
                tag: dadosTela1.tag,
                serie: dadosTela1.serie,
                data: dadosTela1.data,
                validade: dadosTela1.validade,
                observacao: dadosTela1.observacao,
                fotos: fotoUrls.length > 0 ? fotoUrls : ['sem_foto'],
            },
            dataCriacao: Timestamp.now(),
            status: "identificacao_concluida",
        });

        console.log("Nova inspeção iniciada com sucesso! ID:", novaInspecaoRef.id);
        return novaInspecaoRef.id;
    } catch (error) {
        console.error("Erro ao iniciar nova inspeção:", error);
        throw error;
    }
};

/**
 * Salva os dados de especificação na inspeção existente.
 * @param {string} inspecaoId - O ID da inspeção a ser atualizada.
 * @param {object} dadosTela2 - Objeto com os dados de especificação.
 */
export const salvarEspecificacaoInspecao = async (inspecaoId, dadosTela2) => {
    try {
        const inspecaoDocRef = doc(db, "inspecoes", inspecaoId);
        await updateDoc(inspecaoDocRef, {
            especificacao: dadosTela2,
            status: "especificacao_concluida",
            ultimaAtualizacao: Timestamp.now(),
        });
        console.log(`Especificações salvas para inspeção ID: ${inspecaoId}`);
    } catch (error) {
        console.error(`Erro ao salvar especificações para inspeção ID: ${inspecaoId}:`, error);
        throw error;
    }
};

/**
 * Finaliza a inspeção salvando os dados do checklist e fotos finais.
 * @param {string} inspecaoId - O ID da inspeção a ser finalizada.
 * @param {object} dadosTela3 - Objeto com os dados do checklist e fotos finais.
 */
export const finalizarInspecao = async (inspecaoId, dadosTela3) => {
    try {
        const fotoInputs = dadosTela3.fotos;
        const fotoUrls = [];
        
        // Coleta todos os arquivos de todos os inputs de foto
        const arquivosParaUpload = fotoInputs.flatMap(input => Array.from(input.files)).filter(file => file);

        if (arquivosParaUpload.length > 0) {
            for (const file of arquivosParaUpload) {
                const storageRef = ref(storage, `inspecoes/${inspecaoId}/checklist/${file.name}`);
                await uploadBytes(storageRef, file);
                const url = await getDownloadURL(storageRef);
                fotoUrls.push(url);
            }
        }
        
        const inspecaoDocRef = doc(db, "inspecoes", inspecaoId);
        await updateDoc(inspecaoDocRef, {
            checklist: {
                itens: dadosTela3.itens,
                comentarios: dadosTela3.comentarios,
                fotos: fotoUrls.length > 0 ? fotoUrls : ['sem_foto'],
                aprovacao: dadosTela3.aprovacao,
            },
            status: "finalizado",
            ultimaAtualizacao: Timestamp.now(),
        });

        console.log(`Cadastro finalizado para inspeção ID: ${inspecaoId}`);
    } catch (error) {
        console.error(`Erro ao finalizar cadastro para inspeção ID: ${inspecaoId}:`, error);
        throw error;
    }
};