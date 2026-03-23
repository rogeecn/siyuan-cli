# Block Destructive + Transform Flows Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Expand the `block` command group with update, insert, move, and remove operations, including confirmation handling for block removal.

**Architecture:** Extend the existing block service and command module. Reuse the existing `resolveMarkdown` helper for content resolution, the confirmation helper for destructive removal, and existing env/HTTP patterns for consistency.

**Tech Stack:** TypeScript, Node.js, Commander, Jest, ts-jest

---

### Task 1: Add failing block expansion tests

**Files:**
- Modify: `tests/commands/block.test.ts`

**Step 1: Write the failing test**

Add tests that prove:
- `npx siyuan-cli block update --id blk-1 --content "new"` calls the expected update API and prints friendly output
- `npx siyuan-cli block insert --id blk-1 --content "new"` calls the expected insert API and prints friendly output
- `npx siyuan-cli block move --id blk-1 --parent blk-2` calls the expected move API and prints friendly output
- `npx siyuan-cli block remove --id blk-1` requires confirmation by default
- `npx siyuan-cli block remove --id blk-1 --yes` skips confirmation and calls the expected remove API
- `--json` returns raw JSON for all new commands

**Step 2: Run test to verify it fails**

Run: `npm test -- --runTestsByPath tests/commands/block.test.ts`
Expected: FAIL because the new block commands do not exist yet.

### Task 2: Extend block service

**Files:**
- Modify: `src/services/block.ts`

**Step 1: Add service methods**

```ts
update(input: { id: string; markdown: string }): Promise<unknown>
insert(input: { id: string; markdown: string }): Promise<unknown>
move(input: { id: string; parentID: string }): Promise<unknown>
remove(id: string): Promise<unknown>
```

Using endpoints:
- `/api/block/updateBlock`
- `/api/block/insertBlock`
- `/api/block/moveBlock`
- `/api/block/deleteBlock`

**Step 2: Run test to verify it passes for request-shape expectations**

Run: `npm test -- --runTestsByPath tests/commands/block.test.ts`

### Task 3: Extend block command with confirmation

**Files:**
- Modify: `src/commands/block.ts`

**Step 1: Wire new subcommands**

- `update --id <id> --content <text> [--content-file <file>] [--json]`
- `insert --id <id> --content <text> [--content-file <file>] [--json]`
- `move --id <id> --parent <parent-id> [--json]`
- `remove --id <id> [--yes] [--json]`

**Step 2: Run test to verify it passes**

Run: `npm test -- --runTestsByPath tests/commands/block.test.ts`
Expected: PASS.

### Task 4: Verify adjacent behavior

**Step 1: Run adjacent tests**

Run: `npm test -- --runTestsByPath tests/commands/block.test.ts tests/commands/doc.test.ts tests/commands/notebook.test.ts tests/core/confirm.test.ts tests/cli/run.test.ts tests/cli/smoke.test.ts`
Expected: PASS.

**Step 2: Run build**

Run: `npm run build`
Expected: PASS.
