# Insurance Policy Management API

[![Node.js](https://img.shields.io/badge/Node.js-v18%2B-brightgreen)](https://nodejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-v5.7-blue)](https://www.typescriptlang.org/)
[![Express](https://img.shields.io/badge/Express-v5.2-lightgrey)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-green)](https://www.mongodb.com/)
[![Tests](https://img.shields.io/badge/Tests-49%20Passed-success)](https://jestjs.io/)

Production-ready Node.js + TypeScript backend built for the **InsuredMine** technical assessment.

---


## 🎯 Overview

This system manages insurance policies, agents, users, accounts, lines of business (LOB), and carriers. It processes large XLSX/CSV insurance dataset uploads asynchronously using **Node.js Worker Threads**, aggregates policy records per user, enables real-time search, monitors CPU utilization for server auto-restarting at 70% threshold using **PM2**, and provides a scheduled message insertion background service using **Node-Schedule**.

---

## 🗄️ Database Schema Architecture

In accordance with requirement **Task 1 (4)**, data is normalized and separated into **6 distinct MongoDB collections**:

1. **`Agent`** (`agents` collection)
   - `agentName` *(indexed, unique)*
2. **`User`** (`users` collection)
   - `firstName`, `email` *(indexed)*, `userType`, `dob`, `address`, `phone`, `state`, `zip`, `gender`, `city`, `primary`, `applicantId`
3. **`UserAccount`** (`useraccounts` collection)
   - `accountName`, `accountType`
4. **`LOB`** (Policy Category, `lobs` collection)
   - `categoryName`
5. **`Carrier`** (Policy Company, `carriers` collection)
   - `companyName`
6. **`Policy`** (`policies` collection)
   - `policyNumber` *(indexed, unique)*, `policyStartDate`, `policyEndDate`, `policyMode`, `producer`, `premiumAmountWritten`, `premiumAmount`, `policyType`, `csr`
   - References (ObjectIds): `agentId` ➔ `Agent`, `userId` ➔ `User`, `accountId` ➔ `UserAccount`, `lobId` ➔ `LOB`, `carrierId` ➔ `Carrier`

Additional collections for Task 2:
- **`ScheduledMessage`** (`scheduledmessages` collection): Tracks scheduled jobs and statuses (`scheduled`, `completed`, `cancelled`, `failed`).
- **`Message`** (`messages` collection): Stores executed messages inserted at the scheduled day & time.

---

## ✨ Key Features & Task Accomplishments

### Task 1
1. **Worker Threads Data Upload (`POST /api/upload`)**: Uploads attached XLSX/CSV files without blocking the main event loop. Normalizes dates, numbers, strings, and bulk upserts records into MongoDB.
2. **Policy Search by Username (`GET /api/policies/search?username=...`)**: Searches policies using a user's first name or email (supports case-insensitive partial match regex) and returns populated relational details.
3. **Policy Aggregation by User (`GET /api/policies/aggregate/users`)**: Aggregates policy count for each user sorted in descending order of total policies owned.
4. **Normalized 6 MongoDB Collections**: Decoupled models for `Agent`, `User`, `UserAccount`, `LOB`, `Carrier`, and `Policy`.

### Task 2
1. **Real-time CPU Monitoring & Auto-Restart**: Real-time CPU utilization snapshot monitoring. If CPU usage crosses **70%**, the service triggers a graceful exit, and **PM2** instantly restarts the server instance.
2. **Scheduled Message Service (`POST /api/messages/schedule`)**: Accepts `message`, `day` (`YYYY-MM-DD`), and `time` (`HH:mm`), schedules execution via `node-schedule`, inserts into the `Message` collection at that exact date & time, and rehydrates pending jobs upon server restart.

---

## 🛠️ Tech Stack

- **Runtime**: Node.js (v18+)
- **Language**: TypeScript (compiles cleanly to standard JavaScript in `dist/`)
- **Framework**: Express.js
- **Database**: MongoDB & Mongoose ORM
- **Multithreading**: Node.js `worker_threads`
- **Job Scheduling**: `node-schedule`
- **Process Management**: `pm2`
- **Logger**: `pino` & `pino-pretty`
- **Documentation**: Swagger UI Express (`swagger-jsdoc`, `swagger-ui-express`)
- **Testing**: Jest, Supertest, `mongodb-memory-server`

---

## 📂 Project Directory Structure

```text
nodejs-insurance-assessment/
├── dist/                     # Compiled JavaScript output
├── ecosystem.config.js       # PM2 cluster/process configuration
├── package.json              # Dependencies and scripts
├── tsconfig.json             # TypeScript config
├── test.http                 # REST client test file
├── uploads/                  # Temporary file upload directory
├── src/
│   ├── app.ts                # Express app initialization
│   ├── index.ts              # Entry point (DB connect, server listen, shutdown handlers)
│   ├── config/               # Database, logger, env, and swagger config
│   ├── controllers/          # Request handlers (upload, policy, message)
│   ├── middleware/           # File upload filter, validation, error handler
│   ├── models/               # Mongoose collection schemas
│   ├── routes/               # Express API routes
│   ├── services/             # Business logic (CPU monitor, scheduler, aggregation)
│   ├── utils/                # Helper utilities
│   └── workers/              # Worker Threads (upload.worker.ts)
└── tests/                    # Unit and integration test suite
    ├── helpers/
    ├── integration/
    └── unit/
```

---

## 🚀 Getting Started & Installation

### 1. Prerequisites
- Node.js (v18 or higher)
- MongoDB running locally or a MongoDB Atlas URI

### 2. Installation

```bash
git clone https://github.com/GAURAV07C/nodejs-insurance-assessment
cd nodejs-insurance-assessment
npm install
```

### 3. Environment Setup

```bash
cp .env.example .env
```

Set your MongoDB connection string in `.env`:
```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/insurance_assessment
CPU_THRESHOLD=70
CPU_MONITOR_INTERVAL=5000
```

### 4. Build TypeScript to JavaScript

```bash
npm run build
```

### 5. Running the Application

**Production Mode:**
```bash
npm start
```

**Development Mode:**
```bash
npm run dev
```

**PM2 Cluster / Production Daemon Mode:**
```bash
npm run pm2:start
```

---

## 📖 API Documentation & cURL Examples

Interactive Swagger Documentation is available live at `http://localhost:5000/api-docs`.

### 1. Health Check
- **GET** `/health`
```bash
curl -X GET http://localhost:5000/health
```

### 2. Upload Insurance Data (Worker Thread)
- **POST** `/api/upload`
- **Content-Type**: `multipart/form-data`
```bash
curl -X POST http://localhost:5000/api/upload \
  -F "file=@data-sheet.xlsx"
```

### 3. Search Policy Info by Username
- **GET** `/api/policies/search?username={name_or_email}`
```bash
curl -X GET "http://localhost:5000/api/policies/search?username=John"
```

### 4. Aggregate Policies by Each User
- **GET** `/api/policies/aggregate/users`
```bash
curl -X GET http://localhost:5000/api/policies/aggregate/users
```

### 5. Schedule Message Service
- **POST** `/api/messages/schedule`
- **Content-Type**: `application/json`
```bash
curl -X POST http://localhost:5000/api/messages/schedule \
  -H "Content-Type: application/json" \
  -d '{
    "message": "Policy renewal reminder for client",
    "day": "2026-08-30",
    "time": "15:30"
  }'
```

### 6. Get Scheduled Messages
- **GET** `/api/messages/scheduled`
```bash
curl -X GET http://localhost:5000/api/messages/scheduled
```

### 7. Cancel Scheduled Message
- **DELETE** `/api/messages/scheduled/:id`
```bash
curl -X DELETE http://localhost:5000/api/messages/scheduled/64b2f0c2c2a4f0c2c2a4f0c2
```

---

## 💻 CPU Monitoring & PM2 Auto-Restart

Real-time CPU tracking is active in `src/services/cpu-monitor.service.ts`:
- Samples OS CPU ticks periodically (`CPU_MONITOR_INTERVAL=5000` ms).
- Calculates multi-core CPU utilization percentage.
- If usage exceeds **70%** (`CPU_THRESHOLD=70`), it logs a warning and exits the process (`process.exit(1)`).
- When deployed with **PM2** (`ecosystem.config.js`), PM2 automatically restarts the process immediately to ensure maximum availability and fault tolerance.

To test PM2 management:
```bash
npm run pm2:start
npm run pm2:logs
npm run pm2:restart
npm run pm2:stop
```

---

## 🧪 Testing Suite

The project includes 49 comprehensive unit & integration tests covering all endpoints, edge cases (invalid payload formats, past times, missing files, non-existent users), and worker threads.

Tests run using **Jest** + **Supertest** + **`mongodb-memory-server`** (in-memory MongoDB, requiring zero setup).

```bash
npm test
```

```text
Test Suites: 6 passed, 6 total
Tests:       49 passed, 49 total
Snapshots:   0 total
Time:        10.899 s
```

---

## 📜 License

This project is licensed under the ISC License.
