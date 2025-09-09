import useSWR from 'swr';
import axios from 'axios';
import { Products, Reviews } from 'types/e-commerce';

// API Functions
const productsApi = {
  getAll: async (): Promise<Products[]> => {
    const response = await axios.get('/api/products');
    return response.data || [];
  },

  getById: async (id: number): Promise<Products> => {
    const response = await axios.get(`/api/products/${id}`);
    return response.data;
  },

  getRelated: async (id: number): Promise<Products[]> => {
    const response = await axios.get(`/api/products/${id}/related`);
    return response.data || [];
  },

  getReviews: async (id: number): Promise<Reviews[]> => {
    const response = await axios.get(`/api/products/${id}/reviews`);
    return response.data || [];
  }
};

// Hooks
export const useGetProducts = () => {
  const { data, error, isLoading, mutate } = useSWR<Products[]>(
    '/api/products',
    productsApi.getAll,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    products: data || [],
    isLoading,
    error,
    refreshProducts: mutate,
  };
};

export const getRelatedProducts = productsApi.getRelated;
export const getProductReviews = productsApi.getReviews;

export default productsApi;
