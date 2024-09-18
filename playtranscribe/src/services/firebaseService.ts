import { storage, db } from "../firebase/config";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { doc, collection, addDoc } from "firebase/firestore";

// Função para fazer o upload do vídeo para o Firebase Storage
export const uploadVideoToFirebase = async (file: File, userId: string) => {
  const storageRef = ref(storage, `videos/${userId}/${file.name}`);
  const uploadTask = uploadBytesResumable(storageRef, file);

  return new Promise<string>((resolve, reject) => {
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        // Progresso do upload (opcional)
      },
      (error) => {
        reject(error); // Rejeitar em caso de erro
      },
      async () => {
        const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
        resolve(downloadUrl); // Resolvido com o URL de download
      }
    );
  });
};

// Função para notificar o backend para iniciar a transcrição
export const notifyBackendForTranscription = async (videoUrl: string, userId: string) => {
  try {
    const response = await fetch("http://localhost:5000/upload", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ videoUrl, userId }),
    });

    if (!response.ok) {
      throw new Error("Erro ao notificar o backend para transcrição");
    }

    const data = await response.json();
    return data.transcriptionId; // Retorna o ID da transcrição
  } catch (error) {
    console.error("Erro ao notificar o backend:", error);
    throw new Error("Erro ao notificar o backend");
  }
};
