import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import styles from './NavBar.module.css'; 
import { useAuthentication } from '../../hooks/useAuthentication';
import { useAuthValue } from '../../context/AuthContext';
import iconePlayTranscribe from '../../assets/LOGO_TRANSCRICAO.png'; 

const NavBar: React.FC = () => {
  const { user } = useAuthValue();
  const { logout } = useAuthentication();
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = React.useState<boolean>(false);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    await logout();
    setIsLoggingOut(false);
    navigate("/"); 
  };

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
        {!user && (
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
        )}
        <li>
          <NavLink to="/about" className={({ isActive }) => (isActive ? styles.active : '')}>
            Sobre
          </NavLink>
        </li>
        {user && (
          <>
            <li>
              <NavLink to="/dashboard" className={({ isActive }) => (isActive ? styles.active : '')}>
                Dashboard
              </NavLink>
            </li>
            <li>
              <button 
                onClick={handleLogout} 
                className={styles.logoutButton}
                disabled={isLoggingOut}
              >
                {isLoggingOut ? 'Saindo...' : 'Sair'}
              </button>
            </li>
          </>
        )}
        
      </ul>
    </nav>
  );
};

export default NavBar;
