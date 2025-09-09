import useSWR from 'swr';
import axiosServices from 'utils/axios';
import { CustomerList } from 'types/customer';

// API Functions
const customersApi = {
  getAll: async (): Promise<CustomerList[]> => {
    const response = await axiosServices.get('/api/Customer/list?index=1&count=100');
    return response.data.Message.data.map((customer: any) => ({
      Id: customer.Id,
      FirstName: customer.FirstName,
      LastName: customer.LastName,
      MiddleName: customer.MiddleName,
      Name: customer.Name,
      Email: customer.Email,
      Phone: customer.Phone,
      ClassCustomer: customer.ClassCustomer,
      CompanyName: customer.CompanyName,
      Status: customer.Status,
      Contact: customer.Contact
    }));
  }
};

// Hook
export const useCustomers = () => {
  const { data, error, isLoading, mutate } = useSWR<CustomerList[]>(
    '/api/customers/all',
    customersApi.getAll,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    customers: data || [],
    isLoading,
    error,
    refreshCustomers: mutate,
  };
};
