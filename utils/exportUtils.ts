
import { ProcessImprovement } from "../types/process";
import { generateId } from "../lib/utils";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const STORAGE_KEY = 'process_improvement_data_v2'; // Versão atualizada do storage

export const getEmptyProcess = (): ProcessImprovement => ({
    id: generateId(),
    title: 'Novo Processo de Melhoria',
    theme: '',
    sectors: '',
    managers: '',
    startNode: { cards: [] },
    endNode: { cards: [] },
    steps: [
        {
            id: generateId(),
            name: 'Início do Processo',
            role: 'Solicitante',
            currentScenario: '',
            futureScenario: '',
            idealScenario: '',
            inputs: [],
            outputs: [],
            noImprovement: false,
            userCards: [],
            mappings: []
        }
    ],
    deliverables: [],
    deipItems: [], // New DEIP items list
    justification: '',
    objective: '',
    requirements: [],
    processRules: [],
    risks: [],
    updatedAt: new Date().toISOString()
});

export const saveToLocalStorage = (data: ProcessImprovement) => {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
        console.error('Erro ao salvar no cache local', e);
    }
};

export const ensureCompatibleData = (data: any): ProcessImprovement => {
    if (!data) return getEmptyProcess();
    const parsed = { ...data };

    // Migração para garantir que campos novos existam
    if (!parsed.steps) parsed.steps = [];
    parsed.steps = parsed.steps.map((s: any) => ({
        ...s,
        role: s.role || '',
        idealScenario: s.idealScenario || '',
        inputs: s.inputs || [],
        outputs: s.outputs || [],
        mappings: s.mappings || []
    }));
    // Migração para deliverables e campos de projeto
    if (!parsed.deliverables) parsed.deliverables = [];
    if (!parsed.justification) parsed.justification = '';
    if (!parsed.objective) parsed.objective = '';
    if (!parsed.requirements) parsed.requirements = [];
    if (!parsed.processRules) parsed.processRules = [];
    if (!parsed.risks) parsed.risks = [];
    
    // Migração para Nodes de Inicio/Fim
    if (!parsed.startNode) parsed.startNode = { cards: [] };
    if (!parsed.endNode) parsed.endNode = { cards: [] };

    // Migração DEIP
    if (!parsed.deipItems) parsed.deipItems = [];

    return parsed as ProcessImprovement;
};

export const loadFromLocalStorage = (): ProcessImprovement => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            return ensureCompatibleData(JSON.parse(data));
        }
    } catch (e) {
        console.error('Erro ao carregar do cache local', e);
    }
    return getEmptyProcess();
};

