"use client";

import React, { useState, useEffect } from 'react';
import { useApp } from '@/context/AppContext';
import { INTEGRATIONS_LIST } from '@/constants';
import { IntegrationStatus, Integration, Credential } from '@/types';
import { Badge, Card, SectionHeader } from './ui/Core';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from './Icons';

const StatusIndicator: React.FC<{ status: IntegrationStatus }> = ({ status }) => {
    const configs = {
        [IntegrationStatus.CONNECTED]: { color: 'emerald', label: 'Healthy', pulse: true },
        [IntegrationStatus.CONNECTING]: { color: 'blue', label: 'Testing...', pulse: true },
        [IntegrationStatus.ERROR]: { color: 'rose', label: 'Auth Error', pulse: false },
        [IntegrationStatus.EXPIRING]: { color: 'amber', label: 'Expiring Soon', pulse: true },
        [IntegrationStatus.DISCONNECTED]: { color: 'slate', label: 'Idle', pulse: false },
    };

    const config = configs[status] || configs[IntegrationStatus.DISCONNECTED];

    return <Badge color={config.color} pulse={config.pulse}>{config.label}</Badge>;
};

const IntegrationHub: React.FC = () => {
    const { activeCompany, updateCompany } = useApp();
    const [selectedAgent, setSelectedAgent] = useState<Integration | null>(null);
    const [credentials, setCredentials] = useState<Credential[]>([]);
    const [isTesting, setIsTesting] = useState<string | null>(null);
    const [formValues, setFormValues] = useState<Record<string, string>>({});

    useEffect(() => {
        if (activeCompany) {
            setCredentials(activeCompany.credentials || []);
        }
    }, [activeCompany]);

    const handleTestConnection = (id: string | number) => {
        setIsTesting(String(id));
        // Simulação de handshake com backend
        setTimeout(() => {
            setCredentials(prev => prev.map(c =>
                c.id === id ? { ...c, status: IntegrationStatus.CONNECTED, lastTested: new Date().toLocaleTimeString() } : c
            ));
            setIsTesting(null);
        }, 1500);
    };

    const handleCreateCredential = () => {
        if (!selectedAgent || !activeCompany) return;

        const newCred: Credential = {
            id: `cred-${Date.now()}`,
            alias: `${selectedAgent.name} - ${formValues.label || 'Default'}`,
            providerId: selectedAgent.id,
            status: IntegrationStatus.CONNECTING,
            lastTested: 'Never',
            credentialId: `sec_${Math.random().toString(36).substr(2, 9)}` // ID opaco
        };

        const updatedCreds = [...credentials, newCred];
        updateCompany(activeCompany.id, { credentials: updatedCreds });
        setCredentials(updatedCreds);
        setSelectedAgent(null);
        setFormValues({});

        // Inicia teste automático
        handleTestConnection(newCred.id);
    };

    if (!activeCompany) return null;

    return (
        <div className="flex-1 px-10 pt-10 pb-20 bg-[#02040a] overflow-y-auto custom-scrollbar">
            <SectionHeader
                title="Credential Manager"
                subtitle="Nexus Vault: Gestão de segredos e conectividade de agentes workforce"
                action={
                    <div className="flex items-center space-x-2 text-[12px] font-black text-slate-600 uppercase tracking-widest bg-slate-900/50 px-4 py-2 rounded-xl border border-white/5">
                        <Icons.Transformer />
                        <span>AES-256 Active</span>
                    </div>
                }
            />

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Lado Esquerdo: Biblioteca de Agentes */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="px-2">
                        <h3 className="text-[12px] font-black text-slate-600 uppercase tracking-[0.2em] mb-4">Catalog de Provedores</h3>
                    </div>
                    <div className="grid grid-cols-1 gap-3">
                        {INTEGRATIONS_LIST.map((agent) => (
                            <motion.button
                                key={agent.id}
                                whileHover={{ x: 5 }}
                                onClick={() => setSelectedAgent(agent as any)}
                                className={`flex items-center justify-between p-4 rounded-2xl border transition-all text-left group ${selectedAgent?.id === agent.id
                                    ? 'bg-blue-600/10 border-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.1)]'
                                    : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'
                                    }`}
                            >
                                <div className="flex items-center space-x-4">
                                    <span className="text-2xl group-hover:scale-110 transition-transform">{agent.icon}</span>
                                    <div>
                                        <p className={`text-xs font-bold ${selectedAgent?.id === agent.id ? 'text-blue-400' : 'text-slate-200'}`}>{agent.name}</p>
                                        <p className="text-[11px] text-slate-600 font-black uppercase tracking-widest">{agent.type}</p>
                                    </div>
                                </div>
                                <div className="text-slate-700 group-hover:text-blue-500 transition-colors">
                                    <Icons.ChevronDown />
                                </div>
                            </motion.button>
                        ))}
                    </div>
                </div>

                {/* Lado Direito: Credenciais Ativas e Formulário */}
                <div className="lg:col-span-8 space-y-8">
                    <AnimatePresence mode="wait">
                        {selectedAgent ? (
                            <motion.div
                                key="form"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                            >
                                <Card className="border-blue-500/30 bg-blue-600/5 relative overflow-hidden">
                                    <div className="absolute top-0 right-0 p-8 opacity-5">
                                        <span className="text-9xl">{selectedAgent.icon}</span>
                                    </div>

                                    <div className="relative z-10">
                                        <div className="flex justify-between items-start mb-8">
                                            <div>
                                                <h3 className="text-lg font-bold text-white">Configurar {selectedAgent.name}</h3>
                                                <p className="text-xs text-slate-500 mt-1">As credenciais serão enviadas via túnel encriptado para o cofre Nexus.</p>
                                            </div>
                                            <button onClick={() => setSelectedAgent(null)} className="text-slate-500 hover:text-white">
                                                <Icons.ChevronDown />
                                            </button>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                            <div className="space-y-2">
                                                <label className="text-[12px] font-black text-slate-600 uppercase tracking-widest">Apelido da Credencial</label>
                                                <input
                                                    type="text"
                                                    placeholder="Ex: Produção Cluster-A"
                                                    value={formValues['label'] || ''}
                                                    onChange={(e) => setFormValues({ ...formValues, label: e.target.value })}
                                                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:ring-1 ring-blue-500/50"
                                                />
                                            </div>
                                            {selectedAgent.configFields.map(field => (
                                                <div key={field.key} className="space-y-2">
                                                    <label className="text-[12px] font-black text-slate-600 uppercase tracking-widest">{field.label}</label>
                                                    <input
                                                        type={field.type === 'password' || field.type === 'secret' ? 'password' : 'text'}
                                                        placeholder={field.placeholder}
                                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white outline-none focus:ring-1 ring-blue-500/50"
                                                    />
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex justify-end space-x-4">
                                            <button onClick={() => setSelectedAgent(null)} className="px-6 py-2.5 text-[12px] font-black text-slate-400 uppercase tracking-widest">Descartar</button>
                                            <button onClick={handleCreateCredential} className="px-8 py-2.5 bg-blue-600 text-white text-[12px] font-black uppercase tracking-widest rounded-xl hover:bg-blue-500 shadow-xl shadow-blue-600/20">
                                                Autorizar & Salvar no Cofre
                                            </button>
                                        </div>
                                    </div>
                                </Card>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="list"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="space-y-4"
                            >
                                <div className="flex justify-between items-center px-2">
                                    <h3 className="text-[12px] font-black text-slate-600 uppercase tracking-[0.2em]">Cofre de Credenciais Ativas</h3>
                                    <Badge color="slate">{credentials.length} Segredos Armazenados</Badge>
                                </div>

                                {credentials.map(cred => {
                                    const provider = INTEGRATIONS_LIST.find(p => p.id === cred.providerId);
                                    return (
                                        <Card key={cred.id} noPadding className="hover:bg-slate-900/60 transition-colors border-slate-800/50">
                                            <div className="p-6 flex items-center justify-between">
                                                <div className="flex items-center space-x-6">
                                                    <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center text-2xl border border-white/5 shadow-inner">
                                                        {provider?.icon}
                                                    </div>
                                                    <div>
                                                        <div className="flex items-center space-x-3">
                                                            <h4 className="text-sm font-bold text-white">{cred.alias}</h4>
                                                            <StatusIndicator status={cred.status || IntegrationStatus.DISCONNECTED} />
                                                        </div>
                                                        <div className="flex items-center mt-1 space-x-4 text-[11px] font-black text-slate-600 uppercase tracking-widest">
                                                            <span>ID: {cred.credentialId}</span>
                                                            <span className="w-1 h-1 bg-slate-800 rounded-full"></span>
                                                            <span>Último Teste: {cred.lastTested}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="flex items-center space-x-3">
                                                    <button
                                                        onClick={() => handleTestConnection(cred.id)}
                                                        disabled={isTesting === cred.id}
                                                        className={`px-4 py-2 rounded-xl text-[11px] font-black uppercase tracking-widest border border-slate-800 transition-all ${isTesting === cred.id ? 'bg-blue-500/10 text-blue-400' : 'hover:bg-slate-800 text-slate-400'}`}
                                                    >
                                                        {isTesting === cred.id ? 'Handshake...' : 'Test Link'}
                                                    </button>
                                                    <button className="p-2 text-slate-700 hover:text-rose-500 transition-colors">
                                                        <Icons.ChevronDown />
                                                    </button>
                                                </div>
                                            </div>
                                        </Card>
                                    );
                                })}

                                {credentials.length === 0 && (
                                    <div className="py-20 flex flex-col items-center justify-center border-2 border-dashed border-slate-800/40 rounded-[3rem] bg-slate-900/10">
                                        <div className="w-16 h-16 bg-slate-950 rounded-3xl flex items-center justify-center text-slate-700 mb-6 border border-white/5">
                                            <Icons.Integrations />
                                        </div>
                                        <p className="text-[12px] font-black text-slate-600 uppercase tracking-[0.3em]">Nenhuma credencial ativa neste tenant</p>
                                        <p className="text-[11px] text-slate-700 font-bold uppercase mt-2">Selecione um provedor à esquerda para começar</p>
                                    </div>
                                )}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Security Disclaimer */}
                    <div className="p-6 rounded-[2rem] bg-slate-950/50 border border-white/5 flex items-center space-x-6">
                        <div className="w-10 h-10 bg-blue-500/10 rounded-xl flex items-center justify-center text-blue-500">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        </div>
                        <div>
                            <h5 className="text-[12px] font-black text-slate-400 uppercase tracking-widest">Security Protocol Alpha-9</h5>
                            <p className="text-[12px] text-slate-600 mt-1 leading-relaxed">
                                O NexusAI utiliza encriptação ponta-a-ponta. Suas chaves de API nunca são armazenadas em texto puro e são acessadas apenas via tokens efêmeros durante a execução do pipeline.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default IntegrationHub;
