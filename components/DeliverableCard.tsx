import React, { useState, useMemo } from 'react';
import { Deliverable, ProcessImprovement } from '../types/process';
import { EditableText } from './EditableText';
import { Button } from './ui/button';
import { Trash2, Link, X, CheckSquare } from 'lucide-react';
import { cn } from '../lib/utils';

interface DeliverableCardProps {
    deliverable: Deliverable;
    fullData: ProcessImprovement;
    onUpdate: (updated: Deliverable) => void;
    onDelete: () => void;
}

export const DeliverableCard: React.FC<DeliverableCardProps> = ({ deliverable, fullData, onUpdate, onDelete }) => {
    const [isLinking, setIsLinking] = useState(false);

    // Flatten all stories to find available ones
    const allStories = useMemo(() => {
        const stories: { storyId: string; text: string; stepName: string; userName: string; priority: string }[] = [];
        fullData.steps.forEach(step => {
            step.userCards.forEach(card => {
                card.stories.forEach(story => {
                    stories.push({
                        storyId: story.id,
                        text: story.text,
                        stepName: step.name,
                        userName: card.userName,
                        priority: story.priority
                    });
                });
            });
        });
        return stories;
    }, [fullData]);

    // Stories linked to THIS deliverable
    const linkedStories = allStories.filter(s => deliverable.linkedStoryIds.includes(s.storyId));

    const toggleStoryLink = (storyId: string) => {
        let newIds = [...deliverable.linkedStoryIds];
        if (newIds.includes(storyId)) {
            newIds = newIds.filter(id => id !== storyId);
        } else {
            newIds.push(storyId);
        }
        onUpdate({ ...deliverable, linkedStoryIds: newIds });
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 flex flex-col h-full min-h-[350px]">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 flex items-start justify-between bg-slate-50 rounded-t-xl">
                <div className="flex-1 mr-2">
                    <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Entregável</label>
                    <EditableText
                        value={deliverable.title}
                        onChange={(val) => onUpdate({ ...deliverable, title: val })}
                        placeholder="Título da Entrega"
                        className="font-bold text-lg text-slate-800"
                    />
                </div>
                <button onClick={onDelete} className="text-slate-300 hover:text-red-500 transition-colors">
                    <Trash2 size={16} />
                </button>
            </div>

            {/* Description */}
            <div className="p-4 border-b border-slate-100 bg-white">
                <EditableText
                    value={deliverable.description}
                    onChange={(val) => onUpdate({ ...deliverable, description: val })}
                    placeholder="O que será entregue? Qual o valor de negócio?"
                    multiline
                    className="text-sm text-slate-600 min-h-[60px]"
                />
            </div>

            {/* Linked Stories Area */}
            <div className="flex-1 p-4 bg-slate-50/50 flex flex-col">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <Link size={14} className="text-slate-400" />
                        <span className="text-xs font-bold uppercase text-slate-500">Histórias Vinculadas ({linkedStories.length})</span>
                    </div>
                    <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => setIsLinking(!isLinking)}
                        className="h-6 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                        {isLinking ? 'Concluir Seleção' : 'Vincular Histórias'}
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2 max-h-[300px]">
                    {isLinking ? (
                        // Selection Mode
                        <div className="space-y-2">
                             {allStories.length === 0 && <p className="text-xs text-slate-400 text-center italic py-4">Nenhuma história criada no processo.</p>}
                             {allStories.map(story => {
                                 const isSelected = deliverable.linkedStoryIds.includes(story.storyId);
                                 return (
                                     <div 
                                        key={story.storyId}
                                        onClick={() => toggleStoryLink(story.storyId)}
                                        className={cn(
                                            "p-2 rounded border text-xs cursor-pointer transition-all hover:shadow-sm flex items-start gap-2",
                                            isSelected ? "bg-blue-50 border-blue-200" : "bg-white border-slate-200 hover:border-blue-300"
                                        )}
                                     >
                                        <div className={cn(
                                            "w-4 h-4 rounded border flex items-center justify-center shrink-0 mt-0.5 transition-colors",
                                            isSelected ? "bg-blue-600 border-blue-600 text-white" : "bg-white border-slate-300"
                                        )}>
                                            {isSelected && <CheckSquare size={10} />}
                                        </div>
                                        <div className="flex-1">
                                            <p className={cn("leading-tight font-medium", isSelected ? "text-blue-900" : "text-slate-700")}>{story.text}</p>
                                            <div className="flex items-center gap-2 mt-1 opacity-70">
                                                <span className="text-[10px] bg-slate-100 px-1 rounded">{story.stepName}</span>
                                                <span className="text-[10px] bg-slate-100 px-1 rounded">{story.userName}</span>
                                                <span className={cn(
                                                    "text-[10px] px-1 rounded font-bold uppercase", 
                                                    story.priority === 'Essencial' ? "text-red-600 bg-red-50" : "text-slate-500 bg-slate-100"
                                                )}>{story.priority}</span>
                                            </div>
                                        </div>
                                     </div>
                                 )
                             })}
                        </div>
                    ) : (
                        // View Mode
                        <>
                            {linkedStories.length === 0 ? (
                                <div className="text-center py-8 text-slate-400 text-xs italic border-2 border-dashed border-slate-200 rounded-lg">
                                    Nenhuma história vinculada a este entregável.
                                </div>
                            ) : (
                                linkedStories.map(story => (
                                    <div key={story.storyId} className="bg-white p-2 rounded border border-slate-200 text-xs shadow-sm group relative">
                                        <p className="text-slate-700 font-medium mb-1 pr-4">{story.text}</p>
                                        <div className="flex flex-wrap gap-1">
                                            <span className="text-[9px] bg-slate-100 text-slate-500 px-1 rounded border border-slate-100">{story.stepName}</span>
                                            <span className="text-[9px] bg-slate-100 text-slate-500 px-1 rounded border border-slate-100">{story.userName}</span>
                                        </div>
                                        <button 
                                            onClick={() => toggleStoryLink(story.storyId)}
                                            className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title="Desvincular"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};