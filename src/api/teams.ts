// Crear y actualizar equipos
export async function updateTeam(id: number | string, data: Partial<Team> | any) {
  return axiosServices.put(`/api/Team/${id}`, data);
}

export async function createTeam(data: Partial<Team> | any) {
  return axiosServices.post('/api/Team/create', data);
}

import useSWR from 'swr';
import axiosServices from 'utils/axios';
import { Team } from 'types/permission';
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

const TEAM_API = '/api/Team';

const mapTeam = (t: any): Team => ({
  id: t.Id,
  name: t.Name,
  description: t.Description,
  isActive: t.IsActive,
  createdAt: t.CreatedAt,
  updatedAt: t.UpdatedAt,
  leaderId: t.TeamLeader?.Id,
  leader: t.TeamLeader ? {
    id: t.TeamLeader.Id,
    name: t.TeamLeader.Name,
    lastName: t.TeamLeader.LastNAme,
    userName: t.TeamLeader.UserName,
    email: t.TeamLeader.Email,
    phone: t.TeamLeader.Phone,
    letterAsign: t.TeamLeader.LetterAsign,
    isActive: t.TeamLeader.IsActive,
    avatar: t.TeamLeader.Avatar,
    createdAt: t.TeamLeader.CreatedAt
  } : undefined,
  members: Array.isArray(t.Members)
    ? t.Members.map((m: any) => ({
        id: m.Id,
        name: m.Name,
        lastName: m.LastNAme,
        userName: m.UserName,
        email: m.Email,
        phone: m.Phone,
        letterAsign: m.LetterAsign,
        isActive: m.IsActive,
        avatar: m.Avatar,
        createdAt: m.CreatedAt
      }))
    : []
});

const teamApi = {
  getAll: async (params?: any): Promise<Team[]> => {
    try {
      const response = await axiosServices.get(TEAM_API, { params });
      const items = response.data?.Message || response.data || [];
      openSnackbar({ ...defaultSnackbar, message: 'Equipos obtenidos correctamente.', alert: { ...defaultSnackbar.alert, color: 'success' } });
      return (items as any[]).map(mapTeam);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al obtener equipos';
      openSnackbar({ ...defaultSnackbar, message: errorMessage, alert: { ...defaultSnackbar.alert, color: 'error' } });
      return [];
    }
  },
  getById: async (id: number): Promise<Team> => {
    try {
      const response = await axiosServices.get(`${TEAM_API}/${id}`);
      const item = response.data?.Message || {};
      openSnackbar({ ...defaultSnackbar, message: 'Equipo obtenido correctamente.', alert: { ...defaultSnackbar.alert, color: 'success' } });
      return mapTeam(item);
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al obtener equipo';
      openSnackbar({ ...defaultSnackbar, message: errorMessage, alert: { ...defaultSnackbar.alert, color: 'error' } });
      return {} as Team;
    }
  },
  create: async (data: Partial<Team> | any): Promise<Team> => {
    try {
      const response = await axiosServices.post(`${TEAM_API}/Create`, data);
      openSnackbar({ ...defaultSnackbar, message: 'Equipo creado correctamente.', alert: { ...defaultSnackbar.alert, color: 'success' } });
      return mapTeam(response.data?.Message || {});
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al crear equipo';
      openSnackbar({ ...defaultSnackbar, message: errorMessage, alert: { ...defaultSnackbar.alert, color: 'error' } });
      return {} as Team;
    }
  },
  update: async (id: number | string, data: Partial<Team> | any): Promise<Team> => {
    try {
      const response = await axiosServices.put(`${TEAM_API}/Update`, { id, ...data });
      openSnackbar({ ...defaultSnackbar, message: 'Equipo actualizado correctamente.', alert: { ...defaultSnackbar.alert, color: 'success' } });
      return mapTeam(response.data?.Message || {});
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al actualizar equipo';
      openSnackbar({ ...defaultSnackbar, message: errorMessage, alert: { ...defaultSnackbar.alert, color: 'error' } });
      return {} as Team;
    }
  },
  remove: async (id: number): Promise<{ deleted: boolean } | any> => {
    try {
      const response = await axiosServices.delete(`${TEAM_API}/Delete/${id}`);
      openSnackbar({ ...defaultSnackbar, message: 'Equipo eliminado correctamente.', alert: { ...defaultSnackbar.alert, color: 'success' } });
      return response.data?.Message ?? { deleted: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al eliminar equipo';
      openSnackbar({ ...defaultSnackbar, message: errorMessage, alert: { ...defaultSnackbar.alert, color: 'error' } });
      return { deleted: false, error: errorMessage };
    }
  }
};

export function useGetTeams(params?: any) {
  const { data, error, isLoading, mutate } = useSWR(['teams', params], ([, p]) => teamApi.getAll(p), { revalidateOnFocus: false });
  return { teams: data || [], teamsLoading: isLoading, teamsError: error, reloadTeams: mutate };
}

export default teamApi;
