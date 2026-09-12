import { NodeApiClient } from "@ttech-pub/grpc-node-client";
import { withRetry } from "./utils/retry.js";
import { withTimeout } from "./infrastructure/tinkoff/instruments.utils.js";

const GRPC_TIMEOUT_MS = 30_000;

export type Bond = {
  figi: string;
  ticker: string;
  name: string;
  currency: string;
  maturityDate?: Date;
  couponPercent?: number;
};

export type FavoriteInstrument = {
  figi: string;
  ticker: string;
  name: string;
};

export type Notifier = {
  send(text: string): Promise<void>;
};

export abstract class BaseInstrument<T> {
  constructor(protected readonly client: NodeApiClient) {}

  protected async request<R>(fn: () => Promise<R>): Promise<R> {
    return withRetry(() => withTimeout(fn(), GRPC_TIMEOUT_MS));
  }

  abstract getAll(): Promise<T[]>;
}