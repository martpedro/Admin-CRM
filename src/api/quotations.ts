import { openSnackbar } from './snackbar';

import axiosServices from 'utils/axios';
import { mutate } from 'swr';
import { generateQuotationEmailHTML, generateQuotationEmailText } from 'templates/QuotationEmailTemplate';
import { defaultCompanyConfig } from 'config/companyConfig';

const QUOTATIONS_API = '/api/Quotation';

/**
 * Función general para invalidar cache de cotizaciones
 * Refresca todas las listas de cotizaciones y datos específicos
 *
 * @param quotationId - ID de cotización específica a refrescar (opcional)
 *
 * @example
 * // Refrescar solo las listas
 * await refreshQuotationsCache();
 *
 * // Refrescar listas y cotización específica
 * await refreshQuotationsCache(123);
 */
export const refreshQuotationsCache = async (quotationId?: number) => {
  // Usar requestIdleCallback para evitar bloquear el hilo principal
  return new Promise<void>((resolve) => {
    const processCacheRefresh = async () => {
      try {
        // Crear promesas para ejecutar en paralelo y reducir tiempo de bloqueo
        const promises = [
          mutate(/^quotation:list/),
          mutate('quotation:list'),
          mutate('quotation:list:Nueva'),
          mutate('quotation:list:En proceso'),
          mutate('quotation:list:Cerrada')
        ];

        // Si se especifica un ID, también refrescar esa cotización específica
        if (quotationId) {
          promises.push(mutate(['quotation:item', quotationId]));
        }

        // Ejecutar todas las invalidaciones en paralelo
        await Promise.allSettled(promises);

        console.log('✅ Cache de cotizaciones actualizado correctamente');
        resolve();
      } catch (error) {
        console.warn('⚠️ Error al actualizar cache de cotizaciones:', error);
        resolve(); // Resolver anyway para no bloquear
      }
    };

    // Usar requestIdleCallback si está disponible, sino setTimeout
    if (window.requestIdleCallback) {
      window.requestIdleCallback(processCacheRefresh);
    } else {
      setTimeout(processCacheRefresh, 0);
    }
  });
};
// Descargar Excel de cotización
export const downloadQuotationExcel = async (quotationId: number): Promise<void> => {
  // Crear un enlace temporal para descargar el archivo
  try {
    const response = await axiosServices.get(`/api/Quotation/DownloadExcel/${quotationId}`.replace(/\/+/g, '/'), {
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    // Nombre sugerido para el archivo
    link.setAttribute('download', `Cotizacion_${quotationId}.xlsx`);
    document.body.appendChild(link);
    link.click();
    link.parentNode?.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (error: any) {
    // Importar initialState de snackbar para asegurar todos los campos requeridos
    import('./snackbar').then(({ initialState }) => {
      const safeInitial = initialState || {};
      openSnackbar({
        ...safeInitial,
        open: true,
        message: 'No se pudo descargar el Excel de la cotización',
        variant: 'alert',
        alert: { ...(safeInitial.alert || {}), color: 'error' }
      });
    });
  }
};
// Enviar cotización por correo
export const sendQuotationEmail = async ({
  quotationId,
  to,
  cc,
  message,
  quotation
}: {
  quotationId: number;
  to: string;
  cc: string;
  message: string;
  quotation?: Quotation;
}) => {
  // Usar Promise.resolve para evitar bloqueo del hilo principal
  return new Promise<void>((resolve, reject) => {
    // Usar requestIdleCallback para generar plantillas sin bloquear UI
    const processEmail = () => {
      try {
        // Generar plantillas de correo de forma optimizada
        let emailHTML = '';
        let emailText = '';

        if (quotation) {
          // Generar plantillas en chunks para evitar bloqueo
          emailHTML = generateQuotationEmailHTML({
            quotation,
            customMessage: message,
            companyInfo: defaultCompanyConfig
          });
          emailText = generateQuotationEmailText({
            quotation,
            customMessage: message,
            companyInfo: defaultCompanyConfig
          });
        }

        // Enviar email de forma asíncrona
        axiosServices
          .post('/api/Quotation/SendEmail', {
            quotationId,
            to,
            cc,
            message,
            subject: `Cotización ${quotation?.NumberQuotation || `#${quotationId}`} - Regalos Corporativos`,
            htmlTemplate: emailHTML,
            textTemplate: emailText,
            attachPdf: true
          })
          .then(() => resolve())
          .catch(reject);
      } catch (error) {
        reject(error);
      }
    };

    // Usar requestIdleCallback si está disponible, sino setTimeout
    if (window.requestIdleCallback) {
      window.requestIdleCallback(processEmail);
    } else {
      setTimeout(processEmail, 0);
    }
  });
};
// Types for Quotations
export interface QuotationProduct {
  Id?: number;
  Image: string;
  // Campo opcional para manejo en front cuando se suba una nueva imagen (no se envía directamente en JSON, se usa para FormData)
  ImageFile?: File; // NO persistente, sólo uso temporal
  CodeVendor: string;
  Code: string;
  Description: string;
  Specifications: string;
  Inks: string;
  PrintDetails?: string; // Detalle de impresión (equivalente a Inks pero usado en la tabla)
  DeliveryTime: string;
  Quantity: number;
  VendorCost: number;
  PrintCost: number;
  UnitPrice: number;
  Total: number;
  Revenue: number;
  Commission: number;
}

export interface QuotationCreate {
  AdvancePayment: string;
  LiquidationPayment: string;
  TimeCredit: string;
  TimeValidation: string;
  SubTotal: number;
  Tax: number;
  Total: number;
  UserId: number;
  CustomerId: number;
  AddressId: number;
  CompanyId: number;
  Status?: 'Nueva' | 'En proceso' | 'Cerrada';
  products: QuotationProduct[];
}

export interface QuotationUpdate {
  Id: number;
  AdvancePayment?: string;
  LiquidationPayment?: string;
  TimeCredit?: string;
  TimeValidation?: string;
  SubTotal?: number;
  Tax?: number;
  Total?: number;
  Status?: 'Nueva' | 'En proceso' | 'Cerrada';
  products?: QuotationProduct[];
}

export interface Quotation {
  Id: number;
  NumberQuotation: string;
  AdvancePayment: string;
  LiquidationPayment: string;
  TimeCredit: string;
  TimeValidation: string;
  SubTotal: number;
  Tax: number;
  Total: number;
  Status: 'Nueva' | 'En proceso' | 'Cerrada';
  Version: number;
  BaseQuotationId: number | null;
  VersionNotes: string | null;
  IsLatestVersion: boolean;
  User: {
    Id: number;
    Name: string;
    LastNAme: string;
    Email: string;
  };
  Customer: {
    Id: number;
    Name: string;
    LastName: string;
    Email: string;
    Phone: string;
  };
  address: {
    Id: number;
    AddressLine1: string;
    AddressLine2: string;
    City: string;
    State: string;
    ZipCode: string;
  };
  Company: {
    Id: number;
    Name: string;
    QuotationLetter: string;
  };
  products: QuotationProduct[];
  CreatedAt: string;
}

// Tipos adicionales para versionado
export interface QuotationVersion {
  id: number;
  number: string;
  version: number;
  status: string;
  total: number;
  subTotal: number;
  tax: number;
  productsCount: number;
  createdAt: string;
  versionNotes?: string;
}

export interface QuotationComparison {
  version1: QuotationVersion;
  version2: QuotationVersion;
  differences: {
    totalDiff: number;
    subTotalDiff: number;
    taxDiff: number;
    productsCountDiff: number;
  };
}

// Tipos para funcionalidad de copia
export interface QuotationProductCopy {
  Image: string;
  Code: string;
  Description: string;
  Specifications: string;
  Inks: string;
  DeliveryTime: string;
  Quantity: number;
  VendorCost: number;
  PrintCost: number;
  UnitPrice: number;
  Total: number;
  Revenue: number;
  Commission: number;
  Origin?: string;
  PrintDetails?: string;
  ProfitMargin?: number;
  ExtraProfit?: number;
}

export interface QuotationCopyData {
  AdvancePayment: string;
  LiquidationPayment: string;
  TimeCredit: string;
  TimeValidation: string;
  CompanyId: number;
  UserId: number;
  products: QuotationProductCopy[];
}

// API Functions
export const quotationsApi = {
  // Obtener PDF de cotización
  getPdf: async (quotationId: number): Promise<Blob> => {
    const response = await axiosServices.get(`/api/Quotation/Pdf/${quotationId}`.replace(/\/+/g, '/'), { responseType: 'blob' });
    return response.data as Blob;
  },
  // Subir imagen de producto
  uploadProductImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);
    const response = await axiosServices.post('https://crm.regaloscorporativosypromocionales.com.mx/upload-image.php', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data?.url || response.data?.imageUrl || response.data?.link || '';
  },
  // Buscar productos predictivos
  searchProducts: async (term: string, limit: number = 10): Promise<any[]> => {
    const response = await axiosServices.get(`/api/Quotation/SearchProducts?q=${encodeURIComponent(term)}&limit=${limit}`);
    const list = Array.isArray(response.data) ? response.data : response.data?.Message || [];
    return list;
  },
  // Get all quotations with optional status filter
  getAll: async (status?: string): Promise<Quotation[]> => {
    const url = status ? `${QUOTATIONS_API}/Get?status=${encodeURIComponent(status)}` : `${QUOTATIONS_API}/Get`;
    const response = await axiosServices.get(url);
    const data = response.data?.Message ?? response.data;
    return Array.isArray(data) ? data : [];
  },

  // Get quotation by ID
  getById: async (id: number): Promise<Quotation> => {
    const response = await axiosServices.get(`${QUOTATIONS_API}/GetById/${id}`);
    return response.data?.Message ?? response.data;
  },

  // Create new quotation
  create: async (quotation: QuotationCreate): Promise<Quotation> => {
    const hasFiles = quotation.products.some((p: any) => p.ImageFile instanceof File);
    if (hasFiles) {
      const formData = new FormData();
      const productsForJson = quotation.products.map((p: any) => {
        const { ImageFile, ...rest } = p;
        return rest;
      });
      const jsonData = { ...quotation, products: productsForJson };
      formData.append('data', JSON.stringify(jsonData));
      quotation.products.forEach((p: any, index: number) => {
        if (p.ImageFile instanceof File) formData.append(`productImage_${index}`, p.ImageFile);
      });
      const response = await axiosServices.post(`${QUOTATIONS_API}/Create`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data?.Message ?? response.data;
    } else {
      const response = await axiosServices.post(`${QUOTATIONS_API}/Create`, quotation);
      return response.data?.Message ?? response.data;
    }
  },

  // Update quotation
  update: async (quotation: QuotationUpdate): Promise<Quotation> => {
    // Si quotation.products existe y contiene ImageFile, usar FormData
    const anyProducts: any[] = (quotation as any).products || [];
    const hasFiles = anyProducts.some((p: any) => p.ImageFile instanceof File);
    if (hasFiles) {
      const formData = new FormData();
      const productsForJson = anyProducts.map((p: any) => {
        const { ImageFile, ...rest } = p;
        return rest;
      });
      const jsonData = { ...quotation, products: productsForJson };
      formData.append('data', JSON.stringify(jsonData));
      anyProducts.forEach((p: any, index: number) => {
        if (p.ImageFile instanceof File) formData.append(`productImage_${index}`, p.ImageFile);
      });
      const response = await axiosServices.put(`${QUOTATIONS_API}/Update`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data?.Message ?? response.data;
    } else {
      const response = await axiosServices.put(`${QUOTATIONS_API}/Update`, quotation);
      return response.data?.Message ?? response.data;
    }
  },

  // Delete quotation
  delete: async (id: number): Promise<{ deleted: boolean }> => {
    const response = await axiosServices.delete(`${QUOTATIONS_API}/${id}`);
    return response.data?.Message ?? response.data;
  },

  // List advisors available to current user (permission-scoped)
  getAdvisors: async (): Promise<any[]> => {
    const response = await axiosServices.get('/api/user/advisors');
    // Backend returns array directly (no Message wrapper) per new endpoint implementation
    const data = response.data?.Message ?? response.data;
    return Array.isArray(data) ? data : [];
  },

  // Update quotation status
  updateStatus: async (id: number, status: 'Nueva' | 'En proceso' | 'Cerrada'): Promise<any> => {
    const response = await axiosServices.put(`${QUOTATIONS_API}/UpdateStatus/${id}`, { status });
    return response.data?.Message ?? response.data;
  },

  // Create new version of a sent quotation
  createVersion: async (id: number, versionNotes?: string): Promise<Quotation> => {
    const response = await axiosServices.post(`${QUOTATIONS_API}/CreateVersion/${id}`, { versionNotes });
    return response.data?.data ?? response.data?.Message?.data ?? response.data;
  },

  // Get all versions of a quotation
  getVersions: async (id: number): Promise<Quotation[]> => {
    const response = await axiosServices.get(`${QUOTATIONS_API}/Versions/${id}`);
    console.log('Respuesta de getVersions:', response.data.Message);
    const result = response.data?.Message ? response.data?.Message?.data : {};
    // Asegurar que siempre retornamos un array
    return Array.isArray(result) ? result : [];
  },

  // Compare two versions
  compareVersions: async (id1: number, id2: number): Promise<QuotationComparison> => {
    const response = await axiosServices.get(`${QUOTATIONS_API}/Compare/${id1}/${id2}`);
    return response.data?.data ?? response.data?.Message ?? response.data;
  },

  // Get quotation data for copying
  getQuotationForCopy: async (id: number): Promise<QuotationCopyData> => {
    const response = await axiosServices.get(`${QUOTATIONS_API}/GetForCopy/${id}`);
    return response.data?.data ?? response.data?.Message ?? response.data;
  }
};

export default quotationsApi;
