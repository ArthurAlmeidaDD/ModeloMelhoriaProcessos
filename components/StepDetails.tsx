import React, { useState } from 'react';
import { ProcessStep, UserCard, MappingNote } from '../types/process';
import { EditableText } from './EditableText';
import { UserStoryCard } from './UserStoryCard';
import { MappingCard } from './MappingCard';
import { Button } from './ui/button';
import { Plus, Layout, Users, ArrowRight, Lightbulb, FileInput, FileOutput, X, FileText, UserCircle2, Hash, NotebookPen } from 'lucide-react';
import { generateId, cn } from '../lib/utils';
import { Input } from './ui/input';

interface StepDetailsProps {
  step: ProcessStep;
  onUpdate: (updatedStep: ProcessStep) => void;
}

// Componente auxiliar para lista de Entradas/Saídas
const ListEditor: React.FC<{
    items: string[];
    onChange: (items: string[]) => void;
    placeholder: string;
    icon?: React.ReactNode;
    colorClass?: string;
    title: string;
    headerIcon: React.ReactNode;
}> = ({ items = [], onChange, placeholder, icon, colorClass = "text-slate-600", title, headerIcon }) => {
    const [newItem, setNewItem] = useState("");

    const handleAdd = () => {
        if (newItem.trim()) {
            onChange([...items, newItem.trim()]);
            setNewItem("");
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleAdd();
    };

    const handleRemove = (index: number) => {
        onChange(items.filter((_, i) => i !== index));
    };

    return (
        <div className="flex flex-col h-1/2 min-h-0">
            <div className="flex items-center gap-2 pb-2 mb-2 border-b border-slate-200">
                {headerIcon}
                <span className="text-xs font-bold uppercase text-slate-600">{title}</span>
                <span className="bg-slate-200 text-slate-600 text-[9px] px-1.5 rounded-full">{items.length}</span>
            </div>
            
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                {items.length === 0 && (
                    <div className="text-center text-[10px] text-slate-400 italic py-2">
                        Nenhum item.
                    </div>
                )}
                {items.map((item, idx) => (
                    <div key={idx} className="group flex items-start gap-2 text-xs bg-white p-2 rounded border border-slate-200 shadow-sm hover:border-blue-300 transition-colors">
                        <div className={cn("mt-0.5 shrink-0", colorClass)}>{icon}</div>
                        <span className="flex-1 text-slate-700 leading-tight break-words">{item}</span>
                        <button 
                            onClick={() => handleRemove(idx)}
                            className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                            <X size={12} />
                        </button>
                    </div>
                ))}
            </div>

            <div className="mt-2 flex gap-1 pt-2 border-t border-slate-100">
                <Input 
                    value={newItem}
                    onChange={(e) => setNewItem(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder={placeholder}
                    className="h-7 text-xs bg-white"
                />
                <Button onClick={handleAdd} size="icon" className="h-7 w-7 bg-slate-200 hover:bg-slate-300 text-slate-600">
                    <Plus size={12} />
                </Button>
            </div>
        </div>
    );
}

export const StepDetails: React.FC<StepDetailsProps> = ({ step, onUpdate }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'scenarios' | 'stories' | 'mappings'>('overview');

  const addUserCard = () => {
    const newCard: UserCard = {
      id: generateId(),
      userName: '',
      stories: []
    };
    onUpdate({ ...step, userCards: [...step.userCards, newCard] });
    setActiveTab('stories');
  };

  const updateUserCard = (index: number, updatedCard: UserCard) => {
      const newCards = [...step.userCards];
      newCards[index] = updatedCard;
      onUpdate({ ...step, userCards: newCards });
  };

  const deleteUserCard = (index: number) => {
      if(confirm("Remover usuário?")) {
          const newCards = step.userCards.filter((_, i) => i !== index);
          onUpdate({ ...step, userCards: newCards });
      }
  };

  const addMapping = () => {
      const newMapping: MappingNote = {
          id: generateId(),
          interviewee: '',
          date: new Date().toISOString().split('T')[0],
          notes: ''
      };
      const currentMappings = step.mappings || [];
      onUpdate({ ...step, mappings: [...currentMappings, newMapping] });
  };

  const updateMapping = (index: number, updatedMapping: MappingNote) => {
      const currentMappings = step.mappings || [];
      const newMappings = [...currentMappings];
      newMappings[index] = updatedMapping;
      onUpdate({ ...step, mappings: newMappings });
  };

  const deleteMapping = (index: number) => {
      if(confirm("Excluir este mapeamento?")) {
          const currentMappings = step.mappings || [];
          const newMappings = currentMappings.filter((_, i) => i !== index);
          onUpdate({ ...step, mappings: newMappings });
      }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
        {/* Tabs Bar */}
        <div className="bg-white border-b border-slate-200 px-6 flex items-center gap-6 shadow-sm z-10">
            <button
                onClick={() => setActiveTab('overview')}
                className={cn(
                    "py-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors",
                    activeTab === 'overview' 
                        ? "border-blue-600 text-blue-700" 
                        : "border-transparent text-slate-500 hover:text-slate-700"
                )}
            >
                <FileText size={16} /> Visão Geral
            </button>
            <button
                onClick={() => setActiveTab('mappings')}
                className={cn(
                    "py-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors",
                    activeTab === 'mappings' 
                        ? "border-blue-600 text-blue-700" 
                        : "border-transparent text-slate-500 hover:text-slate-700"
                )}
            >
                <NotebookPen size={16} /> 
                Mapeamentos
                <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full text-[10px]">
                    {(step.mappings || []).length}
                </span>
            </button>
            <button
                onClick={() => setActiveTab('scenarios')}
                className={cn(
                    "py-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors",
                    activeTab === 'scenarios' 
                        ? "border-blue-600 text-blue-700" 
                        : "border-transparent text-slate-500 hover:text-slate-700"
                )}
            >
                <Layout size={16} /> Cenários & Melhoria
            </button>
            <button
                onClick={() => setActiveTab('stories')}
                className={cn(
                    "py-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors",
                    activeTab === 'stories' 
                        ? "border-blue-600 text-blue-700" 
                        : "border-transparent text-slate-500 hover:text-slate-700"
                )}
            >
                <Users size={16} /> 
                Histórias de Usuário
                <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full text-[10px]">
                    {step.userCards.length}
                </span>
            </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            <div className="max-w-[1800px] mx-auto h-full">
                
                {/* OVERVIEW TAB */}
                {activeTab === 'overview' && (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-300 flex flex-col md:flex-row h-full overflow-hidden">
                        
                        {/* COLUNA 1: IDENTIFICAÇÃO */}
                        <div className="w-full md:w-72 bg-slate-50 border-b md:border-b-0 md:border-r border-slate-200 p-6 flex flex-col gap-6">
                            
                            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-2 text-slate-400">
                                    <Hash size={14} />
                                    <label className="text-[10px] uppercase font-bold">Etapa</label>
                                </div>
                                <EditableText 
                                    value={step.name} 
                                    onChange={(val) => onUpdate({...step, name: val})}
                                    placeholder="Nome da Etapa"
                                    multiline
                                    className="text-lg font-bold text-slate-800 leading-tight w-full"
                                />
                            </div>

                            <div className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm flex-1 flex flex-col">
                                <div className="flex items-center gap-2 mb-2 text-slate-400">
                                    <UserCircle2 size={14} />
                                    <label className="text-[10px] uppercase font-bold">Responsável / Setor</label>
                                </div>
                                <EditableText 
                                    value={step.role} 
                                    onChange={(val) => onUpdate({...step, role: val})}
                                    placeholder="Definir Responsável"
                                    multiline
                                    className="text-base font-semibold text-slate-700 leading-tight w-full"
                                />
                                <div className="mt-auto pt-4 border-t border-slate-50 text-xs text-slate-400 italic">
                                    Defina quem executa esta atividade.
                                </div>
                            </div>

                        </div>

                        {/* COLUNA 2: DESCRIÇÃO CENTRAL */}
                        <div className="flex-1 p-6 flex flex-col bg-white overflow-hidden">
                            <label className="text-xs font-bold uppercase text-slate-500 mb-3 flex items-center gap-2 px-1">
                                <div className="w-2 h-2 rounded-full bg-slate-800"></div>
                                Descrição do Processo Atual (AS-IS)
                            </label>
                            <div className="flex-1 relative">
                                <EditableText 
                                    value={step.currentScenario} 
                                    onChange={(val) => onUpdate({...step, currentScenario: val})}
                                    placeholder="Descreva detalhadamente como o processo é executado hoje. O que acontece? Quais são as regras de negócio?"
                                    multiline
                                    className="w-full h-full text-sm leading-relaxed text-slate-700 bg-slate-50/30 p-4 rounded-lg border border-slate-100 resize-none focus:bg-white focus:border-blue-200 transition-all absolute inset-0 overflow-y-auto custom-scrollbar"
                                />
                            </div>
                        </div>

                        {/* COLUNA 3: ENTRADAS E SAÍDAS */}
                        <div className="w-full md:w-80 bg-slate-50 border-t md:border-t-0 md:border-l border-slate-200 p-6 flex flex-col gap-6 h-full">
                            
                            {/* Entradas */}
                            <ListEditor 
                                title="Entradas (Inputs)"
                                items={step.inputs || []}
                                onChange={(items) => onUpdate({...step, inputs: items})}
                                placeholder="Adicionar entrada..."
                                icon={<ArrowRight size={10} />}
                                colorClass="text-green-600"
                                headerIcon={<FileInput size={14} className="text-green-600" />}
                            />

                            {/* Separator */}
                            <div className="border-t border-slate-200"></div>

                            {/* Saídas */}
                            <ListEditor 
                                title="Saídas (Outputs)"
                                items={step.outputs || []}
                                onChange={(items) => onUpdate({...step, outputs: items})}
                                placeholder="Adicionar saída..."
                                icon={<ArrowRight size={10} />}
                                colorClass="text-blue-600"
                                headerIcon={<FileOutput size={14} className="text-blue-600" />}
                            />
                        </div>
                    </div>
                )}

                {/* MAPPINGS TAB (NEW) */}
                {activeTab === 'mappings' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-700">Mapeamentos e Entrevistas</h3>
                            <Button onClick={addMapping} size="sm" className="bg-orange-600 hover:bg-orange-700 text-white">
                                <Plus className="w-4 h-4 mr-2" /> Novo Mapeamento
                            </Button>
                        </div>

                        {(!step.mappings || step.mappings.length === 0) ? (
                             <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-12 text-center flex flex-col items-center justify-center">
                                <div className="bg-orange-50 p-4 rounded-full mb-4">
                                    <NotebookPen className="w-8 h-8 text-orange-300" />
                                </div>
                                <h4 className="text-slate-600 font-medium mb-1">Nenhum mapeamento registrado</h4>
                                <p className="text-slate-400 text-sm mb-4">Registre entrevistas, anotações de reuniões ou observações in-loco desta etapa.</p>
                                <Button onClick={addMapping} variant="outline" size="sm" className="border-orange-200 text-orange-600 hover:bg-orange-50">Adicionar Mapeamento</Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {step.mappings.map((mapping, idx) => (
                                    <MappingCard
                                        key={mapping.id}
                                        mapping={mapping}
                                        onUpdate={(updated) => updateMapping(idx, updated)}
                                        onDelete={() => deleteMapping(idx)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* SCENARIOS TAB */}
                {activeTab === 'scenarios' && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-full">
                        
                        {/* AS IS */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full min-h-[400px] relative overflow-hidden">
                             <div className="p-3 border-b border-slate-100 bg-slate-50 rounded-t-xl flex items-center gap-2 pl-4">
                                <div className="w-2 h-2 rounded-full bg-slate-500"></div>
                                <span className="text-xs font-bold uppercase text-slate-600">Como É Hoje (AS-IS)</span>
                            </div>
                            <div className="flex-1 p-4 bg-slate-50/10">
                                <EditableText 
                                    value={step.currentScenario} 
                                    onChange={(val) => onUpdate({...step, currentScenario: val})}
                                    placeholder="Descrição do processo atual..."
                                    multiline
                                    className="h-full min-h-[300px] text-sm leading-relaxed text-slate-600"
                                />
                            </div>
                        </div>

                        {/* TO BE */}
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full min-h-[400px] relative overflow-hidden ring-1 ring-blue-100">
                             <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                             <div className="p-3 border-b border-slate-100 bg-blue-50/30 rounded-t-xl flex items-center gap-2 pl-4">
                                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                                <span className="text-xs font-bold uppercase text-blue-700">Como Será (TO-BE)</span>
                            </div>
                            <div className="flex-1 p-4 pl-5">
                                <EditableText 
                                    value={step.futureScenario} 
                                    onChange={(val) => onUpdate({...step, futureScenario: val})}
                                    placeholder="Descreva a proposta de melhoria..."
                                    multiline
                                    className="h-full min-h-[300px] text-sm leading-relaxed text-slate-700"
                                />
                            </div>
                        </div>

                         {/* COULD BE */}
                         <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full min-h-[400px] relative overflow-hidden border-dashed border-purple-200">
                             <div className="p-3 border-b border-slate-100 bg-purple-50/30 rounded-t-xl flex items-center gap-2">
                                <Lightbulb className="w-4 h-4 text-purple-600" />
                                <span className="text-xs font-bold uppercase text-purple-700">Poderia Ser (Ideal)</span>
                            </div>
                            <div className="flex-1 p-4">
                                <EditableText 
                                    value={step.idealScenario} 
                                    onChange={(val) => onUpdate({...step, idealScenario: val})}
                                    placeholder="Qual seria o cenário dos sonhos?"
                                    multiline
                                    className="h-full min-h-[300px] text-sm leading-relaxed text-purple-800/80 italic"
                                />
                            </div>
                        </div>
                    </div>
                )}

                {/* STORIES TAB */}
                {activeTab === 'stories' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-lg font-bold text-slate-700">Participantes e Requisitos</h3>
                            <Button onClick={addUserCard} size="sm" className="bg-blue-600 hover:bg-blue-700">
                                <Plus className="w-4 h-4 mr-2" /> Adicionar Usuário
                            </Button>
                        </div>

                        {step.userCards.length === 0 ? (
                            <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-12 text-center flex flex-col items-center justify-center">
                                <div className="bg-slate-50 p-4 rounded-full mb-4">
                                    <Users className="w-8 h-8 text-slate-300" />
                                </div>
                                <h4 className="text-slate-600 font-medium mb-1">Nenhum usuário mapeado nesta etapa</h4>
                                <p className="text-slate-400 text-sm mb-4">Adicione os papéis envolvidos para descrever suas necessidades.</p>
                                <Button onClick={addUserCard} variant="outline" size="sm">Adicionar Primeiro Usuário</Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                                {step.userCards.map((card, idx) => (
                                    <UserStoryCard
                                        key={card.id}
                                        card={card}
                                        onUpdate={(updated) => updateUserCard(idx, updated)}
                                        onDelete={() => deleteUserCard(idx)}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};