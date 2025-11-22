const Client = require('ssh2-sftp-client');

/**
 * Creates an SFTP client with the provided credentials
 * @param {Object} credentials - SFTP connection credentials
 * @param {string} credentials.host - SFTP server host
 * @param {number} credentials.port - SFTP server port
 * @param {string} credentials.username - SFTP username
 * @param {string} credentials.password - SFTP password
 * @returns {Promise<Object>} Connected SFTP client
 */
async function createSftpClient(credentials) {
  const sftp = new Client();
  
  try {
    await sftp.connect({
      host: credentials.host,
      port: credentials.port || 22,
      username: credentials.username,
      password: credentials.password
    });
    
    return sftp;
  } catch (error) {
    throw new Error(`Failed to connect to SFTP server: ${error.message}`);
  }
}

module.exports = { createSftpClient };
