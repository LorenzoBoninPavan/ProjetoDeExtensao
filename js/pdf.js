// js/pdf.js
import { getInspecaoById } from './firebase.js';

// caminho local da imagem enviada (fornecido pelo dev). Eles vão transformar esse path em URL.
// Se quiser usar, mantenha; senão fica apenas como fallback.
const SAMPLE_IMAGE_PATH = '/mnt/data/6efa9918-c5c3-4c33-9717-3eb9654cc9cd.png';

/**
 * Converte uma URL (ou dataURL) para dataURL (base64) para uso no jsPDF.
 */
async function urlToDataUrl(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Imagem não encontrada');
    const blob = await res.blob();
    return await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (e) {
    console.warn('Falha ao converter imagem:', e);
    return null;
  }
}

/**
 * Gera PDF da inspeção (client-side)
 * - id: id do documento no Firestore
 */
export async function generatePdfFromInspection(id) {
  try {
    const inspection = await getInspecaoById(id);
    if (!inspection) throw new Error('Inspeção não encontrada: ' + id);

    // acessa jsPDF via global (adicionado pelo script UMD)
    const { jsPDF: JsPDF } = window.jspdf;
    const doc = new JsPDF('landscape', 'pt', 'a4'); // unidades em pontos

    // medidas e posicoes básicas
    const pageWidth = doc.internal.pageSize.getWidth();
    const margin = 36;
    let y = margin;

    // --- Cabeçalho ---
    // opcional: inserir logo (se existir)
    const tryLogo = await urlToDataUrl(SAMPLE_IMAGE_PATH).catch(() => null);
    const logoW = 80;
    const logoH = 50;
    if (tryLogo) {
      doc.addImage(tryLogo, 'PNG', margin, y, logoW, logoH);
    }
    // título central
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Registro de Inspeção', pageWidth / 2, y + 18, { align: 'center' });

    // data (da identificação)
    const dataText = inspection.identificacao?.data || '';
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Data: ${dataText}`, pageWidth - margin, y + 10, { align: 'right' });

    y += 70;

    // --- Caixa: Especificação (esquerda) e Identificação (direita) ---
    const boxW = (pageWidth - margin * 2 - 20) / 2;
    const boxH = 110;
    const leftX = margin;
    const rightX = margin + boxW + 20;

    // retângulos
    doc.setDrawColor(0);
    doc.rect(leftX, y, boxW, boxH);   // Especificação
    doc.rect(rightX, y, boxW, boxH);  // Identificação

    // titles
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Especificação', leftX + 8, y + 16);
    doc.text('Identificação', rightX + 8, y + 16);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    // preencher Especificação (usa o objeto inspection.especificacao)
    const esp = inspection.especificacao || {};
    const specLines = [
      ['Tipo', esp.tipoCinta || esp.tipoCabo || esp.tipoManilha || esp.classe || ''],
      ['Fabricante', esp.fabricanteCinta || esp.fabricanteCabo || esp.fabricanteManilha || ''],
      ['Capacidade', esp.capacidadeCinta || esp.capacidadeCabo || esp.capacidadeManilha || ''],
      ['Comprimento/Bitola', esp.comprimentoCinta || esp.comprimentoCabo || esp.diametroCabo || esp.bitola || '']
    ];
    let lineY = y + 36;
    specLines.forEach(([label, value]) => {
      doc.text(`${label}:`, leftX + 8, lineY);
      doc.text(String(value || ''), leftX + 130, lineY);
      lineY += 16;
    });

    // preencher Identificação (inspection.identificacao)
    const idf = inspection.identificacao || {};
    const idLines = [
      ['Tag Aplicada', idf.tag || ''],
      ['Nº de Série', idf.serie || ''],
      ['Data da Inspeção', idf.data || ''],
      ['Validade', idf.validade || ''],
      ['Observação', idf.observacao || '']
    ];
    lineY = y + 36;
    idLines.forEach(([label, value]) => {
      doc.text(`${label}:`, rightX + 8, lineY);
      // quebra simples se muito longo
      const tx = doc.splitTextToSize(String(value || ''), boxW - 140);
      doc.text(tx, rightX + 130, lineY);
      lineY += 16 * (tx.length);
    });

    y += boxH + 10;

    // --- Fotos (duas lado a lado) ---
    const photos = (inspection.identificacao?.fotos || inspection.fotos || []).slice(0, 2);
    const photoW = 200;
    const photoH = 120;
    const photoX1 = margin;
    const photoX2 = margin + photoW + 20;
    if (photos.length > 0) {
      for (let i = 0; i < photos.length; i++) {
        const p = photos[i];
        // p pode ser dataURL ou URL no Firebase
        const dataUrl = p.startsWith('data:') ? p : await urlToDataUrl(p).catch(() => null);
        if (dataUrl) {
          const x = i === 0 ? photoX1 : photoX2;
          doc.addImage(dataUrl, 'JPEG', x, y, photoW, photoH);
        } else {
          // caixa vazia com label
          const x = i === 0 ? photoX1 : photoX2;
          doc.rect(x, y, photoW, photoH);
          doc.text('Foto não disponível', x + photoW/2, y + photoH/2, { align: 'center' });
        }
      }
    } else {
      // se não houver fotos, desenha duas caixas vazias com labels
      doc.rect(photoX1, y, photoW, photoH);
      doc.text('Foto 1', photoX1 + photoW/2, y + photoH/2, { align: 'center' });
      doc.rect(photoX2, y, photoW, photoH);
      doc.text('Foto 2', photoX2 + photoW/2, y + photoH/2, { align: 'center' });
    }

    y += photoH + 18;

    // --- Tabela de Itens / Perguntas (usa as chaves como "pergunta", conforme pedido B) ---
    const itensObj = inspection.itens || {};
    const rows = Object.keys(itensObj).map(key => {
      return [key, String(itensObj[key] ?? '')];
    });

    if (rows.length === 0) {
      // fallback: se não tiver "itens", tenta pegar checklist ou perguntas em outro lugar
      doc.text('Nenhum item encontrado para o checklist.', margin, y);
      y += 18;
    } else {
      // montar tabela com autoTable
      doc.autoTable({
        startY: y,
        margin: { left: margin, right: margin },
        head: [['Pergunta', 'Resposta']],
        body: rows,
        styles: { fontSize: 10, cellPadding: 6 },
        headStyles: { fillColor: [200, 200, 200] },
        columnStyles: {
          0: { cellWidth: 300 }, // pergunta (chave)
          1: { cellWidth: 200 }  // resposta
        },
        theme: 'grid'
      });
      y = doc.lastAutoTable.finalY + 12;
    }

    // --- Assinaturas (três caixas) ---
    const assinaturas = inspection.assinaturas || {}; // caso tenha
    const signW = 150;
    const signH = 60;
    const gap = 30;
    const totalWidth = signW * 3 + gap * 2;
    let startX = (pageWidth - totalWidth) / 2;
    const signY = doc.internal.pageSize.getHeight() - margin - signH - 10;

    // desenha três caixas e tenta inserir imagens se existirem
    const signKeys = ['assinatura1', 'assinatura2', 'assinatura3'];
    for (let i = 0; i < 3; i++) {
      const key = signKeys[i];
      const x = startX + i * (signW + gap);
      doc.rect(x, signY, signW, signH);
      const signUrl = assinaturas[key] || assinaturas[`ass${i+1}`] || null;
      if (signUrl) {
        const dataUrl = signUrl.startsWith('data:') ? signUrl : await urlToDataUrl(signUrl).catch(()=>null);
        if (dataUrl) {
          doc.addImage(dataUrl, 'PNG', x + 8, signY + 8, signW - 16, signH - 16);
        } else {
          doc.text('Assinatura', x + signW/2, signY + signH/2, { align: 'center' });
        }
      } else {
        doc.text(`Assinatura ${i+1}`, x + signW/2, signY + signH/2, { align: 'center' });
      }
    }

    // finaliza e salva
    doc.save(`inspecao_${id}.pdf`);
    return true;
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw error;
  }
}
