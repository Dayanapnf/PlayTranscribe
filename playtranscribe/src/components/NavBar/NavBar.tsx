import React, { useContext } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; // Importa o contexto
import styles from './NavBar.module.css';
import iconePlayTranscribe from '../../assets/LOGO_TRANSCRICAO.png';
import Logout from '../../pages/Login/Logout'; 

const Navbar = () => {
  const { user, loading, error } = useAuth(); // Usa o contexto
  const navigate = useNavigate();

  if (loading) {
    return <div>Carregando...</div>; // Exibe mensagem de carregamento
  }

  return (
    <nav className={styles.navbar}>
      <NavLink to="/" className={styles.logoNav}>
        <div className={styles.logo}>
          <img
            src={iconePlayTranscribe}
            alt="Ícone PlayTranscribe"
            className={styles.icon}
          />
          <span className={styles.title}>PlayTranscribe</span>
        </div>
      </NavLink>
      <ul className={styles.navLinks}>
        <li>
          <NavLink to="/" className={({ isActive }) => (isActive ? styles.active : '')}>
            Home
          </NavLink>
        </li>
        {!user ? (
          <>
            <li>
              <NavLink to="/login" className={({ isActive }) => (isActive ? styles.active : '')}>
                Entrar
              </NavLink>
            </li>
            <li>
              <NavLink to="/criar-conta" className={({ isActive }) => (isActive ? styles.active : '')}>
                Cadastrar
              </NavLink>
            </li>
          </>
        ) : (
          <>
            <li>
              <NavLink to="/dashboard" className={({ isActive }) => (isActive ? styles.active : '')}>
                Dashboard
              </NavLink>
            </li>
            <li>
              <Logout /> {/* Use o componente Logout aqui */}
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
