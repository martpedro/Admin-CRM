import { useMemo } from 'react';
import useSWR from 'swr';
import axiosServices, { fetcher } from 'utils/axios';

export type MenuPermissionItem = {
  id: number;
  menuKey: string;
  menuName: string;
  menuPath: string;
  parentMenuKey?: string | null;
  icon?: string | null;
  order: number;
  description?: string | null;
  isActive: boolean;
};

const endpoint = '/api/permissions-advanced/menus';

export function useGetMenuPermissions() {
  const { data, isLoading, error } = useSWR(endpoint, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memo = useMemo(() => {
    const raw = Array.isArray(data?.Message || data) ? (data.Message || data) : [];
    // Deduplicar por menuKey
    const map = new Map<string, MenuPermissionItem>();
    for (const m of raw) {
      const item: MenuPermissionItem = {
        id: m.Id,
        menuKey: m.MenuKey,
        menuName: m.MenuName,
        menuPath: m.MenuPath,
        parentMenuKey: m.ParentMenuKey ?? null,
        icon: m.Icon ?? null,
        order: m.Order ?? 0,
        description: m.Description ?? null,
        isActive: !!m.IsActive
      };
      if (!map.has(item.menuKey)) map.set(item.menuKey, item);
    }
    const list = Array.from(map.values());

    return {
      menus: list,
      menusLoading: isLoading,
      menusError: error
    };
  }, [data, isLoading, error]);

  return memo;
}

// Obtener menús habilitados para un usuario
export async function getUserMenus(userId: number) {
  const res = await axiosServices.get(`/api/permissions-advanced/user-menus/${userId}`);
  const raw = Array.isArray(res.data?.Message || res.data) ? (res.data.Message || res.data) : [];
  return raw.map((m: any) => ({
    id: m.Id,
    menuKey: m.MenuKey,
    menuName: m.MenuName,
    menuPath: m.MenuPath,
    parentMenuKey: m.ParentMenuKey ?? null,
    icon: m.Icon ?? null,
    order: m.Order ?? 0,
    description: m.Description ?? null,
    isActive: !!m.IsActive
  })) as MenuPermissionItem[];
}

// Establecer menús para un usuario (por menuKeys)
export async function setUserMenus(userId: number, menuKeys: string[]) {
  const res = await axiosServices.post(`/api/permissions-advanced/user-menus`, { UserId: userId, MenuKeys: menuKeys });
  return res.data?.Message || res.data;
}
