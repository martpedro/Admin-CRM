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
  key: '/api/user',
  list: '/list',
  create: '/Create',
  update: '/Update'
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
    console.log('Iniciando petición a /api/user/list...');
    
    const response = await axiosServices.get('/api/user/list', {
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

export async function insertUser(newUser: UserList, avatarFile?: File) {
  // Construir payload según DTO del backend
  const formData = new FormData();

  const firstName = (newUser as any).firstName || (newUser as any).name || '';
  const lastName = (newUser as any).lastName || (newUser as any).LastName || '';
  const middleName = (newUser as any).middleName || (newUser as any).MotherLastName || '';
  const email = (newUser as any).email || '';
  const phone = (newUser as any).Phone || (newUser as any).contact || '-';
  const letterAsign = (newUser as any).letterasigned || (newUser as any).LetterAsign || '';
  const isActive = !((newUser as any).isInactive === true);
  const profile = (newUser as any).profile || 1;
  const password = (newUser as any).password || '123456';

  formData.append('Name', String(firstName).trim());
  formData.append('LastNAme', `${String(lastName).trim()} ${String(middleName).trim()}`.trim());
  formData.append('UserName', email);
  formData.append('Email', email);
  formData.append('Phone', String(phone));
  formData.append('Password', String(password));
  formData.append('LetterAsign', String(letterAsign).toUpperCase());
  formData.append('IsActive', String(isActive));
  formData.append('profile', String(profile));

  if (avatarFile) {
    formData.append('avatar', avatarFile);
  }

  const res = await axiosServices.post(endpoints.key + endpoints.create, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  // Refrescar la lista
  await mutate(endpoints.key + endpoints.list);

  return res.data?.Message || res.data;
}

export async function updateUser(UserId: number, updatedUser: UserList, avatarFile?: File) {
  // Construir payload según DTO del backend
  const formData = new FormData();

  const firstName = (updatedUser as any).firstName || (updatedUser as any).name || '';
  const lastName = (updatedUser as any).lastName || (updatedUser as any).LastName || '';
  const middleName = (updatedUser as any).middleName || (updatedUser as any).MotherLastName || '';
  const email = (updatedUser as any).email || '';
  const phone = (updatedUser as any).Phone || (updatedUser as any).contact || '-';
  const letterAsign = (updatedUser as any).letterasigned || (updatedUser as any).LetterAsign || '';
  const isActive = !((updatedUser as any).isInactive === true);
  const profile = (updatedUser as any).profile || 1;
  const password = (updatedUser as any).password || (updatedUser as any)['password'] || '123456';

  formData.append('Id', String(UserId));
  formData.append('Name', String(firstName).trim());
  formData.append('LastNAme', `${String(lastName).trim()} ${String(middleName).trim()}`.trim());
  formData.append('UserName', email);
  formData.append('Email', email);
  formData.append('Phone', String(phone));
  formData.append('Password', String(password));
  formData.append('LetterAsign', String(letterAsign).toUpperCase());
  formData.append('IsActive', String(isActive));
  formData.append('profile', String(profile));

  if (avatarFile) {
    formData.append('avatar', avatarFile);
  }

  const res = await axiosServices.put(endpoints.key + endpoints.update, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });

  // Refrescar la lista
  await mutate(endpoints.key + endpoints.list);

  return res.data?.Message || res.data;
}

export async function deleteUser(UserId: number) {
  await axiosServices.delete(`${endpoints.key}/${UserId}`);
  await mutate(endpoints.key + endpoints.list);
}

export function useGetUserMaster() {
  const { data, isLoading } = useSWR('/user/modal', () => initialState, {
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
  mutate('/user/modal', (currentUsermaster: any) => ({ ...currentUsermaster, modal }), false);
}
