# Notebook Full Coverage Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expand the existing `notebook` command group toward fuller coverage by adding rename and remove flows, including destructive-command confirmation handling.

**Architecture:** Build on the existing notebook service and command module rather than introducing a parallel design. Add new service methods, extend command wiring, and connect the existing confirmation helper so destructive notebook removal requires explicit confirmation unless `--yes` is passed.

**Tech Stack:** TypeScript, Node.js, Commander, Jest, ts-jest

---

### Task 1: Add failing notebook coverage tests

**Files:**
- Modify: `tests/commands/notebook.test.ts`
- Test: `tests/core/confirm.test.ts`

**Step 1: Write the failing test**

Add tests that prove:
- `npx siyuan-cli notebook rename --id nb-1 --name "Projects 2"` calls the expected rename API and prints friendly output
- `npx siyuan-cli notebook rename --id nb-1 --name "Projects 2" --json` returns raw JSON
- `npx siyuan-cli notebook remove --id nb-1` requires confirmation by default
- `npx siyuan-cli notebook remove --id nb-1 --yes` skips confirmation and calls the expected remove API
- `npx siyuan-cli notebook remove --id nb-1 --json --yes` returns raw JSON
- blank `--id` and blank `--name` still fail before making requests

**Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath tests/commands/notebook.test.ts`
Expected: FAIL because the new notebook commands do not exist yet.

**Step 3: Write minimal implementation**

Do not add production code beyond the minimum needed to keep import paths aligned while the test still fails for missing behavior.

**Step 4: Run test to verify it still fails for missing behavior**

Run: `npm test -- --runTestsByPath tests/commands/notebook.test.ts`
Expected: FAIL with unknown command or missing behavior.

### Task 2: Extend notebook service

**Files:**
- Modify: `src/services/notebook.ts`
- Test: `tests/commands/notebook.test.ts`

**Step 1: Write the failing test**

Add or refine tests that expect the service-backed requests to use these endpoints:

```ts
/api/notebook/renameNotebook
/api/notebook/removeNotebook
```

Use request bodies like:

```ts
{ notebook: 'nb-1', name: 'Projects 2' }
{ notebook: 'nb-1' }
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath tests/commands/notebook.test.ts`
Expected: FAIL because the service methods do not exist.

**Step 3: Write minimal implementation**

Add service methods:

```ts
rename(id: string, name: string): Promise<unknown>
remove(id: string): Promise<unknown>
```

using the shared client and consistent validation patterns.

**Step 4: Run test to verify it passes**

Run: `npm test -- --runTestsByPath tests/commands/notebook.test.ts`
Expected: PASS for request-shape expectations.

### Task 3: Wire confirmation into notebook remove

**Files:**
- Modify: `src/core/confirm.ts`
- Modify: `src/commands/notebook.ts`
- Test: `tests/commands/notebook.test.ts`

**Step 1: Write the failing test**

Add tests that prove:
- `notebook remove` does not call the API when confirmation is declined
- `notebook remove --yes` skips confirmation

Prefer dependency injection in the command factory so tests can supply a fake confirmer without interactive prompts.

**Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath tests/commands/notebook.test.ts`
Expected: FAIL because confirmation is not integrated yet.

**Step 3: Write minimal implementation**

Extend the command factory to accept or create a confirmation function and call `requestConfirmation(...)` before destructive execution.

**Step 4: Run test to verify it passes**

Run: `npm test -- --runTestsByPath tests/commands/notebook.test.ts`
Expected: PASS.

### Task 4: Add notebook commands and friendly output

**Files:**
- Modify: `src/commands/notebook.ts`
- Test: `tests/commands/notebook.test.ts`

**Step 1: Write the failing test**

Add tests for friendly output like:

```text
Renamed notebook nb-1 to Projects 2
Removed notebook nb-1
```

and ensure `--json` continues to print raw JSON.

**Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath tests/commands/notebook.test.ts`
Expected: FAIL because the command actions and formatting do not exist yet.

**Step 3: Write minimal implementation**

Add `rename` and `remove` subcommands with:
- `--id <notebook-id>`
- `--name <name>` for rename
- `--yes` for remove
- `--json` support for both

Keep validation and output consistent with the existing notebook commands.

**Step 4: Run test to verify it passes**

Run: `npm test -- --runTestsByPath tests/commands/notebook.test.ts`
Expected: PASS.

### Task 5: Verify adjacent behavior

**Files:**
- Test: `tests/commands/notebook.test.ts`
- Test: `tests/core/confirm.test.ts`
- Test: `tests/commands/doc.test.ts`
- Test: `tests/commands/file.test.ts`
- Test: `tests/cli/run.test.ts`
- Test: `tests/cli/smoke.test.ts`

**Step 1: Run adjacent tests**

Run: `npm test -- --runTestsByPath tests/commands/notebook.test.ts tests/core/confirm.test.ts tests/commands/doc.test.ts tests/commands/file.test.ts tests/cli/run.test.ts tests/cli/smoke.test.ts`
Expected: PASS.

**Step 2: Run build**

Run: `npm run build`
Expected: PASS.

**Step 3: Self-review**

Confirm the notebook command group now covers create, list, get, open, close, rename, and remove with confirmation for destructive behavior.
