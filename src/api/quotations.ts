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
  // Generar plantillas de correo
  let emailHTML = '';
  let emailText = '';
  
  if (quotation) {
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

  await axiosServices.post('/api/Quotation/SendEmail', {
    quotationId,
    to,
    cc,
    message,
    subject: `Cotización ${quotation?.NumberQuotation || `#${quotationId}`} - Regalos Corporativos`,
    htmlTemplate: emailHTML,
    textTemplate: emailText,
    attachPdf: true
  });
};
import axiosServices from 'utils/axios';
import { generateQuotationEmailHTML, generateQuotationEmailText } from 'templates/QuotationEmailTemplate';
import { defaultCompanyConfig } from 'config/companyConfig';

const QUOTATIONS_API = '/api/Quotation';

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
    const response = await axiosServices.post('http://localhost/admin/upload-image.php', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data?.url || response.data?.imageUrl || response.data?.link || '';
  },
  // Buscar productos predictivos
  searchProducts: async (term: string, limit: number = 10): Promise<any[]> => {
    const response = await axiosServices.get(`/api/Quotation/SearchProducts?q=${encodeURIComponent(term)}&limit=${limit}`);
    const list = Array.isArray(response.data) ? response.data : (response.data?.Message || []);
    return list;
  },
  // Get all quotations
  getAll: async (): Promise<Quotation[]> => {
    const response = await axiosServices.get(`${QUOTATIONS_API}/Get`);
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
      const response = await axiosServices.post(`${QUOTATIONS_API}/Create`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
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
      const productsForJson = anyProducts.map((p: any) => { const { ImageFile, ...rest } = p; return rest; });
      const jsonData = { ...quotation, products: productsForJson };
      formData.append('data', JSON.stringify(jsonData));
      anyProducts.forEach((p: any, index: number) => { if (p.ImageFile instanceof File) formData.append(`productImage_${index}`, p.ImageFile); });
      const response = await axiosServices.put(`${QUOTATIONS_API}/Update`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
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
  }
};

export default quotationsApi;
