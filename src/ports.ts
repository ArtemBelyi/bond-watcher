export type Bond = {
  figi: string;
  ticker: string;
  name: string;
  currency: string;
  maturityDate?: Date;
  couponPercent?: number;
};

export type BondsSource = {
  getBonds(): Promise<Bond[]>;
};

export type Notifier = {
  send(text: string): Promise<void>;
};
