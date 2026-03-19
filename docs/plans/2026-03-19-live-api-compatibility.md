# Live API Compatibility Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make the CLI pass the minimum real-environment compatibility checks by fixing the packaged entry path, empty successful HTTP responses, and the `tag list` request body.

**Architecture:** Keep command surfaces stable and make the smallest targeted changes in shared infrastructure and the `tag` service. The shared HTTP client will tolerate empty successful responses, while `tag list` will send an explicit empty JSON object to match the observed live API contract. Docs and package metadata will be aligned with the actual compiled output path.

**Tech Stack:** TypeScript, Node.js, Commander, Jest

---

### Task 1: Harden empty-response HTTP handling

**Files:**
- Modify: `src/core/http.ts`
- Test: `tests/core/http.test.ts`

**Step 1: Write the failing test**

Add a new test in `tests/core/http.test.ts` that mocks a successful `fetch` response with an empty text body and verifies the client resolves `null` instead of throwing:

```ts
test('returns null for successful empty responses', async () => {
  fetchMock.mockResolvedValue({
    ok: true,
    status: 200,
    statusText: 'OK',
    text: async () => '',
  } as Response);

  const client = new SiyuanClient({
    baseUrl: 'http://127.0.0.1:6806',
    token: 'secret-token',
  });

  await expect(client.request('/api/system/time')).resolves.toBeNull();
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath tests/core/http.test.ts`
Expected: FAIL because `src/core/http.ts` currently calls `response.json()` unconditionally.

**Step 3: Write minimal implementation**

Update `src/core/http.ts` to read the response body as text first, return `null` for an empty successful body, and otherwise JSON-parse the envelope before applying existing `code !== 0` checks.

```ts
const rawBody = await response.text();

if (rawBody.trim() === '') {
  return null as T;
}

const payload = JSON.parse(rawBody) as SiyuanApiEnvelope<T>;
```

Keep the existing non-OK and non-zero-code error behavior intact.

**Step 4: Run test to verify it passes**

Run: `npm test -- --runTestsByPath tests/core/http.test.ts`
Expected: PASS, including the new empty-response case.

**Step 5: Commit**

```bash
git add tests/core/http.test.ts src/core/http.ts
git commit -m "fix: handle empty successful API responses"
```

### Task 2: Make `tag list` send an explicit JSON body

**Files:**
- Modify: `src/services/tag.ts`
- Test: `tests/commands/tag.test.ts`

**Step 1: Write the failing test**

Update the existing `tag list` command test in `tests/commands/tag.test.ts` so it expects `body: '{}'` instead of `body: undefined`.

```ts
expect(global.fetch).toHaveBeenCalledWith('http://127.0.0.1:6806/api/tag/getTag', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    Authorization: 'Token secret-token',
  },
  body: JSON.stringify({}),
});
```

**Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath tests/commands/tag.test.ts`
Expected: FAIL because `src/services/tag.ts` currently calls `client.request('/api/tag/getTag')` with no body.

**Step 3: Write minimal implementation**

Update `src/services/tag.ts` so `list()` passes an explicit empty object.

```ts
async list() {
  const tags = await client.request<RawTagSummary[]>('/api/tag/getTag', {});
  return (tags || []).map(normalizeTagSummary);
}
```

**Step 4: Run test to verify it passes**

Run: `npm test -- --runTestsByPath tests/commands/tag.test.ts`
Expected: PASS with the updated request assertion.

**Step 5: Commit**

```bash
git add tests/commands/tag.test.ts src/services/tag.ts
git commit -m "fix: send explicit body for tag listing"
```

### Task 3: Align CLI entry documentation and package metadata

**Files:**
- Modify: `package.json`
- Modify: `README.md`

**Step 1: Add the failing check**

Use the existing built output as the expectation and verify the documented entry path is wrong.

Run: `ls dist/src/cli/run.js && test ! -f dist/cli/run.js`
Expected: `dist/src/cli/run.js` exists and `dist/cli/run.js` does not.

**Step 2: Run the current documented command to confirm failure**

Run: `node dist/cli/run.js --help`
Expected: FAIL with `MODULE_NOT_FOUND`.

**Step 3: Write minimal implementation**

Update `package.json` and `README.md` to reference `dist/src/cli/run.js` consistently.

```json
"bin": {
  "siyuan": "dist/src/cli/run.js"
}
```

Also update README command examples from `dist/cli/run.js` to `dist/src/cli/run.js`.

**Step 4: Run the corrected check**

Run: `node dist/src/cli/run.js --help`
Expected: PASS and print CLI help output.

**Step 5: Commit**

```bash
git add package.json README.md
git commit -m "docs: align CLI entry path with build output"
```

### Task 4: Run project verification and live API checks

**Files:**
- Modify: none unless verification exposes a scoped fix

**Step 1: Run focused automated checks**

Run: `npm test -- --runTestsByPath tests/core/http.test.ts tests/commands/tag.test.ts tests/commands/system.test.ts`
Expected: PASS.

**Step 2: Run full automated checks**

Run: `npm test && npm run build`
Expected: PASS.

**Step 3: Run live verification commands**

Run:

```bash
set -a; . "/home/rogee/Projects/siyuan-cli/.env"; set +a; node dist/src/cli/run.js system version
set -a; . "/home/rogee/Projects/siyuan-cli/.env"; set +a; node dist/src/cli/run.js system time --json
set -a; . "/home/rogee/Projects/siyuan-cli/.env"; set +a; node dist/src/cli/run.js notebook list --json
set -a; . "/home/rogee/Projects/siyuan-cli/.env"; set +a; node dist/src/cli/run.js tag list --json
```

Expected:
- `system version` succeeds
- `system time --json` no longer throws JSON parse error
- `notebook list --json` succeeds
- `tag list --json` no longer returns `parses request failed`

**Step 4: Summarize any remaining live API incompatibilities**

If a command still fails, record the exact output and stop at the minimal verified scope instead of expanding the fix set.

**Step 5: Commit**

```bash
git add .
git commit -m "fix: improve live SiYuan API compatibility"
```
