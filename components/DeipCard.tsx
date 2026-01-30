
import React from 'react';
import { DeipItem } from '../types/process';
import { AlertCircle, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface DeipCardProps {
  item: DeipItem;
  isSelected: boolean;
  onClick: () => void;
  onDelete: () => void;
}

export const DeipCard: React.FC<DeipCardProps> = ({ item, isSelected, onClick, onDelete }) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "relative p-3 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md group bg-white pr-8",
        isSelected ? "border-blue-600 ring-2 ring-blue-50" : "border-slate-200 hover:border-blue-300",
        item.attention && !isSelected && "border-red-300 bg-red-50 hover:border-red-400"
      )}
    >
      {item.attention && (
        <div className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-sm z-10">
           <AlertCircle size={12} fill="currentColor" className="text-white" />
        </div>
      )}
      
      <div className="flex flex-col gap-1">
        <h4 className={cn(
          "font-bold text-xs leading-tight line-clamp-2",
          item.attention ? "text-red-700" : "text-slate-800"
        )}>
          {item.title || "Novo Item"}
        </h4>
        <p className="text-[10px] text-slate-500 line-clamp-2 min-h-[1.5em]">
          {item.description || "Sem descrição..."}
        </p>
      </div>

      <button
        onClick={(e) => {
            e.stopPropagation();
            onDelete();
        }}
        className="absolute top-2 right-2 p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-all z-20"
        title="Excluir"
      >
        <Trash2 size={14} />
      </button>
    </div>
  );
};
