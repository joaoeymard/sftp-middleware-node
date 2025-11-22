/**
 * Middleware to validate SFTP credentials from request headers
 */
function validateSftpCredentials(req, res, next) {
  const { 
    'sftp-host': host, 
    'sftp-port': port, 
    'sftp-username': username, 
    'sftp-password': password 
  } = req.headers;

  if (!host || !username || !password) {
    return res.status(400).json({
      error: 'Missing SFTP credentials',
      message: 'Required headers: sftp-host, sftp-username, sftp-password'
    });
  }

  // Attach credentials to request object for later use
  req.sftpCredentials = {
    host,
    port: port ? parseInt(port, 10) : 22,
    username,
    password
  };

  next();
}

module.exports = { validateSftpCredentials };
