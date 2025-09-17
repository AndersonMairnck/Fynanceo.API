// src/services/CustomerService.js
import api from './api';

class CustomerService {
    async getAllCustomers() {
        try {
            const response = await api.get('/customers');
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar clientes:', error);
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.title ||
                'Erro ao buscar clientes';
            throw new Error(errorMessage);
        }
    }

    async getCustomerById(id) {
        try {
            const response = await api.get(`/customers/${id}`);
            return response.data;
        } catch (error) {
            console.error('Erro ao buscar cliente:', error);
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.title ||
                'Erro ao buscar cliente';
            throw new Error(errorMessage);
        }
    }

    // src/services/CustomerService.js
    async createCustomer(customerData) {
        try {
            console.log('Dados sendo enviados para API:', customerData);
            const response = await api.post('/customers', customerData);
            return response.data;
        } catch (error) {
            console.error('Erro ao criar cliente:', error);
            console.error('Dados enviados:', customerData);
            console.error('Resposta completa do erro:', error.response);

            // Log detalhado dos dados de erro
            if (error.response?.data) {
                console.error('Dados do erro:', error.response.data);
                console.error('Errors property:', error.response.data.errors);
                console.error('Message property:', error.response.data.message);
                console.error('Title property:', error.response.data.title);
            }

            let errorMessage = 'Erro ao criar cliente';

            if (error.response?.data?.errors) {
                // Se houver erros de validação específicos
                const validationErrors = Object.entries(error.response.data.errors)
                    .map(([field, errors]) => `${field}: ${errors.join(', ')}`)
                    .join('; ');
                errorMessage = validationErrors || errorMessage;
            } else if (error.response?.data?.message) {
                errorMessage = error.response.data.message;
            } else if (error.response?.data?.title) {
                errorMessage = error.response.data.title;
            }

            throw new Error(errorMessage);
        }
    }

    async deleteCustomer(id) {
        try {
            const response = await api.delete(`/customers/${id}`);
            return response.data;
        } catch (error) {
            console.error('Erro ao deletar cliente:', error);
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.title ||
                'Erro ao deletar cliente';
            throw new Error(errorMessage);
        }
    }

    //async updateCustomer(id) {
    //    try {
    //        const response = await api.get(`/customers/${id}`);
    //        return response.data;
    //    } catch (error) {
    //        console.error('Erro ao buscar cliente:', error);
    //        const errorMessage = error.response?.data?.message ||
    //            error.response?.data?.title ||
    //            'Erro ao buscar cliente';
    //        throw new Error(errorMessage);
    //    }
    //}
    async updateCustomer(id, customerData) {
        try {
            const response = await api.put(`/customers/${id}`, customerData);
            return response.data;
        } catch (error) {
            console.error('Erro ao atualizar cliente:', error);
            const errorMessage = error.response?.data?.message ||
                error.response?.data?.title ||
                'Erro ao atualizar cliente';
            throw new Error(errorMessage);
        }
    }


}

export default new CustomerService();