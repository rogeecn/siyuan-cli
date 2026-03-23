# Skill Directory Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Move the project skill into a standard skill directory, refresh its content for discoverability, and update docs to point at the new canonical path.

**Architecture:** Keep a single canonical skill package at `skills/siyuan-cli/`. Reuse the current skill's successful guidance around `npx siyuan-cli`, `--json`, and destructive-command safety, but relocate it into a standard directory layout and remove the root-level duplicate. Update only the documentation paths that currently teach agents where to start.

**Tech Stack:** Markdown documentation, repository skill packaging conventions, Git-based diff verification

---

### Task 1: Capture the baseline and reference points

**Files:**
- Read: `SKILL.md`
- Read: `README.md`
- Read: `README.zh-CN.md`
- Read: `docs/plans/2026-03-23-skill-directory-rebuild-design.md`

- [ ] **Step 1: Record the current skill location**

Confirm that the only project skill entrypoint is the root-level `SKILL.md`.

- [ ] **Step 2: Record the current doc references**

Confirm that both README files point to the root-level `SKILL.md`.

- [ ] **Step 3: Define the success criteria**

Use the design doc to lock in the target state: `skills/siyuan-cli/SKILL.md` exists, root `SKILL.md` is removed, and both README files reference the new path.

### Task 2: Rebuild the skill package in the new directory

**Files:**
- Create: `skills/siyuan-cli/SKILL.md`
- Reference: `SKILL.md`

- [ ] **Step 1: Write valid skill frontmatter**

Keep only `name` and `description`, with the description focused on triggering conditions.

- [ ] **Step 2: Preserve the high-value operational guidance**

Carry forward the guidance that agents should use real `npx siyuan-cli` commands, prefer `--json` for automation, mention `--content-file` for larger Markdown updates, require explicit care around `--yes`, and note both environment requirements plus the repo-local fallback entrypoint.

- [ ] **Step 3: Improve discoverability wording**

Ensure the trigger wording still covers at least `siyuan`, `siyuan-cli`, `思源笔记`, `笔记`, note-taking, and PKM so the rebuilt skill does not narrow discoverability.

### Task 3: Remove the obsolete root entrypoint and update references

**Files:**
- Delete: `SKILL.md`
- Modify: `README.md`
- Modify: `README.zh-CN.md`

- [ ] **Step 1: Remove the root-level skill file**

Delete `SKILL.md` only after the replacement exists.

- [ ] **Step 2: Update the English README reference**

Change the agent-usage note in `README.md` to point to `skills/siyuan-cli/SKILL.md`.

- [ ] **Step 3: Update the Chinese README reference**

Change the equivalent note in `README.zh-CN.md` to point to `skills/siyuan-cli/SKILL.md`.

### Task 4: Verify the final layout and content

**Files:**
- Verify: `skills/siyuan-cli/SKILL.md`
- Verify: `README.md`
- Verify: `README.zh-CN.md`

- [ ] **Step 1: Verify the filesystem layout**

Run:

```bash
ls skills
ls skills/siyuan-cli
```

Expected: the skill directory exists and contains `SKILL.md`.

- [ ] **Step 2: Verify the old entrypoint is gone**

Run:

```bash
ls SKILL.md
```

Expected: `ls` reports that `SKILL.md` does not exist.

- [ ] **Step 3: Verify README references**

Run:

```bash
rg -n "skills/siyuan-cli/SKILL.md|SKILL.md" README.md README.zh-CN.md
```

Expected: both files reference `skills/siyuan-cli/SKILL.md`, and neither README refers to the root-level `SKILL.md` as the canonical path.

- [ ] **Step 4: Inspect the final diff**

Run `git diff -- README.md README.zh-CN.md SKILL.md skills/siyuan-cli/SKILL.md docs/plans/2026-03-23-skill-directory-rebuild-design.md docs/plans/2026-03-23-skill-directory-rebuild.md` and verify the change set matches the approved design.

- [ ] **Step 5: Verify frontmatter shape and intent**

Read `skills/siyuan-cli/SKILL.md` and confirm the frontmatter contains only `name` and `description`, with the description focused on when to use the skill.
