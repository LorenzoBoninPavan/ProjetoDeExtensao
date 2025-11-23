// js/pdf.js
import { getInspecaoById } from './firebase.js';
import { CHECKLIST_DATA } from './checklist-data.js'; // já criado anteriormente

// Caminho do logotipo (conforme confirmado)
const LOGO_URL = '/img/Logotipo.jpg';

// Converte URL (ou dataURL) para dataURL (base64)
async function urlToDataUrl(url) {
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('Imagem não encontrada: ' + url);
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

function getImageFormatFromDataUrl(dataUrl) {
  if (!dataUrl) return 'JPEG';
  if (dataUrl.startsWith('data:image/png')) return 'PNG';
  if (dataUrl.startsWith('data:image/jpeg') || dataUrl.startsWith('data:image/jpg')) return 'JPEG';
  return 'JPEG';
}

/**
 * Gera PDF da inspeção (client-side)
 * - id: id do documento no Firestore
 */
export async function generatePdfFromInspection(id) {
  try {
    const inspection = await getInspecaoById(id);
    if (!inspection) throw new Error('Inspeção não encontrada: ' + id);

    const { jsPDF: JsPDF } = window.jspdf;
    const doc = new JsPDF('landscape', 'pt', 'a4');

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 36;

    // Espaço reservado para assinaturas (altura fixa)
    const signW = 150;
    const signH = 60;
    const signGap = 30;
    const signatureReserveHeight = signH + 40; // espaço que o conteúdo não deve ocupar (inclui margem)

    // Estado de posição vertical corrente
    let currentY = 0;

    // Adiciona cabeçalho (logo + título + data) — chama também em novas páginas
    async function drawHeader() {
      // Se for a primeira página, não chamar addPage.
      // Limpa/define y inicial baseado no cabeçalho
      const logoData = await urlToDataUrl(LOGO_URL).catch(() => null);
      const logoW = 90;
      const logoH = 55;
      const headerTop = 20;

      if (logoData) {
        const fmt = getImageFormatFromDataUrl(logoData);
        try { doc.addImage(logoData, fmt, margin, headerTop, logoW, logoH); } catch (e) { /* ignora */ }
      }

      // Título central
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Registro de Inspeção', pageWidth / 2, headerTop + 25, { align: 'center' });

      // Data à direita (pega do objeto)
      const dataText = inspection.identificacao?.data || '';
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Data: ${dataText}`, pageWidth - margin, headerTop + 10, { align: 'right' });

      // Define currentY após cabeçalho para começar conteúdo
      currentY = headerTop + 70;
    }

    // Adiciona nova página e redesenha cabeçalho
    async function addNewPage() {
      doc.addPage();
      await drawHeader();
    }

    // Verifica se há espaço suficiente; se não houver, cria nova página
    async function ensureSpace(requiredHeight) {
      const usableHeight = pageHeight - margin - signatureReserveHeight;
      if (currentY + requiredHeight > usableHeight) {
        await addNewPage();
      }
    }

    // Inicia primeira página com cabeçalho
    await drawHeader();

    // ------------------------
    // ESPECIFICAÇÃO E IDENTIFICAÇÃO
    // ------------------------
    const boxW = (pageWidth - margin * 2 - 20) / 2;
    const boxH = 110;
    const leftX = margin;
    const rightX = margin + boxW + 20;

    // Garantir espaço para caixas
    await ensureSpace(boxH + 10);

    doc.setDrawColor(0);
    doc.rect(leftX, currentY, boxW, boxH);   // Especificação
    doc.rect(rightX, currentY, boxW, boxH);  // Identificação

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Especificação', leftX + 8, currentY + 16);
    doc.text('Identificação', rightX + 8, currentY + 16);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    const esp = inspection.especificacao || {};
    const specLines = [
      ['Tipo', esp.tipoCinta || esp.tipoCabo || esp.tipoManilha || esp.classe || ''],
      ['Fabricante', esp.fabricanteCinta || esp.fabricanteCabo || esp.fabricanteManilha || ''],
      ['Capacidade', esp.capacidadeCinta || esp.capacidadeCabo || esp.capacidadeManilha || ''],
      ['Comprimento/Bitola', esp.comprimentoCinta || esp.comprimentoCabo || esp.diametroCabo || esp.bitola || '']
    ];

    let lineY = currentY + 36;
    specLines.forEach(([label, value]) => {
      doc.text(`${label}:`, leftX + 8, lineY);
      doc.text(String(value || ''), leftX + 130, lineY);
      lineY += 16;
    });

    const idf = inspection.identificacao || {};
    const idLines = [
      ['Tag Aplicada', idf.tag || ''],
      ['Nº de Série', idf.serie || ''],
      ['Data da Inspeção', idf.data || ''],
      ['Validade', idf.validade || ''],
      ['Observação', idf.observacao || '']
    ];

    lineY = currentY + 36;
    idLines.forEach(([label, value]) => {
      doc.text(`${label}:`, rightX + 8, lineY);
      const tx = doc.splitTextToSize(String(value || ''), boxW - 140);
      doc.text(tx, rightX + 130, lineY);
      lineY += 16 * tx.length;
    });

    currentY += boxH + 18;

    // ------------------------
    // FOTOS PRINCIPAIS (2 lado a lado quando couber)
    // ------------------------
    const photos = (inspection.identificacao?.fotos || inspection.fotos || []).slice(0, 2);
    // Definir largura máxima por foto baseada no espaço horizontal disponível
    const maxPhotoCols = 2;
    const gutter = 20;
    const colWidth = Math.min(250, (pageWidth - margin * 2 - gutter) / maxPhotoCols); // limita largura
    const photoHMax = 140;

    // garantir espaço para as fotos
    await ensureSpace(photoHMax + 10);

    if (photos.length > 0) {
      for (let i = 0; i < maxPhotoCols; i++) {
        const x = margin + i * (colWidth + gutter);
        if (i < photos.length) {
          const p = photos[i];
          const dataUrl = p.startsWith('data:') ? p : await urlToDataUrl(p).catch(() => null);
          if (dataUrl) {
            const img = new Image();
            img.src = dataUrl;
            // calcular escala mantendo proporção
            await new Promise(resolve => {
              img.onload = () => {
                const ratio = img.width / img.height || 1;
                let w = colWidth;
                let h = w / ratio;
                if (h > photoHMax) {
                  h = photoHMax;
                  w = h * ratio;
                }
                const fmt = getImageFormatFromDataUrl(dataUrl);
                try { doc.addImage(dataUrl, fmt, x, currentY, w, h); } catch (e) { /* ignora */ }
                resolve();
              };
              img.onerror = () => resolve();
            });
          } else {
            // caixa vazia
            doc.rect(x, currentY, colWidth, photoHMax);
            doc.text('Foto não disponível', x + colWidth / 2, currentY + photoHMax / 2, { align: 'center' });
          }
        } else {
          doc.rect(x, currentY, colWidth, photoHMax);
          doc.text(`Foto ${i + 1}`, x + colWidth / 2, currentY + photoHMax / 2, { align: 'center' });
        }
      }
    } else {
      // caixas vazias
      for (let i = 0; i < maxPhotoCols; i++) {
        const x = margin + i * (colWidth + gutter);
        doc.rect(x, currentY, colWidth, photoHMax);
        doc.text(`Foto ${i + 1}`, x + colWidth / 2, currentY + photoHMax / 2, { align: 'center' });
      }
    }

    currentY += photoHMax + 18;

    // ------------------------
    // TABELA CHECKLIST (usando autoTable com margem inferior reservada para assinaturas)
    // ------------------------
    // Preparar perguntas + respostas com base em CHECKLIST_DATA
    const classe = inspection.checklist?.classe || inspection.especificacao?.classe || null;
    const respostas = inspection.checklist?.itens || {};
    const perguntasRows = [];

    if (classe && CHECKLIST_DATA[classe]) {
      // main
      CHECKLIST_DATA[classe].main.forEach((p, idx) => {
        const key = `item_${classe}_main_${idx + 1}`;
        perguntasRows.push([p, String(respostas[key] ?? '')]);
      });
      // terminacao (se existir)
      if (Array.isArray(CHECKLIST_DATA[classe].terminacao) && CHECKLIST_DATA[classe].terminacao.length > 0) {
        CHECKLIST_DATA[classe].terminacao.forEach((p, idx) => {
          const key = `item_${classe}_term_${idx + 1}`;
          perguntasRows.push([p, String(respostas[key] ?? '')]);
        });
      }
    } else {
      // fallback se não houver classe
      Object.keys(respostas).forEach(k => perguntasRows.push([k, String(respostas[k])]));
    }

    if (perguntasRows.length === 0) {
      doc.text('Nenhum item encontrado para o checklist.', margin, currentY);
      currentY += 18;
    } else {
      // autoTable: reservar espaço inferior para assinaturas, para não desenhar a tabela sobre as assinaturas
      // definimos margin.bottom = signatureReserveHeight para que a tabela interrompa antes do rodapé
      doc.autoTable({
        startY: currentY,
        margin: { left: margin, right: margin, bottom: signatureReserveHeight },
        head: [['Pergunta', 'Resposta']],
        body: perguntasRows,
        styles: { fontSize: 10, cellPadding: 6, overflow: 'linebreak' },
        headStyles: { fillColor: [220, 220, 220] },
        columnStyles: { 0: { cellWidth: pageWidth * 0.65 }, 1: { cellWidth: pageWidth * 0.2 } },
        theme: 'grid',
        // Ajuste: o autoTable gerencia paginação automaticamente respeitando margin.bottom
      });

      // Atualiza currentY para posição final da tabela (ou início do próximo bloco)
      currentY = doc.lastAutoTable.finalY + 12;
    }

    // ------------------------
    // FOTOS DO CHECKLIST (ex: 3 fotos)
    // ------------------------
    const fotosChecklist = inspection.checklist?.fotos || [];

    if (fotosChecklist.length > 0) {
      // Antes de adicionar fotos, garantir que exista espaço suficiente (cada linha de fotos 160px)
      const fotoRowHeight = 160;
      await ensureSpace(20 + fotoRowHeight); // título + 1 linha de fotos

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(14);
      doc.text('Fotos do Checklist:', margin, currentY);
      currentY += 18;

      // Tentamos colocar 3 fotos por linha se couber
      const maxCols = 3;
      const spacing = 16;
      const availableWidth = pageWidth - margin * 2;
      const colW = (availableWidth - spacing * (maxCols - 1)) / maxCols;
      let x = margin;
      let rowHeightUsed = 0;

      for (let i = 0; i < fotosChecklist.length; i++) {
        const f = fotosChecklist[i];
        const dataUrl = f.startsWith('data:') ? f : await urlToDataUrl(f).catch(() => null);

        // Se não houver espaço horizontal para mais fotos, quebra de linha automática
        if ((i % maxCols) === 0) {
          // check espaço vertical para nova linha de fotos
          await ensureSpace(rowHeightUsed + 160);
          x = margin;
        }

        if (dataUrl) {
          // calcular proporção usando Image
          await new Promise(resolve => {
            const img = new Image();
            img.src = dataUrl;
            img.onload = () => {
              const ratio = img.width / img.height || 1;
              let w = colW;
              let h = w / ratio;
              if (h > 140) { h = 140; w = h * ratio; }
              const fmt = getImageFormatFromDataUrl(dataUrl);
              try { doc.addImage(dataUrl, fmt, x, currentY, w, h); } catch (e) { /* ignora */ }
              if (h > rowHeightUsed) rowHeightUsed = h;
              resolve();
            };
            img.onerror = () => resolve();
          });
        } else {
          doc.rect(x, currentY, colW, 140);
        }

        x += colW + spacing;
        // se terminou uma linha (ou ultima foto), avança currentY
        if ((i % maxCols) === (maxCols - 1) || i === fotosChecklist.length - 1) {
          currentY += (rowHeightUsed || 140) + 12;
          rowHeightUsed = 0;
        }
      }
    }

    // ------------------------
    // ASSINATURAS (sempre na parte inferior da última página)
    // ------------------------
    // Verifica se existe espaço restante na página atual para colocar as assinaturas no rodapé.
    // Se não couber, cria nova página e desenha o header novamente.
    const neededForSignatures = signH + 20;
    const usableHeightNow = pageHeight - margin;
    if (currentY + neededForSignatures > usableHeightNow) {
      await addNewPage();
      // currentY já definido pelo header
    }

    // Calcular posição das assinaturas na página atual (rodapé)
    const totalSignWidth = signW * 3 + signGap * 2;
    const startX = (pageWidth - totalSignWidth) / 2;
    const signY = pageHeight - margin - signH - 10;

    const assinaturas = inspection.assinaturas || {};
    const signKeys = ['assinatura1', 'assinatura2', 'assinatura3'];

    for (let i = 0; i < 3; i++) {
      const key = signKeys[i];
      const x = startX + i * (signW + signGap);
      doc.rect(x, signY, signW, signH);

      const signUrl = assinaturas[key] || assinaturas[`ass${i + 1}`] || null;
      if (signUrl) {
        const dataUrl = signUrl.startsWith('data:') ? signUrl : await urlToDataUrl(signUrl).catch(() => null);
        if (dataUrl) {
          try {
            const fmt = getImageFormatFromDataUrl(dataUrl);
            doc.addImage(dataUrl, fmt, x + 8, signY + 8, signW - 16, signH - 16);
          } catch (e) {
            // caso não consiga inserir imagem, escreve texto
            doc.setFontSize(10);
            doc.text(`Assinatura ${i + 1}`, x + signW / 2, signY + signH / 2, { align: 'center' });
          }
        } else {
          doc.setFontSize(10);
          doc.text(`Assinatura ${i + 1}`, x + signW / 2, signY + signH / 2, { align: 'center' });
        }
      } else {
        doc.setFontSize(10);
        doc.text(`Assinatura ${i + 1}`, x + signW / 2, signY + signH / 2, { align: 'center' });
      }
    }

    // salva o PDF
    doc.save(`inspecao_${id}.pdf`);
    return true;
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw error;
  }
}
