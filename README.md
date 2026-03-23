# siyuan-cli

[简体中文](./README.zh-CN.md)

CLI for SiYuan Note that helps you search notes, read documents, update content, and export results from the terminal.

```bash
npx siyuan-cli search --content "roadmap" --json
```

Before running commands, set `SIYUAN_BASE_URL` and `SIYUAN_TOKEN`.

- Search notes by content, filename, or tag
- Read and update documents as Markdown
- Export notes as Markdown, HTML, PDF, or DOCX

Human-friendly CLI for SiYuan Note. It wraps the SiYuan HTTP API in task-oriented commands so you can search notes, read documents, update content, inspect notebooks, manage tags, export data, and script repeatable workflows from the terminal.

## Why use it

- Human-first command names instead of raw API endpoints
- Script-friendly `--json` output on most commands
- Safe defaults for destructive operations through `--yes`
- File- and Markdown-based authoring flows for document and block updates
- Broad coverage across documents, notebooks, blocks, tags, exports, files, snapshots, templates, notifications, SQL, and system state

## Requirements

- Node.js `>=20`
- A reachable SiYuan instance
- A valid SiYuan API token

## Install

Recommended npm usage:

```bash
npx siyuan-cli --help
```

Local development setup:

```bash
npm install
npm run build
```

Run from the repo root while developing:

```bash
node dist/src/cli/run.js --help
```

Optional global install if you want a persistent shell command:

```bash
npm install -g siyuan-cli
siyuan-cli --help
```

All user-facing examples in this README use `npx siyuan-cli ...`. If you are running from the repository without publishing or installing the package, replace `npx siyuan-cli` with `node dist/src/cli/run.js`.

## Configuration

The CLI reads only these environment variables:

- `SIYUAN_BASE_URL`
- `SIYUAN_TOKEN`

Example:

```bash
export SIYUAN_BASE_URL="http://127.0.0.1:6806"
export SIYUAN_TOKEN="your-token"
```

If either variable is missing, commands fail with a readable runtime error.

## Quick Start

```bash
npx siyuan-cli system version
npx siyuan-cli search --content "project alpha"
npx siyuan-cli doc get --id 20260316120000-abc123
npx siyuan-cli notebook list
npx siyuan-cli sql query --statement "select * from blocks limit 5"
npx siyuan-cli tag list
```

## Command Overview

Top-level command groups:

```text
system     attr       block      search     snapshot   template
notify     doc        export     file       sql        tag
notebook
```

Ask for built-in help any time:

```bash
npx siyuan-cli --help
npx siyuan-cli doc --help
npx siyuan-cli block update --help
```

## Agent Usage

If you want an AI agent to use this CLI consistently, start with `SKILL.md` in the repo root. It summarizes when agents should prefer real `npx siyuan-cli` command forms, when to add `--json`, and how to treat destructive operations safely.

## Usage Conventions

- `IDs` - Most read, update, export, and remove flows use SiYuan IDs such as document IDs, block IDs, notebook IDs, and snapshot IDs.
- `--json` - Prefer this for scripting, piping, or any agent workflow that needs stable machine-readable output.
- `--yes` - Required on destructive commands such as `doc remove`, `block remove`, `file remove`, `snapshot restore`, `snapshot remove`, `template remove`, and `tag remove`.
- `--content` vs `--content-file` - Document and block write flows accept inline Markdown or Markdown loaded from a file.
- `Human output` - Default output is optimized for terminal reading, not for downstream parsing.

## Command Reference

### `system`

Inspect SiYuan runtime state.

| Command | Description | Key options |
| --- | --- | --- |
| `npx siyuan-cli system version` | Show the current SiYuan version | `--json` |
| `npx siyuan-cli system time` | Show server time | `--json` |
| `npx siyuan-cli system boot-progress` | Show boot progress percentage | `--json` |

Examples:

```bash
npx siyuan-cli system version
npx siyuan-cli system time --json
npx siyuan-cli system boot-progress
```

### `search`

Search notes by content, filename, or tag. At least one search criterion is required.

| Option | Description |
| --- | --- |
| `--content <text>` | Search note content |
| `--filename <text>` | Search titles or paths |
| `--tag <tag>` | Search by tag |
| `--limit <number>` | Limit results, default `10` |
| `--json` | Print raw JSON output |

Examples:

```bash
npx siyuan-cli search --content "project alpha"
npx siyuan-cli search --filename "meeting" --limit 20
npx siyuan-cli search --tag work --json
```

