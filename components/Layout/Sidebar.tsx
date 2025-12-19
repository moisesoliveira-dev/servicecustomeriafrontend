"use client";

import React, { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Icons } from "../Icons";
import { useApp } from "@/context/AppContext";

type Route =
  | "/"
  | "/companies"
  | "/flow"
  | "/flow/monitor"
  | "/logs"
  | "/mapping"
  | "/output"
  | "/integrations"
  | "/settings";

interface SidebarProps {
  currentRoute: Route;
  onNavigate: (route: Route) => void;
}

const SidebarItem: React.FC<{
  to: Route;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  delay?: number;
  onClick: () => void;
}> = ({ icon, label, active, delay = 0, onClick }) => (
  <motion.div
    initial={{ opacity: 0, x: -10 }}
    animate={{ opacity: 1, x: 0 }}
    transition={{ delay, duration: 0.3 }}
  >
    <button
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-300 relative group overflow-hidden ${active
        ? "bg-blue-600/10 text-blue-400 shadow-[inset_0_0_20px_rgba(59,130,246,0.05)] border border-blue-500/20"
        : "text-slate-400 hover:bg-white/[0.03] hover:text-slate-200"
        }`}
    >
      {active && (
        <motion.div
          layoutId="sidebar-active"
          className="absolute left-0 w-1 h-6 bg-blue-500 rounded-r-full"
        />
      )}
      <span
        className={`transition-all duration-300 ${active ? "opacity-100" : "opacity-60 group-hover:opacity-100"
          }`}
      >
        {icon}
      </span>
      <span
        className={`font-bold text-[13px] tracking-tight ${active ? "text-blue-50" : ""
          }`}
      >
        {label}
      </span>
    </button>
  </motion.div>
);

const CompanySwitcher: React.FC = () => {
  const { companies, activeCompany, setActiveCompanyById } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const switcherRef = useRef<HTMLDivElement>(null);

  const handleSelectCompany = (id: string | number) => {
    setActiveCompanyById(id);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        switcherRef.current &&
        !switcherRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [switcherRef]);

  if (!activeCompany) {
    return (
      <div className="px-4 py-2 mt-4 text-center text-sm text-slate-500 bg-slate-800/50 rounded-lg">
        Nenhuma empresa selecionada.
      </div>
    );
  }

  return (
    <div className="relative" ref={switcherRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 rounded-2xl bg-slate-900/50 hover:bg-slate-800/50 border border-slate-800 transition-all text-left"
      >
        <div className="flex items-center space-x-3 overflow-hidden">
          <div
            className={`w-9 h-9 rounded-xl ${activeCompany.color} flex items-center justify-center text-xs font-black text-white shrink-0`}
          >
            {activeCompany.name[0]}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-bold text-white truncate">
              {activeCompany.name}
            </p>
            <p className="text-[11px] text-slate-500 uppercase font-black truncate">
              ID: {String(activeCompany.id).substring(0, 8)}
            </p>
          </div>
        </div>
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          className="text-slate-500"
        >
          <Icons.ChevronDown />
        </motion.div>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-slate-900/80 border border-slate-800 rounded-2xl p-2 shadow-2xl backdrop-blur-xl z-50 max-h-60 overflow-y-auto custom-scrollbar"
          >
            {companies.map((company) => (
              <button
                key={company.id}
                onClick={() => handleSelectCompany(company.id)}
                className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${activeCompany.id === company.id
                  ? "bg-blue-600/10 text-blue-300"
                  : "hover:bg-slate-800/50"
                  }`}
              >
                <div
                  className={`w-8 h-8 rounded-lg ${company.color} flex items-center justify-center text-xs font-black text-white shrink-0`}
                >
                  {company.name[0]}
                </div>
                <p className="text-sm font-semibold text-slate-200">
                  {company.name}
                </p>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({
  currentRoute,
  onNavigate,
}) => {
  const { activeCompany, logout } = useApp();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    setShowLogoutConfirm(false);
  };

  return (
    <>
      <aside className="w-64 border-r border-white/5 flex flex-col bg-[#050811] shrink-0">
        <div className="p-8 pb-4">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg text-white">
              <svg
                className="w-5 h-5"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <polygon points="12 2 2 7 12 12 22 7 12 2" />
                <polyline points="2 17 12 22 22 17" />
              </svg>
            </div>
            <h1 className="text-xl font-black tracking-tighter text-white">
              Nexus<span className="text-blue-500">AI</span>
            </h1>
          </div>
        </div>

        <div className="px-4 pb-4 border-b border-white/5">
          <CompanySwitcher />
        </div>

        <div className="flex-1 px-4 overflow-y-auto py-4 custom-scrollbar">
          <div className="mb-3 px-4 text-[11px] font-black text-slate-600 uppercase tracking-widest">
            Plataforma (ADM)
          </div>
          <SidebarItem
            to="/"
            icon={<Icons.Dashboard />}
            label="Dashboard"
            active={currentRoute === "/"}
            onClick={() => onNavigate("/")}
          />
          <SidebarItem
            to="/companies"
            icon={<Icons.Integrations />}
            label="Tenants"
            active={currentRoute === "/companies"}
            onClick={() => onNavigate("/companies")}
          />
          <SidebarItem
            to="/settings"
            icon={<Icons.Monitor />}
            label="Global Config"
            active={currentRoute === "/settings"}
            onClick={() => onNavigate("/settings")}
          />

          {activeCompany && (
            <>
              <div className="mt-8 mb-3 px-4 text-[11px] font-black text-slate-600 uppercase tracking-widest">
                Operação: {activeCompany.name}
              </div>
              <SidebarItem
                to="/flow"
                icon={<Icons.Workflow />}
                label="Design Flow"
                active={currentRoute === "/flow"}
                onClick={() => onNavigate("/flow")}
              />
              <SidebarItem
                to="/logs"
                icon={<Icons.Monitor />}
                label="Execuções & Logs"
                active={currentRoute === "/logs"}
                onClick={() => onNavigate("/logs")}
              />
              <SidebarItem
                to="/mapping"
                icon={<Icons.Transformer />}
                label="Transformer AI"
                active={currentRoute === "/mapping"}
                onClick={() => onNavigate("/mapping")}
              />
              <SidebarItem
                to="/output"
                icon={<Icons.Output />}
                label="Output Generator"
                active={currentRoute === "/output"}
                onClick={() => onNavigate("/output")}
              />
            </>
          )}
        </div>

        <div className="p-4 border-t border-white/5">
          <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.02]">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-[12px] font-black">
                AD
              </div>
              <div>
                <p className="text-[12px] font-bold text-white">Root Admin</p>
                <p className="text-[11px] text-slate-600 uppercase font-black">
                  Cluster-Alpha
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className="p-2 text-slate-600 hover:text-rose-500 transition-colors rounded-lg hover:bg-rose-500/10"
              title="Logout"
            >
              <Icons.Logout />
            </button>
          </div>
        </div>
      </aside>

      <AnimatePresence>
        {showLogoutConfirm && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-slate-900 border border-slate-800 rounded-[2rem] p-8 max-w-md w-full shadow-2xl"
            >
              <h2 className="text-lg font-bold text-white">Confirmar Logout</h2>
              <p className="text-slate-400 mt-2">
                Tem certeza de que deseja sair da sua conta?
              </p>
              <div className="flex justify-end space-x-4 mt-8">
                <button
                  onClick={() => setShowLogoutConfirm(false)}
                  className="px-6 py-2.5 text-[12px] font-black uppercase tracking-widest bg-slate-800 hover:bg-slate-700 rounded-xl transition-all"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleLogout}
                  className="px-6 py-2.5 text-[12px] font-black uppercase tracking-widest bg-rose-600 hover:bg-rose-500 text-white rounded-xl transition-all"
                >
                  Sair
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
