import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css'; 
import iconePlayTranscribe from '../../assets/LOGO_TRANSCRICAO.png'; 
import { useAuthValue } from '../../context/AuthContext';
import VideoUpload from '../../components/VideoUpload'; 

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthValue();
  const userId = user?.uid;
  const userName = user?.displayName || 'Usuário';

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  if (!user) {
    return (
      <div className={styles.container}>
        <div className={styles.leftColumn}>
          <h1>Converter vídeo para texto</h1>
          <p>O melhor conversor de vídeo para texto online. PlayTranscribe transcreve automaticamente vídeos em texto editável e compartilhável.</p>
          <button className={styles.enterButton} onClick={handleLoginRedirect}>Transcrever vídeo</button>
        </div>
        <div className={styles.rightColumn}>
          <div className={styles.logo_container}>
            <i style={{ "--color": "#1f2b37" } as React.CSSProperties}></i>
            <i style={{ "--color": "#28323c" } as React.CSSProperties}></i>
            <i style={{ "--color": "#4de0fe" } as React.CSSProperties}></i>
            <img src={iconePlayTranscribe} alt="Logo PlayTranscribe" className={styles.logo} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container_user}>
      <div className={styles.header}>
        <h1>Bem-vindo, {userName}!</h1>
        <p>Suba seu vídeo para transcrição.</p>
      </div>

      <div className={styles.uploadSection}>
        {/* Aqui é onde o componente de upload será renderizado */}
        <VideoUpload userId={userId!} />
      </div>
    </div>
  );
};

export default Home;
