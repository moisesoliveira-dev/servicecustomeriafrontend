"use client";

import React, { useCallback, useMemo, useState, useEffect, useRef } from 'react';
import ReactFlow, {
    Background,
    Controls,
    Handle,
    Position,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    MarkerType,
    NodeProps,
    BackgroundVariant,
    Node,
    Edge,
    ReactFlowInstance,
    ReactFlowProvider,
    useReactFlow,
} from 'reactflow';
import { motion, AnimatePresence } from 'framer-motion';
import { NodeType } from '@/types';
import { INTEGRATIONS_LIST } from '@/constants';
import { Icons } from './Icons';
import { NodeConfigModal } from './ui/NodeConfigModal';

const getNodeIcon = (type: NodeType, integrationIcon?: string) => {
    if (type === NodeType.INPUT_TRANSFORMER) return <Icons.Input />;
    if (type === NodeType.STATE_MANAGER) return <Icons.StateManager />;
    if (type === NodeType.STATE_ROUTER) return <Icons.StateRouter />;
    if (type === NodeType.OUTPUT_GENERATOR) return <Icons.Output />;
    return <span className="text-xl">{integrationIcon || '🤖'}</span>;
};

const NexusNode: React.FC<NodeProps> = ({ id, data, isConnectable, selected }) => {
    const { deleteElements } = useReactFlow();
    const nodeType = data.nodeType as NodeType;
    const isCore = [
        NodeType.INPUT_TRANSFORMER,
        NodeType.STATE_MANAGER,
        NodeType.STATE_ROUTER,
        NodeType.OUTPUT_GENERATOR,
    ].includes(nodeType);
    const isWorker = nodeType === NodeType.AGENT_WORKER;
    const isConnected = data.connected || isCore;

    const handleDelete = () => {
        deleteElements({ nodes: [{ id }] });
    };

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`
        relative w-64 rounded-3xl border bg-slate-900/80 shadow-2xl backdrop-blur-xl transition-all duration-300
        ${isWorker && isConnected ? 'border-indigo-500/40' : 'border-slate-800'}
        ${!isConnected ? 'opacity-60' : ''}
        ${selected ? 'ring-2 ring-blue-500 shadow-[0_0_30px_rgba(59,130,246,0.2)]' : ''}
      `}
        >
            <AnimatePresence>
                {selected && isWorker && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        onClick={handleDelete}
                        className="absolute -top-2 -right-2 w-7 h-7 bg-rose-600 rounded-full flex items-center justify-center text-white shadow-lg hover:bg-rose-500 transition-colors z-20"
                        aria-label="Delete node"
                    >
                        <Icons.Trash />
                    </motion.button>
                )}
            </AnimatePresence>

            <div className={`p-4 flex items-center justify-between rounded-t-3xl border-b ${isWorker ? 'bg-indigo-500/10 border-indigo-500/20' : 'bg-blue-500/5 border-blue-500/10'
                }`}>
                <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 flex items-center justify-center rounded-xl border transition-all ${isWorker ? 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400' : 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                        }`}>
                        {getNodeIcon(nodeType, data.icon)}
                    </div>
                    <h4 className="text-sm font-bold text-slate-100 truncate">{data.label}</h4>
                </div>
                <div className="flex items-center space-x-2">
                    <motion.div
                        animate={{ opacity: isConnected ? [1, 0.5, 1] : 1 }}
                        transition={{ repeat: Infinity, duration: 2.5 }}
                        className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 shadow-[0_0_12px_#22c55e]' : 'bg-slate-700'}`}
                    />
                </div>
            </div>

            <div className="p-4 flex justify-between items-center">
                <p className="text-[12px] uppercase tracking-[0.1em] font-black text-slate-600">
                    {nodeType?.replace('_', ' ')}
                </p>
                <button className="node-settings-button p-1.5 rounded-md text-slate-600 hover:bg-slate-800 hover:text-slate-300 transition-colors">
                    <Icons.Settings />
                </button>
            </div>

            {nodeType !== NodeType.INPUT_TRANSFORMER && (
                <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="!w-3 !h-3 !border-2 !bg-slate-900 !border-slate-700" />
            )}
            {nodeType !== NodeType.OUTPUT_GENERATOR && (
                <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="!w-3 !h-3 !border-2 !bg-slate-900 !border-slate-700" />
            )}
        </motion.div>
    );
};

