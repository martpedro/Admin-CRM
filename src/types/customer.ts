import { Gender } from 'config';

// ==============================|| TYPES - CUSTOMER  ||============================== //

export interface CustomerProps {
  modal: boolean;
}

export interface CustomerList {
  firstName: string;
  lastName: string;
  middleName?: string;
  id?: number;
    name: string;
  fatherName: string;
  email: string;
  phone: string;
  classCustomer: string;
  supportSales: string;
  companyName: string;
  age: number;
  gender: Gender;
  role: string;
  orders: number;
  progress: number;
  status: number;
  orderStatus: string;
  contact: string;
  about: string;
  skills: string[];
  time: string[];
  date: Date | string | number;
  address?: Address[];
}
/**
 * Interface representing a customer's address information.
 */
export interface Address {
  /**
   * Street address including house/building number.
   */
  street: string;
  /**
   * Name of the city.
   */
  city: string;
  /**
   * Name of the state or province.
   */
  state: string;
  /**
   * Postal or ZIP code.
   */
  postalCode: string;
  /**
   * Name of the country.
   */
  country: string;
}