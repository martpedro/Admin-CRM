import axios, { AxiosRequestConfig } from 'axios';

const axiosServices = axios.create({ 
  baseURL: import.meta.env.VITE_APP_API_URL || 'http://localhost:3001/',
  headers: {
    'Content-Type': 'application/json'
  }
});

// ==============================|| AXIOS - FOR MOCK SERVICES ||============================== //

axiosServices.interceptors.request.use(
  async (config) => {
    // ...existing code...
    const accessToken = localStorage.getItem('serviceToken');
    if (accessToken) {
      config.headers['Authorization'] = `Bearer ${accessToken}`;
    }
    // Asegurar que el Content-Type esté configurado
    if (!config.headers['Content-Type']) {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

axiosServices.interceptors.response.use(
  (response) => {
    // ...existing code...
    return response;
  },
  (error) => {
    if (error.response.status === 401 && !window.location.href.includes('/login')) {
      window.location.pathname = '/maintenance/500';
    }
    return Promise.reject((error.response && error.response.data) || 'Wrong Services');
  }
);

export default axiosServices;

export const fetcher = async (args: string | [string, AxiosRequestConfig]) => {
  const [url, config] = Array.isArray(args) ? args : [args];

  const res = await axiosServices.get(url, { 
    ...config,
    headers: {
      ...config?.headers,
      'Content-Type': 'application/json'
    }
  });

  return res.data;
};
