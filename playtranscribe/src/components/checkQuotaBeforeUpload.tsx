import axios from 'axios';
import { toast } from 'react-toastify';

// Definição de tipos para os parâmetros da função
interface FileType {
  size: number;
}

interface CheckQuotaResponse {
  canUpload: boolean;
  message: string;
}

// Função para verificar a cota antes do upload
const checkQuotaBeforeUpload = async (userId: string, file: FileType): Promise<boolean> => {
  try {
    const fileSizeInBytes = file.size; // Obtém o tamanho do arquivo que será enviado
    
    // Faz a requisição para o backend para verificar a cota
    const response = await axios.post<CheckQuotaResponse>('/api/check-quota', {
      userId: userId,
      fileSizeInBytes: fileSizeInBytes,
    });

    // Se o usuário puder fazer o upload, retorna true
    if (response.data.canUpload) {
      return true;
    } else {
      toast.error(response.data.message);
      return false;
    }
  } catch (error) {
    console.error('Erro ao verificar a cota:', error);
    toast.error('Erro ao verificar a cota. Tente novamente mais tarde.');
    return false;
  }
};

// Função que chama a verificação antes de fazer o upload
const handleUpload = async (userId: string, file: FileType) => {
  const canUpload = await checkQuotaBeforeUpload(userId, file);

  if (canUpload) {
    // Proceder com o upload do arquivo
    console.log('Fazendo upload...');
    // Código para fazer o upload do arquivo vai aqui...
  } else {
    console.log('Upload bloqueado, limite de cota excedido.');
  }
};
