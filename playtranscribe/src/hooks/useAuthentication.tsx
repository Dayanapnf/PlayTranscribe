// src/hooks/useAuthentication.ts
import { auth } from '../firebase/config'; 
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, updateProfile, signOut, User } from 'firebase/auth';
import { useState, useEffect } from 'react';

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

  function checkIfIsCancelled(): void {
    if (cancelled) {
      return;
    }
  }
  const createUser = async (data: AuthData): Promise<User | void> => {
    checkIfIsCancelled();

    setLoading(true);

    try {
      // Cria um usuário com e-mail e senha usando Firebase Auth
      const { user } = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password
      );

      // Atualiza o perfil do usuário com o nome fornecido
      if (data.displayName) {
        await updateProfile(user, {
          displayName: data.displayName,
        });
      }

      return user;
    } catch (error: any) {
      let systemErrorMessage: string;

      if (error.message.includes('Password')) {
        systemErrorMessage = 'A senha precisa conter pelo menos 6 caracteres.';
      } else if (error.message.includes('email-already')) {
        systemErrorMessage = 'E-mail já cadastrado.';
      } else {
        systemErrorMessage = 'Ocorreu um erro, por favor tente mais tarde.';
      }

      setError(systemErrorMessage);
    }

    setLoading(false);
  };

  const logout = (): void => {
    checkIfIsCancelled();
    signOut(auth);
  };

  const login = async (data: AuthData): Promise<User | null> => {
    checkIfIsCancelled();

    setLoading(true);
    setError(null);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
      return userCredential.user;
    } catch (error) {
      let systemErrorMessage;
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
    auth,
    createUser,
    error,
    logout,
    login,
    loading,
  };
};
