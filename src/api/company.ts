import axiosServices from 'utils/axios';
import { openSnackbar } from 'api/snackbar';
import { SnackbarProps } from 'types/snackbar';
import { 
  CompanyInfo, 
  PaymentConfiguration, 
  BankAccount, 
  CreateBankAccountDto, 
  UpdateBankAccountDto, 
  UpdateDisplayOrderDto 
} from 'types/company';

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

// API para Payment Configuration
export const paymentConfigApi = {
  // Obtener configuración de pago de una empresa
  getByCompany: async (companyId: number): Promise<PaymentConfiguration | null> => {
    try {
      const response = await axiosServices.get(`/api/Company/${companyId}/payment-configuration`);
      console.log('🔍 Respuesta completa del API:', response);
      console.log('🔍 response.data:', response.data);
      
      // El backend envuelve la respuesta en Message
      const result = response.data.Message || response.data;
      
      if (result.success && result.data) {
        console.log('✅ Datos encontrados:', result.data);
        return result.data;
      }
      console.log('⚠️ No hay datos en la respuesta');
      return null;
    } catch (error: any) {
      console.error('❌ Error al obtener configuración de pago:', error);
      return null;
    }
  },

  // Crear o actualizar configuración (upsert)
  upsert: async (companyId: number, data: Partial<PaymentConfiguration>): Promise<PaymentConfiguration | null> => {
    try {
      const response = await axiosServices.post(`/api/Company/${companyId}/payment-configuration`, data);
      
      // El backend envuelve la respuesta en Message
      const result = response.data.Message || response.data;
      
      if (result.success) {
        openSnackbar({ 
          ...defaultSnackbar, 
          message: 'Configuración de pago guardada correctamente.', 
          alert: { ...defaultSnackbar.alert, color: 'success' } 
        });
        return result.data;
      }
      return null;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al guardar configuración de pago';
      openSnackbar({ ...defaultSnackbar, message: errorMessage, alert: { ...defaultSnackbar.alert, color: 'error' } });
      return null;
    }
  },

  // Desactivar configuración
  deactivate: async (companyId: number, id: number): Promise<boolean> => {
    try {
      const response = await axiosServices.delete(`/api/Company/${companyId}/payment-configuration/${id}/deactivate`);
      if (response.data.success) {
        openSnackbar({ 
          ...defaultSnackbar, 
          message: 'Configuración desactivada correctamente.', 
          alert: { ...defaultSnackbar.alert, color: 'success' } 
        });
        return true;
      }
      return false;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al desactivar configuración';
      openSnackbar({ ...defaultSnackbar, message: errorMessage, alert: { ...defaultSnackbar.alert, color: 'error' } });
      return false;
    }
  },

  // Eliminar configuración permanentemente
  delete: async (companyId: number, id: number): Promise<boolean> => {
    try {
      const response = await axiosServices.delete(`/api/Company/${companyId}/payment-configuration/${id}`);
      if (response.data.success) {
        openSnackbar({ 
          ...defaultSnackbar, 
          message: 'Configuración eliminada correctamente.', 
          alert: { ...defaultSnackbar.alert, color: 'success' } 
        });
        return true;
      }
      return false;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al eliminar configuración';
      openSnackbar({ ...defaultSnackbar, message: errorMessage, alert: { ...defaultSnackbar.alert, color: 'error' } });
      return false;
    }
  }
};

