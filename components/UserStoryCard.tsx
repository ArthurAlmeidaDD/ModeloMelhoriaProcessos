import React from 'react';
import { UserCard, StoryPriority } from '../types/process';
import { EditableText } from './EditableText';
import { Button } from './ui/button';
import { Trash2, Plus, User } from 'lucide-react';
import { generateId, cn } from '../lib/utils';

interface UserStoryCardProps {
  card: UserCard;
  onUpdate: (updatedCard: UserCard) => void;
  onDelete: () => void;
}

const PRIORITY_COLORS: Record<StoryPriority, string> = {
  'Essencial': 'bg-red-100 text-red-700 border-red-200',
  'Deveria ter': 'bg-yellow-100 text-yellow-700 border-yellow-200',
  'Poderia ter': 'bg-slate-100 text-slate-700 border-slate-200'
};

export const UserStoryCard: React.FC<UserStoryCardProps> = ({ card, onUpdate, onDelete }) => {
  
  const addStory = () => {
    if (card.stories.length >= 5) return;
    const newStory = {
      id: generateId(),
      text: '',
      priority: 'Essencial' as StoryPriority
    };
    onUpdate({ ...card, stories: [...card.stories, newStory] });
  };

  const updateStory = (storyId: string, field: 'text' | 'priority', value: string) => {
    const updatedStories = card.stories.map(s => 
      s.id === storyId ? { ...s, [field]: value } : s
    );
    onUpdate({ ...card, stories: updatedStories });
  };

  const removeStory = (e: React.MouseEvent, storyId: string) => {
    e.preventDefault();
    e.stopPropagation();
    // Exclusão direta para garantir funcionamento e agilidade
    const newStories = card.stories.filter(s => s.id !== storyId);
    onUpdate({ ...card, stories: newStories });
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 space-y-4">
      <div className="flex items-center justify-between border-b border-slate-200 pb-2">
        <div className="flex items-center gap-2 flex-1">
          <div className="bg-white p-1.5 rounded-full border border-slate-200 shadow-sm">
            <User className="w-4 h-4 text-slate-500" />
          </div>
          <div className="font-semibold text-sm text-slate-700 flex-1">
             <EditableText 
               value={card.userName} 
               onChange={(val) => onUpdate({ ...card, userName: val })} 
               placeholder="Nome do Usuário/Papel"
             />
          </div>
        </div>
        <Button variant="ghost" size="icon" onClick={onDelete} className="h-6 w-6 text-slate-400 hover:text-red-500 hover:bg-red-50" title="Remover Usuário">
          <Trash2 className="w-4 h-4" />
        </Button>
      </div>

      <div className="space-y-3">
        {card.stories.map((story) => (
          <div key={story.id} className="flex gap-2 items-start group">
            <div className="flex-1 space-y-1">
               <div className="flex items-center gap-2">
                  <select 
                    className={cn("text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border cursor-pointer outline-none", PRIORITY_COLORS[story.priority])}
                    value={story.priority}
                    onChange={(e) => updateStory(story.id, 'priority', e.target.value)}
                  >
                    <option value="Essencial">Essencial</option>
                    <option value="Deveria ter">Deveria Ter</option>
                    <option value="Poderia ter">Poderia Ter</option>
                  </select>
               </div>
               <EditableText
                 value={story.text}
                 onChange={(val) => updateStory(story.id, 'text', val)}
                 placeholder="Eu quero [ação] para [benefício]..."
                 multiline
                 className="text-sm text-slate-600 bg-white border border-slate-200 rounded p-2"
               />
            </div>
            <button 
              type="button"
              onClick={(e) => removeStory(e, story.id)}
              className="mt-6 text-slate-300 hover:text-red-600 hover:bg-red-50 p-1.5 rounded transition-all cursor-pointer z-10"
              title="Excluir História"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {card.stories.length < 5 && (
            <Button variant="outline" size="sm" onClick={addStory} className="w-full text-xs border-dashed text-slate-500">
                <Plus className="w-3 h-3 mr-1" /> Adicionar História
            </Button>
        )}
      </div>
    </div>
  );
};