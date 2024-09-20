import React, { useState } from 'react';
import { toast } from 'react-toastify';
import useVideoUpload from '../hooks/useVideoUpload';
import styles from './VideoUpload.module.css';

const VideoUpload: React.FC = () => {
  const [file, setFile] = useState<File | null>(null);
  const { uploadVideo, isLoading, error, success } = useVideoUpload();

  // Função de validação do tipo de arquivo usando a extensão
  const validateFile = (file: File) => {
    const allowedExtensions = ['mp3', 'mp4'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase(); // Pega a extensão do arquivo

    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      toast.error('Formato inválido. Apenas arquivos MP3 ou MP4 são permitidos.');
      return false;
    }
    return true;
  };

  // Função para lidar com a seleção de arquivo
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile && validateFile(selectedFile)) {
      setFile(selectedFile); // Só armazena o arquivo se for válido
    } else {
      setFile(null); // Limpa o estado caso o arquivo não seja válido
    }
  };

  // Função para fazer o upload do arquivo
  const handleUpload = async () => {
    if (file) {
      const result = await uploadVideo(file);
      if (result === null) {
        console.error('Falha no upload do vídeo.'); // Mensagem de erro genérica
      }
    } else {
      toast.error('Por favor, selecione um arquivo válido para enviar.');
    }
  };

  // Exibir toasts de erro ou sucesso, se existirem
  if (error) {
    toast.error(error);
  }

  if (success) {
    toast.success(success);
  }

  return (
    <div className={styles.inputContainer}>
      <input
        placeholder="Envie seu vídeo ou áudio"
        className={styles.input_up}
        type="file"
        accept=".mp3,.mp4"
        onChange={handleFileChange}
      />
      <button
        className={styles.uploadButton}
        onClick={handleUpload}
        disabled={isLoading || !file} // Desabilita o botão se estiver carregando ou não houver arquivo
      >
        {isLoading ? 'Carregando...' : 'Transcrever'}
      </button>
    </div>
  );
};

export default VideoUpload;
