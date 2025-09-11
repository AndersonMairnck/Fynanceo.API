import React, { createContext, useState, useContext, useEffect } from 'react';

import { authAPI } from '../services/api';
const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(false); // Não precisa de loading complexo

    useEffect(() => {
        // Ao carregar a aplicação, recupera user e token do localStorage
        const savedToken = localStorage.getItem('token');
        const savedUser = localStorage.getItem('user');

        if (savedToken && savedUser) {
            setToken(savedToken);
            setUser(JSON.parse(savedUser));
        }
    }, []);

    const login = async (credentials) => {
        try {
            console.log('📧 Tentando login...');
            const response = await authAPI.login(credentials);

            if (response.status !== 200) {
                throw new Error(`Erro HTTP: ${response.status}`);
            }

            if (!response.data) {
                throw new Error('Resposta da API vazia');
            }

            console.log('✅ Resposta do login:', response.data);

            const { token: newToken, user: userData } = response.data;

            if (!newToken || !userData) {
                throw new Error('Dados incompletos na resposta');
            }

            localStorage.setItem('token', newToken);
            localStorage.setItem('user', JSON.stringify(userData));

            setToken(newToken);
            setUser(userData);

            return response;
        } catch (error) {
            console.error('❌ Erro completo no login:', error);

            let errorMessage = 'Erro no login';

            if (error.response) {
                // Erro da API (4xx, 5xx)
                errorMessage = error.response.data?.message || `Erro ${error.response.status}`;
            } else if (error.request) {
                // Erro de rede (API offline)
                errorMessage = 'Servidor indisponível. Tente novamente.';
            } else {
                // Outros erros
                errorMessage = error.message;
            }

            throw new Error(errorMessage);
        }
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    const value = {
        user,
        token,
        login,
        logout,
        isAuthenticated: !!user && !!token,
        loading: false // Simplesmente não use loading complexo
    };

    return (
        <AuthContext.Provider value={value}>
            {children} {/* Remove a verificação de loading */}
        </AuthContext.Provider>
    );
};