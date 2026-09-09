export const TELEGRAM_MAX_MESSAGE_LENGTH = 4096;

type TelegramApiResponse = {
  ok: boolean;
  description?: string;
};

/**
 * Splits a message into chunks sized for Telegram, only between lines.
 */
export function splitTelegramMessage(
  text: string,
  maxLength = TELEGRAM_MAX_MESSAGE_LENGTH,
): string[] {
  if (text.length <= maxLength) {
    return [text];
  }

  const lines = text.split('\n');
  const chunks: string[] = [];
  let current = '';

  for (const line of lines) {
    const candidate = current === '' ? line : `${current}\n${line}`;
    if (candidate.length <= maxLength) {
      current = candidate;
      continue;
    }

    if (current !== '') {
      chunks.push(current);
      current = '';
    }

    if (line.length <= maxLength) {
      current = line;
      continue;
    }

    chunks.push(...splitOversizedLine(line, maxLength));
  }

  if (current !== '') {
    chunks.push(current);
  }

  return chunks;
}

function splitOversizedLine(line: string, maxLength: number): string[] {
  const parts: string[] = [];
  let index = 0;

  while (index < line.length) {
    let end = Math.min(index + maxLength, line.length);
    const slice = line.slice(index, end);
    const lastOpen = slice.lastIndexOf('<');
    const lastClose = slice.lastIndexOf('>');

    if (lastOpen > lastClose && end < line.length) {
      const cut = index + lastOpen;
      end = cut > index ? cut : end;
    }

    parts.push(line.slice(index, end));
    index = end;
  }

  return parts;
}

export function isTelegramApiResponse(value: unknown): value is TelegramApiResponse {
  return (
    typeof value === 'object' &&
    value !== null &&
    'ok' in value &&
    typeof value.ok === 'boolean'
  );
}

export function telegramErrorMessage(payload: unknown, text: string): string {
  if (
    isTelegramApiResponse(payload) &&
    payload.description !== undefined &&
    payload.description !== ''
  ) {
    return payload.description;
  }
  return text;
}