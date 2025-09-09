// ==============================|| TYPES - E-COMMERCE  ||============================== //

export interface Address {
  id?: number;
  name: string;
  destination: string;
  building: string;
  street: string;
  city: string;
  state: string;
  country: string;
  post: string;
  phone: string;
  isDefault?: boolean;
}

export interface PaymentOptionsProps {
  id: number;
  value: string;
  title: string;
  caption: string;
  image: string;
  size: {
    width: number;
    height: number;
  };
}

export interface Products {
  id: number;
  name: string;
  image: string;
  description: string;
  rating: number;
  discount?: number;
  salePrice?: number;
  offerPrice?: number;
  gender: string;
  categories: string[];
  colors: ColorsOptionsProps[];
  popularity: number;
  date: number;
  created: Date;
  isStock?: boolean;
  new?: number;
  quantity?: number;
}

export interface ColorsOptionsProps {
  label: string;
  value: string;
  bg: string;
}

export interface ProductsFilter {
  length?: number;
  search: string;
  sort: string;
  gender: string[];
  categories: string[];
  colors: string[];
  price: string;
  rating: number;
}

export interface SortOptionsProps {
  value: string;
  label: string;
}

export interface TabsProps {
  children?: React.ReactElement | React.ReactNode | string;
  value: number;
  index: number;
}

export interface Reviews {
  id: number;
  rating: number;
  review: string;
  date: Date | string;
  profile: {
    avatar: string;
    name: string;
    status: boolean;
  };
}
