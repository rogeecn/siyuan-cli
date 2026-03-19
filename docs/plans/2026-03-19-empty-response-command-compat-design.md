# Empty Response Command Compatibility Design

**Goal:** Make CLI commands behave predictably when the live SiYuan server returns `200 OK` with an empty response body for read-style endpoints.

**Scope:** This design covers the newly observed real-environment failures around `template list`, `snapshot current`, and `attr list`, and allows extension to similar read-style commands if they leak `null` from the shared HTTP client into command formatting.

**Observed Evidence:**
- `template list --json` currently fails in the live environment.
- `snapshot current --json` currently fails in the live environment.
- `attr list --json` currently fails in the live environment.
- Raw API inspection shows these endpoints return `HTTP 200` with `Content-Length: 0` and an empty body in the current SiYuan instance.
- The shared HTTP client already normalizes successful empty bodies to `null`.
- The remaining incompatibility is in service/command layers that expect concrete arrays or objects.

## Options Considered

### 1. Service-layer empty-value normalization (recommended)
- Keep `src/core/http.ts` generic: empty success body becomes `null`.
- Convert `null` to command-appropriate empty values in service modules.
- Preserve existing command formatting logic.

**Pros:** Minimal, localized, keeps HTTP concerns separate from command semantics.
**Cons:** Each affected service needs a small explicit fallback.

### 2. Command-layer null handling
- Let services return `null` and teach command handlers/formatters how to display it.

**Pros:** Makes command behavior explicit at the presentation layer.
**Cons:** Spreads compatibility logic across many command files and duplicates decisions.

### 3. Endpoint-specific mapping in HTTP client
- Make the client itself return `[]` or default objects for specific endpoints.

**Pros:** Centralized behavior.
**Cons:** Couples transport logic to endpoint semantics and scales poorly.

## Recommended Design

### Keep HTTP layer generic
`src/core/http.ts` should continue returning `null` for successful empty bodies. This is the correct transport-level normalization and should not be made endpoint-aware.

### Normalize empty responses in services
Service functions should return stable command-facing values:
- list/query/tree/search style reads return `[]`
- key/value map style reads return `{}`
- current/detail style reads return a normalized placeholder object only where the command expects an object formatter

This design specifically applies to:
- `src/services/template.ts` for `list()`
- `src/services/attr.ts` for `list()`
- `src/services/snapshot.ts` for `current()`

And may extend to any adjacent read-style service that still leaks `null` into command formatting.

### Keep command handlers simple
`src/commands/template.ts`, `src/commands/snapshot.ts`, and `src/commands/attr.ts` should continue to format arrays/objects without special `null` branches. They should receive already-normalized values from services.

## Data Flow
- CLI command invokes command handler.
- Command handler calls service.
- Service calls shared HTTP client.
- Shared client returns `null` for empty successful responses.
- Service converts `null` to the stable semantic empty value expected by the command.
- Formatter renders either empty-result messaging, placeholder object fields, or raw JSON output.

## Testing Strategy
- Add focused tests for empty response behavior in the affected command suites and/or service-adjacent tests.
- Verify `template list` empty response yields `[]` for JSON and `No results found.` for friendly output.
- Verify `attr list` empty response yields `[]` for JSON and `No results found.` for friendly output.
- Verify `snapshot current` empty response yields a normalized object with placeholder fields rather than failing.
- Run `npm test` and `npm run build`.
- Re-run live verification for:
  - `node dist/src/cli/run.js template list --json`
  - `node dist/src/cli/run.js snapshot current --json`
  - `node dist/src/cli/run.js attr list --json`

## Non-Goals
- No broad refactor of formatter architecture.
- No endpoint-specific logic inside the HTTP client.
- No expansion into unrelated mutating command flows unless they are directly blocked by the same empty-response issue.
