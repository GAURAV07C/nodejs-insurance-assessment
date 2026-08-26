# Insurance Assessment API

A Node.js + TypeScript backend service for managing insurance assessment data (policies, agents, carriers, users, accounts, lines of business, and scheduled messages). Built with **Express 5**, **MongoDB** (via Mongoose), and documented with **Swagger/OpenAPI**.

## Features

- RESTful API built on Express 5
- MongoDB persistence with Mongoose models and indexes
- Interactive API documentation via Swagger UI
- Structured logging with Pino (pretty-printed in development)
- Health check endpoint for monitoring
- File upload support (Multer) and Excel parsing (`xlsx`)
- Scheduled job support via `node-cron`
- TypeScript with strict type checking and source maps

## Tech Stack

| Area        | Technology                          |
| ----------- | ----------------------------------- |
| Runtime     | Node.js (CommonJS)                  |
| Language    | TypeScript                          |
| Framework   | Express 5                           |
| Database    | MongoDB + Mongoose                  |
| Docs        | swagger-jsdoc + swagger-ui-express  |
| Logging     | Pino + pino-pretty                  |
| Uploads     | Multer                              |
| Excel       | xlsx                                |
| Scheduling  | node-cron                           |
| Testing     | Jest + Supertest                    |

## Project Structure

```
src/
├── index.ts            # Entry point: loads env, connects DB, starts server
├── app.ts              # Express app, middleware, /health route
├── config/
│   ├── database.ts     # MongoDB connection helper
│   ├── logger.ts       # Pino logger configuration
│   └── swagger.ts      # Swagger/OpenAPI setup
└── models/             # Mongoose schemas & models
    ├── Agent.ts
    ├── Carrier.ts
    ├── LOB.ts          # Line of Business
    ├── Message.ts      # Scheduled message jobs
    ├── Policy.ts       # Policy records (links to Agent/User/Account/LOB/Carrier)
    ├── User.ts
    └── UserAccount.ts
```

## Prerequisites

- Node.js 18+ (ES2022)
- MongoDB instance (local or Atlas)

## Getting Started

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Configure environment variables**

   Create a `.env` file in the project root (see `.env` for the template):

   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/insurance_assessment
   NODE_ENV=development
   LOG_LEVEL=info
   ```

   > For MongoDB Atlas, replace `MONGODB_URI` with your connection string, e.g.
   > `mongodb+srv://<user>:<password>@<cluster>.mongodb.net/insurance_assessment`

3. **Run the application**

   Development (with hot reload):

   ```bash
   npm run dev
   ```

   Production build & start:

   ```bash
   npm run build
   npm start
   ```

   The server listens on `http://localhost:5000` by default (or the `PORT` set in `.env`).

## Scripts

| Command           | Description                                   |
| ----------------- | --------------------------------------------- |
| `npm run dev`     | Run with `tsx` watch mode (hot reload)        |
| `npm run build`   | Compile TypeScript to `dist/`                 |
| `npm start`       | Run the compiled output from `dist/`          |
| `npm test`        | Run the Jest test suite (with Supertest)      |

## API & Documentation

- **Health check:** `GET /health`
- **Swagger UI:** `http://localhost:5000/api-docs`
- **OpenAPI JSON:** `http://localhost:5000/api-docs.json`

You can also send requests using the sample calls in [`test.http`](./test.http) with an HTTP client that supports `.http` files (e.g. VS Code REST Client).

### Data Models

- **Agent** — unique `agentName`
- **Carrier** — unique `companyName`
- **LOB** — Line of Business with unique `categoryName`
- **User** — insured/primary user (`email` unique & sparse, `firstName` required)
- **UserAccount** — unique on `accountName` + `accountType`
- **Policy** — links to `Agent`, `User`, `UserAccount`, `LOB`, and `Carrier`; unique `policyNumber`
- **Message** — scheduled jobs with `status` (`scheduled` | `completed` | `failed`)

## Environment Variables

| Variable      | Description                                   | Default        |
| ------------- | --------------------------------------------- | -------------- |
| `PORT`        | Port the server listens on                    | `5000`         |
| `MONGODB_URI` | MongoDB connection string                     | —              |
| `NODE_ENV`    | `development` / `production` (affects logging)| `development`  |
| `LOG_LEVEL`   | Pino log level (e.g. `info`, `debug`)         | `info`         |

## License

ISC
