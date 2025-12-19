
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
    id: string;
    key: string;
    value: string;
}

export interface OutputExecution {
    id: string;
    timestamp: string;
    status: number;
    payload: any;
    response: any;
    duration: string;
}

export interface OutputRoute {
    id: string;
    name: string;
    url: string;
    method: 'POST' | 'PUT' | 'GET';
    headers: Header[];
    bodyTemplate: string;
    history?: OutputExecution[];
    group?: string;
}

export interface Credential {
    id: string;
    alias: string;
    providerId: string;
    status: IntegrationStatus;
    lastTested: string;
    expiresAt?: string;
    credentialId: string;
}

export interface Company {
    id: string;
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
    id: string;
    key: string;
    value: string;
    isSecret: boolean;
}

export interface Integration {
    id: string;
    name: string;
    type: string;
    icon: string;
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
    id: string;
    sessionId: string;
    timestamp: string;
    duration: string;
    status: 'SUCCESS' | 'FAILURE' | 'RUNNING';
    steps: ExecutionStep[];
}

export interface UserPermission {
    id: string;
    user?: string; // deprecated, use userEmail
    userEmail: string;
    role: string;
    scope: string;
}