const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  profileImage: {
    type: String, // Store Cloudinary URL
  },
  school: {
    type: String,
    default: '',
  },
  class: {
    type: String,
    default: '',
  },
  section: {
    type: String,
    default: '',
  },
  hobbies: {
    type: [String], // Array of strings for hobbies
    default: [],
  },
});

const User = mongoose.model('User', userSchema);
module.exports = User;
