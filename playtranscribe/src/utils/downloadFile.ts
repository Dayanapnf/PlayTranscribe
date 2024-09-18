// utils/downloadFile.ts
export const fetchFileFromUrl = async (url: string): Promise<File> => {
  const response = await fetch(url);
  const blob = await response.blob();
  
  // Convertendo o Blob para um objeto File, necessário para o OpenAI
  const fileName = url.split('/').pop() || "video-file";
  const file = new File([blob], fileName, { type: blob.type });
  
  return file;
};
