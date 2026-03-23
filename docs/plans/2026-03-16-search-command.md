# Search Command Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a human-friendly `search` CLI command that searches by content, filename, and tag using env-only configuration.

**Architecture:** Add a dedicated `search` command module plus a small `search` service built on the shared `SiyuanClient`. The command lazily loads env config and client at runtime, validates that at least one search criterion is present, prints compact human-readable results by default, and supports raw JSON output when requested.

**Tech Stack:** TypeScript, Node.js, Commander, Jest, ts-jest

---

### Task 1: Add failing CLI search tests

**Files:**
- Modify: `tests/commands/system.test.ts`
- Create: `tests/commands/search.test.ts`

**Step 1: Write the failing test**

Add tests that prove:
- `npx siyuan-cli search --content foo` calls the expected search API and prints friendly output
- `npx siyuan-cli search --json` returns raw JSON
- `npx siyuan-cli search` without criteria fails before making a request
- missing env vars fail lazily at command runtime

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/commands/search.test.ts`
Expected: FAIL because the `search` command does not exist yet

**Step 3: Write minimal implementation**

Add the command, service, and formatting helpers needed for the tests.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/commands/search.test.ts`
Expected: PASS

### Task 2: Wire search into CLI

**Files:**
- Modify: `src/cli/index.ts`
- Create: `src/commands/search.ts`
- Create: `src/services/search.ts`

**Step 1: Write the failing test**

Cover lazy env loading and request shape through CLI integration tests.

**Step 2: Run test to verify it fails**

Run: `npm test -- tests/commands/search.test.ts`
Expected: FAIL with unknown command or missing implementation

**Step 3: Write minimal implementation**

Register the command and build the service factory with `loadEnvConfig()`, `SiyuanClient`, and `createSearchService()` only inside the command action path.

**Step 4: Run test to verify it passes**

Run: `npm test -- tests/commands/search.test.ts`
Expected: PASS

### Task 3: Verify adjacent behavior

**Files:**
- Modify: `src/commands/search.ts`
- Modify: `src/services/search.ts`
- Test: `tests/commands/search.test.ts`
- Test: `tests/commands/system.test.ts`

**Step 1: Run adjacent tests**

Run: `npm test -- tests/commands/search.test.ts tests/commands/system.test.ts tests/cli/run.test.ts tests/cli/smoke.test.ts`
Expected: PASS

**Step 2: Run build**

Run: `npm run build`
Expected: PASS

**Step 3: Self-review**

Confirm the command stays minimal, env-only, and human-friendly by default.
