# Block Command Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add minimal read-only `block` commands that fetch one block and list its children with friendly terminal output.

**Architecture:** Add a dedicated `block` command module and a small `block` service built on the shared `SiyuanClient`. The command should lazily load env config and client at runtime, keep the surface read-only for now, print compact human-readable output by default, and support raw JSON output when requested.

**Tech Stack:** TypeScript, Node.js, Commander, Jest, ts-jest

---

### Task 1: Add failing block CLI tests

**Files:**
- Create: `tests/commands/block.test.ts`
- Test: `tests/commands/doc.test.ts`

**Step 1: Write the failing test**

Add tests that prove:
- `npx siyuan-cli block get --id blk-1` calls the expected block API and prints friendly output
- `npx siyuan-cli block get --id blk-1 --json` returns raw JSON
- `npx siyuan-cli block children --id blk-1` calls the expected child-block API and prints friendly output
- `npx siyuan-cli block children --id blk-1 --json` returns raw JSON
- empty child results print `No results found.`
- missing env vars fail lazily at command runtime
- `npx siyuan-cli --help` and `npx siyuan-cli block --help` do not trigger env loading

**Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath tests/commands/block.test.ts`
Expected: FAIL because the `block` command does not exist yet.

**Step 3: Write minimal implementation**

Do not implement production code yet beyond what is needed to satisfy the test import path and runtime wiring expectation.

**Step 4: Run test to verify it still fails for missing behavior**

Run: `npm test -- --runTestsByPath tests/commands/block.test.ts`
Expected: FAIL with unknown command or missing command behavior.

### Task 2: Add block service

**Files:**
- Create: `src/services/block.ts`
- Test: `tests/commands/block.test.ts`

**Step 1: Write the failing test**

Add or refine tests that expect the service-backed requests to use these endpoints:

```ts
/api/block/getBlockInfo
/api/block/getChildBlocks
```

Use request bodies like:

```ts
{ id: 'blk-1' }
{ id: 'blk-1' }
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath tests/commands/block.test.ts`
Expected: FAIL because the block service does not exist.

**Step 3: Write minimal implementation**

Create `createBlockService(client)` with two methods:

```ts
get(id: string): Promise<BlockInfo>
children(id: string): Promise<BlockChild[]>
```

Implementation should call:

```ts
client.request('/api/block/getBlockInfo', { id })
client.request('/api/block/getChildBlocks', { id })
```

Normalize only what the tests need.

**Step 4: Run test to verify it passes**

Run: `npm test -- --runTestsByPath tests/commands/block.test.ts`
Expected: PASS for request-shape expectations.

### Task 3: Add block command

**Files:**
- Create: `src/commands/block.ts`
- Modify: `src/cli/index.ts`
- Test: `tests/commands/block.test.ts`

**Step 1: Write the failing test**

Add or refine tests covering:
- Commander registration under top-level `block`
- subcommands `get` and `children`
- required option `--id <block-id>`
- lazy env loading inside the action path only

**Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath tests/commands/block.test.ts`
Expected: FAIL with unknown command or missing command wiring.

**Step 3: Write minimal implementation**

Create `createBlockCommand(createService)` and register it from `src/cli/index.ts` using:
- `loadEnvConfig()`
- `new SiyuanClient(config)`
- `createBlockService(client)`

inside the action path via the existing factory pattern.

The commands should look like:

```ts
block get --id <block-id> [--json]
block children --id <block-id> [--json]
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --runTestsByPath tests/commands/block.test.ts`
Expected: PASS for command registration and lazy env-loading behavior.

### Task 4: Add friendly block output

**Files:**
- Modify: `src/commands/block.ts`
- Test: `tests/commands/block.test.ts`

**Step 1: Write the failing test**

Add tests for:
- `block get` default output renders a compact summary of the block
- `block children` default output renders numbered child blocks
- empty arrays print `No results found.`

Use representative output like:

```text
id: blk-1
content: Alpha block
path: /Projects/Spec
```

and:

```text
1. Child one
   id: blk-2
2. Child two
   id: blk-3
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath tests/commands/block.test.ts`
Expected: FAIL because friendly formatting does not exist yet.

**Step 3: Write minimal implementation**

Add tiny formatting helpers inside `src/commands/block.ts` that:
- render `No results found.` for empty arrays
- render block info as key lines for `id`, `content`, and `path`
- render child blocks as numbered entries with title/content and id
- defer to `printOutput(..., { json: true })` for JSON mode

**Step 4: Run test to verify it passes**

Run: `npm test -- --runTestsByPath tests/commands/block.test.ts`
Expected: PASS.

### Task 5: Verify adjacent CLI behavior

**Files:**
- Test: `tests/commands/block.test.ts`
- Test: `tests/commands/doc.test.ts`
- Test: `tests/commands/tag.test.ts`
- Test: `tests/commands/sql.test.ts`
- Test: `tests/cli/run.test.ts`
- Test: `tests/cli/smoke.test.ts`

**Step 1: Run adjacent tests**

Run: `npm test -- --runTestsByPath tests/commands/block.test.ts tests/commands/doc.test.ts tests/commands/tag.test.ts tests/commands/sql.test.ts tests/cli/run.test.ts tests/cli/smoke.test.ts`
Expected: PASS.

**Step 2: Run build**

Run: `npm run build`
Expected: PASS.

**Step 3: Self-review**

Confirm the command stays minimal, env-only, read-oriented, and human-friendly by default.
