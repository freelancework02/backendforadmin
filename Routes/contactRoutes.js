// routes/contactRoutes.js
const express = require("express");
const router = express.Router();

const { sendContactForm } = require("../Controller/contactController");

// POST /api/contact
router.post("/contact", sendContactForm);

module.exports = router;
