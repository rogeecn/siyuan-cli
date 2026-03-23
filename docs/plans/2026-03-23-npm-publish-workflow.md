# npm Publish Workflow Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Add a GitHub Actions workflow that publishes `siyuan-cli` to npm when a `v*` tag is pushed and when manually triggered from GitHub Actions.

**Architecture:** Use one GitHub Actions workflow file to centralize release automation. Both tag and manual flows run the same install, test, and build steps before publishing. Tag-triggered runs also enforce a strict version match between the Git tag and `package.json`.

**Tech Stack:** GitHub Actions YAML, Node.js, npm

---

### Task 1: Inspect package metadata and release prerequisites

**Files:**
- Read: `package.json`
- Read: `README.md`

**Step 1: Confirm publishable package metadata**

Read `package.json` and confirm the package name, version field, scripts, and npm bin entry.

**Step 2: Confirm existing documentation gap**

Read `README.md` and identify where a short release section can be added without disrupting the command documentation structure.

**Step 3: Record required secrets and registry assumptions**

Note that the workflow needs `NPM_TOKEN` and should target the default npm public registry.

**Step 4: Stop if metadata is missing**

If `package.json` lacks a version or package name, stop and revise the plan before implementation.

**Step 5: Commit**

```bash
git add docs/plans/2026-03-23-npm-publish-workflow.md
git commit -m "docs: add npm publish workflow plan"
```

### Task 2: Add the GitHub Actions publish workflow

**Files:**
- Create: `.github/workflows/publish.yml`

**Step 1: Create workflow triggers**

Add:
- `push` for tags matching `v*`
- `workflow_dispatch`

**Step 2: Add setup and verification steps**

Include steps for:
- checkout
- `actions/setup-node`
- `npm ci`
- `npm test`
- `npm run build`

**Step 3: Add tag-version validation for tag runs**

Add a shell step that compares `${GITHUB_REF_NAME#v}` with the version in `package.json` and fails clearly if they differ.

**Step 4: Add npm publish step**

Publish with `npm publish --access public` using `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}`.

**Step 5: Keep workflow simple**

Do not add prerelease logic, changelog generation, release drafting, or version bumping.

### Task 3: Document the release workflow

**Files:**
- Modify: `README.md`
- Modify: `README.zh-CN.md`

**Step 1: Add an English release section**

Document:
- push a `v*` tag to publish automatically
- manual publish from GitHub Actions
- required secret `NPM_TOKEN`

**Step 2: Add the matching Chinese section**

Keep the Chinese README aligned with the English README structure and meaning.

**Step 3: Include one tag example**

Add a concrete example such as:

```bash
git tag v0.1.1
git push origin v0.1.1
```

**Step 4: Mention version-match requirement**

State that tag `vX.Y.Z` must match `package.json.version = X.Y.Z`.

**Step 5: Keep docs concise**

Avoid turning README into a full release handbook.

### Task 4: Verify workflow and docs

**Files:**
- Verify: `.github/workflows/publish.yml`
- Verify: `README.md`
- Verify: `README.zh-CN.md`

**Step 1: Validate the workflow YAML visually**

Re-read the workflow file and confirm trigger names, action versions, env usage, and publish command syntax are correct.

**Step 2: Verify README instructions against the workflow**

Confirm the docs match the actual trigger rules, secret name, and version-check behavior.

**Step 3: Run project verification**

Run:

```bash
npm test
```

Expected: all tests pass unchanged after the docs and workflow changes.

**Step 4: Review git status**

Ensure only the intended workflow and documentation files changed.

**Step 5: Commit**

```bash
git add .github/workflows/publish.yml README.md README.zh-CN.md
git commit -m "ci: add npm publish workflow"
```
