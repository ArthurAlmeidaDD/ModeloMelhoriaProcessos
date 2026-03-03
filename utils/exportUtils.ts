
import { ProcessImprovement, ProcessFlow, DeipItem } from "../types/process";
import { generateId } from "../lib/utils";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const STORAGE_KEY = 'process_improvement_data_v3'; // Versão atualizada do storage

export const getEmptyProcess = (): ProcessImprovement => ({
    id: generateId(),
    title: 'Novo Processo de Melhoria',
    theme: '',
    sectors: '',
    managers: '',
    startNode: { cards: [] },
    endNode: { cards: [] },
    // Inicializa com um fluxo padrão
    flows: [
        {
            id: generateId(),
            name: 'Fluxo Principal',
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
            ]
        }
    ],
    steps: [], // Deprecated, mantido vazio
    deliverables: [],
    deipItems: [],
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

    // Migração de steps soltos para flows
    if (!parsed.flows || !Array.isArray(parsed.flows)) {
        // Se tem steps antigos, move para um fluxo padrão
        if (parsed.steps && Array.isArray(parsed.steps) && parsed.steps.length > 0) {
            parsed.flows = [{
                id: generateId(),
                name: 'Fluxo Principal',
                steps: parsed.steps
            }];
        } else {
            // Se não tem nada, cria fluxo vazio
            parsed.flows = [{
                id: generateId(),
                name: 'Fluxo Principal',
                steps: []
            }];
        }
    }

    // Normalização das etapas dentro dos fluxos
    parsed.flows = parsed.flows.map((flow: ProcessFlow) => ({
        ...flow,
        steps: (flow.steps || []).map((s: any) => ({
            ...s,
            role: s.role || '',
            idealScenario: s.idealScenario || '',
            inputs: s.inputs || [],
            outputs: s.outputs || [],
            mappings: s.mappings || []
        }))
    }));

    // Limpa steps da raiz para evitar confusão futura
    parsed.steps = [];

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
    // Validação básica verificando se tem título e se flows ou steps existem
    return data && typeof data === 'object' && typeof data.title === 'string';
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

    // Aba 2: Detalhe do Processo (Iterando por fluxos)
    const detailHeader = ['Fluxo', 'Ordem', 'Etapa', 'Responsável', 'Entradas', 'Processo Atual (AS-IS)', 'Saídas', 'Cenário Futuro (TO-BE)'];
    const detailData: any[] = [];
    
    data.flows.forEach(flow => {
        flow.steps.forEach((step, i) => {
            detailData.push([
                flow.name,
                i + 1,
                step.name,
                step.role,
                step.inputs?.join('\n') || '',
                step.currentScenario,
                step.outputs?.join('\n') || '',
                step.noImprovement ? 'MANTER PROCESSO ATUAL' : step.futureScenario
            ]);
        });
    });

    const wsDetail = XLSX.utils.aoa_to_sheet([detailHeader, ...detailData]);
    XLSX.utils.book_append_sheet(wb, wsDetail, "Detalhamento de Fluxos");

    // Aba 3: Histórias de Usuário
    const storiesHeader = ['Fluxo', 'Etapa Relacionada', 'Usuário/Papel', 'Prioridade', 'História (Requisito)'];
    const storiesData: any[] = [];
    
    data.flows.forEach(flow => {
        flow.steps.forEach(step => {
            step.userCards.forEach(card => {
                card.stories.forEach(story => {
                    storiesData.push([
                        flow.name,
                        step.name || 'Etapa sem nome',
                        card.userName || 'Não especificado',
                        story.priority,
                        story.text
                    ]);
                });
            });
        });
    });

    const wsStories = XLSX.utils.aoa_to_sheet([storiesHeader, ...storiesData]);
    XLSX.utils.book_append_sheet(wb, wsStories, "Requisitos Detalhados");
    
    // Aba 4: DEIP Itens
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
    const rows: any[][] = [];
    rows.push(['Fluxo', 'Ordem', 'Responsavel', 'Etapa', 'Entradas', 'Cenario Atual', 'Saidas', 'Cenario Futuro']);

    data.flows.forEach(flow => {
        flow.steps.forEach((step, i) => {
            const stepInfo = [
                flow.name,
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
    
    // Loop Fluxos
    data.flows.forEach((flow) => {
        checkPageBreak(20);
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(15, 95, 135); // Brand color
        doc.text(`Fluxo: ${flow.name}`, margin, y);
        doc.setTextColor(0);
        y += 10;

        flow.steps.forEach((step, i) => {
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

            // Conteúdo da Etapa (inputs/outputs, AS-IS, TO-BE) - igual ao anterior
            if (type === 'complete') {
                doc.setFontSize(9);
                if (step.inputs && step.inputs.length > 0) {
                    checkPageBreak(15);
                    doc.setFont("helvetica", "bold");
                    doc.setTextColor(22, 163, 74);
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
                    doc.setTextColor(37, 99, 235);
                    doc.text("Saídas:", margin, y);
                    doc.setFont("helvetica", "normal");
                    doc.setTextColor(0);
                    const outputsText = step.outputs.join(', ');
                    const splitOutputs = doc.splitTextToSize(outputsText, maxLineWidth - 20);
                    doc.text(splitOutputs, margin + 20, y);
                    y += (splitOutputs.length * 4) + 2;
                }
                
                if ((step.inputs?.length || 0) > 0 || (step.outputs?.length || 0) > 0) {
                    y += 4;
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

        // Quebra de página entre fluxos
        doc.addPage();
        y = 20;
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

export const exportToDocumentPDF = (data: ProcessImprovement) => {
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

    // Header
    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.text(data.title.toUpperCase(), margin, y);
    y += 8;
    
    doc.setFontSize(10);
    doc.setFont("helvetica", "normal");
    
    if (data.sectors) {
        doc.setFont("helvetica", "bold");
        doc.text(`Setores: ${data.sectors}`, margin, y);
        doc.setFont("helvetica", "normal");
        y += 5;
    }

    doc.text(`Documentação de Processo | Gerado em: ${new Date().toLocaleDateString()}`, margin, y);
    y += 10;
    
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;

    const drawSectionTitle = (title: string) => {
        checkPageBreak(20);
        doc.setFillColor(240, 240, 240);
        doc.rect(margin, y - 6, maxLineWidth, 10, 'F');
        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0);
        doc.text(title.toUpperCase(), margin + 2, y);
        y += 10;
    };

    const drawDeipList = (items: DeipItem[], emptyText: string) => {
        if (!items || items.length === 0) {
            checkPageBreak(10);
            doc.setFontSize(10);
            doc.setFont("helvetica", "italic");
            doc.setTextColor(100);
            doc.text(emptyText, margin + 5, y);
            y += 8;
            return;
        }

        items.forEach(item => {
            checkPageBreak(15);
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            
            if (item.attention) {
                doc.setTextColor(220, 38, 38); // Red
                doc.text(`[!] ${item.title}`, margin + 5, y);
            } else {
                doc.setTextColor(0);
                doc.text(`• ${item.title}`, margin + 5, y);
            }
            y += 5;

            if (item.description) {
                doc.setFont("helvetica", "normal");
                doc.setTextColor(60);
                const desc = doc.splitTextToSize(item.description, maxLineWidth - 10);
                checkPageBreak(desc.length * 4);
                doc.text(desc, margin + 10, y);
                y += (desc.length * 4) + 3;
            } else {
                y += 2;
            }
        });
        y += 5;
    };

    // 1. Políticas
    drawSectionTitle("1. Políticas e Regras");
    drawDeipList(data.deipItems.filter(i => i.category === 'policies'), "Nenhuma política definida.");

    // 2. Entradas
    drawSectionTitle("2. Entradas (Inputs)");
    drawDeipList(data.deipItems.filter(i => i.category === 'inputs'), "Nenhuma entrada definida.");

    // 3. Fluxos
    drawSectionTitle("3. Fluxos do Processo");
    
    if (data.flows.length === 0) {
        doc.text("Nenhum fluxo definido.", margin + 5, y);
        y += 10;
    }

    data.flows.forEach((flow, fIndex) => {
        checkPageBreak(15);
        doc.setFontSize(11);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0);
        doc.text(`Fluxo ${fIndex + 1}: ${flow.name}`, margin + 2, y);
        y += 8;

        if (flow.steps.length === 0) {
             doc.setFont("helvetica", "italic");
             doc.setFontSize(10);
             doc.setTextColor(100);
             doc.text("Nenhuma etapa neste fluxo.", margin + 5, y);
             y += 8;
        }

        flow.steps.forEach((step, sIndex) => {
            checkPageBreak(30);
            
            // Step Header
            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");
            
            let stepTitle = `${sIndex + 1}. ${step.name}`;
            
            // Highlighted Role (Right aligned)
            if (step.role) {
                const roleText = `Responsável: ${step.role}`;
                doc.setFontSize(9);
                doc.setTextColor(0, 102, 204); // Blue highlight
                const roleWidth = doc.getTextWidth(roleText);
                doc.text(roleText, pageWidth - margin - roleWidth, y);
                doc.setFontSize(10); // Reset size
            }

            if (step.attention) {
                doc.setTextColor(220, 38, 38);
                doc.text(`[!] ${stepTitle}`, margin + 5, y);
            } else {
                doc.setTextColor(0);
                doc.text(stepTitle, margin + 5, y);
            }
            y += 5;

            // Inputs
            if (step.inputs && step.inputs.length > 0) {
                doc.setFont("helvetica", "bold");
                doc.setFontSize(8);
                doc.setTextColor(100);
                const inputsLabel = "ENTRADAS: ";
                const inputsText = step.inputs.join(', ');
                
                const labelWidth = doc.getTextWidth(inputsLabel);
                doc.text(inputsLabel, margin + 10, y);
                
                doc.setFont("helvetica", "normal");
                doc.setTextColor(50);
                const splitInputs = doc.splitTextToSize(inputsText, maxLineWidth - 10 - labelWidth - 5);
                doc.text(splitInputs, margin + 10 + labelWidth, y);
                y += (splitInputs.length * 4) + 2;
            }

            // Content - AS-IS Only
            doc.setFont("helvetica", "normal");
            doc.setFontSize(9);
            doc.setTextColor(50);

            // Removed "AS-IS: " label, just the text
            const asIsText = step.currentScenario || '-';
            const asIsLines = doc.splitTextToSize(asIsText, maxLineWidth - 15);
            checkPageBreak(asIsLines.length * 4);
            doc.text(asIsLines, margin + 10, y);
            y += (asIsLines.length * 4) + 2; 

            // Outputs
            if (step.outputs && step.outputs.length > 0) {
                doc.setFont("helvetica", "bold");
                doc.setFontSize(8);
                doc.setTextColor(100);
                const outputsLabel = "SAÍDAS: ";
                const outputsText = step.outputs.join(', ');
                
                const labelWidth = doc.getTextWidth(outputsLabel);
                doc.text(outputsLabel, margin + 10, y);
                
                doc.setFont("helvetica", "normal");
                doc.setTextColor(50);
                const splitOutputs = doc.splitTextToSize(outputsText, maxLineWidth - 10 - labelWidth - 5);
                doc.text(splitOutputs, margin + 10 + labelWidth, y);
                y += (splitOutputs.length * 4) + 2;
            }

            y += 2; // Extra spacing between steps
        });
        y += 5;
    });

    // 4. Saídas
    drawSectionTitle("4. Saídas (Outputs)");
    drawDeipList(data.deipItems.filter(i => i.category === 'outputs'), "Nenhuma saída definida.");

    // 5. Recursos
    drawSectionTitle("5. Recursos e Suporte");
    drawDeipList(data.deipItems.filter(i => i.category === 'resources'), "Nenhum recurso definido.");

    doc.save(`DOC_PROCESSO_${data.title.replace(/\s+/g, '_')}.pdf`);
};

export const exportToHTML = (data: ProcessImprovement) => {
    // Basic export update
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
