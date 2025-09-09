import useSWR from 'swr';
import { quotationsApi, Quotation } from '../api/quotations';

// Hook para obtener todas las cotizaciones
export const useQuotations = () => {
  const { data, error, isLoading, mutate } = useSWR<Quotation[]>(
    '/api/quotations/all',
    quotationsApi.getAll,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    quotations: data || [],
    isLoading,
    error,
    refreshQuotations: mutate,
  };
};

// Hook para obtener una cotización específica
export const useQuotation = (id: number | null) => {
  const shouldFetch = id !== null;
  const { data, error, isLoading, mutate } = useSWR<Quotation>(
    shouldFetch ? `/api/quotations/${id}` : null,
    shouldFetch ? () => quotationsApi.getById(id!) : null,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    quotation: data,
    isLoading,
    error,
    refreshQuotation: mutate,
  };
};

// Hook para operaciones de cotizaciones (crear, actualizar, eliminar)
export const useQuotationOperations = () => {
  const { refreshQuotations } = useQuotations();

  const createQuotation = async (quotationData: any) => {
    try {
      const result = await quotationsApi.create(quotationData);
      refreshQuotations(); // Refresh the list after creating
      return { success: true, data: result };
    } catch (error: any) {
      console.error('Error creating quotation:', error);
      return { 
        success: false, 
        error: error.response?.data?.Message || error.message || 'Error al crear la cotización' 
      };
    }
  };

  const updateQuotation = async (quotationData: any) => {
    try {
      const result = await quotationsApi.update(quotationData);
      refreshQuotations(); // Refresh the list after updating
      return { success: true, data: result };
    } catch (error: any) {
      console.error('Error updating quotation:', error);
      return { 
        success: false, 
        error: error.response?.data?.Message || error.message || 'Error al actualizar la cotización' 
      };
    }
  };

  const deleteQuotation = async (id: number) => {
    try {
      await quotationsApi.delete(id);
      refreshQuotations(); // Refresh the list after deleting
      return { success: true };
    } catch (error: any) {
      console.error('Error deleting quotation:', error);
      return { 
        success: false, 
        error: error.response?.data?.Message || error.message || 'Error al eliminar la cotización' 
      };
    }
  };

  return {
    createQuotation,
    updateQuotation,
    deleteQuotation,
  };
};

export default useQuotations;
