import axiosServices from 'utils/axios';

export interface SimplePermission {
  id: number;
  name: string;
  key: string;
}

const PERMISSION_API = '/api/Permission';

export const permissionApi = {
  getAll: async (): Promise<SimplePermission[]> => {
    const response = await axiosServices.get(`${PERMISSION_API}/All`);
    const items = response.data?.Message || [];
    return (items as any[]).map((p: any) => ({ id: p.Id, name: p.Name, key: p.key || p.Key }));
  },
  syncBaseWithAdvanced: async () => {
    const response = await axiosServices.post(`/api/permissions-advanced/sync-base-permissions`);
    return response.data?.Message || response.data;
  }
};

export default permissionApi;
