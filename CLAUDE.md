# Project Sentinel: The Autonomous Incident Resolution Engine

## TypeScript Guardrails
- **Strict Mode**: All TypeScript configurations must have `"strict": true`.
- **No Implicit Any**: Variable declarations must have explicit types or be correctly inferred. `"noImplicitAny": true` is mandatory.
- **Null Checks**: `"strictNullChecks": true` is mandatory.

## Naming Conventions
- **Classes, Types, Interfaces**: PascalCase (e.g., `ChaosMonkey`, `IncidentReport`, `DataHandler`).
- **Variables, Functions, Methods**: camelCase (e.g., `injectBug`, `handleRequest`, `userData`).
- **Constants**: UPPER_SNAKE_CASE (e.g., `MAX_RETRY_COUNT`, `DEFAULT_PORT`).
- **Filenames**: camelCase for logic files (e.g., `chaosMonkey.ts`), PascalCase for React components/classes if applicable.

## Resolution Protocol
**CRITICAL REQUIREMENT:** Before applying any automated fix, the agent must check the `/docs/incident-history.log`. If this fix has failed before, the agent must use Thinking Mode to find an alternative approach.
