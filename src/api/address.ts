import useSWR from 'swr';
import axios from 'axios';
import { Address } from 'types/e-commerce';

// API Functions
const addressApi = {
  getAll: async (): Promise<Address[]> => {
    const response = await axios.get('/api/address');
    return response.data || [];
  },

  getById: async (id: number): Promise<Address> => {
    const response = await axios.get(`/api/address/${id}`);
    return response.data;
  },

  create: async (address: Omit<Address, 'id'>): Promise<Address> => {
    const response = await axios.post('/api/address', address);
    return response.data;
  },

  update: async (id: number, address: Partial<Address>): Promise<Address> => {
    const response = await axios.put(`/api/address/${id}`, address);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await axios.delete(`/api/address/${id}`);
  }
};

// Hook
export const useGetAddress = () => {
  const { data, error, isLoading, mutate } = useSWR<Address[]>(
    '/api/address',
    addressApi.getAll,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    addresses: data || [],
    isLoading,
    error,
    refreshAddresses: mutate,
  };
};

export const updateAddress = addressApi.update;

export default addressApi;
