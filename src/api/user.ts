// Obtención simple de usuarios activos
export async function getActiveUsers() {
  try {
    const response = await axiosServices.get('/api/user/active', {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    // Si la respuesta es un array directo
    // if (Array.isArray(response.data)) return response.data;
    // Si la respuesta viene en Message[0]
    
    if (response.data?.Message && Array.isArray(response.data.Message)) return response.data.Message;
    return [];
  } catch {
    return [];
  }
}
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

  const { data, isLoading, error, isValidating } = useSWR(endpoints.key + '/active', userFetcher, {
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

  // Log para depuración
  console.log('Datos mapeados para insertUser:', {
    firstName, lastName, middleName, email, phone, letterAsign, 
    isActive, profile, password: password ? '[HIDDEN]' : 'NO PASSWORD',
    isInactive: (newUser as any).isInactive,
    originalProfile: (newUser as any).profile
  });

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
  const password = (updatedUser as any).password || (updatedUser as any)['password'] || '';

  // Log para depuración
  console.log('Datos mapeados para updateUser:', {
    UserId, firstName, lastName, middleName, email, phone, letterAsign, 
    isActive, profile, password: password ? '[HIDDEN]' : 'NO PASSWORD',
    isInactive: (updatedUser as any).isInactive,
    originalProfile: (updatedUser as any).profile
  });

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

// Function to update current user profile
export async function updateCurrentUserProfile(userData: {
  username?: string;
  email?: string;
  language?: string;
  signing?: string;
  secureSettings?: {
    secureBrowsing?: boolean;
    loginNotifications?: boolean;
    loginApprovals?: boolean;
  };
}) {
  try {
    const response = await axiosServices.put('/api/account/update-profile', userData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    return {
      success: true,
      data: response.data?.Message || response.data
    };
  } catch (error: any) {
    console.error('Error updating user profile:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Error updating profile'
    };
  }
}

// Function to update current user personal information
export async function updateCurrentUserPersonal(userData: {
  name?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  username?: string;
}, avatarFile?: File) {
  try {
    const formData = new FormData();
    
    // Add user data to form
    if (userData.name) formData.append('Name', userData.name);
    if (userData.lastName) formData.append('LastNAme', userData.lastName);
    if (userData.email) {
      formData.append('Email', userData.email);
      formData.append('UserName', userData.email); // Username is email
    }
    if (userData.phone) formData.append('Phone', userData.phone);
    
    // Add avatar if provided
    if (avatarFile) {
      formData.append('avatar', avatarFile);
    }

    const response = await axiosServices.put('/api/user/update-personal', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    
    return {
      success: true,
      data: response.data?.Message || response.data
    };
  } catch (error: any) {
    console.error('Error updating personal information:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Error updating personal information'
    };
  }
}

// Function to get current user profile
export async function getCurrentUserProfile() {
  try {
    const response = await axiosServices.get('/api/account/me', {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    return {
      success: true,
      data: response.data?.Message || response.data
    };
  } catch (error: any) {
    console.error('Error getting user profile:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Error getting profile'
    };
  }
}

// Function to change user password
export async function changeUserPassword(passwordData: {
  oldPassword: string;
  newPassword: string;
}) {
  try {
    const response = await axiosServices.put('/api/account/change-password', {
      oldPassword: passwordData.oldPassword,
      newPassword: passwordData.newPassword
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    return {
      success: true,
      data: response.data?.Message || response.data
    };
  } catch (error: any) {
    console.error('Error changing password:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Error changing password'
    };
  }
}

// Function to send welcome email
export async function sendWelcomeEmail(emailData: {
  userId: string;
  to: string;
  userName: string;
  temporaryPassword: string;
  accessUrl?: string;
  customMessage?: string;
}) {
  try {
    const response = await axiosServices.post('/api/user/send-welcome-email', emailData, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    return {
      success: true,
      data: response.data?.Message || response.data
    };
  } catch (error: any) {
    console.error('Error sending welcome email:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Error sending welcome email'
    };
  }
}

export function handlerUserDialog(modal: boolean) {
  // to update local state based on key
  mutate('/user/modal', (currentUsermaster: any) => ({ ...currentUsermaster, modal }), false);
}
