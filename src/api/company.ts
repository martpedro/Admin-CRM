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
import { CompanyInfo } from 'types/company';

const COMPANY_API = '/api/Company';

export const companyApi = {
  // Obtener todas las empresas
  getAll: async (): Promise<CompanyInfo[]> => {
    try {
      const response = await axiosServices.get(`${COMPANY_API}/Get`);
      const companies = response.data.Message as any[];
      openSnackbar({ ...defaultSnackbar, message: 'Empresas obtenidas correctamente.', alert: { ...defaultSnackbar.alert, color: 'success' } });
      return (companies || []).map((c: any) => ({
        id: c.Id,
        razonSocial: c.Name || '',
        nombreLegal: c.LegalName || '',
        rfc: c.TaxId || '',
        direccion: c.Address || '',
        telefonos: c.Phones || '',
        whatsapp: c.WhatsApp || '',
        pagina: c.WebPage || '',
        quotationLetter: c.QuotationLetter || undefined,
        isActive: c.IsActive ?? true
      }));
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al obtener empresas';
      openSnackbar({ ...defaultSnackbar, message: errorMessage, alert: { ...defaultSnackbar.alert, color: 'error' } });
      return [];
    }
  },
  // Obtener una empresa por ID
  getById: async (id: number): Promise<CompanyInfo> => {
    try {
      const response = await axiosServices.get(`${COMPANY_API}/GetById/${id}`);
      const c = response.data.Message;
      openSnackbar({ ...defaultSnackbar, message: 'Empresa obtenida correctamente.', alert: { ...defaultSnackbar.alert, color: 'success' } });
      return {
        id: c.Id,
        razonSocial: c.Name || '',
        nombreLegal: c.LegalName || '',
        rfc: c.TaxId || '',
        direccion: c.Address || '',
        telefonos: c.Phones || '',
        whatsapp: c.WhatsApp || '',
        pagina: c.WebPage || '',
        quotationLetter: c.QuotationLetter || undefined,
        isActive: c.IsActive ?? true
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al obtener empresa';
      openSnackbar({ ...defaultSnackbar, message: errorMessage, alert: { ...defaultSnackbar.alert, color: 'error' } });
      return {} as CompanyInfo;
    }
  },
  // Crear empresa
  create: async (input: Partial<CompanyInfo> & { quotationLetter?: string }): Promise<CompanyInfo> => {
    try {
      const payload = {
        Name: input.razonSocial,
        LegalName: input.nombreLegal || input.razonSocial,
        TaxId: input.rfc,
        QuotationLetter: input.quotationLetter || 'A',
        IsActive: input.isActive ?? true,
        Address: input.direccion,
        Phones: input.telefonos,
        WhatsApp: input.whatsapp,
        WebPage: input.pagina
      };
      const response = await axiosServices.post(`${COMPANY_API}/Create`, payload);
      const c = response.data.Message;
      openSnackbar({ ...defaultSnackbar, message: 'Empresa creada correctamente.', alert: { ...defaultSnackbar.alert, color: 'success' } });
      return {
        id: c.Id,
        razonSocial: c.Name || '',
        nombreLegal: c.LegalName || '',
        rfc: c.TaxId || '',
        direccion: c.Address || '',
        telefonos: c.Phones || '',
        whatsapp: c.WhatsApp || '',
        pagina: c.WebPage || '',
        isActive: c.IsActive ?? true
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al crear empresa';
      openSnackbar({ ...defaultSnackbar, message: errorMessage, alert: { ...defaultSnackbar.alert, color: 'error' } });
      return {} as CompanyInfo;
    }
  },
  // Actualizar empresa
  update: async (id: number, input: Partial<CompanyInfo>): Promise<CompanyInfo> => {
    try {
      const payload = {
        Id: id,
        Name: input.razonSocial,
        LegalName: input.nombreLegal || input.razonSocial,
        TaxId: input.rfc,
        IsActive: input.isActive ?? true,
        Address: input.direccion,
        Phones: input.telefonos,
        WhatsApp: input.whatsapp,
        WebPage: input.pagina
      };
      const response = await axiosServices.put(`${COMPANY_API}/Update`, payload);
      const c = response.data.Message;
      openSnackbar({ ...defaultSnackbar, message: 'Empresa actualizada correctamente.', alert: { ...defaultSnackbar.alert, color: 'success' } });
      return {
        id: c.Id,
        razonSocial: c.Name || '',
        nombreLegal: c.LegalName || '',
        rfc: c.TaxId || '',
        direccion: c.Address || '',
        telefonos: c.Phones || '',
        whatsapp: c.WhatsApp || '',
        pagina: c.WebPage || '',
        isActive: c.IsActive ?? true
      };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al actualizar empresa';
      openSnackbar({ ...defaultSnackbar, message: errorMessage, alert: { ...defaultSnackbar.alert, color: 'error' } });
      return {} as CompanyInfo;
    }
  },
  // Eliminar empresa
  remove: async (id: number): Promise<{ deleted: boolean }> => {
    try {
      const response = await axiosServices.delete(`${COMPANY_API}/${id}`);
      openSnackbar({ ...defaultSnackbar, message: 'Empresa eliminada correctamente.', alert: { ...defaultSnackbar.alert, color: 'success' } });
      return response.data.Message || { deleted: true };
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al eliminar empresa';
      openSnackbar({ ...defaultSnackbar, message: errorMessage, alert: { ...defaultSnackbar.alert, color: 'error' } });
      return { deleted: false };
    }
  }
};

export default companyApi;
