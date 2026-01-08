import React, { useState, useEffect } from 'react';
import { ProcessHeader } from './components/ProcessHeader';
import { ProcessTable } from './components/ProcessTable';
import { ExportButtons } from './components/ExportButtons';
import { ProcessImprovement } from './types/process';
import { loadFromLocalStorage, saveToLocalStorage, validateProcessJson } from './utils/exportUtils';
import { FileWarning, CheckCircle } from 'lucide-react';

function App() {
  const [data, setData] = useState<ProcessImprovement | null>(null);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    const loadedData = loadFromLocalStorage();
    setData(loadedData);
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

  const handleFullUpdate = (newData: ProcessImprovement) => {
    setData(newData);
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
      // Reset input value to allow importing the same file again if needed
      e.target.value = '';
  };

  if (!data) return (
    <div className="flex flex-col items-center justify-center h-screen bg-slate-50 gap-4">
      <div className="w-12 h-12 border-4 border-brand border-t-transparent rounded-full animate-spin"></div>
      <p className="text-slate-500 font-medium animate-pulse">Iniciando ProcessFlow...</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f1f5f9] pb-24 font-sans text-slate-900 selection:bg-brand-100">
      
      {/* Toast Notification */}
      {notification && (
        <div className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-6 py-3 rounded-lg shadow-2xl animate-in slide-in-from-right-10 border ${
          notification.type === 'success' ? 'bg-white border-green-100 text-green-800' : 'bg-white border-red-100 text-red-800'
        }`}>
          {notification.type === 'success' ? <CheckCircle className="w-5 h-5 text-green-500" /> : <FileWarning className="w-5 h-5 text-red-500" />}
          <span className="font-semibold text-sm">{notification.message}</span>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto p-4 md:p-8 space-y-8">
        
        {/* Top Actions Bar */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
           <div className="flex items-center gap-2">
              <div className="w-2 h-8 bg-brand rounded-full"></div>
              <div>
                <h1 className="text-sm font-bold text-slate-400 uppercase tracking-tighter">Projeto Ativo</h1>
                <p className="text-lg font-bold text-slate-700 truncate max-w-[300px]">{data.title || 'Sem Título'}</p>
              </div>
           </div>
           <ExportButtons data={data} onImport={handleImport} />
        </div>

        <ProcessHeader 
          data={data} 
          onUpdate={handleUpdate} 
        />
        
        <div className="bg-white rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-200 overflow-hidden">
           <div className="p-6 md:p-8">
              <ProcessTable 
                data={data} 
                onUpdate={handleFullUpdate} 
              />
           </div>
        </div>

        <div className="flex flex-col items-center gap-2 text-slate-400 mt-12 mb-8">
           <div className="flex items-center gap-4 text-xs font-medium bg-white px-4 py-2 rounded-full border border-slate-200 shadow-sm">
              <span className="flex items-center gap-1"><kbd className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">Click</kbd> para editar</span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span className="flex items-center gap-1"><kbd className="bg-slate-100 px-1.5 py-0.5 rounded border border-slate-300">Drag</kbd> para reordenar</span>
           </div>
           <p className="text-[10px] uppercase tracking-widest font-bold opacity-50">ProcessFlow Improvement Tool &copy; 2025</p>
        </div>
      </div>
    </div>
  );
}

export default App;