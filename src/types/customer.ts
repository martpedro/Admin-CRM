import { Gender } from 'config';

// ==============================|| TYPES - CUSTOMER  ||============================== //

export interface CustomerProps {
  modal: boolean;
}

export interface CustomerList {
  Id?: number;
  FirstName: string;
  LastName: string;
  MiddleName?: string;
  Name: string;
  Email: string;
  Phone: string;
  ClassCustomer: string;
  Role?: string;
  CompanyName: string;
  Status: number;
  Contact: string;
  About: string;
  CreatedAt?: string;
  Address?: Address[];
  SupportSales?: {
    Id?: number;
    Email?: string;
    LastNAme?: string;
    Name?: string;
    LetterAsign?: string;
    Phone?: string;
  };
  // Propiedades adicionales para compatibilidad con PDF exports
  fatherName?: string;
  avatar?: number | string;
  country?: string;
  skills?: string[];
  time?: string;
  role?: string; // minúscula para compatibilidad
  // Propiedades legacy para compatibilidad
  firstName?: string;
  lastName?: string;
  middleName?: string;
  name?: string;
  email?: string;
  phone?: string;
  classCustomer?: string;
  supportSales?: string;
  companyName?: string;
  status?: number;
  contact?: string;
  about?: string;
  address?: Address[];
}
/**
 * Interface representing a customer's address information.
 */
export interface Address {
  /**
   * Unique identifier for the address.
   */
  Id?: number;
  /**
   * ID of the customer this address belongs to.
   */
   CustomerId?: number;
  /**
   * Label or identifier for the address (e.g., "Casa", "Oficina", "Principal").
   */
  Label: string;
  /**
   * Street address including house/building number.
   */
  Street: string;
  /**
   * Name of the city.
   */
  City: string;
  /**
   * Name of the state or province.
   */
  State: string;
  /**
   * Postal or ZIP code.
   */
  PostalCode: string;
  /**
   * Name of the country.
   */
  Country: string;
}
