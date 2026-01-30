
import React from 'react';
import { ProcessImprovement, DeipItem, DeipCategory, ProcessFlow } from '../types/process';
import { Timeline } from './Timeline';
import { DeipCard } from './DeipCard';
import { Plus, Shield, ArrowRightToLine, ArrowRightFromLine, Hammer, Layers, Trash2, CheckCircle2, AlertCircle } from 'lucide-react';
import { generateId, cn } from '../lib/utils';
import { Button } from './ui/button';
import { EditableText } from './EditableText';

interface DeipLayoutProps {
  data: ProcessImprovement;
  selectedId: string | null;
  activeFlowId: string;
  setActiveFlowId: (id: string) => void;
  onSelect: (id: string, type: 'step' | 'deip' | 'start' | 'end') => void;
  onUpdateDeipItems: (items: DeipItem[]) => void;
  onDeleteDeipItem: (id: string) => void;
  
  // Timeline props
  onUpdateSteps: (steps: any[]) => void;
  onAddStep: () => void;
  onDeleteStep: (id: string) => void;

  // Flow props
  onAddFlow: () => void;
  onDeleteFlow: (id: string) => void;
  onUpdateFlowName: (id: string, name: string) => void;
}

export const DeipLayout: React.FC<DeipLayoutProps> = ({
  data,
  selectedId,
  activeFlowId,
  setActiveFlowId,
  onSelect,
  onUpdateDeipItems,
  onDeleteDeipItem,
  onUpdateSteps,
  onAddStep,
  onDeleteStep,
  onAddFlow,
  onDeleteFlow,
  onUpdateFlowName
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

  const activeFlow = data.flows.find(f => f.id === activeFlowId) || data.flows[0];

  // Check if a flow contains the currently selected step
  const isFlowHighlighted = (flow: ProcessFlow) => {
      if (!selectedId) return false;
      return flow.steps.some(step => step.id === selectedId);
  };

  const renderSection = (
      category: DeipCategory, 
      title: string, 
      icon: React.ReactNode, 
      bgColor: string, 
      className: string,
      gridClasses: string
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
              {/* Aumentado de p-2 para p-4 para garantir que ícones de atenção negativos não cortem */}
              <div className="flex-1 p-4 overflow-y-auto custom-scrollbar bg-white">
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
            <div className="col-span-12 h-44 z-10">
                {renderSection(
                    'policies', 
                    'Políticas, Regras e Padrões', 
                    <Shield size={14} className="text-slate-600" />,
                    'bg-slate-100',
                    'border border-slate-300 rounded-t-xl',
                    'grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
                )}
            </div>

            {/* ROW 2: INPUTS - FLOWS/TIMELINE - OUTPUTS */}
            {/* Height increased from 280px to 380px for better visibility */}
            
            {/* Left: Inputs */}
            <div className="col-span-2 h-[380px]">
                {renderSection(
                    'inputs', 
                    'Entradas / Premissas', 
                    <ArrowRightToLine size={14} className="text-green-600" />,
                    'bg-green-50',
                    'border-l border-b border-slate-300',
                    'grid-cols-1 xl:grid-cols-2'
                )}
            </div>

            {/* Center: Flows + Timeline */}
            <div className="col-span-8 h-[380px] flex flex-col bg-white border-l border-b border-slate-300 overflow-hidden relative">
                 
                 {/* Top Toolbar: Fluxos */}
                 <div className="h-10 border-b border-slate-200 bg-slate-50 flex items-center px-2 gap-1 overflow-x-auto custom-scrollbar shrink-0">
                    <div className="flex items-center gap-1.5 px-2 text-[10px] font-bold uppercase text-slate-500 shrink-0 select-none">
                        <Layers size={12} />
                        Fluxos:
                    </div>
                    
                    <div className="flex items-center gap-2 flex-1 overflow-x-auto min-w-0 pr-2">
                        {data.flows.map(flow => {
                            const isSelectedStepInFlow = isFlowHighlighted(flow);
                            const isActive = activeFlowId === flow.id;
                            const hasAttention = flow.steps.some(s => s.attention);
                            
                            return (
                                <div 
                                    key={flow.id}
                                    onClick={() => setActiveFlowId(flow.id)}
                                    className={cn(
                                        "group flex items-center gap-2 px-3 py-1.5 rounded-md transition-all cursor-pointer border select-none min-w-[120px] max-w-[200px]",
                                        // Base active state
                                        isActive 
                                            ? "bg-white border-slate-300 text-slate-800 shadow-sm" 
                                            : "bg-transparent border-transparent text-slate-500 hover:bg-white/50 hover:text-slate-700",
                                        
                                        // Selected Step state
                                        isSelectedStepInFlow && !isActive && !hasAttention && "border-blue-200 bg-blue-50/50 text-blue-700",
                                        isSelectedStepInFlow && isActive && !hasAttention && "ring-1 ring-blue-500 border-blue-500",

                                        // Attention State (Overrides selection visually for background/text, but selection ring remains if active)
                                        hasAttention && !isActive && "bg-red-50 border-red-200 text-red-600",
                                        hasAttention && isActive && "bg-red-50 border-red-500 text-red-700 ring-1 ring-red-200"
                                    )}
                                >
                                    {hasAttention ? (
                                        <AlertCircle size={12} className="text-red-500 shrink-0 animate-pulse" />
                                    ) : (
                                        isSelectedStepInFlow && <CheckCircle2 size={10} className="text-blue-600 shrink-0 animate-pulse" />
                                    )}
                                    
                                    <div className="flex-1 min-w-0">
                                         <EditableText 
                                            value={flow.name}
                                            onChange={(val) => onUpdateFlowName(flow.id, val)}
                                            className={cn(
                                                "w-full truncate bg-transparent text-xs font-medium focus:bg-white px-0.5 rounded", 
                                                !isActive && "pointer-events-none"
                                            )}
                                         />
                                    </div>
                                    {data.flows.length > 1 && (
                                        <button
                                            onClick={(e) => { e.stopPropagation(); onDeleteFlow(flow.id); }}
                                            className={cn(
                                                "opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-red-100 hover:text-red-600 transition-all text-slate-300",
                                                isActive && "opacity-20 hover:opacity-100"
                                            )}
                                            title="Excluir Fluxo"
                                        >
                                            <Trash2 size={10} />
                                        </button>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <Button 
                        size="icon" 
                        variant="ghost" 
                        className="w-7 h-7 hover:bg-white text-slate-500 rounded shrink-0 border border-transparent hover:border-slate-200" 
                        onClick={onAddFlow}
                        title="Adicionar Novo Fluxo"
                    >
                        <Plus size={14} />
                    </Button>
                 </div>

                 {/* Main Area: Timeline */}
                 <div className="flex-1 min-w-0 h-full bg-white relative">
                     <Timeline 
                        steps={activeFlow ? activeFlow.steps : []}
                        selectedStepId={selectedId}
                        onSelectStep={(id) => onSelect(id, id === 'START' ? 'start' : id === 'END' ? 'end' : 'step')}
                        onUpdateSteps={onUpdateSteps}
                        onAddStep={onAddStep}
                        onDeleteStep={onDeleteStep}
                        className="h-full border-none rounded-none shadow-none w-full"
                     />
                 </div>
            </div>

            {/* Right: Outputs */}
            <div className="col-span-2 h-[380px]">
                {renderSection(
                    'outputs', 
                    'Saídas / Entregas', 
                    <ArrowRightFromLine size={14} className="text-blue-600" />,
                    'bg-blue-50',
                    'border-l border-b border-r border-slate-300',
                    'grid-cols-1 xl:grid-cols-2'
                )}
            </div>

            {/* ROW 3: RESOURCES (Bottom Center) */}
            <div className="col-span-12 h-44">
                {renderSection(
                    'resources', 
                    'Suporte, Recursos e Ferramentas', 
                    <Hammer size={14} className="text-amber-600" />,
                    'bg-amber-50',
                    'border-l border-b border-r border-slate-300 rounded-b-xl',
                    'grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6'
                )}
            </div>

        </div>
    </div>
  );
};
