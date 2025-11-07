import { useMemo } from 'react';

// third-party
import useSWR, { mutate } from 'swr';

// project-imports
import { fetcher } from 'utils/axios';
import axiosServices from 'utils/axios';
import { openSnackbar } from 'api/snackbar';
import { SnackbarProps } from 'types/snackbar';
const defaultSnackbar: SnackbarProps = {
  action: false,
  open: true,
  message: '',
  anchorOrigin: { vertical: 'bottom', horizontal: 'right' },
  variant: 'alert',
  alert: { color: 'primary', variant: 'filled' },
  transition: 'Fade',
  close: false,
  actionButton: false,
  maxStack: 3,
  dense: false,
  iconVariant: 'usedefault'
};

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
    const response = await axiosServices.post('/api/Customer/Create', newCustomer, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    // Verificar si hay advertencias de dominio duplicado
    if (response.data?.Message?.warning) {
      const warning = response.data.Message.warning;
      if (warning.type === 'DOMAIN_WARNING') {
        openSnackbar({ 
          ...defaultSnackbar, 
          message: `Cliente creado exitosamente. ${warning.message}`, 
          alert: { ...defaultSnackbar.alert, color: 'warning' }
        });
      }
    } else {
      openSnackbar({ 
        ...defaultSnackbar, 
        message: 'Cliente creado exitosamente.', 
        alert: { ...defaultSnackbar.alert, color: 'success' } 
      });
    }

    mutate(
      endpoints.key + endpoints.list,
      (currentCustomer: any) => {
        const customerData = response.data?.Message?.customer || response.data;
        const customerWithId = { ...newCustomer, id: customerData.id || customerData.Id || (currentCustomer.customers.length + 1) };
        const addedCustomer: CustomerList[] = [...currentCustomer.customers, customerWithId];
        return {
          ...currentCustomer,
          customers: addedCustomer
        };
      },
      false
    );

    return { 
      success: true, 
      data: response.data,
      warning: response.data?.Message?.warning || null
    };
  } catch (error: any) {
    console.error('Error creating customer:', error);
    
    // Manejar errores específicos de duplicación
    if ( error.error.statusCode === 409) {
      const errorData = error.error.message;
      console.log('Error de duplicación detectado:', errorData);
      if (errorData) {
        
        return { 
          success: false, 
          error: errorData,
          type: 'DUPLICATE_EMAIL'
        };
      }
    }
    
    const errorMessage = error.response?.data?.message || error.message || 'Error al crear el cliente';
    openSnackbar({ 
      ...defaultSnackbar, 
      message: errorMessage, 
      alert: { ...defaultSnackbar.alert, color: 'error' } 
    });
    
    return { success: false, error: errorMessage };
  }
}

export async function updateCustomer(customerId: number, updatedCustomer: CustomerList) {
  try {
    const response = await axiosServices.put(`/api/Customer/Update/${customerId}`, updatedCustomer, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
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
    openSnackbar({ ...defaultSnackbar, message: 'Cliente actualizado exitosamente.', alert: { ...defaultSnackbar.alert, color: 'success' } });
    return { success: true, data: response.data };
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Error al actualizar el cliente';
    openSnackbar({ ...defaultSnackbar, message: errorMessage, alert: { ...defaultSnackbar.alert, color: 'error' } });
    return { success: false, error: errorMessage };
  }
}

// Función para validar duplicación antes de crear/actualizar
export async function validateCustomerDuplication(email: string, excludeCustomerId?: number) {
  try {
    const response = await axiosServices.post('/api/Customer/validate-duplication', {
      email,
      excludeCustomerId
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    return {
      success: true,
      data: response.data?.Message || response.data
    };
  } catch (error: any) {
    console.error('Error validating customer duplication:', error);
    return {
      success: false,
      error: error.response?.data?.message || error.message || 'Error al validar duplicación'
    };
  }
}

export async function deleteCustomer(customerId: number) {
  try {
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
    // Aquí podrías hacer la petición real al backend si lo necesitas
    openSnackbar({ ...defaultSnackbar, message: 'Cliente eliminado exitosamente.', alert: { ...defaultSnackbar.alert, color: 'success' } });
    return { success: true };
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Error al eliminar el cliente';
    openSnackbar({ ...defaultSnackbar, message: errorMessage, alert: { ...defaultSnackbar.alert, color: 'error' } });
    return { success: false, error: errorMessage };
  }
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
// Devuelve solo el array de direcciones (para migración de front)
export async function getAddressesByCustomer(customerId: number): Promise<any[]> {
  const result = await getCustomerAddresses(customerId);
  if (result.success) {
    const data = result.data?.Message ?? result.data;
    return Array.isArray(data) ? data : [];
  }
  return [];
}
export async function getCustomerAddresses(customerId: number) {
  try {
    const response = await axiosServices.get(`/api/CustomerAddress/ByCustomer/${customerId}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    openSnackbar({ ...defaultSnackbar, message: 'Direcciones obtenidas correctamente.', alert: { ...defaultSnackbar.alert, color: 'success' } });
    return { success: true, data: response.data };
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Error al obtener direcciones';
    openSnackbar({ ...defaultSnackbar, message: errorMessage, alert: { ...defaultSnackbar.alert, color: 'error' } });
    return { success: false, error: errorMessage };
  }
}

// Función para crear una nueva dirección
export async function createCustomerAddress(customerId: number, address: Address) {
  try {
    const addressPayload = {
      ...address,
      customerId: customerId
    };
    const response = await axiosServices.post('/api/CustomerAddress/Create', addressPayload, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    openSnackbar({ ...defaultSnackbar, message: 'Dirección creada exitosamente.', alert: { ...defaultSnackbar.alert, color: 'success' } });
    return { success: true, data: response.data };
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Error al crear dirección';
    openSnackbar({ ...defaultSnackbar, message: errorMessage, alert: { ...defaultSnackbar.alert, color: 'error' } });
    return { success: false, error: errorMessage };
  }
}

// Función para actualizar una dirección existente
export async function updateCustomerAddress(customerId: number, addressId: number, address: Address) {
  try {
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
    openSnackbar({ ...defaultSnackbar, message: 'Dirección actualizada exitosamente.', alert: { ...defaultSnackbar.alert, color: 'success' } });
    return { success: true, data: response.data };
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Error al actualizar dirección';
    openSnackbar({ ...defaultSnackbar, message: errorMessage, alert: { ...defaultSnackbar.alert, color: 'error' } });
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
    openSnackbar({ ...defaultSnackbar, message: 'Dirección eliminada exitosamente.', alert: { ...defaultSnackbar.alert, color: 'success' } });
    return { success: true, data: response.data };
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Error al eliminar dirección';
    openSnackbar({ ...defaultSnackbar, message: errorMessage, alert: { ...defaultSnackbar.alert, color: 'error' } });
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
    openSnackbar({ ...defaultSnackbar, message: 'Información de dirección obtenida correctamente.', alert: { ...defaultSnackbar.alert, color: 'success' } });
    return { success: true, data: response.data };
  } catch (error: any) {
    const errorMessage = error.response?.data?.message || error.message || 'Error al obtener información de la dirección';
    openSnackbar({ ...defaultSnackbar, message: errorMessage, alert: { ...defaultSnackbar.alert, color: 'error' } });
    return { success: false, error: errorMessage };
  }
}
