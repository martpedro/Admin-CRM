import useSWR, { mutate as globalMutate } from 'swr';
import { quotationsApi, Quotation } from '../api/quotations';

// Hook para obtener todas las cotizaciones
export const useQuotations = () => {
  const { data, error, isLoading, mutate } = useSWR<Quotation[]>(
    'quotation:list',
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
    shouldFetch ? ['quotation:item', id] : null,
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

  const createQuotation = async (quotationData: any) => {
    try {
  const result = await quotationsApi.create(quotationData);
  await globalMutate('quotation:list');
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
  await globalMutate('quotation:list');
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
  await globalMutate('quotation:list');
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
