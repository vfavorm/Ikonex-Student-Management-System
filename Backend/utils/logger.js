const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../logs');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

const getTimestamp = () => new Date().toISOString();

const logToFile = (level, message, data = '') => {
  const logFile = path.join(logsDir, `${level.toLowerCase()}.log`);
  const logMessage = `[${getTimestamp()}] ${level}: ${message} ${data}\n`;
  fs.appendFileSync(logFile, logMessage);
};

const logger = {
  info: (message, data) => {
    console.log(`[INFO] ${message}`, data || '');
    logToFile('INFO', message, JSON.stringify(data || ''));
  },
  error: (message, error) => {
    console.error(`[ERROR] ${message}`, error || '');
    logToFile('ERROR', message, error?.stack || JSON.stringify(error || ''));
  },
  warn: (message, data) => {
    console.warn(`[WARN] ${message}`, data || '');
    logToFile('WARN', message, JSON.stringify(data || ''));
  },
  debug: (message, data) => {
    console.log(`[DEBUG] ${message}`, data || '');
    logToFile('DEBUG', message, JSON.stringify(data || ''));
  }
};

module.exports = logger;
