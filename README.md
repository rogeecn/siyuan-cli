# siyuan-cli

Human-friendly CLI for SiYuan Note.

## Requirements

- Node.js `>=20`
- A reachable SiYuan instance
- A valid SiYuan API token

## Install

```bash
npm install
npm run build
```

Run the CLI from the project directory:

```bash
node dist/src/cli/run.js --help
```

## Configuration

The CLI reads only these environment variables:

- `SIYUAN_BASE_URL`
- `SIYUAN_TOKEN`

Example:

```bash
export SIYUAN_BASE_URL="http://127.0.0.1:6806"
export SIYUAN_TOKEN="your-token"
```

If either variable is missing, commands fail at runtime with a readable error.

## Quick Examples

```bash
node dist/src/cli/run.js system version
node dist/src/cli/run.js search --content alpha
node dist/src/cli/run.js doc get --id doc-123
node dist/src/cli/run.js notebook list
node dist/src/cli/run.js sql query --statement "select * from blocks limit 5"
node dist/src/cli/run.js tag list
node dist/src/cli/run.js block get --id blk-1
node dist/src/cli/run.js export markdown --id doc-123
node dist/src/cli/run.js file read --path /data/assets/readme.md
node dist/src/cli/run.js attr list
node dist/src/cli/run.js snapshot current
node dist/src/cli/run.js template list
node dist/src/cli/run.js notify push --msg "hello"
```

## JSON Output

Most implemented commands support `--json` for script-friendly output.

```bash
node dist/src/cli/run.js system time --json
node dist/src/cli/run.js search --tag work --json
node dist/src/cli/run.js sql query --statement "select * from blocks limit 1" --json
```

## Implemented Command Groups

Currently implemented command groups:

- `system`
- `search`
- `doc`
- `notebook`
- `sql`
- `tag`
- `block`
- `export`
- `file`
- `attr`
- `snapshot`
- `template`
- `notify`

These groups are intentionally partial in places. The current implementation focuses on representative, human-friendly commands rather than full endpoint coverage.

## Destructive Commands

Most currently implemented commands are read-only or low-risk.

The project already includes a confirmation helper for future destructive commands. When destructive operations are added, they should require confirmation by default and allow bypass with `--yes` only when appropriate.

## Development

Run tests:

```bash
npm test
```

Build the project:

```bash
npm run build
```
