"use client";

import React, { useState, createContext, useContext, useEffect, useCallback } from "react";
import { Company, EnvVar, UserPermission, Integration, ExecutionLog, CRMType } from "@/types";
import * as api from "@/lib/api";
import { INTEGRATIONS_LIST } from "@/constants";

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
    // State
    companies: Company[];
    activeCompany: Company | null;
    globalVars: EnvVar[];
    permissions: UserPermission[];
    integrations: Integration[];
    executionLogs: ExecutionLog[];
    isAuthenticated: boolean;
    isLoading: boolean;
    error: string | null;

    // Auth
    login: (email: string, pass: string) => Promise<void>;
    logout: () => void;

    // Company operations
    setActiveCompanyById: (id: string | null) => void;
    updateCompany: (id: string, updates: Partial<Company>) => Promise<void>;
    addCompany: (company: Omit<Company, 'id' | 'credentials' | 'outputRoutes'>) => Promise<void>;
    deleteCompany: (id: string) => Promise<void>;

    // Global vars operations
    addGlobalVar: (variable: Omit<EnvVar, "id">) => Promise<void>;
    updateGlobalVar: (id: string, updates: Partial<EnvVar>) => Promise<void>;
    deleteGlobalVar: (id: string) => Promise<void>;

    // Permission operations
    addPermission: (permission: Omit<UserPermission, "id">) => Promise<void>;
    updatePermission: (id: string, updates: Partial<UserPermission>) => Promise<void>;
    deletePermission: (id: string) => Promise<void>;

    // Reload
    reloadCompanies: () => Promise<void>;
    reloadExecutionLogs: () => Promise<void>;

    // Schema templates
    globalSchema: typeof DEFAULT_GLOBAL_SCHEMA;
    outputTemplate: typeof DEFAULT_OUTPUT_TEMPLATE;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const useApp = () => {
    const context = useContext(AppContext);
    if (!context) throw new Error("useApp must be used within an AppProvider");
    return context;
};

