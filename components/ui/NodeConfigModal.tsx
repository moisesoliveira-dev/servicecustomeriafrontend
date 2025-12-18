"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Node } from 'reactflow';
import { NodeType } from '@/types';
import { INTEGRATIONS_LIST } from '@/constants';
import { useApp } from '@/context/AppContext';
import { Icons } from '../Icons';

interface NodeConfigModalProps {
  node: Node;
  onSave: (nodeId: string, newData: any) => void;
  onClose: () => void;
}

export const NodeConfigModal: React.FC<NodeConfigModalProps> = ({ node, onSave, onClose }) => {
  const { activeCompany } = useApp();
  const [label, setLabel] = useState(node.data.label || '');
  const [config, setConfig] = useState(node.data.config || {});

  const isWorker = node.data.nodeType === NodeType.AGENT_WORKER;
  const integrationDetails = isWorker
    ? INTEGRATIONS_LIST.find(i => i.id === node.data.providerId)
    : null;

  const handleConfigChange = (key: string, value: string) => {
    setConfig((prev: any) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    onSave(node.id, { label, config });
  };

  const availableCredentials = activeCompany?.credentials?.filter(c => c.providerId === integrationDetails?.id) || [];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="bg-slate-900/80 border border-slate-800 rounded-[2rem] p-8 max-w-2xl w-full shadow-2xl backdrop-blur-xl"
      >
        <div className="flex items-start justify-between mb-8">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-slate-800/50 border border-slate-700/50 text-2xl">
              {integrationDetails?.icon || '⚙️'}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Node Configuration</h2>
              <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">{node.data.nodeType?.replace('_', ' ')}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-600 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-[12px] font-black text-slate-600 uppercase tracking-widest block mb-2">Node Label</label>
            <input
              type="text"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="Nome customizado do nó"
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
            />
          </div>

          {isWorker && integrationDetails && (
            <div className="p-6 bg-slate-950/40 rounded-2xl border border-slate-800/50">
              <h3 className="text-xs font-black text-indigo-400 uppercase tracking-widest mb-6">Agent Parameters</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {integrationDetails.configFields.map(field => (
                  <div key={field.key}>
                    <label className="text-[12px] font-black text-slate-600 uppercase tracking-widest block mb-2">{field.label}</label>
                    <input
                      type={field.type}
                      value={config[field.key] || ''}
                      onChange={(e) => handleConfigChange(field.key, e.target.value)}
                      placeholder={field.placeholder}
                      className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-300 font-mono outline-none focus:ring-1 ring-indigo-500/30 transition-all"
                    />
                  </div>
                ))}

                <div>
                  <label className="text-[12px] font-black text-slate-600 uppercase tracking-widest block mb-2">Credential Link</label>
                  <select
                    value={config['credentialId'] || ''}
                    onChange={(e) => handleConfigChange('credentialId', e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-slate-300 outline-none focus:ring-1 ring-indigo-500/30 transition-all"
                  >
                    <option value="">{availableCredentials.length > 0 ? 'Select a Credential...' : 'No credentials found'}</option>
                    {availableCredentials.map(cred => (
                      <option key={cred.id} value={cred.id}>{cred.alias}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4 mt-10">
          <button onClick={onClose} className="px-6 py-2.5 text-[12px] font-black uppercase tracking-widest bg-slate-800 hover:bg-slate-700 rounded-xl transition-all">Cancelar</button>
          <button onClick={handleSave} className="px-6 py-2.5 text-[12px] font-black uppercase tracking-widest bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all">Salvar Configuração</button>
        </div>
      </motion.div>
    </div>
  );
};
