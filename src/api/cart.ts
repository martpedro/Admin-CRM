import useSWR from 'swr';
import axios from 'axios';
import { CartCheckoutStateProps, CartProductStateProps } from 'types/cart';

// API Functions
const cartApi = {
  get: async (): Promise<CartCheckoutStateProps> => {
    const response = await axios.get('/api/cart');
    return response.data || {
      step: 0,
      products: [],
      subtotal: 0,
      total: 0,
      discount: 0,
      shipping: 0,
      billing: null,
      payment: {
        type: '',
        method: '',
        card: ''
      }
    };
  },

  addProduct: async (product: CartProductStateProps): Promise<CartCheckoutStateProps> => {
    const response = await axios.post('/api/cart/product', product);
    return response.data;
  },

  updateProduct: async (productId: number, updates: Partial<CartProductStateProps>): Promise<CartCheckoutStateProps> => {
    const response = await axios.put(`/api/cart/product/${productId}`, updates);
    return response.data;
  },

  removeProduct: async (productId: number): Promise<CartCheckoutStateProps> => {
    const response = await axios.delete(`/api/cart/product/${productId}`);
    return response.data;
  },

  setDiscount: async (discount: number): Promise<CartCheckoutStateProps> => {
    const response = await axios.put('/api/cart/discount', { discount });
    return response.data;
  },

  setBilling: async (billing: any): Promise<CartCheckoutStateProps> => {
    const response = await axios.put('/api/cart/billing', billing);
    return response.data;
  },

  setPayment: async (payment: any): Promise<CartCheckoutStateProps> => {
    const response = await axios.put('/api/cart/payment', payment);
    return response.data;
  },

  setStep: async (step: number): Promise<CartCheckoutStateProps> => {
    const response = await axios.put('/api/cart/step', { step });
    return response.data;
  }
};

// Hook
export const useGetCart = () => {
  const { data, error, isLoading, mutate } = useSWR<CartCheckoutStateProps>(
    '/api/cart',
    cartApi.get,
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  return {
    cart: data,
    isLoading,
    error,
    refreshCart: mutate,
  };
};

// Export individual functions
export const addToCart = cartApi.addProduct;
export const updateCartProduct = cartApi.updateProduct;
export const removeCartProduct = cartApi.removeProduct;
export const setCartDiscount = cartApi.setDiscount;
export const setBillingAddress = cartApi.setBilling;
export const setPaymentCard = cartApi.setPayment;
export const setPaymentMethod = cartApi.setPayment;
export const setCheckoutStep = cartApi.setStep;
export const setNextStep = () => cartApi.setStep;
export const setBackStep = () => cartApi.setStep;

export default cartApi;
