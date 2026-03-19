# Notify Command Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a minimal `notify push` command that sends a SiYuan notification with friendly terminal output.

**Architecture:** Add a dedicated `notify` command module and a small `notify` service built on the shared `SiyuanClient`. The command should lazily load env config and client at runtime, keep the first batch narrowly scoped to notification sending, print compact human-readable output by default, and support raw JSON output when requested.

**Tech Stack:** TypeScript, Node.js, Commander, Jest, ts-jest

---

### Task 1: Add failing notify CLI tests

**Files:**
- Create: `tests/commands/notify.test.ts`
- Test: `tests/commands/template.test.ts`

**Step 1: Write the failing test**

Add tests that prove:
- `siyuan notify push --msg "hello"` calls the expected notify API and prints friendly output
- `siyuan notify push --msg "hello" --json` returns raw JSON
- API failures are propagated with the shared error model
- missing env vars fail lazily at command runtime
- `siyuan --help` and `siyuan notify --help` do not trigger env loading

**Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath tests/commands/notify.test.ts`
Expected: FAIL because the `notify` command does not exist yet.

**Step 3: Write minimal implementation**

Do not implement production code yet beyond what is needed to satisfy the test import path and runtime wiring expectation.

**Step 4: Run test to verify it still fails for missing behavior**

Run: `npm test -- --runTestsByPath tests/commands/notify.test.ts`
Expected: FAIL with unknown command or missing command behavior.

### Task 2: Add notify service

**Files:**
- Create: `src/services/notify.ts`
- Test: `tests/commands/notify.test.ts`

**Step 1: Write the failing test**

Add or refine tests that expect the service-backed request to use this endpoint:

```ts
/api/notification/pushMsg
```

Use a request body like:

```ts
{ msg: 'hello' }
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath tests/commands/notify.test.ts`
Expected: FAIL because the notify service does not exist.

**Step 3: Write minimal implementation**

Create `createNotifyService(client)` with one method:

```ts
push(msg: string): Promise<NotifyResult>
```

Implementation should call:

```ts
client.request('/api/notification/pushMsg', { msg })
```

Normalize only what the tests need.

**Step 4: Run test to verify it passes**

Run: `npm test -- --runTestsByPath tests/commands/notify.test.ts`
Expected: PASS for request-shape expectations.

### Task 3: Add notify command

**Files:**
- Create: `src/commands/notify.ts`
- Modify: `src/cli/index.ts`
- Test: `tests/commands/notify.test.ts`

**Step 1: Write the failing test**

Add or refine tests covering:
- Commander registration under top-level `notify`
- subcommand `push`
- required option `--msg <text>`
- lazy env loading inside the action path only

**Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath tests/commands/notify.test.ts`
Expected: FAIL with unknown command or missing command wiring.

**Step 3: Write minimal implementation**

Create `createNotifyCommand(createService)` and register it from `src/cli/index.ts` using:
- `loadEnvConfig()`
- `new SiyuanClient(config)`
- `createNotifyService(client)`

inside the action path via the existing factory pattern.

The command should look like:

```ts
notify push --msg <text> [--json]
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --runTestsByPath tests/commands/notify.test.ts`
Expected: PASS for command registration and lazy env-loading behavior.

### Task 4: Add friendly notify output

**Files:**
- Modify: `src/commands/notify.ts`
- Test: `tests/commands/notify.test.ts`

**Step 1: Write the failing test**

Add tests for:
- `notify push` default output renders a compact success message
- `--json` returns the raw result

Use representative output like:

```text
Sent notification: hello
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath tests/commands/notify.test.ts`
Expected: FAIL because friendly formatting does not exist yet.

**Step 3: Write minimal implementation**

Add a tiny formatting helper inside `src/commands/notify.ts` that:
- renders the sent message in a concise human-readable form
- defers to `printOutput(..., { json: true })` for JSON mode

**Step 4: Run test to verify it passes**

Run: `npm test -- --runTestsByPath tests/commands/notify.test.ts`
Expected: PASS.

### Task 5: Verify adjacent CLI behavior

**Files:**
- Test: `tests/commands/notify.test.ts`
- Test: `tests/commands/template.test.ts`
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

Run: `npm test -- --runTestsByPath tests/commands/notify.test.ts tests/commands/template.test.ts tests/commands/snapshot.test.ts tests/commands/attr.test.ts tests/commands/file.test.ts tests/commands/export.test.ts tests/commands/block.test.ts tests/commands/tag.test.ts tests/commands/sql.test.ts tests/cli/run.test.ts tests/cli/smoke.test.ts`
Expected: PASS.

**Step 2: Run build**

Run: `npm run build`
Expected: PASS.

**Step 3: Self-review**

Confirm the command stays minimal, env-only, and human-friendly by default.
