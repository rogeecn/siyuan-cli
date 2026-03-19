# Empty Response Command Compatibility Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Make read-style CLI commands continue working when the live SiYuan server returns `200 OK` with an empty response body for selected endpoints.

**Architecture:** Keep `src/core/http.ts` generic so it still returns `null` for empty successful HTTP responses. Fix command behavior in the service layer by converting `null` into stable empty arrays, maps, or normalized placeholder objects before command formatters run.

**Tech Stack:** TypeScript, Node.js, Commander, Jest

---

### Task 1: Cover empty-response behavior for affected commands

**Files:**
- Modify: `tests/commands/template.test.ts`
- Modify: `tests/commands/snapshot.test.ts`
- Modify: `tests/commands/attr.test.ts`

**Step 1: Write the failing tests**

Add focused tests proving empty successful responses do not crash these commands.

For `tests/commands/template.test.ts`, add a case like:

```ts
test('prints an empty JSON array when template list returns an empty response body', async () => {
  fetchMock.mockResolvedValue({
    ok: true,
    status: 200,
    statusText: 'OK',
    text: async () => '',
  } as Response);

  await createCli().parseAsync(['node', 'siyuan', 'template', 'list', '--json']);

  expect(logSpy).toHaveBeenCalledWith('[]');
});
```

For `tests/commands/attr.test.ts`, add a case like:

```ts
test('prints an empty JSON array when attr list returns an empty response body', async () => {
  fetchMock.mockResolvedValue({
    ok: true,
    status: 200,
    statusText: 'OK',
    text: async () => '',
  } as Response);

  await createCli().parseAsync(['node', 'siyuan', 'attr', 'list', '--json']);

  expect(logSpy).toHaveBeenCalledWith('[]');
});
```

For `tests/commands/snapshot.test.ts`, add a case like:

```ts
test('prints a normalized JSON object when snapshot current returns an empty response body', async () => {
  fetchMock.mockResolvedValue({
    ok: true,
    status: 200,
    statusText: 'OK',
    text: async () => '',
  } as Response);

  await createCli().parseAsync(['node', 'siyuan', 'snapshot', 'current', '--json']);

  expect(logSpy).toHaveBeenCalledWith(`{
  "id": "(unknown id)",
  "time": "(unknown time)",
  "memo": ""
}`);
});
```

**Step 2: Run tests to verify they fail**

Run: `npm test -- --runTestsByPath tests/commands/template.test.ts tests/commands/snapshot.test.ts tests/commands/attr.test.ts`
Expected: FAIL because at least one command still leaks `null`/unexpected empty response behavior.

**Step 3: Write minimal implementation**

Do not touch command files unless the tests prove a command-level gap. Implement the smallest service-layer fallbacks needed in the next tasks.

**Step 4: Run tests to verify baseline progress**

Run the same focused command tests after service fixes are in place.
Expected: PASS.

**Step 5: Commit**

```bash
git add tests/commands/template.test.ts tests/commands/snapshot.test.ts tests/commands/attr.test.ts
git commit -m "test: cover empty response command output"
```

### Task 2: Normalize empty list-style responses in services

**Files:**
- Modify: `src/services/template.ts`
- Modify: `src/services/attr.ts`
- Test: `tests/commands/template.test.ts`
- Test: `tests/commands/attr.test.ts`

**Step 1: Use the failing tests from Task 1**

The new `template list` and `attr list` empty-body tests should already be failing.

**Step 2: Run focused tests to confirm red state**

Run: `npm test -- --runTestsByPath tests/commands/template.test.ts tests/commands/attr.test.ts`
Expected: FAIL before implementation.

**Step 3: Write minimal implementation**

Ensure list-style service methods convert `null` to empty arrays.

```ts
async list() {
  return (await client.request<string[]>('/api/template/searchTemplate', { k: '' })) || [];
}
```

```ts
async list() {
  return (await client.request<string[]>('/api/attr/getAllKeys')) || [];
}
```

If adjacent list/query/tree/search style services still leak `null`, apply the same pattern only where directly needed by tests or live verification.

**Step 4: Run tests to verify they pass**

Run: `npm test -- --runTestsByPath tests/commands/template.test.ts tests/commands/attr.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/services/template.ts src/services/attr.ts tests/commands/template.test.ts tests/commands/attr.test.ts
git commit -m "fix: normalize empty list responses"
```

### Task 3: Normalize empty current/detail responses in services

**Files:**
- Modify: `src/services/snapshot.ts`
- Test: `tests/commands/snapshot.test.ts`

**Step 1: Use the failing test from Task 1**

The new `snapshot current` empty-body test should already be failing.

**Step 2: Run the focused test to confirm red state**

Run: `npm test -- --runTestsByPath tests/commands/snapshot.test.ts`
Expected: FAIL before implementation.

**Step 3: Write minimal implementation**

Normalize an empty current snapshot response into a placeholder object.

```ts
async current() {
  const item = await client.request<RawCurrentSnapshot>('/api/snapshot/getRepoSnapshots');
  return normalizeCurrent(item || {});
}
```

If adjacent current/detail services are found to leak `null` during verification, apply the same smallest normalization only where needed.

**Step 4: Run the test to verify it passes**

Run: `npm test -- --runTestsByPath tests/commands/snapshot.test.ts`
Expected: PASS.

**Step 5: Commit**

```bash
git add src/services/snapshot.ts tests/commands/snapshot.test.ts
git commit -m "fix: normalize empty current snapshot responses"
```

### Task 4: Run automated and live verification

**Files:**
- Modify: none unless verification exposes another scoped empty-response leak

**Step 1: Run focused command tests**

Run: `npm test -- --runTestsByPath tests/commands/template.test.ts tests/commands/snapshot.test.ts tests/commands/attr.test.ts`
Expected: PASS.

**Step 2: Run full project verification**

Run: `npm test && npm run build`
Expected: PASS.

**Step 3: Run live verification commands**

Run:

```bash
set -a; . "/home/rogee/Projects/siyuan-cli/.env"; set +a; node dist/src/cli/run.js template list --json
set -a; . "/home/rogee/Projects/siyuan-cli/.env"; set +a; node dist/src/cli/run.js snapshot current --json
set -a; . "/home/rogee/Projects/siyuan-cli/.env"; set +a; node dist/src/cli/run.js attr list --json
```

Expected:
- `template list --json` prints `[]`
- `snapshot current --json` prints a normalized JSON object instead of crashing
- `attr list --json` prints `[]`

**Step 4: Record any additional same-pattern failures**

If verification reveals another read-style command still leaking `null`, capture the exact command and output and stop at the smallest useful follow-up scope.

**Step 5: Commit**

```bash
git add .
git commit -m "fix: handle empty responses for read commands"
```
