import useSWR from 'swr';
import axiosServices from 'utils/axios';

export interface AdvancedPermissionItem {
  id: number;
  key: string;
  name: string;
  type: string;
  module?: string | null;
  action?: string | null;
  dataScope?: string | null;
  menuPath?: string | null;
}

// Obtener todos (public all-public asegura inicialización si vacío)
export async function fetchAllAdvancedPermissions(): Promise<AdvancedPermissionItem[]> {
  const res = await axiosServices.get('/api/permissions-advanced/all-public');
  const list = res.data?.Message || res.data;
  return (list || []).map((p: any) => ({
    id: p.Id,
    key: p.Key,
    name: p.Name,
    type: p.Type,
    module: p.Module ?? null,
    action: p.Action ?? null,
    dataScope: p.DataScope ?? null,
    menuPath: p.MenuPath ?? null
  }));
}

export function useAllAdvancedPermissions() {
  const { data, error, isLoading, mutate } = useSWR('/advanced-permissions', fetchAllAdvancedPermissions, { revalidateOnFocus: false });
  return { permissions: data || [], permissionsLoading: isLoading, permissionsError: error, reloadPermissions: mutate };
}

// Permisos de un usuario
export async function fetchUserAdvancedPermissions(userId: number): Promise<AdvancedPermissionItem[]> {
  const res = await axiosServices.get(`/api/permissions-advanced/user-public/${userId}`);
  const list = res.data?.Message || res.data;
  return (list || []).map((p: any) => ({
    id: p.Permission?.Id || p.Id,
    key: p.Permission?.Key || p.Key,
    name: p.Permission?.Name || p.Name,
    type: p.Permission?.Type || p.Type,
    module: p.Permission?.Module ?? p.Module ?? null,
    action: p.Permission?.Action ?? p.Action ?? null,
    dataScope: p.Permission?.DataScope ?? p.DataScope ?? null,
    menuPath: p.Permission?.MenuPath ?? p.MenuPath ?? null
  }));
}

export function useUserAdvancedPermissions(userId?: number) {
  const shouldFetch = !!userId;
  const { data, error, isLoading, mutate } = useSWR(shouldFetch ? `/advanced-permissions-user-${userId}` : null, () => fetchUserAdvancedPermissions(userId!));
  return { userPermissions: data || [], userPermissionsLoading: isLoading, userPermissionsError: error, reloadUserPermissions: mutate };
}
