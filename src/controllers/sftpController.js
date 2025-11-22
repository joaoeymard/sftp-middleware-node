const path = require('path');
const fs = require('fs').promises;
const { createSftpClient } = require('../config/sftp');

/**
 * Upload file to SFTP server
 */
async function uploadFile(req, res) {
  let sftp = null;
  
  try {
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Get remote path from query parameter or use root
    const remotePath = req.query.remotePath || '/';
    const remoteFilePath = path.posix.join(remotePath, req.file.originalname);
    
    // Connect to SFTP server
    sftp = await createSftpClient(req.sftpCredentials);
    
    // Upload file
    const localFilePath = req.file.path;
    await sftp.put(localFilePath, remoteFilePath);
    
    // Clean up local file
    await fs.unlink(localFilePath);
    
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
    const remotePath = req.query.remotePath || '/';
    
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
        modifyTime: file.modifyTime,
        accessTime: file.accessTime,
        rights: file.rights
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
 * Download file from SFTP server
 */
async function downloadFile(req, res) {
  let sftp = null;
  
  try {
    // Get remote file path from query parameter
    const remoteFilePath = req.query.remoteFilePath;
    
    if (!remoteFilePath) {
      return res.status(400).json({ 
        error: 'Missing remoteFilePath parameter' 
      });
    }
    
    // Connect to SFTP server
    sftp = await createSftpClient(req.sftpCredentials);
    
    // Generate local file path
    const fileName = path.basename(remoteFilePath);
    const localFilePath = path.join(__dirname, '../../downloaded', fileName);
    
    // Download file
    await sftp.get(remoteFilePath, localFilePath);
    
    // Send file to client
    res.download(localFilePath, fileName, async (err) => {
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

module.exports = { uploadFile, listFiles, downloadFile };
