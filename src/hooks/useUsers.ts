import useSWR from 'swr';
import axiosServices from 'utils/axios';
import { ApiUser } from 'types/user';

// API Functions
const usersApi = {
  getAll: async (): Promise<ApiUser[]> => {
    const response = await axiosServices.get('/api/user/list?index=1&count=100');
    return response.data.Message.data.map((user: any) => ({
      Id: user.Id,
      name: user.Name,
      LastName: user.LastName,
      MotherLastName: user.MotherLastName,
      Phone: user.Phone,
      LetterAsign: user.LetterAsign,
      password: user.password,
      profile: user.profile,
      email: user.email,
      isActive: user.isActive
    }));
  }
};

// Hook
export const useUsers = () => {
  const { data, error, isLoading, mutate } = useSWR<ApiUser[]>(
    '/api/users/all',
    usersApi.getAll,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    users: data || [],
    isLoading,
    error,
    refreshUsers: mutate,
  };
};
