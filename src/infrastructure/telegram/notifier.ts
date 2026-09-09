import type { Notifier } from '../../ports.js';
import { withRetry } from '../../utils/retry.js';
import { 
  splitTelegramMessage, 
  telegramErrorMessage, 
  isTelegramApiResponse
} from './notifier.utils.js';

const TELEGRAM_TIMEOUT_MS = 15_000;

class TelegramHttpError extends Error {
  readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'TelegramHttpError';
    this.status = status;
  } 
}

export class TelegramNotifier implements Notifier {
  constructor(
    private readonly botToken: string,
    private readonly chatId: string,
  ) {}

  /**
   * Sends an HTML message, splitting it into sequential chunks if needed.
   */
  async send(text: string): Promise<void> {
    const chunks = splitTelegramMessage(text);
    for (const chunk of chunks) {
      await withRetry(() => this.sendChunk(chunk));
    }
  }

  private async sendChunk(text: string): Promise<void> {
    console.log("sendChunk", text);
    const response = await fetch(
      `https://api.telegram.org/bot${this.botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          chat_id: this.chatId,
          text,
          parse_mode: 'HTML',
          disable_web_page_preview: true,
        }),
        signal: AbortSignal.timeout(TELEGRAM_TIMEOUT_MS),
      },
    );

    const payload: unknown = await response.json().catch(() => undefined);

    if (!response.ok) {
      throw new TelegramHttpError(
        response.status,
        telegramErrorMessage(payload, `HTTP ${response.status}`),
      );
    }

    if (!isTelegramApiResponse(payload) || !payload.ok) {
      throw new Error(telegramErrorMessage(payload, 'Telegram API error'));
    }
  }
}