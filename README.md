<p align="center">
  <img src="https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/Next.js_16-000000?style=for-the-badge&logo=nextdotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/Node.js-339933?style=for-the-badge&logo=nodedotjs&logoColor=white" />
  <img src="https://img.shields.io/badge/SQLite-003B57?style=for-the-badge&logo=sqlite&logoColor=white" />
  <img src="https://img.shields.io/badge/Jest-C21325?style=for-the-badge&logo=jest&logoColor=white" />
  <img src="https://img.shields.io/badge/Tailwind_CSS_4-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/GitHub_Actions-2088FF?style=for-the-badge&logo=githubactions&logoColor=white" />
</p>

# 🛡️ Project Sentinel

### The Autonomous Incident Resolution Engine

> An AI-powered system that **detects**, **diagnoses**, and **resolves** production incidents autonomously — no human intervention required.

Project Sentinel demonstrates how AI coding agents can act as an always-on "developer on-call" by combining a **Chaos Monkey** (fault injection), a **Monitor** (real-time detection), and an **AI Resolution Loop** (autonomous repair + testing) — all visualized through a live cyberpunk-themed dashboard.

---

## 🎯 What Does It Do?

```
Chaos Monkey breaks the service
  → Monitor detects the failure and logs it to the database
    → AI Agents diagnose, fix the code, write tests, and verify
      → Monitor re-runs and confirms "Healthy"
        → Database is updated, Dashboard goes green ✅
```

| Subsystem | Purpose |
|---|---|
| **`/services`** — Backend Microservice | A TypeScript service simulating a real production backend. This is the *attack target*. |
| **`/scripts`** — Automation Toolkit | Contains the Chaos Monkey (fault injector), Monitor (anomaly detector), DB setup, and incident resolution scripts. |
| **`/app`** — Real-Time Dashboard | A Next.js 16 web dashboard displaying live system health, active incidents, and resolution history. |
| **`/docs`** — Documentation & Logs | Post-mortem reports, agent logs, and incident history for audit trails. |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    PHASE 1: INJECTION                        │
│                                                              │
│  Chaos Monkey (ts-morph AST manipulation)                    │
│  → Injects semantically meaningful bugs into /services       │
│    • Syntax Errors (remove closing braces)                   │
│    • Type Mismatches (replace types with 'any')              │
│    • Logic Errors (flip === to !==)                          │
│    • Unhandled Promises (remove 'await')                     │
│    • Infinite Loops (set loop condition to 'true')           │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    PHASE 2: DETECTION                        │
│                                                              │
│  Monitor (child process + TypeScript compiler)               │
│  → Spawns the service, captures stderr                       │
│  → Logs incidents to SQLite with status tracking             │
│  → Updates system health: Healthy ↔ Degraded                │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    PHASE 3: DISPLAY                          │
│                                                              │
│  Next.js Dashboard (polls /api/status every 2s)              │
│  → Reads SQLite database via server-side API route           │
│  → Live-updating metrics: Active | Resolved | Health         │
│  → Color-coded incident feed: 🔴 Open 🟡 Investigating 🟢 Resolved │
└──────────────────────────┬──────────────────────────────────┘
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                    PHASE 4: RESOLUTION                       │
│                                                              │
│  AI Agents (autonomous code repair)                          │
│  → Read error logs & broken source files                     │
│  → Cross-reference incident history for past failures        │
│  → Apply targeted code fixes                                 │
│  → Write regression tests & run npm test                     │
│  → Re-run Monitor to confirm healthy state                   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🧰 Tech Stack

| Technology | Role |
|---|---|
| **TypeScript** (Strict Mode) | Core language across all subsystems — also serves as a detection mechanism via compile-time errors |
| **Node.js v20+** | Runtime for services, scripts, and `ts-node` compilation |
| **Next.js 16** (App Router) | Frontend framework powering the real-time dashboard |
| **SQLite** via `better-sqlite3` | File-based database — single source of truth connecting all subsystems |
| **TailwindCSS 4** | Utility-first styling for the cyberpunk-themed dark UI |
| **ts-morph** | AST manipulation engine used by the Chaos Monkey for realistic fault injection |
| **Jest + ts-jest** | Testing framework for regression tests that validate autonomous fixes |
| **Lucide React** | SVG icon library for dashboard UI |
| **GitHub Actions** | CI/CD pipeline: run tests → build dashboard → deploy to Vercel |

---

## 📁 Project Structure

