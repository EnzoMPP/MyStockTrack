require('dotenv').config();
const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;
const JWT_SECRET = process.env.JWT_SECRET;

app.use(cors());
app.use(express.json());

// Conexão com o MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('✅ MongoDB conectado com sucesso');
  })
  .catch(err => {
    console.error('Erro ao conectar ao MongoDB:', err);
  });

// Função para gerar o JWT
function generateToken(user) {
  return jwt.sign(
    {
      userId: user._id,
      email: user.email
    },
    JWT_SECRET,
    { expiresIn: '1d' }
  );
}

// Middleware para verificar o JWT
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    console.log('❌ Token não fornecido');
    return res.status(401).json({ message: 'Token não encontrado' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      console.log('❌ Token inválido:', err.message);
      return res.status(403).json({ message: 'Token inválido' });
    }
    req.user = user;
    next();
  });
}

// Rota para iniciar a autenticação com o Google
app.get('/auth/google', (req, res) => {
  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email'],
    prompt: 'consent'
  });

  res.redirect(authUrl);
});

// Rota de callback do Google
app.get('/auth/google/callback', async (req, res) => {
  console.log('📍 Callback Google recebido');
  const { code } = req.query;

  if (!code) {
    console.error('❌ Código não encontrado');
    return res.status(400).send('Código ausente');
  }

  try {
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      GOOGLE_REDIRECT_URI
    );

    console.log('🔄 Obtendo tokens...');
    const { tokens } = await oauth2Client.getToken(code);
    oauth2Client.setCredentials(tokens);

    console.log('🔄 Obtendo dados do usuário...');
    const userInfoResponse = await oauth2Client.request({
      url: 'https://www.googleapis.com/oauth2/v3/userinfo'
    });

    const userInfo = userInfoResponse.data;

    let user = await User.findOne({ googleId: userInfo.sub });

    if (!user) {
      console.log('🆕 Criando novo usuário');
      user = await User.create({
        googleId: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name,
        profilePicture: userInfo.picture
      });
    }

    const jwtToken = generateToken(user);
    console.log('✅ JWT gerado');

    const redirectUrl = `${process.env.IP_MOBILE}?token=${jwtToken}`;
    console.log('🔄 Redirecionando para:', redirectUrl);
    res.redirect(redirectUrl);

  } catch (error) {
    console.error('❌ Erro:', error);
    res.status(500).send('Erro na autenticação');
  }
});

// Rota protegida para obter informações do perfil
app.get('/perfil', authenticateToken, async (req, res) => {
  console.log('📍 Acessando perfil de:', req.user.email);
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    res.json({
      name: user.name,
      email: user.email,
      profilePicture: user.profilePicture
    });
  } catch (error) {
    console.error('❌ Erro ao buscar perfil:', error);
    res.status(500).json({ message: 'Erro ao buscar perfil' });
  }
});

// Rota de logout
app.post('/logout', authenticateToken, (req, res) => {
  console.log('📍 Logout solicitado por:', req.user.email);
  res.status(200).json({ message: 'Logout bem-sucedido' });
});

// Iniciar o servidor
app.listen(PORT, () => {
  console.log(`Servidor está rodando em http://localhost:${PORT}`);
});