# Tag Command Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add minimal read-only `tag` commands that list tags and show documents for a given tag with friendly terminal output.

**Architecture:** Add a dedicated `tag` command module and a small `tag` service built on the shared `SiyuanClient`. The command should lazily load env config and client at runtime, keep the surface read-only for now, print compact human-readable output by default, and support raw JSON output when requested.

**Tech Stack:** TypeScript, Node.js, Commander, Jest, ts-jest

---

### Task 1: Add failing tag CLI tests

**Files:**
- Create: `tests/commands/tag.test.ts`
- Test: `tests/commands/search.test.ts`

**Step 1: Write the failing test**

Add tests that prove:
- `npx siyuan-cli tag list` calls the expected tag listing API and prints friendly output
- `npx siyuan-cli tag list --json` returns raw JSON
- `npx siyuan-cli tag docs --label work` calls the expected tag-doc API and prints friendly output
- `npx siyuan-cli tag docs --label work --json` returns raw JSON
- empty results print `No results found.`
- missing env vars fail lazily at command runtime
- `npx siyuan-cli --help` and `npx siyuan-cli tag --help` do not trigger env loading

**Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath tests/commands/tag.test.ts`
Expected: FAIL because the `tag` command does not exist yet.

**Step 3: Write minimal implementation**

Do not implement production code yet beyond what is needed to satisfy the test import path and runtime wiring expectation.

**Step 4: Run test to verify it still fails for missing behavior**

Run: `npm test -- --runTestsByPath tests/commands/tag.test.ts`
Expected: FAIL with unknown command or missing command behavior.

### Task 2: Add tag service

**Files:**
- Create: `src/services/tag.ts`
- Test: `tests/commands/tag.test.ts`

**Step 1: Write the failing test**

Add or refine tests that expect the service-backed requests to use these endpoints:

```ts
/api/tag/getTag
/api/tag/getTagDoc
```

Use request bodies like:

```ts
undefined
{ label: 'work' }
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath tests/commands/tag.test.ts`
Expected: FAIL because the tag service does not exist.

**Step 3: Write minimal implementation**

Create `createTagService(client)` with two methods:

```ts
list(): Promise<TagSummary[]>
docs(label: string): Promise<TagDoc[]>
```

Implementation should call:

```ts
client.request('/api/tag/getTag')
client.request('/api/tag/getTagDoc', { label })
```

Normalize only what the tests need.

**Step 4: Run test to verify it passes**

Run: `npm test -- --runTestsByPath tests/commands/tag.test.ts`
Expected: PASS for request-shape expectations.

### Task 3: Add tag command

**Files:**
- Create: `src/commands/tag.ts`
- Modify: `src/cli/index.ts`
- Test: `tests/commands/tag.test.ts`

**Step 1: Write the failing test**

Add or refine tests covering:
- Commander registration under top-level `tag`
- subcommands `list` and `docs`
- required option `--label <tag>` for `docs`
- lazy env loading inside the action path only

**Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath tests/commands/tag.test.ts`
Expected: FAIL with unknown command or missing command wiring.

**Step 3: Write minimal implementation**

Create `createTagCommand(createService)` and register it from `src/cli/index.ts` using:
- `loadEnvConfig()`
- `new SiyuanClient(config)`
- `createTagService(client)`

inside the action path via the existing factory pattern.

The commands should look like:

```ts
tag list [--json]
tag docs --label <tag> [--json]
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --runTestsByPath tests/commands/tag.test.ts`
Expected: PASS for command registration and lazy env-loading behavior.

### Task 4: Add friendly tag output

**Files:**
- Modify: `src/commands/tag.ts`
- Test: `tests/commands/tag.test.ts`

**Step 1: Write the failing test**

Add tests for:
- `tag list` default output renders compact lines per tag
- `tag docs` default output renders compact numbered docs
- empty arrays print `No results found.`

Use representative output like:

```text
1. work (12)
2. project (3)
```

and:

```text
1. Work Plan
   /Projects/Work Plan
2. Daily Log
   /Journal/Daily Log
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath tests/commands/tag.test.ts`
Expected: FAIL because friendly formatting does not exist yet.

**Step 3: Write minimal implementation**

Add tiny formatting helpers inside `src/commands/tag.ts` that:
- render `No results found.` for empty arrays
- render `name (count)` for tag list entries
- render numbered title/path pairs for tag docs entries
- defer to `printOutput(..., { json: true })` for JSON mode

**Step 4: Run test to verify it passes**

Run: `npm test -- --runTestsByPath tests/commands/tag.test.ts`
Expected: PASS.

### Task 5: Verify adjacent CLI behavior

**Files:**
- Test: `tests/commands/tag.test.ts`
- Test: `tests/commands/search.test.ts`
- Test: `tests/commands/sql.test.ts`
- Test: `tests/cli/run.test.ts`
- Test: `tests/cli/smoke.test.ts`

**Step 1: Run adjacent tests**

Run: `npm test -- --runTestsByPath tests/commands/tag.test.ts tests/commands/search.test.ts tests/commands/sql.test.ts tests/cli/run.test.ts tests/cli/smoke.test.ts`
Expected: PASS.

**Step 2: Run build**

Run: `npm run build`
Expected: PASS.

**Step 3: Self-review**

Confirm the command stays minimal, env-only, read-oriented, and human-friendly by default.
