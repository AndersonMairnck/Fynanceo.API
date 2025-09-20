import React, { createContext, useState, useContext } from 'react';

// Criar o contexto
export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const login = async (email, password) => {
        setLoading(true);
        setError(null);

        try {
            console.log('📧 Tentando login...', { email });

            const response = await fetch('http://localhost:5000/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: email.trim(),
                    password: password.trim()
                }),
            });

            console.log('📋 Status da resposta:', response.status);

            const responseData = await response.json();
            console.log('📦 Dados da resposta:', responseData);

            if (response.ok) {
                console.log('✅ Login bem-sucedido');

                setToken(responseData.token);
                setUser(responseData.user);
                localStorage.setItem('token', responseData.token);

                return responseData;
            } else {
                // Capturar mensagem de erro específica do backend
                const errorMessage = responseData.message ||
                    responseData.error ||
                    `Erro no login (${response.status})`;
                console.error('❌ Erro do servidor:', errorMessage);
                throw new Error(errorMessage);
            }
        } catch (error) {
            console.error('❌ Erro no login:', error);

            let errorMessage = 'Erro de conexão';
            if (error.name === 'TypeError') {
                errorMessage = 'Não foi possível conectar ao servidor';
            } else if (error.message) {
                errorMessage = error.message;
            }

            setError(errorMessage);
            throw new Error(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        setToken(null);
        setUser(null);
        setError(null);
        localStorage.removeItem('token');
    };

    const clearError = () => {
        setError(null);
    };

    const value = {
        token,
        user,
        loading,
        error,
        login,
        logout,
        clearError
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

// Hook personalizado para usar o contexto
export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth deve ser usado dentro de um AuthProvider');
    }
    return context;
};