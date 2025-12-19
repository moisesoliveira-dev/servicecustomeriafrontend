"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { Badge } from './ui/Core';
import { ExecutionLog, ExecutionStep } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { Icons } from './Icons';
import { MOCK_EXECUTIONS } from '@/constants';

// --- SUB-COMPONENTS ---

const TimelineStep: React.FC<{ step: ExecutionStep; isLast: boolean }> = ({ step, isLast }) => {
  const [showPayload, setShowPayload] = useState(false);
  const isFailed = step.status === 'FAILED';

  return (
    <div className="relative flex gap-8 pl-4">
      <div className="absolute top-0 left-4 w-0.5 h-full bg-slate-800 -z-10"></div>
      <div className={`w-8 h-8 rounded-full border-4 flex items-center justify-center z-10 shrink-0 ${isFailed ? 'bg-rose-500 border-slate-950 shadow-[0_0_10px_#f43f5e]' : 'bg-slate-900 border-slate-950'}`}>
        {isFailed ? <span className="text-white text-lg font-black">!</span> : <div className="w-2 h-2 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.8)]"></div>}
      </div>
      <div className={`flex-1 pb-10 group transition-all duration-300 ${isFailed ? '' : 'hover:!opacity-100'}`}>
        <div className="flex justify-between items-center mb-2">
          <h4 className={`text-xs font-black uppercase tracking-widest ${isFailed ? 'text-rose-400' : 'text-white'}`}>{step.name}</h4>
          <span className="text-[12px] text-slate-600 font-mono">{step.timestamp}</span>
        </div>
        <div className={`p-4 rounded-2xl bg-slate-950/50 border border-slate-800/50 transition-all ${isFailed ? 'border-rose-500/20' : ''}`}>
          <div className="flex justify-between items-center">
            <Badge color={isFailed ? 'rose' : 'slate'}>{step.status}</Badge>
            <button onClick={() => setShowPayload(!showPayload)} className="text-[12px] font-bold text-blue-500 uppercase tracking-widest hover:underline">{showPayload ? 'Ocultar Trace' : 'Exibir Trace'}</button>
          </div>
          <AnimatePresence>
            {showPayload && (
              <motion.div initial={{ height: 0, opacity: 0, marginTop: 0 }} animate={{ height: 'auto', opacity: 1, marginTop: '1rem' }} exit={{ height: 0, opacity: 0, marginTop: 0 }} className="space-y-4 overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-[11px] font-black text-slate-700 uppercase tracking-widest mb-1">Payload In</p>
                    <pre className="p-3 bg-slate-900 rounded-lg text-[12px] font-mono text-emerald-500 overflow-auto max-h-32 custom-scrollbar">{JSON.stringify(step.payloadIn, null, 2)}</pre>
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-slate-700 uppercase tracking-widest mb-1">Payload Out (Masked)</p>
                    <pre className="p-3 bg-slate-900 rounded-lg text-[12px] font-mono text-blue-400 overflow-auto max-h-32 custom-scrollbar">{JSON.stringify(step.payloadOut, (k, v) => (k.toLowerCase().includes('key') || k.toLowerCase().includes('token') || k.toLowerCase().includes('auth')) ? '••••••••' : v, 2)}</pre>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

const LogDetailView: React.FC<{ log: ExecutionLog | null }> = ({ log }) => (
  <div className="flex-1 p-10 overflow-y-auto custom-scrollbar bg-[#0b1120]/40">
    <AnimatePresence mode="wait">
      {log ? (
        <motion.div key={log.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} transition={{ duration: 0.3 }} className="max-w-4xl mx-auto pb-10">
          <header className="mb-12 flex justify-between items-end border-b border-white/5 pb-8">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <h2 className="text-2xl font-black text-white tracking-tight">Execution Trace</h2>
                <span className="px-3 py-1 bg-slate-800 rounded-lg text-[12px] font-mono text-slate-400 border border-white/5">{log.id}</span>
              </div>
              <p className="text-[12px] text-slate-500 font-black uppercase tracking-[0.2em]">Observabilidade Granular de Pipeline AI</p>
            </div>
            <div className="flex gap-4">
              <div className="text-right">
                <p className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Tempo Total</p>
                <p className="text-lg font-black text-blue-500">{log.duration}</p>
              </div>
              <div className="text-right">
                <p className="text-[11px] font-black text-slate-700 uppercase tracking-widest">Sessão</p>
                <p className="text-lg font-black text-slate-300 font-mono text-[13px] pt-1">{log.sessionId}</p>
              </div>
            </div>
          </header>
          <div className="space-y-0 group/timeline">
            {log.steps.map((step, idx) => <TimelineStep key={idx} step={step} isLast={idx === log.steps.length - 1} />)}
          </div>
        </motion.div>
      ) : (
        <div className="h-full flex flex-col items-center justify-center text-center">
          <div className="w-20 h-20 bg-slate-900/50 border border-slate-800 rounded-full flex items-center justify-center text-slate-600 mb-6"><Icons.Monitor /></div>
          <p className="text-[12px] font-black text-slate-600 uppercase tracking-[0.3em]">{MOCK_EXECUTIONS.length > 0 ? 'Selecione uma execução para ver o trace' : 'Nenhuma execução registrada'}</p>
        </div>
      )}
    </AnimatePresence>
  </div>
);

const LogsSidebar: React.FC<{
  logs: ExecutionLog[];
  selectedLogId: string | number | null;
  onSelectLog: (log: ExecutionLog) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  statusFilter: 'ALL' | 'SUCCESS' | 'FAILURE';
  onStatusFilterChange: (status: 'ALL' | 'SUCCESS' | 'FAILURE') => void;
}> = ({ logs, selectedLogId, onSelectLog, searchTerm, onSearchChange, statusFilter, onStatusFilterChange }) => (
  <div className="w-96 border-r border-white/5 flex flex-col bg-slate-950/20">
    <div className="p-6 border-b border-white/5 space-y-4">
      <div className="relative">
        <input type="text" placeholder="Buscar Trace ID ou Session ID..." value={searchTerm} onChange={(e) => onSearchChange(e.target.value)} className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 pl-10 pr-4 text-xs text-slate-300 outline-none focus:ring-1 ring-blue-500/30" />
        <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600"><Icons.Search /></div>
      </div>
      <div className="flex gap-2">
        {(['ALL', 'SUCCESS', 'FAILURE'] as const).map(status => (
          <button key={status} onClick={() => onStatusFilterChange(status)} className={`flex-1 py-2 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all border ${statusFilter === status ? (status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : status === 'FAILURE' ? 'bg-rose-500/10 text-rose-500 border-rose-500/20' : 'bg-blue-500/10 text-blue-500 border-blue-500/20') : 'bg-slate-800/50 border-transparent text-slate-500 hover:bg-slate-800'}`}>
            {status}
          </button>
        ))}
      </div>
    </div>
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <AnimatePresence>
        {logs.map(log => (
          <motion.button key={log.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => onSelectLog(log)} className={`w-full p-6 text-left border-b border-white/5 transition-all relative ${selectedLogId === log.id ? 'bg-blue-600/5' : 'hover:bg-white/[0.02]'}`}>
            {selectedLogId === log.id && <motion.div layoutId="log-highlight" className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500" />}
            <div className="flex justify-between items-start mb-2">
              <span className="text-[12px] font-mono font-bold text-slate-500">{log.id}</span>
              <Badge color={log.status === 'SUCCESS' ? 'emerald' : 'rose'}>{log.status}</Badge>
            </div>
            <p className="text-[12px] font-black text-slate-300 uppercase tracking-widest truncate">{log.sessionId}</p>
            <div className="flex justify-between items-center mt-3">
              <span className="text-[12px] text-slate-600 font-bold italic">{log.duration}</span>
              <span className="text-[11px] text-slate-700 font-mono">{log.timestamp?.split(' ')[1] || ''}</span>
            </div>
          </motion.button>
        ))}
      </AnimatePresence>
      {logs.length === 0 && <div className="p-10 text-center text-xs text-slate-600 italic">Nenhum log encontrado.</div>}
    </div>
  </div>
);

// --- MAIN COMPONENT ---

const ExecutionLogsView: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'SUCCESS' | 'FAILURE'>('ALL');

  const filteredLogs = useMemo(() => {
    return MOCK_EXECUTIONS.filter(log => {
      const matchesStatus = statusFilter === 'ALL' || log.status === statusFilter;
      const lowerSearch = searchTerm.toLowerCase();
      const matchesSearch = searchTerm === '' || String(log.id).toLowerCase().includes(lowerSearch) || log.sessionId.toLowerCase().includes(lowerSearch);
      return matchesStatus && matchesSearch;
    });
  }, [searchTerm, statusFilter]);

  const [selectedLog, setSelectedLog] = useState<ExecutionLog | null>(filteredLogs[0] || null);

  useEffect(() => {
    if (!selectedLog || !filteredLogs.some(log => log.id === selectedLog.id)) {
      setSelectedLog(filteredLogs[0] || null);
    }
  }, [filteredLogs, selectedLog]);

  return (
    <div className="flex-1 flex overflow-hidden bg-[#02040a]">
      <LogsSidebar
        logs={filteredLogs}
        selectedLogId={selectedLog?.id || null}
        onSelectLog={setSelectedLog}
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
      />
      <LogDetailView log={selectedLog} />
    </div>
  );
};

export default ExecutionLogsView;
