# Npm README Intro Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a short npm-facing intro block to the English and Simplified Chinese READMEs so first-time visitors can understand the tool quickly and copy a working `npx siyuan-cli` example immediately.

**Architecture:** Keep the change limited to the top of both README files. Insert a compact intro block directly below the title/language link area with one value statement, one quick-start command, one setup reminder, and a short capability list. Preserve the existing section order after the new block.

**Tech Stack:** Markdown documentation

---

### Task 1: Add the English npm-facing intro block

**Files:**
- Modify: `README.md`

**Step 1: Write the new intro block**

Add a short block near the top that includes:
- one sentence explaining that `siyuan-cli` is a CLI for searching, reading, updating, and exporting SiYuan notes
- one runnable example using `npx siyuan-cli search --content "roadmap" --json`
- one short reminder that `SIYUAN_BASE_URL` and `SIYUAN_TOKEN` must be set
- one short capability list with search/read-write/export coverage

**Step 2: Verify placement and tone**

Confirm the block appears before the existing long-form overview and reads like an npm package landing section instead of internal project notes.

### Task 2: Mirror the intro block in Simplified Chinese

**Files:**
- Modify: `README.zh-CN.md`
- Reference: `README.md`

**Step 1: Translate the structure, not just the words**

Add the same block in Chinese, keeping the same command example and overall structure while phrasing the surrounding text naturally for Chinese readers.

**Step 2: Verify parity**

Confirm both README files still match in structure and intent, with the same quick-start emphasis and setup reminder.

### Task 3: Review for npm-default consistency

**Files:**
- Verify: `README.md`
- Verify: `README.zh-CN.md`

**Step 1: Re-read the top sections**

Ensure the new intro blocks reinforce `npx siyuan-cli <commands>` as the public default and do not reintroduce `siyuan ...` as the primary path.

**Step 2: Spot-check the quick example**

Ensure the example is short, copyable, and aligned with the existing environment-variable guidance.
