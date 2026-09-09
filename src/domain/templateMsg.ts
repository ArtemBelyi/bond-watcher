import type { Bond } from '../ports.js';
import { formatDate } from '../utils/date.js';
import { escapeHtml } from '../utils/template.js';

export type BondReportItem = {
  ticker: string;
  name: string;
  currency: string;
  maturityDate?: Date;
  couponPercent?: number;
};

export function toReportItem(bond: Bond): BondReportItem {
  return {
    ticker: bond.ticker,
    name: bond.name,
    currency: bond.currency,
    ...(bond.maturityDate && { maturityDate: bond.maturityDate }),
    ...(bond.couponPercent && { couponPercent: bond.couponPercent }),
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
    ...options.items.map((item) => formatLine(item, options.timeZone)),
    '',
    `показано ${options.items.length} из ${options.total}`,
  ];

  return lines.join('\n');
}

function formatLine(item: BondReportItem, timeZone: string): string {
  const title =
    item.ticker !== ''
      ? `${escapeHtml(item.ticker)} — ${escapeHtml(item.name)}`
      : escapeHtml(item.name);

  const extras: string[] = [];
  if (item.currency !== '') {
    extras.push(escapeHtml(item.currency));
  }
  if (item.maturityDate !== undefined) {
    extras.push(escapeHtml(formatDate(item.maturityDate, timeZone)));
  }

  if (extras.length === 0) {
    return title;
  }

  return `${title} (${extras.join(', ')})`;
}