export function AppProvider({ children }: { children: React.ReactNode }) {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [activeCompanyId, setActiveCompanyId] = useState<string | null>(null);
    const [globalVars, setGlobalVars] = useState<EnvVar[]>([]);
    const [permissions, setPermissions] = useState<UserPermission[]>([]);
    const [integrations, setIntegrations] = useState<Integration[]>([]);
    const [executionLogs, setExecutionLogs] = useState<ExecutionLog[]>([]);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const activeCompany = companies.find((c) => c.id === activeCompanyId) || null;

    // Load initial data
    const loadInitialData = useCallback(async () => {
        if (!isAuthenticated) {
            setIsLoading(false);
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Load companies with their credentials and output routes
            const companiesData = await api.getCompanies();

            // Load credentials and output routes for each company
            const companiesWithRelations = await Promise.all(
                companiesData.map(async (company) => {
                    const [credentials, outputRoutes] = await Promise.all([
                        api.getCredentialsByCompany(company.id),
                        api.getOutputRoutesByCompany(company.id),
                    ]);
                    return {
                        ...company,
                        credentials,
                        outputRoutes,
                    };
                })
            );

            setCompanies(companiesWithRelations);
            if (companiesWithRelations.length > 0 && !activeCompanyId) {
                setActiveCompanyId(companiesWithRelations[0].id);
            }

            // Load other data in parallel
            const [varsData, permissionsData, integrationsData, logsData] = await Promise.all([
                api.getEnvVars(),
                api.getUserPermissions(),
                api.getIntegrations(),
                api.getExecutionLogs(),
            ]);

            setGlobalVars(varsData);
            setPermissions(permissionsData);
            setExecutionLogs(logsData);

            // If no integrations exist in the database, seed them
            if (integrationsData.length === 0) {
                await api.seedIntegrations(INTEGRATIONS_LIST);
                setIntegrations(INTEGRATIONS_LIST);
            } else {
                setIntegrations(integrationsData);
            }
        } catch (err) {
            console.error('Failed to load initial data:', err);
            setError(err instanceof Error ? err.message : 'Failed to load data');
        } finally {
            setIsLoading(false);
        }
    }, [isAuthenticated, activeCompanyId]);

    useEffect(() => {
        loadInitialData();
    }, [isAuthenticated]); // Only reload when auth status changes

    // Auth functions
    const login = async (email: string, pass: string): Promise<void> => {
        // For now, use simple auth. Later can integrate with Supabase Auth
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (email === "admin@nexus.ai" && pass === "password") {
                    setIsAuthenticated(true);
                    resolve();
                } else {
                    reject(new Error("Credenciais inválidas."));
                }
            }, 500);
        });
    };

    const logout = () => {
        setIsAuthenticated(false);
        setCompanies([]);
        setGlobalVars([]);
        setPermissions([]);
        setExecutionLogs([]);
        setActiveCompanyId(null);
    };

    // Company operations
    const updateCompany = async (id: string, updates: Partial<Company>) => {
        try {
            const updated = await api.updateCompany(id, updates);
            setCompanies((prev) =>
                prev.map((c) => (c.id === id ? { ...c, ...updated } : c))
            );
        } catch (err) {
            console.error('Failed to update company:', err);
            throw err;
        }
    };

    const addCompany = async (company: Omit<Company, 'id' | 'credentials' | 'outputRoutes'>) => {
        try {
            const newCompany = await api.createCompany({
                name: company.name,
                color: company.color,
                crmType: company.crmType as CRMType,
                internalSchema: company.internalSchema,
                outputTemplate: company.outputTemplate,
            });
            setCompanies((prev) => [...prev, { ...newCompany, credentials: [], outputRoutes: [] }]);
            setActiveCompanyId(newCompany.id);
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : JSON.stringify(err);
            console.error('Failed to create company:', errorMessage, err);
            alert(`Erro ao criar empresa: ${errorMessage}`);
            throw err;
        }
    };

    const deleteCompanyAction = async (id: string) => {
        try {
            await api.deleteCompany(id);
            setCompanies((prev) => {
                const remainingCompanies = prev.filter((c) => c.id !== id);
                if (activeCompanyId === id) {
                    setActiveCompanyId(
                        remainingCompanies.length > 0 ? remainingCompanies[0].id : null
                    );
                }
                return remainingCompanies;
            });
        } catch (err) {
            console.error('Failed to delete company:', err);
            throw err;
        }
    };

    // Global vars operations
    const addGlobalVar = async (variable: Omit<EnvVar, "id">) => {
        try {
            const newVar = await api.createEnvVar(variable);
            setGlobalVars((prev) => [...prev, newVar]);
        } catch (err) {
            console.error('Failed to create env var:', err);
            throw err;
        }
    };

    const updateGlobalVar = async (id: string, updates: Partial<EnvVar>) => {
        try {
            const updated = await api.updateEnvVar(id, updates);
            setGlobalVars((prev) =>
                prev.map((v) => (v.id === id ? updated : v))
            );
        } catch (err) {
            console.error('Failed to update env var:', err);
            throw err;
        }
    };

    const deleteGlobalVar = async (id: string) => {
        try {
            await api.deleteEnvVar(id);
            setGlobalVars((prev) => prev.filter((v) => v.id !== id));
        } catch (err) {
            console.error('Failed to delete env var:', err);
            throw err;
        }
    };

    // Permission operations
    const addPermission = async (permission: Omit<UserPermission, "id">) => {
        try {
            const newPermission = await api.createUserPermission(permission);
            setPermissions((prev) => [...prev, newPermission]);
        } catch (err) {
            console.error('Failed to create permission:', err);
            throw err;
        }
    };

    const updatePermission = async (id: string, updates: Partial<UserPermission>) => {
        try {
            const updated = await api.updateUserPermission(id, updates);
            setPermissions((prev) =>
                prev.map((p) => (p.id === id ? updated : p))
            );
        } catch (err) {
            console.error('Failed to update permission:', err);
            throw err;
        }
    };

    const deletePermission = async (id: string) => {
        try {
            await api.deleteUserPermission(id);
            setPermissions((prev) => prev.filter((p) => p.id !== id));
        } catch (err) {
            console.error('Failed to delete permission:', err);
            throw err;
        }
    };

    // Reload functions
    const reloadCompanies = async () => {
        try {
            const companiesData = await api.getCompanies();
            const companiesWithRelations = await Promise.all(
                companiesData.map(async (company) => {
                    const [credentials, outputRoutes] = await Promise.all([
                        api.getCredentialsByCompany(company.id),
                        api.getOutputRoutesByCompany(company.id),
                    ]);
                    return { ...company, credentials, outputRoutes };
                })
            );
            setCompanies(companiesWithRelations);
        } catch (err) {
            console.error('Failed to reload companies:', err);
            throw err;
        }
    };

    const reloadExecutionLogs = async () => {
        try {
            const logsData = await api.getExecutionLogs();
            setExecutionLogs(logsData);
        } catch (err) {
            console.error('Failed to reload execution logs:', err);
            throw err;
        }
    };

    return (
        <AppContext.Provider
            value={{
                companies,
                activeCompany,
                globalVars,
                permissions,
                integrations,
                executionLogs,
                isAuthenticated,
                isLoading,
                error,
                login,
                logout,
                setActiveCompanyById: setActiveCompanyId,
                updateCompany,
                addCompany,
                deleteCompany: deleteCompanyAction,
                addGlobalVar,
                updateGlobalVar,
                deleteGlobalVar,
                addPermission,
                updatePermission,
                deletePermission,
                reloadCompanies,
                reloadExecutionLogs,
                globalSchema: DEFAULT_GLOBAL_SCHEMA,
                outputTemplate: DEFAULT_OUTPUT_TEMPLATE,
            }}
        >
            {children}
        </AppContext.Provider>
    );
}
