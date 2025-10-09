// Tipos para la información de la empresa seleccionada desde el API
export interface CompanyInfo {
  id: number;
  razonSocial: string;
  nombreLegal?: string; // Corresponde a LegalName en el backend
  rfc: string;
  direccion: string;
  telefonos: string;
  whatsapp: string;
  pagina: string;
  quotationLetter?: string;
  isActive?: boolean; // Corresponde a IsActive en el backend
}
