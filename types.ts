
export enum NodeType {
    INPUT_TRANSFORMER = 'INPUT_TRANSFORMER',
    STATE_MANAGER = 'STATE_MANAGER',
    STATE_ROUTER = 'STATE_ROUTER',
    AGENT_WORKER = 'AGENT_WORKER',
    OUTPUT_GENERATOR = 'OUTPUT_GENERATOR'
}

export type CRMType = 'salesforce' | 'hubspot' | 'custom' | 'none';

export enum IntegrationStatus {
    DISCONNECTED = 'DISCONNECTED',
    CONNECTING = 'CONNECTING',
    CONNECTED = 'CONNECTED',
    ERROR = 'ERROR',
    EXPIRING = 'EXPIRING'
}

export interface Header {
    id: string | number;
    key?: string;
    value: string;
}

export interface OutputExecution {
    id: string | number;
    timestamp?: string;
    status: number;
    payload: any;
    response: any;
    duration: string;
}

export interface OutputRoute {
    id: string | number;
    name?: string;
    url?: string;
    method: 'POST' | 'PUT' | 'GET';
    headers: Header[];
    bodyTemplate: string;
    history?: OutputExecution[];
    group?: string;
    companyId?: string | number;
    isActive?: boolean;
}

export interface Credential {
    id: string | number;
    alias: string;
    providerId: string | number;
    expiresAt?: string;
    credentialId: string;
    status?: IntegrationStatus;
    lastTested?: string;
    companyId?: string | number;
}

export interface Company {
    id: string | number;
    name: string;
    color: string;
    crmType: CRMType;
    internalSchema?: any;
    outputTemplate?: any;
    outputRoutes?: OutputRoute[];
    credentials?: Credential[];
    crmConfig?: {
        webhookUrl?: string;
        aiInstructions?: string;
        sourceJson?: string;
    };
}

export interface EnvVar {
    id: string | number;
    key: string;
    value: string;
    isGlobal: boolean;
    isSecret?: boolean;
}

export interface Integration {
    id: string | number;
    name: string;
    icon?: string;
    configFields: {
        label: string;
        key: string;
        type: string;
        placeholder: string;
    }[];
}

export interface ExecutionStep {
    name: string;
    status: 'COMPLETED' | 'FAILED' | 'PENDING';
    timestamp: string;
    payloadIn: any;
    payloadOut: any;
}

export interface ExecutionLog {
    id: string | number;
    sessionId: string;
    companyId?: string | number;
    timestamp?: string;
    duration?: string;
    status: 'SUCCESS' | 'FAILURE' | 'RUNNING';
    steps: ExecutionStep[];
}

export interface UserPermission {
    id: string | number;
    user?: string; // deprecated, use userEmail
    userEmail: string;
    role: string;
    scope: string;
}