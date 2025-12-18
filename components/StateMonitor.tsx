"use client";

import React, { useState } from 'react';

interface SessionState {
    id: string;
    customer: string;
    currentStage: 'INPUT' | 'MANAGER' | 'ROUTER' | 'WORKER' | 'OUTPUT' | 'COMPLETE';
    status: 'processing' | 'success' | 'error';
    lastStateLabel: string;
    agentUsed: string | null;
    timestamp: string;
    payload: any;
}

const MOCK_SESSIONS: SessionState[] = [
    {
        id: "SES-9821",
        customer: "John Doe",
        currentStage: 'WORKER',
        status: 'processing',
        lastStateLabel: "Triagem: Problema Técnico",
        agentUsed: "Google Drive Agent",
        timestamp: "10:45:22",
        payload: { intent: "access_issue", priority: "high", files_requested: true }
    },
    {
        id: "SES-9822",
        customer: "Jane Smith",
        currentStage: 'COMPLETE',
        status: 'success',
        lastStateLabel: "Resolvido: Alteração Plano",
        agentUsed: "Slack Worker",
        timestamp: "10:42:01",
        payload: { plan: "enterprise", status: "updated" }
    },
    {
        id: "SES-9823",
        customer: "Robert Brown",
        currentStage: 'MANAGER',
        status: 'processing',
        lastStateLabel: "Identificando Intenção...",
        agentUsed: null,
        timestamp: "10:46:10",
        payload: { raw_text: "Quero cancelar minha conta" }
    }
];

const StageIndicator: React.FC<{ current: string; stage: string; label: string; status: string }> = ({ current, stage, label, status }) => {
    const stagesOrder = ['INPUT', 'MANAGER', 'ROUTER', 'WORKER', 'OUTPUT', 'COMPLETE'];
    const currentIndex = stagesOrder.indexOf(current);
    const stageIndex = stagesOrder.indexOf(stage);

    const isPast = stageIndex < currentIndex;
    const isCurrent = stageIndex === currentIndex;
    const isError = isCurrent && status === 'error';

    return (
        <div className="flex flex-col items-center flex-1 relative">
            <div className={`
        w-10 h-10 rounded-full border-2 flex items-center justify-center z-10 transition-all duration-500
        ${isPast ? 'bg-blue-600 border-blue-600 text-white' :
                    isCurrent ? (isError ? 'bg-rose-500 border-rose-500 text-white animate-pulse' : 'bg-blue-600 border-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]') :
                        'bg-slate-900 border-slate-800 text-slate-600'}
      `}>
                {isPast ? (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
                ) : stageIndex + 1}
            </div>
            <span className={`text-[12px] mt-3 font-black uppercase tracking-widest text-center h-8 flex items-center ${isCurrent ? 'text-blue-400' : 'text-slate-500'}`}>
                {label}
            </span>
            {stage !== 'COMPLETE' && (
                <div className={`absolute top-5 left-[50%] w-full h-[2px] -z-0 ${isPast ? 'bg-blue-600' : 'bg-slate-800'}`}></div>
            )}
        </div>
    );
};

