import React, { useState } from 'react';
import { ProcessImprovement, ProcessStep } from '../types/process';
import { ProcessStepRow } from './ProcessStepRow';
import { Button } from './ui/button';
import { Plus, List } from 'lucide-react';
import { generateId } from '../lib/utils';
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
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

interface ProcessTableProps {
  data: ProcessImprovement;
  onUpdate: (newData: ProcessImprovement) => void;
}

export const ProcessTable: React.FC<ProcessTableProps> = ({ data, onUpdate }) => {
  const [showNoImprovement, setShowNoImprovement] = useState(true);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && active.id !== over.id) {
      const oldIndex = data.steps.findIndex((step) => step.id === active.id);
      const newIndex = data.steps.findIndex((step) => step.id === over.id);
      
      const newSteps = arrayMove(data.steps, oldIndex, newIndex);
      onUpdate({ ...data, steps: newSteps });
    }
  };

  const addStep = () => {
    const newStep: ProcessStep = {
      id: generateId(),
      name: '',
      currentScenario: '',
      futureScenario: '',
      noImprovement: false,
      userCards: []
    };
    onUpdate({ ...data, steps: [...data.steps, newStep] });
  };

  const updateStep = (index: number, updatedStep: ProcessStep) => {
    const newSteps = [...data.steps];
    newSteps[index] = updatedStep;
    onUpdate({ ...data, steps: newSteps });
  };

  const deleteStep = (index: number) => {
    if (confirm('Tem certeza que deseja excluir esta etapa e todas as suas histórias?')) {
      const newSteps = data.steps.filter((_, i) => i !== index);
      onUpdate({ ...data, steps: newSteps });
    }
  };

  const visibleSteps = showNoImprovement 
    ? data.steps 
    : data.steps.filter(s => !s.noImprovement);

  const countNoImprovement = data.steps.filter(s => s.noImprovement).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between pb-2">
        <h2 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <List className="w-5 h-5 text-[#0F5F87]" />
            Etapas do Processo
        </h2>
        <div className="flex items-center gap-3">
             <label className="text-sm text-slate-500 font-medium cursor-pointer flex items-center gap-2 select-none">
                <div 
                  className={`w-10 h-5 rounded-full relative transition-colors ${showNoImprovement ? 'bg-[#0F5F87]' : 'bg-slate-300'}`}
                  onClick={() => setShowNoImprovement(!showNoImprovement)}
                >
                    <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${showNoImprovement ? 'left-6' : 'left-1'}`} />
                </div>
                <span>Sem melhoria ({countNoImprovement})</span>
             </label>
        </div>
      </div>

      {/* Table Headers */}
      <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-slate-100/50 rounded-lg text-sm font-semibold text-slate-600 border border-transparent">
          <div className="col-span-12 md:col-span-3 lg:col-span-3 pl-8">Etapa Nome</div>
          <div className="hidden md:block md:col-span-4 lg:col-span-4">Como é Hoje</div>
          <div className="hidden md:block md:col-span-4 lg:col-span-4">Como Será</div>
      </div>

      <DndContext 
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext 
          items={visibleSteps.map(s => s.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="space-y-3">
            {visibleSteps.map((step) => {
                const realIndex = data.steps.findIndex(s => s.id === step.id);
                return (
                    <ProcessStepRow 
                        key={step.id} 
                        step={step} 
                        index={realIndex}
                        onUpdate={(updated) => updateStep(realIndex, updated)}
                        onDelete={() => deleteStep(realIndex)}
                    />
                )
            })}
          </div>
        </SortableContext>
      </DndContext>

      <Button 
        onClick={addStep} 
        variant="outline" 
        className="w-full border-dashed border-2 border-slate-300 py-6 text-[#0F5F87] font-semibold hover:border-[#0F5F87] hover:bg-slate-50 transition-all rounded-xl"
      >
        <Plus className="w-5 h-5 mr-2" />
        Adicionar Nova Etapa
      </Button>
    </div>
  );
};
