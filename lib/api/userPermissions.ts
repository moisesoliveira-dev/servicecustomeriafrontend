import supabase from '@/lib/supabase';
import { UserPermission } from '@/types';

interface UserPermissionDTO {
    id: string;
    user_email: string;
    role: string;
    scope: string;
    created_at: string;
    updated_at: string;
}

function fromDTO(dto: UserPermissionDTO): UserPermission {
    return {
        id: dto.id,
        userEmail: dto.user_email,
        role: dto.role as 'admin' | 'operator' | 'viewer',
        scope: dto.scope,
    };
}

export async function getUserPermissions(): Promise<UserPermission[]> {
    const { data, error } = await supabase
        .from('user_permissions')
        .select('*')
        .order('user_email');

    if (error) throw error;
    return (data || []).map(fromDTO);
}

export async function getPermissionsByEmail(email: string): Promise<UserPermission[]> {
    const { data, error } = await supabase
        .from('user_permissions')
        .select('*')
        .eq('user_email', email);

    if (error) throw error;
    return (data || []).map(fromDTO);
}

export async function createUserPermission(permission: Omit<UserPermission, 'id'>): Promise<UserPermission> {
    const { data, error } = await supabase
        .from('user_permissions')
        .insert({
            user_email: permission.userEmail,
            role: permission.role,
            scope: permission.scope,
        })
        .select()
        .single();

    if (error) throw error;
    return fromDTO(data);
}

export async function updateUserPermission(
    id: string | number,
    updates: Partial<UserPermission>
): Promise<UserPermission> {
    const dto: Record<string, unknown> = {};
    if (updates.userEmail !== undefined) dto.user_email = updates.userEmail;
    if (updates.role !== undefined) dto.role = updates.role;
    if (updates.scope !== undefined) dto.scope = updates.scope;

    const { data, error } = await supabase
        .from('user_permissions')
        .update(dto)
        .eq('id', id)
        .select()
        .single();

    if (error) throw error;
    return fromDTO(data);
}

export async function deleteUserPermission(id: string | number): Promise<void> {
    const { error } = await supabase
        .from('user_permissions')
        .delete()
        .eq('id', id);

    if (error) throw error;
}
