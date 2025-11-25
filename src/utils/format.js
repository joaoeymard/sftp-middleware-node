// Format rights object into ls-style string (e.g., -rw-r--r--)
function formatRights(type, rights) {
  const prefix = type === 'd' ? 'd' : type === 'l' ? 'l' : '-';
  const cleanSegment = (segment = '') => {
    const normalized = segment.padEnd(3, '-').slice(0, 3);
    return normalized
      .split('')
      .map(char => (char === 'r' || char === 'w' || char === 'x' ? char : '-'))
      .join('');
  };

  return `${prefix}${cleanSegment(rights?.user)}${cleanSegment(rights?.group)}${cleanSegment(rights?.other)}`;
}

// Convert timestamp (ms) to ISO string in UTC, fallback to null on invalid
function formatUtc(timestamp) {
  if (timestamp === undefined || timestamp === null) return null;
  const date = new Date(timestamp);
  return isNaN(date.getTime()) ? null : date.toISOString();
}

// Normalize and validate remote path for SFTP operations
function normalizeRemotePath(inputPath) {
  if (!inputPath || typeof inputPath !== 'string') return null;
  const cleaned = inputPath.replace(/\\/g, '/');
  const normalized = path.posix.normalize(cleaned);
  if (normalized.includes('..')) return null;
  if (!normalized.startsWith('/')) {
    return '/' + normalized.replace(/^\/+/, '');
  }
  return normalized;
}


module.exports = { formatRights, formatUtc, normalizeRemotePath };
