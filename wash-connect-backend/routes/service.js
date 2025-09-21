const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const services = require('../Controller/serviceController');

// ensure upload dir
const uploadDir = path.join(__dirname, '..', 'uploads', 'services');
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || '.jpg');
    cb(null, `svc_${Date.now()}${ext}`);
  },
});
const upload = multer({
  storage,
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype || !file.mimetype.startsWith('image/')) return cb(new Error('Only images allowed'));
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

router.get('/by-application/:applicationId', services.getServicesByApplication);
router.post('/', services.createService);
router.patch('/:serviceId', services.updateService);
router.delete('/:serviceId', services.deleteService);

// NEW: upload/replace service image
router.post('/:serviceId/image', upload.single('image'), services.uploadServiceImage);

module.exports = router;