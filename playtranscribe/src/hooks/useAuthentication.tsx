import { db } from '../firebase/config';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  User,
} from 'firebase/auth';
import { useState, useEffect } from 'react';

// Tipos para os dados de entrada
interface AuthData {
  email: string;
  password: string;
  displayName?: string;
}

// Hook personalizado para gerenciar autenticação de usuários
export const useAuthentication = () => {
  // Estado para gerenciar erros
  const [error, setError] = useState<string | null>(null);
  // Estado para gerenciar o carregamento de operações assíncronas
  const [loading, setLoading] = useState<boolean>(false);
  // Estado para evitar vazamento de memória (componente desmontado)
  const [cancelled, setCancelled] = useState<boolean>(false);

  // Inicializa o objeto de autenticação do Firebase
  const auth = getAuth();

  // Função para verificar se a operação deve ser cancelada
  function checkIfIsCancelled() {
    if (cancelled) {
      return; // Sai da função se o componente estiver desmontado
    }
  }

  // Função assíncrona para criar um novo usuário
  const createUser = async (data: AuthData): Promise<User | void> => {
    checkIfIsCancelled(); // Evita continuar se o componente estiver desmontado

    setLoading(true); // Indica que a operação está em andamento

    try {
      // Cria um usuário com e-mail e senha usando Firebase Auth
      const { user } = await createUserWithEmailAndPassword(
        auth,
        data.email,
        data.password,
      );

      // Atualiza o perfil do usuário com o nome fornecido
      if (data.displayName) {
        await updateProfile(user, {
          displayName: data.displayName,
        });
      }

      return user; // Retorna o usuário criado com sucesso
    } catch (error) {
      // Tratamento de erros específicos com base na mensagem de erro retornada
      let systemErrorMessage;

      if (error instanceof Error) {
        if (error.message.includes('Password')) {
          systemErrorMessage = 'A senha precisa conter pelo menos 6 caracteres.';
        } else if (error.message.includes('email-already')) {
          systemErrorMessage = 'E-mail já cadastrado.';
        } else {
          systemErrorMessage = 'Ocorreu um erro, por favor tenta mais tarde.';
        }

        // Define o estado de erro com a mensagem apropriada
        setError(systemErrorMessage);
      }
    }

    setLoading(false); // Finaliza o estado de carregamento
  };

  // Função para deslogar o usuário
  const logout = () => {
    checkIfIsCancelled(); // Verifica o estado antes de prosseguir

    signOut(auth); // Desloga o usuário do Firebase Auth
  };

  // Função assíncrona para logar o usuário
  const login = async (data: AuthData): Promise<void> => {
    checkIfIsCancelled(); // Verifica o estado de cancelamento

    setLoading(true); // Define o estado de carregamento
    setError(null); // Reseta o estado de erro

    try {
      // Loga o usuário com e-mail e senha
      await signInWithEmailAndPassword(auth, data.email, data.password);
    } catch (error) {
      let systemErrorMessage;
      // Identifica e define mensagens de erro específicas para o usuário
      if (error instanceof Error) {
        if (error.message.includes('auth/invalid-credential')) {
          systemErrorMessage = 'Dados incorretos';
        } else {
          systemErrorMessage = 'Ocorreu um erro, por favor tenta mais tarde.';
        }

        setError(systemErrorMessage); // Atualiza o estado de erro
      }
    }

    setLoading(false); // Finaliza o estado de carregamento
  };

  // useEffect para garantir que setCancelled é definido como true quando o componente desmontar
  useEffect(() => {
    return () => setCancelled(true);
  }, []);

  // Retorna as funções e estados relevantes para uso no componente
  return {
    auth,
    createUser,
    error,
    logout,
    login,
    loading,
  };
};
