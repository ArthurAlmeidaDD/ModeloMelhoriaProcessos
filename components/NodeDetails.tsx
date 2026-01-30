
import React from 'react';
import { ProcessNode, SimpleCard } from '../types/process';
import { EditableText } from './EditableText';
import { Button } from './ui/button';
import { Plus, Trash2, Play, Flag, ListTodo } from 'lucide-react';
import { generateId, cn } from '../lib/utils';

interface NodeDetailsProps {
  node: ProcessNode;
  type: 'start' | 'end';
  onUpdate: (updatedNode: ProcessNode) => void;
}

export const NodeDetails: React.FC<NodeDetailsProps> = ({ node, type, onUpdate }) => {
  if (!node) return null;

  const addCard = () => {
    const newCard: SimpleCard = {
      id: generateId(),
      title: '',
      text: ''
    };
    onUpdate({ ...node, cards: [...node.cards, newCard] });
  };

  const updateCard = (id: string, field: 'title' | 'text', value: string) => {
    const newCards = node.cards.map(c => 
      c.id === id ? { ...c, [field]: value } : c
    );
    onUpdate({ ...node, cards: newCards });
  };

  const deleteCard = (id: string) => {
    if (confirm('Excluir este card?')) {
      const newCards = node.cards.filter(c => c.id !== id);
      onUpdate({ ...node, cards: newCards });
    }
  };

  const isStart = type === 'start';
  const tabTitle = isStart ? 'Pré-Operacional' : 'Pós-Operacional';
  const colorClass = isStart ? 'text-green-600' : 'text-red-600';
  const bgClass = isStart ? 'bg-green-50' : 'bg-red-50';
  const borderClass = isStart ? 'border-green-200' : 'border-red-200';

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-50">
      {/* Tabs Bar */}
      <div className="bg-white border-b border-slate-200 px-6 flex items-center gap-6 shadow-sm z-10">
        <button
            className={cn(
                "py-4 text-sm font-bold border-b-2 flex items-center gap-2 transition-colors",
                isStart ? "border-green-600 text-green-700" : "border-red-600 text-red-700"
            )}
        >
            {isStart ? <Play size={16} /> : <Flag size={16} />}
            {tabTitle}
            <span className="bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full text-[10px]">
                {node.cards.length}
            </span>
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
        <div className="max-w-[1200px] mx-auto">
             
             <div className="flex items-center justify-between mb-6">
                 <div>
                    <h2 className={cn("text-xl font-bold flex items-center gap-2", colorClass)}>
                        {isStart ? "Premissas e Entradas Iniciais" : "Entregas Finais e Conclusão"}
                    </h2>
                    <p className="text-slate-500 text-sm mt-1">
                        {isStart 
                            ? "Defina o que é necessário antes do processo começar (gatilhos, regras iniciais, premissas)." 
                            : "Defina o que é gerado ao final de todo o fluxo (resultados, entregas finais, KPIs)."}
                    </p>
                 </div>
                 <Button onClick={addCard} className={cn("text-white shadow-sm", isStart ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700")}>
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Item
                 </Button>
             </div>

             {node.cards.length === 0 ? (
                 <div className="bg-white border-2 border-dashed border-slate-200 rounded-xl p-12 text-center flex flex-col items-center justify-center">
                    <div className={cn("p-4 rounded-full mb-4", bgClass)}>
                        <ListTodo className={cn("w-8 h-8", colorClass)} />
                    </div>
                    <h4 className="text-slate-600 font-medium mb-1">Nenhum item registrado</h4>
                    <p className="text-slate-400 text-sm mb-4">
                        Adicione cards para documentar o {isStart ? 'início' : 'fim'} do processo.
                    </p>
                    <Button onClick={addCard} variant="outline" className={cn("border-slate-200", isStart ? "text-green-700 hover:bg-green-50" : "text-red-700 hover:bg-red-50")}>
                        Criar Primeiro Item
                    </Button>
                </div>
             ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                     {node.cards.map(card => (
                         <div key={card.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col group hover:shadow-md transition-shadow">
                             <div className={cn("h-1.5 w-full", isStart ? "bg-green-500" : "bg-red-500")}></div>
                             
                             <div className="p-4 border-b border-slate-100 flex items-start gap-3">
                                 <div className="flex-1">
                                    <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Título</label>
                                    <EditableText 
                                        value={card.title} 
                                        onChange={(val) => updateCard(card.id, 'title', val)}
                                        placeholder="Título do Item"
                                        className="font-bold text-slate-800"
                                    />
                                 </div>
                                 <button 
                                    onClick={() => deleteCard(card.id)}
                                    className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <Trash2 size={16} />
                                </button>
                             </div>

                             <div className="p-4 flex-1 bg-slate-50/30">
                                <label className="text-[10px] uppercase font-bold text-slate-400 mb-1 block">Descrição</label>
                                <EditableText 
                                    value={card.text} 
                                    onChange={(val) => updateCard(card.id, 'text', val)}
                                    placeholder="Descreva este item..."
                                    multiline
                                    className="text-sm text-slate-600 min-h-[80px]"
                                />
                             </div>
                         </div>
                     ))}
                 </div>
             )}

        </div>
      </div>
    </div>
  );
};
