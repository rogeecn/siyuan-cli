# Document Lifecycle Live Test Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Verify the live SiYuan environment supports end-to-end document lifecycle operations through the CLI: create, read, update, search, optionally rename/move, and delete.

**Architecture:** Do not change product code unless live testing proves a real bug. Use the built CLI against the configured live environment, operate only on uniquely identifiable test documents, and verify each mutation step with a read or search before continuing.

**Tech Stack:** TypeScript CLI, Node.js, Commander, live SiYuan HTTP API via built CLI

---

### Task 1: Prepare a unique live-test target

**Files:**
- Modify: none

**Step 1: Define unique test markers**

Choose a unique timestamped document path and content markers for this run, for example:

```text
Notebook: <live notebook id>
Path A: /cli-e2e/live-test-20260319-<nonce>
Path B: /cli-e2e/live-test-renamed-20260319-<nonce>
Marker A: CLI_E2E_CREATE_<nonce>
Marker B: CLI_E2E_UPDATE_<nonce>
```

**Step 2: Verify notebook availability**

Run: `set -a; . "/home/rogee/Projects/siyuan-cli/.env"; set +a; node dist/src/cli/run.js notebook list --json`
Expected: PASS and return at least one notebook id to target.

**Step 3: Verify build is current**

Run: `npm run build`
Expected: PASS.

**Step 4: Record chosen target values**

Store the selected notebook id, path, and markers in the session notes before mutation.

**Step 5: Commit**

```bash
# No commit for this task; this is live-test setup only.
```

### Task 2: Create and read a live test document

**Files:**
- Modify: none

**Step 1: Create the document**

Run a command like:

```bash
set -a; . "/home/rogee/Projects/siyuan-cli/.env"; set +a; node dist/src/cli/run.js doc create --notebook <NOTEBOOK_ID> --path "/cli-e2e/live-test-<nonce>" --content "# CLI E2E\n\nCLI_E2E_CREATE_<nonce>" --json
```

Expected: PASS with a JSON object containing a document id and created path.

**Step 2: Read the created document**

Run:

```bash
set -a; . "/home/rogee/Projects/siyuan-cli/.env"; set +a; node dist/src/cli/run.js doc get --id <DOC_ID>
```

Expected: PASS and output contains `CLI_E2E_CREATE_<nonce>`.

**Step 3: Verify search can find it**

Run:

```bash
set -a; . "/home/rogee/Projects/siyuan-cli/.env"; set +a; node dist/src/cli/run.js search --content "CLI_E2E_CREATE_<nonce>" --json
```

Expected: PASS and return at least one matching result.

**Step 4: Stop if create/read/search disagree**

If any command fails or the marker is missing, capture exact output and do not continue to mutation.

**Step 5: Commit**

```bash
# No commit for this task; this is live-test execution only.
```

### Task 3: Update the document and verify new content

**Files:**
- Modify: none

**Step 1: Update or append content**

Prefer full replacement first:

```bash
set -a; . "/home/rogee/Projects/siyuan-cli/.env"; set +a; node dist/src/cli/run.js doc update --id <DOC_ID> --content "# CLI E2E\n\nCLI_E2E_CREATE_<nonce>\n\nCLI_E2E_UPDATE_<nonce>" --json
```

Expected: PASS.

If update semantics are ambiguous, use `doc append` with marker B instead.

**Step 2: Read document again**

Run:

```bash
set -a; . "/home/rogee/Projects/siyuan-cli/.env"; set +a; node dist/src/cli/run.js doc get --id <DOC_ID>
```

Expected: PASS and output contains `CLI_E2E_UPDATE_<nonce>`.

**Step 3: Verify search sees updated marker**

Run:

```bash
set -a; . "/home/rogee/Projects/siyuan-cli/.env"; set +a; node dist/src/cli/run.js search --content "CLI_E2E_UPDATE_<nonce>" --json
```

Expected: PASS and return at least one matching result.

**Step 4: Stop on mismatch**

If updated content is not readable or not searchable, record exact outputs and stop before rename/delete.

**Step 5: Commit**

```bash
# No commit for this task; this is live-test execution only.
```

### Task 4: Rename or move, then delete and verify cleanup

**Files:**
- Modify: none

**Step 1: Rename or move the document**

Run one of:

```bash
set -a; . "/home/rogee/Projects/siyuan-cli/.env"; set +a; node dist/src/cli/run.js doc rename --id <DOC_ID> --path "/cli-e2e/live-test-renamed-<nonce>" --json
```

or

```bash
set -a; . "/home/rogee/Projects/siyuan-cli/.env"; set +a; node dist/src/cli/run.js doc move --id <DOC_ID> --path "/cli-e2e/live-test-renamed-<nonce>" --json
```

Expected: PASS.

**Step 2: Read after rename/move**

Run:

```bash
set -a; . "/home/rogee/Projects/siyuan-cli/.env"; set +a; node dist/src/cli/run.js doc get --id <DOC_ID>
```

Expected: PASS and content still includes the update marker.

**Step 3: Remove the document**

Run:

```bash
set -a; . "/home/rogee/Projects/siyuan-cli/.env"; set +a; node dist/src/cli/run.js doc remove --id <DOC_ID> --yes --json
```

Expected: PASS.

**Step 4: Verify cleanup**

Run a search command for marker B:

```bash
set -a; . "/home/rogee/Projects/siyuan-cli/.env"; set +a; node dist/src/cli/run.js search --content "CLI_E2E_UPDATE_<nonce>" --json
```

Expected: Preferably zero matches. If indexing is delayed, note the behavior rather than guessing.

**Step 5: Commit**

```bash
# No commit for this task; this is live-test execution only.
```

### Task 5: Summarize live evidence and only then decide on fixes

**Files:**
- Modify: none unless a verified product bug is found

**Step 1: Summarize exact command outputs**

Record create, read, update, search, rename/move, and delete results.

**Step 2: Decide whether a product bug exists**

If all commands behave correctly, stop with a verification report.
If a command fails, identify the smallest broken stage.

**Step 3: Only if broken, switch to debugging/fix workflow**

Use `superpowers:systematic-debugging` before proposing code changes.

**Step 4: Re-run the failing stage after any fix**

Do not claim success without fresh command output proving the exact broken stage now works.

**Step 5: Commit**

```bash
# Commit only if actual code changes are required and verified.
```
