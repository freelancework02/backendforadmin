// routes/eventsRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 50 } // 8MB per file, up to 50 files
});

const ctrl = require('../Controller/eventsController'); // adjust path if needed

// -------------------------
// Specific (literal) routes
// These must come before the numeric :id route to avoid collisions
// -------------------------

// Single-image endpoints (literal paths)
router.post('/image', upload.single('image'), ctrl.createImage);
router.get('/image/:imageId/blob', ctrl.getImageBlob);
router.delete('/image/:imageId', ctrl.deleteImage);

// NEW: separate endpoints for current & previous events
router.get('/current', ctrl.listCurrentEvents);
router.get('/previous', ctrl.listPreviousEvents);

// Generic listing (all events) - literal '/'
router.get('/', ctrl.listEvents);

// -------------------------
// Numeric-id routes
// Constrain :id to digits only so strings like "current" don't match.
// -------------------------
router.get('/:id(\\d+)', ctrl.getEvent);
router.put('/:id(\\d+)', upload.array('images[]', 50), ctrl.updateEvent);
router.delete('/:id(\\d+)', ctrl.deleteEvent);

// -------------------------
// Fallback: if you want to catch invalid id patterns and return 404
// (optional) — uncomment if you prefer an explicit 404 for non-numeric id paths
// -------------------------
// router.get('/:anything', (req, res) => res.status(404).json({ error: 'Not found' }));

module.exports = router;
