// backend/server.js
require('dotenv').config(); // Load environment variables
const express = require('express');
const cors = require('cors');
const passport = require('passport');

const app = express();
const PORT = process.env.PORT || 3001; // Use environment variable or default

// --- Middleware --- 
app.use(cors()); // Enable CORS for all origins (adjust for production later)
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// --- Passport Configuration ---
app.use(passport.initialize()); // Initialize Passport
require('./config/passport')(passport); // Load your Passport configuration

// --- Routes ---
app.get('/api/health', (req, res) => {
    res.json({ status: 'Backend is running!', time: new Date() });
});

app.get('/api/auth/register', (req, res) => {
    res.json({ status: 'Register' });
});

app.get('/api/auth/login', (req, res) => {
    res.json({ status: 'Login' });
});

app.get('/api/auth/logout', (req, res) => {
    res.json({ status: 'Logout' });
});

// Authentication routes
const authRoutes = require('./routes/auth'); // Routes are in routes/auth.js
app.use('/api/auth', authRoutes);

// For protected route (requires JWT) - Add later
// const protectedRoutes = require('./routes/protected');
// app.use('/api/protected', passport.authenticate('jwt', { session: false }), protectedRoutes)

// --- Server Start ---
app.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});