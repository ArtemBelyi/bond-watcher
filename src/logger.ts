import pino, { type Logger } from 'pino';
import type { LogLevel } from './config/index.js';

/**
 * Creates a pino logger with token redaction.
 */
export function createLogger(level: LogLevel): Logger {
  return pino({
    level,
    redact: {
      paths: [
        'tinvestToken',
        'telegramBotToken',
        '*.token',
        '*.botToken',
        '*.tinvestToken',
        '*.telegramBotToken',
      ],
      censor: '[redacted]',
    },
  });
}