Tip: use `--json` when you need document IDs for follow-up commands such as `doc get`, `doc update`, or `export markdown`.

### `doc`

Read and edit documents as Markdown.

| Command | Description | Key options |
| --- | --- | --- |
| `npx siyuan-cli doc get` | Read one document | `--id`, `--json` |
| `npx siyuan-cli doc create` | Create a document from Markdown | `--notebook`, `--path`, `--content` or `--content-file`, `--json` |
| `npx siyuan-cli doc update` | Replace document Markdown | `--id`, `--content` or `--content-file`, `--json` |
| `npx siyuan-cli doc append` | Append Markdown | `--id`, `--content` or `--content-file`, `--json` |
| `npx siyuan-cli doc rename` | Rename a document path | `--id`, `--path`, `--json` |
| `npx siyuan-cli doc move` | Move a document | `--id`, `--path`, `--json` |
| `npx siyuan-cli doc remove` | Remove a document | `--id`, `--yes`, `--json` |

Examples:

```bash
npx siyuan-cli doc get --id 20260316120000-abc123

npx siyuan-cli doc create \
  --notebook nb-1 \
  --path /articles/cli-guide \
  --content-file ./post.md

npx siyuan-cli doc update \
  --id 20260316120000-abc123 \
  --content "# Updated title"

npx siyuan-cli doc append \
  --id 20260316120000-abc123 \
  --content-file ./appendix.md

npx siyuan-cli doc remove --id 20260316120000-abc123 --yes
```

#### Publishing Markdown with Images

`doc create`, `doc update`, and `doc append` can publish Markdown that contains image references. Before content is sent to SiYuan, the CLI scans Markdown image syntax, uploads referenced images, and rewrites the image links automatically.

Example with a Markdown file:

```bash
npx siyuan-cli doc create \
  --notebook nb-1 \
  --path /articles/with-images \
  --content-file ./post.md
```

Example with inline Markdown:

```bash
npx siyuan-cli doc update \
  --id 20260316120000-abc123 \
  --content "# Hello\n\n![](https://example.com/cover.png)"
```

Supported image sources:

- Relative local paths such as `./img/cover.png`
- Absolute local paths such as `/Users/name/Pictures/cover.png`
- Remote URLs such as `https://example.com/cover.png`
- `data:` URIs

Current behavior:

- Uploaded images are stored under `/data/assets/cli-publish/<date>/...`
- Markdown image links are rewritten automatically to the uploaded asset path
- Relative image paths are resolved relative to the `--content-file` location
- If one image fails to resolve or upload, the whole publish command fails

### `notebook`

Inspect and manage notebooks.

| Command | Description | Key options |
| --- | --- | --- |
| `npx siyuan-cli notebook list` | List notebooks | `--json` |
| `npx siyuan-cli notebook get` | Read one notebook | `--id`, `--json` |
| `npx siyuan-cli notebook create` | Create a notebook | `--name`, `--json` |
| `npx siyuan-cli notebook open` | Open a notebook | `--id`, `--json` |
| `npx siyuan-cli notebook close` | Close a notebook | `--id`, `--json` |
| `npx siyuan-cli notebook rename` | Rename a notebook | `--id`, `--name`, `--json` |
| `npx siyuan-cli notebook remove` | Remove a notebook | `--id`, `--yes`, `--json` |

Examples:

```bash
npx siyuan-cli notebook list
npx siyuan-cli notebook get --id nb-1 --json
npx siyuan-cli notebook create --name "Projects"
npx siyuan-cli notebook rename --id nb-1 --name "Archive"
npx siyuan-cli notebook remove --id nb-1 --yes
```

### `block`

Inspect blocks and mutate block content.

| Command | Description | Key options |
| --- | --- | --- |
| `npx siyuan-cli block get` | Read one block | `--id`, `--json` |
| `npx siyuan-cli block children` | List child blocks | `--id`, `--json` |
| `npx siyuan-cli block update` | Replace block content | `--id`, `--content` or `--content-file`, `--json` |
| `npx siyuan-cli block insert` | Insert a block after an existing block | `--id`, `--content` or `--content-file`, `--json` |
| `npx siyuan-cli block move` | Move to a new parent block | `--id`, `--parent`, `--json` |
| `npx siyuan-cli block remove` | Remove a block | `--id`, `--yes`, `--json` |

Examples:

