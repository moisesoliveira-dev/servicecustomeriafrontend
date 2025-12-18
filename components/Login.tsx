"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useApp } from '@/context/AppContext';
import { Icons } from './Icons';

const Login: React.FC = () => {
  const [email, setEmail] = useState('admin@nexus.ai');
  const [password, setPassword] = useState('password');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useApp();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    try {
      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Falha ao fazer login.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full h-screen flex items-center justify-center bg-grid-slate-900/[0.4] [mask-image:linear-gradient(to_bottom,white_5%,transparent_90%)]">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm"
      >
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg text-white mb-4">
            <svg className="w-8 h-8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polygon points="12 2 2 7 12 12 22 7 12 2" /><polyline points="2 17 12 22 22 17" /></svg>
          </div>
          <h1 className="text-3xl font-black tracking-tighter text-white">Nexus<span className="text-blue-500">AI</span></h1>
          <p className="text-slate-500 text-sm mt-1">Orchestration Platform</p>
        </div>

        <form
          onSubmit={handleLogin}
          className="bg-slate-900/50 border border-slate-800 rounded-[2rem] p-8 shadow-2xl backdrop-blur-xl"
        >
          <div className="space-y-6">
            <div>
              <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest block mb-2">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nexus.ai"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
            </div>
            <div>
              <label className="text-[12px] font-black text-slate-500 uppercase tracking-widest block mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/30 transition-all"
              />
            </div>
          </div>

          {error && <p className="mt-6 text-center text-xs text-rose-400 font-bold uppercase tracking-widest">{error}</p>}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 py-3.5 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-blue-500 transition-all text-white mt-8 shadow-xl shadow-blue-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? 'Autenticando...' : 'Sign In'}
          </motion.button>
        </form>
      </motion.div>
    </div>
  );
};

export default Login;
