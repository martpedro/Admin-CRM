import axiosServices from 'utils/axios';

// Types para la búsqueda global
export interface SearchResult {
  id: number;
  type: 'quotation' | 'customer';
  title: string;
  subtitle: string;
  description: string;
  url: string;
  avatar: string;
  status: string;
  date: string;
  amount?: number;
  phone?: string;
  email?: string;
}

export interface GlobalSearchResponse {
  quotations: SearchResult[];
  customers: SearchResult[];
}

// API de búsqueda global
const globalSearchApi = {
  // Búsqueda global en cotizaciones y clientes
  search: async (query: string, limit: number = 10): Promise<GlobalSearchResponse> => {
    const response = await axiosServices.get(`/api/Quotation/GlobalSearch?q=${encodeURIComponent(query)}&limit=${limit}`);
    return response.data;
  }
};

export default globalSearchApi;