const express = require('express');
const sftpRoutes = require('./routes/sftpRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic request logging for SFTP calls
app.use((req, res, next) => {
  const host = req.headers['sftp-host'];
  const user = req.headers['sftp-username'];
  if (host && user)
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} sftp=${user}@${host}`)
  else
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl} sftp=missing-credentials`);
  
  next();
});

// Routes
app.use('/api/sftp', sftpRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'SFTP Middleware Node.js is running' });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'SFTP Middleware Node.js',
    endpoints: {
      health: 'GET /health',
      upload: 'POST /api/sftp/upload',
      list: 'GET /api/sftp/list',
      download: 'GET /api/sftp/download'
    },
    requiredHeaders: {
      'sftp-host': 'SFTP server hostname',
      'sftp-port': 'SFTP server port (optional, default: 22)',
      'sftp-username': 'SFTP username',
      'sftp-password': 'SFTP password'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`SFTP Middleware Node.js server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`API endpoints: http://localhost:${PORT}/api/sftp`);
});

module.exports = app;
