# AGENTS.md

Контекст для ИИ по репозиторию `tbank-bond-watcher`. Полный план — в `bond-watcher-info`.

## Что это

Долгоживущий Node.js-процесс. Каждый день в 09:00 Europe/Moscow вызывает `runDailyReport()`: T-Invest API → список облигаций → Telegram.

Точка входа: `src/index.ts`.

В будущем планируется масштабирование до торгового бота.

## Стек

Node.js 24.20 (установлено глобально), TypeScript, `node-cron`, `dotenv`, `pino`, Telegram Bot API (`fetch`).

### T-Invest API

- Протокол: **только gRPC**. REST-прокси не использовать.
- Endpoints:
  - Prod: `invest-public-api.tbank.ru:443`
  - Sandbox: `sandbox-invest-public-api.tbank.ru:443`
- Документация API: https://developer.tbank.ru/invest/intro/intro (это описание API, а не SDK).

Клиент:

1. `@ttech-pub/grpc-node-client` — официальный gRPC-клиент T-Tech (`NodeApiClient`).
   - Endpoints напрямую: `client.instruments.bonds(...)`, без command-обёрток.
   - Создание: `await NodeApiClient.create({ token, url, useMincifryCertificate: true })`.
   - Может требовать registry Т-Банка (opensource.tbank.ru). Если `npm i` не находит — добавить `.npmrc`.
2. Fallback: `tinkoff-invest-api` (vitalets) — community SDK на gRPC.
   - Создание: `new TinkoffInvestApi({ token, appName })`.

Не ставить: `@ttech-pub/invest-sdk-node` (сырой, неполный), `@ttech-pub/invest-engine-node`, `@tinkoff/invest-js`, `@ttech-pub/invest-core`.

## Слои
src/index.ts              процесс, cron, wiring
src/config/               env → Config, валидация на старте
src/ports.ts              BondsSource, Notifier, Clock
src/application/          use-cases, только оркестрация
src/domain/               чистые функции, без I/O и SDK
src/infrastructure/       реализации портов (tinkoff, telegram)

Правила импортов:
- `domain` не импортирует `infrastructure`, `config`, SDK
- `application` зависит от портов, не от конкретных клиентов
- wiring только в `index.ts`
- новый канал доставки = новый адаптер, `daily-report` не менять под канал
- хранилище позже = `infrastructure/storage`, не в domain
- SDK только в `infrastructure/tinkoff`

## Tinkoff-сервис
Обёртка над SDK, не тонкий вызов `Bonds()` из use-case.

src/infrastructure/tinkoff/sdk.ts         создание/закрытие `NodeApiClient`
src/infrastructure/tinkoff/instruments.ts InstrumentsService (обёртка над `client.instruments`)

v1 реализовать только `getBonds()` → gRPC `InstrumentsService.Bonds` (`INSTRUMENT_STATUS_BASE`).
Остальные методы — сигнатуры в том же классе, тело `throw new Error('not implemented')` (или не вызывать). Не реализовывать, пока не попросили.

Порт v1: `BondsSource { getBonds(): Promise<Bond[]> }`.
Новые use-case берут новые порты; методы дописываются в `instruments.ts`, SDK наружу не торчит.

## Команды

- `npm start` — долгоживущий процесс + cron (`tsx src/index.ts` в dev)
- `npm run build` — `tsc`,产物 в `dist/`
- `npm run typecheck` — проверка типов без компиляции
- `RUN_ON_START=true npm start` — сразу прогнать отчёт при старте
- тесты — только domain, когда появятся

## Env

Обязательные: `TINVEST_TOKEN`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`.
Остальные: `TINVEST_API_URL=invest-public-api.tbank.ru:443`, `CRON_SCHEDULE=0 9 * * *`, `TZ=Europe/Moscow`, `RUN_ON_START=false`, `LOG_LEVEL=info`.

Нет обязательного токена → exit 1. Секреты не логировать. В git только `.env.example`.
Токен readonly (instruments) достаточен для v1.

## v1 scope

Без фильтров (только `take(N)`), без YTM/цен, без Docker, БД, очередей, health-server.
Сообщение: дата MSK + список ticker/name + «показано N из M». Порядок = API.
Telegram: HTML, резать >4096 по строкам (не внутри тега), timeout на fetch.

## Реализация v1 — строго по частям

Не делать следующую часть, пока пользователь не проверил текущую и не сказал продолжать.

**Часть 1 — каркас.** `package.json`, `tsconfig.json`, `.gitignore`, `.env.example`, `src/config`, logger, пустой `src/index.ts` (старт процесса, валидация env). Поставить зависимости. Стоп: пользователь копирует `.env` и вписывает ключи. Тестирует

**Часть 2 — Tinkoff gRPC.** `sdk.ts` + `instruments.ts` (`getBonds()` + заготовки методов). При старте приложения вызвать `getBonds()`, результат в лог (число бумаг + несколько ticker/name, без токена и сырого protobuf). Cron и Telegram ещё нет. Стоп: пользователь запускает и проверяет сервис.

**Часть 3 — Telegram.** domain (`take` + HTML-формат) + `TelegramNotifier`. При старте: взять уже полученный список (или короткий фиктивный, если Tinkoff не трогаем повторно) → собрать сообщение → отправить в чат. Cron ещё нет. Стоп: пользователь проверяет чат, правит текст.

**Часть 4 — `runDailyReport` + cron.** Сценарий в `application/daily-report.ts`, wiring портов, `node-cron` 09:00 Europe/Moscow, `RUN_ON_START`, shutdown, in-flight lock. Прямой вызов gRPC/Telegram из `index.ts` убрать — только use-case.

## Рекомендации

- Проставлять комментарии в формате JSDoc для функций в сервисах
- Типизация данных

## Запреты

- Не класть SDK и HTTP в `domain` / `application`
- Не ходить в T-Invest через REST, работаем через gRPC
- Не коммитить `.env` и токены, добавить в исключения git
- Не добавлять комментарии в код без запроса
- Не внедрять Docker/sqlite/фильтры, пока это не попросили
- Не реализовывать методы Tinkoff кроме `getBonds()`, пока это не попросили
- Не использовать при типизации any
- Не перескакивать части реализации v1 без подтверждения пользователя

