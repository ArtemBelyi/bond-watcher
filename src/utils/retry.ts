import { sleep } from './time.js';

export type RetryOptions = {
  attempts?: number;
  baseDelayMs?: number;
};

const NON_RETRYABLE_GRPC_CODES = new Set([3, 5, 6, 7, 9, 11, 16]);

/**
 * Network errors are retryable; HTTP 4xx and client gRPC errors are not.
 */
export function isNonRetryable(error: unknown): boolean {
  if (typeof error !== 'object' || error === null) {
    return false;
  }

  if ('code' in error) {
    const code = error.code;
    if (typeof code === 'number') {
      return NON_RETRYABLE_GRPC_CODES.has(code);
    }
    if (typeof code === 'string' && code === 'UNAUTHENTICATED') {
      return true;
    }
  }

  if (
    'status' in error &&
    typeof error.status === 'number' &&
    error.status >= 400 &&
    error.status < 500
  ) {
    return true;
  }

  return false;
}

/**
 * Retries the async fn with exponential backoff.
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {},
): Promise<T> {
  const attempts = options.attempts ?? 3;
  const baseDelayMs = options.baseDelayMs ?? 500;
  let lastError: unknown;

  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (isNonRetryable(error) || attempt === attempts) {
        throw error;
      }
      await sleep(baseDelayMs * 2 ** (attempt - 1));
    }
  }

  throw lastError;
}