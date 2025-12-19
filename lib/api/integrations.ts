import supabase from '@/lib/supabase';
import { Integration } from '@/types';

interface IntegrationDTO {
    id: string;
    name: string;
    type: string;
    icon: string | null;
    config_fields: unknown;
    created_at: string;
}

function fromDTO(dto: IntegrationDTO): Integration {
    const configFields = Array.isArray(dto.config_fields) ? dto.config_fields : [];
    return {
        id: dto.id,
        name: dto.name,
        type: dto.type,
        icon: dto.icon || '',
        configFields: configFields.map((f: Record<string, unknown>) => ({
            label: String(f.label || ''),
            key: String(f.key || ''),
            type: String(f.type || 'text'),
            placeholder: String(f.placeholder || ''),
        })),
    };
}

export async function getIntegrations(): Promise<Integration[]> {
    const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .order('name');

    if (error) throw error;
    return (data || []).map(fromDTO);
}

export async function getIntegrationById(id: string): Promise<Integration | null> {
    const { data, error } = await supabase
        .from('integrations')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
    }
    return data ? fromDTO(data) : null;
}

export async function createIntegration(integration: Integration): Promise<Integration> {
    const { data, error } = await supabase
        .from('integrations')
        .insert({
            id: integration.id,
            name: integration.name,
            type: integration.type,
            icon: integration.icon || null,
            config_fields: integration.configFields || [],
        })
        .select()
        .single();

    if (error) throw error;
    return fromDTO(data);
}

export async function seedIntegrations(integrations: Integration[]): Promise<void> {
    const dtos = integrations.map((i) => ({
        id: i.id,
        name: i.name,
        type: i.type,
        icon: i.icon || null,
        config_fields: i.configFields || [],
    }));

    const { error } = await supabase
        .from('integrations')
        .upsert(dtos, { onConflict: 'id' });

    if (error) throw error;
}
