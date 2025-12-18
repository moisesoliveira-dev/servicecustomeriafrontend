"use client";

import React, { useState, createContext, useContext } from "react";
import { Company, EnvVar, UserPermission } from "@/types";

const DEFAULT_GLOBAL_SCHEMA = {
    internal_id: "string",
    customer_intent: "string",
    urgency_score: "number",
    metadata: { source: "string" },
};

const DEFAULT_OUTPUT_TEMPLATE = {
    status: "success",
    result: {
        summary: "string",
        action_taken: "string",
    },
};

interface AppContextType {
    companies: Company[];
    activeCompany: Company | null;
    globalVars: EnvVar[];
    permissions: UserPermission[];
    isAuthenticated: boolean;
    login: (email: string, pass: string) => Promise<void>;
    logout: () => void;
    setActiveCompanyById: (id: string | null) => void;
    updateCompany: (id: string, updates: Partial<Company>) => void;
    addCompany: (company: Company) => void;
    deleteCompany: (id: string) => void;
    addGlobalVar: (variable: Omit<EnvVar, "id">) => void;
    updateGlobalVar: (id: string, updates: Partial<EnvVar>) => void;
    deleteGlobalVar: (id: string) => void;
    addPermission: (permission: Omit<UserPermission, "id">) => void;
    updatePermission: (id: string, updates: Partial<UserPermission>) => void;
    deletePermission: (id: string) => void;
    globalSchema: typeof DEFAULT_GLOBAL_SCHEMA;
    outputTemplate: typeof DEFAULT_OUTPUT_TEMPLATE;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error("useApp must be used within an AppProvider");
    return context;
};

const INITIAL_COMPANIES: Company[] = [
    {
        id: "1",
        name: "Nexus Core",
        color: "bg-blue-600",
        crmType: "salesforce",
        outputRoutes: [
            {
                id: "out-1",
                name: "Primary Webhook",
                url: "https://api.nexus.io/v1/webhook",
                method: "POST",
                headers: [
                    { id: "h1", key: "Authorization", value: "Bearer demo_token" },
                ],
                bodyTemplate:
                    '{\n  "event": "customer_resolved",\n  "data": {{payload}}\n}',
                group: "General",
            },
            {
                id: "out-2",
                name: "Notify Billing Channel",
                url: "https://hooks.slack.com/services/...",
                method: "POST",
                headers: [],
                bodyTemplate:
                    '{\n  "text": "New billing inquiry resolved for {{customer.name}}"\n}',
                group: "Slack Internal",
            },
            {
                id: "out-3",
                name: "Archive Case File",
                url: "https://www.googleapis.com/upload/drive/v3/files",
                method: "POST",
                headers: [],
                bodyTemplate:
                    '{\n  "name": "case-{{conversation.id}}.txt",\n  "parents": ["..."],\n  "mimeType": "text/plain"\n}',
                group: "Google Drive Asset",
            },
        ],
    },
];

const INITIAL_VARS: EnvVar[] = [
    { id: "v1", key: "GEMINI_API_VERSION", value: "v2-preview", isSecret: false },
    { id: "v2", key: "ENCRYPTION_KEY", value: "AKIA_NEXUS_8829", isSecret: true },
];

const INITIAL_PERMISSIONS: UserPermission[] = [
    { id: "perm-1", user: "admin@nexus.ai", role: "MASTER_ADMIN", scope: "GLOBAL" },
    { id: "perm-2", user: "operator@nexus.ai", role: "FLOW_DESIGNER", scope: "TENANT_A" },
    { id: "perm-3", user: "viewer@nexus.ai", role: "AUDITOR", scope: "GLOBAL_LOGS" },
];

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [companies, setCompanies] = useState<Company[]>(INITIAL_COMPANIES);
    const [activeCompanyId, setActiveCompanyId] = useState<string | null>(
        INITIAL_COMPANIES.length > 0 ? INITIAL_COMPANIES[0].id : null
    );
    const [globalVars, setGlobalVars] = useState<EnvVar[]>(INITIAL_VARS);
    const [permissions, setPermissions] =
        useState<UserPermission[]>(INITIAL_PERMISSIONS);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const activeCompany = companies.find((c) => c.id === activeCompanyId) || null;

    const login = (email: string, pass: string): Promise<void> => {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (email === "admin@nexus.ai" && pass === "password") {
                    setIsAuthenticated(true);
                    resolve();
                } else {
                    reject(new Error("Credenciais inválidas."));
                }
            }, 1000);
        });
    };

    const logout = () => {
        setIsAuthenticated(false);
    };

    const updateCompany = (id: string, updates: Partial<Company>) => {
        setCompanies((prev) =>
            prev.map((c) => (c.id === id ? { ...c, ...updates } : c))
        );
    };

    const addCompany = (company: Company) => {
        setCompanies((prev) => [...prev, company]);
        setActiveCompanyId(company.id);
    };

    const deleteCompany = (id: string) => {
        setCompanies((prev) => {
            const remainingCompanies = prev.filter((c) => c.id !== id);
            if (activeCompanyId === id) {
                setActiveCompanyId(
                    remainingCompanies.length > 0 ? remainingCompanies[0].id : null
                );
            }
            return remainingCompanies;
        });
    };

    const addGlobalVar = (variable: Omit<EnvVar, "id">) => {
        setGlobalVars((prev) => [
            ...prev,
            { ...variable, id: `var-${Date.now()}` },
        ]);
    };
    const updateGlobalVar = (id: string, updates: Partial<EnvVar>) => {
        setGlobalVars((prev) =>
            prev.map((v) => (v.id === id ? { ...v, ...updates } : v))
        );
    };
    const deleteGlobalVar = (id: string) => {
        setGlobalVars((prev) => prev.filter((v) => v.id !== id));
    };

    const addPermission = (permission: Omit<UserPermission, "id">) => {
        setPermissions((prev) => [
            ...prev,
            { ...permission, id: `perm-${Date.now()}` },
        ]);
    };
    const updatePermission = (id: string, updates: Partial<UserPermission>) => {
        setPermissions((prev) =>
            prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
        );
    };
    const deletePermission = (id: string) => {
        setPermissions((prev) => prev.filter((p) => p.id !== id));
    };

    return (
        <AppContext.Provider
            value={{
                companies,
                activeCompany,
                globalVars,
                permissions,
                isAuthenticated,
                login,
                logout,
                setActiveCompanyById: setActiveCompanyId,
                updateCompany,
                addCompany,
                deleteCompany,
                addGlobalVar,
                updateGlobalVar,
                deleteGlobalVar,
                addPermission,
                updatePermission,
                deletePermission,
                globalSchema: DEFAULT_GLOBAL_SCHEMA,
                outputTemplate: DEFAULT_OUTPUT_TEMPLATE,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}
