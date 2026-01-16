import React, { useState, useEffect } from 'react';
import { ProcessHeader } from './components/ProcessHeader';
import { Timeline } from './components/Timeline';
import { StepDetails } from './components/StepDetails';
import { ProjectView } from './components/ProjectView';
import { ProcessSidebar } from './components/ProcessSidebar';
import { ProcessImprovement, ProcessStep } from './types/process';
import { loadFromLocalStorage, saveToLocalStorage, validateProcessJson, getEmptyProcess } from './utils/exportUtils';
import { generateId, cn } from './lib/utils';
import { FileWarning, CheckCircle, LayoutTemplate, Rocket } from 'lucide-react';

function App() {
  const [data, setData] = useState<ProcessImprovement | null>(null);
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [currentView, setCurrentView] = useState<'process' | 'project'>('process');
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  useEffect(() => {
    const loadedData = loadFromLocalStorage();
    setData(loadedData);
    if (loadedData.steps.length > 0) {
        setSelectedStepId(loadedData.steps[0].id);
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

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
              try {
                  const importedData = JSON.parse(event.target?.result as string);
                  if (validateProcessJson(importedData)) {
                      setData(importedData);
                      if(importedData.steps.length > 0) setSelectedStepId(importedData.steps[0].id);
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

  const updateSteps = (newSteps: ProcessStep[]) => {
      if (!data) return;
      setData({ ...data, steps: newSteps });
  };

  const handleAddStep = () => {
      if (!data) return;
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
      const newSteps = [...data.steps, newStep];
      setData({ ...data, steps: newSteps });
      setSelectedStepId(newStep.id);
  };

  const handleDeleteStep = (id: string) => {
      if (!data) return;
      
      if(confirm("Tem certeza que deseja remover esta etapa?")) {
          const newSteps = data.steps.filter(s => s.id !== id);
          setData({ ...data, steps: newSteps });

          // Se a etapa deletada era a selecionada, seleciona a primeira disponível ou limpa
          if (selectedStepId === id) {
              if (newSteps.length > 0) {
                  setSelectedStepId(newSteps[0].id);
              } else {
                  setSelectedStepId(null);
              }
          }
      }
  };

  const handleUpdateSelectedStep = (updatedStep: ProcessStep) => {
      if (!data) return;
      const newSteps = data.steps.map(s => s.id === updatedStep.id ? updatedStep : s);
      setData({ ...data, steps: newSteps });
  }

  if (!data) return null;

  const selectedStep = data.steps.find(s => s.id === selectedStepId);

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

      {/* VIEW SWITCHER / TOP NAV */}
      <div className="bg-slate-900 px-4 py-2 flex items-center justify-center border-b border-slate-800 shrink-0 z-50">
          <div className="bg-slate-800 p-1 rounded-lg flex items-center gap-1">
             <button 
                onClick={() => setCurrentView('process')}
                className={cn(
                    "px-4 py-1.5 rounded-md text-xs font-bold uppercase tracking-wide flex items-center gap-2 transition-all",
                    currentView === 'process' ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white hover:bg-slate-700"
                )}
             >
                <LayoutTemplate size={14} /> Mapeamento de Processo
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
            {/* LEFT SIDEBAR (Collapsible) */}
            <ProcessSidebar 
                data={data}
                onUpdate={handleUpdate}
                isOpen={isSidebarOpen}
                onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
            />

            {/* MAIN CONTENT AREA */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
                {/* 1. HEADER */}
                <ProcessHeader 
                    data={data} 
                    onUpdate={handleUpdate} 
                    onImport={handleImport}
                />

                {/* 2. TIMELINE (Fixed Height) */}
                <Timeline 
                    steps={data.steps}
                    selectedStepId={selectedStepId}
                    onSelectStep={setSelectedStepId}
                    onUpdateSteps={updateSteps}
                    onAddStep={handleAddStep}
                    onDeleteStep={handleDeleteStep}
                />

                {/* 3. DETAILS AREA (Flexible) */}
                {selectedStep ? (
                    <StepDetails 
                        key={selectedStep.id} 
                        step={selectedStep}
                        onUpdate={handleUpdateSelectedStep}
                    />
                ) : (
                    <div className="flex-1 flex items-center justify-center text-slate-400">
                        {data.steps.length === 0 
                            ? "Adicione uma nova etapa para começar." 
                            : "Selecione uma etapa para ver os detalhes."}
                    </div>
                )}
            </div>
        </div>
      ) : (
        <ProjectView data={data} onUpdate={handleUpdate} />
      )}

    </div>
  );
}

export default App;