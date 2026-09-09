# tbank-bond-watcher v1

Ежедневный отчёт по облигациям: T-Invest API → список бумаг → Telegram.

Долгоживущий Node.js-процесс. В 09:00 Europe/Moscow вызывает `runDailyReport()`.

## Стек

- Node.js 24.20, TypeScript (ESM, strict)
- T-Invest API — только gRPC (`@ttech-pub/invest-sdk-node`)
- Telegram Bot API (`fetch`)
- `node-cron`, `dotenv`, `pino`

## Запуск

```bash
cp .env.example .env
```

В `.env` заполнить `TINVEST_TOKEN`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.

```bash
npm start
```

Сразу прогнать отчёт при старте:

```bash
RUN_ON_START=true npm start
```

## Сборка

```bash
npm run build
npm run typecheck
```
