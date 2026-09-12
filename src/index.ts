import { loadConfig } from './config/index.js';
import {
  formatDailyReport,
  toReportItem,
} from './domain/templateMsg.js';
import { take } from './utils/array.js';
import {
  closeApiClient,
  initApiClient,
} from './infrastructure/tinkoff/sdk.js';
import { BondSource, FavoritesSource } from './infrastructure/tinkoff/instruments.js';
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

  const client = await initApiClient({
    token: config.tinvestToken,
    url: config.tinvestApiUrl,
  });

  const bondSource = new BondSource(client);
  const favorieSource = new FavoritesSource(client);

  const notifier = new TelegramNotifier(
    config.telegramBotToken,
    config.telegramChatId,
  );

  logger.info('started');

  try {
    // TODO
    const bonds = await bondSource.getAll();
    const favorites = await favorieSource.getAll();

    const items = take(favorites, config.reportLimit).map(toReportItem);
    const text = formatDailyReport({
      items,
      total: favorites.length,
      now: new Date(),
      timeZone: config.timezone,
    });

    await notifier.send(text);

    logger.info(
      { shown: items.length, total: favorites.length },
      'telegram sent',
    );

  } catch (error) {
    logger.error({ err: error }, 'telegram report failed');
  }

  const shutdown = async (signal: string): Promise<void> => {
    logger.info({ signal }, 'shutdown');
    await closeApiClient(client);
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
