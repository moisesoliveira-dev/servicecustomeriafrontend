import supabase from '@/lib/supabase';
import { Company, CRMType } from '@/types';

export interface CompanyDTO {
    id: string;
    name: string;
    color: string;
    crm_type: string;
    internal_schema: Record<string, unknown> | null;
    output_template: Record<string, unknown> | null;
    created_at: string;
    updated_at: string;
}

function mapCrmType(type: string): CRMType {
    const map: Record<string, CRMType> = {
        salesforce: 'salesforce',
        hubspot: 'hubspot',
        custom: 'custom',
        none: 'none',
    };
    return map[type] || 'none';
}

function toDTO(company: Partial<Company>): Record<string, unknown> {
    const dto: Record<string, unknown> = {};
    if (company.name) dto.name = company.name;
    if (company.color) dto.color = company.color;
    if (company.crmType) dto.crm_type = company.crmType;
    if (company.internalSchema) dto.internal_schema = company.internalSchema;
    if (company.outputTemplate) dto.output_template = company.outputTemplate;
    return dto;
}

function fromDTO(dto: CompanyDTO): Company {
    return {
        id: dto.id,
        name: dto.name,
        color: dto.color,
        crmType: mapCrmType(dto.crm_type),
        internalSchema: dto.internal_schema || {},
        outputTemplate: dto.output_template || {},
        credentials: [],
        outputRoutes: [],
    };
}

export async function getCompanies(): Promise<Company[]> {
    const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name');

    if (error) throw error;
    return (data || []).map(fromDTO);
}

export async function getCompanyById(id: string): Promise<Company | null> {
    const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('id', id)
        .single();

    if (error) {
        if (error.code === 'PGRST116') return null;
        throw error;
    }
    return data ? fromDTO(data) : null;
}

export async function createCompany(company: Omit<Company, 'id' | 'credentials' | 'outputRoutes'>): Promise<Company> {
    const { data, error } = await supabase
        .from('companies')
        .insert({
            name: company.name,
            color: company.color,
            crm_type: company.crmType.toLowerCase(),
            internal_schema: company.internalSchema || {},
            output_template: company.outputTemplate || {},
        })
        .select()
        .single();

    if (error) {
        console.error('Supabase error:', error);
        throw new Error(`Erro ao criar empresa no Supabase: ${error.message || error.code || 'Erro desconhecido'}`);
    }
    return fromDTO(data);
}

export async function updateCompany(id: string, updates: Partial<Company>): Promise<Company> {
    const dto = toDTO(updates);

    const { data, error } = await supabase
        .from('companies')
        .update(dto)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return fromDTO(data);
}

export async function deleteCompany(id: string): Promise<void> {
    const { error } = await supabase
        .from('companies')
        .delete()
        .eq('id', id);

    if (error) throw error;
}
