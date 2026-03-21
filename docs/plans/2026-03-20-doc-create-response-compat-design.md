# Doc Create Response Compatibility Design

**Goal:** Make `doc create` work against live SiYuan servers that return either a full object payload or a bare string document id.

**Scope:** This design only addresses the verified compatibility gap around the `doc create` response shape. It does not broaden to unrelated document commands unless the same root cause appears there.

**Observed Evidence:**
- Real live command `node dist/src/cli/run.js doc create ... --json` returned a plain JSON string document id.
- Current CLI code expects `CreateDocResult` to be an object with `id`, `path`, and optional `notebook` fields.
- Current tests only cover the object response shape.
- Because of this mismatch, downstream JSON parsing and human-readable formatting assumptions become incorrect in live usage.

## Options Considered

### 1. Normalize create responses in the service layer (recommended)
- Keep the command layer consuming a stable `CreateDocResult` shape.
- Teach the document service to accept either a string or an object and normalize both.

**Pros:** Smallest safe fix, preserves command contract, localizes compatibility logic.
**Cons:** Adds one narrow compatibility branch in the service layer.

### 2. Handle strings in the command layer only
- Leave the service return type broad and special-case strings in `doc create` command output.

**Pros:** Minimal code motion.
**Cons:** Leaves service contract unstable and pushes transport quirks upward.

### 3. Change tests and docs only
- Accept that live servers return strings and let callers deal with it.

**Pros:** No production code changes.
**Cons:** Does not fix the actual product bug.

## Recommended Design

### Normalize in `src/services/doc.ts`
The service should treat the raw create response as either:
- `string` → normalize to `{ id: <string> }`
- object → normalize existing fields as-is

This keeps `DocService.create()` returning a stable object-like shape to command handlers.

### Preserve command behavior in `src/commands/doc.ts`
`formatCreateResult()` can keep rendering `id` and `path`, with placeholders for unknown fields. Once the service normalizes strings into `{ id }`, the command layer does not need transport-specific branching.

### Expand tests for both server shapes
`tests/commands/doc.test.ts` should cover:
- existing object response behavior
- new string response behavior for friendly output
- new string response behavior for `--json`

## Data Flow
- CLI command calls `DocService.create()`
- Shared HTTP client returns parsed `data` from SiYuan
- Document service normalizes string/object create payloads into a stable shape
- Command formatter renders the normalized result

## Testing Strategy
- Add failing tests for string create responses first
- Run focused doc command tests
- Run full test suite and build after the fix
- Re-run the live `doc create` step and continue the document lifecycle flow only after the fix is verified

## Non-Goals
- No refactor of all document result types
- No changes to unrelated document commands unless live evidence requires them
- No speculative compatibility logic for endpoints not yet observed failing
