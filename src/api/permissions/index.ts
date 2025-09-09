import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';

// project-imports
import { fetcher } from 'utils/axios';

// types
import { 
  PermissionAdvanced, 
  PermissionProps, 
  UserPermission, 
  Team, 
  TeamMember, 
  MenuPermission,
  PermissionCheckRequest,
  PermissionAssignRequest,
  PermissionRevokeRequest,
  TeamCreateRequest,
  TeamUpdateRequest,
  DataScopeResponse,
  PermissionType,
  DataScope
} from 'types/permission';

const initialState: PermissionProps = {
  modal: false
};

// ==============================|| API - Permissions ||============================== //

const endpoints = {
  key: 'api/permissions-advanced',
  list: '/all-public',
  byType: '/by-type',
  byModule: '/by-module',
  create: '/create',
  assign: '/assign',
  revoke: '/revoke',
  userPermissions: '/user',
  check: '/check',
  dataScope: '/data-scope',
  initialize: '/initialize',
  modal: '/modal'
};

const teamEndpoints = {
  key: 'api/teams',
  list: '/all',
  create: '/create',
  update: '/update',
  delete: '/delete',
  members: '/members',
  userTeams: '/user-teams'
};

const userEndpoints = {
  key: 'api/users',
  list: '/all'
};

// ==============================|| Permission Hooks ||============================== //

