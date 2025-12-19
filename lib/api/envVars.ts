import supabase from '@/lib/supabase';
import { EnvVar } from '@/types';

interface EnvVarDTO {
    id: string;
    key: string;
    value: string;
    is_secret: boolean;
    created_at: string;
    updated_at: string;
}

function fromDTO(dto: EnvVarDTO): EnvVar {
    return {
        id: dto.id,
        key: dto.key,
        value: dto.value,
        isSecret: dto.is_secret,
    };
}

export async function getEnvVars(): Promise<EnvVar[]> {
    const { data, error } = await supabase
        .from('env_vars')
        .select('*')
        .order('key');

    if (error) throw error;
    return (data || []).map(fromDTO);
}

export async function createEnvVar(envVar: Omit<EnvVar, 'id'>): Promise<EnvVar> {
    const { data, error } = await supabase
        .from('env_vars')
        .insert({
            key: envVar.key,
            value: envVar.value,
            is_secret: envVar.isSecret,
        })
        .select()
        .single();

    if (error) throw error;
    return fromDTO(data);
}

export async function updateEnvVar(id: string, updates: Partial<EnvVar>): Promise<EnvVar> {
    const dto: Record<string, unknown> = {};
    if (updates.key !== undefined) dto.key = updates.key;
    if (updates.value !== undefined) dto.value = updates.value;
    if (updates.isSecret !== undefined) dto.is_secret = updates.isSecret;

    const { data, error } = await supabase
        .from('env_vars')
        .update(dto)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return fromDTO(data);
}

export async function deleteEnvVar(id: string): Promise<void> {
    const { error } = await supabase
        .from('env_vars')
        .delete()
        .eq('id', id);

    if (error) throw error;
}
