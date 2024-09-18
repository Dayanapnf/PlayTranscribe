import { useState } from 'react';
import { uploadVideoToFirebase } from '../services/firebaseService';
import { requestTranscription } from '../services/transcriptionService';

const useVideoUpload = () => {
  const [isUploading, setIsUploading] = useState(false);

  const uploadAndTranscribe = async (file: File, userId: string) => {
    try {
      if (file.size > 25 * 1024 * 1024) {
        alert('O arquivo de vídeo excede o limite de 25MB.');
        return;
      }

      setIsUploading(true);

      // Log do início do upload
      console.log('Iniciando upload do vídeo...');
      const videoUrl = await uploadVideoToFirebase(file, userId);
      console.log('Upload concluído. URL do vídeo:', videoUrl);

      // Log do início da transcrição
      console.log('Iniciando transcrição do vídeo...');
      const transcriptionId = await requestTranscription(videoUrl, userId);
      console.log('Transcrição iniciada. ID da transcrição:', transcriptionId);

      alert('Upload e transcrição bem-sucedidos!');
    } catch (error) {
      console.error('Erro ao fazer upload e transcrição:', error);
      alert('Erro durante o upload ou a transcrição.');
    } finally {
      setIsUploading(false);
    }
  };

  return { uploadAndTranscribe, isUploading };
};

export default useVideoUpload;
