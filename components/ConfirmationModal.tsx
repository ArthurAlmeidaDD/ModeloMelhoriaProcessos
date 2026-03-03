import React from 'react';
import { Button } from './ui/button';
import { AlertTriangle, X } from 'lucide-react';

interface ConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onSaveAndConfirm: () => void;
  title: string;
  description: string;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  onSaveAndConfirm,
  title,
  description,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 relative animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={20} />
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mb-4">
            <AlertTriangle className="w-6 h-6 text-amber-600" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
          <p className="text-slate-500 text-sm leading-relaxed">{description}</p>
        </div>

        <div className="flex flex-col gap-3">
          <Button 
            onClick={onSaveAndConfirm}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold"
          >
            Salvar Projeto Atual e Criar Novo
          </Button>
          
          <Button 
            onClick={onConfirm}
            variant="destructive"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold"
          >
            Descartar e Criar Novo (Sem Salvar)
          </Button>

          <Button 
            onClick={onClose}
            variant="ghost"
            className="w-full text-slate-600 hover:bg-slate-100"
          >
            Cancelar
          </Button>
        </div>
      </div>
    </div>
  );
};
