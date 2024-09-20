import { useState } from 'react';
import axios from 'axios';
import { getAuth } from 'firebase/auth';
import { toast } from 'react-toastify';

const useTranscription = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const getFirebaseToken = async () => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (user) {
      return await user.getIdToken();
    } else {
      throw new Error('Usuário não está autenticado.');
    }
  };

  const transcribeVideo = async (videoUrl: string, transcriptId: string) => {
    setIsLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const token = await getFirebaseToken(); // Obtém o token

      const response = await axios.post('http://localhost:5000/api/auth/transcribe', {
        videoUrl,
        transcriptId,
      }, {
        headers: {
          'Authorization': `Bearer ${token}` // Inclui o token no cabeçalho
        }
      });

      if (response.status === 200) {
        setSuccess('Transcrição concluída com sucesso!');
        toast("Transcrição Concluída")
 
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido.';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return { transcribeVideo, isLoading, error, success };
};

export default useTranscription;
