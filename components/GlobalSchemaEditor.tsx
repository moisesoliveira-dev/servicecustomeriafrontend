"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { motion } from 'framer-motion';
import { Icons } from './Icons';

const GlobalSchemaEditor: React.FC = () => {
    const { activeCompany, globalSchema, updateCompany } = useApp();

    // Current company's specific schema or global template
    const currentSchema = activeCompany?.internalSchema || globalSchema;

    const [tempSchema, setTempSchema] = useState(JSON.stringify(currentSchema, null, 2));
    const [error, setError] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    // Update temp state when active company changes
    useEffect(() => {
        setTempSchema(JSON.stringify(currentSchema, null, 2));
    }, [activeCompany?.id, currentSchema]);

    const handleSave = () => {
        if (!activeCompany) return;
        setIsSaving(true);
        setError(null);
        try {
            const parsed = JSON.parse(tempSchema);
            updateCompany(activeCompany.id, { internalSchema: parsed });
            setTimeout(() => setIsSaving(false), 500);
        } catch (e: any) {
            setError("Erro de Sintaxe JSON: " + e.message);
            setIsSaving(false);
        }
    };

    if (!activeCompany) {
        return (
            <div className="flex-1 flex items-center justify-center bg-[#02040a]">
                <div className="text-center space-y-4">
                    <div className="w-20 h-20 bg-slate-900 rounded-3xl flex items-center justify-center mx-auto mb-6 border border-slate-800 text-slate-600">
                        <Icons.Transformer />
                    </div>
                    <h2 className="text-xl font-black text-white uppercase tracking-widest">Nenhuma Empresa Selecionada</h2>
                    <p className="text-slate-500 text-sm max-w-xs mx-auto">Selecione uma empresa no switcher lateral para gerenciar seu protocolo de dados exclusivo.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full bg-[#02040a] overflow-hidden">
            <header className="p-10 border-b border-white/5 flex justify-between items-end bg-slate-950/20 shrink-0">
                <div>
                    <div className="flex items-center space-x-3 mb-1">
                        <div className={`w-8 h-8 rounded-lg ${activeCompany.color} flex items-center justify-center text-[12px] font-black text-white`}>
                            {activeCompany.name[0]}
                        </div>
                        <h1 className="text-2xl font-black text-white tracking-tighter">{activeCompany.name}</h1>
                    </div>
                    <p className="text-slate-500 mt-1 uppercase tracking-[0.25em] text-[12px] font-black">Admin: Protocolo de Dados Exclusivo</p>
                </div>
                <div className="flex space-x-4">
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setTempSchema(JSON.stringify(currentSchema, null, 2))}
                        className="px-6 py-2.5 text-[12px] font-black text-slate-400 uppercase tracking-widest border border-slate-800 rounded-xl hover:bg-slate-900 transition-all"
                    >
                        Resetar Alterações
                    </motion.button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={handleSave}
                        disabled={isSaving}
                        className={`px-8 py-2.5 text-[12px] font-black text-white uppercase tracking-widest bg-blue-600 rounded-xl shadow-xl shadow-blue-600/20 transition-all ${isSaving ? 'opacity-50' : ''}`}
                    >
                        {isSaving ? 'Salvando...' : 'Aplicar nesta Empresa'}
                    </motion.button>
                </div>
            </header>

            <div className="flex-1 p-10 overflow-hidden flex flex-col">
                <div className="flex-1 bg-slate-900/40 border border-slate-800 rounded-[3rem] shadow-2xl flex flex-col overflow-hidden backdrop-blur-3xl ring-1 ring-white/5">
                    <div className="p-6 bg-slate-950/50 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                                <Icons.Transformer />
                            </div>
                            <div>
                                <h2 className="text-xs font-black text-slate-100 uppercase tracking-widest">Protocol Definition (JSON)</h2>
                                <p className="text-[11px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">Define a estrutura interna ALVO para esta empresa específica</p>
                            </div>
                        </div>
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="px-4 py-2 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-500 text-[12px] font-black"
                            >
                                {error}
                            </motion.div>
                        )}
                    </div>

                    <div className="flex-1 relative group">
                        <textarea
                            className="w-full h-full bg-slate-950/30 p-10 font-mono text-sm text-blue-300 outline-none resize-none custom-scrollbar leading-relaxed selection:bg-blue-500/30"
                            value={tempSchema}
                            onChange={(e) => setTempSchema(e.target.value)}
                            spellCheck={false}
                            placeholder='{ "key": "value" }'
                        />
                        <div className="absolute top-10 right-10 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <div className="px-3 py-1 bg-slate-900 border border-slate-800 rounded text-[11px] font-black text-slate-600 uppercase tracking-widest">TENANT SCOPE</div>
                            <div className="px-3 py-1 bg-slate-900 border border-slate-800 rounded text-[11px] font-black text-slate-600 uppercase tracking-widest">ENV: Production</div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex items-center space-x-6 px-4">
                    <div className="flex -space-x-2">
                        <div className="w-8 h-8 rounded-full border-2 border-[#02040a] bg-blue-600 flex items-center justify-center text-[12px] font-black text-white">IA</div>
                        <div className="w-8 h-8 rounded-full border-2 border-[#02040a] bg-indigo-600 flex items-center justify-center text-[12px] font-black text-white">CF</div>
                    </div>
                    <p className="text-[12px] text-slate-600 font-black uppercase tracking-widest">
                        Alterações neste schema são <span className="text-blue-500">isoladas</span> para {activeCompany.name}. O Transformer AI da empresa usará esta estrutura imediatamente.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default GlobalSchemaEditor;