import axiosServices from 'utils/axios';
import { CompanyInfo } from 'types/company';

const COMPANY_API = '/api/Company';

export const companyApi = {
  // Obtener todas las empresas
  getAll: async (): Promise<CompanyInfo[]> => {
  const response = await axiosServices.get(`${COMPANY_API}/Get`);
    const companies = response.data.Message as any[];
    return (companies || []).map((c: any) => ({
      id: c.Id,
      razonSocial: c.LegalName || c.Name,
      rfc: c.TaxId || '',
      direccion: c.Address || '',
      telefonos: c.Phones || '',
      whatsapp: c.WhatsApp || '',
      pagina: c.WebPage || ''
    }));
  },
  // Obtener una empresa por ID
  getById: async (id: number): Promise<CompanyInfo> => {
    const response = await axiosServices.get(`${COMPANY_API}/GetById/${id}`);
    const c = response.data.Message;
    return {
      id: c.Id,
      razonSocial: c.LegalName || c.Name,
      rfc: c.TaxId || '',
      direccion: c.Address || '',
      telefonos: c.Phones || '',
      whatsapp: c.WhatsApp || '',
      pagina: c.WebPage || ''
    };
  },
  // Crear empresa
  create: async (input: Partial<CompanyInfo> & { quotationLetter?: string }): Promise<CompanyInfo> => {
    const payload = {
      Name: input.razonSocial,
      LegalName: input.razonSocial,
      TaxId: input.rfc,
      QuotationLetter: input.quotationLetter || 'A',
      Address: input.direccion,
      Phones: input.telefonos,
      WhatsApp: input.whatsapp,
      WebPage: input.pagina
    };
    const response = await axiosServices.post(`${COMPANY_API}/Create`, payload);
    const c = response.data.Message;
    return {
      id: c.Id,
      razonSocial: c.LegalName || c.Name,
      rfc: c.TaxId || '',
      direccion: c.Address || '',
      telefonos: c.Phones || '',
      whatsapp: c.WhatsApp || '',
      pagina: c.WebPage || ''
    };
  },
  // Actualizar empresa
  update: async (id: number, input: Partial<CompanyInfo>): Promise<CompanyInfo> => {
    const payload = {
      Id: id,
      Name: input.razonSocial,
      LegalName: input.razonSocial,
      TaxId: input.rfc,
      Address: input.direccion,
      Phones: input.telefonos,
      WhatsApp: input.whatsapp,
      WebPage: input.pagina
    };
    const response = await axiosServices.put(`${COMPANY_API}/Update`, payload);
    const c = response.data.Message;
    return {
      id: c.Id,
      razonSocial: c.LegalName || c.Name,
      rfc: c.TaxId || '',
      direccion: c.Address || '',
      telefonos: c.Phones || '',
      whatsapp: c.WhatsApp || '',
      pagina: c.WebPage || ''
    };
  },
  // Eliminar empresa
  remove: async (id: number): Promise<{ deleted: boolean }> => {
    const response = await axiosServices.delete(`${COMPANY_API}/${id}`);
    return response.data.Message || { deleted: true };
  }
};

export default companyApi;
