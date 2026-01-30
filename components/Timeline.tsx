
import React, { useState } from 'react';
import { ProcessStep } from '../types/process';
import { EditableText } from './EditableText';
import { GripVertical, Plus, Trash2, Settings2, ZoomIn, ZoomOut, AlertCircle } from 'lucide-react';
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
  scale: number;
  onSelect: () => void;
  onUpdate: (val: string, field: 'name' | 'role') => void;
  onToggleAttention: () => void;
  onDelete: () => void;
}

const SortableStep: React.FC<SortableStepProps> = ({ step, index, isSelected, scale, onSelect, onUpdate, onToggleAttention, onDelete }) => {
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

    // Calculate dimensions based on scale
    const width = 240 * scale;
    const height = 128 * scale;
    const padding = 16 * scale;
    const gap = 8 * scale;
    const borderSize = Math.max(1, 2 * scale);

    // Font sizes
    const roleFontSize = 10 * scale;
    const nameFontSize = 14 * scale;
    const numberSize = 32 * scale;
    const numberFontSize = 12 * scale;
    const numberBorderSize = Math.max(2, 4 * scale);
    const lineHeight = Math.max(2, 4 * scale); // Connector line thickness

    return (
        <div 
            ref={setNodeRef} 
            style={{
                ...style,
                minWidth: `${width}px`,
                maxWidth: `${width}px`
            }}
            className="flex flex-col items-center justify-center h-full group relative transition-all duration-200"
        >
            {/* Wrapper Relativo para o Card e os Botões Flutuantes */}
            <div 
                className={cn(
                    "w-[90%] relative transition-all duration-200",
                    isSelected && "-translate-y-2 z-10"
                )}
                style={{ height: `${height}px` }}
            >
                {/* 1. Botões de Ação (Floating Outside - Ajustado top para -top-10 para dar mais ar) */}
                <div className="absolute -top-9 right-0 left-0 flex justify-center opacity-0 group-hover:opacity-100 transition-opacity gap-1 z-30 pointer-events-auto">
                    <button {...attributes} {...listeners} className="bg-slate-800 text-white p-1 rounded cursor-grab active:cursor-grabbing shadow-sm hover:bg-slate-700">
                        <GripVertical size={12} />
                    </button>
                    <button 
                        onPointerDown={(e) => e.stopPropagation()}
                        onClick={(e) => { e.stopPropagation(); onToggleAttention(); }}
                        className={cn(
                            "p-1 rounded shadow-sm border transition-colors",
                            step.attention 
                                ? "bg-red-600 text-white border-red-700" 
                                : "bg-white text-slate-400 border-slate-200 hover:text-red-500"
                        )}
                        title={step.attention ? "Remover Atenção" : "Marcar Atenção"}
                    >
                        <AlertCircle size={12} />
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

                {/* 2. O Card Visual (Clipped Content) */}
                <div 
                    onClick={onSelect}
                    style={{ 
                        padding: `${padding}px`,
                        gap: `${gap}px`,
                        borderWidth: `${borderSize}px`
                    }}
                    className={cn(
                        "w-full h-full rounded-xl cursor-pointer flex flex-col relative shadow-sm hover:shadow-md overflow-hidden bg-white transition-all",
                        // Selection overrides Attention visually for the border ring, but attention keeps the red tint if selected
                        isSelected 
                            ? (step.attention ? "bg-red-50 border-red-500 ring-4 ring-red-100" : "bg-white border-blue-600 ring-4 ring-blue-50")
                            : (step.attention ? "bg-red-50 border-red-400" : "bg-white border-slate-200 hover:border-blue-300"),
                    )}
                >
                     {/* Attention Indicator (Icon on corner inside clipped area) */}
                    {step.attention && (
                        <div className="absolute top-1 right-1 text-red-500 z-10">
                            <AlertCircle size={Math.max(12, 16 * scale)} fill="currentColor" className="text-white bg-red-500 rounded-full" />
                        </div>
                    )}

                    {/* Conteúdo Interno */}
                    <div className="flex flex-col h-full overflow-hidden">
                        <div className="shrink-0 mb-[2px]">
                            <EditableText
                                value={step.role}
                                onChange={(val) => onUpdate(val, 'role')}
                                placeholder="DEFINIR PAPEL"
                                className={cn(
                                    "font-bold uppercase rounded w-full text-center truncate",
                                    step.attention ? "text-red-700 bg-red-100/50" : "text-slate-500 bg-slate-50"
                                )}
                                style={{ 
                                    fontSize: `${roleFontSize}px`, 
                                    padding: `${2 * scale}px ${4 * scale}px` 
                                }}
                            />
                        </div>
                        <div className="flex-1 flex items-center justify-center text-center overflow-hidden">
                            <EditableText
                                value={step.name}
                                onChange={(val) => onUpdate(val, 'name')}
                                placeholder="Nome da Etapa"
                                multiline
                                className={cn(
                                    "font-bold leading-tight w-full text-center flex items-center justify-center",
                                    step.attention ? "text-red-900" : (isSelected ? "text-blue-900" : "text-slate-700")
                                )}
                                style={{ 
                                    fontSize: `${nameFontSize}px`,
                                    lineHeight: 1.2,
                                    minHeight: '1.5em'
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* Seta indicativa se selecionado (Outside clipped area) */}
                {isSelected && (
                    <div className={cn(
                        "absolute left-1/2 -bottom-2.5 -translate-x-1/2 w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px]",
                        step.attention ? "border-t-red-500" : "border-t-blue-600"
                    )}></div>
                )}
            </div>

            {/* Linha e Conector */}
            <div 
                className="w-full flex flex-col items-center justify-center relative shrink-0 mt-2"
                style={{ height: `${56 * scale}px` }}
            >
                <div 
                    className={cn(
                        "w-full absolute top-1/2 -translate-y-1/2",
                        step.attention ? "bg-red-200" : (isSelected ? "bg-blue-200" : "bg-slate-200")
                    )}
                    style={{ height: `${lineHeight}px` }}
                ></div>
                <div 
                    className={cn(
                        "rounded-full z-10 flex items-center justify-center font-bold transition-all",
                        step.attention 
                            ? "bg-red-500 border-white text-white ring-2 ring-red-200 scale-110"
                            : (isSelected 
                                ? "bg-blue-600 border-white ring-2 ring-blue-200 text-white scale-110" 
                                : "bg-white border-slate-300 text-slate-400")
                    )}
                    style={{
                        width: `${numberSize}px`,
                        height: `${numberSize}px`,
                        fontSize: `${numberFontSize}px`,
                        borderWidth: `${numberBorderSize}px`
                    }}
                >
                    {step.attention ? <AlertCircle size={numberFontSize} /> : index + 1}
                </div>
            </div>
        </div>
    );
}

export const Timeline: React.FC<TimelineProps> = ({ steps, selectedStepId, onSelectStep, onUpdateSteps, onAddStep, onDeleteStep, className }) => {
    
    const [scale, setScale] = useState(1);

    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
    );

    const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 2.0)); 
    const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.3));

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

    const handleToggleAttention = (id: string) => {
        const newSteps = steps.map(s => s.id === id ? { ...s, attention: !s.attention } : s);
        onUpdateSteps(newSteps);
    };

    // Derived dimensions for "Add Button" area
    const cardWidth = 240 * scale;
    const cardHeight = 128 * scale;
    const addButtonSize = 40 * scale;
    const addButtonIconSize = 20 * scale;
    const lineHeight = Math.max(2, 4 * scale);

    return (
        <div className={cn(
            "flex-shrink-0 bg-white border-b border-slate-200 h-full relative flex flex-col",
            className
        )}>
            {/* Header com Controles */}
            <div className="absolute top-0 left-0 right-0 h-8 z-20 flex justify-between items-start pointer-events-none px-3">
                {/* Título */}
                <div className="bg-slate-50 px-3 py-1 rounded-b-lg text-[10px] font-bold text-slate-400 border-b border-x border-slate-200 flex items-center gap-1 shadow-sm pointer-events-auto">
                    <Settings2 size={12} /> TIMELINE DO PROCESSO
                </div>

                {/* Controles de Zoom */}
                <div className="bg-white border border-t-0 border-slate-200 rounded-b-lg flex items-center shadow-sm pointer-events-auto mt-0">
                    <button 
                        onClick={handleZoomOut} 
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-bl-lg transition-colors border-r border-slate-100"
                        title="Diminuir Zoom"
                    >
                        <ZoomOut size={14} />
                    </button>
                    <span className="text-[9px] font-bold text-slate-500 w-8 text-center select-none">
                        {Math.round(scale * 100)}%
                    </span>
                    <button 
                        onClick={handleZoomIn} 
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-50 rounded-br-lg transition-colors border-l border-slate-100"
                        title="Aumentar Zoom"
                    >
                        <ZoomIn size={14} />
                    </button>
                </div>
            </div>

            <div className="flex-1 overflow-x-auto custom-scrollbar flex px-8 relative items-center bg-slate-50/10">
                {/* Aumentado padding para py-16 para garantir espaço seguro para os botões flutuantes (-top-9) */}
                <div className="flex items-center h-full min-w-max mx-auto py-16">
                    
                    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                        <SortableContext items={steps.map(s => s.id)} strategy={horizontalListSortingStrategy}>
                            {steps.map((step, index) => (
                                <SortableStep
                                    key={step.id}
                                    step={step}
                                    index={index}
                                    scale={scale}
                                    isSelected={selectedStepId === step.id}
                                    onSelect={() => onSelectStep(step.id)}
                                    onUpdate={(val, field) => handleUpdateStep(step.id, val, field)}
                                    onToggleAttention={() => handleToggleAttention(step.id)}
                                    onDelete={() => onDeleteStep(step.id)}
                                />
                            ))}
                        </SortableContext>
                    </DndContext>
                            
                    {/* Add Button Area - Aligned */}
                    <div className="flex flex-col items-center justify-center h-full relative group">
                         {/* Card Spacer placeholder to align with cards */}
                         <div 
                            className="mb-2 flex items-center justify-center transition-all duration-200"
                            style={{ 
                                height: `${cardHeight}px`, 
                                width: `${cardWidth}px` 
                            }}
                         >
                             <div className="w-[90%] h-full border-2 border-dashed border-slate-100 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] uppercase font-bold text-slate-300">Nova Etapa</span>
                             </div>
                         </div>

                        {/* Connector Area */}
                        <div 
                            className="w-full flex items-center justify-center relative shrink-0"
                            style={{ height: `${56 * scale}px` }}
                        >
                             {/* Line pass through */}
                             <div 
                                className="absolute left-0 right-1/2 top-1/2 -translate-y-1/2 bg-slate-200"
                                style={{ height: `${lineHeight}px` }}
                             ></div>
                             
                             <button 
                                onClick={onAddStep}
                                className="rounded-full bg-white border-2 border-dashed border-slate-300 text-slate-400 hover:border-blue-500 hover:text-blue-600 hover:bg-blue-50 flex items-center justify-center transition-all relative z-10 shadow-sm"
                                style={{
                                    width: `${addButtonSize}px`,
                                    height: `${addButtonSize}px`
                                }}
                                title="Adicionar Etapa"
                            >
                                <Plus size={addButtonIconSize} />
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};
