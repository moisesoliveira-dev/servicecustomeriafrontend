"use client";

import React from 'react';
import { Badge, Card, SectionHeader } from './ui/Core';

const StatCard: React.FC<{ label: string; value: string; trend: string; color: string; progress: number }> = ({ label, value, trend, color, progress }) => (
  <Card>
    <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">{label}</p>
    <div className="flex items-end justify-between">
      <h3 className="text-2xl font-bold text-white">{value}</h3>
      <span className={`text-xs font-medium ${trend.startsWith('+') ? 'text-green-500' : 'text-red-500'}`}>{trend}</span>
    </div>
    <div className="h-1 w-full bg-slate-800 rounded-full mt-4 overflow-hidden">
      <div className={`h-full ${color} rounded-full`} style={{ width: `${progress}%` }}></div>
    </div>
  </Card>
);

const LogItem: React.FC<{ log: any }> = ({ log }) => (
  <div className="p-4 flex items-center justify-between hover:bg-slate-800/30 transition-colors">
    <div className="flex items-center space-x-4">
      <div className={`w-2 h-2 rounded-full ${log.status === 'SUCCESS' ? 'bg-green-500' : log.status === 'FAILURE' ? 'bg-rose-500' : 'bg-amber-500'}`}></div>
      <div>
        <p className="text-sm font-medium text-slate-200">{log.event}</p>
        <p className="text-[12px] text-slate-500 uppercase tracking-widest">{log.id} • Nexus Core Cluster-A</p>
      </div>
    </div>
    <div className="text-right">
      <p className={`text-xs font-bold ${log.status === 'SUCCESS' ? 'text-green-500' : log.status === 'FAILURE' ? 'text-rose-500' : 'text-amber-500'}`}>{log.status}</p>
      <p className="text-[12px] text-slate-500">{log.time}</p>
    </div>
  </div>
);

const ResourceUsage: React.FC<{ label: string; value: number; color: string }> = ({ label, value, color }) => (
  <div>
    <div className="flex justify-between text-xs mb-2">
      <span className="text-slate-400">{label}</span>
      <span className={`${color} font-bold`}>{value}%</span>
    </div>
    <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
      <div className={`h-full ${color.replace('text-', 'bg-')} w-[${value}%]`}></div>
    </div>
  </div>
);

const Dashboard: React.FC = () => {
  const logs = [
    { id: '1', event: 'Google Drive Sync', status: 'SUCCESS', time: '2m ago' },
    { id: '2', event: 'Input Transformation', status: 'SUCCESS', time: '5m ago' },
    { id: '3', event: 'CRM State Update', status: 'FAILURE', time: '8m ago' },
    { id: '4', event: 'AI Routing decision', status: 'PENDING', time: 'Just now' }
  ];

  return (
    <div className="flex-1 p-10 pb-20 bg-[#0b1120] overflow-y-auto custom-scrollbar">
      <div className="max-w-6xl mx-auto">
        <SectionHeader
          title="Nexus Command Center"
          subtitle="Monitoring real-time AI orchestration throughput"
          action={<Badge color="emerald" pulse>All Systems Operational</Badge>}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard label="Total Orchestrations" value="2.4k" trend="+12%" color="bg-blue-500" progress={65} />
          <StatCard label="Avg. Latency" value="142ms" trend="-4%" color="bg-indigo-500" progress={45} />
          <StatCard label="Active Workers" value="12" trend="+2" color="bg-emerald-500" progress={80} />
          <StatCard label="Error Rate" value="0.04%" trend="-2%" color="bg-rose-500" progress={10} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <Card className="lg:col-span-2" noPadding>
            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
              <h3 className="font-bold text-white">Live Execution Stream</h3>
              <button className="text-xs text-blue-400 font-bold hover:underline">View All Logs</button>
            </div>
            <div className="divide-y divide-slate-800">
              {logs.map(log => <LogItem key={log.id} log={log} />)}
            </div>
          </Card>

          <Card className="bg-gradient-to-br from-indigo-900/20 to-slate-900 border-indigo-500/20">
            <h3 className="font-bold text-white mb-6">Agent Resource Usage</h3>
            <div className="space-y-6">
              <ResourceUsage label="LLM Core (GPT-4o)" value={82} color="text-indigo-400" />
              <ResourceUsage label="Worker Node A-1" value={45} color="text-emerald-400" />
              <ResourceUsage label="Database Cluster" value={12} color="text-blue-400" />
            </div>
            <div className="mt-10 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
              <p className="text-xs text-indigo-200 italic leading-relaxed">
                "Nexus Intelligence optimized your routing logic automatically 14 minutes ago, reducing latency by 4.2%."
              </p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
