import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import styles from './TranscriptionView.module.css'; // Importando o arquivo de estilo

const TranscriptionView: React.FC = () => {
  const location = useLocation();
  const { transcription } = location.state || {}; // Pega os dados da transcrição do estado
  const [transcriptionData, setTranscriptionData] = useState<any>(transcription);

  useEffect(() => {
    if (!transcriptionData) {
      
      toast.error('Transcrição não encontrada.'); // Mensagem de erro
    }
  }, [transcriptionData]);

  if (!transcriptionData) return <p>Carregando...</p>;

  return (
    <div className={styles.scroll_container}>
      <div className={styles.transcription_container}>
        <h1>Visualização da Transcrição</h1>
        <video className={styles.transcription_video} controls src={transcriptionData.videoUrl} />
        <h2>Transcrição:</h2>
        <p>{transcriptionData.transcription}</p>
      </div>
      
    </div>
  );
};

export default TranscriptionView;
