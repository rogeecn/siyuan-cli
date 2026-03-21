# Production Command Sweep Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the CLI broadly usable in the current live SiYuan production environment by sweeping every command group, fixing verified failures, and continuing until no new production blockers remain.

**Architecture:** Execute the sweep in incremental batches ordered by risk. For each failure: reproduce it live, capture exact command output and raw API evidence when needed, add targeted automated coverage, implement the smallest compatibility fix, rerun focused tests plus full verification, then return to the live sweep.

**Tech Stack:** TypeScript, Node.js, Commander, Jest, live SiYuan HTTP API via built CLI

---

### Task 1: Build a live command sweep ledger

**Files:**
- Modify: none

**Step 1: Build the latest CLI**

Run: `npm run build`
Expected: PASS.

**Step 2: Execute read-focused command groups in the live environment**

Run representative real commands for:
- `system`
- `search`
- `sql`
- `template`
- `snapshot`
- `tag`
- `attr`
- `file`
- `export`

Expected: Capture each command as PASS or FAIL with exact output.

**Step 3: Execute controlled mutation groups against test-safe targets**

Run representative real commands for:
- `doc`
- `file`
- `attr`

Expected: Capture each mutation stage and its readback verification.

**Step 4: Execute higher-risk destructive/stateful groups last**

Run only after safer groups are understood:
- `notebook`
- tag mutations
- snapshot destructive flows
- other confirmation-gated commands

Expected: Capture PASS/FAIL with cleanup evidence.

**Step 5: Commit**

```bash
# No commit for this task; this is live verification bookkeeping.
```

### Task 2: Fix the first verified live failure

**Files:**
- Modify: exact files depend on the first failing command
- Test: exact tests depend on the failure reproduced

**Step 1: Reproduce the failure with one exact command**

Run the failing live command again and capture exact output.
Expected: same failure reproduced.

**Step 2: Add the smallest failing automated test**

Create or update the nearest command/service test to encode the proven behavior gap.
Expected: FAIL for the verified reason.

**Step 3: Implement the smallest compatibility fix**

Change only the minimal service/client/command code needed to match the proven live contract.

**Step 4: Verify the fix**

Run:
- focused test path(s)
- `npm test`
- `npm run build`
- the original failing live command

Expected: all pass, and the original live failure is resolved.

**Step 5: Commit**

```bash
git add <changed-files>
git commit -m "fix: resolve <verified-live-failure>"
```

### Task 3: Continue sweep-fix cycles until no new failures remain

**Files:**
- Modify: depends on each newly discovered verified failure
- Test: depends on each newly discovered verified failure

**Step 1: Move to the next unverified or failed command group**

Run the next real command from the ledger.
Expected: either PASS or a newly captured failure.

**Step 2: If PASS, continue**

No code changes. Mark that command group covered.

**Step 3: If FAIL, repeat Task 2 workflow**

Reproduce → add failing test → implement minimal fix → rerun focused tests → rerun full tests/build → rerun live command.

**Step 4: Re-run adjacent commands after each fix**

Validate nearby commands in the same group to catch regression or contract drift.

**Step 5: Commit**

```bash
git add <changed-files>
git commit -m "fix: resolve <next-verified-live-failure>"
```

### Task 4: Complete the document lifecycle flow specifically

**Files:**
- Modify: only if document lifecycle still exposes verified bugs
- Test: add only for verified document lifecycle failures

**Step 1: Re-run full document lifecycle after `doc create` fix**

Run: create → get → update/append → get → search → rename/move → get → remove → search.
Expected: all stages behave correctly.

**Step 2: If update or later stages fail, isolate exactly one stage**

Capture live command output and raw API evidence before changing code.

**Step 3: Add a failing test and fix only that stage**

Keep scope narrow.

**Step 4: Re-run the entire document lifecycle**

Expected: full flow succeeds end to end.

**Step 5: Commit**

```bash
git add <changed-files>
git commit -m "fix: complete live document lifecycle compatibility"
```

### Task 5: Finish only when the live sweep is clean

**Files:**
- Modify: none unless the final sweep exposes one last verified issue

**Step 1: Re-run the final command sweep ledger**

Run one representative live command for every command group and every risky mutation path already exercised.
Expected: no new failures.

**Step 2: Run final automated verification**

Run: `npm test && npm run build`
Expected: PASS.

**Step 3: Summarize residual limitations honestly**

If any command could not be safely or meaningfully tested without new real identifiers, record that explicitly.

**Step 4: Stop only after fresh evidence supports production usability**

Do not claim completion without live command output proving the sweep is clean.

**Step 5: Commit**

```bash
# Commit only if final fixes were required.
```
