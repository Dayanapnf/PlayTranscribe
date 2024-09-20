import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.css'; 
import iconePlayTranscribe from '../../assets/LOGO_TRANSCRICAO.png'; 
import { useAuth } from '../../context/AuthContext';
import VideoUpload from '../../components/VideoUpload'; 

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  

  const handleLoginRedirect = () => {
    navigate('/login');
  };

  if (!user) {
    // Se o usuário não estiver autenticado
    return (
      <div className={styles.container}>
        <div className={styles.leftColumn}>
          <h1>Converta vídeos e áudios para texto</h1>
          <p>O melhor conversor de MP4 e MP3  para texto online. PlayTranscribe transcreve automaticamente suas mídias em texto.</p>
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

  // Se o usuário estiver autenticado
  return (
    <div className={styles.container_logado}>
        <h1 className={styles.h1_log}>Transcreva suas mídias </h1>
        <p className={styles.p_home}>Faça o upload e baixe o donwload da transcrição!</p>
        
        
           
            <VideoUpload/>
        
        
        <p className={styles.terms}>
            Ao fazer a transcrição você concorda com as <a href="#">Diretrizes de Uso.</a>
        </p>
    </div>
      
   
  );
};


export default Home;
