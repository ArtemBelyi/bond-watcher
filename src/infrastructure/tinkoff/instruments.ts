import { InstrumentStatus } from '@ttech-pub/grpc-node-client';
import {
  GetBondsCommand,
  type InvestNodeSDK,
} from '@ttech-pub/invest-sdk-node';
import type { Bond, BondsSource } from '../../ports.js';
import { withRetry } from '../../utils/retry.js';
import {
  mapBond,
  withTimeout,
} from './instruments.utils.js';

const GRPC_TIMEOUT_MS = 30_000;

export class InstrumentsService implements BondsSource {
  constructor(private readonly sdk: InvestNodeSDK) {}

  /**
   * Loads the base trading list of bonds and maps them to domain Bond.
   */
  async getBonds(): Promise<Bond[]> {
    const response = await withRetry(() =>
      withTimeout(
        this.sdk.send(
          new GetBondsCommand({
            instrumentStatus: InstrumentStatus.INSTRUMENT_STATUS_BASE,
          }),
        ),
        GRPC_TIMEOUT_MS,
      ),
    );

    return response.instruments.map(mapBond);
  }

  /**
   * Not implemented in v1.
   */
  getBondBy(_idType: string, _id: string): Promise<Bond> {
    throw new Error('not implemented');
  }

  /**
   * Not implemented in v1.
   */
  getBondCoupons(_figi: string, _from: Date, _to: Date): Promise<never> {
    throw new Error('not implemented');
  }

  /**
   * Not implemented in v1.
   */
  getBondEvents(_figi: string, _from: Date, _to: Date): Promise<never> {
    throw new Error('not implemented');
  }

  /**
   * Not implemented in v1.
   */
  getAccruedInterests(_figi: string, _from: Date, _to: Date): Promise<never> {
    throw new Error('not implemented');
  }

  /**
   * Not implemented in v1.
   */
  getInstrumentBy(_idType: string, _id: string): Promise<never> {
    throw new Error('not implemented');
  }

  /**
   * Not implemented in v1.
   */
  findInstrument(_query: string): Promise<never> {
    throw new Error('not implemented');
  }
}
