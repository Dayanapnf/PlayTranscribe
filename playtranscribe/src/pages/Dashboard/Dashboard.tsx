import React, { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, Timestamp } from 'firebase/firestore'; 
import { db, auth } from '../../firebase/config'; 
import { onAuthStateChanged } from 'firebase/auth';
import styles from './Dashboard.module.css';
import { Link } from 'react-router-dom';

interface Transcricao {
  id: string;
  video: string;
  createdAt: Date;
  status: 'pending' | 'completed';
  transcription: string;
  videoUrl: string;
}

interface Quota {
  usedQuotaMB: number;
  dailyQuota?: number;
}

const formatDate = (date: Date): string => {
  const day = date.getDate().toString().padStart(2, '0');
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  return `${day}/${month}`;
};

const DashboardPage: React.FC = () => {
  const [transcricoes, setTranscricoes] = useState<Transcricao[]>([]);
  const [usoTotalMB, setUsoTotalMB] = useState(0);
  const [limiteMB, setLimiteMB] = useState(30);
  const [userId, setUserId] = useState<string | null>(null);

  const fetchTranscricoes = (userId: string) => {
    const transcricoesRef = collection(doc(db, 'users', userId), 'transcriptions');

    const unsubscribe = onSnapshot(transcricoesRef, (snapshot) => {
      const transcricoesList: Transcricao[] = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        const createdAt = data.createdAt ? (data.createdAt as Timestamp).toDate() : new Date();
        const bucketName = 'playtranscribe.appspot.com'; // Insira o nome do seu bucket
         // Obter apenas o caminho relativo do vídeo a partir da URL
         const videoUrl = data.videoUrl || '';
         const videoPath = videoUrl.replace(/^https:\/\/storage.googleapis.com\/[^\/]+\/(.+)$/, '$1'); // Extrai o caminho relativo
 
         // Gerar a URL corretamente
         const formattedVideoUrl = `https://firebasestorage.googleapis.com/v0/b/${bucketName}/o/${encodeURIComponent(videoPath)}?alt=media`;

        transcricoesList.push({
          id: doc.id,
          video: data.videoName || 'N/A',
          createdAt,
          status: data.status || 'pending',
          transcription: data.transcription || '',
          videoUrl: formattedVideoUrl
        });
      });
      setTranscricoes(transcricoesList);
    });

    return unsubscribe;
  };

  const fetchQuota = (userId: string) => {
    const quotaRef = doc(db, 'users', userId, 'quota', 'dailyQuota');

    const unsubscribe = onSnapshot(quotaRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as Quota;
        setUsoTotalMB(data.usedQuotaMB || 0);
        setLimiteMB(data.dailyQuota || 30);
      } else {
        console.log('Documento de quota não encontrado.');
      }
    });

    return unsubscribe;
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        setUserId(user.uid);
      }
    });

    return () => unsubscribe();
  }, []); 

  useEffect(() => {
    let unsubscribeTranscricoes: (() => void) | undefined;
    let unsubscribeQuota: (() => void) | undefined;

    if (userId) {
      unsubscribeTranscricoes = fetchTranscricoes(userId);
      unsubscribeQuota = fetchQuota(userId);
    }

    return () => {
      if (unsubscribeTranscricoes) unsubscribeTranscricoes();
      if (unsubscribeQuota) unsubscribeQuota();
    };
  }, [userId]);

  const handleDownload = (id: string) => {
    const docRef = doc(db, 'users', userId || '', 'transcriptions', id);

    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        const transcriptionText = data?.transcription || 'Transcrição não disponível';

        const blob = new Blob([transcriptionText], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);

        const a = document.createElement('a');
        a.href = url;
        a.download = `${id}.txt`;
        a.click();
        
        URL.revokeObjectURL(url);
      } else {
        alert('Documento não encontrado.');
      }
    });

    return () => {
      unsubscribe();
    };
  };

  return (
    <div className={styles.container}>
      <div className={styles.transcricoesContainer}>
        <h2>Uso Total</h2>
        <div className={styles.progressBarContainer}>
          <div
            className={styles.progressBar}
            style={{ width: `${Math.min((usoTotalMB / limiteMB) * 100, 100)}%` }}
          />
        </div>
        <p>Uso total: {usoTotalMB.toFixed(1)} MB de {limiteMB} MB</p>
      </div>

      <div className={styles.tabelaContainer}>
        <h2>Minhas Transcrições</h2>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Mídias</th>
              <th>Data de Criação</th>
              <th>Status</th>
              <th>Ações</th>
              <th>Visualizar</th>
            </tr>
          </thead>
          <tbody>
             {transcricoes.map(transcricao => (
              <tr key={transcricao.id}>
              <td>{transcricao.video}</td>
              <td>{formatDate(transcricao.createdAt)}</td>
              <td>{transcricao.status}</td>
              <td>
              {transcricao.status === 'completed' ? (
              <button className={styles.button_down} onClick={() => handleDownload(transcricao.id)}>Download</button>
              ) : (
              <button className={styles.button_pen} disabled>Pendente</button>
              )}
              </td>
              <td>
                <Link 
                  to={`/transcription/${transcricao.id}`} 
                  state={{ transcription: { ...transcricao } }}  
                  className={`${styles.link_visualizar} ${transcricao.status === 'pending' ? styles.disabledLink : ''}`} // Adiciona classe para link desabilitado
                  style={{ pointerEvents: transcricao.status === 'pending' ? 'none' : 'auto' }} // Desabilita eventos se o status for pendente
                >
                  {transcricao.status === 'pending' ? 'Pendente' : 'Visualizar'}
                </Link>
              </td>
            </tr>
           ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardPage;