const LibrarySidebar: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredIntegrations = useMemo(() => {
        return INTEGRATIONS_LIST.filter(item =>
            item.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm]);

    const onDragStart = (event: React.DragEvent, integration: any) => {
        const integrationData = JSON.stringify(integration);
        event.dataTransfer.setData('application/reactflow-integration', integrationData);
        event.dataTransfer.effectAllowed = 'move';
    };

    return (
        <aside className="w-80 bg-slate-950/40 border-r border-white/5 flex flex-col shrink-0">
            <div className="p-6 border-b border-white/5">
                <h3 className="text-[12px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4">Agent Library</h3>
                <div className="relative">
                    <input
                        type="text"
                        placeholder="Buscar módulo..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full bg-slate-900/50 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-200 outline-none focus:ring-2 focus:ring-blue-500/30"
                    />
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-600">
                        <Icons.Search />
                    </div>
                </div>
            </div>
            <div className="flex-1 p-4 space-y-3 overflow-y-auto custom-scrollbar">
                {filteredIntegrations.map((item) => (
                    <div
                        key={item.id}
                        onDragStart={(event) => onDragStart(event, item)}
                        draggable
                        className="w-full group flex items-center p-4 rounded-2xl border border-slate-800/60 bg-slate-900/50 hover:bg-indigo-500/10 transition-all text-left cursor-grab"
                    >
                        <div className="w-10 h-10 flex items-center justify-center bg-slate-900 rounded-xl text-xl mr-4 border border-slate-800">{item.icon}</div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-slate-100">{item.name}</p>
                            <p className="text-[11px] text-slate-600 font-black uppercase tracking-widest">{item.type.split('_')[0]}</p>
                        </div>
                    </div>
                ))}
            </div>
        </aside>
    );
};