// API para Bank Accounts (múltiples cuentas bancarias)
export const bankAccountApi = {
  // Obtener todas las cuentas bancarias de una empresa
  getByCompany: async (companyId: number): Promise<BankAccount[]> => {
    try {
      const response = await axiosServices.get(`/api/Company/${companyId}/bank-accounts`);
      console.log('🔍 Cuentas bancarias obtenidas:', response.data);
      
      const result = response.data.Message || response.data;
      
      if (result.success && result.data) {
        return result.data;
      }
      return [];
    } catch (error: any) {
      console.error('❌ Error al obtener cuentas bancarias:', error);
      if (error.response?.status !== 404) {
        const errorMessage = error.response?.data?.message || error.message || 'Error al obtener cuentas bancarias';
        openSnackbar({ ...defaultSnackbar, message: errorMessage, alert: { ...defaultSnackbar.alert, color: 'error' } });
      }
      return [];
    }
  },

  // Crear nueva cuenta bancaria
  create: async (companyId: number, data: CreateBankAccountDto): Promise<BankAccount | null> => {
    try {
      const response = await axiosServices.post(`/api/Company/${companyId}/bank-accounts`, data);
      
      const result = response.data.Message || response.data;
      
      if (result.success && result.data) {
        openSnackbar({ 
          ...defaultSnackbar, 
          message: 'Cuenta bancaria creada correctamente.', 
          alert: { ...defaultSnackbar.alert, color: 'success' } 
        });
        return result.data;
      }
      return null;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al crear cuenta bancaria';
      openSnackbar({ ...defaultSnackbar, message: errorMessage, alert: { ...defaultSnackbar.alert, color: 'error' } });
      return null;
    }
  },

  // Actualizar cuenta bancaria existente
  update: async (companyId: number, id: number, data: UpdateBankAccountDto): Promise<BankAccount | null> => {
    try {
      const response = await axiosServices.put(`/api/Company/${companyId}/bank-accounts/${id}`, data);
      
      const result = response.data.Message || response.data;
      
      if (result.success && result.data) {
        openSnackbar({ 
          ...defaultSnackbar, 
          message: 'Cuenta bancaria actualizada correctamente.', 
          alert: { ...defaultSnackbar.alert, color: 'success' } 
        });
        return result.data;
      }
      return null;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al actualizar cuenta bancaria';
      openSnackbar({ ...defaultSnackbar, message: errorMessage, alert: { ...defaultSnackbar.alert, color: 'error' } });
      return null;
    }
  },

  // Marcar cuenta como preferida
  setPreferred: async (companyId: number, id: number): Promise<boolean> => {
    try {
      const response = await axiosServices.put(`/api/Company/${companyId}/bank-accounts/${id}/set-preferred`);
      
      const result = response.data.Message || response.data;
      
      if (result.success) {
        openSnackbar({ 
          ...defaultSnackbar, 
          message: 'Cuenta marcada como preferida.', 
          alert: { ...defaultSnackbar.alert, color: 'success' } 
        });
        return true;
      }
      return false;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al marcar cuenta como preferida';
      openSnackbar({ ...defaultSnackbar, message: errorMessage, alert: { ...defaultSnackbar.alert, color: 'error' } });
      return false;
    }
  },

  // Actualizar orden de visualización
  updateDisplayOrder: async (companyId: number, data: UpdateDisplayOrderDto): Promise<boolean> => {
    try {
      const response = await axiosServices.put(`/api/Company/${companyId}/bank-accounts/update-order`, data);
      
      const result = response.data.Message || response.data;
      
      if (result.success) {
        openSnackbar({ 
          ...defaultSnackbar, 
          message: 'Orden actualizado correctamente.', 
          alert: { ...defaultSnackbar.alert, color: 'success' } 
        });
        return true;
      }
      return false;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al actualizar orden';
      openSnackbar({ ...defaultSnackbar, message: errorMessage, alert: { ...defaultSnackbar.alert, color: 'error' } });
      return false;
    }
  },

  // Eliminar cuenta bancaria (soft delete)
  delete: async (companyId: number, id: number): Promise<boolean> => {
    try {
      const response = await axiosServices.delete(`/api/Company/${companyId}/bank-accounts/${id}`);
      
      const result = response.data.Message || response.data;
      
      if (result.success) {
        openSnackbar({ 
          ...defaultSnackbar, 
          message: 'Cuenta bancaria eliminada correctamente.', 
          alert: { ...defaultSnackbar.alert, color: 'success' } 
        });
        return true;
      }
      return false;
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || error.message || 'Error al eliminar cuenta bancaria';
      openSnackbar({ ...defaultSnackbar, message: errorMessage, alert: { ...defaultSnackbar.alert, color: 'error' } });
      return false;
    }
  }
};

export default companyApi;
