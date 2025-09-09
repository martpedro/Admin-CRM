import axios from 'axios';

const QUOTATIONS_API = '/api/Quotation';

// Types for Quotations
export interface QuotationProduct {
  Id?: number;
  Image: string;
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
  // Get all quotations
  getAll: async (): Promise<Quotation[]> => {
    const response = await axios.get(`${QUOTATIONS_API}/Get`);
    return response.data.Message;
  },

  // Get quotation by ID
  getById: async (id: number): Promise<Quotation> => {
    const response = await axios.get(`${QUOTATIONS_API}/GetById/${id}`);
    return response.data.Message;
  },

  // Create new quotation
  create: async (quotation: QuotationCreate): Promise<Quotation> => {
    const response = await axios.post(`${QUOTATIONS_API}/Create`, quotation);
    return response.data.Message;
  },

  // Update quotation
  update: async (quotation: QuotationUpdate): Promise<Quotation> => {
    const response = await axios.put(`${QUOTATIONS_API}/Update`, quotation);
    return response.data.Message;
  },

  // Delete quotation
  delete: async (id: number): Promise<{ deleted: boolean }> => {
    const response = await axios.delete(`${QUOTATIONS_API}/${id}`);
    return response.data.Message;
  }
};

export default quotationsApi;
