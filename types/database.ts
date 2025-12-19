export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export type CrmType = 'salesforce' | 'hubspot' | 'custom' | 'none'
export type NodeType = 'INPUT_TRANSFORMER' | 'STATE_MANAGER' | 'STATE_ROUTER' | 'AGENT_WORKER' | 'OUTPUT_GENERATOR'
export type IntegrationStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED' | 'ERROR' | 'EXPIRING'
export type HttpMethod = 'POST' | 'PUT' | 'GET'
export type ExecutionStatus = 'SUCCESS' | 'FAILURE' | 'RUNNING'
export type StepStatus = 'COMPLETED' | 'FAILED' | 'PENDING'

export interface Database {
    public: {
        Tables: {
            companies: {
                Row: {
                    id: string
                    name: string
                    color: string
                    crm_type: CrmType
                    internal_schema: Json | null
                    output_template: Json | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    name: string
                    color?: string
                    crm_type?: CrmType
                    internal_schema?: Json | null
                    output_template?: Json | null
                    created_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    name?: string
                    color?: string
                    crm_type?: CrmType
                    internal_schema?: Json | null
                    output_template?: Json | null
                    updated_at?: string
                }
            }
            crm_configs: {
                Row: {
                    id: number
                    company_id: string
                    webhook_url: string | null
                    ai_instructions: string | null
                    source_json: string | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: number
                    company_id: string
                    webhook_url?: string | null
                    ai_instructions?: string | null
                    source_json?: string | null
                }
                Update: {
                    webhook_url?: string | null
                    ai_instructions?: string | null
                    source_json?: string | null
                }
            }
            integrations: {
                Row: {
                    id: string
                    name: string
                    type: string
                    icon: string | null
                    config_fields: Json
                    created_at: string
                }
                Insert: {
                    id: string
                    name: string
                    type: string
                    icon?: string | null
                    config_fields?: Json
                }
                Update: {
                    name?: string
                    type?: string
                    icon?: string | null
                    config_fields?: Json
                }
            }
            credentials: {
                Row: {
                    id: string
                    company_id: string
                    provider_id: string
                    alias: string
                    credential_id: string
                    status: IntegrationStatus
                    last_tested: string | null
                    expires_at: string | null
                    config_data: Json | null
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    company_id: string
                    provider_id: string
                    alias: string
                    credential_id: string
                    status?: IntegrationStatus
                    config_data?: Json | null
                }
                Update: {
                    alias?: string
                    status?: IntegrationStatus
                    last_tested?: string | null
                    expires_at?: string | null
                    config_data?: Json | null
                }
            }
            output_routes: {
                Row: {
                    id: string
                    company_id: string
                    name: string
                    url: string
                    method: HttpMethod
                    body_template: string | null
                    group_name: string | null
                    is_active: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    company_id: string
                    name: string
                    url: string
                    method?: HttpMethod
                    body_template?: string | null
                    group_name?: string | null
                    is_active?: boolean
                }
                Update: {
                    name?: string
                    url?: string
                    method?: HttpMethod
                    body_template?: string | null
                    group_name?: string | null
                    is_active?: boolean
                }
            }
            output_route_headers: {
                Row: {
                    id: string
                    route_id: string
                    key: string
                    value: string
                }
                Insert: {
                    id?: string
                    route_id: string
                    key: string
                    value: string
                }
                Update: {
                    key?: string
                    value?: string
                }
            }
            output_executions: {
                Row: {
                    id: string
                    route_id: string
                    timestamp: string
                    status: number
                    payload: Json | null
                    response: Json | null
                    duration: string | null
                }
                Insert: {
                    id?: string
                    route_id: string
                    status: number
                    payload?: Json | null
                    response?: Json | null
                    duration?: string | null
                }
                Update: {
                    status?: number
                    payload?: Json | null
                    response?: Json | null
                    duration?: string | null
                }
            }
            env_vars: {
                Row: {
                    id: string
                    key: string
                    value: string
                    is_secret: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    key: string
                    value: string
                    is_secret?: boolean
                }
                Update: {
                    key?: string
                    value?: string
                    is_secret?: boolean
                }
            }
            execution_logs: {
                Row: {
                    id: string
                    company_id: string | null
                    session_id: string
                    timestamp: string
                    duration: string | null
                    status: ExecutionStatus
                    created_at: string
                }
                Insert: {
                    id?: string
                    company_id?: string | null
                    session_id: string
                    status: ExecutionStatus
                    duration?: string | null
                }
                Update: {
                    duration?: string | null
                    status?: ExecutionStatus
                }
            }
            execution_steps: {
                Row: {
                    id: number
                    execution_log_id: string
                    step_order: number
                    name: string
                    status: StepStatus
                    timestamp: string | null
                    payload_in: Json | null
                    payload_out: Json | null
                }
                Insert: {
                    execution_log_id: string
                    step_order: number
                    name: string
                    status: StepStatus
                    timestamp?: string | null
                    payload_in?: Json | null
                    payload_out?: Json | null
                }
                Update: {
                    name?: string
                    status?: StepStatus
                    payload_in?: Json | null
                    payload_out?: Json | null
                }
            }
            user_permissions: {
                Row: {
                    id: string
                    user_email: string
                    role: string
                    scope: string
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    user_email: string
                    role: string
                    scope: string
                }
                Update: {
                    user_email?: string
                    role?: string
                    scope?: string
                }
            }
            flow_nodes: {
                Row: {
                    id: string
                    company_id: string
                    node_type: NodeType
                    label: string
                    position_x: number
                    position_y: number
                    config: Json | null
                    provider_id: string | null
                    is_deletable: boolean
                    created_at: string
                    updated_at: string
                }
                Insert: {
                    id?: string
                    company_id: string
                    node_type: NodeType
                    label: string
                    position_x?: number
                    position_y?: number
                    config?: Json | null
                    provider_id?: string | null
                    is_deletable?: boolean
                }
                Update: {
                    node_type?: NodeType
                    label?: string
                    position_x?: number
                    position_y?: number
                    config?: Json | null
                    is_deletable?: boolean
                }
            }
            flow_edges: {
                Row: {
                    id: string
                    company_id: string
                    source_node_id: string
                    target_node_id: string
                    edge_type: string | null
                    animated: boolean
                    created_at: string
                }
                Insert: {
                    id?: string
                    company_id: string
                    source_node_id: string
                    target_node_id: string
                    edge_type?: string | null
                    animated?: boolean
                }
                Update: {
                    edge_type?: string | null
                    animated?: boolean
                }
            }
        }
    }
}
