// authRoutes.js
const multer = require('multer');
const authenticateJWT = require('./middleware');
const express = require('express');
const router = express.Router();
const { admin, db } = require('./firebaseConfig');
const jwt = require('jsonwebtoken');
const bucket = admin.storage().bucket();
const upload = multer({ storage: multer.memoryStorage() });
const ffmpeg = require('fluent-ffmpeg');
const ffmpegPath = require('@ffmpeg-installer/ffmpeg').path;
const OpenAI = require('openai');
const fs = require('fs');
const path = require('path');
const os = require('os');
const dayjs = require('dayjs');
const firestore = admin.firestore();

const authenticateToken = require('./middleware');

const { v4: uuidv4 } = require('uuid'); // Importar uuidv4
const JWT_SECRET = process.env.JWT_SECRET || 'secreta-muito-segura';

// Rota para cadastro de usuário
router.post('/register', async (req, res) => {
  try {
    const { idToken, name, email } = req.body;

    console.log('Dados recebidos:', { idToken, name, email }); // Log dos dados recebidos

    // Verifica o ID Token para autenticar o usuário
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;

    // Cria o documento de usuário na coleção 'users'
    await db.collection('users').doc(uid).set({
      name: name,
      email: email,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    res.status(200).send('Usuário registrado com sucesso!');
  } catch (error) {
    console.error('Erro ao registrar usuário:', error); // Log detalhado do erro
    res.status(500).send('Erro ao registrar usuário.');
  }
});
// Rota para login de usuário
router.post('/login', async (req, res) => {
  const { idToken } = req.body;

  try {
    // Verifica o idToken com Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const uid = decodedToken.uid;
    const userRecord = await admin.auth().getUser(uid);

    // Gerar um JWT customizado
    const jwtToken = jwt.sign(
      {
        uid: userRecord.uid, // Dados que você quer incluir no JWT
        email: userRecord.email,
        name: userRecord.displayName,
      },
      JWT_SECRET, // Chave secreta para assinar o token
      { expiresIn: '1h' }, // Tempo de expiração do JWT
    );

    // Sucesso! Retorna o JWT para o frontend
    res.status(200).json({
      success: true,
      token: jwtToken, // Retorna o JWT para o frontend
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        name: userRecord.displayName,
      },
    });
  } catch (error) {
    console.error('Erro ao verificar o token:', error.message);
    res
      .status(401)
      .json({ success: false, message: 'Token inválido ou expirado.' });
  }
});

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

ffmpeg.setFfmpegPath(ffmpegPath);

// Função para extrair o caminho do arquivo da URL pública
const extractFilePathFromUrl = (url) => {
  const pathMatch = url.match(/storage.googleapis.com\/(.+)/);
  if (pathMatch && pathMatch[1]) {
    // Remove o prefixo do bucket se estiver presente
    const filePath = pathMatch[1].replace(
      /^playtranscribe\.appspot\.com\//,
      '',
    );
    return decodeURIComponent(filePath);
  }
  throw new Error('Caminho do arquivo não encontrado na URL.');
};

// Definir a cota diária em MB
const DAILY_QUOTA_MB = 30; // Exemplo: 100 MB por dia
const BYTES_PER_MB = 1024 * 1024; // 1 MB = 1024 * 1024 bytes

// Função utilitária para converter bytes para megabytes
const bytesToMB = (bytes) => bytes / BYTES_PER_MB;

// Função para verificar se estamos no mesmo dia
const isSameDay = (timestamp) => dayjs().isSame(dayjs(timestamp), 'day');

// Endpoint para verificar a cota do usuário (usando autenticação JWT)
router.post('/check-quota', authenticateJWT, async (req, res) => {
  const { fileSizeInBytes } = req.body;
  const userId = req.user.uid; // O ID do usuário autenticado vem do token JWT decodificado

  try {
    // Referência ao documento da cota do usuário
    const quotaRef = firestore
      .collection('users')
      .doc(userId)
      .collection('quota')
      .doc('dailyQuota');
    const quotaDoc = await quotaRef.get();

    let usedQuotaMB = 0;
    let canUpload = true;
    let message = '';

    // Se a subcoleção existir, verifica a cota
    if (quotaDoc.exists) {
      const quotaData = quotaDoc.data();
      usedQuotaMB = quotaData.usedQuotaMB || 0; // Usa 0 se não houver valor

      // Verifica a primeira data de transcrição
      const firstTranscriptionDate = quotaData.firstTranscriptionDate
        ? quotaData.firstTranscriptionDate.toDate()
        : null;
      const now = new Date();

      // Verifica se a primeira data é mais antiga que 24 horas
      if (
        firstTranscriptionDate &&
        now - firstTranscriptionDate > 24 * 60 * 60 * 1000
      ) {
        // Se a diferença for maior que 24 horas, reseta a cota e atualiza a data
        await quotaRef.set(
          {
            usedQuotaMB: 0,
            firstTranscriptionDate:
              admin.firestore.FieldValue.serverTimestamp(),
          },
          { merge: true },
        );
        usedQuotaMB = 0; // Reinicia o uso da cota
      } else {
        // Verificar se a cota atual com o novo upload excede a cota diária de 30 MB
        if (usedQuotaMB + bytesToMB(fileSizeInBytes) > 30) {
          canUpload = false;
          message = 'Limite de cota diária excedido. Tente novamente amanhã.';
        }
      }
    } else {
      // Se a subcoleção não existir, verifica se o tamanho do upload é maior que 25 MB
      if (bytesToMB(fileSizeInBytes) > 25) {
        canUpload = false;
        message =
          'O arquivo que você está tentando enviar é maior que o suportado.';
        return { allowed: canUpload, message };
      }
    }

    // Resposta final
    if (canUpload) {
      message = 'Cota disponível para upload.';
    }

    res.status(200).json({ canUpload, message });
  } catch (error) {
    console.error('Erro ao verificar a cota do usuário:', error);
    res.status(500).json({
      message: 'Erro ao verificar a cota. Tente novamente mais tarde.',
    });
  }
});

//rota para upload
router.post(
  '/upload',
  authenticateToken,
  upload.single('video'),
  async (req, res) => {
    const userId = req.user.uid; // ID do usuário autenticado
    const file = req.file;

    if (!file) {
      return res.status(400).send('Nenhum arquivo enviado.');
    }

    try {
      // Criar referência para o arquivo no bucket
      const blob = bucket.file(`videos/${userId}/${file.originalname}`);
      const blobStream = blob.createWriteStream({
        resumable: false,
      });

      blobStream.on('error', (err) => {
        console.error(err);
        return res.status(500).send('Algo deu errado durante o upload.');
      });

      blobStream.on('finish', async () => {
        const downloadUrl = `https://storage.googleapis.com/${bucket.name}/${blob.name}`;

        console.log('Iniciando a criação do documento de transcrição...');
        const transcriptionDoc = await db
          .collection('users')
          .doc(userId)
          .collection('transcriptions')
          .add({
            videoName: file.originalname,
            videoUrl: downloadUrl,
            status: 'pending',
            transcription: null,
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
          });
        console.log(
          'Documento de transcrição criado com ID:',
          transcriptionDoc.id,
        );

        res.status(200).json({
          message: 'Arquivo enviado com sucesso.',
          videoUrl: downloadUrl,
          transcriptId: transcriptionDoc.id,
        });
      });

      // Enviar o buffer do arquivo
      blobStream.end(file.buffer);
    } catch (error) {
      console.error('Erro ao fazer upload do arquivo:', error);
      res.status(500).send('Erro ao fazer upload do arquivo.');
    }
  },
);

//rota para transcrição
router.post('/transcribe', authenticateToken, async (req, res) => {
  const { videoUrl, transcriptId } = req.body;
  const userId = req.user.uid; // Obtém o ID do usuário autenticado

  // Verificação dos parâmetros necessários
  if (!videoUrl || !transcriptId || !userId) {
    console.error('Erro: videoUrl, transcriptId ou userId não fornecido.');
    return res
      .status(400)
      .send('videoUrl, transcriptId e userId são obrigatórios.');
  }

  // Inicialização de variáveis de caminho de arquivo
  const filePath = extractFilePathFromUrl(videoUrl);
  const file = bucket.file(filePath);
  const fileExtension = path.extname(filePath).toLowerCase();
  const audioFileName =
    path.basename(filePath, path.extname(filePath)) + '.mp3';
  const tmpMp4Path = path.join(os.tmpdir(), path.basename(filePath));
  const tmpMp3Path = path.join(os.tmpdir(), audioFileName);

  try {
    // Download do arquivo do Firebase Storage
    console.log(`Iniciando download do arquivo (${fileExtension})...`);
    //fazendo o download e salvando no  tmpMp4Path(bytes baixados)
    await file.download({ destination: tmpMp4Path });
    console.log('Download do arquivo concluído.');

    // Se for MP4, converte para MP3
    if (fileExtension === '.mp4') {
      console.log('Iniciando conversão de MP4 para MP3...');
      await new Promise((resolve, reject) => {
        ffmpeg(tmpMp4Path)
          .toFormat('mp3')
          .on('end', () => {
            console.log('Conversão de MP4 para MP3 concluída.');
            resolve();
          })
          .on('error', (err) => {
            console.error('Erro na conversão:', err);
            reject(err);
          })
          .save(tmpMp3Path);
      });
    } else if (fileExtension === '.mp3') {
      // Se for MP3, apenas mova o arquivo baixado para a variável tmpMp3Path
      fs.renameSync(tmpMp4Path, tmpMp3Path);
      console.log('Arquivo MP3 pronto para transcrição.');
    } else {
      throw new Error(
        'Formato de arquivo não suportado. Apenas MP3 ou MP4 são permitidos.',
      );
    }

    // Enviando áudio MP3 para transcrição usando OpenAI
    console.log('Iniciando transcrição com a OpenAI...');
    const transcription = await openai.audio.transcriptions.create({
      file: fs.createReadStream(tmpMp3Path),
      model: 'whisper-1',
    });
    console.log('Transcrição recebida com sucesso:', transcription.text);

    // Atualizando o Firestore com a transcrição e status
    console.log('Atualizando o documento de transcrição no Firestore...');
    const transcriptRef = admin
      .firestore()
      .collection('users')
      .doc(userId)
      .collection('transcriptions')
      .doc(transcriptId);

    await transcriptRef.update({
      status: 'completed',
      transcription: transcription.text,
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Calculando o tamanho do arquivo em MB
    const fileSizeInBytes = (await file.getMetadata())[0].size;
    const fileSizeInMB = fileSizeInBytes / (1024 * 1024);
    console.log('Tamanho do arquivo:', fileSizeInMB, 'MB');

    // Verificação e atualização da cota diária
    const userQuotaRef = admin
      .firestore()
      .collection('users')
      .doc(userId)
      .collection('quota')
      .doc('dailyQuota');
    const quotaDoc = await userQuotaRef.get();

    if (!quotaDoc.exists) {
      console.log('Criando entrada de cota diária...');
      await userQuotaRef.set({
        usedQuotaMB: fileSizeInMB,
        firstTranscriptionDate: admin.firestore.FieldValue.serverTimestamp(),
      });
    } else {
      console.log('Atualizando cota diária...');
      await userQuotaRef.update({
        usedQuotaMB: admin.firestore.FieldValue.increment(fileSizeInMB),
      });
    }

    console.log('Cota diária atualizada com sucesso.');

    // Enviando resposta de sucesso
    res
      .status(200)
      .send('Arquivo processado e transcrição concluída com sucesso.');
  } catch (error) {
    console.error('Erro ao processar o arquivo:', error);
    res.status(500).send('Erro ao processar o arquivo.');
  } finally {
    // Limpeza de arquivos temporários
    if (fs.existsSync(tmpMp4Path)) fs.unlinkSync(tmpMp4Path);
    if (fs.existsSync(tmpMp3Path)) fs.unlinkSync(tmpMp3Path);
  }
});

// Rota para verificar o JWT
router.get('/verify', authenticateJWT, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

module.exports = router;
