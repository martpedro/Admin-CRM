import { Gender } from 'config';

// ==============================|| TYPES - User  ||============================== //

export interface UserProps {
  modal: boolean;
}

export interface UserList {
  firstName: string;
  lastName: string;
  id?: number;
  avatar: number;
  name: string;
  fatherName: string;
  email: string;
  age: number;
  gender: Gender;
  role: string;
  orders: number;
  progress: number;
  status: number;
  orderStatus: string;
  contact: string;
  country: string;
  location: string;
  about: string;
  skills: string[];
  time: string[];
  date: Date | string | number;
}

// Nuevo tipo basado en la respuesta de la API de usuarios
export interface ApiUser {
  Id: number;
  name: string;
  LastName: string;
  MotherLastName: string;
  Phone: string;
  LetterAsign: string;
  password: string;
  profile: string;
  email: string;
  isActive: boolean;
}

export interface UsersApiResponse {
  Message: [ApiUser[], number];
}
