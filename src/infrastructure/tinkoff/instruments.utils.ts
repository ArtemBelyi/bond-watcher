import type { Bond as GrpcBond } from '@ttech-pub/grpc-node-client';
import type { Bond } from '../../ports.js';

export function mapBond(instrument: GrpcBond): Bond {
  const bond: Bond = {
    figi: instrument.figi,
    ticker: instrument.ticker,
    name: instrument.name,
    currency: instrument.currency,
  };

  if (instrument.maturityDate !== undefined) {
    bond.maturityDate = instrument.maturityDate;
  }

  return bond;
}

/**
 * Rejects with a timeout error if the wrapped promise takes too long.
 */
export async function withTimeout<T>(
  promise: Promise<T>,
  ms: number,
): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;

  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => {
      reject(new Error(`gRPC timeout after ${ms}ms`));
    }, ms);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timer !== undefined) {
      clearTimeout(timer);
    }
  }
}