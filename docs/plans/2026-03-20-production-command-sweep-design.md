# Production Command Sweep Design

**Goal:** Drive the CLI to production usability on the current live SiYuan instance by testing every command group against the real environment, fixing only verified failures, and repeating until no new production blockers remain.

**Scope:** This is a full command sweep against the environment configured by `/home/rogee/Projects/siyuan-cli/.env`. It includes both read-only and controlled write/delete flows, with write operations restricted to test-safe targets explicitly allowed by the user.

**Observed Context:**
- Several real-environment compatibility issues have already been identified and partially fixed: build entry mismatch, empty successful response handling, `tag list` request shape, empty-response command formatting, and `doc create` response shape.
- Real document lifecycle testing exposed a remaining verified production issue: `doc update` reports success but does not persist updated content in the current SiYuan environment.
- The user explicitly wants all remaining production-unusable CLI behavior fixed, not just the currently isolated issue.

## Options Considered

### 1. Rolling command-sweep remediation (recommended)
- Test command groups in the live environment.
- Capture exact failures.
- Fix only proven failures.
- Rebuild, retest, and continue sweeping.

**Pros:** Evidence-driven, minimizes speculative work, converges on real production usability.
**Cons:** Longer-running effort with many feedback loops.

### 2. Narrow command-family remediation
- Fix only the current document lifecycle issues first.
- Delay the rest of the CLI until later.

**Pros:** Lower immediate scope.
**Cons:** Does not satisfy the full production-coverage request.

### 3. Broad compatibility refactor first
- Rework the transport/service layer to anticipate many server differences at once.

**Pros:** Could remove repeated small patches.
**Cons:** High risk, highly speculative, difficult to validate incrementally.

## Recommended Design

### Sweep by command group in risk order
Use a staged sweep so evidence and safety remain manageable:
1. Read-focused commands first: `system`, `search`, `sql`, `template`, `snapshot`, `tag`, `attr`, `file`, `export`
2. Controlled write/update commands with rollback: `doc`, `file`, `attr`
3. Higher-risk destructive or stateful commands last: `notebook`, tag mutations, snapshot restore/remove, other destructive flows

### Use real evidence before every fix
Every production bug must be backed by at least one fresh real-environment reproduction and, where helpful, raw API inspection. No speculative fixes.

### Prefer minimal service-layer compatibility fixes
When the live server differs from current assumptions, prefer to normalize behavior in service layers or the shared HTTP layer. Keep command handlers thin and user-facing output stable.

### Keep mutation tests reversible
All live writes must target obvious test data:
- unique paths
- unique content markers
- test notebooks/documents only
- explicit cleanup at the end of each mutation scenario

## Data Flow
- Build latest CLI from source.
- Run a real command.
- If it fails, capture CLI output.
- If necessary, inspect raw API request/response.
- Identify smallest compatible fix location.
- Add/adjust automated tests for the verified failure.
- Implement minimal fix.
- Rebuild and re-run both automated and live verification.
- Resume sweep from the failing command group onward.

## Testing Strategy
- Maintain a running success/failure ledger per command group.
- After each fix batch, run focused tests first, then `npm test`, then `npm run build`.
- Use the built CLI for live validation, not internal helpers.
- For destructive commands, verify cleanup explicitly.
- Stop only when either:
  - the command sweep finishes with no new failures, or
  - a failure requires user-supplied real identifiers/targets not yet available.

## Non-Goals
- No speculative redesign of the entire CLI architecture.
- No silent fallback behavior without understanding the live server contract.
- No production writes outside the explicitly allowed test scope.
