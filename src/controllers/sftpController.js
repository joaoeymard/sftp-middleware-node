const path = require('path');
const fs = require('fs').promises;
const crypto = require('crypto');
const { createSftpClient } = require('../config/sftp');
const { formatRights, formatUtc, normalizeRemotePath } = require('../utils/format');


/**
 * Upload file to SFTP server
 */
async function uploadFile(req, res) {
  let sftp = null;
  let localFilePath = null;
  
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    localFilePath = req.file.path;

    // Get remote path from query parameter or use root
    const remotePath = req.query.path || '/';
    const remoteFilePath = path.posix.join(remotePath, req.file.originalname);
    
    // Connect to SFTP server
    sftp = await createSftpClient(req.sftpCredentials);
    
    // Upload file
    await sftp.put(localFilePath, remoteFilePath);
    
    res.json({
      message: 'File uploaded successfully',
      filename: req.file.originalname,
      remotePath: remoteFilePath
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to upload file',
      message: error.message
    });
  } finally {
    // Clean up local file in finally block to ensure it's always removed
    if (localFilePath) {
      try {
        await fs.unlink(localFilePath);
      } catch (cleanupError) {
        console.error('Failed to cleanup uploaded file:', cleanupError);
      }
    }
    if (sftp) {
      await sftp.end();
    }
  }
}

/**
 * List files from SFTP server
 */
async function listFiles(req, res) {
  let sftp = null;
  
  try {
    // Get remote path from query parameter or use root
    const remotePath = req.query.path || '/';
    
    // Connect to SFTP server
    sftp = await createSftpClient(req.sftpCredentials);
    
    // List files
    const files = await sftp.list(remotePath);
    
    res.json({
      path: remotePath,
      files: files.map(file => ({
        name: file.name,
        type: file.type,
        size: file.size,
        modifyTime: formatUtc(file.modifyTime),
        accessTime: formatUtc(file.accessTime),
        rights: formatRights(file.type, file.rights)
      }))
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to list files',
      message: error.message
    });
  } finally {
    if (sftp) {
      await sftp.end();
    }
  }
}

/**
 * Move or rename a file/directory on the SFTP server
 */
async function moveFile(req, res) {
  let sftp = null;

  try {
    const fromPath = req.body?.from;
    const toPath = req.body?.to;

    if (!fromPath || !toPath) {
      return res.status(400).json({
        error: 'Invalid parameters',
        message: 'Provide valid from and to paths (no "..", allow absolute or relative paths)'
      });
    }

    sftp = await createSftpClient(req.sftpCredentials);
    await sftp.rename(fromPath, toPath);

    res.json({
      message: 'Moved successfully',
      from: fromPath,
      to: toPath
    });
  } catch (error) {
    res.status(500).json({
      error: 'Failed to move file/directory',
      message: error.message
    });
  } finally {
    if (sftp) {
      await sftp.end();
    }
  }
}

/**
 * Download file from SFTP server
 */
async function downloadFile(req, res) {
  let sftp = null;
  
  try {
    // Get remote file path from query parameter
    const remoteFilePath = req.query.filePath;
    
    if (!remoteFilePath) {
      return res.status(400).json({ 
        error: 'Missing remoteFilePath parameter' 
      });
    }
    
    // Connect to SFTP server
    sftp = await createSftpClient(req.sftpCredentials);
    
    // Generate secure local file path using UUID to prevent path traversal attacks
    const originalFileName = path.basename(remoteFilePath);
    // Sanitize filename more strictly - remove all special characters except alphanumeric, underscore, and dash
    const sanitizedFileName = originalFileName.replace(/[^a-zA-Z0-9_-]/g, '_');
    const safeFileName = crypto.randomUUID() + '-' + sanitizedFileName;
    const localFilePath = path.join(__dirname, '../../downloaded', safeFileName);
    
    // Download file
    await sftp.get(remoteFilePath, localFilePath);
    
    // Send file to client with sanitized filename to prevent information disclosure
    res.download(localFilePath, sanitizedFileName, async (err) => {
      // Clean up local file after download
      try {
        await fs.unlink(localFilePath);
      } catch (cleanupError) {
        console.error('Failed to cleanup file:', cleanupError);
      }
      
      if (err && !res.headersSent) {
        res.status(500).json({
          error: 'Failed to send file',
          message: err.message
        });
      }
    });
  } catch (error) {
    if (!res.headersSent) {
      res.status(500).json({
        error: 'Failed to download file',
        message: error.message
      });
    }
  } finally {
    if (sftp) {
      await sftp.end();
    }
  }
}

module.exports = { uploadFile, listFiles, moveFile, downloadFile };
