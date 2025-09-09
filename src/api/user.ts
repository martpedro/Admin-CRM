import { useMemo } from 'react';

// third-party
import useSWR, { mutate } from 'swr';

// project-imports
import { fetcher } from 'utils/axios';
import axiosServices from 'utils/axios';

// types
import { UserList, UserProps, ApiUser, UsersApiResponse } from 'types/user';

const initialState: UserProps = {
  modal: false
};

// ==============================|| API - User ||============================== //

const endpoints = {
  key: 'api/user',
  list: '/list', // server URL
  modal: '/modal', // server URL
  insert: '/insert', // server URL
  update: '/update', // server URL
  delete: '/delete' // server URL
};

export function useGetUser() {
  // Crear un fetcher específico para usuarios con headers forzados
  const userFetcher = async (url: string) => {
    const response = await axiosServices.get(url, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    return response.data;
  };

  const { data, isLoading, error, isValidating } = useSWR(endpoints.key + endpoints.list, userFetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    errorRetryCount: 3,
    errorRetryInterval: 1000
  });

  // Usuario de ejemplo solicitado
  const users = (data?.Message?.[0] && Array.isArray(data.Message[0])) ? data.Message[0] : [];

  const memoizedValue = useMemo(
    () => ({
      users,
      usersLoading: isLoading,
      usersError: error,
      usersValidating: isValidating,
      usersEmpty: !isLoading && users.length === 0,
      totalUsers: users.length
    }),
    [users, error, isLoading, isValidating]
  );

  return memoizedValue;
}

// Función específica para obtener usuarios activos como asesores de ventas
export async function getSalesAdvisors() {
  try {
    console.log('Iniciando petición a /api/User/list...');
    
    const response = await axiosServices.get('/api/User/list', {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      },
      timeout: 10000, // 10 segundos de timeout
      validateStatus: function (status) {
        // Aceptar tanto 200 como 204
        return status === 200 || status === 204;
      }
    });
    
    console.log('Respuesta recibida:', response.status, response.data);
    
    // Si es 204, retornar array vacío
    if (response.status === 204 || !response.data) {
      console.log('Respuesta 204 o sin datos - retornando array vacío');
      return {
        success: true,
        data: []
      };
    }
    
    // Corregir: La respuesta viene en Message[0], no en Message
    const users = response.data?.Message?.[0] as ApiUser[] || [];
    console.log('Usuarios obtenidos:', users);
    
    // Filtrar solo usuarios activos que puedan ser asesores de ventas
    const advisors = users.filter(user => user.isActive === true);
    
    return {
      success: true,
      data: advisors.map(user => ({
        value: user.Id,
        label: `${user.name} ${user.LastName} ${user.MotherLastName || ''}`.trim(),
        profile: user.profile,
        email: user.email
      }))
    };
  } catch (error: any) {
    console.error('Error en getSalesAdvisors:', error);
    const errorMessage = error.response?.data?.message || error.message || 'Error al obtener asesores de ventas';
    return { success: false, error: errorMessage };
  }
}

export async function insertUser(newUser: UserList) {
  // to update local state based on key
  mutate(
    endpoints.key + endpoints.list,
    (currentUser: any) => {
      currentUser = currentUser || { Users: [] };
      newUser.id = currentUser.Users.length + 1;
      const addedUser: UserList[] = [...(currentUser.Users || []), newUser];
      return {
        ...currentUser,
        Users: addedUser
      };
    },
    false
  );

  // Enviar datos y archivo avatar al backend
  const formData = new FormData();
  Object.entries(newUser).forEach(([key, value]) => {
    if (key === 'avatar' && value instanceof File) {
      formData.append('avatar', value);
    } else {
      formData.append(key, value as any);
    }
  });
  await axiosServices.post(endpoints.key + endpoints.insert, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}

export async function updateUser(UserId: number, updatedUser: UserList) {
  // to update local state based on key
  mutate(
    endpoints.key + endpoints.list,
    (currentUser: any) => {
      const newUser: UserList[] = currentUser.Users.map((User: UserList) =>
        User.id === UserId ? { ...User, ...updatedUser } : User
      );
      return {
        ...currentUser,
        Users: newUser
      };
    },
    false
  );

  // Enviar datos y archivo avatar al backend
  const formData = new FormData();
  Object.entries(updatedUser).forEach(([key, value]) => {
    if (key === 'avatar' && value instanceof File) {
      formData.append('avatar', value);
    } else {
      formData.append(key, value as any);
    }
  });
  await axiosServices.post(endpoints.key + endpoints.update, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
}

export async function deleteUser(UserId: number) {
  // to update local state based on key
  mutate(
    endpoints.key + endpoints.list,
    (currentUser: any) => {
      const nonDeletedUser = currentUser.Users.filter((User: UserList) => User.id !== UserId);

      return {
        ...currentUser,
        Users: nonDeletedUser
      };
    },
    false
  );

  // to hit server
  // you may need to refetch latest data after server hit and based on your logic
  //   const data = { UserId };
  //   await axios.post(endpoints.key + endpoints.delete, data);
}

export function useGetUserMaster() {
  const { data, isLoading } = useSWR(endpoints.key + endpoints.modal, () => initialState, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      UserMaster: data,
      UserMasterLoading: isLoading
    }),
    [data, isLoading]
  );

  return memoizedValue;
}

export function handlerUserDialog(modal: boolean) {
  // to update local state based on key

  mutate(
    endpoints.key + endpoints.modal,
    (currentUsermaster: any) => {
      return { ...currentUsermaster, modal };
    },
    false
  );
}