```bash
npx siyuan-cli block get --id blk-1
npx siyuan-cli block children --id blk-1 --json
npx siyuan-cli block update --id blk-1 --content-file ./section.md
npx siyuan-cli block insert --id blk-1 --content "- Follow-up item"
npx siyuan-cli block move --id blk-1 --parent parent-123
npx siyuan-cli block remove --id blk-1 --yes
```

### `export`

Preview export metadata or export a document into a specific format.

| Command | Description | Key options |
| --- | --- | --- |
| `npx siyuan-cli export preview` | Preview export details | `--id`, `--json` |
| `npx siyuan-cli export markdown` | Export as Markdown | `--id`, `--json` |
| `npx siyuan-cli export html` | Export as HTML | `--id`, `--json` |
| `npx siyuan-cli export pdf` | Export as PDF | `--id`, `--json` |
| `npx siyuan-cli export docx` | Export as DOCX | `--id`, `--json` |

Examples:

```bash
npx siyuan-cli export preview --id 20260316120000-abc123
npx siyuan-cli export markdown --id 20260316120000-abc123 --json
npx siyuan-cli export pdf --id 20260316120000-abc123
```

### `file`

Browse, read, write, and remove files in the SiYuan workspace.

| Command | Description | Key options |
| --- | --- | --- |
| `npx siyuan-cli file tree` | List files under a path | `--path`, `--json` |
| `npx siyuan-cli file read` | Read file content | `--path`, `--json` |
| `npx siyuan-cli file write` | Write file content | `--path`, `--content`, `--json` |
| `npx siyuan-cli file remove` | Remove a file | `--path`, `--yes`, `--json` |

Examples:

```bash
npx siyuan-cli file tree --path /data/assets
npx siyuan-cli file read --path /data/storage/notes/readme.md
npx siyuan-cli file write --path /data/storage/tmp/demo.md --content "hello"
npx siyuan-cli file remove --path /data/storage/tmp/demo.md --yes
```

### `attr`

Inspect available attribute keys and read or write block attributes.

| Command | Description | Key options |
| --- | --- | --- |
| `npx siyuan-cli attr get` | Read attributes for one block | `--id`, `--json` |
| `npx siyuan-cli attr list` | List known attribute keys | `--json` |
| `npx siyuan-cli attr set` | Set one attribute | `--id`, `--key`, `--value`, `--json` |
| `npx siyuan-cli attr reset` | Reset one attribute | `--id`, `--key`, `--json` |

Examples:

```bash
npx siyuan-cli attr list
npx siyuan-cli attr get --id blk-1
npx siyuan-cli attr set --id blk-1 --key custom-status --value active
npx siyuan-cli attr reset --id blk-1 --key custom-status
```

### `snapshot`

Inspect and manage repository snapshots.

| Command | Description | Key options |
| --- | --- | --- |
| `npx siyuan-cli snapshot list` | List snapshots | `--json` |
| `npx siyuan-cli snapshot current` | Show current snapshot | `--json` |
| `npx siyuan-cli snapshot create` | Create a snapshot | `--memo`, `--json` |
| `npx siyuan-cli snapshot restore` | Restore a snapshot | `--id`, `--yes`, `--json` |
| `npx siyuan-cli snapshot remove` | Remove a snapshot | `--id`, `--yes`, `--json` |

Examples:

```bash
npx siyuan-cli snapshot list
npx siyuan-cli snapshot create --memo "before-import"
npx siyuan-cli snapshot restore --id snap-1 --yes
npx siyuan-cli snapshot remove --id snap-1 --yes
```

### `template`

Inspect, render, and remove templates.

| Command | Description | Key options |
| --- | --- | --- |
| `npx siyuan-cli template list` | List templates | `--json` |
| `npx siyuan-cli template get` | Read one template by path | `--path`, `--json` |
| `npx siyuan-cli template render` | Render a template into a document | `--path`, `--id`, `--json` |
| `npx siyuan-cli template remove` | Remove a template | `--path`, `--yes`, `--json` |

Examples:

```bash
npx siyuan-cli template list
npx siyuan-cli template get --path templates/daily-note.md
npx siyuan-cli template render --path templates/daily-note.md --id 20260316120000-abc123
npx siyuan-cli template remove --path templates/old.md --yes
```

### `notify`

Send and inspect notifications.

| Command | Description | Key options |
| --- | --- | --- |
| `npx siyuan-cli notify push` | Push a notification message | `--msg`, `--json` |
| `npx siyuan-cli notify list` | List notifications | `--json` |
| `npx siyuan-cli notify clear` | Clear notifications | `--json` |

