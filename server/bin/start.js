const path = require('path')

// Try to load TypeScript build first, fallback to JS
try {
  require(path.join(__dirname, '..', 'dist', 'server', 'server.js'))
} catch {
  require(path.join(__dirname, '..', 'server.js'))
}
