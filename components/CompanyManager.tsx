"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { Company, CRMType } from '@/types';
import { Icons } from './Icons';
import { Pagination, ConfirmationModal } from './ui/Core';

const CRM_TEMPLATES = [
    { id: 'salesforce', name: 'Salesforce', icon: '☁️', color: 'bg-blue-600' },
    { id: 'hubspot', name: 'HubSpot', icon: '🟠', color: 'bg-orange-600' },
    { id: 'custom', name: 'Custom CRM', icon: '🔌', color: 'bg-slate-700' }
];

const ITEMS_PER_PAGE = 5;

// --- SUB-COMPONENTS ---

const CompanyFormModal: React.FC<{
    mode: 'new' | 'edit';
    companyToEdit?: Company;
    onSave: (data: { name: string; crmType: CRMType }) => void;
    onClose: () => void;
}> = ({ mode, companyToEdit, onSave, onClose }) => {
    const [newName, setNewName] = useState('');
    const [selectedCRM, setSelectedCRM] = useState<CRMType>('salesforce');

    useEffect(() => {
        if (mode === 'edit' && companyToEdit) {
            setNewName(companyToEdit.name);
            setSelectedCRM(companyToEdit.crmType);
        }
    }, [mode, companyToEdit]);

    const handleSaveClick = () => {
        onSave({ name: newName, crmType: selectedCRM });
    };

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-slate-900/80 border border-slate-800 rounded-[2rem] p-8 max-w-lg w-full shadow-2xl backdrop-blur-xl"
            >
                <h2 className="text-lg font-bold text-white mb-6">
                    {mode === 'new' ? 'Cadastrar Novo Ambiente' : 'Editar Ambiente'}
                </h2>
                <div className="space-y-6">
                    <div>
                        <label className="text-[12px] font-black text-slate-600 uppercase tracking-widest block mb-2">Nome da Organização</label>
                        <input
                            type="text"
                            value={newName}
                            onChange={(e) => setNewName(e.target.value)}
                            placeholder="Ex: Global Logistics Inc."
                            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
                        />
                    </div>
                    <div>
                        <label className="text-[12px] font-black text-slate-600 uppercase tracking-widest block mb-4">Pipeline de Entrada (CRM)</label>
                        <div className="grid grid-cols-3 gap-4">
                            {CRM_TEMPLATES.map(crm => (
                                <motion.button
                                    key={crm.id}
                                    whileHover={{ scale: 1.02, y: -2 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => setSelectedCRM(crm.id as CRMType)}
                                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center space-y-3 ${selectedCRM === crm.id ? 'border-blue-500 bg-blue-500/5' : 'border-slate-800 bg-slate-900/50 hover:bg-slate-800'
                                        }`}
                                >
                                    <span className="text-2xl">{crm.icon}</span>
                                    <span className="text-[12px] font-black uppercase text-slate-400">{crm.name}</span>
                                </motion.button>
                            ))}
                        </div>
                    </div>
                    <div className="flex space-x-4 pt-4">
                        <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={handleSaveClick}
                            className="flex-1 bg-blue-600 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-500 transition-all text-white"
                        >
                            {mode === 'new' ? 'Ativar Ambiente' : 'Salvar Alterações'}
                        </motion.button>
                        <button onClick={onClose} className="px-8 bg-slate-800 py-3 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-700 transition-all">Cancelar</button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};

const CompanyListItem: React.FC<{ company: Company; isActive: boolean; onEdit: () => void; onDelete: () => void; }> = ({ company, isActive, onEdit, onDelete }) => (
    <motion.div
        layout="position"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -15 }}
        transition={{ duration: 0.25, ease: 'easeInOut' }}
    >
        <div
            className={`group w-full bg-slate-900/30 border ${isActive ? 'border-blue-500/40 shadow-[0_0_30px_rgba(59,130,246,0.1)]' : 'border-slate-800/60'} rounded-[1.5rem] p-6 flex items-center justify-between transition-all text-left`}
        >
            <div className="flex items-center space-x-6">
                <motion.div
                    layoutId={`company-avatar-${company.id}`}
                    className={`w-14 h-14 rounded-2xl ${company.color} flex items-center justify-center text-xl font-black text-white shadow-2xl shadow-black/40`}
                >
                    {company.name[0]}
                </motion.div>
                <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">{company.name}</h3>
                    <div className="flex items-center mt-1 space-x-3">
                        <span className="text-[12px] text-slate-600 font-black uppercase tracking-widest">TENANT-ID: {String(company.id).substring(0, 8)}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-800"></span>
                        <div className="flex items-center space-x-1">
                            <span className="text-[12px] text-blue-500/80 font-black uppercase tracking-widest">CORE:</span>
                            <span className="text-[12px] text-slate-400 font-bold uppercase">{company.crmType}</span>
                        </div>
                    </div>
                </div>
            </div>
            <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={(e) => { e.stopPropagation(); onEdit(); }} className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-800/50 hover:text-blue-400 transition-colors" aria-label={`Editar ${company.name}`}><Icons.Edit /></button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(); }} className="p-2.5 rounded-xl text-slate-500 hover:bg-slate-800/50 hover:text-rose-400 transition-colors" aria-label={`Excluir ${company.name}`}><Icons.Trash /></button>
            </div>
        </div>
    </motion.div>
);

// --- MAIN COMPONENT ---

const CompanyManager: React.FC = () => {
    const { companies, addCompany, updateCompany, deleteCompany, activeCompany, globalSchema, outputTemplate } = useApp();
    const [formOpenFor, setFormOpenFor] = useState<'new' | Company | null>(null);
    const [deletingCompany, setDeletingCompany] = useState<Company | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [currentPage, setCurrentPage] = useState(1);

    const handleSave = async ({ name, crmType }: { name: string; crmType: CRMType }) => {
        if (!name || !formOpenFor) return;

        if (formOpenFor === 'new') {
            const colors = ['bg-blue-600', 'bg-emerald-600', 'bg-indigo-600', 'bg-rose-600', 'bg-amber-600'];
            const randomColor = colors[Math.floor(Math.random() * colors.length)];

            await addCompany({
                name,
                color: randomColor,
                crmType,
                internalSchema: { ...globalSchema },
                outputTemplate: { ...outputTemplate },
                crmConfig: {
                    aiInstructions: `Instruções padrão para mapeamento do ${crmType}...`,
                    sourceJson: "{\n  \"example\": \"data\"\n}"
                }
            });
        } else {
            await updateCompany(formOpenFor.id, { name, crmType });
        }
        setFormOpenFor(null);
    };

    const handleConfirmDelete = async () => {
        if (deletingCompany) {
            await deleteCompany(deletingCompany.id);
            setDeletingCompany(null);
        }
    };

    const filteredCompanies = useMemo(() => companies.filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase())), [companies, searchQuery]);
    const totalPages = Math.ceil(filteredCompanies.length / ITEMS_PER_PAGE);
    const paginatedCompanies = useMemo(() => {
        const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
        return filteredCompanies.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    }, [filteredCompanies, currentPage]);

    useEffect(() => { setCurrentPage(1); }, [searchQuery]);

    return (
        <div className="flex-1 px-10 pt-10 pb-20 overflow-y-auto bg-[#02040a] custom-scrollbar">
            <div className="max-w-4xl mx-auto">
                <motion.header initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-center mb-10">
                    <div>
                        <h1 className="text-3xl font-black text-white tracking-tight">Gestão de Empresas</h1>
                        <p className="text-slate-500 mt-1 uppercase tracking-[0.2em] text-[12px] font-black">Infraestrutura Multi-Tenant AI</p>
                    </div>
                    <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setFormOpenFor('new')} className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_10px_30px_rgba(37,99,235,0.2)]">
                        Nova Empresa
                    </motion.button>
                </motion.header>

                <div className="mb-8 relative">
                    <input type="text" placeholder="Buscar empresa pelo nome..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full bg-slate-900/50 border border-slate-800 rounded-2xl py-3 pl-12 pr-4 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/30 transition-all" />
                    <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600"><Icons.Search /></div>
                </div>

                <motion.div layout className="grid gap-6 items-start">
                    <AnimatePresence>
                        {paginatedCompanies.map((comp) => (
                            <CompanyListItem
                                key={comp.id}
                                company={comp}
                                isActive={comp.id === activeCompany?.id}
                                onEdit={() => setFormOpenFor(comp)}
                                onDelete={() => setDeletingCompany(comp)}
                            />
                        ))}
                    </AnimatePresence>
                </motion.div>

                {filteredCompanies.length === 0 && (
                    <div className="text-center py-20 min-h-[360px] flex flex-col justify-center">
                        <p className="text-slate-500 font-bold">{searchQuery ? `Nenhuma empresa encontrada para "${searchQuery}"` : "Nenhuma empresa cadastrada."}</p>
                    </div>
                )}

                <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>

            <AnimatePresence>
                {formOpenFor && <CompanyFormModal mode={formOpenFor === 'new' ? 'new' : 'edit'} companyToEdit={formOpenFor === 'new' ? undefined : formOpenFor} onSave={handleSave} onClose={() => setFormOpenFor(null)} />}
            </AnimatePresence>

            <ConfirmationModal
                isOpen={!!deletingCompany}
                onClose={() => setDeletingCompany(null)}
                onConfirm={handleConfirmDelete}
                title="Confirmar Exclusão"
            >
                <p>Tem certeza de que deseja excluir a empresa <strong className="font-bold text-white">{deletingCompany?.name}</strong>? Esta ação não pode ser desfeita.</p>
            </ConfirmationModal>
        </div>
    );
};

export default CompanyManager;
