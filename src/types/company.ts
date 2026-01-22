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

// Tipos para métodos de pago
export interface AcceptedPaymentMethods {
  transferencia?: boolean;
  efectivo?: boolean;
  cheque?: boolean;
  tarjetaDebito?: boolean;
  tarjetaCredito?: boolean;
  paypal?: boolean;
  openpay?: boolean;
  mercadopago?: boolean;
}

export interface AcceptedCards {
  debit?: string[];
  credit?: string[];
}

export interface PaymentConfiguration {
  Id?: number;
  CompanyId: number;
  BankName?: string;
  AccountNumber?: string;
  ClaveInterbancaria?: string;
  AccountHolder?: string;
  BankBranch?: string;
  SwiftCode?: string;
  AcceptedPaymentMethods?: AcceptedPaymentMethods;
  AcceptedCards?: AcceptedCards;
  PaymentNotes?: string;
  ShowInQuotation?: boolean;
  IsActive?: boolean;
  CreatedAt?: string;
  UpdatedAt?: string;
}
