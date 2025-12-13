const fs = require('fs').promises;
const path = require('path');

const CREDENTIALS_FILE =
  process.env.SFTP_CREDENTIALS_FILE || path.join(__dirname, '../../sftp-credentials.json');

/**
 * Middleware to load SFTP credentials from local JSON storage using a UUID header.
 */
async function validateSftpCredentials(req, res, next) {
  const credentialId = req.headers['sftp-id'];

  if (!credentialId) {
    return res.status(400).json({
      error: 'Missing SFTP credential identifier',
      message: 'Header sftp-id is required'
    });
  }

  try {
    const storeContent = await fs.readFile(CREDENTIALS_FILE, 'utf8');
    const credentialStore = JSON.parse(storeContent);
    const credential = credentialStore?.[credentialId];

    if (!credential) {
      return res.status(404).json({
        error: 'Credential not found',
        message: 'No SFTP credentials found for provided identifier'
      });
    }

    const { host, port, username, password } = credential;

    if (!host || !username || !password) {
      return res.status(500).json({
        error: 'Incomplete credential data',
        message: 'Stored credential is missing host, username or password'
      });
    }

    let portNumber = 22;
    if (port !== undefined) {
      portNumber = parseInt(port, 10);
      if (isNaN(portNumber) || portNumber < 1 || portNumber > 65535) {
        return res.status(400).json({
          error: 'Invalid port number',
          message: 'Port must be a valid integer between 1 and 65535'
        });
      }
    }

    req.sftpCredentials = {
      host,
      port: portNumber,
      username,
      password
    };

    next();
  } catch (error) {
    console.error('Failed to load SFTP credentials:', error);
    return res.status(500).json({
      error: 'Failed to load credentials',
      message: 'Could not read or parse credentials store'
    });
  }
}

module.exports = { validateSftpCredentials };
