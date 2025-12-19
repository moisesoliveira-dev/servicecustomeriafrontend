import supabase from '@/lib/supabase';
import { ExecutionLog, ExecutionStep } from '@/types';

interface ExecutionLogDTO {
    id: string;
    company_id: string | null;
    session_id: string;
    timestamp: string;
    duration: string | null;
    status: 'SUCCESS' | 'FAILURE' | 'RUNNING';
    created_at: string;
}

interface ExecutionStepDTO {
    id: number;
    execution_log_id: string;
    step_order: number;
    name: string;
    status: 'COMPLETED' | 'FAILED' | 'PENDING';
    timestamp: string | null;
    payload_in: Record<string, unknown> | null;
    payload_out: Record<string, unknown> | null;
}

function fromStepDTO(dto: ExecutionStepDTO): ExecutionStep {
    return {
        name: dto.name,
        status: dto.status,
        timestamp: dto.timestamp || '',
        payloadIn: dto.payload_in || undefined,
        payloadOut: dto.payload_out || undefined,
    };
}

function fromDTO(dto: ExecutionLogDTO, steps: ExecutionStep[] = []): ExecutionLog {
    return {
        id: dto.id,
        sessionId: dto.session_id,
        timestamp: dto.timestamp,
        duration: dto.duration || '',
        status: dto.status,
        steps,
    };
}

export async function getExecutionLogs(companyId?: string, limit = 50): Promise<ExecutionLog[]> {
    let query = supabase
        .from('execution_logs')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(limit);

    if (companyId) {
        query = query.eq('company_id', companyId);
    }

    const { data: logsData, error: logsError } = await query;

    if (logsError) throw logsError;
    if (!logsData || logsData.length === 0) return [];

    const logIds = logsData.map((l) => l.id);

    // Get steps for all logs
    const { data: stepsData, error: stepsError } = await supabase
        .from('execution_steps')
        .select('*')
        .in('execution_log_id', logIds)
        .order('step_order');

    if (stepsError) throw stepsError;

    // Group steps by log
    const stepsByLog: Record<string, ExecutionStep[]> = {};
    (stepsData || []).forEach((s) => {
        if (!stepsByLog[s.execution_log_id]) stepsByLog[s.execution_log_id] = [];
        stepsByLog[s.execution_log_id].push(fromStepDTO(s));
    });

    return logsData.map((l) => fromDTO(l, stepsByLog[l.id] || []));
}

export async function getExecutionLogById(id: string): Promise<ExecutionLog | null> {
    const { data: logData, error: logError } = await supabase
        .from('execution_logs')
        .select('*')
        .eq('id', id)
        .single();

    if (logError) {
        if (logError.code === 'PGRST116') return null;
        throw logError;
    }

    const { data: stepsData, error: stepsError } = await supabase
        .from('execution_steps')
        .select('*')
        .eq('execution_log_id', id)
        .order('step_order');

    if (stepsError) throw stepsError;

    const steps = (stepsData || []).map(fromStepDTO);
    return fromDTO(logData, steps);
}

export async function createExecutionLog(
    log: Omit<ExecutionLog, 'id'>,
    companyId?: string
): Promise<ExecutionLog> {
    const { data: logData, error: logError } = await supabase
        .from('execution_logs')
        .insert({
            company_id: companyId || null,
            session_id: log.sessionId,
            status: log.status,
            duration: log.duration || null,
        })
        .select()
        .single();

    if (logError) throw logError;

    // Insert steps if provided
    if (log.steps && log.steps.length > 0) {
        const stepsToInsert = log.steps.map((s, i) => ({
            execution_log_id: logData.id,
            step_order: i + 1,
            name: s.name,
            status: s.status,
            timestamp: s.timestamp || null,
            payload_in: s.payloadIn || null,
            payload_out: s.payloadOut || null,
        }));

        await supabase.from('execution_steps').insert(stepsToInsert);
    }

    return fromDTO(logData, log.steps || []);
}

export async function updateExecutionLogStatus(
    id: string,
    status: 'SUCCESS' | 'FAILURE' | 'RUNNING',
    duration?: string
): Promise<void> {
    const { error } = await supabase
        .from('execution_logs')
        .update({ status, duration: duration || null })
        .eq('id', id);

    if (error) throw error;
}
