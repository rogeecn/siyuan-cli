---
name: siyuan-cli
description: Use when working with a local SiYuan Note instance through this repository's CLI to search notes, read or update documents, export content, inspect notebooks, tags, files, snapshots, or system state, especially when an agent should prefer real project commands over guessing HTTP API calls.
---

# siyuan-cli

## Overview

Use this skill to operate SiYuan through the real CLI in this repository. Prefer direct commands over hand-written API requests for search, document edits, exports, and workspace inspection.

## When to Use

- Need real `siyuan` commands instead of guessed HTTP calls
- Need IDs or structured results from SiYuan for follow-up automation
- Need to read, create, update, append, move, or remove documents
- Need notebook, block, tag, file, snapshot, template, notification, SQL, or system operations

## Requirements

- Run from this repository root, or use the installed `siyuan` binary
- Ensure `SIYUAN_BASE_URL` and `SIYUAN_TOKEN` are set
- Build first if using the repo checkout directly: `npm install && npm run build`

Repo-local invocation:

```bash
node dist/src/cli/run.js --help
```

Installed invocation:

```bash
siyuan --help
```

## Quick Reference

| Task | Command pattern |
| --- | --- |
| Search notes | `siyuan search --content <text> --json` |
| Read a document | `siyuan doc get --id <document-id>` |
| Create a document | `siyuan doc create --notebook <id> --path <path> --content-file <file>` |
| Update a document | `siyuan doc update --id <document-id> --content-file <file>` |
| Append to a document | `siyuan doc append --id <document-id> --content <text>` |
| Export Markdown | `siyuan export markdown --id <document-id> --json` |
| List notebooks | `siyuan notebook list --json` |
| Run SQL | `siyuan sql query --statement <sql> --json` |

## Recommended Patterns

- Prefer `--json` when the result will be consumed by another command or parsed by an agent
- Use search first, then feed returned IDs into `doc`, `export`, `block`, or `attr` commands
- Use `--content-file` for larger Markdown updates and `--content` for short inline edits
- Use `siyuan <group> --help` when you need the exact subcommand surface

Examples:

```bash
siyuan search --content "roadmap" --json
siyuan doc get --id 20260316120000-abc123
siyuan doc update --id 20260316120000-abc123 --content-file ./draft.md
siyuan export markdown --id 20260316120000-abc123 --json
```

## Safety Notes

- Destructive commands require explicit `--yes`; do not add it unless the task really intends mutation
- Double-check IDs, labels, and file paths before mutation
- If you need stable IDs from search, rerun with `--json`
- `doc create`, `doc update`, and `doc append` can upload and rewrite Markdown image links automatically

## Common Mistakes

| Mistake | Fix |
| --- | --- |
| Guessing HTTP endpoints | Use the real `siyuan` command family first |
| Forgetting env vars | Export `SIYUAN_BASE_URL` and `SIYUAN_TOKEN` before running commands |
| Parsing human text for IDs | Use `--json` |
| Using destructive commands casually | Omit `--yes` until the target is verified |
| Updating large Markdown inline | Prefer `--content-file` |
