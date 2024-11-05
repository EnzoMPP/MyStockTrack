require('dotenv').config();
const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const cors = require('cors');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const User = require('./models/User');

const app = express();
const PORT = process.env.PORT || 3000;
const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

app.use(cors({
  origin: 'http://localhost:19006',
  credentials: true,
}));

app.use(express.json());

app.use(session({
  secret: process.env.SESSION_SECRET || 'seusegredoseguro',
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
  const { code } = req.query;

  if (!code) {
    console.error('Nenhum código encontrado nos parâmetros da query');
    return res.status(400).send('Nenhum código encontrado');
  }

  try {
    const oauth2Client = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      GOOGLE_REDIRECT_URI
    );

    const { tokens } = await oauth2Client.getToken({ code });
    oauth2Client.setCredentials(tokens);

    if (!tokens || !tokens.access_token) {
      throw new Error('Falha ao recuperar o token de acesso');
    }

    const userInfoResponse = await oauth2Client.request({
      url: 'https://www.googleapis.com/oauth2/v3/userinfo',
    });

    const userInfo = userInfoResponse.data;

    let user = await User.findOne({ googleId: userInfo.sub });
    if (!user) {
      user = new User({
        googleId: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name,
        profilePicture: userInfo.picture,
      });
      await user.save();
    }

    req.session.userId = user._id;

    const redirectUrl = `exp://192.168.0.48:8081?token=${tokens.access_token}`;
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Erro ao recuperar o token de acesso', error);
    res.status(500).send('Falha na autenticação');
  }
});

app.get('/dashboard', async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).send('Não autenticado');
  }

  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(401).send('Usuário não encontrado');
    }
    res.send(`Bem-vindo, ${user.name}!`);
  } catch (error) {
    console.error('Erro ao buscar o usuário na sessão', error);
    res.status(500).send('Erro interno');
  }
});

app.get('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Erro ao destruir a sessão', err);
      return res.status(500).send('Erro ao fazer logout');
    }
    res.clearCookie('connect.sid');
    res.send('Desconectado com sucesso');
  });
});

app.listen(PORT, () => {
  console.log(`Servidor está rodando em http://localhost:${PORT}`);
});
