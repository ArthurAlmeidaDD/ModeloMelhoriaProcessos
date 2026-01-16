
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

export const loadFromLocalStorage = (): ProcessImprovement => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (data) {
            const parsed = JSON.parse(data);
            // Migração para garantir que campos novos existam
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
            
            return parsed;
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

    // Aba 2: Detalhe do Processo (Visão Geral)
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

    // Aba 3: Cenários Futuros
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

    // Aba 4: Histórias de Usuário
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
    
    // Aba 5: Entregáveis (Novo)
    if (data.deliverables && data.deliverables.length > 0) {
        const delivHeader = ['Entregável', 'Descrição', 'Qtd Histórias'];
        const delivData = data.deliverables.map(d => [
            d.title,
            d.description,
            d.linkedStoryIds.length
        ]);
        const wsDeliv = XLSX.utils.aoa_to_sheet([delivHeader, ...delivData]);
        XLSX.utils.book_append_sheet(wb, wsDeliv, "Entregáveis do Projeto");
    }

    XLSX.writeFile(wb, `RELATORIO_${data.title.replace(/\s+/g, '_')}.xlsx`);
};

export const exportToCSV = (data: ProcessImprovement) => {
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

export const exportToPDF = (data: ProcessImprovement) => {
    const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
    
    doc.setFontSize(16);
    doc.text(data.title, 14, 20);
    
    doc.setFontSize(10);
    doc.text(`Setores: ${data.sectors}`, 14, 30);
    doc.text(`Gestores: ${data.managers}`, 14, 35);
    
    let y = 45;
    
    data.steps.forEach((step, i) => {
        if (y > 250) { doc.addPage(); y = 20; }
        
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(`${i + 1}. ${step.name} (${step.role})`, 14, y);
        y += 7;
        
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("Processo Atual:", 14, y);
        doc.setFont("helvetica", "normal");
        const splitCurrent = doc.splitTextToSize(step.currentScenario || '-', 180);
        doc.text(splitCurrent, 14, y + 5);
        y += (splitCurrent.length * 5) + 8;
        
        if (step.inputs && step.inputs.length > 0) {
            doc.setFont("helvetica", "bold");
            doc.text(`Entradas: ${step.inputs.join(', ')}`, 14, y);
            y += 6;
        }

        if (step.outputs && step.outputs.length > 0) {
            doc.setFont("helvetica", "bold");
            doc.text(`Saídas: ${step.outputs.join(', ')}`, 14, y);
            y += 6;
        }

        y += 5;
        doc.line(14, y, 196, y);
        y += 10;
    });
    
    doc.save(`PDF_${data.title.replace(/\s+/g, '_')}.pdf`);
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