export function useGetPermissions() {
  const { data, isLoading, error, isValidating } = useSWR(`${endpoints.key}${endpoints.list}`, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  console.log('useGetPermissions - data:', data);
  console.log('useGetPermissions - isLoading:', isLoading);
  console.log('useGetPermissions - error:', error);

  const memoizedValue = useMemo(
    () => {
      // Extraer el array de permisos de la propiedad Message
      const permissionsArray = data?.Message || data || [];
      
      // Mapear los datos del API (PascalCase) al formato esperado por el frontend (camelCase)
      const mappedPermissions = Array.isArray(permissionsArray) ? permissionsArray.map((permission: any) => {
        // Convertir tipo del API al enum del frontend
        let type = 'BASIC_CRUD';
        if (permission.Type) {
          switch (permission.Type.toLowerCase()) {
            case 'basic_crud':
              type = 'BASIC_CRUD';
              break;
            case 'data_scope':
              type = 'DATA_SCOPE';
              break;
            case 'menu_access':
              type = 'MENU_ACCESS';
              break;
            case 'action_permission':
              type = 'ACTION_PERMISSION';
              break;
            default:
              type = 'BASIC_CRUD';
          }
        }

        // Convertir DataScope del API al enum del frontend
        let dataScope = undefined;
        if (permission.DataScope) {
          switch (permission.DataScope.toLowerCase()) {
            case 'all':
              dataScope = 'ALL';
              break;
            case 'team_only':
              dataScope = 'TEAM_ONLY';
              break;
            case 'own_only':
              dataScope = 'OWN_ONLY';
              break;
            case 'department':
              dataScope = 'DEPARTMENT';
              break;
            case 'regional':
              dataScope = 'REGIONAL';
              break;
          }
        }

        return {
          id: permission.Id,
          permissionKey: permission.Key,
          name: permission.Name,
          description: permission.Description,
          module: permission.Module,
          type: type,
          dataScope: dataScope,
          isActive: permission.IsActive,
          createdAt: permission.CreatedAt,
          updatedAt: permission.UpdatedAt
        };
      }) : [];

      console.log('useGetPermissions - permissionsArray:', permissionsArray);
      console.log('useGetPermissions - mappedPermissions:', mappedPermissions);

      return {
        permissions: mappedPermissions,
        permissionsLoading: isLoading,
        permissionsError: error,
        permissionsValidating: isValidating,
        permissionsEmpty: !isLoading && !mappedPermissions.length
      };
    },
    [data, error, isLoading, isValidating]
  );

  console.log('useGetPermissions - memoizedValue:', memoizedValue);

  return memoizedValue;
}

export function useGetPermissionsByType(type: PermissionType) {
  const { data, isLoading, error, isValidating } = useSWR(
    `${endpoints.key}${endpoints.byType}/${type}`, 
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );

  const memoizedValue = useMemo(
    () => ({
      permissions: data?.permissions || [],
      permissionsLoading: isLoading,
      permissionsError: error,
      permissionsValidating: isValidating,
      permissionsEmpty: !isLoading && !data?.permissions?.length
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export function useGetUserPermissions(userId: number) {
  const { data, isLoading, error, isValidating } = useSWR(
    userId ? `${endpoints.key}${endpoints.userPermissions}/${userId}` : null,
    fetcher,
    {
      revalidateIfStale: false,
      revalidateOnFocus: false,
      revalidateOnReconnect: false
    }
  );

  const memoizedValue = useMemo(
    () => ({
      userPermissions: data?.permissions || [],
      userPermissionsLoading: isLoading,
      userPermissionsError: error,
      userPermissionsValidating: isValidating,
      userPermissionsEmpty: !isLoading && !data?.permissions?.length
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export function useGetTeams() {
  const { data, isLoading, error, isValidating } = useSWR(`${teamEndpoints.key}${teamEndpoints.list}`, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      teams: data?.teams || [],
      teamsLoading: isLoading,
      teamsError: error,
      teamsValidating: isValidating,
      teamsEmpty: !isLoading && !data?.teams?.length
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ==============================|| User Hooks ||============================== //

export function useGetUsers() {
  const { data, isLoading, error, isValidating } = useSWR(`${userEndpoints.key}${userEndpoints.list}`, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      users: data?.data || [],
      usersLoading: isLoading,
      usersError: error,
      usersValidating: isValidating,
      usersEmpty: !isLoading && !data?.data?.length
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// ==============================|| Permission Actions ||============================== //

export async function createPermission(newPermission: Partial<PermissionAdvanced>) {
  const response = await fetch(`${endpoints.key}${endpoints.create}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(newPermission)
  });

  if (!response.ok) {
    throw new Error('Failed to create permission');
  }

  const result = await response.json();
  
  // Revalidate permissions list
  mutate(`${endpoints.key}${endpoints.list}`);
  
  return result;
}

export async function assignPermission(request: PermissionAssignRequest) {
  const response = await fetch(`${endpoints.key}${endpoints.assign}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    throw new Error('Failed to assign permission');
  }

  const result = await response.json();
  
  // Revalidate user permissions
  mutate(`${endpoints.key}${endpoints.userPermissions}/${request.userId}`);
  
  return result;
}

export async function revokePermission(request: PermissionRevokeRequest) {
  const response = await fetch(`${endpoints.key}${endpoints.revoke}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
  });

  if (!response.ok) {
    throw new Error('Failed to revoke permission');
  }

  const result = await response.json();
  
  // Revalidate user permissions
  mutate(`${endpoints.key}${endpoints.userPermissions}/${request.userId}`);
  
  return result;
}

export async function checkPermission(userId: number, permissionKey: string): Promise<boolean> {
  const response = await fetch(`${endpoints.key}${endpoints.check}/${userId}/${permissionKey}`);
  
  if (!response.ok) {
    throw new Error('Failed to check permission');
  }

  const result = await response.json();
  return result.hasPermission;
}

export async function getUserDataScope(userId: number, module: string): Promise<DataScopeResponse> {
  const response = await fetch(`${endpoints.key}${endpoints.dataScope}/${userId}/${module}`);
  
  if (!response.ok) {
    throw new Error('Failed to get data scope');
  }

  return response.json();
}

// ==============================|| Team Actions ||============================== //

export async function createTeam(teamData: TeamCreateRequest) {
  const response = await fetch(`${teamEndpoints.key}${teamEndpoints.create}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(teamData)
  });

  if (!response.ok) {
    throw new Error('Failed to create team');
  }

  const result = await response.json();
  
  // Revalidate teams list
  mutate(`${teamEndpoints.key}${teamEndpoints.list}`);
  
  return result;
}

export async function updateTeam(teamData: TeamUpdateRequest) {
  const response = await fetch(`${teamEndpoints.key}${teamEndpoints.update}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(teamData)
  });

  if (!response.ok) {
    throw new Error('Failed to update team');
  }

  const result = await response.json();
  
  // Revalidate teams list
  mutate(`${teamEndpoints.key}${teamEndpoints.list}`);
  
  return result;
}

export async function deleteTeam(teamId: number) {
  const response = await fetch(`${teamEndpoints.key}${teamEndpoints.delete}/${teamId}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error('Failed to delete team');
  }

  // Revalidate teams list
  mutate(`${teamEndpoints.key}${teamEndpoints.list}`);
  
  return true;
}

// ==============================|| Modal State Management ||============================== //

export function useGetPermissionMaster() {
  const { data, isLoading } = useSWR(`${endpoints.key}${endpoints.modal}`, () => initialState, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      permissionMaster: data,
      permissionMasterLoading: isLoading
    }),
    [data, isLoading]
  );

  return memoizedValue;
}

export function handlerPermissionDialog(modal: boolean) {
  mutate(
    `${endpoints.key}${endpoints.modal}`,
    (currentPermissionMaster: any) => {
      return { ...currentPermissionMaster, modal };
    },
    false
  );
}
