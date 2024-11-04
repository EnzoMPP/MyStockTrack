require('dotenv').config();
const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const cors = require('cors');
const mongoose = require('mongoose');
const User = require('./models/User');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

mongoose.connect('mongodb://localhost:27017/users')
  .then(() => {
    console.log('MongoDB conectado com sucesso');
  })
  .catch(err => {
    console.error('Erro ao conectar ao MongoDB:', err);
  });

app.get('/auth/google', (req, res) => {
  const { client_id, redirect_uri } = req.query;

  const oauth2Client = new OAuth2Client(
    client_id,
    process.env.GOOGLE_CLIENT_SECRET,
    redirect_uri
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email'],
    prompt: 'consent',
  });

  res.redirect(authUrl);
});

app.get('/auth/google/callback', async (req, res) => {
  const { code, client_id, redirect_uri } = req.query;

  if (!code) {
    console.error('Nenhum código encontrado nos parâmetros da query');
    return res.status(400).send('Nenhum código encontrado');
  }

  try {
    const oauth2Client = new OAuth2Client(
      client_id,
      process.env.GOOGLE_CLIENT_SECRET,
      redirect_uri
    );

    console.log('Código de autorização:', code);
    const { tokens } = await oauth2Client.getToken({ code, redirect_uri });
    console.log('Tokens recebidos:', tokens);
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

    res.json(userInfo);
  } catch (error) {
    console.error('Erro ao recuperar o token de acesso', error);
    res.status(500).send('Falha na autenticação');
  }
});

app.listen(PORT, () => {
  console.log(`Servidor está rodando em http://localhost:${PORT}`);
});