export const exportToJson = (data: ProcessImprovement) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `PROJETO_${data.title.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const validateProcessJson = (data: any): data is ProcessImprovement => {
    return data && typeof data === 'object' && Array.isArray(data.steps) && typeof data.title === 'string';
};

export const exportToXLSX = (data: ProcessImprovement) => {
    const wb = XLSX.utils.book_new();

    // Aba 1: Resumo do Projeto
    const infoData = [
        ['RESUMO DO PROJETO DE MELHORIA'],
        [''],
        ['Título', data.title],
        ['Setores', data.sectors],
        ['Gestores', data.managers],
        [''],
        ['Justificativa', data.justification || ''],
        ['Objetivo', data.objective || ''],
        [''],
        ['Requisitos Gerais'],
        ...(data.requirements || []).map(r => [r]),
        [''],
        ['Regras de Negócio'],
        ...(data.processRules || []).map(r => [r]),
        [''],
        ['Riscos Detectados'],
        ...(data.risks || []).map(r => [r]),
        [''],
        ['Última Atualização', new Date(data.updatedAt).toLocaleString()]
    ];
    const wsInfo = XLSX.utils.aoa_to_sheet(infoData);
    XLSX.utils.book_append_sheet(wb, wsInfo, "Resumo");

    // Aba 2: Fronteiras (Início e Fim)
    const boundariesHeader = ['Fase', 'Item', 'Descrição'];
    const boundariesData: any[] = [];
    
    // Pré-Operacional
    if (data.startNode && data.startNode.cards) {
        data.startNode.cards.forEach(c => {
            boundariesData.push(['PRÉ-OPERACIONAL (INÍCIO)', c.title, c.text]);
        });
    }
    
    // Pós-Operacional
    if (data.endNode && data.endNode.cards) {
        data.endNode.cards.forEach(c => {
            boundariesData.push(['PÓS-OPERACIONAL (FIM)', c.title, c.text]);
        });
    }

    if (boundariesData.length > 0) {
        const wsBoundaries = XLSX.utils.aoa_to_sheet([boundariesHeader, ...boundariesData]);
        XLSX.utils.book_append_sheet(wb, wsBoundaries, "Limites do Processo");
    }

    // Aba 3: Detalhe do Processo (Visão Geral)
    const detailHeader = ['Ordem', 'Etapa', 'Responsável', 'Entradas', 'Processo Atual (AS-IS)', 'Saídas'];
    const detailData = data.steps.map((step, i) => [
        i + 1,
        step.name,
        step.role,
        step.inputs?.join('\n') || '',
        step.currentScenario,
        step.outputs?.join('\n') || ''
    ]);
    const wsDetail = XLSX.utils.aoa_to_sheet([detailHeader, ...detailData]);
    XLSX.utils.book_append_sheet(wb, wsDetail, "Mapeamento Atual");

    // Aba 4: Cenários Futuros
    const stepsHeader = ['Ordem', 'Etapa', 'Cenário Atual (AS-IS)', 'Cenário Futuro (TO-BE)', 'Cenário Ideal (COULD-BE)'];
    const stepsData = data.steps.map((step, i) => [
        i + 1,
        step.name,
        step.currentScenario,
        step.noImprovement ? 'MANTER PROCESSO ATUAL' : step.futureScenario,
        step.idealScenario
    ]);
    const wsSteps = XLSX.utils.aoa_to_sheet([stepsHeader, ...stepsData]);
    XLSX.utils.book_append_sheet(wb, wsSteps, "Melhorias Propostas");

    // Aba 5: Histórias de Usuário
    const storiesHeader = ['Etapa Relacionada', 'Usuário/Papel', 'Prioridade', 'História (Requisito)'];
    const storiesData: any[] = [];
    data.steps.forEach(step => {
        step.userCards.forEach(card => {
            card.stories.forEach(story => {
                storiesData.push([
                    step.name || 'Etapa sem nome',
                    card.userName || 'Não especificado',
                    story.priority,
                    story.text
                ]);
            });
        });
    });
    const wsStories = XLSX.utils.aoa_to_sheet([storiesHeader, ...storiesData]);
    XLSX.utils.book_append_sheet(wb, wsStories, "Requisitos Detalhados");
    
    // Aba 6: DEIP Itens
    if (data.deipItems && data.deipItems.length > 0) {
        const deipHeader = ['Categoria', 'Título', 'Descrição', 'Atenção'];
        const deipData = data.deipItems.map(d => [
            d.category,
            d.title,
            d.description,
            d.attention ? 'SIM' : 'NÃO'
        ]);
        const wsDeip = XLSX.utils.aoa_to_sheet([deipHeader, ...deipData]);
        XLSX.utils.book_append_sheet(wb, wsDeip, "DEIP - Escopo e Interface");
    }

    XLSX.writeFile(wb, `RELATORIO_${data.title.replace(/\s+/g, '_')}.xlsx`);
};

export const exportToCSV = (data: ProcessImprovement) => {
    // Basic CSV export only for steps for now
    const rows: any[][] = [];
    rows.push(['Ordem', 'Responsavel', 'Etapa', 'Entradas', 'Cenario Atual', 'Saidas', 'Cenario Futuro']);

    data.steps.forEach((step, i) => {
        const stepInfo = [
            i + 1,
            step.role,
            step.name,
            step.inputs?.join('; ') || '',
            step.currentScenario,
            step.outputs?.join('; ') || '',
            step.noImprovement ? 'MANTER PROCESSO ATUAL' : step.futureScenario
        ];
        rows.push(stepInfo);
    });

    const csvContent = rows.map(r => r.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `RELATORIO_${data.title.replace(/\s+/g, '_')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportToPDF = (data: ProcessImprovement, type: 'simple' | 'complete' = 'simple') => {
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    const margin = 14;
    const pageWidth = 210;
    const maxLineWidth = pageWidth - (margin * 2);
    let y = 20;

    const checkPageBreak = (heightNeeded: number) => {
        if (y + heightNeeded > 280) {
            doc.addPage();
            y = 20;
            return true;
        }
        return false;
    };

    // Header do Documento
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(data.title.toUpperCase(), margin, y);
    y += 8;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    doc.text(`Setores: ${data.sectors}`, margin, y);
    y += 5;
    doc.text(`Gestores: ${data.managers}`, margin, y);
    y += 5;
    
    // Tipo de Relatório
    doc.setFontSize(8);
    doc.setTextColor(100);
    doc.text(`Relatório: ${type === 'complete' ? 'Completo (Detalhado)' : 'Resumido (Cenários e Histórias)'} | Gerado em: ${new Date().toLocaleDateString()}`, margin, y);
    doc.setTextColor(0);
    y += 10;
    
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;
    
    // NOTE: For PDF export, sticking to the standard structure for now. 
    // DEIP items could be added here in future iterations.

    // Loop Etapas
    data.steps.forEach((step, i) => {
        checkPageBreak(50); // Check inicial generoso para cabeçalho da etapa

        // Etapa Header
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, y - 6, maxLineWidth, 10, 'F');
        doc.setTextColor(0);
        doc.text(`${i + 1}. ${step.name}`, margin + 2, y);
        
        // Responsável
        doc.setFontSize(10);
        doc.setFont("helvetica", "italic");
        doc.setTextColor(80);
        const roleText = step.role ? `Responsável: ${step.role}` : 'Responsável não definido';
        const roleWidth = doc.getTextWidth(roleText);
        doc.text(roleText, pageWidth - margin - roleWidth - 2, y);
        doc.setTextColor(0);
        
        y += 10;

        // Entradas e Saídas (Apenas modo Complete)
        if (type === 'complete') {
            doc.setFontSize(9);
            if (step.inputs && step.inputs.length > 0) {
                checkPageBreak(15);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(22, 163, 74); // Green
                doc.text("Entradas:", margin, y);
                doc.setFont("helvetica", "normal");
                doc.setTextColor(0);
                const inputsText = step.inputs.join(', ');
                const splitInputs = doc.splitTextToSize(inputsText, maxLineWidth - 20);
                doc.text(splitInputs, margin + 20, y);
                y += (splitInputs.length * 4) + 2;
            }

            if (step.outputs && step.outputs.length > 0) {
                checkPageBreak(15);
                doc.setFont("helvetica", "bold");
                doc.setTextColor(37, 99, 235); // Blue
                doc.text("Saídas:", margin, y);
                doc.setFont("helvetica", "normal");
                doc.setTextColor(0);
                const outputsText = step.outputs.join(', ');
                const splitOutputs = doc.splitTextToSize(outputsText, maxLineWidth - 20);
                doc.text(splitOutputs, margin + 20, y);
                y += (splitOutputs.length * 4) + 2;
            }
            
            if ((step.inputs?.length || 0) > 0 || (step.outputs?.length || 0) > 0) {
                y += 4; // Spacer extra se houve inputs/outputs
            }
        }

        // Cenário Atual (AS-IS)
        checkPageBreak(20);
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Como é Hoje (AS-IS):", margin, y);
        y += 5;
        doc.setFont("helvetica", "normal");
        const asIsText = step.currentScenario || '-';
        const splitAsIs = doc.splitTextToSize(asIsText, maxLineWidth);
        checkPageBreak(splitAsIs.length * 5);
        doc.text(splitAsIs, margin, y);
        y += (splitAsIs.length * 5) + 6;

        // Cenário Futuro (TO-BE)
        checkPageBreak(20);
        doc.setFont("helvetica", "bold");
        doc.text("Como Será (TO-BE):", margin, y);
        y += 5;
        doc.setFont("helvetica", "normal");
        
        let toBeText = step.futureScenario || '-';
        if (step.noImprovement) toBeText = "MANTER O PROCESSO ATUAL (SEM MELHORIAS).";
        
        const splitToBe = doc.splitTextToSize(toBeText, maxLineWidth);
        checkPageBreak(splitToBe.length * 5);
        doc.text(splitToBe, margin, y);
        y += (splitToBe.length * 5) + 8;

        // Separador de Etapa
        y += 5;
        doc.setDrawColor(200);
        doc.line(margin, y, pageWidth - margin, y);
        doc.setDrawColor(0);
        y += 10;
    });
    
    // Adiciona numeração de páginas
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Página ${i} de ${pageCount}`, pageWidth / 2, 290, { align: 'center' });
    }
    
    doc.save(`PDF_${type.toUpperCase()}_${data.title.replace(/\s+/g, '_')}.pdf`);
};

export const exportToHTML = (data: ProcessImprovement) => {
    const htmlContent = `
    <html>
        <head><title>${data.title}</title></head>
        <body>
            <h1>${data.title}</h1>
            <p>Exportação HTML simplificada. Use o webapp para visualização completa.</p>
        </body>
    </html>`;
    
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VISUALIZACAO_${data.title.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
