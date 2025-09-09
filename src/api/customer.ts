import { useMemo } from 'react';

// third-party
import useSWR, { mutate } from 'swr';

// project-imports
import { fetcher } from 'utils/axios';
import axiosServices from 'utils/axios';

// types
import { CustomerList, CustomerProps, Address } from 'types/customer';

const initialState: CustomerProps = {
  modal: false
};

// ==============================|| API - CUSTOMER ||============================== //

const endpoints = {
  key: 'api/customer',
  list: '/list', // server URL
  modal: '/modal', // server URL
  insert: '/insert', // server URL
  update: '/update', // server URL
  delete: '/delete' // server URL
};

export function useGetCustomer() {
  const { data, isLoading, error, isValidating } = useSWR(endpoints.key + endpoints.list, fetcher, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  // Ajustar para obtener los datos desde data.data
  const customers = data?.Message?.data as CustomerList[] || [];
  const usersLoading = isLoading;
  console.log("Datos de los clientes", customers);
  const memoizedValue = useMemo(
    () => ({
      customers,
      usersLoading,
      customersError: error,
      customersValidating: isValidating,
      customersEmpty: !isLoading && (!data?.data || data.data.length === 0)
    }),
    [data, error, isLoading, isValidating]
  );

  return memoizedValue;
}

export async function insertCustomer(newCustomer: CustomerList) {
  try {
    console.log("Datos new customer", newCustomer);
    // Petición POST al endpoint del API
    const response = await axiosServices.post('/api/Customer/Create', newCustomer, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Si la petición es exitosa, actualizar el estado local
    mutate(
      endpoints.key + endpoints.list,
      (currentCustomer: any) => {
        const customerWithId = { ...newCustomer, id: response.data.id || (currentCustomer.customers.length + 1) };
        const addedCustomer: CustomerList[] = [...currentCustomer.customers, customerWithId];

        return {
          ...currentCustomer,
          customers: addedCustomer
        };
      },
      false
    );

    return { success: true, data: response.data };
  } catch (error: any) {
    // Manejo de errores
    const errorMessage = error.response?.data?.message || error.message || 'Error al crear el cliente';
    return { success: false, error: errorMessage };
  }
}

export async function updateCustomer(customerId: number, updatedCustomer: CustomerList) {
  try {
    // Petición PUT/POST al endpoint del API para actualizar
    const response = await axiosServices.put(`/api/Customer/Update/${customerId}`, updatedCustomer, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    // Si la petición es exitosa, actualizar el estado local
    mutate(
      endpoints.key + endpoints.list,
      (currentCustomer: any) => {
        const newCustomer: CustomerList[] = currentCustomer.customers.map((customer: CustomerList) =>
          customer.Id === customerId ? { ...customer, ...updatedCustomer } : customer
        );

        return {
          ...currentCustomer,
          customers: newCustomer
        };
      },
      false
    );

    return { success: true, data: response.data };
  } catch (error: any) {
    // Manejo de errores
    const errorMessage = error.response?.data?.message || error.message || 'Error al actualizar el cliente';
    return { success: false, error: errorMessage };
  }
}

export async function deleteCustomer(customerId: number) {
  // to update local state based on key
  mutate(
    endpoints.key + endpoints.list,
    (currentCustomer: any) => {
      const nonDeletedCustomer = currentCustomer.customers.filter((customer: CustomerList) => customer.Id !== customerId);

      return {
        ...currentCustomer,
        customers: nonDeletedCustomer
      };
    },
    false
  );

  // to hit server
  // you may need to refetch latest data after server hit and based on your logic
  //   const data = { customerId };
  //   await axios.post(endpoints.key + endpoints.delete, data);
}

export function useGetCustomerMaster() {
  const { data, isLoading } = useSWR(endpoints.key + endpoints.modal, () => initialState, {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false
  });

  const memoizedValue = useMemo(
    () => ({
      customerMaster: data,
      customerMasterLoading: isLoading
    }),
    [data, isLoading]
  );

  return memoizedValue;
}

export function handlerCustomerDialog(modal: boolean) {
  // to update local state based on key

  mutate(
    endpoints.key + endpoints.modal,
    (currentCustomermaster: any) => {
      return { ...currentCustomermaster, modal };
    },
    false
  );
}

// ==============================|| API - CUSTOMER ADDRESSES ||============================== //

// Función para obtener direcciones de un cliente
export async function getCustomerAddresses(customerId: number) {
  try {
    const response = await axiosServices.get(`/api/CustomerAddress/ByCustomer/${customerId}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return { success: true, data: response.data };
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Error al obtener direcciones';
    return { success: false, error: errorMessage };
  }
}

// Función para crear una nueva dirección
export async function createCustomerAddress(customerId: number, address: Address) {
  try {
    // Agregar el customerId al payload
    const addressPayload = {
      ...address,
      customerId: customerId
    };
    
    const response = await axiosServices.post('/api/CustomerAddress/Create', addressPayload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return { success: true, data: response.data };
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Error al crear dirección';
    return { success: false, error: errorMessage };
  }
}

// Función para actualizar una dirección existente
export async function updateCustomerAddress(customerId: number, addressId: number, address: Address) {
  try {
    // Agregar el customerId al payload
    const addressPayload = {
      ...address,
      customerId: customerId,
      id: addressId
    };
    
    const response = await axiosServices.put('/api/CustomerAddress/Update', addressPayload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return { success: true, data: response.data };
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Error al actualizar dirección';
    return { success: false, error: errorMessage };
  }
}

// Función para eliminar una dirección
export async function deleteCustomerAddress(customerId: number, addressId: number) {
  try {
    const response = await axiosServices.delete(`/api/CustomerAddress/${addressId}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return { success: true, data: response.data };
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Error al eliminar dirección';
    return { success: false, error: errorMessage };
  }
}

// Función para obtener información específica de una dirección
export async function getCustomerAddress(addressId: number) {
  try {
    const response = await axiosServices.get(`/api/CustomerAddress/${addressId}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return { success: true, data: response.data };
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Error al obtener información de la dirección';
    return { success: false, error: errorMessage };
  }
}
