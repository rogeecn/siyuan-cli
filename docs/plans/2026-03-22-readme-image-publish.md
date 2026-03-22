# README Image Publish Section Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Document the new Markdown image auto-upload feature clearly in `README.md` so users know how to use it and what to expect.

**Architecture:** Make a focused documentation-only update. Add one self-contained README section with examples, supported source types, and behavior notes. Do not expand into unrelated documentation changes.

**Tech Stack:** Markdown documentation

---

### Task 1: Add README section for publishing Markdown with images

**Files:**
- Modify: `README.md`

**Step 1: Insert a new section in README**

Add a new `## Publishing Markdown with Images` section after `Quick Examples`.

**Step 2: Add two practical examples**

Include:
- a `--content-file` example
- a `--content` example

**Step 3: Document supported image source types**

List:
- relative local paths
- absolute local paths
- remote URLs
- `data:` URIs

**Step 4: Document behavior and limits**

Explain:
- images upload to `/data/assets/cli-publish/<date>/...`
- Markdown links are rewritten automatically
- relative paths resolve from `--content-file`
- one failed image causes the whole publish to fail

**Step 5: Commit**

```bash
git add README.md
git commit -m "docs: add markdown image publishing examples"
```

### Task 2: Verify README update only

**Files:**
- Modify: none unless wording needs a final tweak

**Step 1: Re-read the updated README section**

Confirm the new section is clear, concise, and placed logically.

**Step 2: Check examples against implemented behavior**

Verify the wording matches actual feature behavior already validated.

**Step 3: Ensure no unrelated README content changed**

Keep the patch focused.

**Step 4: Stop after documentation verification**

No tests required for README-only changes.

**Step 5: Commit**

```bash
# Commit only if final wording changes were needed after review.
```