```
project-sentinel/
│
├── .github/workflows/
│   └── main.yml              # CI/CD — tests + Vercel deploy
│
├── app/                      # 🖥️  Next.js 16 Dashboard
│   ├── app/
│   │   ├── layout.tsx        # Root layout (dark theme, Inter font)
│   │   ├── page.tsx          # Home page (Header + Metrics + Feed)
│   │   ├── globals.css       # Tailwind imports + theme variables
│   │   └── api/status/
│   │       └── route.ts      # Server-side API → reads SQLite
│   └── components/
│       ├── Header.tsx        # Top bar with live clock
│       ├── MetricCards.tsx    # Active | Resolved | Health cards
│       └── IncidentFeed.tsx  # Scrollable incident log
│
├── services/                 # ⚙️  Backend Microservice (attack target)
│   ├── index.ts              # Service entry point
│   ├── dataHandler.ts        # Core business logic (User CRUD)
│   └── __tests__/
│       └── dataHandler.test.ts  # Regression test suite
│
├── scripts/                  # 🔧 Automation Toolkit
│   ├── chaosMonkey.ts        # AST-based fault injector
│   ├── monitor.ts            # Anomaly detector + DB logger
│   ├── setupDB.ts            # Database initializer
│   └── resolveIncidents.ts   # Bulk incident resolver
│
├── docs/                     # 📚 Documentation
│   ├── post-mortem-report.md # Executive incident summary
│   ├── agent-logs.txt        # AI agent orchestration logs
│   └── incident-history.log  # Historical fix attempts
│
├── sentinel.db               # SQLite database (auto-generated)
├── CLAUDE.md                 # AI agent rules & coding standards
└── PROJECT_ONBOARDING.md     # Comprehensive developer guide
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** v20 or higher
- **npm** (comes with Node.js)

### 1. Clone the Repository

```bash
git clone https://github.com/jatinprime/meesho_claude_assignment.git
cd meesho_claude_assignment
```

### 2. Install Dependencies

```bash
# Backend service
cd services && npm install && cd ..

# Automation scripts
cd scripts && npm install && cd ..

# Dashboard
cd app && npm install && cd ..
```

### 3. Initialize the Database

```bash
cd scripts && npx ts-node setupDB.ts && cd ..
```

### 4. Start the Dashboard

```bash
cd app && npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the live dashboard.

---

## 🎮 Usage

### Run the Backend Service

```bash
# Run once
cd services && npm start

# Watch mode (auto-restart on changes)
cd services && npm run dev
```

### Run Tests

```bash
cd services && npm test
```

### Inject Bugs (Chaos Monkey)

```bash
node --experimental-strip-types scripts/chaosMonkey.ts
```

> ⚠️ Run from the **project root**. This will modify files in `/services`.

### Detect Failures (Monitor)

```bash
node --experimental-strip-types scripts/monitor.ts
```

### Resolve Incidents

```bash
node --experimental-strip-types scripts/resolveIncidents.ts
```

---

## 🔄 Full Demo Loop

Run these commands in order to see the complete autonomous resolution cycle:

```bash
# 1. Make sure the database is set up
cd scripts && npx ts-node setupDB.ts && cd ..

# 2. Start the dashboard (keep this running in a separate terminal)
cd app && npm run dev

# 3. Verify the service is healthy
node --experimental-strip-types scripts/monitor.ts

# 4. Inject bugs with the Chaos Monkey
node --experimental-strip-types scripts/chaosMonkey.ts

# 5. Detect the failure (dashboard will flash red)
node --experimental-strip-types scripts/monitor.ts

# 6. [AI Agent fixes the code here]

# 7. Verify the fix
cd services && npm test && cd ..

# 8. Confirm healthy state
node --experimental-strip-types scripts/monitor.ts

# 9. Resolve all incidents in DB
node --experimental-strip-types scripts/resolveIncidents.ts

# Dashboard turns green ✅
```

---

## ⚙️ CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/main.yml`) runs on every push and pull request to `main`:

| Job | What It Does |
|---|---|
| **`test-services`** | Installs dependencies, runs `npm test` in `/services`. Blocks deployment on failure. |
| **`deploy-dashboard`** | Builds the Next.js app and deploys to **Vercel** (only after tests pass). |

---

## 📝 Key Design Decisions

- **TypeScript Strict Mode** — All configs enforce `strict: true`, `noImplicitAny: true`, and `strictNullChecks: true`. This makes the TypeScript compiler itself a detection mechanism.
- **AST-Level Fault Injection** — The Chaos Monkey uses `ts-morph` to inject semantically meaningful bugs (not random byte corruption), making the demo realistic.
- **SQLite as Shared State** — A single `sentinel.db` file acts as the communication layer between all subsystems — no external database server needed.
- **Client-Side Polling** — The dashboard polls `/api/status` every 2 seconds for simplicity. No WebSocket setup required.
- **Case-Sensitive Status Strings** — Incident statuses (`Open`, `Investigating`, `Resolved`) are case-sensitive throughout the stack.

---

## 📄 License

ISC

---

<p align="center">
  <b>Built with 🔥 by Jatin Agrawal</b>
</p>
