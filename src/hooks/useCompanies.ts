import useSWR from 'swr';
import axios from 'utils/axios';

// Types
export interface Company {
  Id: number;
  Name: string;
  QuotationLetter: string;
  Description?: string;
  Email?: string;
  Phone?: string;
  Address?: string;
  Logo?: string;
}

// API function to fetch companies
const fetchCompanies = async (): Promise<Company[]> => {
  const response = await axios.get('/api/Company/Get');
  return response.data.Message || response.data;
};

// Hook to use companies
export const useCompanies = () => {
  const { data, error, isLoading, mutate } = useSWR('/api/companies', fetchCompanies, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  return {
    companies: data || [],
    error,
    isLoading,
    mutate
  };
};

// Hook for company operations
export const useCompanyOperations = () => {
  const getCompanyById = async (id: number): Promise<Company | null> => {
    try {
      const response = await axios.get(`/api/Company/GetById/${id}`);
      return response.data.Message || response.data;
    } catch (error) {
      console.error('Error fetching company:', error);
      return null;
    }
  };

  return {
    getCompanyById
  };
};
