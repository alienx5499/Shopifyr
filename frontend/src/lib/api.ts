import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  register: async (email: string, username: string, password: string) => {
    const response = await api.post('/auth/register', { email, username, password });
    return response.data;
  },
  login: async (usernameOrEmail: string, password: string) => {
    const response = await api.post('/auth/login', { usernameOrEmail, password });
    return response.data;
  },
};

export const productApi = {
  getAll: async (params?: { page?: number; size?: number; categoryId?: number; brandId?: number; minPrice?: number; maxPrice?: number }) => {
    const response = await api.get('/products', { params });
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/products/${id}`);
    return response.data;
  },
};

export const cartApi = {
  get: async () => {
    const response = await api.get('/cart');
    return response.data;
  },
  addItem: async (productId: number, quantity: number) => {
    const response = await api.post('/cart/items', { productId, quantity });
    return response.data;
  },
  updateItem: async (itemId: number, quantity: number) => {
    const response = await api.put(`/cart/items/${itemId}`, null, { params: { quantity } });
    return response.data;
  },
  removeItem: async (itemId: number) => {
    const response = await api.delete(`/cart/items/${itemId}`);
    return response.data;
  },
  clear: async () => {
    await api.delete('/cart');
  },
};

export const orderApi = {
  placeOrder: async () => {
    const response = await api.post('/orders');
    return response.data;
  },
  getUserOrders: async () => {
    const response = await api.get('/orders');
    return response.data;
  },
  getById: async (id: number) => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },
};

export const categoryApi = {
  getAll: async () => {
    const response = await api.get('/categories');
    return response.data;
  },
};

export const brandApi = {
  getAll: async () => {
    const response = await api.get('/brands');
    return response.data;
  },
};
