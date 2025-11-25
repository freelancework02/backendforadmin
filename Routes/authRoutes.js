// routes/authRoutes.js
const express = require('express');
const router = express.Router();
const auth = require('../Controller/authController');

// Register
router.post('/register', auth.register);

// Login
router.post('/login', auth.login);

// Logout (optional)
router.post('/logout', auth.logout);

module.exports = router;
