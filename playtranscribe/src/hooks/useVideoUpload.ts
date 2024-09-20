import { useState } from 'react';
import { toast } from 'react-toastify';
import { getAuth } from 'firebase/auth';
import axios from 'axios';
import useTranscription from './useTranscription';
import { useNavigate } from 'react-router-dom';

const useVideoUpload = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const { transcribeVideo } = useTranscription();
  const navigate = useNavigate();
  const MAX_FILE_SIZE = 25 * 1024 * 1024;

  const getFirebaseToken = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      return await user.getIdToken();
    } else {
      throw new Error('Usuário não está autenticado.');
    }
  };

  const checkQuota = async (fileSize: number) => {
    const token = await getFirebaseToken();

    try {
      const response = await axios.post('http://localhost:5000/api/auth/check-quota', {
        fileSizeInBytes: fileSize,
      }, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      return response.data.canUpload;
    } catch (err) {
      console.error('Erro ao verificar cota:', err);
      throw new Error('Erro ao verificar cota.');
    }
  };

  const uploadVideo = async (file: File) => {
    if (file.size > MAX_FILE_SIZE) {
      toast.error('O arquivo é muito grande! O tamanho máximo permitido é 25MB.');
      return null;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const canUpload = await checkQuota(file.size);
      if (!canUpload) {
        toast.error("Limite de cota diária excedido. Tente novamente amanhã.");
        return null;
      }

      toast.info('Upload iniciado. A transcrição será processada.');
      const token = await getFirebaseToken();
      const formData = new FormData();
      formData.append('video', file);

      const uploadResponse = await axios.post('http://localhost:5000/api/auth/upload', formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      if (uploadResponse.status === 200) {
        setSuccess('Upload bem-sucedido!');
        toast.success('Upload bem-sucedido!');
        navigate('/dashboard');
        const videoUrl = uploadResponse.data.videoUrl;
        const transcriptId = uploadResponse.data.transcriptId;

        await transcribeVideo(videoUrl, transcriptId);
        return true; 
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
      console.error('Erro ao fazer upload:', errorMessage);
      setError(errorMessage);
      toast.error(errorMessage); // Adicione toast para erro
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  return { uploadVideo, isLoading, error, success };
};

export default useVideoUpload;
