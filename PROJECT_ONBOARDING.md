# PROJECT ONBOARDING — Project Sentinel

> **The Autonomous Incident Resolution Engine**

Welcome, new developer. This document is your complete onboarding guide. It is written to take you from zero context to full understanding of this codebase — what it is, how every piece fits together, and what actually happens when bugs strike.

---

## Table of Contents

1. [The 10,000-Foot View (What is this?)](#1-the-10000-foot-view-what-is-this)
2. [The Tech Stack](#2-the-tech-stack)
3. [Directory Structure & Entry Points](#3-directory-structure--entry-points)
4. [Architecture & Data Flow (How it works)](#4-architecture--data-flow-how-it-works)
5. [Crucial Scripts & Commands](#5-crucial-scripts--commands)
6. [Complexities & Gotchas](#6-complexities--gotchas)
7. [Live Bug Resolution — What We Did & How It Works](#7-live-bug-resolution--what-we-did--how-it-works)

---

## 1. The 10,000-Foot View (What is this?)

### Explain Like I'm 5

Imagine you have a toy factory (your backend microservices). Sometimes a mischievous gremlin (the "Chaos Monkey") sneaks in and breaks things — maybe it jams a gear or switches two wires. Project Sentinel is like a security camera system *plus* a team of tiny robot repair workers. The camera (the "Monitor") catches the problem, writes it down on a clipboard (the database), and then a team of AI agents rush in to fix the broken toys and test that they work again, all without a human ever touching anything.

### Technical Summary

**Project Sentinel** is a demonstration of an **AI-powered autonomous incident resolution system**. It consists of three main subsystems:

| Subsystem | Role |
|---|---|
| **`/services`** (Backend Microservices) | A small TypeScript service that simulates a real production backend. This is the *target* — the thing that gets attacked and needs fixing. |
| **`/scripts`** (Automation Layer) | Contains the Chaos Monkey (attack tool), the Monitor (detection tool), the DB setup script, and incident resolution scripts. These are the "tools" the AI agents wield. |
| **`/app`** (Next.js Dashboard) | A real-time web dashboard that reads from the SQLite database and displays system health, active incidents, and resolved incidents in a live feed. |

The core loop is:

```
Chaos Monkey breaks /services
  → Monitor detects the failure and logs it to the database
    → AI Agents diagnose, fix the code, write tests, and verify
      → Monitor re-runs and confirms "Healthy"
        → Database is updated, Dashboard goes green
```

This is not a traditional web application. It is a **proof-of-concept for autonomous code repair**, where an AI coding agent acts as the "developer on-call" who responds to production incidents without human intervention.

---

## 2. The Tech Stack

### Explain Like I'm 5

Think of the tech stack as the different materials used to build a house. You need bricks (TypeScript), a blueprint system (Next.js), a filing cabinet (SQLite), paint (TailwindCSS), and a set of specialized power tools (ts-morph, ts-node, Jest). Each one has a specific job.

### Full Stack Breakdown

#### **TypeScript (The Language)**

Every single file in this project is written in TypeScript (`.ts` or `.tsx`). TypeScript is JavaScript with *types* — it forces you to declare what shape your data has (e.g., "this variable is a number, not a string"). This is critically important here because:

- The Chaos Monkey *deliberately breaks types* (e.g., removing `await` so a `Promise<User>` is treated as a `User`).
- The TypeScript compiler catches these errors at compile time, which is exactly what the Monitor relies on to detect failures.
- The `CLAUDE.md` file at the project root mandates `"strict": true`, `"noImplicitAny": true`, and `"strictNullChecks": true` — the strictest possible TypeScript settings.

**Why it matters here:** TypeScript is not just a language choice — it's a *detection mechanism*. The stricter the types, the more confidently the system can catch injected bugs.

---

#### **Node.js (The Runtime)**

Node.js is the JavaScript/TypeScript runtime that executes all the server-side code. This project uses Node.js v20+ (as specified in the CI/CD pipeline).

Two key execution methods are used:
- **`ts-node`**: A tool that compiles and runs TypeScript files directly without a separate build step. Used by `/services` for its `npm start` and `npm run dev` scripts.
- **`node --experimental-strip-types`**: A newer Node.js feature (v22+) that lets you run `.ts` files directly by stripping the type annotations at runtime. Used by `/scripts` (Chaos Monkey, Monitor, etc.).

**Why it matters here:** The Monitor script (`scripts/monitor.ts`) uses `child_process.exec()` to *spawn* the service (`services/index.ts`) as a child process using `ts-node`. If `ts-node` throws a compilation error, the Monitor catches it in `stderr` and logs it as an incident. The entire detection mechanism depends on Node.js process management.

---

#### **Next.js 16 (The Frontend Framework)**

Next.js is a React framework that provides server-side rendering, API routes, and file-based routing. The `/app` directory is a full Next.js 16 application using the **App Router** (the `app/` directory convention, not the legacy `pages/` directory).

Key files:
- `app/app/layout.tsx` — The root layout wrapping every page. Sets the dark theme, loads Inter font.
- `app/app/page.tsx` — The home page. Renders the `Header`, `MetricCards`, and `IncidentFeed` components.
- `app/app/api/status/route.ts` — A **server-side API route**. This is the bridge between the frontend and the database.

**Why it matters here:** The dashboard is not just a static page. It has a server-side API route that opens the SQLite database file directly from disk (using `better-sqlite3`), reads the `Incidents` and `SystemHealth` tables, and returns the data as JSON. The frontend components poll this API every 2 seconds using `setInterval`, creating a live feed effect.

---

#### **SQLite via `better-sqlite3` (The Database)**

SQLite is a file-based database — the entire database is a single file on disk called `sentinel.db` at the project root. There is no separate database server to run; you just read/write to a file.

`better-sqlite3` is a Node.js library that provides synchronous, high-performance access to SQLite. It is used in three places:
1. **`scripts/setupDB.ts`** — Creates the `Incidents` and `SystemHealth` tables.
2. **`scripts/monitor.ts`** — Inserts new incidents and updates system health.
3. **`app/app/api/status/route.ts`** — Reads incidents and health for the dashboard.

The database has two tables:

| Table | Columns | Purpose |
|---|---|---|
| `Incidents` | `id`, `timestamp`, `service_name`, `error_message`, `status` | Logs every detected failure. Status can be `Open`, `Investigating`, or `Resolved`. |
| `SystemHealth` | `id`, `last_poll`, `status` | Tracks the overall system state. Status is `Healthy` or `Degraded`. |

**Why it matters here:** SQLite is the **single source of truth** that connects all three subsystems. The Monitor writes to it, the Dashboard reads from it, and the resolution scripts update it. It acts as the project's "MCP" (Model Context Protocol) — a shared state that every component can query.

---

#### **TailwindCSS 4 (The Styling)**

TailwindCSS is a utility-first CSS framework. Instead of writing custom CSS classes, you compose styles directly in HTML using utility classes like `bg-slate-900`, `text-cyan-400`, `animate-pulse`, etc.

In this project, Tailwind is configured via PostCSS (see `app/postcss.config.mjs`) using the `@tailwindcss/postcss` plugin. The dark, cyberpunk-style dashboard theme is achieved entirely through Tailwind utility classes.

**Why it matters here:** The dashboard uses color-coding to communicate status at a glance:
- **Rose/Red (`text-rose-400`)** → Active incidents, danger.
- **Amber (`text-amber-400`)** → Degraded health, investigating.
- **Emerald/Green (`text-emerald-400`)** → Resolved, healthy.
- **Cyan (`text-cyan-400`)** → Neutral metric counts.

---

#### **ts-morph (The AST Manipulation Engine)**

`ts-morph` is a powerful library that lets you programmatically read and modify TypeScript source code by working with its **Abstract Syntax Tree (AST)** — the tree-like representation of the code's structure.

It is used exclusively by `scripts/chaosMonkey.ts` to inject bugs. Instead of doing naive string replacements, the Chaos Monkey uses `ts-morph` to:
- Find specific AST node types (e.g., `BinaryExpression`, `AwaitExpression`, `ForStatement`).
- Surgically modify them (e.g., replace `===` with `!==`, remove `await`, change loop condition to `true`).

**Why it matters here:** This is what makes the Chaos Monkey realistic and challenging. It doesn't just corrupt random bytes — it injects *semantically meaningful* bugs that a real developer might accidentally introduce.

---

#### **Jest + ts-jest (The Testing Framework)**

Jest is a JavaScript/TypeScript testing framework. `ts-jest` is a Jest transformer that lets Jest understand and compile TypeScript test files.

The test suite lives in `services/__tests__/dataHandler.test.ts` and validates the core business logic of the `DataHandler` class. These tests serve as **regression tests** — after the AI agent fixes a bug, the tests prove the fix actually works and doesn't break anything else.

**Why it matters here:** The test suite is the "proof" step in the resolution loop. The AI agent doesn't just fix code and hope for the best — it runs `npm test` and only proceeds if all tests pass.

---

#### **Lucide React (The Icon Library)**

`lucide-react` provides the SVG icons used in the dashboard (`Activity`, `AlertCircle`, `CheckCircle2`, `HeartPulse`, `Terminal`). It's a lightweight, tree-shakeable icon set.

---

## 3. Directory Structure & Entry Points

### Explain Like I'm 5

Think of this project like a school building. There are three main wings: the classroom (services), the janitor's closet full of tools (scripts), and the big display board in the hallway (app). There's also a library with old reports (docs). Each wing has its own front door.

### Full Directory Map

```
Meesho_claude_assignment/
│
├── CLAUDE.md                  # ⭐ Agent instructions: TypeScript rules, naming conventions,
│                              #    and the critical "Resolution Protocol" rule
├── sentinel.db                # 📦 The SQLite database file (shared across all subsystems)
│
├── app/                       # 🖥️  THE FRONTEND DASHBOARD (Next.js 16)
│   ├── package.json           #    Dependencies: next, react, better-sqlite3, lucide-react, tailwind
│   ├── tsconfig.json          #    TypeScript config (module: esnext, jsx: react-jsx)
│   ├── next.config.ts         #    Next.js configuration (minimal, no custom settings)
│   ├── postcss.config.mjs     #    PostCSS config (loads @tailwindcss/postcss)
│   ├── eslint.config.mjs      #    ESLint config (next core-web-vitals + typescript)
│   ├── app/                   #    Next.js App Router directory
│   │   ├── layout.tsx         #    ⭐ ROOT LAYOUT — entry point for all pages
│   │   ├── page.tsx           #    ⭐ HOME PAGE — renders Header, MetricCards, IncidentFeed
│   │   ├── globals.css        #    Global CSS (imports Tailwind, sets dark theme variables)
│   │   └── api/
│   │       └── status/
│   │           └── route.ts   #    ⭐ API ROUTE — reads sentinel.db and returns JSON
│   └── components/
│       ├── Header.tsx         #    Top bar: project name, live clock, online indicator
│       ├── MetricCards.tsx     #    Three metric cards: Active Incidents, Resolved, Health
│       └── IncidentFeed.tsx   #    Scrollable feed of incident logs with status badges
│
├── services/                  # ⚙️  THE BACKEND MICROSERVICE (the attack target)
│   ├── package.json           #    Dependencies: typescript, jest, ts-jest, ts-node
│   ├── tsconfig.json          #    TypeScript config (strict, commonjs, noImplicitAny)
│   ├── jest.config.js         #    Jest config (uses ts-jest transform)
│   ├── index.ts               #    ⭐ SERVICE ENTRY POINT — runs main(), calls DataHandler
│   ├── dataHandler.ts         #    Core business logic: User interface, DataHandler class
│   ├── error.log              #    Raw error output captured by the Monitor
│   └── __tests__/
│       └── dataHandler.test.ts #   Regression test suite for DataHandler
│
├── scripts/                   # 🔧 THE AUTOMATION TOOLKIT
│   ├── package.json           #    Dependencies: ts-morph, better-sqlite3, ts-node
│   ├── tsconfig.json          #    TypeScript config (es2022, commonjs)
│   ├── chaosMonkey.ts         #    ⭐ THE CHAOS MONKEY — injects bugs into /services
│   ├── monitor.ts             #    ⭐ THE MONITOR — detects failures, logs incidents to DB
│   ├── setupDB.ts             #    Database initializer: creates tables, seeds SystemHealth
│   └── resolveIncidents.ts    #    Database updater: sets all Open incidents to Resolved
│
├── docs/                      # 📚 DOCUMENTATION & LOGS
│   ├── post-mortem-report.md  #    Executive summary of the project and past resolutions
│   ├── agent-logs.txt         #    Detailed log of how AI agents orchestrate a resolution
│   └── incident-history.log  #    Historical record of all past fix attempts
│
└── .github/
    └── workflows/
        └── main.yml           # 🚀 CI/CD PIPELINE — runs tests, builds app, deploys to Vercel
```

### Entry Points (Where Execution Starts)

| What you're running | Entry point | How to start it |
|---|---|---|
| **Dashboard** | `app/app/layout.tsx` → `app/app/page.tsx` | `cd app && npm run dev` (starts on `http://localhost:3000`) |
| **Backend Service** | `services/index.ts` | `cd services && npm start` (runs once and exits) |
| **Backend Service (watch mode)** | `services/index.ts` | `cd services && npm run dev` (restarts on file changes) |
| **Chaos Monkey** | `scripts/chaosMonkey.ts` | `node --experimental-strip-types scripts/chaosMonkey.ts` |
| **Monitor** | `scripts/monitor.ts` | `node --experimental-strip-types scripts/monitor.ts` |
| **DB Setup** | `scripts/setupDB.ts` | `npx ts-node scripts/setupDB.ts` (from `scripts/` dir) |
| **Incident Resolution** | `scripts/resolveIncidents.ts` | `node --experimental-strip-types scripts/resolveIncidents.ts` |

---

## 4. Architecture & Data Flow (How it works)

### Explain Like I'm 5

Here's the story of what happens when things break:

1. The gremlin (Chaos Monkey) sneaks into the factory (services) and breaks something.
2. The security guard (Monitor) walks through the factory, notices something is wrong, and writes it in the logbook (SQLite database).
3. The big display board in the hallway (Dashboard) reads the logbook every 2 seconds and flashes red.
4. The repair robots (AI Agents) read the error report, fix the machines, test that they work, and update the logbook to say "Fixed!"
5. The display board reads the logbook again and turns green.

### Technical Data Flow

```
┌──────────────────────────────────────────────────────────────────────┐
│                        PHASE 1: INJECTION                            │
│                                                                      │
│  scripts/chaosMonkey.ts                                              │
│  ┌─────────────────────────────────────────────────┐                 │
│  │ 1. Uses ts-morph to parse services/*.ts files   │                 │
│  │ 2. Walks the AST looking for targets            │                 │
│  │ 3. Randomly applies ONE bug per file:           │                 │
│  │    • Syntax Error (remove closing brace)        │                 │
│  │    • Type Mismatch (replace type with 'any')    │                 │
│  │    • Logic Error (flip === to !==)              │                 │
│  │    • Unhandled Promise (remove 'await')         │                 │
│  │    • Infinite Loop (set for-loop to 'true')     │                 │
│  │ 4. Saves modified files back to disk            │                 │
│  └─────────────────────┬───────────────────────────┘                 │
│                        │ Files on disk are now broken                 │
│                        ▼                                             │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                        PHASE 2: DETECTION                            │
│                                                                      │
│  scripts/monitor.ts                                                  │
│  ┌─────────────────────────────────────────────────┐                 │
│  │ 1. Opens sentinel.db                            │                 │
│  │ 2. Spawns: exec('npx ts-node index.ts',         │                 │
│  │            { cwd: services/ })                  │                 │
│  │ 3. Captures stdout and stderr from the child    │                 │
│  │    process                                      │                 │
│  │ 4. Filters out Node.js ExperimentalWarnings     │                 │
│  │ 5. IF stderr has real errors:                   │                 │
│  │    → Write raw error to services/error.log      │                 │
│  │    → INSERT INTO Incidents (status='Open')      │                 │
│  │    → UPDATE SystemHealth SET status='Degraded'  │                 │
│  │ 6. ELSE:                                        │                 │
│  │    → UPDATE SystemHealth SET status='Healthy'   │                 │
│  └─────────────────────┬───────────────────────────┘                 │
│                        │ sentinel.db now has a new incident          │
│                        ▼                                             │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                        PHASE 3: DISPLAY                              │
│                                                                      │
│  app/app/api/status/route.ts (runs on Next.js server)                │
│  ┌─────────────────────────────────────────────────┐                 │
│  │ 1. Opens sentinel.db in READONLY mode           │                 │
│  │ 2. SELECT * FROM Incidents ORDER BY id DESC     │                 │
│  │ 3. SELECT count(*) WHERE status = 'Resolved'   │                 │
│  │ 4. SELECT count(*) WHERE status != 'Resolved'  │                 │
│  │ 5. SELECT * FROM SystemHealth (latest row)      │                 │
│  │ 6. Returns JSON: { incidents, health,           │                 │
│  │                     activeCount, resolvedCount } │                 │
│  └─────────────────────┬───────────────────────────┘                 │
│                        │                                             │
│  app/components/*.tsx (runs in the browser)                           │
│  ┌─────────────────────────────────────────────────┐                 │
│  │ MetricCards.tsx:                                 │                 │
│  │  • Polls GET /api/status every 2 seconds        │                 │
│  │  • Displays: Active count, Resolved count,      │                 │
│  │    Health status                                │                 │
│  │                                                  │                 │
│  │ IncidentFeed.tsx:                                │                 │
│  │  • Polls GET /api/status every 2 seconds        │                 │
│  │  • Renders each incident with timestamp,        │                 │
│  │    service name, error message, status badge    │                 │
│  │  • Color-codes: Open=Red, Investigating=Amber,  │                 │
│  │    Resolved=Green                               │                 │
│  └─────────────────────────────────────────────────┘                 │
└──────────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────────┐
│                        PHASE 4: RESOLUTION                           │
│                                                                      │
│  AI Agent (Sentinel Agent / This chat session)                       │
│  ┌─────────────────────────────────────────────────┐                 │
│  │ 1. Read services/error.log and broken files     │                 │
│  │ 2. Check docs/incident-history.log for past     │                 │
│  │    failures (CRITICAL: per CLAUDE.md)            │                 │
│  │ 3. Diagnose the exact bugs from error output    │                 │
│  │ 4. Apply code fixes to services/*.ts            │                 │
│  │ 5. Fix or add regression tests                  │                 │
│  │ 6. Run npm test → confirm all pass              │                 │
│  │ 7. Run scripts/monitor.ts → confirms "Healthy"  │                 │
│  │ 8. Run scripts/resolveIncidents.ts → sets all   │                 │
│  │    Open incidents to 'Resolved' in DB           │                 │
│  └─────────────────────────────────────────────────┘                 │
│                                                                      │
│  Dashboard auto-polls and turns green. Cycle complete.               │
└──────────────────────────────────────────────────────────────────────┘
```

### The Request Lifecycle (Dashboard)

Here's exactly how a single page load works for the dashboard:

1. User opens `http://localhost:3000`.
2. Next.js serves `app/layout.tsx` (sets dark theme, loads Inter font) → renders `app/page.tsx`.
3. `page.tsx` renders three components: `<Header />`, `<MetricCards />`, `<IncidentFeed />`.
4. All three are `'use client'` components (they run in the browser, not the server).
5. `MetricCards` and `IncidentFeed` both fire `useEffect` hooks on mount.
6. Each `useEffect` calls `fetch('/api/status')` immediately, then sets up a `setInterval` to re-fetch every 2000ms.
7. `GET /api/status` hits the server-side route handler in `app/api/status/route.ts`.
8. The route handler opens `sentinel.db` (located at `../sentinel.db` relative to the `app/` directory), runs SQL queries, and returns JSON.
9. The components receive the JSON and update their React state, triggering a re-render.
10. This cycle repeats every 2 seconds, creating a live-updating dashboard.

---

## 5. Crucial Scripts & Commands

### Explain Like I'm 5

These are the buttons on the control panel. Each button does something specific. Here's what each one does when you press it.

### `/app/package.json` Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Starts the Next.js development server with hot-reload on `http://localhost:3000`. This is how you view the dashboard locally. |
| `npm run build` | Compiles the Next.js app into an optimized production bundle in `.next/`. Runs the TypeScript compiler, generates static pages, and validates the build. |
| `npm start` | Starts the production server (must run `npm run build` first). |
| `npm run lint` | Runs ESLint to check for code quality issues. |

### `/services/package.json` Scripts

| Command | What it does |
|---|---|
| `npm start` | Runs `npx ts-node index.ts` — compiles and executes the service **once**, then exits. |
| `npm run dev` | Runs `node --watch -r ts-node/register index.ts` — executes the service and **watches for file changes**, automatically restarting on any edit. This is useful during development because you can see the service re-run after fixes are applied. |
| `npm test` | Runs `jest` — executes all test files matching `__tests__/**/*.test.ts`. Uses `ts-jest` to compile TypeScript on the fly. |

### `/scripts/package.json` Scripts

The `/scripts` package doesn't have meaningful npm scripts. Instead, you run its files directly:

| Command | What it does |
|---|---|
| `node --experimental-strip-types scripts/chaosMonkey.ts` | **The Chaos Monkey.** Uses `ts-morph` to parse and mutate the AST of every `.ts` file in `/services`. Injects exactly one random bug per file. Run this from the project root. |
| `node --experimental-strip-types scripts/monitor.ts` | **The Monitor.** Spawns the service as a child process, captures its output, and checks for errors. Updates `sentinel.db` with either a new incident (if errors found) or a clean health status. |
| `npx ts-node scripts/setupDB.ts` | **DB Initializer.** Creates the `Incidents` and `SystemHealth` tables in `sentinel.db` if they don't exist. Seeds `SystemHealth` with an initial `Healthy` row. Run from the `scripts/` directory. |
| `node --experimental-strip-types scripts/resolveIncidents.ts` | **Incident Resolver.** Updates all incidents with status `Open` or `RESOLVED` to `Resolved` (Title Case) in the database. |

### CI/CD Pipeline (`.github/workflows/main.yml`)

The GitHub Actions pipeline has two jobs:

1. **`test-services`** — Checks out the repo, installs Node.js 20, installs `/services` dependencies, and runs `npm test`. If any test fails, the pipeline fails and blocks deployment.
2. **`deploy-dashboard`** — Only runs *after* `test-services` passes (via `needs: test-services`). Installs `/app` dependencies, builds the Next.js app, and deploys to Vercel using the `amondnet/vercel-action`.

---

## 6. Complexities & Gotchas

### Explain Like I'm 5

These are the tricky parts — the loose floorboards and hidden trap doors. Step carefully.

### 🔴 Gotcha #1: Case-Sensitive Status Strings

This is the **#1 trap** in this codebase.

The SQLite database stores incident statuses as plain strings. The API route in `app/api/status/route.ts` uses **case-sensitive** SQL comparisons:

```sql
-- Counts "Resolved" incidents (Title Case only)
SELECT count(*) FROM Incidents WHERE status = 'Resolved'

-- Counts active incidents (anything NOT 'Resolved')
SELECT count(*) FROM Incidents WHERE status != 'Resolved'
```

The frontend component `IncidentFeed.tsx` also does case-sensitive checks:

```typescript
if (incident.status === 'Open') statusColor = 'text-rose-400';
if (incident.status === 'Investigating') statusColor = 'text-amber-400';
if (incident.status === 'Resolved') statusColor = 'text-emerald-400';
```

**The trap:** If you update the status to `'RESOLVED'` (all caps) instead of `'Resolved'` (Title Case), the API will still count it as an active incident, and the frontend will show a gray badge instead of green. The dashboard will show "1 Active Incident" even though you think you resolved it. We fell into this exact trap during this session (see Section 7 for details).

### 🔴 Gotcha #2: CommonJS vs ES Modules Confusion

This project has a **mixed module system**, and it's a constant source of friction:

| Directory | `tsconfig.json` module setting | Actual module system |
|---|---|---|
| `/services` | `"module": "commonjs"` | CommonJS (`require()`) |
| `/scripts` | `"module": "commonjs"` | CommonJS in tsconfig, but files use ESM `import` syntax |
| `/app` | `"module": "esnext"` | ES Modules (Next.js handles this) |

The `/scripts` files (like `chaosMonkey.ts` and `monitor.ts`) use ES Module `import` syntax but the `tsconfig.json` says `"module": "commonjs"`. When you run them with `node --experimental-strip-types`, Node.js detects the `import` keyword and parses them as ES Modules. This means:

- `__dirname` is **NOT** available (it's a CommonJS-only global).
- You must use `import.meta.url` + `fileURLToPath()` to get the file path... but TypeScript's CommonJS mode forbids `import.meta`.
- **Solution:** For new scripts in `/scripts`, use CommonJS `require()` syntax to avoid this conflict (like we did with `resolveIncidents.ts`).

### 🔴 Gotcha #3: The `ts-node --watch` Flag Doesn't Exist

The original `services/package.json` had:
```json
"dev": "npx ts-node --watch index.ts"
```

But `ts-node` does **not** support a `--watch` flag. This crashes with `Error: Unknown or unexpected option: --watch`. We fixed this during the session by changing it to:
```json
"dev": "node --watch -r ts-node/register index.ts"
```

This uses Node's native `--watch` flag and registers `ts-node` as a module loader via the `-r` (require) flag.

### 🔴 Gotcha #4: The Database Path is Relative

The `sentinel.db` file sits at the **project root**, but different scripts reference it with different relative paths:

- `scripts/setupDB.ts`: `path.join(__dirname, '../sentinel.db')` (relative to `scripts/`)
- `scripts/monitor.ts`: `path.join(process.cwd(), 'sentinel.db')` or `../sentinel.db` depending on where you run it from
- `app/api/status/route.ts`: `path.join(process.cwd(), '../sentinel.db')` (relative to `app/`)

**The trap:** If you run a script from the wrong working directory, it will create or read a *different* `sentinel.db` file, and you'll wonder why the dashboard doesn't reflect your changes.

### 🔴 Gotcha #5: The `CLAUDE.md` Resolution Protocol

The `CLAUDE.md` file at the project root contains a **CRITICAL REQUIREMENT**:

> Before applying any automated fix, the agent must check the `/docs/incident-history.log`. If this fix has failed before, the agent must use Thinking Mode to find an alternative approach.

This means the AI agent is expected to read the incident history before applying fixes, to avoid repeating failed approaches. If you're extending the agent logic, you must honor this protocol.

### 🟡 Note #6: Two Separate Git Repositories

The `/app` directory has its own `.git` folder (it was initialized separately with `create-next-app`). The root project may or may not have its own git. Be aware that `git` commands might behave differently depending on which directory you're in.

### 🟡 Note #7: The Dashboard Polls, It Doesn't Push

The dashboard uses **client-side polling** (every 2 seconds) to check for updates. There are no WebSockets or Server-Sent Events. This means:
- There's a maximum 2-second delay between a database change and the UI reflecting it.
- Two `setInterval` calls are running simultaneously (one in `MetricCards`, one in `IncidentFeed`), each making its own `fetch('/api/status')` call. This doubles the API requests.

---

## 7. Live Bug Resolution — What We Did & How It Works

### Explain Like I'm 5

During this chat session, the mischievous gremlin (Chaos Monkey) broke the factory **twice**. Each time, we caught the problem, figured out what broke, fixed it, tested it, and told the display board it was all good. Here's exactly what happened both times.

### The Resolution Protocol (Step by Step)

Every time the Chaos Monkey runs, the resolution follows this exact sequence:

```
1. DETECT    → Run monitor.ts, which spawns the service and catches errors
2. DIAGNOSE  → Read the broken files to identify what the Chaos Monkey changed
3. PLAN      → Write an implementation plan listing every fix needed
4. APPROVE   → User reviews and approves the plan
5. FIX       → Apply code fixes to the broken files
6. TEST      → Run npm test to verify all fixes work
7. MONITOR   → Re-run monitor.ts to confirm "Service running smoothly"
8. RESOLVE   → Run resolveIncidents.ts to update DB status to 'Resolved'
9. VERIFY    → Dashboard auto-polls and shows green metrics
```

---

### Resolution Cycle 1

**What the Chaos Monkey did:**

The user ran `node --experimental-strip-types scripts/chaosMonkey.ts`, which injected three bugs:

| File | Bug Type | What Changed |
|---|---|---|
| `services/dataHandler.ts` | **Infinite Loop** | Changed `for (let i = 0; i < this.users.length; i++)` to `for (let i = 0; true; i++)` — the loop never ends. |
| `services/index.ts` | **Unhandled Promise** | Removed `await` from `const user = await handler.getUser(1)`, turning `user` into a `Promise<User>` instead of a `User`. Accessing `user.name` then fails with TS2339. |
| `services/__tests__/dataHandler.test.ts` | **Unhandled Promise** | Removed `await` from `const user = await handler.getUser(999)`, so the test checks the Promise object instead of the resolved value. |

**What the Monitor detected:**

When `monitor.ts` ran, it spawned `npx ts-node index.ts` in the `services/` directory. Because the `await` was missing, TypeScript threw:

```
error TS2339: Property 'name' does not exist on type 'Promise<User | undefined>'.
```

The Monitor caught this in `stderr`, wrote it to `services/error.log`, inserted a new incident in the `Incidents` table with status `Open`, and set `SystemHealth` to `Degraded`.

**How we fixed it:**

1. **`dataHandler.ts` line 21:** Changed `for (let i = 0; true; i++)` back to `for (let i = 0; i < this.users.length; i++)`.
2. **`index.ts` line 8:** Added `await` back: `const user = await handler.getUser(1)`.
3. **`dataHandler.test.ts` line 17:** Added `await` back: `const user = await handler.getUser(999)`.
4. Added two new regression tests:
   - One that verifies `getUser()` returns a `Promise` (confirming the async API contract).
   - One that verifies `getActiveUsersCount()` terminates and returns `1` (proving the loop isn't infinite).

**Verification:**
- `npm test` → 4/4 tests passed.
- `monitor.ts` → "Service running smoothly." → `SystemHealth` updated to `Healthy`.
- `resolveIncidents.ts` → Initially set status to `'RESOLVED'` (all caps), which **didn't clear the dashboard** because the API checks for `'Resolved'` (Title Case). We caught this gotcha, re-ran the script with the correct casing, and the dashboard turned green.

---

### Resolution Cycle 2

**What the Chaos Monkey did:**

The user ran the Chaos Monkey again. It injected the **exact same three bug types** into the same files (the Chaos Monkey shuffles strategies randomly, but with only 3 files and the same available targets, the results were similar):

| File | Bug Type | What Changed |
|---|---|---|
| `services/dataHandler.ts` | **Infinite Loop** | `for (let i = 0; true; i++)` again |
| `services/index.ts` | **Unhandled Promise** | Removed `await` again |
| `services/__tests__/dataHandler.test.ts` | **Unhandled Promise** | Removed `await` from the first test (line 11 this time) |

**How we fixed it:**

Same approach as Cycle 1, but this time:
- We already knew about the case-sensitivity gotcha, so we immediately used `'Resolved'` (Title Case).
- The regression tests from Cycle 1 were still in the test file, so the Chaos Monkey only managed to break the `await` in one of them. The other regression tests remained intact.

**Verification:**
- `npm test` → 4/4 tests passed.
- `monitor.ts` → "Service running smoothly."
- `resolveIncidents.ts` → "Updated 1 incidents to 'Resolved'."
- Dashboard showed 0 active incidents, all green.

---

### Key Lessons from the Resolution Process

1. **Always check the incident history first.** The `CLAUDE.md` mandates it, and it helps avoid repeating failed fixes.
2. **Case sensitivity kills.** `'Resolved'` ≠ `'RESOLVED'` ≠ `'resolved'`. The database, API, and frontend all expect `'Resolved'` (Title Case).
3. **The Chaos Monkey is AST-aware.** It doesn't just corrupt text — it finds specific TypeScript syntax nodes and modifies them semantically. This means fixes must also be semantically correct, not just string replacements.
4. **Regression tests are the safety net.** After fixing the code, `npm test` proves the fix works. Without tests, you're just guessing.
5. **The Monitor is the single source of truth for health.** Don't manually edit `sentinel.db` to set health — run `monitor.ts` so it properly evaluates the current state of the service.
6. **Watch out for CommonJS vs ESM.** Any new script in `/scripts` should use `require()` syntax to match the `tsconfig.json` setting of `"module": "commonjs"`, or you'll hit `__dirname` / `import.meta` conflicts.

---

## Quick Reference Card

```
┌─────────────────────────────────────────────────────────┐
│                    QUICK REFERENCE                       │
├─────────────────────────────────────────────────────────┤
│                                                         │
│  Start Dashboard:                                       │
│    cd app && npm run dev                                │
│    → http://localhost:3000                               │
│                                                         │
│  Run Service (once):                                    │
│    cd services && npm start                             │
│                                                         │
│  Run Service (watch mode):                              │
│    cd services && npm run dev                           │
│                                                         │
│  Run Tests:                                             │
│    cd services && npm test                              │
│                                                         │
│  Initialize Database:                                   │
│    cd scripts && npx ts-node setupDB.ts                 │
│                                                         │
│  Inject Bugs (Chaos Monkey):                            │
│    node --experimental-strip-types scripts/chaosMonkey.ts│
│                                                         │
│  Detect Failures (Monitor):                             │
│    node --experimental-strip-types scripts/monitor.ts    │
│                                                         │
│  Resolve Incidents (DB Update):                         │
│    node --experimental-strip-types                       │
│      scripts/resolveIncidents.ts                        │
│                                                         │
│  ⚠️  Always run scripts from the PROJECT ROOT           │
│  ⚠️  Status strings are CASE-SENSITIVE: 'Resolved'      │
│  ⚠️  Database file: sentinel.db (project root)          │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

---

*This document was generated during a live onboarding session on 2026-05-21. If you have questions, refer to the `docs/` directory for additional context or review the `CLAUDE.md` file for agent-specific rules.*
