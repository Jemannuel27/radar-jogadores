const express = require('express');
const cors = require('cors');
require('dotenv').config();

// Importação das Rotas
const authRoutes = require('./routes/authRoutes');
const jogadorRoutes = require('./routes/jogadorRoutes');
const equipeRoutes = require('./routes/equipeRoutes');
const partidaRoutes = require('./routes/partidaRoutes');
const estatisticaRoutes = require('./routes/estatisticaRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const iaRoutes = require('./routes/iaRoutes');

const app = express();

// Middlewares Globais
app.use(cors());
app.use(express.json());

// Registro de Rotas
app.use('/auth', authRoutes);
app.use('/jogadores', jogadorRoutes);
app.use('/equipes', equipeRoutes);
app.use('/partidas', partidaRoutes);
app.use('/estatisticas', estatisticaRoutes);
app.use('/dashboard', dashboardRoutes);
app.use('/ia', iaRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});