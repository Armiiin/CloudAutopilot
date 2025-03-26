const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const knex = require('../db/knex');

const router = express.Router();
const saltRounds = 10; // For bcrypt hashing

// --- Registration Route ---
router.post('/register', async (req, res) => {
    const { email, username, password } = req.body;

    // Basic validation
    if (!email || !username || !password) {
        return res.status(400).json({ message: 'Email, username, and password are required.' });
    }

    try {
        // Check if user already exists
        const existingUser = await knex('users').where({ email }).orWhere({ username }).first();
        if (existingUser) {
            return res.status(409).json({ message: 'Email or username already exists.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Insert new user into DB
        const [newUser] = await knex('users').insert({
            email,
            username,
            hashedPassword
        }).returning('*'); // Return the created user data (optional)

        // Exclude password from response
        delete newUser.hashedPassword;

        res.status(201).json({ message: 'User registered successfully!', user: newUser });

    } catch (error) {
        console.error("Registration Error:", error);
        res.status(500).json({ message: 'Error registering user.' });
    }
});

// --- Login Route ---
router.post('/login', (req, res, next) => {
    passport.authenticate('local-login', { session: false }, (err, user, info) => {
        if (err) {
            return next(err); // Handle internal errors
        }
        if (!user) {
            // Authentication failed (user not found or wrong password)
            return res.status(401).json(info || { message: 'Login failed.' });
        }

        // User authenticated successfully, generate JWT
        req.login(user, { session: false }, (loginErr) => {
            if (loginErr) {
                return next(loginErr);
            }

            // Create JWT payload
            const payload = {
                id: user.id,
                email: user.email,
                username: user.username
                // Add other relevant, non-sensitive info if needed
            };

            // Sign the token
            const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' }); // Token expires in 1 hour

            // Send token back to client
            return res.json({ success: true, token: 'Bearer ' + token });
        });
    })(req, res, next); // Don't forget to call the passport authenticate middleware
});

module.exports = router;