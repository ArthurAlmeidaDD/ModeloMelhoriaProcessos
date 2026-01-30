
import React from 'react';
import { DeipItem } from '../types/process';
import { EditableText } from './EditableText';
import { Button } from './ui/button';
import { Trash2, AlertCircle, FileText } from 'lucide-react';
import { cn } from '../lib/utils';

interface DeipItemDetailsProps {
  item: DeipItem;
  onUpdate: (updatedItem: DeipItem) => void;
  onDelete: () => void;
}

export const DeipItemDetails: React.FC<DeipItemDetailsProps> = ({ item, onUpdate, onDelete }) => {
  
  const getCategoryLabel = (cat: string) => {
      switch(cat) {
          case 'policies': return 'Política / Regra / Padrão';
          case 'inputs': return 'Entrada / Premissa';
          case 'outputs': return 'Saída / Entrega';
          case 'resources': return 'Recurso / Suporte';
          default: return 'Item';
      }
  };

  const getColorClass = (cat: string) => {
    switch(cat) {
        case 'policies': return 'text-slate-600';
        case 'inputs': return 'text-green-600';
        case 'outputs': return 'text-blue-600';
        case 'resources': return 'text-amber-600';
        default: return 'text-slate-600';
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-50 relative">
        <div className="p-6 border-b border-slate-200 bg-white flex items-center justify-between">
            <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                    <span className={cn("text-[10px] uppercase font-bold tracking-wider", getColorClass(item.category))}>
                        {getCategoryLabel(item.category)}
                    </span>
                    {item.attention && (
                        <span className="flex items-center gap-1 bg-red-100 text-red-700 text-[9px] px-1.5 py-0.5 rounded-full font-bold">
                            <AlertCircle size={10} /> ATENÇÃO
                        </span>
                    )}
                </div>
                <EditableText
                    value={item.title}
                    onChange={(val) => onUpdate({ ...item, title: val })}
                    placeholder="Título do Item"
                    className="text-xl font-bold text-slate-800"
                />
            </div>
            <div className="flex items-center gap-2">
                <Button 
                    variant={item.attention ? "destructive" : "outline"} 
                    size="sm"
                    onClick={() => onUpdate({ ...item, attention: !item.attention })}
                    className={cn(
                        "transition-all text-xs",
                        !item.attention && "text-slate-500 hover:text-red-600 border-slate-200"
                    )}
                >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    {item.attention ? "Remover Destaque" : "Destacar"}
                </Button>
                <Button variant="ghost" size="icon" onClick={onDelete} className="text-slate-300 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="w-5 h-5" />
                </Button>
            </div>
        </div>

        <div className="flex-1 p-6 overflow-y-auto">
             <div className="max-w-3xl mx-auto bg-white border border-slate-200 rounded-xl p-6 shadow-sm min-h-[200px] flex flex-col">
                <div className="flex items-center gap-2 text-slate-400 mb-2">
                    <FileText size={16} />
                    <span className="text-xs font-bold uppercase">Descrição Detalhada</span>
                </div>
                <EditableText
                    value={item.description}
                    onChange={(val) => onUpdate({ ...item, description: val })}
                    placeholder="Descreva este item com mais detalhes. Quais são as especificações? Quais são as regras aplicáveis?"
                    multiline
                    className="flex-1 text-sm leading-relaxed text-slate-700 min-h-[150px]"
                />
             </div>
        </div>
    </div>
  );
};
