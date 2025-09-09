// ==============================|| TYPES - CART  ||============================== //

export interface CartProductStateProps {
  id: number;
  name: string;
  image: string;
  salePrice: number;
  offerPrice?: number;
  color: string;
  quantity: number;
  size?: string;
}

export interface CartCheckoutStateProps {
  step: number;
  products: CartProductStateProps[];
  subtotal: number;
  total: number;
  discount: number;
  shipping: number;
  billing: {
    id: number;
    name: string;
    destination: string;
    building: string;
    street: string;
    city: string;
    state: string;
    country: string;
    post: string;
    phone: string;
  } | null;
  payment: {
    type: string;
    method: string;
    card: string;
  };
}
