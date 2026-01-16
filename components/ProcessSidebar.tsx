import React, { useState } from 'react';
import { ProcessImprovement } from '../types/process';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ChevronRight, ChevronLeft, ShieldAlert, Scale, Plus, Trash2 } from 'lucide-react';
import { cn } from '../lib/utils';

interface ProcessSidebarProps {
    data: ProcessImprovement;
    onUpdate: (field: keyof ProcessImprovement, value: any) => void;
    isOpen: boolean;
    onToggle: () => void;
}

export const ProcessSidebar: React.FC<ProcessSidebarProps> = ({ data, onUpdate, isOpen, onToggle }) => {
    const [newRule, setNewRule] = useState('');
    const [newRisk, setNewRisk] = useState('');

    const rules = data.processRules || [];
    const risks = data.risks || [];

    const addRule = () => {
        if (newRule.trim()) {
            onUpdate('processRules', [...rules, newRule.trim()]);
            setNewRule('');
        }
    };

    const removeRule = (idx: number) => {
        onUpdate('processRules', rules.filter((_, i) => i !== idx));
    };

    const addRisk = () => {
        if (newRisk.trim()) {
            onUpdate('risks', [...risks, newRisk.trim()]);
            setNewRisk('');
        }
    };

    const removeRisk = (idx: number) => {
        onUpdate('risks', risks.filter((_, i) => i !== idx));
    };

    return (
        <div className={cn(
            "h-full border-r border-slate-200 bg-white shadow-sm transition-all duration-300 ease-in-out relative shrink-0 z-20",
            isOpen ? "w-80" : "w-12"
        )}>
            {/* Toggle Button - Absolute to overlap border */}
            <button
                onClick={onToggle}
                className="absolute -right-3 top-24 w-6 h-6 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 shadow-sm hover:text-blue-600 hover:border-blue-300 z-50 focus:outline-none"
                title={isOpen ? "Fechar painel lateral" : "Abrir Regras e Riscos"}
            >
                {isOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
            </button>

            {/* Content Container - overflow hidden to clip the inner w-80 content when collapsed */}
            <div className="h-full w-full overflow-hidden relative">
                
                {/* OPEN STATE CONTENT */}
                <div className={cn(
                    "flex-1 overflow-y-auto custom-scrollbar flex flex-col w-80 h-full transition-opacity duration-300 absolute top-0 left-0 bg-white",
                    isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
                )}>
                    {/* Header */}
                    <div className="p-4 bg-slate-50 border-b border-slate-100 shrink-0">
                        <h3 className="font-bold text-slate-700 text-sm uppercase tracking-wide">Contexto do Processo</h3>
                    </div>

                    <div className="p-4 space-y-6 flex-1 overflow-y-auto custom-scrollbar">
                        {/* RULES SECTION */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                                <Scale className="w-4 h-4 text-indigo-600" />
                                Regras de Negócio
                            </div>
                            
                            <div className="space-y-2">
                                {rules.length === 0 && <p className="text-xs text-slate-400 italic">Nenhuma regra definida.</p>}
                                {rules.map((rule, idx) => (
                                    <div key={idx} className="group p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg text-xs text-slate-700 shadow-sm relative hover:border-indigo-200 transition-colors">
                                        <p className="pr-4 leading-relaxed">{rule}</p>
                                        <button 
                                            onClick={() => removeRule(idx)}
                                            className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-1 pt-1">
                                <Input 
                                    value={newRule}
                                    onChange={(e) => setNewRule(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addRule()}
                                    placeholder="Nova regra..."
                                    className="h-8 text-xs bg-white"
                                />
                                <Button size="icon" onClick={addRule} className="h-8 w-8 shrink-0 bg-slate-800 hover:bg-slate-700">
                                    <Plus size={14} />
                                </Button>
                            </div>
                        </div>

                        <div className="w-full border-t border-slate-100"></div>

                        {/* RISKS SECTION */}
                        <div className="space-y-3">
                            <div className="flex items-center gap-2 text-slate-800 font-bold text-sm">
                                <ShieldAlert className="w-4 h-4 text-amber-500" />
                                Riscos Detectados
                            </div>
                            
                            <div className="space-y-2">
                                {risks.length === 0 && <p className="text-xs text-slate-400 italic">Nenhum risco mapeado.</p>}
                                {risks.map((risk, idx) => (
                                    <div key={idx} className="group p-3 bg-amber-50/50 border border-amber-100 rounded-lg text-xs text-slate-700 shadow-sm relative hover:border-amber-200 transition-colors">
                                        <p className="pr-4 leading-relaxed">{risk}</p>
                                        <button 
                                            onClick={() => removeRisk(idx)}
                                            className="absolute top-2 right-2 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash2 size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>

                            <div className="flex gap-1 pt-1">
                                <Input 
                                    value={newRisk}
                                    onChange={(e) => setNewRisk(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && addRisk()}
                                    placeholder="Novo risco..."
                                    className="h-8 text-xs bg-white"
                                />
                                <Button size="icon" onClick={addRisk} className="h-8 w-8 shrink-0 bg-slate-800 hover:bg-slate-700">
                                    <Plus size={14} />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* CLOSED STATE CONTENT */}
                <div 
                    onClick={onToggle}
                    className={cn(
                        "absolute inset-0 flex flex-col items-center pt-32 cursor-pointer hover:bg-slate-50 transition-all duration-300 gap-6",
                        !isOpen ? "opacity-100 visible" : "opacity-0 invisible pointer-events-none"
                    )}
                >
                    <div className="transform -rotate-90 whitespace-nowrap text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2 mt-4">
                        REGRAS E RISCOS
                    </div>
                </div>

            </div>
        </div>
    );
};