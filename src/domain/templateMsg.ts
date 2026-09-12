import type { Bond, FavoriteInstrument } from '../ports.js';
import { formatDate } from '../utils/date.js';
import { escapeHtml } from '../utils/template.js';

export type BondReportItem = {
  ticker: string;
  name: string;
  maturityDate?: Date;
  couponPercent?: number;
};

export type FavoriresReportItem = {
  ticker: string;
  name: string;
}

export function toReportItem(bond: Bond | FavoriteInstrument): BondReportItem {
  return {
    ticker: bond.ticker,
    name: bond.name,
  };
}

export function formatDailyReport(options: {
  items: readonly BondReportItem[];
  total: number;
  now: Date;
  timeZone: string;
}): string {
  const date = formatDate(options.now, options.timeZone);
  const lines = [
    `<b>${escapeHtml(date)} — ежедневный отчёт</b>`,
    '',
    ...options.items.map((item) => formatLine(item)),
    '',
    `показано ${options.items.length} из ${options.total}`,
  ];

  return lines.join('\n');
}

function formatLine(item: BondReportItem): string {
  const title =
    item.ticker !== ''
      ? `${escapeHtml(item.ticker)} — ${escapeHtml(item.name)}`
      : escapeHtml(item.name);

  const extras: string[] = [];

  if (extras.length === 0) {
    return title;
  }

  return `${title} (${extras.join(', ')})`;
}