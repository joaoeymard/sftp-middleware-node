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

  // Validate and parse port number
  let portNumber = 22; // default port
  if (port) {
    portNumber = parseInt(port, 10);
    if (isNaN(portNumber) || portNumber < 1 || portNumber > 65535) {
      return res.status(400).json({
        error: 'Invalid port number',
        message: 'Port must be a valid integer between 1 and 65535'
      });
    }
  }

  // Attach credentials to request object for later use
  req.sftpCredentials = {
    host,
    port: portNumber,
    username,
    password
  };

  next();
}

module.exports = { validateSftpCredentials };
