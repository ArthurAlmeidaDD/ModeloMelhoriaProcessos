import React, { useState } from 'react';
import { ProcessImprovement, Deliverable } from '../types/process';
import { DeliverableCard } from './DeliverableCard';
import { EditableText } from './EditableText';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Plus, Rocket, Target, FileText, ListChecks, Trash2 } from 'lucide-react';
import { generateId, cn } from '../lib/utils';

interface ProjectViewProps {
    data: ProcessImprovement;
    onUpdate: (field: keyof ProcessImprovement, value: any) => void;
}

export const ProjectView: React.FC<ProjectViewProps> = ({ data, onUpdate }) => {
    
    const deliverables = data.deliverables || [];
    const requirements = data.requirements || [];
    const [newRequirement, setNewRequirement] = useState('');

    const addDeliverable = () => {
        const newDel: Deliverable = {
            id: generateId(),
            title: 'Nova Entrega',
            description: '',
            linkedStoryIds: []
        };
        onUpdate('deliverables', [...deliverables, newDel]);
    };

    const updateDeliverable = (updated: Deliverable) => {
        const newDels = deliverables.map(d => d.id === updated.id ? updated : d);
        onUpdate('deliverables', newDels);
    };

    const deleteDeliverable = (id: string) => {
        if(confirm("Excluir este entregável?")) {
            const newDels = deliverables.filter(d => d.id !== id);
            onUpdate('deliverables', newDels);
        }
    };

    const addRequirement = () => {
        if (newRequirement.trim()) {
            onUpdate('requirements', [...requirements, newRequirement.trim()]);
            setNewRequirement('');
        }
    };

    const removeRequirement = (index: number) => {
        const newReqs = requirements.filter((_, i) => i !== index);
        onUpdate('requirements', newReqs);
    };

    return (
        <div className="flex h-full bg-slate-100 overflow-hidden">
            
            {/* Sidebar (Left Panel) */}
            <aside className="w-80 bg-white border-r border-slate-200 flex flex-col h-full overflow-y-auto custom-scrollbar shrink-0">
                <div className="p-6 space-y-8">
                    
                    {/* Justificativa */}
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-slate-800 font-bold text-sm uppercase">
                            <FileText className="w-4 h-4 text-blue-600" />
                            Justificativa
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                            <EditableText 
                                value={data.justification || ''}
                                onChange={(val) => onUpdate('justification', val)}
                                placeholder="Por que este projeto é necessário?"
                                multiline
                                className="text-sm text-slate-600 min-h-[80px]"
                            />
                        </div>
                    </div>

                    {/* Objetivo */}
                    <div className="space-y-2">
                         <div className="flex items-center gap-2 text-slate-800 font-bold text-sm uppercase">
                            <Target className="w-4 h-4 text-red-500" />
                            Objetivo
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                            <EditableText 
                                value={data.objective || ''}
                                onChange={(val) => onUpdate('objective', val)}
                                placeholder="Qual o resultado esperado?"
                                multiline
                                className="text-sm text-slate-600 min-h-[80px]"
                            />
                        </div>
                    </div>

                    {/* Requisitos */}
                    <div className="flex-1 flex flex-col min-h-0">
                         <div className="flex items-center gap-2 text-slate-800 font-bold text-sm uppercase mb-2">
                            <ListChecks className="w-4 h-4 text-green-600" />
                            Requisitos Gerais
                        </div>
                        
                        <div className="space-y-2 mb-3">
                            {requirements.map((req, idx) => (
                                <div key={idx} className="group flex items-start gap-2 text-xs bg-white p-2 border border-slate-100 rounded hover:border-blue-200 shadow-sm transition-all">
                                    <div className="mt-1 w-1 h-1 rounded-full bg-slate-400 shrink-0"></div>
                                    <span className="flex-1 text-slate-600 leading-tight">{req}</span>
                                    <button 
                                        onClick={() => removeRequirement(idx)} 
                                        className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-red-500 transition-opacity"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                </div>
                            ))}
                            {requirements.length === 0 && (
                                <p className="text-xs text-slate-400 italic">Nenhum requisito adicionado.</p>
                            )}
                        </div>

                        <div className="flex gap-1">
                            <Input 
                                value={newRequirement}
                                onChange={(e) => setNewRequirement(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && addRequirement()}
                                placeholder="Novo requisito..."
                                className="h-8 text-xs"
                            />
                            <Button size="icon" onClick={addRequirement} className="h-8 w-8 shrink-0 bg-slate-800 hover:bg-slate-700">
                                <Plus size={14} />
                            </Button>
                        </div>
                    </div>
                </div>
            </aside>

            {/* Main Content (Deliverables) */}
            <main className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-slate-100/50">
                <div className="max-w-[1600px] mx-auto">
                    
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-3">
                            <div className="p-3 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-200">
                                <Rocket className="text-white w-6 h-6" />
                            </div>
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">Visão do Projeto</h2>
                                <p className="text-slate-500 text-sm">Defina os entregáveis e vincule as histórias de usuário mapeadas no processo.</p>
                            </div>
                        </div>
                        <Button onClick={addDeliverable} className="bg-indigo-600 hover:bg-indigo-700 shadow-md">
                            <Plus className="w-5 h-5 mr-2" />
                            Novo Entregável
                        </Button>
                    </div>

                    {deliverables.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-slate-300 rounded-2xl bg-white/50">
                            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                                <Rocket className="w-10 h-10 text-indigo-200" />
                            </div>
                            <h3 className="text-lg font-semibold text-slate-600 mb-1">Nenhum entregável definido</h3>
                            <p className="text-slate-400 text-sm mb-6 max-w-md text-center">Comece criando pacotes de entrega para agrupar as melhorias e histórias de usuário do seu processo.</p>
                            <Button onClick={addDeliverable} variant="outline" className="border-indigo-200 text-indigo-700 hover:bg-indigo-50">
                                Criar Primeiro Entregável
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
                            {deliverables.map(del => (
                                <DeliverableCard 
                                    key={del.id}
                                    deliverable={del}
                                    fullData={data}
                                    onUpdate={updateDeliverable}
                                    onDelete={() => deleteDeliverable(del.id)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};