# Attr Command Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add minimal read-only `attr` commands that fetch block attributes and list available attribute names with friendly terminal output.

**Architecture:** Add a dedicated `attr` command module and a small `attr` service built on the shared `SiyuanClient`. The command should lazily load env config and client at runtime, keep the first batch read-only, print compact human-readable output by default, and support raw JSON output when requested.

**Tech Stack:** TypeScript, Node.js, Commander, Jest, ts-jest

---

### Task 1: Add failing attr CLI tests

**Files:**
- Create: `tests/commands/attr.test.ts`
- Test: `tests/commands/file.test.ts`

**Step 1: Write the failing test**

Add tests that prove:
- `siyuan attr get --id blk-1` calls the expected attr API and prints friendly output
- `siyuan attr get --id blk-1 --json` returns raw JSON
- `siyuan attr list` calls the expected attr-name API and prints friendly output
- `siyuan attr list --json` returns raw JSON
- empty list results print `No results found.`
- missing env vars fail lazily at command runtime
- `siyuan --help` and `siyuan attr --help` do not trigger env loading

**Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath tests/commands/attr.test.ts`
Expected: FAIL because the `attr` command does not exist yet.

**Step 3: Write minimal implementation**

Do not implement production code yet beyond what is needed to satisfy the test import path and runtime wiring expectation.

**Step 4: Run test to verify it still fails for missing behavior**

Run: `npm test -- --runTestsByPath tests/commands/attr.test.ts`
Expected: FAIL with unknown command or missing command behavior.

### Task 2: Add attr service

**Files:**
- Create: `src/services/attr.ts`
- Test: `tests/commands/attr.test.ts`

**Step 1: Write the failing test**

Add or refine tests that expect the service-backed requests to use these endpoints:

```ts
/api/attr/getBlockAttrs
/api/attr/getAllKeys
```

Use request bodies like:

```ts
{ id: 'blk-1' }
undefined
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath tests/commands/attr.test.ts`
Expected: FAIL because the attr service does not exist.

**Step 3: Write minimal implementation**

Create `createAttrService(client)` with two methods:

```ts
get(id: string): Promise<Record<string, string>>
list(): Promise<string[]>
```

Implementation should call:

```ts
client.request('/api/attr/getBlockAttrs', { id })
client.request('/api/attr/getAllKeys')
```

Normalize only what the tests need.

**Step 4: Run test to verify it passes**

Run: `npm test -- --runTestsByPath tests/commands/attr.test.ts`
Expected: PASS for request-shape expectations.

### Task 3: Add attr command

**Files:**
- Create: `src/commands/attr.ts`
- Modify: `src/cli/index.ts`
- Test: `tests/commands/attr.test.ts`

**Step 1: Write the failing test**

Add or refine tests covering:
- Commander registration under top-level `attr`
- subcommands `get` and `list`
- required option `--id <block-id>` for `get`
- lazy env loading inside the action path only

**Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath tests/commands/attr.test.ts`
Expected: FAIL with unknown command or missing command wiring.

**Step 3: Write minimal implementation**

Create `createAttrCommand(createService)` and register it from `src/cli/index.ts` using:
- `loadEnvConfig()`
- `new SiyuanClient(config)`
- `createAttrService(client)`

inside the action path via the existing factory pattern.

The commands should look like:

```ts
attr get --id <block-id> [--json]
attr list [--json]
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --runTestsByPath tests/commands/attr.test.ts`
Expected: PASS for command registration and lazy env-loading behavior.

### Task 4: Add friendly attr output

**Files:**
- Modify: `src/commands/attr.ts`
- Test: `tests/commands/attr.test.ts`

**Step 1: Write the failing test**

Add tests for:
- `attr get` default output renders `key: value` lines
- `attr list` default output renders numbered attribute names
- empty arrays print `No results found.`

Use representative output like:

```text
alias: project-note
custom-color: blue
```

and:

```text
1. alias
2. custom-color
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath tests/commands/attr.test.ts`
Expected: FAIL because friendly formatting does not exist yet.

**Step 3: Write minimal implementation**

Add tiny formatting helpers inside `src/commands/attr.ts` that:
- render `No results found.` for empty arrays
- render attr objects as `key: value` lines preserving `Object.entries()` order
- render attr keys as numbered entries
- defer to `printOutput(..., { json: true })` for JSON mode

**Step 4: Run test to verify it passes**

Run: `npm test -- --runTestsByPath tests/commands/attr.test.ts`
Expected: PASS.

### Task 5: Verify adjacent CLI behavior

**Files:**
- Test: `tests/commands/attr.test.ts`
- Test: `tests/commands/file.test.ts`
- Test: `tests/commands/export.test.ts`
- Test: `tests/commands/block.test.ts`
- Test: `tests/commands/tag.test.ts`
- Test: `tests/commands/sql.test.ts`
- Test: `tests/cli/run.test.ts`
- Test: `tests/cli/smoke.test.ts`

**Step 1: Run adjacent tests**

Run: `npm test -- --runTestsByPath tests/commands/attr.test.ts tests/commands/file.test.ts tests/commands/export.test.ts tests/commands/block.test.ts tests/commands/tag.test.ts tests/commands/sql.test.ts tests/cli/run.test.ts tests/cli/smoke.test.ts`
Expected: PASS.

**Step 2: Run build**

Run: `npm run build`
Expected: PASS.

**Step 3: Self-review**

Confirm the command stays minimal, env-only, read-oriented, and human-friendly by default.
