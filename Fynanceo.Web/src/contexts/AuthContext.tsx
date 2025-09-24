import React, { createContext, useState, useContext, ReactNode } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  // adicione outras propriedades do usuário conforme necessário
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
  error: string | null;
  clearError: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
					 
				   

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const login = async (email: string, password: string) => {
          const response = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      console.log("📋 Status da resposta:", response.status);

      const responseData = await response.json();
      console.log("📦 Dados da resposta:", responseData);

      if (response.ok) {
        console.log("✅ Login bem-sucedido");

        setToken(responseData.token);
        setUser(responseData.user);
        localStorage.setItem("token", responseData.token);

        return responseData;
      } else {
        // Capturar mensagem de erro específica do backend
        const errorMessage =
          responseData.message ||
          responseData.error ||
          `Erro no login (${response.status})`;
        console.error("❌ Erro do servidor:", errorMessage);
        throw new Error(errorMessage);
      }
    } catch (error) {
      console.error("❌ Erro no login:", error);

      let errorMessage = "Erro de conexão";
      if (error.name === "TypeError") {
        errorMessage = "Não foi possível conectar ao servidor";
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
    localStorage.removeItem("token");   
									 
  };

  const clearError = () => setError(null);
				   
	

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error, clearError }}>
		 
			
		  
		  
		   
			   
	

      {children}
    </AuthContext.Provider>
  );
};

										  
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
