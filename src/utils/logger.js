const fs = require('fs');
const path = require('path');

const logDir = path.join(__dirname, '../logs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const logLevels = {
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  DEBUG: 'DEBUG',
};

const getTimestamp = () => {
  return new Date().toISOString();
};

const formatLog = (level, message, source = 'APP') => {
  return `[${getTimestamp()}] [${level}] [${source}] ${message}`;
};

const writeLog = (level, message, source) => {
  const logEntry = formatLog(level, message, source);
  console.log(logEntry);
  
  const logFile = path.join(logDir, `${new Date().toISOString().split('T')[0]}.log`);
  fs.appendFileSync(logFile, logEntry + '\n');
};

const logger = {
  info: (message, source = 'APP') => writeLog(logLevels.INFO, message, source),
  warn: (message, source = 'APP') => writeLog(logLevels.WARN, message, source),
  error: (message, source = 'APP') => writeLog(logLevels.ERROR, message, source),
  debug: (message, source = 'APP') => writeLog(logLevels.DEBUG, message, source),
};

module.exports = logger;