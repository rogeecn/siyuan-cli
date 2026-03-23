# siyuan-cli

[简体中文](./README.zh-CN.md)

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

Local development install:

```bash
npm install
npm run build
```

Run from the repo root:

```bash
node dist/src/cli/run.js --help
```

Optional global install for the `siyuan` command:

```bash
npm install -g .
siyuan --help
```

All examples in this README use `siyuan ...`. If you are running from the repository without a global install, replace `siyuan` with `node dist/src/cli/run.js`.

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
siyuan system version
siyuan search --content "project alpha"
siyuan doc get --id 20260316120000-abc123
siyuan notebook list
siyuan sql query --statement "select * from blocks limit 5"
siyuan tag list
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
siyuan --help
siyuan doc --help
siyuan block update --help
```

## Agent Usage

If you want an AI agent to use this CLI consistently, start with `SKILL.md` in the repo root. It summarizes when agents should prefer real `siyuan` commands, when to add `--json`, and how to treat destructive operations safely.

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
| `siyuan system version` | Show the current SiYuan version | `--json` |
| `siyuan system time` | Show server time | `--json` |
| `siyuan system boot-progress` | Show boot progress percentage | `--json` |

Examples:

```bash
siyuan system version
siyuan system time --json
siyuan system boot-progress
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
siyuan search --content "project alpha"
siyuan search --filename "meeting" --limit 20
siyuan search --tag work --json
```

Tip: use `--json` when you need document IDs for follow-up commands such as `doc get`, `doc update`, or `export markdown`.

### `doc`

Read and edit documents as Markdown.

| Command | Description | Key options |
| --- | --- | --- |
| `siyuan doc get` | Read one document | `--id`, `--json` |
| `siyuan doc create` | Create a document from Markdown | `--notebook`, `--path`, `--content` or `--content-file`, `--json` |
| `siyuan doc update` | Replace document Markdown | `--id`, `--content` or `--content-file`, `--json` |
| `siyuan doc append` | Append Markdown | `--id`, `--content` or `--content-file`, `--json` |
| `siyuan doc rename` | Rename a document path | `--id`, `--path`, `--json` |
| `siyuan doc move` | Move a document | `--id`, `--path`, `--json` |
| `siyuan doc remove` | Remove a document | `--id`, `--yes`, `--json` |

Examples:

```bash
siyuan doc get --id 20260316120000-abc123

siyuan doc create \
  --notebook nb-1 \
  --path /articles/cli-guide \
  --content-file ./post.md

siyuan doc update \
  --id 20260316120000-abc123 \
  --content "# Updated title"

siyuan doc append \
  --id 20260316120000-abc123 \
  --content-file ./appendix.md

siyuan doc remove --id 20260316120000-abc123 --yes
```

#### Publishing Markdown with Images

`doc create`, `doc update`, and `doc append` can publish Markdown that contains image references. Before content is sent to SiYuan, the CLI scans Markdown image syntax, uploads referenced images, and rewrites the image links automatically.

Example with a Markdown file:

```bash
siyuan doc create \
  --notebook nb-1 \
  --path /articles/with-images \
  --content-file ./post.md
```

Example with inline Markdown:

```bash
siyuan doc update \
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
| `siyuan notebook list` | List notebooks | `--json` |
| `siyuan notebook get` | Read one notebook | `--id`, `--json` |
| `siyuan notebook create` | Create a notebook | `--name`, `--json` |
| `siyuan notebook open` | Open a notebook | `--id`, `--json` |
| `siyuan notebook close` | Close a notebook | `--id`, `--json` |
| `siyuan notebook rename` | Rename a notebook | `--id`, `--name`, `--json` |
| `siyuan notebook remove` | Remove a notebook | `--id`, `--yes`, `--json` |

Examples:

```bash
siyuan notebook list
siyuan notebook get --id nb-1 --json
siyuan notebook create --name "Projects"
siyuan notebook rename --id nb-1 --name "Archive"
siyuan notebook remove --id nb-1 --yes
```

### `block`

Inspect blocks and mutate block content.

| Command | Description | Key options |
| --- | --- | --- |
| `siyuan block get` | Read one block | `--id`, `--json` |
| `siyuan block children` | List child blocks | `--id`, `--json` |
| `siyuan block update` | Replace block content | `--id`, `--content` or `--content-file`, `--json` |
| `siyuan block insert` | Insert a block after an existing block | `--id`, `--content` or `--content-file`, `--json` |
| `siyuan block move` | Move to a new parent block | `--id`, `--parent`, `--json` |
| `siyuan block remove` | Remove a block | `--id`, `--yes`, `--json` |

Examples:

```bash
siyuan block get --id blk-1
siyuan block children --id blk-1 --json
siyuan block update --id blk-1 --content-file ./section.md
siyuan block insert --id blk-1 --content "- Follow-up item"
siyuan block move --id blk-1 --parent parent-123
siyuan block remove --id blk-1 --yes
```

### `export`

Preview export metadata or export a document into a specific format.

| Command | Description | Key options |
| --- | --- | --- |
| `siyuan export preview` | Preview export details | `--id`, `--json` |
| `siyuan export markdown` | Export as Markdown | `--id`, `--json` |
| `siyuan export html` | Export as HTML | `--id`, `--json` |
| `siyuan export pdf` | Export as PDF | `--id`, `--json` |
| `siyuan export docx` | Export as DOCX | `--id`, `--json` |

Examples:

```bash
siyuan export preview --id 20260316120000-abc123
siyuan export markdown --id 20260316120000-abc123 --json
siyuan export pdf --id 20260316120000-abc123
```

### `file`

Browse, read, write, and remove files in the SiYuan workspace.

