# README and Skill Docs Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Rewrite `siyuan-cli` docs so users and agents can understand every implemented command group, configure the CLI correctly, and use an agent-oriented `SKILL.md`.

**Architecture:** Keep the documentation centered in the repo root. Use `README.md` as the canonical English source, mirror it in `README.zh-CN.md`, and write a separate `SKILL.md` organized around agent workflows instead of human-first onboarding. Derive every command section from the actual CLI source so the docs stay aligned with implemented behavior.

**Tech Stack:** Markdown documentation, Commander CLI source, TypeScript source references

---

### Task 1: Inventory the implemented command surface

**Files:**
- Read: `src/cli/index.ts`
- Read: `src/commands/system.ts`
- Read: `src/commands/search.ts`
- Read: `src/commands/doc.ts`
- Read: `src/commands/notebook.ts`
- Read: `src/commands/block.ts`
- Read: `src/commands/export.ts`
- Read: `src/commands/file.ts`
- Read: `src/commands/attr.ts`
- Read: `src/commands/snapshot.ts`
- Read: `src/commands/template.ts`
- Read: `src/commands/notify.ts`
- Read: `src/commands/sql.ts`
- Read: `src/commands/tag.ts`

**Step 1: Enumerate top-level command groups**

Read `src/cli/index.ts` and list every registered command group in plan notes before editing docs.

**Step 2: Enumerate subcommands and flags per group**

Read each file in `src/commands/` and capture the implemented subcommands, required options, optional flags, and which commands support `--json` or `--yes`.

**Step 3: Verify help output for representative groups**

Run:

```bash
node dist/src/cli/run.js --help
node dist/src/cli/run.js doc --help
node dist/src/cli/run.js notebook --help
```

Expected: help output matches the code-level command inventory.

**Step 4: Create a concise source-of-truth outline**

Prepare a structured outline for the README command reference so no implemented command group is skipped.

**Step 5: Commit**

```bash
git add docs/plans/2026-03-23-readme-and-skill-docs.md
git commit -m "docs: add readme rewrite implementation plan"
```

### Task 2: Rewrite the English README as the canonical guide

**Files:**
- Modify: `README.md`

**Step 1: Replace the current short intro with a fuller overview**

Describe what `siyuan-cli` is, who it is for, and why it is useful compared with direct API calls.

**Step 2: Add installation and configuration sections**

Document local install/build flow, optional global install via the package bin, and the required environment variables `SIYUAN_BASE_URL` and `SIYUAN_TOKEN`.

**Step 3: Add a quick start and usage patterns section**

Show the `siyuan` command name, the built-path fallback `node dist/src/cli/run.js`, and a few representative commands.

**Step 4: Add a full command reference section**

For each implemented group, include:
- command purpose
- implemented subcommands
- required flags
- one or more examples
- notes about `--json` and `--yes` where applicable

**Step 5: Add workflow and troubleshooting sections**

Document common tasks such as searching notes, reading docs, creating docs from files, exporting content, and handling missing env vars.

### Task 3: Add the Simplified Chinese README

**Files:**
- Create: `README.zh-CN.md`
- Reference: `README.md`

**Step 1: Mirror the English README structure exactly**

Use the same heading order so future maintenance can keep both files aligned.

**Step 2: Translate for clarity, not literally**

Keep command names and flags unchanged, but phrase explanations naturally for Chinese readers.

**Step 3: Preserve all examples and safety notes**

Ensure the Chinese version includes the same command coverage, environment requirements, `--json` notes, and destructive command warnings.

**Step 4: Add cross-links between languages**

At the top of each README, link to the other language file.

**Step 5: Re-read for drift**

Confirm the two README files still match in scope and section order.

### Task 4: Create an agent-oriented SKILL.md

**Files:**
- Create: `SKILL.md`
- Reference: `README.md`
- Reference: `src/commands/*.ts`

**Step 1: Write valid skill frontmatter**

Add YAML frontmatter with only `name` and `description`.

**Step 2: Describe when agents should use this skill**

Focus on triggers like searching SiYuan notes, reading or updating documents, exporting content, checking system state, or automating CLI-driven note workflows.

**Step 3: Add setup and invocation guidance**

Document required env vars, the `siyuan` executable, and the preference for `--json` in scripted agent flows.

**Step 4: Map command families to agent tasks**

Group commands by practical tasks such as search, document editing, notebook management, block operations, exports, files, and diagnostics.

**Step 5: Add safety and boundary notes**

Call out destructive commands, confirmation behavior, and cases where the agent should verify IDs or paths before mutating data.

### Task 5: Verify documentation against the real CLI

**Files:**
- Verify: `README.md`
- Verify: `README.zh-CN.md`
- Verify: `SKILL.md`

**Step 1: Re-run help commands**

Run:

```bash
node dist/src/cli/run.js --help
node dist/src/cli/run.js search --help
node dist/src/cli/run.js doc --help
node dist/src/cli/run.js notebook --help
node dist/src/cli/run.js block --help
```

Expected: every documented command and subcommand exists in the CLI.

**Step 2: Spot-check README examples for syntax accuracy**

Ensure example command names and flags match real implementation.

**Step 3: Verify language links and file names**

Confirm `README.md` links to `README.zh-CN.md` and vice versa.

**Step 4: Verify SKILL.md structure**

Confirm frontmatter is valid and the description describes when to use the skill rather than summarizing its workflow.

**Step 5: Commit**

```bash
git add README.md README.zh-CN.md SKILL.md
git commit -m "docs: expand CLI guides and add agent skill"
```
