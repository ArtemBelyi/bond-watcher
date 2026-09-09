import 'dotenv/config';

export type LogLevel =
  | 'fatal'
  | 'error'
  | 'warn'
  | 'info'
  | 'debug'
  | 'trace'
  | 'silent';

export type Config = {
  tinvestToken: string;
  tinvestApiUrl: string;
  telegramBotToken: string;
  telegramChatId: string;
  cronSchedule: string;
  timezone: string;
  runOnStart: boolean;
  reportLimit: number;
  logLevel: LogLevel;
};

const LOG_LEVELS = new Set<string>([
  'fatal',
  'error',
  'warn',
  'info',
  'debug',
  'trace',
  'silent',
]);

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) {
    throw new Error(`Missing required env: ${name}`);
  }
  return value;
}

function optional(name: string, fallback: string): string {
  const value = process.env[name]?.trim();
  return value === undefined || value === '' ? fallback : value;
}

function parseBoolean(name: string, fallback: boolean): boolean {
  const value = process.env[name]?.trim().toLowerCase();
  if (value === undefined || value === '') {
    return fallback;
  }
  if (value === 'true' || value === '1') {
    return true;
  }
  if (value === 'false' || value === '0') {
    return false;
  }
  throw new Error(`Invalid boolean env: ${name}`);
}

function parsePositiveInt(name: string, num: number): number {
  const raw = process.env[name]?.trim();
  if (raw === undefined || raw === '') {
    return num;
  }
  const parsed = Number(raw);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new Error(`Invalid integer env: ${name}`);
  }
  return parsed;
}

function parseLogLevel(name: string, fallback: LogLevel): LogLevel {
  const raw = process.env[name]?.trim().toLowerCase();
  if (raw === undefined || raw === '') {
    return fallback;
  }
  if (!LOG_LEVELS.has(raw)) {
    throw new Error(`Invalid log level env: ${name}`);
  }
  return raw as LogLevel;
}

/**
 * Reads process env into a typed Config. Throws if required fields are missing.
 */
export function loadConfig(): Config {
  return {
    tinvestToken: required('TINVEST_TOKEN'),
    tinvestApiUrl: optional(
      'TINVEST_API_URL',
      'invest-public-api.tbank.ru:443',
    ),
    telegramBotToken: required('TELEGRAM_BOT_TOKEN'),
    telegramChatId: required('TELEGRAM_CHAT_ID'),
    cronSchedule: optional('CRON_SCHEDULE', '0 9 * * *'),
    timezone: optional('TZ', 'Europe/Moscow'),
    runOnStart: parseBoolean('RUN_ON_START', false),
    reportLimit: parsePositiveInt('REPORT_LIMIT', 5),
    logLevel: parseLogLevel('LOG_LEVEL', 'info'),
  };
}
