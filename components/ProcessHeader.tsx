import React from 'react';
import { EditableText } from './EditableText';
import { ProcessImprovement } from '../types/process';
import { Users, Building2, FileText, Tag } from 'lucide-react';

interface ProcessHeaderProps {
  data: ProcessImprovement;
  onUpdate: (field: keyof ProcessImprovement, value: string) => void;
}

export const ProcessHeader: React.FC<ProcessHeaderProps> = ({ data, onUpdate }) => {
  return (
    <div className="space-y-6">
      {/* Blue Banner Title */}
      <div className="bg-[#0F5F87] p-5 rounded-xl shadow-md flex items-center gap-4 text-white">
        <div className="p-2 bg-white/10 rounded-lg">
           <FileText className="w-8 h-8 text-white" />
        </div>
        <div className="flex-1">
          <label className="text-[10px] font-bold text-blue-100 uppercase tracking-wider mb-1 block opacity-80">
            Nome do Projeto
          </label>
          <EditableText
            value={data.title}
            onChange={(val) => onUpdate('title', val)}
            placeholder="CLIQUE PARA EDITAR O TÍTULO"
            className="text-2xl md:text-3xl font-bold text-white uppercase tracking-tight placeholder:text-blue-200/50 hover:bg-white/10 px-2 rounded -ml-2 border-none hover:border-none focus:ring-0"
          />
        </div>
      </div>

      {/* Info Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Theme Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-2 mb-3">
             <div className="p-1.5 bg-blue-50 text-[#0F5F87] rounded-md group-hover:bg-[#0F5F87] group-hover:text-white transition-colors">
                <Tag className="w-4 h-4" />
             </div>
             <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Tema</span>
          </div>
          <div className="pl-1">
            <EditableText
              value={data.theme}
              onChange={(val) => onUpdate('theme', val)}
              placeholder="Defina o tema..."
              className="font-medium text-slate-800 text-lg"
            />
          </div>
        </div>

        {/* Sectors Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-2 mb-3">
             <div className="p-1.5 bg-blue-50 text-[#0F5F87] rounded-md group-hover:bg-[#0F5F87] group-hover:text-white transition-colors">
                <Building2 className="w-4 h-4" />
             </div>
             <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Setor(es)</span>
          </div>
          <div className="pl-1">
            <EditableText
              value={data.sectors}
              onChange={(val) => onUpdate('sectors', val)}
              placeholder="Ex: Logística, Vendas"
              className="font-medium text-slate-800 text-lg"
            />
          </div>
        </div>

        {/* Managers Card */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex items-center gap-2 mb-3">
             <div className="p-1.5 bg-blue-50 text-[#0F5F87] rounded-md group-hover:bg-[#0F5F87] group-hover:text-white transition-colors">
                <Users className="w-4 h-4" />
             </div>
             <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Gestor(es)</span>
          </div>
          <div className="pl-1">
            <EditableText
              value={data.managers}
              onChange={(val) => onUpdate('managers', val)}
              placeholder="Ex: João, Maria"
              className="font-medium text-slate-800 text-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
};