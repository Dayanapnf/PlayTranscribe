// Função para solicitar a transcrição do vídeo ao backend
export const requestTranscription = async (videoUrl: string, userId: string) => {
  try {
    const response = await fetch(`http://localhost:5000/transcribe`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ videoUrl, userId }), // Enviando URL do vídeo e ID do usuário
    });

    if (!response.ok) {
      const errorText = await response.text(); // Ler a resposta do erro
      throw new Error(`Erro ao solicitar transcrição: ${errorText}`);
    }

    const data = await response.text(); // Ajuste conforme o retorno do endpoint
    return data;
  } catch (error) {
    console.error('Erro ao solicitar a transcrição:', error);
    throw new Error('Transcrição falhou.');
  }
};
