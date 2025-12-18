"use client";

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export const Badge: React.FC<{ children: React.ReactNode; color?: string; pulse?: boolean }> = ({ children, color = 'blue', pulse }) => {
  const colors: Record<string, string> = {
    blue: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
    emerald: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    amber: 'bg-amber-500/10 border-amber-500/20 text-amber-500',
    rose: 'bg-rose-500/10 border-rose-500/20 text-rose-500',
    slate: 'bg-slate-800 border-slate-700 text-slate-500',
  };

  return (
    <div className={`px-2.5 py-1 border rounded-full text-[11px] font-black uppercase tracking-widest flex items-center space-x-2 ${colors[color]}`}>
      {pulse && <span className={`w-1.5 h-1.5 rounded-full animate-pulse bg-current`} />}
      <span>{children}</span>
    </div>
  );
};

export const Card: React.FC<{ children: React.ReactNode; className?: string; noPadding?: boolean }> = ({ children, className = '', noPadding }) => (
  <div className={`bg-slate-900/40 border border-slate-800 rounded-[2rem] shadow-2xl overflow-hidden backdrop-blur-xl ${noPadding ? '' : 'p-6'} ${className}`}>
    {children}
  </div>
);

export const SectionHeader: React.FC<{ title: string; subtitle?: string; action?: React.ReactNode }> = ({ title, subtitle, action }) => (
  <header className="flex justify-between items-center mb-8">
    <div>
      <h2 className="text-2xl font-black text-white tracking-tight">{title}</h2>
      {subtitle && <p className="text-[12px] text-slate-500 font-bold uppercase tracking-[0.2em] mt-1">{subtitle}</p>}
    </div>
    {action && <div>{action}</div>}
  </header>
);

export const CodeEditor: React.FC<{ value: string; onChange?: (val: string) => void; readOnly?: boolean; label: string; icon?: React.ReactNode }> = ({ value, onChange, readOnly, label, icon }) => (
  <div className="flex-1 flex flex-col bg-slate-950/50 rounded-[2rem] border border-slate-800 overflow-hidden group">
    <div className="px-5 py-3 bg-slate-900/50 border-b border-slate-800 flex justify-between items-center">
      <div className="flex items-center space-x-3">
        {icon}
        <span className="text-[12px] font-black text-slate-500 uppercase tracking-widest">{label}</span>
      </div>
      {readOnly && <span className="text-[10px] font-black text-slate-700 uppercase tracking-widest">Read Only</span>}
    </div>
    <textarea
      className="flex-1 bg-transparent p-6 font-mono text-xs text-blue-300 outline-none resize-none custom-scrollbar selection:bg-blue-500/20"
      value={value}
      onChange={(e) => onChange?.(e.target.value)}
      spellCheck={false}
      readOnly={readOnly}
    />
  </div>
);

export const IconButton: React.FC<{ icon: React.ReactNode; onClick?: () => void; active?: boolean; color?: string }> = ({ icon, onClick, active, color = 'blue' }) => (
  <motion.button
    whileHover={{ scale: 1.1 }}
    whileTap={{ scale: 0.9 }}
    onClick={onClick}
    className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all ${active
        ? `bg-${color}-500/10 border-${color}-500/30 text-${color}-400`
        : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-300'
      }`}
  >
    {icon}
  </motion.button>
);

export const Pagination: React.FC<{ currentPage: number; totalPages: number; onPageChange: (page: number) => void; }> = ({ currentPage, totalPages, onPageChange }) => {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-10 flex justify-center items-center space-x-2">
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="px-3 py-1.5 bg-slate-800 rounded-lg text-xs font-bold disabled:opacity-30"
      >
        Anterior
      </button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${currentPage === page ? 'bg-blue-600 text-white' : 'bg-slate-800 hover:bg-slate-700'}`}
        >
          {page}
        </button>
      ))}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="px-3 py-1.5 bg-slate-800 rounded-lg text-xs font-bold disabled:opacity-30"
      >
        Próximo
      </button>
    </div>
  );
};


export const ConfirmationModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  children: React.ReactNode;
}> = ({ isOpen, onClose, onConfirm, title, children }) => (
  <AnimatePresence>
    {isOpen && (
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 max-w-md w-full shadow-2xl"
        >
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <div className="text-slate-400 mt-2">
            {children}
          </div>
          <div className="flex justify-end space-x-4 mt-8">
            <button onClick={onClose} className="px-6 py-2.5 text-[12px] font-black uppercase tracking-widest bg-slate-800 hover:bg-slate-700 rounded-xl transition-all">Cancelar</button>
            <button onClick={onConfirm} className="px-6 py-2.5 text-[12px] font-black uppercase tracking-widest bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-all">Confirmar</button>
          </div>
        </motion.div>
      </div>
    )}
  </AnimatePresence>
);
