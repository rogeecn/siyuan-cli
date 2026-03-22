# Auto Upload Images for Markdown Publish Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make Markdown publication upload referenced images automatically so published documents remain viewable remotely.

**Architecture:** Extend the document publishing path with a preprocessing layer that resolves Markdown image sources, uploads them to a deterministic SiYuan asset path, and rewrites Markdown before sending it through document APIs. Use a dedicated binary asset upload helper built on top of the existing multipart file upload capability.

**Tech Stack:** TypeScript, Node.js, Commander, Jest, Fetch API, live SiYuan file/doc APIs

---

### Task 1: Add automated coverage for Markdown image rewriting

**Files:**
- Modify: `tests/commands/doc.test.ts`
- Create: `tests/services/doc-assets.test.ts`

**Step 1: Write failing tests for image source handling**

Cover at least these cases:
- local relative image path in `--content-file`
- local absolute image path
- remote URL image
- data URI image
- failure when one image cannot be resolved

Example shape:

```ts
test('rewrites relative image paths after upload', async () => {
  // arrange markdown with ![](./img/demo.png)
  // mock asset upload path /data/assets/cli-publish/...
  // expect resulting markdown to reference uploaded path
});
```

**Step 2: Run focused tests to verify they fail**

Run: `npm test -- --runTestsByPath tests/services/doc-assets.test.ts tests/commands/doc.test.ts`
Expected: FAIL because no image-upload preprocessing exists yet.

**Step 3: Write minimal implementation**

Do this in Tasks 2 and 3.

**Step 4: Re-run focused tests after implementation**

Expected: PASS.

**Step 5: Commit**

```bash
git add tests/services/doc-assets.test.ts tests/commands/doc.test.ts
git commit -m "test: cover image upload markdown rewriting"
```

### Task 2: Add binary asset upload support

**Files:**
- Modify: `src/services/file.ts`
- Modify: `src/core/http.ts` if required for binary handling
- Create: `src/services/doc-assets.ts`
- Test: `tests/services/doc-assets.test.ts`

**Step 1: Use the failing tests from Task 1**

The asset-related tests should already be failing.

**Step 2: Run focused tests to confirm red state**

Run: `npm test -- --runTestsByPath tests/services/doc-assets.test.ts`
Expected: FAIL.

**Step 3: Write minimal implementation**

Add a dedicated helper/service that can:
- upload binary content via multipart
- generate deterministic asset paths under `/data/assets/cli-publish/...`
- return the uploaded asset path

**Step 4: Re-run focused tests**

Run: `npm test -- --runTestsByPath tests/services/doc-assets.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/services/file.ts src/core/http.ts src/services/doc-assets.ts tests/services/doc-assets.test.ts
git commit -m "feat: add asset upload support for doc publishing"
```

### Task 3: Integrate image upload into document publishing

**Files:**
- Modify: `src/services/doc.ts`
- Modify: `src/commands/doc.ts` if necessary
- Test: `tests/commands/doc.test.ts`

**Step 1: Use the failing integration tests from Task 1**

The doc publishing tests should already be failing for image-containing Markdown.

**Step 2: Run focused tests to confirm red state**

Run: `npm test -- --runTestsByPath tests/commands/doc.test.ts tests/services/doc-assets.test.ts`
Expected: FAIL before integration is added.

**Step 3: Write minimal implementation**

Integrate the preprocessing step so `doc create`, `doc update`, and `doc append`:
- resolve raw Markdown
- upload images
- rewrite Markdown
- then send final Markdown to the existing document API

**Step 4: Re-run focused tests**

Run: `npm test -- --runTestsByPath tests/commands/doc.test.ts tests/services/doc-assets.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/services/doc.ts src/commands/doc.ts tests/commands/doc.test.ts tests/services/doc-assets.test.ts
git commit -m "feat: auto upload images for markdown publishing"
```

### Task 4: Verify with live rich-content publishing

**Files:**
- Modify: none unless live verification exposes a verified bug

**Step 1: Run full verification**

Run: `npm test && npm run build`
Expected: PASS.

**Step 2: Publish inline Markdown with image**

Use `doc create --content` with an image source and verify readback contains rewritten remote asset paths.

**Step 3: Publish file-based Markdown with image**

Use `doc create --content-file` and verify readback contains rewritten remote asset paths.

**Step 4: Confirm remote readability evidence**

Check that image references are no longer local `./...` paths but uploaded asset paths under `/data/assets/...`.

**Step 5: Commit**

```bash
git add <changed-files>
git commit -m "feat: publish markdown with uploaded images"
```