const FlowBuilderComponent: React.FC = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState([]);
    const [edges, setEdges, onEdgesChange] = useEdgesState([]);
    const reactFlowWrapper = useRef<HTMLDivElement>(null);
    const [reactFlowInstance, setReactFlowInstance] = useState<ReactFlowInstance | null>(null);
    const [editingNode, setEditingNode] = useState<Node | null>(null);
    const [isDeploying, setIsDeploying] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);

    useEffect(() => {
        const initialNodes: Node[] = [
            { id: 'core-input', type: 'nexusNode', data: { label: 'CRM Master Ingest', nodeType: NodeType.INPUT_TRANSFORMER, connected: true }, position: { x: 250, y: 0 }, deletable: false },
            { id: 'core-manager', type: 'nexusNode', data: { label: 'IA State Controller', nodeType: NodeType.STATE_MANAGER, connected: true }, position: { x: 250, y: 250 }, deletable: false },
            { id: 'core-router', type: 'nexusNode', data: { label: 'IA Global Router', nodeType: NodeType.STATE_ROUTER, connected: true }, position: { x: 250, y: 500 }, deletable: false },
            { id: 'core-output', type: 'nexusNode', data: { label: 'Response Egress', nodeType: NodeType.OUTPUT_GENERATOR, connected: true }, position: { x: 250, y: 750 }, deletable: false }
        ];

        const initialEdges: Edge[] = [
            { id: 'e-core-1', source: 'core-input', target: 'core-manager', className: 'edge-core-dashed', markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' } },
            { id: 'e-core-2', source: 'core-manager', target: 'core-router', className: 'edge-core-dashed', markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' } },
            { id: 'e-core-3', source: 'core-router', target: 'core-output', className: 'edge-core-dashed', markerEnd: { type: MarkerType.ArrowClosed, color: '#3b82f6' } }
        ];

        setNodes(initialNodes);
        setEdges(initialEdges);
    }, []);

    useEffect(() => {
        if (showSuccessModal) {
            const timer = setTimeout(() => setShowSuccessModal(false), 3000);
            return () => clearTimeout(timer);
        }
    }, [showSuccessModal]);

    const onConnect = useCallback((params: Connection) => {
        const sourceNode = nodes.find(n => n.id === params.source);
        const targetNode = nodes.find(n => n.id === params.target);
        if (!sourceNode || !targetNode) return;

        const sourceIsRouter = sourceNode.data.nodeType === NodeType.STATE_ROUTER;
        const targetIsRouter = targetNode.data.nodeType === NodeType.STATE_ROUTER;
        const sourceIsWorker = sourceNode.data.nodeType === NodeType.AGENT_WORKER;
        const targetIsWorker = targetNode.data.nodeType === NodeType.AGENT_WORKER;

        if ((sourceIsWorker && !targetIsRouter) || (targetIsWorker && !sourceIsRouter)) {
            return; // Invalid connection
        }

        if (targetIsWorker && sourceIsRouter) {
            setNodes(nds => nds.map(n => n.id === targetNode.id ? { ...n, data: { ...n.data, connected: true } } : n));
        }

        const isAgentEdge = sourceIsWorker || targetIsWorker;
        const newEdge = {
            ...params,
            className: isAgentEdge ? 'edge-agent-glow' : 'edge-core-dashed',
            markerEnd: { type: MarkerType.ArrowClosed, color: isAgentEdge ? '#6366f1' : '#3b82f6' }
        };
        setEdges((eds) => addEdge(newEdge, eds));
    }, [nodes, setNodes, setEdges]);

    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        if (!reactFlowInstance || !reactFlowWrapper.current) return;

        const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
        const integrationData = event.dataTransfer.getData('application/reactflow-integration');
        if (!integrationData) return;

        const integration = JSON.parse(integrationData);
        const position = reactFlowInstance.project({
            x: event.clientX - reactFlowBounds.left,
            y: event.clientY - reactFlowBounds.top,
        });

        const newNode: Node = {
            id: `agent-${integration.id}-${Date.now()}`,
            type: 'nexusNode',
            position,
            data: {
                label: integration.name,
                icon: integration.icon,
                nodeType: NodeType.AGENT_WORKER,
                connected: false,
                providerId: integration.id,
                config: {}
            },
        };

        setNodes((nds) => nds.concat(newNode));
    }, [reactFlowInstance, setNodes]);

    const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
        const target = event.target as HTMLElement;
        if (target.closest('.node-settings-button')) {
            setEditingNode(node);
        }
    }, []);

    const onNodeConfigSave = (nodeId: string, newData: any) => {
        setNodes((nds) =>
            nds.map((node) => {
                if (node.id === nodeId) {
                    const updatedData = { ...node.data, ...newData };
                    return { ...node, data: updatedData };
                }
                return node;
            })
        );
        setEditingNode(null);
    };

    const handleDeploy = () => {
        setIsDeploying(true);
        setTimeout(() => {
            setIsDeploying(false);
            setShowSuccessModal(true);
        }, 2000);
    };


    const nodeTypes = useMemo(() => ({ nexusNode: NexusNode }), []);

    return (
        <div className="flex-1 flex h-full bg-[#0b1120] overflow-hidden">
            <LibrarySidebar />
            <div className="flex-1 flex flex-col">
                <header className="h-20 border-b border-white/5 bg-slate-950/40 backdrop-blur-2xl px-8 flex items-center justify-between z-10 shrink-0">
                    <div className="flex items-center space-x-6">
                        <motion.div whileHover={{ rotate: 15 }} className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-blue-500 shadow-inner">
                            <Icons.Workflow />
                        </motion.div>
                        <div>
                            <h2 className="text-lg font-bold text-white tracking-tight leading-none">Flow Orchestrator</h2>
                            <p className="text-[12px] text-slate-600 font-black uppercase tracking-widest mt-1.5">Pipeline Active</p>
                        </div>
                    </div>
                    <div className="flex items-center space-x-4">
                        <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleDeploy}
                            disabled={isDeploying}
                            className="px-6 py-2.5 text-xs font-black bg-blue-600 text-white rounded-xl shadow-xl shadow-blue-600/20 uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isDeploying ? 'Deploying...' : 'Deploy Protocol'}
                        </motion.button>
                    </div>
                </header>

                <div className="flex-1 w-full h-full relative" ref={reactFlowWrapper}>
                    <ReactFlow
                        nodes={nodes}
                        edges={edges}
                        onNodesChange={onNodesChange}
                        onEdgesChange={onEdgesChange}
                        onConnect={onConnect}
                        onInit={setReactFlowInstance}
                        onDrop={onDrop}
                        onDragOver={onDragOver}
                        onNodeClick={onNodeClick}
                        nodeTypes={nodeTypes}
                        fitView
                        snapToGrid
                        deleteKeyCode={['Backspace', 'Delete']}
                    >
                        <Background color="#1e293b" gap={20} size={1} variant={BackgroundVariant.Lines} />
                        <Controls className="!bg-slate-900 !border-slate-800 !fill-slate-500 !rounded-xl" />
                    </ReactFlow>
                </div>
            </div>
            <AnimatePresence>
                {editingNode && (
                    <NodeConfigModal
                        node={editingNode}
                        onSave={onNodeConfigSave}
                        onClose={() => setEditingNode(null)}
                    />
                )}
            </AnimatePresence>
            <AnimatePresence>
                {showSuccessModal && (
                    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 pointer-events-none">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            className="bg-slate-900/80 border border-emerald-500/20 rounded-[2rem] p-8 max-w-md w-full shadow-2xl text-center"
                        >
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.1, type: 'spring', stiffness: 200, damping: 10 }} className="w-16 h-16 bg-emerald-500/10 border-2 border-emerald-500/30 rounded-full flex items-center justify-center mx-auto text-emerald-400">
                                <Icons.Check />
                            </motion.div>
                            <h2 className="text-xl font-bold text-white mt-6">Deployment Successful</h2>
                            <p className="text-slate-400 mt-2 text-sm">
                                O novo protocolo de orquestração foi ativado com sucesso no ambiente de produção.
                            </p>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};


const FlowBuilder: React.FC = () => (
    <ReactFlowProvider>
        <FlowBuilderComponent />
    </ReactFlowProvider>
);

export default FlowBuilder;
