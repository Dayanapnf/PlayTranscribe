require('dotenv').config();
const express = require('express');
const authRoutes = require('./authRoutes');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json()); // Adicionado para processar JSON
app.use('/api/auth', authRoutes);

// Iniciar o servidor
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
