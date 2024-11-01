require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const passport = require('./middlewares/auth');
const authRoutes = require('./routes/authRoutes');
const session = require('express-session');

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(bodyParser.json());

// Configurar o middleware express-session
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());

app.use('/', authRoutes);

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});