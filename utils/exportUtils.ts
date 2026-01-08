
import { ProcessImprovement } from "../types/process";
import { generateId } from "../lib/utils";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const STORAGE_KEY = 'process_improvement_data_v1';

export const getEmptyProcess = (): ProcessImprovement => ({
    id: generateId(),
    title: 'Novo Processo de Melhoria',
    theme: '',
    sectors: '',
    managers: '',
    steps: [],
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
        if (data) return JSON.parse(data);
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
        ['Tema', data.theme],
        ['Setores', data.sectors],
        ['Gestores', data.managers],
        ['Última Atualização', new Date(data.updatedAt).toLocaleString()]
    ];
    const wsInfo = XLSX.utils.aoa_to_sheet(infoData);
    XLSX.utils.book_append_sheet(wb, wsInfo, "Resumo");

    // Aba 2: Etapas e Cenários
    const stepsHeader = ['Ordem', 'Etapa', 'Cenário Atual (AS-IS)', 'Cenário Futuro (TO-BE)', 'Status'];
    const stepsData = data.steps.map((step, i) => [
        i + 1,
        step.name,
        step.currentScenario,
        step.noImprovement ? 'MANTER PROCESSO ATUAL' : step.futureScenario,
        step.noImprovement ? 'Sem Alteração' : 'Com Melhoria'
    ]);
    const wsSteps = XLSX.utils.aoa_to_sheet([stepsHeader, ...stepsData]);
    XLSX.utils.book_append_sheet(wb, wsSteps, "Fluxo de Processo");

    // Aba 3: Histórias de Usuário (Requisitos)
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

    XLSX.writeFile(wb, `RELATORIO_${data.title.replace(/\s+/g, '_')}.xlsx`);
};

