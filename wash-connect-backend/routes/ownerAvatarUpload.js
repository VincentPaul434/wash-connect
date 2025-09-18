const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const ownerAvatarUploadController = require('../Controller/ownerAvatarUploadController');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/avatars/');
  },
  filename: function (req, file, cb) {
    cb(null, `owner_${req.params.id}_${Date.now()}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage });

router.post('/carwash-owners/:id/avatar', upload.single('file'), ownerAvatarUploadController.uploadOwnerAvatar);

module.exports = router;