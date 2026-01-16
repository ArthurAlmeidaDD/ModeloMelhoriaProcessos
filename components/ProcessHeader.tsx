import React from 'react';
import { EditableText } from './EditableText';
import { ProcessImprovement } from '../types/process';
import { Users, Building2, LayoutTemplate } from 'lucide-react';
import { ExportButtons } from './ExportButtons';

interface ProcessHeaderProps {
  data: ProcessImprovement;
  onUpdate: (field: keyof ProcessImprovement, value: string) => void;
  onImport: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export const ProcessHeader: React.FC<ProcessHeaderProps> = ({ data, onUpdate, onImport }) => {
  return (
    <header className="bg-slate-900 text-white shadow-md z-20 flex-shrink-0 border-b border-slate-700">
        <div className="max-w-[1600px] mx-auto p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            
            {/* Esquerda: Título e Ícone */}
            <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="bg-blue-600 p-2.5 rounded-lg shadow-lg shadow-blue-900/50">
                    <LayoutTemplate className="text-white w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-slate-400 text-[10px] uppercase tracking-widest font-bold mb-0.5">Modelagem de Processo</p>
                    <div className="flex items-center">
                        <EditableText
                            value={data.title}
                            onChange={(val) => onUpdate('title', val)}
                            placeholder="NOME DO PROCESSO"
                            className="text-xl font-bold tracking-tight text-white bg-transparent hover:bg-slate-800 px-1 -ml-1 rounded truncate w-full"
                        />
                    </div>
                </div>
            </div>

            {/* Centro: Setores e Gestores */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 bg-slate-800/50 p-2 rounded-lg border border-slate-700">
                <div className="flex items-center gap-2 px-2">
                    <Building2 className="w-4 h-4 text-slate-400" />
                    <div>
                        <p className="text-[9px] uppercase font-bold text-slate-500">Setores</p>
                        <EditableText
                            value={data.sectors}
                            onChange={(val) => onUpdate('sectors', val)}
                            placeholder="Definir setores..."
                            className="text-xs font-semibold text-slate-200 bg-transparent hover:bg-slate-700 px-1 -ml-1 rounded min-w-[100px]"
                        />
                    </div>
                </div>
                <div className="w-px h-8 bg-slate-700 hidden sm:block"></div>
                <div className="flex items-center gap-2 px-2">
                    <Users className="w-4 h-4 text-slate-400" />
                    <div>
                        <p className="text-[9px] uppercase font-bold text-slate-500">Gestores</p>
                        <EditableText
                            value={data.managers}
                            onChange={(val) => onUpdate('managers', val)}
                            placeholder="Definir gestores..."
                            className="text-xs font-semibold text-slate-200 bg-transparent hover:bg-slate-700 px-1 -ml-1 rounded min-w-[100px]"
                        />
                    </div>
                </div>
            </div>

            {/* Direita: Botões */}
            <div className="flex items-center gap-2">
                <ExportButtons data={data} onImport={onImport} />
            </div>
        </div>
    </header>
  );
};