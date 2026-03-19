# File Command Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add minimal read-only `file` commands that browse a file tree and read file content with friendly terminal output.

**Architecture:** Add a dedicated `file` command module and a small `file` service built on the shared `SiyuanClient`. The command should lazily load env config and client at runtime, keep the first batch read-only, print compact human-readable output by default, and support raw JSON output when requested.

**Tech Stack:** TypeScript, Node.js, Commander, Jest, ts-jest

---

### Task 1: Add failing file CLI tests

**Files:**
- Create: `tests/commands/file.test.ts`
- Test: `tests/commands/export.test.ts`

**Step 1: Write the failing test**

Add tests that prove:
- `siyuan file tree --path /data/assets` calls the expected file-tree API and prints friendly output
- `siyuan file tree --path /data/assets --json` returns raw JSON
- `siyuan file read --path /data/assets/readme.md` calls the expected file-read API and prints friendly output
- `siyuan file read --path /data/assets/readme.md --json` returns raw JSON
- empty tree results print `No results found.`
- missing env vars fail lazily at command runtime
- `siyuan --help` and `siyuan file --help` do not trigger env loading

**Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath tests/commands/file.test.ts`
Expected: FAIL because the `file` command does not exist yet.

**Step 3: Write minimal implementation**

Do not implement production code yet beyond what is needed to satisfy the test import path and runtime wiring expectation.

**Step 4: Run test to verify it still fails for missing behavior**

Run: `npm test -- --runTestsByPath tests/commands/file.test.ts`
Expected: FAIL with unknown command or missing command behavior.

### Task 2: Add file service

**Files:**
- Create: `src/services/file.ts`
- Test: `tests/commands/file.test.ts`

**Step 1: Write the failing test**

Add or refine tests that expect the service-backed requests to use these endpoints:

```ts
/api/file/getFile
/api/file/getFileContent
```

Use request bodies like:

```ts
{ path: '/data/assets' }
{ path: '/data/assets/readme.md' }
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath tests/commands/file.test.ts`
Expected: FAIL because the file service does not exist.

**Step 3: Write minimal implementation**

Create `createFileService(client)` with two methods:

```ts
tree(path: string): Promise<FileTreeNode[]>
read(path: string): Promise<FileReadResult>
```

Implementation should call:

```ts
client.request('/api/file/getFile', { path })
client.request('/api/file/getFileContent', { path })
```

Normalize only what the tests need.

**Step 4: Run test to verify it passes**

Run: `npm test -- --runTestsByPath tests/commands/file.test.ts`
Expected: PASS for request-shape expectations.

### Task 3: Add file command

**Files:**
- Create: `src/commands/file.ts`
- Modify: `src/cli/index.ts`
- Test: `tests/commands/file.test.ts`

**Step 1: Write the failing test**

Add or refine tests covering:
- Commander registration under top-level `file`
- subcommands `tree` and `read`
- required option `--path <path>`
- lazy env loading inside the action path only

**Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath tests/commands/file.test.ts`
Expected: FAIL with unknown command or missing command wiring.

**Step 3: Write minimal implementation**

Create `createFileCommand(createService)` and register it from `src/cli/index.ts` using:
- `loadEnvConfig()`
- `new SiyuanClient(config)`
- `createFileService(client)`

inside the action path via the existing factory pattern.

The commands should look like:

```ts
file tree --path <path> [--json]
file read --path <path> [--json]
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --runTestsByPath tests/commands/file.test.ts`
Expected: PASS for command registration and lazy env-loading behavior.

### Task 4: Add friendly file output

**Files:**
- Modify: `src/commands/file.ts`
- Test: `tests/commands/file.test.ts`

**Step 1: Write the failing test**

Add tests for:
- `file tree` default output renders a compact tree/list view
- `file read` default output renders the returned content text
- empty arrays print `No results found.`

Use representative output like:

```text
1. readme.md
2. images/
```

and:

```text
# Hello

World
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath tests/commands/file.test.ts`
Expected: FAIL because friendly formatting does not exist yet.

**Step 3: Write minimal implementation**

Add tiny formatting helpers inside `src/commands/file.ts` that:
- render `No results found.` for empty arrays
- render file tree items as numbered names, suffixing directories with `/`
- render file read output as plain text content
- defer to `printOutput(..., { json: true })` for JSON mode

**Step 4: Run test to verify it passes**

Run: `npm test -- --runTestsByPath tests/commands/file.test.ts`
Expected: PASS.

### Task 5: Verify adjacent CLI behavior

**Files:**
- Test: `tests/commands/file.test.ts`
- Test: `tests/commands/export.test.ts`
- Test: `tests/commands/block.test.ts`
- Test: `tests/commands/tag.test.ts`
- Test: `tests/commands/sql.test.ts`
- Test: `tests/cli/run.test.ts`
- Test: `tests/cli/smoke.test.ts`

**Step 1: Run adjacent tests**

Run: `npm test -- --runTestsByPath tests/commands/file.test.ts tests/commands/export.test.ts tests/commands/block.test.ts tests/commands/tag.test.ts tests/commands/sql.test.ts tests/cli/run.test.ts tests/cli/smoke.test.ts`
Expected: PASS.

**Step 2: Run build**

Run: `npm run build`
Expected: PASS.

**Step 3: Self-review**

Confirm the command stays minimal, env-only, read-oriented, and human-friendly by default.
