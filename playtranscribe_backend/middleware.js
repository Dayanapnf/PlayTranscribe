// src/middleware/authenticateJWT.js
const admin = require('firebase-admin');

// Middleware para verificar o token de autenticação
const authenticateJWT = async (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Obtém o token do header

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: 'Token não fornecido.' });
  }

  try {
    // Verifica o token com Firebase Admin SDK
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Adiciona o usuário decodificado à requisição
    next();
  } catch (error) {
    console.error('Erro ao verificar o token:', error.message);
    res
      .status(401)
      .json({ success: false, message: 'Token inválido ou expirado.' });
  }
};

module.exports = authenticateJWT;
