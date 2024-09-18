// index.js
require('dotenv').config();
const express = require('express');
const admin = require('firebase-admin');
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const os = require('os');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json()); // Adicionado para processar JSON

// Initialize Firebase Admin SDK
const serviceAccount = require('./playtranscribe-firebase-adminsdk-st6um-2516a5b193.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'playtranscribe.appspot.com',
});

const db = admin.firestore();
const bucket = admin.storage().bucket(); // Use the default bucket

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

ffmpeg.setFfmpegPath(ffmpegPath);

// Função para extrair o caminho do arquivo da URL pública
const extractFilePathFromUrl = (url) => {
  const pathMatch = url.match(/o\/(.+?)\?/);
  if (pathMatch && pathMatch[1]) {
    return decodeURIComponent(pathMatch[1]);
  }
  throw new Error('Caminho do arquivo não encontrado na URL.');
};

// Endpoint para transcrição
app.post('/transcribe', async (req, res) => {
  const { videoUrl, userId } = req.body;

  if (!videoUrl || !userId) {
    console.error('Erro: videoUrl ou userId não fornecidos.');
    return res.status(400).send('videoUrl e userId são obrigatórios.');
  }

  try {
    const filePath = extractFilePathFromUrl(videoUrl);
    const file = bucket.file(filePath);
    const audioFileName =
      path.basename(filePath, path.extname(filePath)) + '.mp3';
    const tmpFilePath = path.join(os.tmpdir(), audioFileName);

    // Baixa o vídeo do Firebase Storage
    console.log('Iniciando download do vídeo do Firebase Storage...');
    await new Promise((resolve, reject) => {
      file.download(
        { destination: tmpFilePath.replace('.mp3', '.mp4') },
        (err) => {
          if (err) {
            console.error('Erro ao baixar o vídeo:', err);
            reject(err);
          } else {
            console.log('Download concluído.');
            resolve();
          }
        },
      );
    });

    // Converte o vídeo para áudio
    console.log('Iniciando conversão de vídeo para áudio...');
    await new Promise((resolve, reject) => {
      ffmpeg(tmpFilePath.replace('.mp3', '.mp4'))
        .toFormat('mp3')
        .on('end', () => {
          console.log('Conversão concluída.');
          resolve();
        })
        .on('error', (err) => {
          console.error('Erro na conversão:', err);
          reject(err);
        })
        .save(tmpFilePath);
    });

    console.log('Arquivo de áudio criado em:', tmpFilePath);

    // Envia o áudio para a API de transcrição
    console.log('Iniciando transcrição com a OpenAI...');
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tmpFilePath),
      model: 'whisper-1',
    });
    console.log('Transcrição recebida com sucesso:', transcription.text);

    // Armazena a transcrição no Firestore
    console.log('Salvando transcrição no Firestore...');
    const transcriptRef = db
      .collection('users')
      .doc(userId)
      .collection('transcriptions')
      .doc();
    await transcriptRef.set({
      videoUrl,
      status: 'completed',
      transcription: transcription.text,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    fs.unlinkSync(tmpFilePath); // Remove o arquivo temporário
    res
      .status(200)
      .send('Vídeo processado e transcrição concluída com sucesso.');
  } catch (error) {
    console.error('Erro ao processar o vídeo:', error);
    res.status(500).send('Erro ao processar o vídeo.');
  }
});

// Start server
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
