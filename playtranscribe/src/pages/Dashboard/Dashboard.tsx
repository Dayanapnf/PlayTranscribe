import React, { useState, useEffect } from 'react';

// Exemplo de tipos
interface Transcricao {
  id: string;
  video: string;
  dataEnvio: string;
  status: 'Pendente' | 'Concluída';
}

const DashboardPage: React.FC = () => {
  const [transcricoes, setTranscricoes] = useState<Transcricao[]>([]);
  const [transcricoesDiarias, setTranscricoesDiarias] = useState(0);
  const limiteTranscricoes = 3;

  useEffect(() => {
    // Aqui você faria a chamada ao Firebase para pegar as transcrições
    // Exemplo fictício:
    const transcricoesMock: Transcricao[] = [
      { id: '1', video: 'video1.mp4', dataEnvio: '12/09/2024', status: 'Pendente' },
      { id: '2', video: 'video2.mp4', dataEnvio: '10/09/2024', status: 'Concluída' },
    ];

    // Aqui você filtraria as transcrições feitas no dia
    const transcricoesHoje = transcricoesMock.filter(t => t.dataEnvio === '12/09/2024').length;
    setTranscricoes(transcricoesMock);
    setTranscricoesDiarias(transcricoesHoje);
  }, []);

  return (
    <div style={styles.container}>
      {/* Container menor: Quantidade de transcrições do dia */}
      <div style={styles.transcricoesContainer}>
        <h2>Transcrições do Dia</h2>
        <p>{transcricoesDiarias} de {limiteTranscricoes} permitidas</p>
      </div>

      {/* Container maior: Tabela com as transcrições */}
      <div style={styles.tabelaContainer}>
        <h2>Minhas Transcrições</h2>
        <table style={styles.table}>
          <thead>
            <tr>
              <th>Vídeo</th>
              <th>Data de Envio</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {transcricoes.map(transcricao => (
              <tr key={transcricao.id}>
                <td>{transcricao.video}</td>
                <td>{transcricao.dataEnvio}</td>
                <td>{transcricao.status}</td>
                <td>
                  {transcricao.status === 'Concluída' ? (
                    <button onClick={() => alert('Baixando transcrição...')}>Download</button>
                  ) : (
                    <button disabled>Pendente</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Estilos em objeto para simplificar o exemplo
const styles = {
  container: {
    display: 'flex',
    flexDirection: 'row' as 'row',  // Flexbox para alinhar os containers lado a lado
    gap: '20px',
    padding: '20px',
  },
  transcricoesContainer: {
    flex: 1,
    backgroundColor: '#f0f0f0',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    textAlign: 'center' as 'center',  // Centralizar o texto
  },
  tabelaContainer: {
    flex: 3,
    backgroundColor: '#fff',
    padding: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse' as 'collapse',
  },
  th: {
    borderBottom: '2px solid #ddd',
    padding: '10px',
  },
  td: {
    padding: '10px',
    borderBottom: '1px solid #ddd',
  },
};

export default DashboardPage;
