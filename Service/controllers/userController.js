const User = require('../models/user');

const createUser = async (profile) => {
  try {
    let user = await User.findOne({ googleId: profile.id });
    if (!user) {
      user = new User({
        googleId: profile.id,
        name: profile.displayName,
        email: profile.emails[0].value
      });
      await user.save();
    }
    return user;
  } catch (err) {
    throw new Error('Erro ao criar usuário: ' + err.message);
  }
};

module.exports = { createUser };