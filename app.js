require('dotenv').config(); // This should be at the top of your app.js

const express = require('express');
const session = require('express-session'); // Import express-session
const connectDB = require('./config/db');
const cloudinary = require('./config/cloudinary');
const authRoutes = require('./routes/auth');
const path = require('path');

const app = express();

connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Configure session middleware
app.use(session({
  secret: 'mysecretkey', // Change this to a strong secret
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'ejs');

app.use('/', authRoutes);
app.get('/login', (req, res) => res.render('login'));
app.get('/signup', (req, res) => res.render('signup'));
app.get('/', (req, res) => res.render('index'));

// Route for the homepage
app.get('/homepage', (req, res) => {
  if (!req.session.user) {
    return res.redirect('/login'); // Redirect to login if not authenticated
  }

  const user = JSON.parse(decodeURIComponent(req.query.user)); // Parse the user object from query params
  res.render('homepage', { user }); // Pass the user object to the template
});


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
