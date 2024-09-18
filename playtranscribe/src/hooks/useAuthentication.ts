import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, signOut, User } from 'firebase/auth';
import { useState, useEffect } from 'react';
import { useAuthValue } from '../context/AuthContext';
import { auth, db } from '../firebase/config'; 
import { setDoc, doc } from 'firebase/firestore';

// Tipos para os dados de entrada
interface AuthData {
  email: string;
  password: string;
  displayName?: string;
}

export const useAuthentication = () => {
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [cancelled, setCancelled] = useState<boolean>(false);
  const { setUser } = useAuthValue();

  function checkIfIsCancelled(): void {
    if (cancelled) {
      return;
    }
  }

  const createUser = async ({ displayName, email, password }: { displayName: string, email: string, password: string }) => {
    try {
      // Cria o usuário com email e senha
      const res = await createUserWithEmailAndPassword(auth, email, password);
      const user = res.user;

      // Atualiza o perfil do usuário com o nome de exibição
      await updateProfile(user, { displayName });

      // Adiciona o usuário à coleção "users" no Firestore
      await setDoc(doc(db, "users", user.uid), {
        displayName,
        email,
        createdAt: new Date(),
      });

      return res;
    } catch (error) {
      console.error("Erro ao criar usuário:", error);
      throw new Error("Erro ao criar conta");
    }
  };

  

  const logout = async (): Promise<void> => {
    checkIfIsCancelled();
    try {
      await signOut(auth);
      setUser(null); // Atualiza o usuário no contexto
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const login = async (data: AuthData): Promise<User | null> => {
    checkIfIsCancelled();
    setLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      setUser(userCredential.user); // Atualiza o usuário no contexto
      return userCredential.user;
    } catch (error) {
      let systemErrorMessage: string;

      if (error instanceof Error) {
        if (error.message.includes('auth/invalid-credential')) {
          systemErrorMessage = 'Dados incorretos';
        } else {
          systemErrorMessage = 'Ocorreu um erro, por favor tente mais tarde.';
        }
        setError(systemErrorMessage);
      }
      return null;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    return () => setCancelled(true);
  }, []);

  return {
    createUser,
    error,
    logout,
    login,
    loading,
  };
};
