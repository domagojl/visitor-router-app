const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../dbSetup');

const router = express.Router();

// Use the secret key from the environment variable
const JWT_SECRET = process.env.JWT_SECRET;

// User Signup
router.post('/signup', (req, res) => {
    const { email, password } = req.body;

    // Hash the password
    bcrypt.hash(password, 10, (err, hash) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: "Failed to hash password" });
        }

        // Insert the user into the database
        db.run(
            `INSERT INTO users (email, password) VALUES (?, ?)`,
            [email, hash],
            (err) => {
                if (err) {
                    console.error(err);
                    return res.status(400).json({ error: "User already exists or invalid input" });
                }
                res.status(201).json({ message: "User registered successfully" });
            }
        );
    });
});

// User Login
router.post('/login', (req, res) => {
    const { email, password } = req.body;

    // Fetch user from database
    db.get(`SELECT * FROM users WHERE email = ?`, [email], (err, user) => {
        if (err || !user) {
            console.error(err);
            return res.status(400).json({ error: "Invalid email or password" });
        }

        // Compare the password
        bcrypt.compare(password, user.password, (err, isMatch) => {
            if (err || !isMatch) {
                return res.status(400).json({ error: "Invalid email or password" });
            }

            // Generate a JWT
            const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });

            res.status(200).json({ message: "Login successful", token });
        });
    });
});

module.exports = router;
