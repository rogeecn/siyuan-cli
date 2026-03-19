# README And Wrap-Up Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add user-facing README documentation, run broader verification, and summarize remaining gaps against the main SiYuan CLI plan.

**Architecture:** Keep this batch focused on documentation and validation rather than expanding behavior. Reuse the current command surface as the source of truth for examples, and verify the package through targeted tests, full tests, and build steps before reporting remaining gaps.

**Tech Stack:** Markdown, TypeScript, Node.js, Jest

---

### Task 1: Review current package surface

**Files:**
- Read: `package.json`
- Read: `src/cli/index.ts`
- Read: `docs/plans/2026-03-16-siyuan-cli.md`

**Step 1: Read current metadata and command registration**

Review the package metadata, CLI command list, and the main implementation plan.

**Step 2: Note the implemented command groups**

Capture which command groups are already live and which are still missing from the main plan.

### Task 2: Write README

**Files:**
- Create: `README.md`

**Step 1: Draft README content**

Include:
- install and build usage
- required env vars
- quick command examples
- `--json` usage
- currently implemented command groups
- destructive command note

**Step 2: Save README**

Write concise, user-facing Markdown only. Avoid speculative features.

### Task 3: Verify documentation coverage

**Files:**
- Review: `README.md`

**Step 1: Check README against main plan requirements**

Confirm README includes installation, required env vars, quick commands, JSON mode, and destructive command behavior note.

### Task 4: Run verification

**Files:**
- Test: `tests/**/*.ts`

**Step 1: Run full test suite**

Run: `npm test`
Expected: PASS.

**Step 2: Run build**

Run: `npm run build`
Expected: PASS.

### Task 5: Summarize remaining gaps

**Files:**
- Review: `docs/plans/2026-03-16-siyuan-cli.md`
- Review: current `src/commands/*.ts`

**Step 1: Compare implementation to main plan**

Identify major remaining gaps such as:
- remaining command groups not yet implemented
- confirmation helper not wired into destructive commands
- integration tests not added
- final smoke test against a real configured SiYuan instance not executed here

**Step 2: Report concise wrap-up**

Prepare a short summary of what was completed in this batch and what remains.
