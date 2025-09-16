import axios from 'axios';

// Vite usa import.meta.env em vez de process.env
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
console.log('Conectando com API em:', API_BASE_URL);

const api = axios.create({
    baseURL: API_BASE_URL,
});

// Interceptor para adicionar o token às requisições
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/login';
        }

        const errorMessage = error.response?.data?.message ||
            error.response?.statusText ||
            error.message ||
            'Erro de conexão';

        const enhancedError = new Error(errorMessage);
        enhancedError.response = error.response;
        return Promise.reject(enhancedError);
    }
);

// Auth
export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    // verifyToken: () => api.get('/auth/verify'),
};

// Products
export const productsAPI = {
    getAll: () => api.get('/products'),
    getById: (id) => api.get(`/products/${id}`),
    create: (product) => api.post('/products', product),
    update: (id, product) => api.put(`/products/${id}`, product),
    deactivate: (id, reason) => api.patch(`/products/deactivate/${id}`, { reason }),
    activate: (id) => api.patch(`/products/activate/${id}`),
};

// Orders
export const ordersAPI = {
    // Pedido normal (sem entrega)
    create: (order) => api.post('/orders/create', order),

    // Pedido com entrega
    createWithDelivery: (orderWithDelivery) => api.post('/orders/create-delivery', orderWithDelivery),

    // Buscar todos pedidos com filtros e paginação
    getAll: (filters = {}, pageNumber = 1, pageSize = 10) => {
        const params = { ...filters, pageNumber, pageSize };
        return api.get('/orders', { params });
    },

    // Buscar pedido por id
    getById: (id) => api.get(`/orders/${id}`),

    // Atualizar status
    updateStatus: (id, statusData) => api.patch(`/orders/${id}/status`, statusData),

    // Cancelar pedido
    cancel: (id) => api.delete(`/orders/${id}`),

    // Estatísticas de entregas
    getDeliveryStats: () => api.get('/orders/stats'),
};

export default api;
