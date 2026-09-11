import { loadConfig } from './config/index.js';
import {
  formatDailyReport,
  toReportItem,
} from './domain/templateMsg.js';
import { take } from './utils/array.js';
import {
  closeTinvestSdk,
  initTinvestSdk,
  initNodeApiClient,
} from './infrastructure/tinkoff/sdk.js';
import { InstrumentsService } from './infrastructure/tinkoff/instruments.js';
import { TelegramNotifier } from './infrastructure/telegram/notifier.js';
import { createLogger } from './logger.js';

async function main(): Promise<void> {
  let config;
  try {
    config = loadConfig();
  } catch (error) {
    console.error(error instanceof Error ? error.message : error);
    process.exit(1);
  }

  const logger = createLogger(config.logLevel);

  const sdk = await initTinvestSdk({
    token: config.tinvestToken,
    url: config.tinvestApiUrl,
  });

  // TODO
  const client = await initNodeApiClient({
    token: config.tinvestToken,
    url: config.tinvestApiUrl,
  });

  const instruments = new InstrumentsService(sdk);
  const notifier = new TelegramNotifier(
    config.telegramBotToken,
    config.telegramChatId,
  );

  logger.info('started');

  try {
    const bonds = await instruments.getBonds();
    const items = take(bonds, config.reportLimit).map(toReportItem);
    const text = formatDailyReport({
      items,
      total: bonds.length,
      now: new Date(),
      timeZone: config.timezone,
    });

    await notifier.send(text);

    logger.info(
      { shown: items.length, total: bonds.length },
      'telegram sent',
    );

  } catch (error) {
    logger.error({ err: error }, 'telegram report failed');
  }

  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, 'shutdown');
    await closeTinvestSdk(sdk);
    process.exit(0);
  };

  process.on('SIGINT', () => {
    void shutdown('SIGINT');
  });
  process.on('SIGTERM', () => {
    void shutdown('SIGTERM');
  });
}

void main();
