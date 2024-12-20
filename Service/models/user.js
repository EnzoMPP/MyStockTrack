const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  profilePicture: { type: String },
  balance: { type: Number, default: 0 }, 
  favorites: {
    type: [String],
    default: []
  }
});

const User = mongoose.model('User', userSchema);

module.exports = User;