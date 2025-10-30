import axiosServices from 'utils/axios';
import { openSnackbar } from 'api/snackbar';
import { SnackbarProps } from 'types/snackbar';
const defaultSnackbar: SnackbarProps = {
  action: false,
  open: true,
  message: '',
  anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
  variant: 'alert',
  alert: { color: 'primary', variant: 'filled' },
  transition: 'Fade',
  close: false,
  actionButton: false,
  maxStack: 3,
  dense: false,
  iconVariant: 'usedefault'
};

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
    try {
      const response = await axiosServices.get(`${ROLE_API}/All`, {
        params: { withPermissions }
      });
      const items = response.data?.Message || [];
      openSnackbar({ ...defaultSnackbar, message: 'Roles obtenidos correctamente.', alert: { ...defaultSnackbar.alert, color: 'success' } });
      return (items as any[]).map(mapRole);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al obtener roles';
      openSnackbar({ ...defaultSnackbar, message: errorMessage, alert: { ...defaultSnackbar.alert, color: 'error' } });
      return [];
    }
  },
  getById: async (id: number): Promise<RoleItem> => {
    try {
      const response = await axiosServices.get(`${ROLE_API}/${id}`);
      const item = response.data?.Message || {};
      openSnackbar({ ...defaultSnackbar, message: 'Rol obtenido correctamente.', alert: { ...defaultSnackbar.alert, color: 'success' } });
      return { ...mapRole(item), permissions: item.permissions || [] };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al obtener rol';
      openSnackbar({ ...defaultSnackbar, message: errorMessage, alert: { ...defaultSnackbar.alert, color: 'error' } });
      return {} as RoleItem;
    }
  },
  create: async (data: { name: string; isActive: boolean; permissions: number[] }): Promise<RoleItem> => {
    try {
      const payload = {
        name: data.name,
        isActive: String(data.isActive),
        permissions: data.permissions
      };
      const response = await axiosServices.post(`${ROLE_API}/Create`, payload);
      openSnackbar({ ...defaultSnackbar, message: 'Rol creado correctamente.', alert: { ...defaultSnackbar.alert, color: 'success' } });
      return mapRole(response.data?.Message || {});
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al crear rol';
      openSnackbar({ ...defaultSnackbar, message: errorMessage, alert: { ...defaultSnackbar.alert, color: 'error' } });
      return {} as RoleItem;
    }
  },
  update: async (id: number, data: { name: string; isActive: boolean; permissions: number[] }): Promise<RoleItem> => {
    try {
      const payload = {
        id,
        name: data.name,
        isActive: String(data.isActive),
        permissions: data.permissions
      };
      const response = await axiosServices.put(`${ROLE_API}/Update`, payload);
      openSnackbar({ ...defaultSnackbar, message: 'Rol actualizado correctamente.', alert: { ...defaultSnackbar.alert, color: 'success' } });
      return mapRole(response.data?.Message || {});
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al actualizar rol';
      openSnackbar({ ...defaultSnackbar, message: errorMessage, alert: { ...defaultSnackbar.alert, color: 'error' } });
      return {} as RoleItem;
    }
  },
  remove: async (id: number): Promise<{ deleted: boolean } | any> => {
    try {
      const response = await axiosServices.delete(`${ROLE_API}/Delete/${id}`);
      openSnackbar({ ...defaultSnackbar, message: 'Rol eliminado correctamente.', alert: { ...defaultSnackbar.alert, color: 'success' } });
      return response.data?.Message ?? { deleted: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al eliminar rol';
      openSnackbar({ ...defaultSnackbar, message: errorMessage, alert: { ...defaultSnackbar.alert, color: 'error' } });
      return { deleted: false, error: errorMessage };
    }
  }
};

export default roleApi;
