const express = require('express');
const passport = require('../middlewares/auth');

const router = express.Router();

router.get('/auth', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get('/auth/callback', 
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.redirect('/profile');
  }
);

router.get('/profile', (req, res) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Usuário não autenticado' });
  }
  res.json({ message: 'Perfil do usuário', user: req.user });
});

module.exports = router;