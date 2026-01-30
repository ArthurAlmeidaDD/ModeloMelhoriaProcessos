
import React from 'react';
import { ProcessImprovement, DeipItem, DeipCategory } from '../types/process';
import { Timeline } from './Timeline';
import { DeipCard } from './DeipCard';
import { Plus, Shield, ArrowRightToLine, ArrowRightFromLine, Hammer } from 'lucide-react';
import { generateId, cn } from '../lib/utils';
import { Button } from './ui/button';

interface DeipLayoutProps {
  data: ProcessImprovement;
  selectedId: string | null;
  onSelect: (id: string, type: 'step' | 'deip' | 'start' | 'end') => void;
  onUpdateDeipItems: (items: DeipItem[]) => void;
  onDeleteDeipItem: (id: string) => void;
  // Timeline props passed through
  onUpdateSteps: (steps: any[]) => void;
  onAddStep: () => void;
  onDeleteStep: (id: string) => void;
}

export const DeipLayout: React.FC<DeipLayoutProps> = ({
  data,
  selectedId,
  onSelect,
  onUpdateDeipItems,
  onDeleteDeipItem,
  onUpdateSteps,
  onAddStep,
  onDeleteStep
}) => {

  const addItem = (category: DeipCategory) => {
    const newItem: DeipItem = {
      id: generateId(),
      category,
      title: '',
      description: '',
      attention: false
    };
    onUpdateDeipItems([...(data.deipItems || []), newItem]);
    onSelect(newItem.id, 'deip');
  };

  const getItems = (category: DeipCategory) => {
    return (data.deipItems || []).filter(i => i.category === category);
  };

  const renderSection = (
      category: DeipCategory, 
      title: string, 
      icon: React.ReactNode, 
      bgColor: string, 
      className: string,
      gridClasses: string // Nova prop para controlar o layout do grid interno
    ) => {
      const items = getItems(category);
      return (
          <div className={cn("flex flex-col h-full overflow-hidden bg-white", className)}>
              <div className={cn("px-2 py-1.5 flex items-center justify-between border-b border-slate-200 h-8", bgColor)}>
                  <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase text-slate-700 whitespace-nowrap overflow-hidden">
                      <div className="shrink-0">{icon}</div>
                      <span className="truncate" title={title}>{title}</span>
                  </div>
                  <Button 
                    size="icon" 
                    variant="ghost" 
                    className="w-5 h-5 hover:bg-white/50 shrink-0 ml-1" 
                    onClick={() => addItem(category)}
                  >
                    <Plus size={14} />
                  </Button>
              </div>
              <div className="flex-1 p-2 overflow-y-auto custom-scrollbar bg-white">
                  <div className={cn("grid gap-2", gridClasses)}>
                      {items.map(item => (
                          <DeipCard 
                            key={item.id} 
                            item={item} 
                            isSelected={selectedId === item.id}
                            onClick={() => onSelect(item.id, 'deip')}
                            onDelete={() => onDeleteDeipItem(item.id)}
                          />
                      ))}
                      {items.length === 0 && (
                          <div onClick={() => addItem(category)} className="border-2 border-dashed border-slate-100 rounded-lg p-4 flex flex-col items-center justify-center text-slate-300 cursor-pointer hover:border-slate-300 hover:bg-slate-50 transition-all min-h-[80px]">
                              <Plus size={16} className="mb-1" />
                              <span className="text-[9px] uppercase font-bold">Adicionar</span>
                          </div>
                      )}
                  </div>
              </div>
          </div>
      );
  };

  return (
    <div className="flex-1 overflow-auto custom-scrollbar p-8 bg-slate-100">
        <div className="min-w-[1000px] max-w-[1800px] mx-auto grid grid-cols-12 gap-0 auto-rows-min shadow-sm">
            
            {/* ROW 1: POLICIES (Top Center) */}
            {/* Horizontal Grid: Mostra cards lado a lado */}
            <div className="col-span-12 h-44 z-10">
                {renderSection(
                    'policies', 
                    'Políticas, Regras e Padrões', 
                    <Shield size={14} className="text-slate-600" />,
                    'bg-slate-100',
                    'border border-slate-300 rounded-t-xl',
                    'grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' // Horizontal layout
                )}
            </div>

            {/* ROW 2: INPUTS - TIMELINE - OUTPUTS */}
            
            {/* Left: Inputs */}
            {/* Vertical Grid */}
            <div className="col-span-2 h-[280px]">
                {renderSection(
                    'inputs', 
                    'Entradas / Premissas', 
                    <ArrowRightToLine size={14} className="text-green-600" />,
                    'bg-green-50',
                    'border-l border-b border-slate-300',
                    'grid-cols-1 xl:grid-cols-2' // Vertical stack (or 2 cols on wide)
                )}
            </div>

            {/* Center: Timeline */}
            <div className="col-span-8 h-[280px] flex items-center bg-white border-l border-b border-slate-300 overflow-hidden relative">
                 <Timeline 
                    steps={data.steps}
                    selectedStepId={selectedId}
                    onSelectStep={(id) => onSelect(id, id === 'START' ? 'start' : id === 'END' ? 'end' : 'step')}
                    onUpdateSteps={onUpdateSteps}
                    onAddStep={onAddStep}
                    onDeleteStep={onDeleteStep}
                    className="h-full border-none rounded-none shadow-none w-full"
                 />
            </div>

            {/* Right: Outputs */}
            {/* Vertical Grid */}
            <div className="col-span-2 h-[280px]">
                {renderSection(
                    'outputs', 
                    'Saídas / Entregas', 
                    <ArrowRightFromLine size={14} className="text-blue-600" />,
                    'bg-blue-50',
                    'border-l border-b border-r border-slate-300',
                    'grid-cols-1 xl:grid-cols-2' // Vertical stack
                )}
            </div>

            {/* ROW 3: RESOURCES (Bottom Center) */}
            {/* Horizontal Grid: Mostra cards lado a lado */}
            <div className="col-span-12 h-44">
                {renderSection(
                    'resources', 
                    'Suporte, Recursos e Ferramentas', 
                    <Hammer size={14} className="text-amber-600" />,
                    'bg-amber-50',
                    'border-l border-b border-r border-slate-300 rounded-b-xl',
                    'grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6' // Horizontal layout
                )}
            </div>

        </div>
    </div>
  );
};
