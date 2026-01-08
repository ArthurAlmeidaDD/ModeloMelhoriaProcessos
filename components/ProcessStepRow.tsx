import React, { useState } from 'react';
import { ProcessStep, UserCard } from '../types/process';
import { EditableText } from './EditableText';
import { UserStoryCard } from './UserStoryCard';
import { Button } from './ui/button';
import { GripVertical, Trash2, Plus, ChevronDown, ChevronRight, CheckCircle2, Circle, Users } from 'lucide-react';
import { generateId, cn } from '../lib/utils';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface ProcessStepRowProps {
  step: ProcessStep;
  index: number;
  onUpdate: (updatedStep: ProcessStep) => void;
  onDelete: () => void;
}

export const ProcessStepRow: React.FC<ProcessStepRowProps> = ({ step, index, onUpdate, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: step.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
  };

  const addUserCard = () => {
    const newCard: UserCard = {
      id: generateId(),
      userName: '',
      stories: []
    };
    onUpdate({ ...step, userCards: [...step.userCards, newCard] });
    setIsExpanded(true);
  };

  const updateUserCard = (cardIndex: number, updatedCard: UserCard) => {
    const newCards = [...step.userCards];
    newCards[cardIndex] = updatedCard;
    onUpdate({ ...step, userCards: newCards });
  };

  const removeUserCard = (cardIndex: number) => {
     if (confirm('Remover este card de usuário?')) {
        const newCards = step.userCards.filter((_, i) => i !== cardIndex);
        onUpdate({ ...step, userCards: newCards });
     }
  };

  const toggleNoImprovement = () => {
    onUpdate({...step, noImprovement: !step.noImprovement});
  }

  const userCount = step.userCards.length;

  return (
    <div 
      ref={setNodeRef} 
      style={style} 
      className={cn(
        "group relative bg-white border rounded-xl shadow-sm transition-all overflow-hidden",
        step.noImprovement ? "bg-slate-50 border-slate-200" : "border-slate-200 hover:border-blue-300",
        isDragging && "shadow-xl ring-2 ring-blue-500 rotate-1 opacity-90 z-50",
      )}
    >
      {/* Main Row Grid */}
      <div className="grid grid-cols-12 gap-4 p-4 items-start">
        
        {/* Col 1: Drag & Chevron & Number (Span 3 on mobile, 3 on desktop usually but we want tight) */}
        <div className="col-span-12 md:col-span-3 lg:col-span-3 flex items-start gap-3">
             <div className="flex items-center gap-1 mt-1">
                 <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="p-1 hover:bg-slate-100 rounded text-slate-400"
                    disabled={step.noImprovement}
                 >
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                 </button>
                 <button {...attributes} {...listeners} className="cursor-grab hover:text-blue-600 text-slate-300 active:cursor-grabbing">
                    <GripVertical className="w-4 h-4" />
                 </button>
             </div>
             
             <div className={cn(
                 "w-8 h-8 flex items-center justify-center rounded text-white font-bold text-sm shrink-0 mt-0.5",
                 step.noImprovement ? "bg-slate-200 text-slate-500" : "bg-[#0F5F87]"
             )}>
                 {index + 1}
             </div>

             <div className="flex-1 min-w-0 pt-1">
                 <EditableText 
                    value={step.name} 
                    onChange={(val) => onUpdate({...step, name: val})}
                    placeholder="Nome da Etapa" 
                    className={cn(
                        "font-semibold text-slate-800 text-base w-full",
                        step.noImprovement && "text-slate-400 line-through decoration-slate-300"
                    )}
                />
                {!step.noImprovement && (
                    <div className="mt-2 flex items-center text-xs text-slate-400 gap-1.5">
                        <Users className="w-3 h-3" />
                        {userCount} usuário(s)
                    </div>
                )}
             </div>
        </div>

        {/* Col 2: As Is */}
        <div className="col-span-12 md:col-span-4 lg:col-span-4 pt-1">
            <span className="md:hidden text-[10px] uppercase font-bold text-slate-400 mb-1 block">Como é Hoje</span>
            {step.noImprovement ? (
                 <div className="text-slate-300 italic flex items-center gap-2 text-sm">
                    <span className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px]">🚫</span>
                    Sem alteração
                 </div>
            ) : (
                <EditableText 
                    value={step.currentScenario} 
                    onChange={(val) => onUpdate({...step, currentScenario: val})}
                    placeholder="Descreva o processo atual..."
                    multiline
                    className="text-slate-600 text-sm leading-relaxed"
                />
            )}
        </div>

        {/* Col 3: To Be */}
        <div className="col-span-12 md:col-span-4 lg:col-span-4 pt-1">
             <span className="md:hidden text-[10px] uppercase font-bold text-slate-400 mb-1 block">Como Será</span>
             {step.noImprovement ? (
                 <div className="text-slate-300 italic flex items-center gap-2 text-sm">
                    <span className="w-4 h-4 rounded-full border border-slate-300 flex items-center justify-center text-[10px]">🚫</span>
                    Sem alteração
                 </div>
            ) : (
                <EditableText 
                    value={step.futureScenario} 
                    onChange={(val) => onUpdate({...step, futureScenario: val})}
                    placeholder="Descreva a melhoria proposta..."
                    multiline
                    className="text-slate-600 text-sm leading-relaxed"
                />
            )}
        </div>

        {/* Col 4: Actions */}
        <div className="col-span-12 md:col-span-1 lg:col-span-1 flex items-center justify-end md:justify-center gap-2 pt-1">
            <button 
                onClick={toggleNoImprovement}
                title={step.noImprovement ? "Marcar com melhoria" : "Marcar sem melhoria"}
                className={cn(
                    "transition-colors",
                    step.noImprovement ? "text-[#0F5F87]" : "text-slate-300 hover:text-slate-400"
                )}
            >
                {step.noImprovement ? <CheckCircle2 className="w-6 h-6" /> : <Circle className="w-6 h-6" />}
            </button>
            <Button variant="ghost" size="icon" onClick={onDelete} className="text-slate-300 hover:text-red-500 hover:bg-red-50 h-8 w-8">
                <Trash2 className="w-4 h-4" />
            </Button>
        </div>

      </div>

      {/* Expanded Content: User Stories */}
      {isExpanded && !step.noImprovement && (
        <div className="border-t border-slate-100 bg-slate-50/50 p-4 animate-in slide-in-from-top-2 duration-200">
             {/* Dashed Connector */}
            <div className="w-full border-t border-dashed border-slate-200 mb-4" />
            
            <div className="flex items-center justify-between mb-4">
                 <h4 className="text-sm font-semibold text-slate-600">Histórias de Usuário</h4>
                 <Button variant="outline" size="sm" onClick={addUserCard} className="bg-white text-xs h-7 border-slate-300 text-slate-600">
                    <Plus className="w-3 h-3 mr-1" /> Adicionar Usuário
                </Button>
            </div>

            {step.userCards.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {step.userCards.map((card, idx) => (
                        <UserStoryCard 
                            key={card.id}
                            card={card}
                            onUpdate={(updated) => updateUserCard(idx, updated)}
                            onDelete={() => removeUserCard(idx)}
                        />
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-slate-400 text-sm italic border-2 border-dashed border-slate-200 rounded-lg">
                    Nenhuma história de usuário registrada.
                </div>
            )}
        </div>
      )}
    </div>
  );
};