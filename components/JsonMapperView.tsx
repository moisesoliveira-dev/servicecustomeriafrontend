"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { GoogleGenAI } from "@google/genai";
import { Icons } from './Icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Badge, CodeEditor } from './ui/Core';

const MapperHeader: React.FC<{ company: any; isAdmin: boolean; toggleAdmin: () => void; runTest: () => void; loading: boolean }> = ({ company, isAdmin, toggleAdmin, runTest, loading }) => (
    <header className="p-8 border-b border-white/5 flex justify-between items-center bg-slate-950/20 backdrop-blur-xl shrink-0">
        <div>
            <div className="flex items-center space-x-3 mb-1">
                <div className={`w-8 h-8 rounded-xl ${company.color} flex items-center justify-center text-xs font-black text-white`}>{company.name[0]}</div>
                <h2 className="text-xl font-black text-white tracking-tight">{company.name}</h2>
                <Badge color="blue">CRM: {company.crmType}</Badge>
            </div>
            <p className="text-[12px] text-slate-500 font-bold uppercase tracking-[0.2em]">Transformer Inteligente & Protocol Management</p>
        </div>
        <div className="flex items-center space-x-4">
            <button onClick={toggleAdmin} className={`px-5 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all border ${isAdmin ? 'bg-amber-500/10 border-amber-500/30 text-amber-500 shadow-[0_0_15px_rgba(245,158,11,0.1)]' : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'}`}>
                {isAdmin ? '🔐 SAIR MODO ADMIN' : '🔓 CONFIGURAR PROTOCOLOS (ADMIN)'}
            </button>
            <button onClick={runTest} disabled={loading || isAdmin} className={`px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-[12px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-blue-600/20 ${(loading || isAdmin) ? 'opacity-50 grayscale' : ''}`}>
                {loading ? 'Interpretando...' : 'Testar Transformação'}
            </button>
        </div>
    </header>
);

