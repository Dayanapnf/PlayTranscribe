import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase/config'; // Certifique-se de importar a configuração do Firebase correta

// Defina a interface do contexto
interface AuthContextType {
  user: User | null;
  setUser: (user: User | null) => void;
}

// Crie o contexto com valor padrão
const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

// O AuthProvider fornece o contexto para seus filhos
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser); // Atualiza o estado do usuário com o estado persistido
      setLoading(false); // Finaliza o carregamento após verificar o estado do usuário
    });

    return () => unsubscribe(); // Limpa o ouvinte ao desmontar o componente
  }, []);

  if (loading) {
    return <p>Carregando...</p>; // Opcional: pode colocar um loading spinner ou mensagem de carregamento
  }

  return (
    <AuthContext.Provider value={{ user, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook customizado para usar o AuthContext
export const useAuthValue = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthValue must be used within an AuthProvider');
  }
  return context;
};
