const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Path to User model
const multer = require('multer');
const cloudinary = require('../config/cloudinary'); // Import Cloudinary config
const { CloudinaryStorage } = require('multer-storage-cloudinary'); // Correct import for CloudinaryStorage
const bcrypt = require('bcrypt'); // Import bcrypt

// Set up Multer storage for Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profile_pictures', // Specify the folder name in Cloudinary
    allowedFormats: ['jpg', 'png', 'jpeg'], // Allowed image formats
  },
});

const upload = multer({ storage: storage });

// Route for user signup
router.post('/signup', upload.single('profileImage'), async (req, res) => {
  try {
    const { username, email, phone, password, school, class: userClass, section, hobbies } = req.body;

    // Ensure all required fields are present
    if (!username || !email || !phone || !password || !req.file) {
      return res.status(400).send('All fields are required!');
    }

    // Check if user with the same email, username, or phone already exists
    const existingUser = await User.findOne({ $or: [{ email }, { username }, { phone }] });
    if (existingUser) {
      return res.status(400).send('User already exists with the same email, username, or phone');
    }

    // Hash the password before saving
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create a new User object with the provided information
    const newUser = new User({
      username,
      email,
      phone,
      password: hashedPassword, // Store the hashed password
      profileImage: req.file.path, // Store the URL from Cloudinary
      school: school || '', // Optional fields
      class: userClass || '',
      section: section || '',
      hobbies: hobbies ? hobbies.split(',') : [], // Convert hobbies to array if provided
    });

    // Save the new user in the database
    await newUser.save();
    res.status(201).send('User registered successfully');

  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});

// Route for user login
// Route for user login
router.post('/login', async (req, res) => {
  try {
    const { usernameOrEmailOrPhone, password } = req.body;

    // Find the user by either username, email, or phone
    const user = await User.findOne({
      $or: [
        { username: usernameOrEmailOrPhone },
        { email: usernameOrEmailOrPhone },
        { phone: usernameOrEmailOrPhone }
      ]
    });

    if (!user) {
      return res.status(400).send('Invalid login credentials');
    }

    // Compare the provided password with the stored hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send('Invalid login credentials');
    }

    // Login successful
    // In auth.js (login route)
req.session.user = {
  id: user._id,
  username: user.username,
  email: user.email,
  phone: user.phone,
  profileImage: user.profileImage,
  school: user.school,
  class: user.class,
  section: user.section,
  hobbies: user.hobbies || [], // Ensure hobbies is an array
};

// Redirect to homepage with user details
return res.redirect(`/homepage?user=${encodeURIComponent(JSON.stringify(req.session.user))}`);

  } catch (error) {
    console.error(error);
    res.status(500).send('Server Error');
  }
});


module.exports = router;
