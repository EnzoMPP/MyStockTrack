const { OAuth2Client } = require('google-auth-library');
const User = require('../models/User');
const { generateToken } = require('../utils/jwtUtil');

const GOOGLE_REDIRECT_URI = process.env.GOOGLE_REDIRECT_URI;

exports.googleAuth = (req, res) => {
  const oauth2Client = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    GOOGLE_REDIRECT_URI
  );

  const authUrl = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['profile', 'email'],
    prompt: 'consent',
  });

  res.redirect(authUrl);
};

exports.googleAuthCallback = async (req, res) => {
  console.log('📍 Callback Google recebido');
  const { code } = req.query;

  if (!code) {
    console.error('❌ Código não encontrado');
    return res.status(400).json({ message: 'Código ausente' });
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
      url: 'https://www.googleapis.com/oauth2/v3/userinfo',
    });

    const userInfo = userInfoResponse.data;

    let user = await User.findOne({ googleId: userInfo.sub });

    if (!user) {
      console.log('🆕 Criando novo usuário');
      user = await User.create({
        googleId: userInfo.sub,
        email: userInfo.email,
        name: userInfo.name,
        profilePicture: userInfo.picture,
        balance: 0,
      });
    }

    const jwtToken = generateToken(user);
    console.log('✅ JWT gerado');

    const redirectUrl = `${process.env.IP_MOBILE}?token=${jwtToken}`;
    console.log('🔄 Redirecionando para:', redirectUrl);
    res.redirect(redirectUrl);
  } catch (error) {
    console.error('❌ Erro:', error);
    res.status(500).json({ message: 'Erro na autenticação' });
  }
};

exports.logout = (req, res) => {
  console.log('📍 Logout solicitado por:', req.user.email);
  res.status(200).json({ message: 'Logout bem-sucedido' });
};