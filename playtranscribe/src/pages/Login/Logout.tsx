import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Logout.module.css'

const Logout: React.FC = () => {
  const { setUser } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      
      
      // Remove o token do localStorage
      localStorage.removeItem('token');
      
      // Atualiza o estado do usuário no contexto
      setUser(null);
      
      // Redireciona para a página de login
      navigate('/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <button className={styles.logoutButton} onClick={handleLogout}>
      Sair
    </button>
  );
};

export default Logout;
