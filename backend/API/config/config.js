require('dotenv').config();
const fs = require('fs');
const path = require('path');

// Read the config file
const configPath = path.resolve(__dirname, 'config.json');
let configJson = fs.readFileSync(configPath, 'utf8');

// Replace environment variable placeholders
configJson = configJson.replace(/\${process\.env\.([^}]+)}/g, (match, varName) => {
  return process.env[varName] || '';
});

// Parse the config
const config = JSON.parse(configJson);

module.exports = config; 