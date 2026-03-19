# SQL Command Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a minimal `sql query` command that runs read-only SQL through SiYuan and prints human-friendly results by default.

**Architecture:** Add a dedicated `sql` command module and a small `sql` service on top of the shared `SiyuanClient`. The command should lazily load env config and client at runtime, require a SQL statement, print a basic table for row results by default, and support raw JSON output when requested.

**Tech Stack:** TypeScript, Node.js, Commander, Jest, ts-jest

---

### Task 1: Add failing SQL CLI tests

**Files:**
- Create: `tests/commands/sql.test.ts`
- Test: `tests/commands/system.test.ts`

**Step 1: Write the failing test**

Add tests that prove:
- `siyuan sql query --statement "select * from blocks limit 2"` calls the expected SQL API and prints a friendly table
- `siyuan sql query --statement "select * from blocks limit 2" --json` returns raw JSON
- `siyuan sql query --statement "select * from blocks limit 2"` prints `No results found.` for an empty result set
- missing env vars fail lazily at command runtime
- `siyuan --help` and `siyuan sql --help` do not trigger env loading

**Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath tests/commands/sql.test.ts`
Expected: FAIL because the `sql` command does not exist yet.

**Step 3: Write minimal implementation**

Do not implement production code yet beyond what is needed to satisfy the test import path and runtime wiring expectation.

**Step 4: Run test to verify it still fails for missing behavior**

Run: `npm test -- --runTestsByPath tests/commands/sql.test.ts`
Expected: FAIL with unknown command or missing command behavior.

### Task 2: Add SQL service

**Files:**
- Create: `src/services/sql.ts`
- Test: `tests/commands/sql.test.ts`

**Step 1: Write the failing test**

Add or refine a test that expects the service-backed request body to be:

```ts
{ stmt: 'select * from blocks limit 2' }
```

and the endpoint to be:

```ts
/api/query/sql
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath tests/commands/sql.test.ts`
Expected: FAIL because the SQL service does not exist.

**Step 3: Write minimal implementation**

Create `createSqlService(client)` with one method:

```ts
query(statement: string): Promise<Record<string, unknown>[]>
```

Implementation should call:

```ts
client.request('/api/query/sql', { stmt: statement })
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --runTestsByPath tests/commands/sql.test.ts`
Expected: PASS for service request-shape expectations.

### Task 3: Add SQL command

**Files:**
- Create: `src/commands/sql.ts`
- Modify: `src/cli/index.ts`
- Test: `tests/commands/sql.test.ts`

**Step 1: Write the failing test**

Add or refine tests covering:
- Commander registration under top-level `sql`
- subcommand `query`
- required option `--statement <sql>`
- lazy env loading inside the action path only

**Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath tests/commands/sql.test.ts`
Expected: FAIL with unknown command or missing command wiring.

**Step 3: Write minimal implementation**

Create `createSqlCommand(createService)` and register it from `src/cli/index.ts` using:
- `loadEnvConfig()`
- `new SiyuanClient(config)`
- `createSqlService(client)`

inside the action path via the existing factory pattern.

The command should look like:

```ts
sql query --statement <sql> [--json]
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --runTestsByPath tests/commands/sql.test.ts`
Expected: PASS for command registration and lazy env-loading behavior.

### Task 4: Add friendly SQL output

**Files:**
- Modify: `src/commands/sql.ts`
- Modify: `src/formatters/output.ts`
- Test: `tests/commands/sql.test.ts`
- Test: `tests/formatters/output.test.ts`

**Step 1: Write the failing test**

Add tests for:
- default output renders a simple table using row keys as headers
- `--json` prints raw JSON
- empty rows print `No results found.`

Use representative data like:

```ts
[
  { id: '20240101010101-abc', content: 'Alpha' },
  { id: '20240101010102-def', content: 'Beta' },
]
```

Expected human-readable output:

```text
id                 | content
20240101010101-abc | Alpha
20240101010102-def | Beta
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath tests/commands/sql.test.ts tests/formatters/output.test.ts`
Expected: FAIL because row-table formatting does not exist yet.

**Step 3: Write minimal implementation**

Add a formatter helper that converts `Record<string, unknown>[]` into a simple table by:
- using keys from the first row as headers
- preserving header order from `Object.keys(firstRow)`
- coercing cell values with `String(...)`
- returning `No results found.` for an empty array

Use that helper from `src/commands/sql.ts` for default output.

**Step 4: Run test to verify it passes**

Run: `npm test -- --runTestsByPath tests/commands/sql.test.ts tests/formatters/output.test.ts`
Expected: PASS.

### Task 5: Verify adjacent CLI behavior

**Files:**
- Test: `tests/commands/sql.test.ts`
- Test: `tests/commands/system.test.ts`
- Test: `tests/commands/search.test.ts`
- Test: `tests/cli/run.test.ts`
- Test: `tests/cli/smoke.test.ts`

**Step 1: Run adjacent tests**

Run: `npm test -- --runTestsByPath tests/commands/sql.test.ts tests/commands/system.test.ts tests/commands/search.test.ts tests/cli/run.test.ts tests/cli/smoke.test.ts`
Expected: PASS.

**Step 2: Run build**

Run: `npm run build`
Expected: PASS.

**Step 3: Self-review**

Confirm the command stays minimal, env-only, read-oriented, and human-friendly by default.
