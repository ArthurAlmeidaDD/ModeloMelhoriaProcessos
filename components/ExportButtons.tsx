
import React from 'react';
import { Button } from './ui/button';
import { FileJson, Download, Upload, FileText, Table, FileType, ChevronDown, Save, Code } from 'lucide-react';
import { ProcessImprovement } from '../types/process';
import { exportToCSV, exportToXLSX, exportToPDF, exportToJson, exportToHTML } from '../utils/exportUtils';

interface ExportButtonsProps {
  data: ProcessImprovement;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

interface SimpleDropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
}

const SimpleDropdown: React.FC<SimpleDropdownProps> = ({ trigger, children }) => {
    const [open, setOpen] = React.useState(false);
    return (
        <div className="relative inline-block text-left">
            <div onClick={() => setOpen(!open)} className="cursor-pointer">{trigger}</div>
            {open && (
                <>
                <div className="fixed inset-0 z-40" onClick={() => setOpen(false)}></div>
                <div className="absolute right-0 z-50 mt-2 w-64 origin-top-right rounded-xl bg-white shadow-2xl ring-1 ring-slate-950/5 focus:outline-none overflow-hidden animate-in fade-in zoom-in-95 duration-100">
                    <div className="py-2" onClick={() => setOpen(false)}>
                        {children}
                    </div>
                </div>
                </>
            )}
        </div>
    )
}

export const ExportButtons: React.FC<ExportButtonsProps> = ({ data, onImport }) => {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="relative inline-block group">
          <input 
            type="file" 
            onChange={onImport} 
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" 
            accept=".json"
          />
          <Button variant="outline" size="sm" className="bg-white hover:bg-slate-50 text-slate-700 border-slate-200 font-semibold">
             <Upload className="w-4 h-4 mr-2 text-brand" />
             Abrir Projeto
          </Button>
      </div>
      
      <SimpleDropdown 
        trigger={
            <Button variant="default" size="sm" className="bg-brand hover:bg-brand-900 text-white font-bold shadow-lg shadow-brand/20 transition-all active:scale-95">
                <Download className="w-4 h-4 mr-2" />
                Salvar / Exportar
                <ChevronDown className="w-3 h-3 ml-2 opacity-50" />
            </Button>
        }
      >
        <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">
            Arquivo de Trabalho
        </div>
        <button 
            className="w-full text-left px-4 py-3 text-sm text-brand font-bold hover:bg-brand-50 flex items-center transition-colors group" 
            onClick={() => exportToJson(data)}
        >
             <div className="p-1.5 bg-brand/10 rounded-md mr-3 group-hover:bg-brand group-hover:text-white transition-colors">
                <FileJson className="w-4 h-4" />
             </div>
             <div>
                <p>Salvar Projeto JSON</p>
                <p className="text-[10px] text-slate-400 font-normal italic">Formato editável para reabrir depois</p>
             </div>
        </button>

        <div className="px-4 py-2 text-[10px] font-black text-slate-400 uppercase tracking-widest border-t border-b border-slate-50 my-1">
            Exportar Relatórios
        </div>
        <button className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center transition-colors font-medium" onClick={() => exportToHTML(data)}>
             <Code className="w-4 h-4 mr-3 text-blue-500" />
             Página HTML (Visualização)
        </button>
        <button className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center transition-colors font-medium" onClick={() => exportToXLSX(data)}>
             <Table className="w-4 h-4 mr-3 text-green-600" />
             Planilha Excel (.xlsx)
        </button>
        
        {/* PDF Options */}
        <div className="border-t border-slate-50 my-1"></div>
        <button className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center transition-colors font-medium" onClick={() => exportToPDF(data, 'simple')}>
             <FileType className="w-4 h-4 mr-3 text-red-600" />
             PDF (Resumido)
             <span className="ml-auto text-[9px] text-slate-400 border border-slate-200 px-1 rounded">Cenários</span>
        </button>
        <button className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center transition-colors font-medium" onClick={() => exportToPDF(data, 'complete')}>
             <FileType className="w-4 h-4 mr-3 text-red-600" />
             PDF (Completo)
             <span className="ml-auto text-[9px] text-slate-400 border border-slate-200 px-1 rounded">+Inputs/Outputs</span>
        </button>

        <div className="border-t border-slate-50 my-1"></div>
        <button className="w-full text-left px-4 py-3 text-sm text-slate-700 hover:bg-slate-50 flex items-center transition-colors font-medium" onClick={() => exportToCSV(data)}>
             <FileText className="w-4 h-4 mr-3 text-slate-500" />
             Dados CSV (.csv)
        </button>
      </SimpleDropdown>
    </div>
  );
};