export const exportToCSV = (data: ProcessImprovement) => {
    const rows: any[][] = [];
    rows.push(['Ordem', 'Etapa', 'Cenario Atual', 'Cenario Futuro', 'Status', 'Usuario', 'Prioridade', 'Historia']);

    data.steps.forEach((step, i) => {
        const stepInfo = [
            i + 1,
            step.name,
            step.currentScenario,
            step.noImprovement ? 'MANTER PROCESSO ATUAL' : step.futureScenario,
            step.noImprovement ? 'Sem Alteração' : 'Com Melhoria'
        ];

        if (step.userCards.length === 0) {
            rows.push([...stepInfo, '', '', '']);
        } else {
            step.userCards.forEach(card => {
                if (card.stories.length === 0) {
                    rows.push([...stepInfo, card.userName, '', '']);
                } else {
                    card.stories.forEach(story => {
                        rows.push([...stepInfo, card.userName, story.priority, story.text]);
                    });
                }
            });
        }
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
    // Estimativa de altura para criar uma única página contínua
    // Base Header: 60mm
    // Por Step: ~40mm + texto variável
    let estimatedHeight = 80; 
    
    data.steps.forEach(step => {
        estimatedHeight += 25; // Header da etapa
        const scenarioLines = Math.max(
            (step.currentScenario?.length || 0) / 90, 
            (step.futureScenario?.length || 0) / 90
        );
        estimatedHeight += Math.ceil(scenarioLines) * 7 + 20;

        if (!step.noImprovement && step.userCards.length > 0) {
            estimatedHeight += 15; // Título histórias
            step.userCards.forEach(card => {
                estimatedHeight += 10; // Nome usuário
                estimatedHeight += card.stories.length * 8; // Histórias
            });
        }
        estimatedHeight += 10; // Padding bottom
    });

    // Garante no mínimo A4 (297mm)
    const finalHeight = Math.max(estimatedHeight, 297);
    
    // Inicializa PDF com tamanho customizado [largura A4, altura calculada]
    const doc = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: [210, finalHeight]
    });

    const primaryColor = [15, 95, 135]; // #0F5F87

    // Cabeçalho PDF
    doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
    doc.rect(0, 0, 210, 40, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text((data.title || 'PROJETO DE MELHORIA').toUpperCase(), 14, 25);
    
    doc.setFontSize(10);
    doc.text(`Gerado em: ${new Date().toLocaleDateString()}`, 14, 34);

    // Info Section
    doc.setTextColor(40, 40, 40);
    doc.setFontSize(12);
    doc.setFont("helvetica", "bold");
    doc.text("INFORMAÇÕES GERAIS", 14, 50);
    doc.setDrawColor(200, 200, 200);
    doc.line(14, 52, 196, 52);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.text(`TEMA: ${data.theme || 'N/A'}`, 14, 60);
    doc.text(`SETORES: ${data.sectors || 'N/A'}`, 14, 66);
    doc.text(`GESTORES: ${data.managers || 'N/A'}`, 14, 72);

    let currentY = 85;

    // Renderização manual para controle total do layout "single page"
    doc.setFontSize(14);
    doc.setFont("helvetica", "bold");
    doc.text("ETAPAS DO PROCESSO", 14, currentY);
    currentY += 10;

    data.steps.forEach((step, index) => {
        // Step Container Visual
        doc.setDrawColor(220, 220, 220);
        doc.setFillColor(step.noImprovement ? 248 : 255, step.noImprovement ? 250 : 255, step.noImprovement ? 252 : 255);
        
        // Salva Y inicial da etapa
        const stepStartY = currentY;

        // Número e Título
        doc.setFillColor(step.noImprovement ? 200 : primaryColor[0], step.noImprovement ? 200 : primaryColor[1], step.noImprovement ? 200 : primaryColor[2]);
        doc.circle(18, currentY + 3, 4, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(9);
        doc.text((index + 1).toString(), 18, currentY + 4, { align: 'center' });

        doc.setTextColor(60, 60, 60);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.text(step.name || `Etapa ${index + 1}`, 26, currentY + 4);
        
        currentY += 12;

        // Cenários Grid (Esquerda e Direita)
        const colWidth = 85;
        const leftX = 14;
        const rightX = 110;

        doc.setFontSize(8);
        doc.setTextColor(150, 150, 150);
        doc.setFont("helvetica", "bold");
        doc.text("COMO É HOJE", leftX, currentY);
        doc.text("COMO SERÁ", rightX, currentY);
        currentY += 5;

        doc.setFontSize(10);
        doc.setTextColor(40, 40, 40);
        doc.setFont("helvetica", "normal");

        const splitCurrent = doc.splitTextToSize(step.currentScenario || '-', colWidth);
        const splitFuture = doc.splitTextToSize(step.noImprovement ? "Sem alteração" : (step.futureScenario || '-'), colWidth);

        const linesHeight = Math.max(splitCurrent.length, splitFuture.length) * 5;
        
        doc.text(splitCurrent, leftX, currentY);
        if (step.noImprovement) doc.setTextColor(150, 150, 150);
        doc.text(splitFuture, rightX, currentY);
        doc.setTextColor(40, 40, 40);

        currentY += linesHeight + 8;

        // Histórias
        if (!step.noImprovement && step.userCards.length > 0) {
             doc.setFontSize(9);
             doc.setFont("helvetica", "bold");
             doc.setTextColor(100, 100, 100);
             doc.text("HISTÓRIAS DE USUÁRIO", 14, currentY);
             currentY += 6;

             step.userCards.forEach(card => {
                 doc.setFontSize(9);
                 doc.setFont("helvetica", "bold");
                 doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
                 doc.text(card.userName || 'Usuário', 14, currentY);
                 currentY += 5;

                 card.stories.forEach(story => {
                     doc.setFont("helvetica", "normal");
                     doc.setTextColor(80, 80, 80);
                     const prefix = `[${story.priority}] `;
                     const storyText = `${prefix}${story.text}`;
                     const splitStory = doc.splitTextToSize(storyText, 180);
                     doc.text(splitStory, 20, currentY);
                     currentY += (splitStory.length * 5) + 2;
                 });
                 currentY += 2;
             });
        }
        
        // Linha divisória suave entre etapas
        doc.setDrawColor(230, 230, 230);
        doc.line(14, currentY, 196, currentY);
        currentY += 10;
    });

    doc.save(`PDF_${data.title.replace(/\s+/g, '_')}.pdf`);
};

export const exportToHTML = (data: ProcessImprovement) => {
    const htmlContent = `
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${data.title} - Visualização</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body { font-family: 'Inter', sans-serif; }
    </style>
</head>
<body class="bg-slate-50 text-slate-900 p-4 md:p-8">
    <div class="max-w-5xl mx-auto space-y-8">
        <!-- Header -->
        <div class="bg-[#0F5F87] p-6 rounded-xl shadow-lg text-white">
            <h1 class="text-3xl font-bold uppercase mb-2">${data.title}</h1>
            <p class="opacity-80 text-sm">Gerado em ${new Date().toLocaleDateString()}</p>
        </div>

        <!-- Info Grid -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <p class="text-xs font-bold text-[#0F5F87] uppercase mb-1">Tema</p>
                <p class="text-lg font-medium">${data.theme || '-'}</p>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <p class="text-xs font-bold text-[#0F5F87] uppercase mb-1">Setores</p>
                <p class="text-lg font-medium">${data.sectors || '-'}</p>
            </div>
            <div class="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                <p class="text-xs font-bold text-[#0F5F87] uppercase mb-1">Gestores</p>
                <p class="text-lg font-medium">${data.managers || '-'}</p>
            </div>
        </div>

        <!-- Steps -->
        <div class="space-y-6">
            <h2 class="text-xl font-bold text-slate-800 flex items-center gap-2">Etapas do Processo</h2>
            ${data.steps.map((step, index) => `
                <div class="bg-white border ${step.noImprovement ? 'border-slate-200 bg-slate-50' : 'border-slate-200'} rounded-xl shadow-sm overflow-hidden">
                    <div class="p-6">
                        <div class="flex items-start gap-4 mb-6">
                            <div class="w-8 h-8 flex items-center justify-center rounded ${step.noImprovement ? 'bg-slate-200 text-slate-500' : 'bg-[#0F5F87] text-white'} font-bold shrink-0">
                                ${index + 1}
                            </div>
                            <div class="flex-1">
                                <h3 class="text-xl font-bold text-slate-800 ${step.noImprovement ? 'line-through text-slate-400' : ''}">${step.name}</h3>
                            </div>
                        </div>

                        <div class="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <div>
                                <p class="text-xs font-bold text-slate-400 uppercase mb-2">Como é Hoje</p>
                                <div class="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">${step.currentScenario || '-'}</div>
                            </div>
                            <div>
                                <p class="text-xs font-bold text-slate-400 uppercase mb-2">Como Será</p>
                                <div class="text-sm text-slate-600 whitespace-pre-wrap leading-relaxed">${step.noImprovement ? '<span class="italic text-slate-400">Sem alteração</span>' : (step.futureScenario || '-')}</div>
                            </div>
                        </div>

                        ${!step.noImprovement && step.userCards.length > 0 ? `
                            <div class="mt-8 pt-6 border-t border-slate-100">
                                <h4 class="text-sm font-bold text-slate-500 mb-4">Histórias de Usuário</h4>
                                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    ${step.userCards.map(card => `
                                        <div class="bg-slate-50 rounded-lg p-4 border border-slate-200">
                                            <div class="font-bold text-slate-700 text-sm mb-3 flex items-center gap-2">
                                                <div class="w-2 h-2 rounded-full bg-[#0F5F87]"></div>
                                                ${card.userName}
                                            </div>
                                            <ul class="space-y-2">
                                                ${card.stories.map(story => `
                                                    <li class="text-sm text-slate-600 pl-4 border-l-2 ${
                                                        story.priority === 'Essencial' ? 'border-red-200' : 
                                                        story.priority === 'Deveria ter' ? 'border-yellow-200' : 'border-slate-200'
                                                    }">
                                                        <span class="text-[10px] px-1.5 py-0.5 rounded border uppercase font-bold mr-2 ${
                                                            story.priority === 'Essencial' ? 'bg-red-50 text-red-600 border-red-100' : 
                                                            story.priority === 'Deveria ter' ? 'bg-yellow-50 text-yellow-600 border-yellow-100' : 'bg-slate-100 text-slate-500 border-slate-200'
                                                        }">${story.priority}</span>
                                                        ${story.text}
                                                    </li>
                                                `).join('')}
                                            </ul>
                                        </div>
                                    `).join('')}
                                </div>
                            </div>
                        ` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
        
        <div class="text-center text-slate-400 text-xs mt-12 pb-8 border-t pt-8">
            <p>Gerado via ProcessFlow</p>
            <p class="mt-1 opacity-60">Visualização somente leitura</p>
        </div>
    </div>
</body>
</html>
    `;
    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `VISUALIZACAO_${data.title.replace(/\s+/g, '_')}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
