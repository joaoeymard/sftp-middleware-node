const express = require('express');
const multer = require('multer');
const path = require('path');
const { validateSftpCredentials } = require('../middlewares/sftpAuth');
const { uploadFile, listFiles, moveFile, downloadFile } = require('../controllers/sftpController');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../../uploads'));
  },
  filename: function (req, file, cb) {
    // Use timestamp to avoid file name conflicts
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

// All routes require SFTP credentials
router.use(validateSftpCredentials);

/**
 * POST /upload
 * Upload a file to SFTP server
 * Headers: sftp-id (UUID que referencia as credenciais armazenadas)
 * Body: multipart/form-data with 'file' field
 * Query: remotePath (optional, default: /)
 */
router.post('/upload', upload.single('file'), uploadFile);

/**
 * GET /list
 * List files from SFTP server
 * Headers: sftp-id (UUID que referencia as credenciais armazenadas)
 * Query: remotePath (optional, default: /)
 */
router.get('/list', listFiles);

/**
 * GET /download
 * Download a file from SFTP server
 * Headers: sftp-id (UUID que referencia as credenciais armazenadas)
 * Query: remoteFilePath (required)
 */
router.get('/download', downloadFile);

/**
 * POST /move
 * Move/rename a file or directory on the SFTP server
 * Headers: sftp-id (UUID que referencia as credenciais armazenadas)
 * Query: from (source path), to (destination path)
 */
router.post('/move', moveFile);

module.exports = router;
