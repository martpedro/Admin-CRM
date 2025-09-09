import axiosServices from 'utils/axios';

export interface RoleItem {
  id: number;
  name: string;
  isActive?: boolean;
  permissions?: { id: number; name: string; key?: string }[];
}

const ROLE_API = '/api/Rol';

const mapRole = (r: any): RoleItem => ({
  id: r.Id,
  name: r.Name,
  isActive: r.IsActive,
  permissions: Array.isArray(r.Permissions)
    ? r.Permissions.map((p: any) => ({ id: p.Id, name: p.Name, key: p.Key || p.key }))
    : undefined
});

const roleApi = {
  getAll: async (withPermissions = false): Promise<RoleItem[]> => {
    const response = await axiosServices.get(`${ROLE_API}/All`, {
      params: { withPermissions }
    });
    const items = response.data?.Message || [];
    return (items as any[]).map(mapRole);
  },
  getById: async (id: number): Promise<RoleItem> => {
    const response = await axiosServices.get(`${ROLE_API}/${id}`);
    const item = response.data?.Message || {};
    return mapRole(item);
  },
  create: async (data: { name: string; isActive: boolean; permissions: number[] }): Promise<RoleItem> => {
    const payload = {
      name: data.name,
      isActive: String(data.isActive),
      permissions: data.permissions
    };
    const response = await axiosServices.post(`${ROLE_API}/Create`, payload);
    return mapRole(response.data?.Message || {});
  },
  update: async (id: number, data: { name: string; isActive: boolean; permissions: number[] }): Promise<RoleItem> => {
    const payload = {
      id,
      name: data.name,
      isActive: String(data.isActive),
      permissions: data.permissions
    };
    const response = await axiosServices.put(`${ROLE_API}/Update`, payload);
    return mapRole(response.data?.Message || {});
  },
  remove: async (id: number): Promise<{ deleted: boolean } | any> => {
    const response = await axiosServices.delete(`${ROLE_API}/Delete/${id}`);
    return response.data?.Message ?? { deleted: true };
  }
};

export default roleApi;
