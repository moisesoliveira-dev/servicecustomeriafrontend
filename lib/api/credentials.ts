import supabase from '@/lib/supabase';
import { Credential, IntegrationStatus } from '@/types';

interface CredentialDTO {
    id: string;
    company_id: string;
    provider_id: string;
    alias: string;
    credential_id: string;
    status: string;
    last_tested: string | null;
    expires_at: string | null;
    config_data: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
}

function mapStatus(status: string): IntegrationStatus {
    const map: Record<string, IntegrationStatus> = {
        DISCONNECTED: IntegrationStatus.DISCONNECTED,
        CONNECTING: IntegrationStatus.CONNECTING,
        CONNECTED: IntegrationStatus.CONNECTED,
        ERROR: IntegrationStatus.ERROR,
        EXPIRING: IntegrationStatus.EXPIRING,
    };
    return map[status] || IntegrationStatus.DISCONNECTED;
}

function fromDTO(dto: CredentialDTO): Credential {
    return {
        id: dto.id,
        providerId: dto.provider_id,
        alias: dto.alias,
        credentialId: dto.credential_id,
        status: mapStatus(dto.status),
        lastTested: dto.last_tested || '',
        expiresAt: dto.expires_at || undefined,
    };
}

export async function getCredentialsByCompany(companyId: string): Promise<Credential[]> {
    const { data, error } = await supabase
        .from('credentials')
        .select('*')
        .eq('company_id', companyId)
        .order('alias');

    if (error) throw error;
    return (data || []).map(fromDTO);
}

export async function createCredential(
    companyId: string,
    credential: Omit<Credential, 'id'>
): Promise<Credential> {
    const { data, error } = await supabase
        .from('credentials')
        .insert({
            company_id: companyId,
            provider_id: credential.providerId,
            alias: credential.alias,
            credential_id: credential.credentialId,
            status: credential.status,
        })
        .select()
        .single();

    if (error) throw error;
    return fromDTO(data);
}

export async function updateCredential(
    id: string,
    updates: Partial<Credential>
): Promise<Credential> {
    const dto: Record<string, unknown> = {};
    if (updates.alias) dto.alias = updates.alias;
    if (updates.status) dto.status = updates.status;
    if (updates.lastTested) dto.last_tested = updates.lastTested;
    if (updates.expiresAt) dto.expires_at = updates.expiresAt;

    const { data, error } = await supabase
        .from('credentials')
        .update(dto)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return fromDTO(data);
}

export async function deleteCredential(id: string): Promise<void> {
    const { error } = await supabase
        .from('credentials')
        .delete()
        .eq('id', id);

    if (error) throw error;
}
