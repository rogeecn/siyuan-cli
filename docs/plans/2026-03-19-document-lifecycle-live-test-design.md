# Document Lifecycle Live Test Design

**Goal:** Verify that the CLI can safely perform real-world document lifecycle operations in the live SiYuan environment: create, read, update, search, optionally rename/move, and delete.

**Scope:** This design uses only test documents that the user has explicitly allowed to be modified or removed. It focuses on validating the actual CLI command path rather than calling raw APIs directly.

**Observed Context:**
- The environment is configured through `/home/rogee/Projects/siyuan-cli/.env`.
- The current SiYuan instance is reachable and already passes multiple read-style live checks.
- The user explicitly confirmed the current document space is for testing and can be changed, read, renamed, moved, or deleted.

## Options Considered

### 1. Document lifecycle end-to-end validation (recommended)
- Use `doc create`, `doc get`, `doc update` or `doc append`, `search`, `doc rename`/`doc move`, and `doc remove`.
- Validate behavior after each mutation.

**Pros:** Closely matches real user behavior, covers write/read/update/delete semantics end to end.
**Cons:** Higher live-environment impact than read-only checks.

### 2. File write/read/remove validation
- Use `file write`, `file read`, and `file remove` on a dedicated test path.

**Pros:** Lowest risk.
**Cons:** Validates file endpoints, not the document workflow users care about most.

### 3. Attribute mutation validation
- Use `attr set/get/reset` on a known test block.

**Pros:** Good for update/read loops.
**Cons:** Requires a stable real block id and gives narrower product coverage.

## Recommended Design

### Use uniquely identifiable test documents
Create one temporary document with a unique path and unique content markers so reads and searches are unambiguous. The test content should include a timestamp or nonce to avoid collisions.

### Validate after every mutation
The sequence should be:
1. Create a test document with marker A.
2. Read it back and confirm marker A is present.
3. Update or append marker B.
4. Read it again and confirm marker B is present.
5. Search for the marker to confirm indexing/lookup behavior.
6. Rename or move the document to a new test path if supported by the live environment.
7. Read/search again using the new location expectations.
8. Remove the document.
9. Confirm the document is no longer readable or searchable.

### Prefer CLI commands over raw API calls
The purpose is to validate the actual user-facing CLI behavior, so verification should use `node dist/src/cli/run.js ...` commands wherever possible.

## Safety Boundaries
- Only operate on obvious test document paths.
- Use unique content markers for this run.
- Perform deletion only after successful readback verification.
- Stop immediately if a command targets an unexpected notebook/path or returns ambiguous identifiers.

## Testing Strategy
- Use existing automated tests as baseline confidence only; do not expand unit scope unless live testing reveals a clear product bug.
- Build latest CLI before running live commands.
- Record exact command outputs for create/read/update/search/delete stages.
- If live behavior differs from expected semantics, investigate before applying code fixes.

## Non-Goals
- No refactor of document architecture.
- No broad mutation tests against notebooks, tags, or snapshots in this round.
- No speculative fixes before reproducing and isolating a live failure.
