
import React, { useState, useEffect } from 'react';
import { ProcessHeader } from './components/ProcessHeader';
import { StepDetails } from './components/StepDetails';
import { NodeDetails } from './components/NodeDetails';
import { ProjectView } from './components/ProjectView';
import { DeipLayout } from './components/DeipLayout';
import { DeipItemDetails } from './components/DeipItemDetails';
import { ProcessImprovement, ProcessStep, ProcessNode, DeipItem, ProcessFlow } from './types/process';
import { loadFromLocalStorage, saveToLocalStorage, validateProcessJson, getEmptyProcess, ensureCompatibleData } from './utils/exportUtils';
import { generateId, cn } from './lib/utils';
import { FileWarning, CheckCircle, LayoutTemplate, Rocket, X } from 'lucide-react';

type SelectedType = 'step' | 'deip' | 'start' | 'end' | null;

function App() {
  const [data, setData] = useState<ProcessImprovement | null>(null);
  const [activeFlowId, setActiveFlowId] = useState<string>('');
  
  // Selection State
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<SelectedType>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const [currentView, setCurrentView] = useState<'process' | 'project'>('process');
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    const loadedData = loadFromLocalStorage();
    setData(loadedData);
    if (loadedData.flows.length > 0) {
        setActiveFlowId(loadedData.flows[0].id);
    }
  }, []);

  useEffect(() => {
    if (data) {
      const timeoutId = setTimeout(() => {
        saveToLocalStorage({ ...data, updatedAt: new Date().toISOString() });
      }, 1000);
      return () => clearTimeout(timeoutId);
    }
  }, [data]);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleUpdate = (field: keyof ProcessImprovement, value: any) => {
    if (!data) return;
    setData({ ...data, [field]: value });
  };

  const handleSelectElement = (id: string, type: SelectedType) => {
      setSelectedId(id);
      setSelectedType(type);
      setIsPanelOpen(true);
  };

  const handleClosePanel = () => {
      setIsPanelOpen(false);
      setSelectedId(null);
      setSelectedType(null);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
              try {
                  const importedData = JSON.parse(event.target?.result as string);
                  if (validateProcessJson(importedData)) {
                      const compatible = ensureCompatibleData(importedData);
                      setData(compatible);
                      if (compatible.flows.length > 0) {
                        setActiveFlowId(compatible.flows[0].id);
                      }
                      handleClosePanel();
                      showNotification('Projeto carregado com sucesso!', 'success');
                  } else {
                      showNotification('Arquivo JSON inválido ou corrompido.', 'error');
                  }
              } catch (error) {
                  showNotification('Erro na leitura do arquivo.', 'error');
              }
          };
          reader.readAsText(file);
      }
      e.target.value = '';
  };

  // --- Handlers for Flows ---

  const handleAddFlow = () => {
      if (!data) return;
      const newFlow: ProcessFlow = {
          id: generateId(),
          name: 'Novo Fluxo',
          steps: []
      };
      setData({ ...data, flows: [...data.flows, newFlow] });
      setActiveFlowId(newFlow.id);
  };

  const handleDeleteFlow = (flowId: string) => {
      if (!data) return;
      if (data.flows.length <= 1) {
          showNotification('É necessário ter pelo menos um fluxo.', 'error');
          return;
      }
      if (confirm('Tem certeza? Todas as etapas deste fluxo serão excluídas.')) {
          const newFlows = data.flows.filter(f => f.id !== flowId);
          setData({ ...data, flows: newFlows });
          if (activeFlowId === flowId) {
              setActiveFlowId(newFlows[0].id);
          }
      }
  };

  const handleUpdateFlowName = (flowId: string, name: string) => {
      if (!data) return;
      const newFlows = data.flows.map(f => f.id === flowId ? { ...f, name } : f);
      setData({ ...data, flows: newFlows });
  };

  // --- Handlers for Steps (Scoped to Flows) ---

  const updateSteps = (newSteps: ProcessStep[]) => {
      if (!data) return;
      const newFlows = data.flows.map(f => 
          f.id === activeFlowId ? { ...f, steps: newSteps } : f
      );
      setData({ ...data, flows: newFlows });
  };

  const handleAddStep = () => {
      if (!data || !activeFlowId) return;
      const newStep: ProcessStep = {
          id: generateId(),
          name: 'Nova Etapa',
          role: '',
          currentScenario: '',
          futureScenario: '',
          idealScenario: '',
          inputs: [],
          outputs: [],
          noImprovement: false,
          userCards: [],
          mappings: []
      };
      
      const newFlows = data.flows.map(f => {
          if (f.id === activeFlowId) {
              return { ...f, steps: [...f.steps, newStep] };
          }
          return f;
      });

      setData({ ...data, flows: newFlows });
      handleSelectElement(newStep.id, 'step');
  };

  const handleDeleteStep = (id: string) => {
      if (!data) return;
      if(confirm("Tem certeza que deseja remover esta etapa?")) {
          const newFlows = data.flows.map(f => ({
              ...f,
              steps: f.steps.filter(s => s.id !== id)
          }));
          setData({ ...data, flows: newFlows });
          if (selectedId === id) handleClosePanel();
      }
  };

  const handleUpdateSelectedStep = (updatedStep: ProcessStep) => {
      if (!data) return;
      // Precisamos encontrar em qual fluxo esta etapa está
      const newFlows = data.flows.map(f => ({
          ...f,
          steps: f.steps.map(s => s.id === updatedStep.id ? updatedStep : s)
      }));
      setData({ ...data, flows: newFlows });
  }

  // --- Helpers for other items ---

  const handleUpdateStartNode = (updatedNode: ProcessNode) => {
      if (!data) return;
      setData({ ...data, startNode: updatedNode });
  }

  const handleUpdateEndNode = (updatedNode: ProcessNode) => {
      if (!data) return;
      setData({ ...data, endNode: updatedNode });
  }

  const handleUpdateDeipItems = (items: DeipItem[]) => {
      if (!data) return;
      setData({ ...data, deipItems: items });
  }

  const handleUpdateDeipItem = (updatedItem: DeipItem) => {
      if (!data) return;
      const newItems = (data.deipItems || []).map(i => i.id === updatedItem.id ? updatedItem : i);
      setData({ ...data, deipItems: newItems });
  }

  const handleDeleteDeipItem = (id: string) => {
      if (!data) return;
      if(confirm("Excluir este item?")) {
          const newItems = (data.deipItems || []).filter(i => i.id !== id);
          setData({ ...data, deipItems: newItems });
          if (selectedId === id) handleClosePanel();
      }
  }

  // Helper to find step across all flows for the Details Panel
  const findStepById = (id: string): ProcessStep | undefined => {
      if (!data) return undefined;
      for (const flow of data.flows) {
          const step = flow.steps.find(s => s.id === id);
          if (step) return step;
      }
      return undefined;
  };

  if (!data) return null;

  // --- Render Logic for Bottom Panel Content ---
  let PanelContent = null;
  if (selectedType === 'start') {
      PanelContent = <NodeDetails node={data.startNode || { cards: [] }} type="start" onUpdate={handleUpdateStartNode} />;
  } else if (selectedType === 'end') {
      PanelContent = <NodeDetails node={data.endNode || { cards: [] }} type="end" onUpdate={handleUpdateEndNode} />;
  } else if (selectedType === 'step') {
      const selectedStep = findStepById(selectedId || '');
      if (selectedStep) {
          PanelContent = <StepDetails step={selectedStep} onUpdate={handleUpdateSelectedStep} />;
      }
  } else if (selectedType === 'deip') {
      const selectedItem = (data.deipItems || []).find(i => i.id === selectedId);
      if (selectedItem) {
          PanelContent = <DeipItemDetails item={selectedItem} onUpdate={handleUpdateDeipItem} onDelete={() => handleDeleteDeipItem(selectedItem.id)} />;
      }
  }

  if (!PanelContent) PanelContent = <div className="p-8 text-center text-slate-400">Item não encontrado.</div>;

  return (
    <div className="flex flex-col h-screen w-screen bg-[#f1f5f9] overflow-hidden">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-3 rounded-lg shadow-2xl animate-in slide-in-from-right-10 border ${
          notification.type === 'success' ? 'bg-white border-green-100 text-green-800' : 'bg-white border-red-100 text-red-800'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-500" /> : <FileWarning className="w-5 h-5 text-red-500" />}
          <span className="font-semibold text-sm">{notification.message}</span>
        </div>
      )}

      {/* TOP NAV */}
      <div className="bg-slate-900 px-4 py-2 flex items-center justify-center border-b border-slate-800 shrink-0 z-50">
          <div className="bg-slate-800 p-1 rounded-lg flex items-center gap-1">
             <button 
                onClick={() => setCurrentView('process')}
                className={cn(
                    "px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide flex items-center gap-2 transition-all",
                    currentView === 'process' ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white hover:bg-slate-700"
                )}
             >
                <LayoutTemplate size={14} /> Mapeamento DEIP
             </button>
             <button 
                onClick={() => setCurrentView('project')}
                className={cn(
                    "px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide flex items-center gap-2 transition-all",
                    currentView === 'project' ? "bg-indigo-600 text-white shadow" : "text-slate-400 hover:text-white hover:bg-slate-700"
                )}
             >
                <Rocket size={14} /> Visão do Projeto
             </button>
          </div>
      </div>

      {currentView === 'process' ? (
        <div className="flex-1 flex overflow-hidden">
            {/* MAIN WORKSPACE - No Sidebar */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                <ProcessHeader 
                    data={data} 
                    onUpdate={handleUpdate} 
                    onImport={handleImport}
                />

                {/* DEIP CANVAS (Timeline + Surroundings) */}
                <DeipLayout 
                    data={data}
                    activeFlowId={activeFlowId}
                    setActiveFlowId={setActiveFlowId}
                    selectedId={selectedId}
                    onSelect={handleSelectElement}
                    onUpdateDeipItems={handleUpdateDeipItems}
                    onDeleteDeipItem={handleDeleteDeipItem}
                    onUpdateSteps={updateSteps}
                    onAddStep={handleAddStep}
                    onDeleteStep={handleDeleteStep}
                    onAddFlow={handleAddFlow}
                    onDeleteFlow={handleDeleteFlow}
                    onUpdateFlowName={handleUpdateFlowName}
                />

                {/* COLLAPSIBLE BOTTOM PANEL */}
                <div className={cn(
                    "border-t border-slate-300 shadow-[0_-5px_15px_rgba(0,0,0,0.05)] bg-white transition-all duration-300 ease-in-out flex flex-col z-30 relative",
                    isPanelOpen ? "h-[450px]" : "h-0"
                )}>
                    {isPanelOpen && (
                        <div className="flex-1 flex flex-col min-h-0 relative">
                            {/* Close Button */}
                            <button 
                                onClick={handleClosePanel}
                                className="absolute top-2 right-4 z-20 p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-500 rounded-full transition-colors"
                                title="Fechar Painel"
                            >
                                <X size={16} />
                            </button>
                            
                            {/* Content */}
                            {PanelContent}
                        </div>
                    )}
                </div>
            </div>
        </div>
      ) : (
        <ProjectView data={data} onUpdate={handleUpdate} />
      )}

    </div>
  );
}

export default App;