| Command | Description | Key options |
| --- | --- | --- |
| `siyuan file tree` | List files under a path | `--path`, `--json` |
| `siyuan file read` | Read file content | `--path`, `--json` |
| `siyuan file write` | Write file content | `--path`, `--content`, `--json` |
| `siyuan file remove` | Remove a file | `--path`, `--yes`, `--json` |

Examples:

```bash
siyuan file tree --path /data/assets
siyuan file read --path /data/storage/notes/readme.md
siyuan file write --path /data/storage/tmp/demo.md --content "hello"
siyuan file remove --path /data/storage/tmp/demo.md --yes
```

### `attr`

Inspect available attribute keys and read or write block attributes.

| Command | Description | Key options |
| --- | --- | --- |
| `siyuan attr get` | Read attributes for one block | `--id`, `--json` |
| `siyuan attr list` | List known attribute keys | `--json` |
| `siyuan attr set` | Set one attribute | `--id`, `--key`, `--value`, `--json` |
| `siyuan attr reset` | Reset one attribute | `--id`, `--key`, `--json` |

Examples:

```bash
siyuan attr list
siyuan attr get --id blk-1
siyuan attr set --id blk-1 --key custom-status --value active
siyuan attr reset --id blk-1 --key custom-status
```

### `snapshot`

Inspect and manage repository snapshots.

| Command | Description | Key options |
| --- | --- | --- |
| `siyuan snapshot list` | List snapshots | `--json` |
| `siyuan snapshot current` | Show current snapshot | `--json` |
| `siyuan snapshot create` | Create a snapshot | `--memo`, `--json` |
| `siyuan snapshot restore` | Restore a snapshot | `--id`, `--yes`, `--json` |
| `siyuan snapshot remove` | Remove a snapshot | `--id`, `--yes`, `--json` |

Examples:

```bash
siyuan snapshot list
siyuan snapshot create --memo "before-import"
siyuan snapshot restore --id snap-1 --yes
siyuan snapshot remove --id snap-1 --yes
```

### `template`

Inspect, render, and remove templates.

| Command | Description | Key options |
| --- | --- | --- |
| `siyuan template list` | List templates | `--json` |
| `siyuan template get` | Read one template by path | `--path`, `--json` |
| `siyuan template render` | Render a template into a document | `--path`, `--id`, `--json` |
| `siyuan template remove` | Remove a template | `--path`, `--yes`, `--json` |

Examples:

```bash
siyuan template list
siyuan template get --path templates/daily-note.md
siyuan template render --path templates/daily-note.md --id 20260316120000-abc123
siyuan template remove --path templates/old.md --yes
```

### `notify`

Send and inspect notifications.

| Command | Description | Key options |
| --- | --- | --- |
| `siyuan notify push` | Push a notification message | `--msg`, `--json` |
| `siyuan notify list` | List notifications | `--json` |
| `siyuan notify clear` | Clear notifications | `--json` |

Examples:

```bash
siyuan notify push --msg "Publish complete"
siyuan notify list --json
siyuan notify clear
```

### `sql`

Run read-only SQL queries against SiYuan.

| Command | Description | Key options |
| --- | --- | --- |
| `siyuan sql query` | Execute a SQL statement | `--statement`, `--json` |

Examples:

```bash
siyuan sql query --statement "select * from blocks limit 5"
siyuan sql query --statement "select id, updated from blocks order by updated desc limit 10" --json
```

### `tag`

Inspect tags, list tagged documents, rename tags, or remove tags.

| Command | Description | Key options |
| --- | --- | --- |
| `siyuan tag list` | List tags with counts | `--json` |
| `siyuan tag docs` | List documents for one tag | `--label`, `--json` |
| `siyuan tag rename` | Rename a tag | `--old`, `--new`, `--json` |
| `siyuan tag remove` | Remove a tag | `--label`, `--yes`, `--json` |

Examples:

```bash
siyuan tag list
siyuan tag docs --label work
siyuan tag rename --old project/alpha --new project/archive/alpha
siyuan tag remove --label obsolete --yes
```

## Common Workflows

Search, inspect, then export:

```bash
siyuan search --content "roadmap" --json
siyuan doc get --id 20260316120000-abc123
siyuan export markdown --id 20260316120000-abc123
```

Create a document from a local Markdown file:

```bash
siyuan doc create \
  --notebook nb-1 \
  --path /articles/weekly-update \
  --content-file ./weekly-update.md
```

Inspect a notebook and then move a document:

```bash
siyuan notebook list
siyuan doc move --id 20260316120000-abc123 --path /archive/2026/weekly-update
```

Attach metadata to a block:

```bash
siyuan attr set --id blk-1 --key review-status --value done
siyuan attr get --id blk-1 --json
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
siyuan search --tag work --json | jq '.[].id'
siyuan notebook list --json
siyuan export preview --id 20260316120000-abc123 --json
```

## Destructive Commands

Destructive commands are designed to be explicit.

- Use `--yes` when you really want to remove or restore something
- Without `--yes`, destructive commands abort instead of proceeding silently
- Double-check IDs and paths before running `remove` or `restore`

Typical destructive commands:

- `siyuan doc remove --id ... --yes`
- `siyuan block remove --id ... --yes`
- `siyuan file remove --path ... --yes`
- `siyuan notebook remove --id ... --yes`
- `siyuan snapshot restore --id ... --yes`
- `siyuan snapshot remove --id ... --yes`
- `siyuan template remove --path ... --yes`
- `siyuan tag remove --label ... --yes`

## Development

```bash
npm install
npm run build
npm test
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

`Cannot run siyuan`

- Use `node dist/src/cli/run.js ...` from the repo root or install globally with `npm install -g .`

`Need IDs for follow-up commands`

- Re-run the read/search command with `--json`

`A remove or restore command aborted`

- Re-run with `--yes` only after confirming the target ID or path is correct
