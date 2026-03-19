# Export Command Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add minimal `export` commands that preview and export Markdown for a document with friendly terminal output.

**Architecture:** Add a dedicated `export` command module and a small `export` service built on the shared `SiyuanClient`. The command should lazily load env config and client at runtime, keep the first batch narrowly scoped to preview and Markdown export, print compact human-readable output by default, and support raw JSON output when requested.

**Tech Stack:** TypeScript, Node.js, Commander, Jest, ts-jest

---

### Task 1: Add failing export CLI tests

**Files:**
- Create: `tests/commands/export.test.ts`
- Test: `tests/commands/doc.test.ts`

**Step 1: Write the failing test**

Add tests that prove:
- `siyuan export preview --id doc-1` calls the expected preview API and prints friendly output
- `siyuan export preview --id doc-1 --json` returns raw JSON
- `siyuan export markdown --id doc-1` calls the expected markdown export API and prints friendly output
- `siyuan export markdown --id doc-1 --json` returns raw JSON
- missing env vars fail lazily at command runtime
- `siyuan --help` and `siyuan export --help` do not trigger env loading

**Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath tests/commands/export.test.ts`
Expected: FAIL because the `export` command does not exist yet.

**Step 3: Write minimal implementation**

Do not implement production code yet beyond what is needed to satisfy the test import path and runtime wiring expectation.

**Step 4: Run test to verify it still fails for missing behavior**

Run: `npm test -- --runTestsByPath tests/commands/export.test.ts`
Expected: FAIL with unknown command or missing command behavior.

### Task 2: Add export service

**Files:**
- Create: `src/services/export.ts`
- Test: `tests/commands/export.test.ts`

**Step 1: Write the failing test**

Add or refine tests that expect the service-backed requests to use these endpoints:

```ts
/api/export/preview
/api/export/exportMd
```

Use request bodies like:

```ts
{ id: 'doc-1' }
{ id: 'doc-1' }
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath tests/commands/export.test.ts`
Expected: FAIL because the export service does not exist.

**Step 3: Write minimal implementation**

Create `createExportService(client)` with two methods:

```ts
preview(id: string): Promise<ExportPreview>
markdown(id: string): Promise<ExportMarkdownResult>
```

Implementation should call:

```ts
client.request('/api/export/preview', { id })
client.request('/api/export/exportMd', { id })
```

Normalize only what the tests need.

**Step 4: Run test to verify it passes**

Run: `npm test -- --runTestsByPath tests/commands/export.test.ts`
Expected: PASS for request-shape expectations.

### Task 3: Add export command

**Files:**
- Create: `src/commands/export.ts`
- Modify: `src/cli/index.ts`
- Test: `tests/commands/export.test.ts`

**Step 1: Write the failing test**

Add or refine tests covering:
- Commander registration under top-level `export`
- subcommands `preview` and `markdown`
- required option `--id <document-id>`
- lazy env loading inside the action path only

**Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath tests/commands/export.test.ts`
Expected: FAIL with unknown command or missing command wiring.

**Step 3: Write minimal implementation**

Create `createExportCommand(createService)` and register it from `src/cli/index.ts` using:
- `loadEnvConfig()`
- `new SiyuanClient(config)`
- `createExportService(client)`

inside the action path via the existing factory pattern.

The commands should look like:

```ts
export preview --id <document-id> [--json]
export markdown --id <document-id> [--json]
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --runTestsByPath tests/commands/export.test.ts`
Expected: PASS for command registration and lazy env-loading behavior.

### Task 4: Add friendly export output

**Files:**
- Modify: `src/commands/export.ts`
- Test: `tests/commands/export.test.ts`

**Step 1: Write the failing test**

Add tests for:
- `export preview` default output renders a compact summary
- `export markdown` default output renders export result summary

Use representative output like:

```text
name: Spec
path: /Projects/Spec
exportPath: /tmp/spec
```

and:

```text
document: Spec
markdownPath: /tmp/spec.md
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath tests/commands/export.test.ts`
Expected: FAIL because friendly formatting does not exist yet.

**Step 3: Write minimal implementation**

Add tiny formatting helpers inside `src/commands/export.ts` that:
- render preview info as key lines for `name`, `path`, and `exportPath`
- render markdown export info as key lines for `document` and `markdownPath`
- defer to `printOutput(..., { json: true })` for JSON mode

**Step 4: Run test to verify it passes**

Run: `npm test -- --runTestsByPath tests/commands/export.test.ts`
Expected: PASS.

### Task 5: Verify adjacent CLI behavior

**Files:**
- Test: `tests/commands/export.test.ts`
- Test: `tests/commands/doc.test.ts`
- Test: `tests/commands/block.test.ts`
- Test: `tests/commands/tag.test.ts`
- Test: `tests/commands/sql.test.ts`
- Test: `tests/cli/run.test.ts`
- Test: `tests/cli/smoke.test.ts`

**Step 1: Run adjacent tests**

Run: `npm test -- --runTestsByPath tests/commands/export.test.ts tests/commands/doc.test.ts tests/commands/block.test.ts tests/commands/tag.test.ts tests/commands/sql.test.ts tests/cli/run.test.ts tests/cli/smoke.test.ts`
Expected: PASS.

**Step 2: Run build**

Run: `npm run build`
Expected: PASS.

**Step 3: Self-review**

Confirm the command stays minimal, env-only, and human-friendly by default.
