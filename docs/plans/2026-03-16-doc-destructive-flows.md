# Doc Destructive Flows Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expand the `doc` command group with destructive and move-style operations, including confirmation handling for removal.

**Architecture:** Extend the existing document service and command module rather than adding parallel abstractions. Reuse the existing env loading, HTTP client, content validation patterns, and confirmation helper so document removal follows the same safety model as notebook removal.

**Tech Stack:** TypeScript, Node.js, Commander, Jest, ts-jest

---

### Task 1: Add failing doc coverage tests

**Files:**
- Modify: `tests/commands/doc.test.ts`
- Test: `tests/core/confirm.test.ts`

**Step 1: Write the failing test**

Add tests that prove:
- `npx siyuan-cli doc rename --id doc-1 --path /Projects/NewName` calls the expected rename API and prints friendly output
- `npx siyuan-cli doc move --id doc-1 --path /Archive/Old` calls the expected move API and prints friendly output
- `npx siyuan-cli doc remove --id doc-1` requires confirmation by default
- `npx siyuan-cli doc remove --id doc-1 --yes` skips confirmation and calls the expected remove API
- `--json` returns raw JSON for the new commands
- blank `--id` and blank `--path` fail before requests are made

**Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath tests/commands/doc.test.ts`
Expected: FAIL because the new doc commands do not exist yet.

**Step 3: Write minimal implementation**

Do not add production code beyond the minimum needed to keep import paths aligned while the test still fails for missing behavior.

**Step 4: Run test to verify it still fails for missing behavior**

Run: `npm test -- --runTestsByPath tests/commands/doc.test.ts`
Expected: FAIL with unknown command or missing behavior.

### Task 2: Extend doc service

**Files:**
- Modify: `src/services/doc.ts`
- Test: `tests/commands/doc.test.ts`

**Step 1: Write the failing test**

Add or refine tests that expect the service-backed requests to use these endpoints:

```ts
/api/filetree/renameDoc
/api/filetree/moveDocs
/api/filetree/removeDoc
```

Use request bodies like:

```ts
{ id: 'doc-1', path: '/Projects/NewName' }
{ fromPaths: ['doc-1'], toNotebook: '', toPath: '/Archive/Old' }
{ id: 'doc-1' }
```

Adjust the exact request shapes to match the service design you settle on, but keep tests specific.

**Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath tests/commands/doc.test.ts`
Expected: FAIL because the service methods do not exist.

**Step 3: Write minimal implementation**

Add service methods:

```ts
rename(input: { id: string; path: string }): Promise<unknown>
move(input: { id: string; path: string }): Promise<unknown>
remove(id: string): Promise<unknown>
```

Keep validation local and consistent with the existing doc helpers.

**Step 4: Run test to verify it passes**

Run: `npm test -- --runTestsByPath tests/commands/doc.test.ts`
Expected: PASS for request-shape expectations.

### Task 3: Wire confirmation into doc remove

**Files:**
- Modify: `src/commands/doc.ts`
- Test: `tests/commands/doc.test.ts`

**Step 1: Write the failing test**

Add tests that prove:
- `doc remove` does not call the API when confirmation is declined
- `doc remove --yes` skips confirmation

Prefer dependency injection in the command factory so tests can provide a fake confirmer without interactive prompts.

**Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath tests/commands/doc.test.ts`
Expected: FAIL because confirmation is not integrated yet.

**Step 3: Write minimal implementation**

Use `requestConfirmation(...)` before the destructive remove action and keep behavior aligned with notebook removal.

**Step 4: Run test to verify it passes**

Run: `npm test -- --runTestsByPath tests/commands/doc.test.ts`
Expected: PASS.

### Task 4: Add doc commands and friendly output

**Files:**
- Modify: `src/commands/doc.ts`
- Test: `tests/commands/doc.test.ts`

**Step 1: Write the failing test**

Add tests for friendly output like:

```text
Renamed document doc-1 to /Projects/NewName
Moved document doc-1 to /Archive/Old
Removed document doc-1
```

and ensure `--json` continues to print raw JSON.

**Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath tests/commands/doc.test.ts`
Expected: FAIL because the command actions and formatting do not exist yet.

**Step 3: Write minimal implementation**

Add `rename`, `move`, and `remove` subcommands with:
- `--id <document-id>`
- `--path <path>` for rename and move
- `--yes` for remove
- `--json` support for all

Keep validation and output consistent with the existing doc commands.

**Step 4: Run test to verify it passes**

Run: `npm test -- --runTestsByPath tests/commands/doc.test.ts`
Expected: PASS.

### Task 5: Verify adjacent behavior

**Files:**
- Test: `tests/commands/doc.test.ts`
- Test: `tests/commands/notebook.test.ts`
- Test: `tests/core/confirm.test.ts`
- Test: `tests/commands/file.test.ts`
- Test: `tests/cli/run.test.ts`
- Test: `tests/cli/smoke.test.ts`

**Step 1: Run adjacent tests**

Run: `npm test -- --runTestsByPath tests/commands/doc.test.ts tests/commands/notebook.test.ts tests/core/confirm.test.ts tests/commands/file.test.ts tests/cli/run.test.ts tests/cli/smoke.test.ts`
Expected: PASS.

**Step 2: Run build**

Run: `npm run build`
Expected: PASS.

**Step 3: Self-review**

Confirm the doc command group now covers read, create, update, append, rename, move, and remove, with confirmation for destructive removal.
