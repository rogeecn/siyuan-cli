# Snapshot Command Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add minimal read-only `snapshot` commands that list snapshots and show the current snapshot with friendly terminal output.

**Architecture:** Add a dedicated `snapshot` command module and a small `snapshot` service built on the shared `SiyuanClient`. The command should lazily load env config and client at runtime, keep the first batch read-only, print compact human-readable output by default, and support raw JSON output when requested.

**Tech Stack:** TypeScript, Node.js, Commander, Jest, ts-jest

---

### Task 1: Add failing snapshot CLI tests

**Files:**
- Create: `tests/commands/snapshot.test.ts`
- Test: `tests/commands/attr.test.ts`

**Step 1: Write the failing test**

Add tests that prove:
- `siyuan snapshot list` calls the expected snapshot-list API and prints friendly output
- `siyuan snapshot list --json` returns raw JSON
- `siyuan snapshot current` calls the expected current-snapshot API and prints friendly output
- `siyuan snapshot current --json` returns raw JSON
- empty list results print `No results found.`
- missing env vars fail lazily at command runtime
- `siyuan --help` and `siyuan snapshot --help` do not trigger env loading

**Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath tests/commands/snapshot.test.ts`
Expected: FAIL because the `snapshot` command does not exist yet.

**Step 3: Write minimal implementation**

Do not implement production code yet beyond what is needed to satisfy the test import path and runtime wiring expectation.

**Step 4: Run test to verify it still fails for missing behavior**

Run: `npm test -- --runTestsByPath tests/commands/snapshot.test.ts`
Expected: FAIL with unknown command or missing command behavior.

### Task 2: Add snapshot service

**Files:**
- Create: `src/services/snapshot.ts`
- Test: `tests/commands/snapshot.test.ts`

**Step 1: Write the failing test**

Add or refine tests that expect the service-backed requests to use these endpoints:

```ts
/api/snapshot/getSnapshotList
/api/snapshot/getRepoSnapshots
```

Use request bodies like:

```ts
undefined
undefined
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath tests/commands/snapshot.test.ts`
Expected: FAIL because the snapshot service does not exist.

**Step 3: Write minimal implementation**

Create `createSnapshotService(client)` with two methods:

```ts
list(): Promise<SnapshotSummary[]>
current(): Promise<CurrentSnapshot>
```

Implementation should call:

```ts
client.request('/api/snapshot/getSnapshotList')
client.request('/api/snapshot/getRepoSnapshots')
```

Normalize only what the tests need.

**Step 4: Run test to verify it passes**

Run: `npm test -- --runTestsByPath tests/commands/snapshot.test.ts`
Expected: PASS for request-shape expectations.

### Task 3: Add snapshot command

**Files:**
- Create: `src/commands/snapshot.ts`
- Modify: `src/cli/index.ts`
- Test: `tests/commands/snapshot.test.ts`

**Step 1: Write the failing test**

Add or refine tests covering:
- Commander registration under top-level `snapshot`
- subcommands `list` and `current`
- lazy env loading inside the action path only

**Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath tests/commands/snapshot.test.ts`
Expected: FAIL with unknown command or missing command wiring.

**Step 3: Write minimal implementation**

Create `createSnapshotCommand(createService)` and register it from `src/cli/index.ts` using:
- `loadEnvConfig()`
- `new SiyuanClient(config)`
- `createSnapshotService(client)`

inside the action path via the existing factory pattern.

The commands should look like:

```ts
snapshot list [--json]
snapshot current [--json]
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --runTestsByPath tests/commands/snapshot.test.ts`
Expected: PASS for command registration and lazy env-loading behavior.

### Task 4: Add friendly snapshot output

**Files:**
- Modify: `src/commands/snapshot.ts`
- Test: `tests/commands/snapshot.test.ts`

**Step 1: Write the failing test**

Add tests for:
- `snapshot list` default output renders numbered snapshot entries
- `snapshot current` default output renders a compact summary
- empty arrays print `No results found.`

Use representative output like:

```text
1. snap-1 - 2026-03-16 10:00
2. snap-2 - 2026-03-16 11:00
```

and:

```text
id: snap-2
time: 2026-03-16 11:00
memo: latest
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath tests/commands/snapshot.test.ts`
Expected: FAIL because friendly formatting does not exist yet.

**Step 3: Write minimal implementation**

Add tiny formatting helpers inside `src/commands/snapshot.ts` that:
- render `No results found.` for empty arrays
- render snapshot list items as numbered `id - time` lines
- render current snapshot as `id`, `time`, and `memo` lines
- defer to `printOutput(..., { json: true })` for JSON mode

**Step 4: Run test to verify it passes**

Run: `npm test -- --runTestsByPath tests/commands/snapshot.test.ts`
Expected: PASS.

### Task 5: Verify adjacent CLI behavior

**Files:**
- Test: `tests/commands/snapshot.test.ts`
- Test: `tests/commands/attr.test.ts`
- Test: `tests/commands/file.test.ts`
- Test: `tests/commands/export.test.ts`
- Test: `tests/commands/block.test.ts`
- Test: `tests/commands/tag.test.ts`
- Test: `tests/commands/sql.test.ts`
- Test: `tests/cli/run.test.ts`
- Test: `tests/cli/smoke.test.ts`

**Step 1: Run adjacent tests**

Run: `npm test -- --runTestsByPath tests/commands/snapshot.test.ts tests/commands/attr.test.ts tests/commands/file.test.ts tests/commands/export.test.ts tests/commands/block.test.ts tests/commands/tag.test.ts tests/commands/sql.test.ts tests/cli/run.test.ts tests/cli/smoke.test.ts`
Expected: PASS.

**Step 2: Run build**

Run: `npm run build`
Expected: PASS.

**Step 3: Self-review**

Confirm the command stays minimal, env-only, read-oriented, and human-friendly by default.
