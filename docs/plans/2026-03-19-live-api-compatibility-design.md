# Live API Compatibility Design

**Goal:** Fix the minimum set of issues blocking real-environment validation for the CLI: broken built artifact entry references, empty-response handling, and the `tag list` request shape.

**Scope:** This design intentionally stays narrow. It updates packaging/docs, hardens the shared HTTP client for empty successful responses, and adjusts `tag list` to match the current SiYuan server behavior observed in live testing.

**Observed Evidence:**
- The built CLI entry exists at `dist/src/cli/run.js`, while the published/bin documentation points to `dist/cli/run.js`.
- `system version` succeeds against the live server.
- `system time` returns `200 OK` with an empty body, which currently causes JSON parsing to fail.
- `notebook list` succeeds against the live server.
- `tag list` currently returns `400` with `{"code":-1,"msg":"parses request failed","data":null}` when called without a JSON body.

## Options Considered

### 1. Minimum targeted compatibility update (recommended)
- Fix only the three validated blockers.
- Keep command shapes unchanged except where the live API clearly requires compatibility work.
- Add tests only for the new behaviors.

**Pros:** Small, low-risk, directly tied to observed failures.
**Cons:** Other endpoints may still need follow-up compatibility fixes later.

### 2. General request customization layer
- Add per-endpoint HTTP method/body rules in the client.
- Start normalizing more endpoints preemptively.

**Pros:** More extensible for future compatibility work.
**Cons:** Larger change set, more assumptions, higher risk for this iteration.

### 3. Runtime fallback/retry behavior
- Keep current defaults, but retry failed requests with alternate body shapes.

**Pros:** Can hide server inconsistencies.
**Cons:** More complexity, less predictable behavior, weaker contract for tests.

## Recommended Design

### CLI entry alignment
Update `package.json` and `README.md` so documented and packaged entry paths match the actual TypeScript output under `dist/src/cli/run.js`.

### Empty successful response handling
Update `src/core/http.ts` so a successful HTTP response with an empty body does not throw `Unexpected end of JSON input`. For this narrow fix, the client should:
- Read response text first.
- Treat an empty successful body as `null` data.
- Continue parsing JSON envelopes when content is present.
- Preserve existing error behavior for non-OK HTTP responses and non-zero API codes.

This is intentionally minimal and avoids speculative normalization of every payload type.

### `tag list` request compatibility
Update `src/services/tag.ts` so `list()` sends an empty JSON object for `/api/tag/getTag`. The live SiYuan instance currently rejects a body-less request with a parse error, so `{}` is the narrowest compatibility fix.

## Data Flow
- CLI entry stays at `src/cli/run.ts` and continues to dispatch through existing command factories.
- `system time` and any other empty-body successful endpoints benefit through the shared `SiyuanClient` path in `src/core/http.ts`.
- `tag list` keeps the same command surface in `src/commands/tag.ts`; only its service call changes.

## Testing Strategy
- Update `tests/core/http.test.ts` with a successful empty-body case.
- Update `tests/commands/tag.test.ts` to assert `tag list` sends `{}`.
- Update any entry-path-facing docs/package assertions if needed.
- Run `npm test` and `npm run build`.
- Re-run live verification with:
  - `node dist/src/cli/run.js system version`
  - `node dist/src/cli/run.js system time --json`
  - `node dist/src/cli/run.js notebook list --json`
  - `node dist/src/cli/run.js tag list --json`

## Non-Goals
- No broad refactor of command architecture.
- No generalized retry/fallback framework.
- No expansion into unrelated SiYuan endpoint compatibility work.
