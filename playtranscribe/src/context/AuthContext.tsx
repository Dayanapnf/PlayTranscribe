import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import axios from 'axios';
import {jwtDecode} from 'jwt-decode'; // Corrigido para usar import padrão
import { db } from '../firebase/config'; // Certifique-se de importar sua configuração do Firebase
import { doc, getDoc } from 'firebase/firestore'; 
interface User {
  uid: string;
  email: string;
  name?: string; 
}

interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  loading: boolean;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');

    if (token) {
      try {
        // Decodifica o JWT
        const decodedUser = jwtDecode(token) as User; 
        setUser({
          uid: decodedUser.uid,
          email: decodedUser.email,
          name: decodedUser.name, 
        });
        console.log("NOME"+ user?.name);

        // Opcional: Verifica a validade do token com o backend
        axios.get('http://localhost:5000/api/auth/verify', {
          headers: { Authorization: `Bearer ${token}` }
        })
        .then(response => {
          if (!response.data.success) {
            localStorage.removeItem('token');
            setUser(null);
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
          setError('Não foi possível verificar o token.');
        });
      } catch (error) {
        setError('Token inválido.');
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    } else {
      setLoading(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, setUser, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para acessar o contexto (opcional)
const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { AuthProvider, useAuth };
