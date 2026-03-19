# Template Command Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add minimal read-only `template` commands that list templates and read template content with friendly terminal output.

**Architecture:** Add a dedicated `template` command module and a small `template` service built on the shared `SiyuanClient`. The command should lazily load env config and client at runtime, keep the first batch read-only, print compact human-readable output by default, and support raw JSON output when requested.

**Tech Stack:** TypeScript, Node.js, Commander, Jest, ts-jest

---

### Task 1: Add failing template CLI tests

**Files:**
- Create: `tests/commands/template.test.ts`
- Test: `tests/commands/snapshot.test.ts`

**Step 1: Write the failing test**

Add tests that prove:
- `siyuan template list` calls the expected template-list API and prints friendly output
- `siyuan template list --json` returns raw JSON
- `siyuan template get --path /templates/daily.md` calls the expected template-read API and prints friendly output
- `siyuan template get --path /templates/daily.md --json` returns raw JSON
- empty list results print `No results found.`
- missing env vars fail lazily at command runtime
- `siyuan --help` and `siyuan template --help` do not trigger env loading

**Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath tests/commands/template.test.ts`
Expected: FAIL because the `template` command does not exist yet.

**Step 3: Write minimal implementation**

Do not implement production code yet beyond what is needed to satisfy the test import path and runtime wiring expectation.

**Step 4: Run test to verify it still fails for missing behavior**

Run: `npm test -- --runTestsByPath tests/commands/template.test.ts`
Expected: FAIL with unknown command or missing command behavior.

### Task 2: Add template service

**Files:**
- Create: `src/services/template.ts`
- Test: `tests/commands/template.test.ts`

**Step 1: Write the failing test**

Add or refine tests that expect the service-backed requests to use these endpoints:

```ts
/api/template/searchTemplate
/api/template/render
```

Use request bodies like:

```ts
{ k: '' }
{ path: '/templates/daily.md' }
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath tests/commands/template.test.ts`
Expected: FAIL because the template service does not exist.

**Step 3: Write minimal implementation**

Create `createTemplateService(client)` with two methods:

```ts
list(): Promise<TemplateSummary[]>
get(path: string): Promise<TemplateContent>
```

Implementation should call:

```ts
client.request('/api/template/searchTemplate', { k: '' })
client.request('/api/template/render', { path })
```

Normalize only what the tests need.

**Step 4: Run test to verify it passes**

Run: `npm test -- --runTestsByPath tests/commands/template.test.ts`
Expected: PASS for request-shape expectations.

### Task 3: Add template command

**Files:**
- Create: `src/commands/template.ts`
- Modify: `src/cli/index.ts`
- Test: `tests/commands/template.test.ts`

**Step 1: Write the failing test**

Add or refine tests covering:
- Commander registration under top-level `template`
- subcommands `list` and `get`
- required option `--path <template>` for `get`
- lazy env loading inside the action path only

**Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath tests/commands/template.test.ts`
Expected: FAIL with unknown command or missing command wiring.

**Step 3: Write minimal implementation**

Create `createTemplateCommand(createService)` and register it from `src/cli/index.ts` using:
- `loadEnvConfig()`
- `new SiyuanClient(config)`
- `createTemplateService(client)`

inside the action path via the existing factory pattern.

The commands should look like:

```ts
template list [--json]
template get --path <template> [--json]
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --runTestsByPath tests/commands/template.test.ts`
Expected: PASS for command registration and lazy env-loading behavior.

### Task 4: Add friendly template output

**Files:**
- Modify: `src/commands/template.ts`
- Test: `tests/commands/template.test.ts`

**Step 1: Write the failing test**

Add tests for:
- `template list` default output renders numbered template paths
- `template get` default output renders the template content text
- empty arrays print `No results found.`

Use representative output like:

```text
1. /templates/daily.md
2. /templates/weekly.md
```

and:

```text
# Daily Note

- item
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath tests/commands/template.test.ts`
Expected: FAIL because friendly formatting does not exist yet.

**Step 3: Write minimal implementation**

Add tiny formatting helpers inside `src/commands/template.ts` that:
- render `No results found.` for empty arrays
- render template paths as numbered entries
- render template content as plain text content
- defer to `printOutput(..., { json: true })` for JSON mode

**Step 4: Run test to verify it passes**

Run: `npm test -- --runTestsByPath tests/commands/template.test.ts`
Expected: PASS.

### Task 5: Verify adjacent CLI behavior

**Files:**
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

Run: `npm test -- --runTestsByPath tests/commands/template.test.ts tests/commands/snapshot.test.ts tests/commands/attr.test.ts tests/commands/file.test.ts tests/commands/export.test.ts tests/commands/block.test.ts tests/commands/tag.test.ts tests/commands/sql.test.ts tests/cli/run.test.ts tests/cli/smoke.test.ts`
Expected: PASS.

**Step 2: Run build**

Run: `npm run build`
Expected: PASS.

**Step 3: Self-review**

Confirm the command stays minimal, env-only, read-oriented, and human-friendly by default.
