import supabase from '@/lib/supabase';
import { OutputRoute, Header, OutputExecution } from '@/types';

interface OutputRouteDTO {
    id: string;
    company_id: string;
    name: string;
    url: string;
    method: 'POST' | 'PUT' | 'GET';
    body_template: string | null;
    group_name: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
}

interface HeaderDTO {
    id: string;
    route_id: string;
    key: string;
    value: string;
}

interface ExecutionDTO {
    id: string;
    route_id: string;
    timestamp: string;
    status: number;
    payload: Record<string, unknown> | null;
    response: Record<string, unknown> | null;
    duration: string | null;
}

function fromRouteDTO(dto: OutputRouteDTO, headers: Header[] = [], executions: OutputExecution[] = []): OutputRoute {
    return {
        id: dto.id,
        name: dto.name,
        url: dto.url,
        method: dto.method,
        headers,
        bodyTemplate: dto.body_template || '',
        group: dto.group_name || undefined,
        history: executions,
    };
}

function fromHeaderDTO(dto: HeaderDTO): Header {
    return {
        id: dto.id,
        key: dto.key,
        value: dto.value,
    };
}

function fromExecutionDTO(dto: ExecutionDTO): OutputExecution {
    return {
        id: dto.id,
        timestamp: dto.timestamp,
        status: dto.status,
        payload: dto.payload || undefined,
        response: dto.response || undefined,
        duration: dto.duration || '',
    };
}

export async function getOutputRoutesByCompany(companyId: string | number): Promise<OutputRoute[]> {
    // Get routes
    const { data: routesData, error: routesError } = await supabase
        .from('output_routes')
        .select('*')
        .eq('company_id', companyId)
        .order('name');

    if (routesError) throw routesError;
    if (!routesData || routesData.length === 0) return [];

    const routeIds = routesData.map((r: OutputRouteDTO) => r.id);

    // Get headers for all routes
    const { data: headersData, error: headersError } = await supabase
        .from('output_route_headers')
        .select('*')
        .in('route_id', routeIds);

    if (headersError) throw headersError;

    // Get executions for all routes
    const { data: execsData, error: execsError } = await supabase
        .from('output_executions')
        .select('*')
        .in('route_id', routeIds)
        .order('timestamp', { ascending: false })
        .limit(100);

    if (execsError) throw execsError;

    // Group headers and executions by route
    const headersByRoute: Record<string, Header[]> = {};
    const execsByRoute: Record<string, OutputExecution[]> = {};

    (headersData || []).forEach((h: HeaderDTO) => {
        if (!headersByRoute[h.route_id]) headersByRoute[h.route_id] = [];
        headersByRoute[h.route_id].push(fromHeaderDTO(h));
    });

    (execsData || []).forEach((e: ExecutionDTO) => {
        if (!execsByRoute[e.route_id]) execsByRoute[e.route_id] = [];
        execsByRoute[e.route_id].push(fromExecutionDTO(e));
    });

    return routesData.map((r: OutputRouteDTO) =>
        fromRouteDTO(r, headersByRoute[r.id] || [], execsByRoute[r.id] || [])
    );
}

export async function createOutputRoute(
    companyId: string | number,
    route: Omit<OutputRoute, 'id' | 'history'>
): Promise<OutputRoute> {
    const { data, error } = await supabase
        .from('output_routes')
        .insert({
            company_id: companyId,
            name: route.name,
            url: route.url,
            method: route.method,
            body_template: route.bodyTemplate || null,
            group_name: route.group || null,
            is_active: true,
        })
        .select()
        .single();

    if (error) throw error;

    // Insert headers
    if (route.headers && route.headers.length > 0) {
        const headersToInsert = route.headers.map((h) => ({
            route_id: data.id,
            key: h.key,
            value: h.value,
        }));

        await supabase.from('output_route_headers').insert(headersToInsert);
    }

    return fromRouteDTO(data, route.headers || [], []);
}

export async function updateOutputRoute(
    id: string,
    updates: Partial<OutputRoute>
): Promise<OutputRoute> {
    const dto: Record<string, unknown> = {};
    if (updates.name !== undefined) dto.name = updates.name;
    if (updates.url !== undefined) dto.url = updates.url;
    if (updates.method !== undefined) dto.method = updates.method;
    if (updates.bodyTemplate !== undefined) dto.body_template = updates.bodyTemplate;
    if (updates.group !== undefined) dto.group_name = updates.group;

    const { data, error } = await supabase
        .from('output_routes')
        .update(dto)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;

    // Update headers if provided
    if (updates.headers) {
        // Delete existing headers
        await supabase.from('output_route_headers').delete().eq('route_id', id);

        // Insert new headers
        if (updates.headers.length > 0) {
            const headersToInsert = updates.headers.map((h) => ({
                route_id: id,
                key: h.key,
                value: h.value,
            }));
            await supabase.from('output_route_headers').insert(headersToInsert);
        }
    }

    return fromRouteDTO(data, updates.headers || [], []);
}

export async function deleteOutputRoute(id: string | number): Promise<void> {
    // Headers and executions are deleted by CASCADE
    const { error } = await supabase
        .from('output_routes')
        .delete()
        .eq('id', id);

    if (error) throw error;
}
