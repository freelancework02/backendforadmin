// routes/eventsRoutes.js
const express = require('express');
const router = express.Router();
const multer = require('multer');

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 8 * 1024 * 1024, files: 50 }
});

const ctrl = require('../Controller/eventsController');

// Single-image endpoints
router.post('/image', upload.single('image'), ctrl.createImage);
router.get('/image/:imageId/blob', ctrl.getImageBlob);
router.delete('/image/:imageId', ctrl.deleteImage);

// NEW: current & previous events
router.get('/current', ctrl.listCurrentEvents);
router.get('/previous', ctrl.listPreviousEvents);

// All events
router.get('/', ctrl.listEvents);

// Routes by numeric ID only
router.get('/:id', ctrl.getEvent);
router.put('/:id', upload.array('images[]', 50), ctrl.updateEvent);
router.delete('/:id', ctrl.deleteEvent);

module.exports = router;
