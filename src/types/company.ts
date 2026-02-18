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

// Nuevos tipos para sistema de múltiples cuentas bancarias
export interface PaymentMethodsConfig {
  CompanyId: number;
  AcceptedPaymentMethods?: AcceptedPaymentMethods;
  AcceptedCards?: AcceptedCards;
  PaymentNotes?: string;
  ShowInQuotation?: boolean;
  CreatedAt?: string;
  UpdatedAt?: string;
}

export interface BankAccount {
  Id?: number;
  CompanyId: number;
  BankName: string;
  AccountNumber?: string;
  ClaveInterbancaria?: string;
  AccountHolder?: string;
  BankBranch?: string;
  SwiftCode?: string;
  Currency?: 'MXN' | 'USD' | 'EUR' | 'CAD' | 'GBP';
  AccountType?: 'Cheques' | 'Ahorro' | 'Inversión' | 'Nómina' | 'Empresarial';
  IsPreferred?: boolean;
  DisplayOrder?: number;
  Notes?: string;
  IsActive?: boolean;
  CreatedAt?: string;
  UpdatedAt?: string;
}

export interface CreateBankAccountDto {
  CompanyId: number;
  BankName: string;
  AccountNumber?: string;
  ClaveInterbancaria?: string;
  AccountHolder?: string;
  BankBranch?: string;
  SwiftCode?: string;
  Currency?: string;
  AccountType?: string;
  IsPreferred?: boolean;
  DisplayOrder?: number;
  Notes?: string;
}

export interface UpdateBankAccountDto {
  BankName?: string;
  AccountNumber?: string;
  ClaveInterbancaria?: string;
  AccountHolder?: string;
  BankBranch?: string;
  SwiftCode?: string;
  Currency?: string;
  AccountType?: string;
  IsPreferred?: boolean;
  DisplayOrder?: number;
  Notes?: string;
}

export interface UpdateDisplayOrderDto {
  accounts: Array<{
    Id: number;
    DisplayOrder: number;
  }>;
}
