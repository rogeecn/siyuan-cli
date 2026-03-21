# Doc Create Response Compatibility Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make `doc create` compatible with live SiYuan servers that return either an object payload or a bare string document id.

**Architecture:** Keep the command layer stable by normalizing create responses inside `src/services/doc.ts`. The document service will accept either a string or an object, convert both into a stable `CreateDocResult` shape, and let existing command formatting continue to work with minimal changes.

**Tech Stack:** TypeScript, Node.js, Commander, Jest

---

### Task 1: Add failing tests for string create responses

**Files:**
- Modify: `tests/commands/doc.test.ts`

**Step 1: Write the failing tests**

Add tests proving `doc create` works when the server returns a string id.

Friendly output case:

```ts
test('creates a document when the server returns a string id', async () => {
  fetchMock.mockResolvedValue({
    ok: true,
    status: 200,
    statusText: 'OK',
    text: async () => JSON.stringify({ code: 0, msg: '', data: 'doc-123' }),
  } as Response);

  await createCli().parseAsync([
    'node', 'siyuan', 'doc', 'create', '--notebook', 'nb-1', '--path', '/Projects/Spec', '--content', '# Draft',
  ]);

  expect(logSpy).toHaveBeenCalledWith('Created document doc-123 at (unknown path)');
});
```

Raw JSON case:

```ts
test('prints normalized json when create returns a string id', async () => {
  fetchMock.mockResolvedValue({
    ok: true,
    status: 200,
    statusText: 'OK',
    text: async () => JSON.stringify({ code: 0, msg: '', data: 'doc-123' }),
  } as Response);

  await createCli().parseAsync([
    'node', 'siyuan', 'doc', 'create', '--notebook', 'nb-1', '--path', '/Projects/Spec', '--content', '# Draft', '--json',
  ]);

  expect(logSpy).toHaveBeenCalledWith(`{
  "id": "doc-123"
}`);
});
```

**Step 2: Run tests to verify they fail**

Run: `npm test -- --runTestsByPath tests/commands/doc.test.ts`
Expected: FAIL because the current service returns the raw string instead of a normalized object.

**Step 3: Write minimal implementation**

Do this in Task 2.

**Step 4: Run tests to verify they pass**

Re-run after implementation.
Expected: PASS.

**Step 5: Commit**

```bash
git add tests/commands/doc.test.ts
git commit -m "test: cover string doc create responses"
```

### Task 2: Normalize string/object create responses in the document service

**Files:**
- Modify: `src/services/doc.ts`
- Test: `tests/commands/doc.test.ts`

**Step 1: Use the failing tests from Task 1**

The new string-response tests should already be failing.

**Step 2: Run focused tests to confirm red state**

Run: `npm test -- --runTestsByPath tests/commands/doc.test.ts`
Expected: FAIL before implementation.

**Step 3: Write minimal implementation**

Add a small normalization helper in `src/services/doc.ts`.

```ts
function normalizeCreateDocResult(result: CreateDocResult | string): CreateDocResult {
  if (typeof result === 'string') {
    return { id: result };
  }

  return result || {};
}
```

Then apply it in `create()`:

```ts
async create(input) {
  const result = await client.request<CreateDocResult | string>('/api/filetree/createDocWithMd', input);

  if (!result) {
    throw new Error('Create document response is empty');
  }

  return normalizeCreateDocResult(result);
}
```

**Step 4: Run tests to verify they pass**

Run: `npm test -- --runTestsByPath tests/commands/doc.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/services/doc.ts tests/commands/doc.test.ts
git commit -m "fix: normalize doc create responses"
```

### Task 3: Verify compatibility and resume live document lifecycle flow

**Files:**
- Modify: none unless verification exposes another verified bug

**Step 1: Run full automated verification**

Run: `npm test && npm run build`
Expected: PASS.

**Step 2: Re-run live doc create step**

Run the same live `doc create --json` command against the configured `.env` environment.
Expected: PASS with usable normalized output and recoverable document id.

**Step 3: Continue live lifecycle validation**

Run `doc get`, `doc update` or `doc append`, `search`, `doc rename` or `doc move`, and `doc remove`, verifying output after each step.

**Step 4: Stop and capture evidence if another stage fails**

Do not guess. Record exact command outputs and only then decide whether another code fix is needed.

**Step 5: Commit**

```bash
# Commit only if code changes were required and verified.
```