const StateMonitor: React.FC = () => {
    const [selectedSession, setSelectedSession] = useState<SessionState | null>(MOCK_SESSIONS[0]);

    return (
        <div className="flex-1 flex flex-col bg-[#0b1120] overflow-hidden">
            <header className="p-6 border-b border-slate-800 bg-slate-900/30 flex justify-between items-center shrink-0">
                <div>
                    <h2 className="text-xl font-bold text-white flex items-center">
                        <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full mr-3 animate-pulse shadow-[0_0_10px_#10b981]"></span>
                        Live State Monitor
                    </h2>
                    <p className="text-xs text-slate-500 mt-1 uppercase tracking-widest font-medium">Real-time Multi-Agent Orchestration Telemetry</p>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Sessions Sidebar */}
                <div className="w-80 border-r border-slate-800 overflow-y-auto bg-slate-900/10 shrink-0">
                    <div className="p-4 border-b border-slate-800 bg-slate-900/30">
                        <input
                            type="text"
                            placeholder="Search sessions..."
                            className="w-full bg-slate-950 border border-slate-800 rounded-lg px-4 py-2.5 text-xs text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600/50"
                        />
                    </div>
                    <div className="divide-y divide-slate-800/50">
                        {MOCK_SESSIONS.map(session => (
                            <button
                                key={session.id}
                                onClick={() => setSelectedSession(session)}
                                className={`w-full p-5 text-left transition-all hover:bg-slate-800/40 border-l-4 ${selectedSession?.id === session.id ? 'bg-blue-600/10 border-blue-500' : 'border-transparent'}`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <span className="text-[12px] font-mono font-bold text-slate-500 bg-slate-800 px-1.5 py-0.5 rounded">{session.id}</span>
                                    <span className="text-[12px] text-slate-600 font-bold">{session.timestamp}</span>
                                </div>
                                <p className="text-sm font-bold text-slate-200 mb-2">{session.customer}</p>
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center space-x-2">
                                        <div className={`w-1.5 h-1.5 rounded-full ${session.status === 'processing' ? 'bg-blue-500 animate-pulse' : 'bg-green-500'}`}></div>
                                        <span className="text-[12px] font-black uppercase text-slate-400">{session.currentStage}</span>
                                    </div>
                                    <span className="text-[12px] text-slate-600 font-bold italic truncate max-w-[120px]">
                                        {session.lastStateLabel}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Detail Content */}
                <div className="flex-1 p-10 overflow-y-auto bg-slate-950/40">
                    {selectedSession ? (
                        <div className="max-w-4xl mx-auto space-y-10 pb-10">
                            {/* Pipeline Status */}
                            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-10 shadow-2xl backdrop-blur-md">
                                <div className="flex justify-between items-center mb-12">
                                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.3em]">Core Execution Path</h3>
                                    <div className="flex items-center space-x-2 text-[12px] font-bold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full">
                                        <span>ACTIVE AGENT:</span>
                                        <span className="text-white">{selectedSession.agentUsed || 'SYSTEM_ONLY'}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-start px-4">
                                    <StageIndicator label="Input Transformer" stage="INPUT" current={selectedSession.currentStage} status={selectedSession.status} />
                                    <StageIndicator label="State Manager" stage="MANAGER" current={selectedSession.currentStage} status={selectedSession.status} />
                                    <StageIndicator label="State Router" stage="ROUTER" current={selectedSession.currentStage} status={selectedSession.status} />
                                    <StageIndicator label="Agent Worker" stage="WORKER" current={selectedSession.currentStage} status={selectedSession.status} />
                                    <StageIndicator label="Output Generator" stage="OUTPUT" current={selectedSession.currentStage} status={selectedSession.status} />
                                    <StageIndicator label="Success" stage="COMPLETE" current={selectedSession.currentStage} status={selectedSession.status} />
                                </div>
                            </div>

                            {/* Data Inspection */}
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[400px]">
                                    <div className="p-4 bg-slate-800/40 border-b border-slate-800 flex justify-between items-center">
                                        <span className="text-[12px] font-black text-slate-400 uppercase tracking-widest">State Data Context</span>
                                        <button className="text-[12px] text-blue-400 font-bold hover:underline">Copy JSON</button>
                                    </div>
                                    <div className="flex-1 p-6 font-mono text-xs text-emerald-400 overflow-auto bg-slate-950/50">
                                        <pre>{JSON.stringify(selectedSession.payload, null, 2)}</pre>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
                                        <h4 className="text-[12px] font-black text-slate-500 uppercase tracking-widest mb-4">AI Reasoning Trace</h4>
                                        <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl space-y-3">
                                            <p className="text-xs text-blue-200 italic leading-relaxed">
                                                "O State Manager detectou uma intenção de 'Suporte Técnico' com alta prioridade. O Router desviou o fluxo para o Agente especializado em File System para verificação automática de permissões."
                                            </p>
                                            <div className="flex items-center space-x-2">
                                                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                                <span className="text-[12px] font-bold text-slate-500 italic">Confidence: 0.982</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6">
                                        <h4 className="text-[12px] font-black text-slate-500 uppercase tracking-widest mb-4">Event Timeline</h4>
                                        <div className="space-y-4">
                                            {[
                                                { t: "10:45:22", e: "Worker: Started G-Drive verify" },
                                                { t: "10:45:19", e: "Router: Path branched to Agent" },
                                                { t: "10:45:15", e: "Manager: Logic gate applied" }
                                            ].map((item, idx) => (
                                                <div key={idx} className="flex items-center justify-between text-[12px] border-b border-slate-800/50 pb-2 last:border-0">
                                                    <span className="text-slate-500 font-mono">{item.t}</span>
                                                    <span className="text-slate-300 font-medium">{item.e}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-700">
                            <div className="w-20 h-20 bg-slate-900 rounded-full flex items-center justify-center mb-6">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </div>
                            <p className="text-lg font-medium">Select a session to monitor its journey</p>
                            <p className="text-sm mt-2 opacity-50">Real-time data stream will appear here</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default StateMonitor;
