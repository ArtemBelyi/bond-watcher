import { loadConfig } from './config/index.js';
import { createLogger } from './logger.js';

function main(): void {
  let config;
  try {
    config = loadConfig();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }

  const logger = createLogger(config.logLevel);
  logger.info('started');

  const keepAlive = setInterval(() => undefined, 2_147_483_647);

  const shutdown = (signal: string): void => {
    logger.info({ signal }, 'shutdown');
    clearInterval(keepAlive);
    process.exit(0);
  };

  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

main();
