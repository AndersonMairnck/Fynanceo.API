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
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor para tratar erros de autenticação
api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export const authAPI = {
    login: (credentials) => api.post('/auth/login', credentials),
    register: (userData) => api.post('/auth/register', userData),
    //verifyToken: () => api.get('/auth/verify'),
};

export const productsAPI = {
    getAll: () => api.get('/products'),
    getById: (id) => api.get(`/products/${id}`),
    create: (product) => api.post('/products', product),
    update: (id, product) => api.put(`/products/${id}`, product),
    deactivate: (id, reason) => api.patch(`/products/deactivate/${id}`, { reason }),
    activate: (id) => api.patch(`/products/activate/${id}`),
};
export const ordersAPI = {
    getAll: () => api.get('/orders'),
    getById: (id) => api.get(`/orders/${id}`),
    create: (order) => api.post('/orders', order),
    updateStatus: (id, statusData) => api.patch(`/orders/${id}/status`, statusData),
    cancel: (id) => api.delete(`/orders/${id}`),
};
export default api;