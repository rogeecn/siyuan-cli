# Rich Content Publish Test Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Verify that the CLI can publish image-containing Markdown through both inline content and a specified Markdown file.

**Architecture:** Treat this as a live publishing verification workflow. Generate a local test image, compose two Markdown publication inputs, publish each with the CLI, then read both documents back and verify the Markdown image syntax and surrounding content were preserved.

**Tech Stack:** Markdown, local image file generation, Node.js CLI, live SiYuan API via `doc create` / `doc get`

---

### Task 1: Prepare local rich-content test assets

**Files:**
- Create: `docs/plans/assets/publish-test-image.svg`
- Create: `docs/plans/2026-03-21-rich-content-inline-preview.md`
- Create: `docs/plans/2026-03-21-rich-content-file-publish.md`

**Step 1: Generate a deterministic local test image**

Create a small SVG image file with visible text like `CLI RICH TEST`.

**Step 2: Prepare inline-markdown source text**

Compose Markdown containing a title, one short paragraph, and an image reference to the generated image.

**Step 3: Prepare Markdown-file publish content**

Write a `.md` file containing a title, paragraph, bullet list, and image reference to the generated image.

**Step 4: Review both payloads for correctness**

Ensure the image path is consistent and the Markdown is valid.

**Step 5: Commit**

```bash
# No commit required; this is test content preparation.
```

### Task 2: Publish inline rich content

**Files:**
- Modify: none

**Step 1: Publish the inline Markdown document**

Run a command like:

```bash
set -a; . "/home/rogee/Projects/siyuan-cli/.env"; set +a; node dist/src/cli/run.js doc create --notebook <NOTEBOOK_ID> --path "/articles/rich-inline-20260321" --content "<inline markdown>" --json
```

Expected: PASS and return a document id.

**Step 2: Read back the published document**

Run:

```bash
set -a; . "/home/rogee/Projects/siyuan-cli/.env"; set +a; node dist/src/cli/run.js doc get --id <DOC_ID>
```

Expected: PASS and return content containing the heading, body text, and image Markdown/reference.

**Step 3: Record whether image reference was preserved as Markdown**

Do not assume the image asset was imported automatically unless readback proves it.

**Step 4: Stop if publication fails**

Capture exact output and do not proceed with claims.

**Step 5: Commit**

```bash
# No code commit required for live publishing.
```

### Task 3: Publish specified Markdown file with image reference

**Files:**
- Modify: none

**Step 1: Publish the file-based Markdown document**

Run a command like:

```bash
set -a; . "/home/rogee/Projects/siyuan-cli/.env"; set +a; node dist/src/cli/run.js doc create --notebook <NOTEBOOK_ID> --path "/articles/rich-file-20260321" --content-file "docs/plans/2026-03-21-rich-content-file-publish.md" --json
```

Expected: PASS and return a document id.

**Step 2: Read back the published document**

Run:

```bash
set -a; . "/home/rogee/Projects/siyuan-cli/.env"; set +a; node dist/src/cli/run.js doc get --id <DOC_ID>
```

Expected: PASS and return the title, paragraph, list, and image Markdown/reference.

**Step 3: Compare with the source Markdown file**

Confirm the published content still contains the expected image reference and core formatting.

**Step 4: Stop if publication fails**

Capture exact output before any further action.

**Step 5: Commit**

```bash
# No code commit required for live publishing.
```

### Task 4: Summarize rich-content publishing behavior

**Files:**
- Modify: none unless live evidence reveals a CLI publishing bug

**Step 1: Compare inline vs file-based publication results**

Document whether both publication paths preserved rich content correctly.

**Step 2: Identify asset-handling limitations honestly**

If images remain Markdown references rather than imported assets, record that as current behavior rather than a guessed failure.

**Step 3: If a real bug appears, switch to debugging workflow**

Use `superpowers:systematic-debugging` before proposing any fix.

**Step 4: Re-run the failing publish path only after any fix**

Do not claim success without fresh readback evidence.

**Step 5: Commit**

```bash
# Commit only if verified code changes were required.
```