const MapperTabs: React.FC<{ active: string; onSelect: (id: 'config' | 'preview') => void }> = ({ active, onSelect }) => (
    <div className="px-10 flex space-x-10 border-b border-white/5 bg-slate-900/10 shrink-0">
        {['config', 'preview'].map(tab => (
            <button key={tab} onClick={() => onSelect(tab as any)} className={`py-4 text-[12px] font-black uppercase tracking-widest transition-all relative ${active === tab ? 'text-blue-400' : 'text-slate-500 hover:text-slate-300'}`}>
                {tab === 'config' ? 'Lógica do Pipeline' : 'Preview da IA'}
                {active === tab && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-full" />}
            </button>
        ))}
    </div>
);

const JsonMapperView: React.FC = () => {
    const { activeCompany, updateCompany, globalSchema, outputTemplate } = useApp();
    const [activeTab, setActiveTab] = useState<'config' | 'preview'>('config');
    const [adminSubTab, setAdminSubTab] = useState<'ingestion' | 'output'>('ingestion');
    const [aiOutputPreview, setAiOutputPreview] = useState<string>("");
    const [isLoading, setIsLoading] = useState(false);
    const [isAdminMode, setIsAdminMode] = useState(false);

    const [tempIngestion, setTempIngestion] = useState("");
    const [tempOutput, setTempOutput] = useState("");
    const [schemaError, setSchemaError] = useState<string | null>(null);

    const config = activeCompany?.crmConfig || { sourceJson: "{}", aiInstructions: "" };
    const currentIngestion = activeCompany?.internalSchema || globalSchema;
    const currentOutput = activeCompany?.outputTemplate || outputTemplate;

    useEffect(() => {
        setTempIngestion(JSON.stringify(currentIngestion, null, 2));
        setTempOutput(JSON.stringify(currentOutput, null, 2));
    }, [activeCompany?.id, currentIngestion, currentOutput]);

    const saveAdminConfigs = () => {
        if (!activeCompany) return;
        setSchemaError(null);
        try {
            const ingestion = JSON.parse(tempIngestion);
            const output = JSON.parse(tempOutput);
            updateCompany(activeCompany.id, {
                internalSchema: ingestion,
                outputTemplate: output
            });
            setIsAdminMode(false);
        } catch (e: any) {
            setSchemaError("Erro de Sintaxe JSON: " + e.message);
        }
    };

    const runAiTest = async () => {
        if (!process.env.API_KEY || !activeCompany) return;
        setIsLoading(true);
        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            const prompt = `
        Aja como o Core Transformer da NexusAI.
        DADOS DE ENTRADA (${activeCompany.crmType}): ${config.sourceJson}
        SCHEMA DE INGESTÃO: ${JSON.stringify(currentIngestion)}
        SCHEMA DE SAÍDA (FINAL): ${JSON.stringify(currentOutput)}
        INSTRUÇÕES: ${config.aiInstructions}

        Retorne um JSON contendo a transformação para o SCHEMA DE INGESTÃO e um exemplo de como seria a resposta no SCHEMA DE SAÍDA.
      `;
            const response = await ai.models.generateContent({
                model: 'gemini-3-pro-preview',
                contents: prompt,
                config: { responseMimeType: "application/json" }
            });
            // FIX: The `text` property on `GenerateContentResponse` is a getter, not a method. Access it directly.
            setAiOutputPreview(response.text || "{}");
            setActiveTab('preview');
        } catch (e) { console.error(e); } finally { setIsLoading(false); }
    };

    if (!activeCompany) return null;

    return (
        <div className="flex-1 flex flex-col h-full bg-[#050811] overflow-hidden">
            <MapperHeader company={activeCompany} isAdmin={isAdminMode} toggleAdmin={() => setIsAdminMode(!isAdminMode)} runTest={runAiTest} loading={isLoading} />
            <MapperTabs active={activeTab} onSelect={setActiveTab} />

            <div className="flex-1 px-10 pt-10 flex gap-8 custom-scrollbar overflow-y-auto">
                {activeTab === 'config' ? (
                    <>
                        <div className="flex-1 flex flex-col space-y-6 pb-10">
                            <CodeEditor
                                label={`Payload Exemplo (${activeCompany.crmType})`}
                                icon={<Icons.Transformer />}
                                value={config.sourceJson || "{}"}
                                onChange={(val) => updateCompany(activeCompany.id, { crmConfig: { ...config, sourceJson: val } })}
                                readOnly={isAdminMode}
                            />
                        </div>
                        <div className="flex-1 flex flex-col space-y-6 pb-10">
                            <div className={`bg-slate-900 border rounded-[2rem] p-8 transition-opacity ${isAdminMode ? 'opacity-30 pointer-events-none' : 'border-slate-800'}`}>
                                <h3 className="text-[12px] font-black text-slate-500 uppercase tracking-widest mb-6">Prompt de Mapeamento (IA Logic)</h3>
                                <textarea className="w-full h-44 bg-slate-950 border border-slate-800 rounded-2xl p-6 text-sm text-slate-300 outline-none focus:ring-1 ring-blue-500/30" value={config.aiInstructions || ""} onChange={(e) => updateCompany(activeCompany.id, { crmConfig: { ...config, aiInstructions: e.target.value } })} placeholder="Prompt para IA..." />
                            </div>

                            <div className={`flex-1 flex flex-col border rounded-[2rem] p-8 transition-all duration-500 ${isAdminMode ? 'bg-slate-950 border-amber-500/20 ring-1 ring-amber-500/10' : 'bg-slate-900/40 border-slate-800'}`}>
                                <div className="flex justify-between items-center mb-6">
                                    <div className="flex space-x-4">
                                        <button
                                            onClick={() => setAdminSubTab('ingestion')}
                                            className={`text-[12px] font-black uppercase tracking-widest transition-colors ${adminSubTab === 'ingestion' ? 'text-blue-400' : 'text-slate-600'}`}
                                        >
                                            Ingestion Protocol
                                        </button>
                                        <button
                                            onClick={() => setAdminSubTab('output')}
                                            className={`text-[12px] font-black uppercase tracking-widest transition-colors ${adminSubTab === 'output' ? 'text-amber-500' : 'text-slate-600'}`}
                                        >
                                            Output Blueprint
                                        </button>
                                    </div>
                                    {isAdminMode && (
                                        <button onClick={saveAdminConfigs} className="text-[11px] font-black text-emerald-500 px-4 py-1.5 bg-emerald-500/10 border border-emerald-500/20 rounded-xl hover:bg-emerald-500/20 transition-all">
                                            SALVAR ALTERAÇÕES
                                        </button>
                                    )}
                                </div>

                                <div className="flex-1 bg-slate-950 rounded-2xl p-6 border border-white/5 overflow-auto shadow-inner relative">
                                    <AnimatePresence mode="wait">
                                        {adminSubTab === 'ingestion' ? (
                                            <motion.div key="ingestion" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                                                {isAdminMode ? (
                                                    <textarea className="w-full h-full bg-transparent font-mono text-[12px] text-blue-300 outline-none resize-none" value={tempIngestion} onChange={e => setTempIngestion(e.target.value)} spellCheck={false} />
                                                ) : (
                                                    <pre className="text-[12px] text-blue-500/80 font-mono leading-relaxed">{JSON.stringify(currentIngestion, null, 2)}</pre>
                                                )}
                                            </motion.div>
                                        ) : (
                                            <motion.div key="output" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="h-full">
                                                {isAdminMode ? (
                                                    <textarea className="w-full h-full bg-transparent font-mono text-[12px] text-amber-500 outline-none resize-none" value={tempOutput} onChange={e => setTempOutput(e.target.value)} spellCheck={false} />
                                                ) : (
                                                    <pre className="text-[12px] text-amber-500/80 font-mono leading-relaxed">{JSON.stringify(currentOutput, null, 2)}</pre>
                                                )}
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                                {schemaError && <p className="text-rose-500 text-[12px] mt-4 font-bold uppercase tracking-widest">{schemaError}</p>}
                                {!isAdminMode && (
                                    <p className="mt-4 text-[10px] text-slate-600 font-black uppercase tracking-[0.2em] text-center">
                                        Clique em configurar protocolos para editar as estruturas desta empresa.
                                    </p>
                                )}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 bg-slate-950 border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl">
                        <div className="p-6 bg-blue-600/5 border-b border-white/5 flex justify-between shrink-0">
                            <span className="text-[12px] font-black text-blue-400 uppercase tracking-widest">Simulação de Pipeline Completo</span>
                            <Badge color="blue" pulse>Live Gemini Intelligence</Badge>
                        </div>
                        <div className="flex-1 p-10 overflow-auto font-mono text-xs text-slate-300 custom-scrollbar leading-relaxed">
                            {aiOutputPreview ? (
                                <pre className="p-8 bg-slate-900/30 rounded-3xl border border-white/5 whitespace-pre-wrap">{aiOutputPreview}</pre>
                            ) : (
                                <div className="h-full flex flex-col items-center justify-center opacity-30">
                                    <Icons.Transformer />
                                    <p className="text-[12px] font-black uppercase tracking-[0.2em] mt-4 text-slate-500">Aguardando execução do teste de estresse...</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default JsonMapperView;
