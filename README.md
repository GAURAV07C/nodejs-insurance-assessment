# Insurance Policy Management API

Node.js + TypeScript backend implementation for the
InsuredMine technical assessment.

## Features

- CSV/XLSX insurance data upload
- Worker Threads for file processing
- MongoDB with separate collections
- Policy search by username
- User-wise policy aggregation
- Real-time CPU monitoring
- Automatic restart using PM2
- Scheduled message service
- Graceful shutdown
- Jest test suite (unit + integration) with Supertest and in-memory MongoDB

## Tech Stack

- Node.js
- TypeScript
- Express.js
- MongoDB
- Mongoose
- Worker Threads
- Node Schedule
- PM2
- Jest
- Supertest
- mongodb-memory-server

## Setup

### 1. Clone

git clone <repository-url>

### 2. Install dependencies

npm install

### 3. Configure environment

cp .env.example .env

Add your MongoDB connection string in `.env` (`MONGODB_URI`).

### 4. Development

npm run dev

### 5. Build

npm run build

> Note: `npm start` runs the compiled output from `dist/`, so run `npm run build` first. The upload worker is loaded from the compiled `dist/workers` folder.

### 6. Test

npm test

## API Endpoints

### Health

GET /health

### Upload

POST /api/upload/upload

Content-Type: multipart/form-data

Field:
file

### Search Policy

GET /api/policies/search?username=John

### Policy Aggregation

GET /api/policies/aggregate/users

### Schedule Message

POST /api/messages/schedule

{
  "message": "Policy renewal reminder",
  "day": "2026-08-30",
  "time": "15:30"
}

### Get Scheduled Messages

GET /api/messages/scheduled

### Cancel Scheduled Message

DELETE /api/messages/scheduled/:id

## Testing

The test suite uses **Jest** with **Supertest** (HTTP layer) and an **in-memory MongoDB** (`mongodb-memory-server`) — no external server or database is required to run the tests.

- `npm test` runs `tsc && jest` (it compiles the worker first, then runs Jest).
- Each Jest worker connects to its **own isolated database**, and all collections are cleared after every test. Tests are therefore independent and safe to run in parallel.
- Coverage includes **unit tests** (validation middleware, upload normalizers) and **integration tests** for every API endpoint, with edge cases such as missing/empty/whitespace fields, wrong types, invalid `YYYY-MM-DD` / `HH:mm` formats, past scheduling times, 404s, and skipped upload rows.

Test layout:

```text
tests/
├── unit/         # isolated logic (no DB)
├── integration/  # full HTTP flow via Supertest
├── helpers/      # fixtures + Supertest app
├── jest.setup.ts          # DB connect + per-test cleanup
├── globalSetup.ts         # starts in-memory MongoDB
└── globalTeardown.ts      # stops in-memory MongoDB
```

## API Documentation

Interactive Swagger UI is available at `/api-docs` (OpenAPI JSON at `/api-docs.json`) when the server is running.
