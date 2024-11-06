require('dotenv').config();
const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

app.use(cors());

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions',
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24,
    httpOnly: true,
    secure: false,
  },
}));

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB conectado com sucesso');
  })
  .catch(err => {
    console.error('Erro ao conectar ao MongoDB:', err);
  });

app.get('/auth/google', (req, res) => {
  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email'],
    prompt: 'consent',
    redirect_uri: GOOGLE_REDIRECT_URI,
  });

  res.redirect(authUrl);
});

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
    const userInfo = await oauth2Client.request({
      url: 'https://www.googleapis.com/oauth2/v3/userinfo'
    });

    let user = await User.findOne({ googleId: userInfo.data.sub });
    
    if (!user) {
      console.log('🆕 Criando novo usuário');
      user = await User.create({
        googleId: userInfo.data.sub,
        email: userInfo.data.email,
        name: userInfo.data.name,
        profilePicture: userInfo.data.picture
      });
    }

    // Salvar sessão
    console.log('🔄 Salvando sessão...');
    req.session.userId = user._id;
    req.session.email = user.email;
    
    await new Promise((resolve, reject) => {
      req.session.save(err => {
        if (err) {
          console.error('❌ Erro ao salvar sessão:', err);
          reject(err);
        }
        console.log('✅ Sessão salva com sucesso');
        console.log('📝 Dados da sessão:', req.session);
        resolve();
      });
    });

    const redirectUrl = `${process.env.IP_MOBILE}?token=${tokens.access_token}`;
    console.log('🔄 Redirecionando para:', redirectUrl);
    res.redirect(redirectUrl);

  } catch (error) {
    console.error('❌ Erro:', error);
    res.status(500).send('Erro na autenticação');
  }
});

// Rota de logout
app.post('/logout', (req, res) => {
  console.log('Requisição de logout recebida');
  if (req.session) {
    console.log('Sessão encontrada, destruindo sessão...');
    req.session.destroy(err => {
      if (err) {
        console.error('Erro ao destruir a sessão:', err);
        return res.status(500).json({ message: 'Erro ao fazer logout' });
      }
      res.clearCookie('connect.sid');
      console.log('Sessão destruída e cookie limpo');
      return res.status(200).json({ message: 'Logout bem-sucedido' });
    });
  } else {
    console.log('Nenhuma sessão encontrada');
    return res.status(400).json({ message: 'Sessão não encontrada' });
  }
});

app.listen(PORT, () => {
  console.log(`Servidor está rodando em http://localhost:${PORT}`);
});