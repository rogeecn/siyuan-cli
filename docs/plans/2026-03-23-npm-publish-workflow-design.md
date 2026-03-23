# npm Publish Workflow Design

**Goal:** Add a GitHub Actions workflow that can publish `siyuan-cli` to npm on `v*` tags and through manual dispatch.

**Scope:** This design covers CI/CD workflow automation and the minimal supporting documentation needed to explain how publishing works. It does not change CLI runtime behavior.

## Current State

- The repository has no `.github/workflows/` directory yet.
- `package.json` already includes `build` and `test` scripts.
- The package name is `siyuan-cli` and the project is suitable for npm publishing.
- Release behavior is currently manual and undocumented.

## Recommended Approach

Use a single `publish.yml` workflow that supports both:

- automatic publish when a `v*` tag is pushed
- manual publish via `workflow_dispatch`

This keeps release logic in one place, avoids duplicated steps, and gives a consistent verification path for both automated and manual releases.

## Trigger Model

### Tag publish

- Trigger on `push.tags: ['v*']`
- Expect tags like `v0.1.1`
- Validate that `package.json.version` matches the tag without the `v` prefix

### Manual publish

- Trigger on `workflow_dispatch`
- Run the same install, test, and build steps as tag publishing
- Allow the operator to publish from the currently checked out ref without requiring a tag

## Verification Requirements

Before publish, the workflow should always:

1. check out the repository
2. set up Node.js
3. install dependencies with `npm ci`
4. run `npm test`
5. run `npm run build`

For tag-triggered runs, add a version guard:

- `v0.1.1` must match `package.json.version = 0.1.1`

If the versions do not match, the workflow must fail before publish.

## Publish Requirements

- Use the repository secret `NPM_TOKEN`
- Authenticate through `actions/setup-node` with the npm registry
- Publish with `npm publish --access public`

## Documentation Updates

Add a short release section to the README describing:

- `v*` tag publishing
- manual publish via GitHub Actions
- required repository secret: `NPM_TOKEN`

## Non-Goals

- No automatic version bumping
- No changelog generation
- No GitHub Release creation
- No prerelease channel support in this pass
