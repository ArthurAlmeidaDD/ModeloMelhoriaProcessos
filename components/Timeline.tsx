
import React from 'react';
import { ProcessStep } from '../types/process';
import { EditableText } from './EditableText';
import { GripVertical, Plus, Trash2, Settings2 } from 'lucide-react';
import { cn } from '../lib/utils';
import {
  DndContext, 
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  horizontalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface TimelineProps {
  steps: ProcessStep[];
  selectedStepId: string | null;
  onSelectStep: (id: string) => void;
  onUpdateSteps: (steps: ProcessStep[]) => void;
  onAddStep: () => void;
  onDeleteStep: (id: string) => void;
  className?: string;
}

interface SortableStepProps {
  step: ProcessStep;
  index: number;
  isSelected: boolean;
  onSelect: () => void;
  onUpdate: (val: string, field: 'name' | 'role') => void;
  onDelete: () => void;
}

const SortableStep: React.FC<SortableStepProps> = ({ step, index, isSelected, onSelect, onUpdate, onDelete }) => {
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
        zIndex: isDragging ? 50 : 'auto',
    };

    return (
        <div 
            ref={setNodeRef} 
            style={style}
            className="flex flex-col items-center justify-start h-full min-w-[200px] max-w-[200px] group relative pt-4"
        >
            {/* Card Superior (Role + Name) */}
            <div 
                onClick={onSelect}
                className={cn(
                    "w-[90%] h-24 p-3 rounded-xl border-2 transition-all duration-200 cursor-pointer flex flex-col gap-1 relative bg-white shadow-sm hover:shadow-md",
                    isSelected 
                        ? "border-blue-600 ring-4 ring-blue-50 -translate-y-1 z-10" 
                        : "border-slate-200 hover:border-blue-300"
                )}
            >
                {/* Drag Handle & Delete (Hover only) */}
                <div className="absolute -top-3 right-0 left-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-1 z-20">
                    <button {...attributes} {...listeners} className="bg-slate-800 text-white p-1 rounded cursor-grab active:cursor-grabbing shadow-sm hover:bg-slate-700">
                        <GripVertical size={12} />
                    </button>
                    <button 
                        onPointerDown={(e) => e.stopPropagation()} 
                        onClick={(e) => { 
                            e.stopPropagation(); 
                            onDelete(); 
                        }} 
                        className="bg-red-100 text-red-600 p-1 rounded hover:bg-red-200 shadow-sm border border-red-200 transition-colors"
                        title="Remover Etapa"
                    >
                        <Trash2 size={12} />
                    </button>
                </div>

                {/* Conteúdo do Card */}
                <div className="flex flex-col h-full overflow-hidden">
                    <div className="mb-1 shrink-0">
                        <EditableText
                            value={step.role}
                            onChange={(val) => onUpdate(val, 'role')}
                            placeholder="DEFINIR PAPEL/SETOR"
                            className="text-[10px] font-bold uppercase text-slate-500 bg-slate-50 px-1 rounded w-full text-center"
                        />
                    </div>
                    <div className="flex-1 flex items-center justify-center text-center">
                        <EditableText
                            value={step.name}
                            onChange={(val) => onUpdate(val, 'name')}
                            placeholder="Nome da Etapa"
                            className={cn(
                                "text-xs font-bold leading-tight w-full text-center",
                                isSelected ? "text-blue-900" : "text-slate-700"
                            )}
                        />
                    </div>
                </div>

                {/* Seta indicativa se selecionado */}
                {isSelected && (
                    <div className="absolute left-1/2 -bottom-2.5 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-blue-600"></div>
                )}
            </div>

            {/* Linha e Conector */}
            <div className="h-12 w-full flex flex-col items-center justify-center relative shrink-0">
                <div className={cn(
                    "w-full h-1 absolute top-1/2 -translate-y-1/2",
                    isSelected ? "bg-blue-200" : "bg-slate-200"
                )}></div>
                <div className={cn(
                    "w-6 h-6 rounded-full border-4 z-10 flex items-center justify-center text-[10px] font-bold transition-all",
                    isSelected 
                        ? "bg-blue-600 border-white ring-2 ring-blue-200 text-white scale-110" 
                        : "bg-white border-slate-300 text-slate-400"
                )}>
                    {index + 1}
                </div>
            </div>
        </div>
    );
}

export const Timeline: React.FC<TimelineProps> = ({ steps, selectedStepId, onSelectStep, onUpdateSteps, onAddStep, onDeleteStep, className }) => {
    
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleDragEnd = (event: DragEndEvent) => {
        const { active, over } = event;
        if (over && active.id !== over.id) {
            const oldIndex = steps.findIndex((s) => s.id === active.id);
            const newIndex = steps.findIndex((s) => s.id === over.id);
            onUpdateSteps(arrayMove(steps, oldIndex, newIndex));
        }
    };

    const handleUpdateStep = (id: string, val: string, field: 'name' | 'role') => {
        const newSteps = steps.map(s => s.id === id ? { ...s, [field]: val } : s);
        onUpdateSteps(newSteps);
    };

    return (
        <div className={cn(
            "flex-shrink-0 bg-white border-b border-slate-200 h-[220px] relative flex flex-col",
            className
        )}>
            <div className="absolute top-0 left-0 bg-slate-50 px-3 py-1 rounded-br-lg text-[10px] font-bold text-slate-400 border-b border-r border-slate-200 z-20 flex items-center gap-1">
                <Settings2 size={12} /> TIMELINE DO PROCESSO
            </div>

            <div className="flex-1 overflow-x-auto custom-scrollbar flex px-8 relative">
                <div className="flex items-start h-full pt-8 pb-4 min-w-max mx-auto">
                    
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={steps.map(s => s.id)} strategy={horizontalListSortingStrategy}>
                            {steps.map((step, index) => (
                                <SortableStep
                                    key={step.id}
                                    step={step}
                                    index={index}
                                    isSelected={selectedStepId === step.id}
                                    onSelect={() => onSelectStep(step.id)}
                                    onUpdate={(val, field) => handleUpdateStep(step.id, val, field)}
                                    onDelete={() => onDeleteStep(step.id)}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                            
                    {/* Add Button Area - Aligned */}
                    <div className="flex flex-col items-center justify-start h-full min-w-[80px] pt-4 relative">
                        {/* Spacer */}
                        <div className="h-24 w-full"></div>
                        
                        {/* Connector Area */}
                        <div className="h-12 w-full flex items-center justify-center relative shrink-0">
                             {/* Line pass through */}
                             <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-slate-200"></div>
                             
                             <button 
                                onClick={onAddStep}
                                className="w-8 h-8 rounded-full bg-white border-2 border-dashed border-slate-300 text-slate-400 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-all relative z-10"
                                title="Adicionar Etapa"
                            >
                                <Plus size={16} />
                            </button>
                        </div>
                        <div className="mt-1 text-[9px] font-bold uppercase text-slate-300">Add</div>
                    </div>

                </div>
            </div>
        </div>
    );
};
