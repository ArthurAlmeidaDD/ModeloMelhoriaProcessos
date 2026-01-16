import React from 'react';
import { MappingNote } from '../types/process';
import { EditableText } from './EditableText';
import { Button } from './ui/button';
import { Trash2, Calendar, User } from 'lucide-react';
import { Input } from './ui/input';

interface MappingCardProps {
    mapping: MappingNote;
    onUpdate: (updated: MappingNote) => void;
    onDelete: () => void;
}

export const MappingCard: React.FC<MappingCardProps> = ({ mapping, onUpdate, onDelete }) => {
    return (
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm flex flex-col gap-3 group hover:border-blue-300 transition-colors">
            
            {/* Header Row: Interviewee & Date */}
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between border-b border-slate-100 pb-3">
                <div className="flex items-center gap-2 flex-1 w-full sm:w-auto">
                    <div className="bg-orange-100 p-1.5 rounded-md text-orange-600 shrink-0">
                        <User size={14} />
                    </div>
                    <div className="flex-1">
                         <label className="text-[9px] uppercase font-bold text-slate-400 block leading-none mb-0.5">Entrevistado</label>
                         <EditableText 
                            value={mapping.interviewee} 
                            onChange={(val) => onUpdate({ ...mapping, interviewee: val })} 
                            placeholder="Nome da pessoa"
                            className="font-semibold text-sm text-slate-700 w-full"
                         />
                    </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto sm:border-l sm:border-slate-100 sm:pl-3">
                    <div className="bg-slate-100 p-1.5 rounded-md text-slate-500 shrink-0">
                        <Calendar size={14} />
                    </div>
                     <div className="flex-1 sm:w-32">
                         <label className="text-[9px] uppercase font-bold text-slate-400 block leading-none mb-0.5">Data</label>
                         <Input 
                            type="date" 
                            value={mapping.date}
                            onChange={(e) => onUpdate({ ...mapping, date: e.target.value })}
                            className="h-7 text-xs py-0 border-none shadow-none focus-visible:ring-0 px-0 w-full text-slate-600 bg-transparent font-medium"
                         />
                    </div>
                </div>

                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={onDelete} 
                    className="h-7 w-7 text-slate-300 hover:text-red-500 hover:bg-red-50 absolute top-2 right-2 sm:static sm:top-auto sm:right-auto"
                    title="Excluir Mapeamento"
                >
                    <Trash2 size={14} />
                </Button>
            </div>

            {/* Body: Notes */}
            <div className="flex-1">
                <EditableText
                    value={mapping.notes}
                    onChange={(val) => onUpdate({ ...mapping, notes: val })}
                    placeholder="Anote aqui os pontos levantados durante o mapeamento, dores, observações e detalhes técnicos..."
                    multiline
                    className="text-sm text-slate-600 min-h-[100px] leading-relaxed bg-slate-50 p-2 rounded border border-transparent hover:border-slate-200"
                />
            </div>
        </div>
    );
};