Examples:

```bash
npx siyuan-cli notify push --msg "Publish complete"
npx siyuan-cli notify list --json
npx siyuan-cli notify clear
```

### `sql`

Run read-only SQL queries against SiYuan.

| Command | Description | Key options |
| --- | --- | --- |
| `npx siyuan-cli sql query` | Execute a SQL statement | `--statement`, `--json` |

Examples:

```bash
npx siyuan-cli sql query --statement "select * from blocks limit 5"
npx siyuan-cli sql query --statement "select id, updated from blocks order by updated desc limit 10" --json
```

### `tag`

Inspect tags, list tagged documents, rename tags, or remove tags.

| Command | Description | Key options |
| --- | --- | --- |
| `npx siyuan-cli tag list` | List tags with counts | `--json` |
| `npx siyuan-cli tag docs` | List documents for one tag | `--label`, `--json` |
| `npx siyuan-cli tag rename` | Rename a tag | `--old`, `--new`, `--json` |
| `npx siyuan-cli tag remove` | Remove a tag | `--label`, `--yes`, `--json` |

Examples:

```bash
npx siyuan-cli tag list
npx siyuan-cli tag docs --label work
npx siyuan-cli tag rename --old project/alpha --new project/archive/alpha
npx siyuan-cli tag remove --label obsolete --yes
```

## Common Workflows

Search, inspect, then export:

```bash
npx siyuan-cli search --content "roadmap" --json
npx siyuan-cli doc get --id 20260316120000-abc123
npx siyuan-cli export markdown --id 20260316120000-abc123
```

Create a document from a local Markdown file:

```bash
npx siyuan-cli doc create \
  --notebook nb-1 \
  --path /articles/weekly-update \
  --content-file ./weekly-update.md
```

Inspect a notebook and then move a document:

```bash
npx siyuan-cli notebook list
npx siyuan-cli doc move --id 20260316120000-abc123 --path /archive/2026/weekly-update
```

Attach metadata to a block:

```bash
npx siyuan-cli attr set --id blk-1 --key review-status --value done
npx siyuan-cli attr get --id blk-1 --json
```

## JSON Output and Scripting

Most implemented commands support `--json`.

Use it when you need to:

- feed output into `jq`
- capture IDs for a follow-up command
- drive the CLI from an agent or another script
- avoid parsing human-formatted text

Examples:

```bash
npx siyuan-cli search --tag work --json | jq '.[].id'
npx siyuan-cli notebook list --json
npx siyuan-cli export preview --id 20260316120000-abc123 --json
```

## Destructive Commands

Destructive commands are designed to be explicit.

- Use `--yes` when you really want to remove or restore something
- Without `--yes`, destructive commands abort instead of proceeding silently
- Double-check IDs and paths before running `remove` or `restore`

Typical destructive commands:

- `npx siyuan-cli doc remove --id ... --yes`
- `npx siyuan-cli block remove --id ... --yes`
- `npx siyuan-cli file remove --path ... --yes`
- `npx siyuan-cli notebook remove --id ... --yes`
- `npx siyuan-cli snapshot restore --id ... --yes`
- `npx siyuan-cli snapshot remove --id ... --yes`
- `npx siyuan-cli template remove --path ... --yes`
- `npx siyuan-cli tag remove --label ... --yes`

## Development

```bash
npm install
npm run build
npm test
```

## Release

GitHub Actions can publish `siyuan-cli` to npm in two ways:

- Push a Git tag matching `v*` to publish automatically
- Run the workflow manually from the GitHub Actions UI on the default branch
- Store the npm access token in the repository secret `NPM_TOKEN`
- For tag-based releases, tag `vX.Y.Z` must match `package.json` version `X.Y.Z`

Example tag push:

```bash
git tag v0.1.1
git push origin v0.1.1
```

Useful checks while iterating on commands:

```bash
node dist/src/cli/run.js --help
node dist/src/cli/run.js doc --help
node dist/src/cli/run.js search --content demo --json
```

## Troubleshooting

`Missing environment variables`

- Confirm `SIYUAN_BASE_URL` and `SIYUAN_TOKEN` are exported in the same shell session

`Cannot run the CLI`

- Use `npx siyuan-cli ...`, or run `node dist/src/cli/run.js ...` from the repo root while developing locally

`Need IDs for follow-up commands`

- Re-run the read/search command with `--json`

`A remove or restore command aborted`

- Re-run with `--yes` only after confirming the target ID or path is correct
