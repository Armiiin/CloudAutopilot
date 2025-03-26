const LocalStrategy = require('passport-local').Strategy;
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
const bcrypt = require('bcrypt');
const knex = require('../db/knex'); // Your configured Knex instance

module.exports = function (passport) {
    // --- Local Strategy (for login: email + password) ---
    passport.use('local-login', new LocalStrategy(
        {
            usernameField: 'email', // We are using email as the username field
            passwordField: 'password'
        },
        async (email, password, done) => {
            try {
                const user = await knex('users').where({ email }).first();

                if (!user) {
                    return done(null, false, { message: 'Incorrect email or user not found.' });
                }

                // Compare password with hashed password in DB
                const isMatch = await bcrypt.compare(password, user.hashedPassword);

                if (!isMatch) {
                    return done(null, false, { message: 'Incorrect password.' });
                }

                // Passwords match, return user
                return done(null, user);

            } catch (error) {
                return done(error);
            }
        }
    ));

    // --- JWT Strategy (for verifying tokens on protected routes) ---
    const opts = {};
    opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken(); // Extracts token from "Authorization: Bearer <token>"
    opts.secretOrKey = process.env.JWT_SECRET;

    passport.use('jwt', new JwtStrategy(opts, async (jwt_payload, done) => {
        try {
            // jwt_payload contains the data we put in it when signing (e.g., user id)
            const user = await knex('users').where({ id: jwt_payload.id }).first();

            if (user) {
                return done(null, user); // User found, authentication successful
            } else {
                return done(null, false); // User not found
            }
        } catch (error) {
            return done(error, false);
        }
    }));
};