---
name: siyuan-cli
description: Use when a task mentions siyuan, siyuan-cli, notes, note-taking, 笔记, or 思源笔记 and needs real CLI commands to search notes, read or update documents, export content, inspect notebooks, tags, files, snapshots, or system state instead of guessing HTTP API calls.
---

# siyuan-cli

## Overview

Use this skill to operate SiYuan through the real CLI in this repository. Prefer direct commands over hand-written API requests for search, document edits, exports, and workspace inspection.

This package is intended to be published to npm. Default examples and recommendations should use `npx siyuan-cli <commands>`.

## When to Use

- User mentions `siyuan`, `siyuan-cli`, `笔记`, or `思源笔记`
- Need real `siyuan-cli` commands instead of guessed HTTP calls
- Need IDs or structured results from SiYuan for follow-up automation
- Need to read, create, update, append, move, or remove documents
- Need notebook, block, tag, file, snapshot, template, notification, SQL, or system operations

## Requirements

- Prefer npm package execution via `npx siyuan-cli <commands>`
- Run from this repository root only when developing or testing the package locally
- Ensure `SIYUAN_BASE_URL` and `SIYUAN_TOKEN` are set
- Build first if using the repo checkout directly: `npm install && npm run build`

Recommended npm invocation:

```bash
npx siyuan-cli --help
```

Repo-local invocation:

```bash
node dist/src/cli/run.js --help
```

Legacy/global invocation if already installed:

```bash
npm install -g siyuan-cli
siyuan-cli --help
```

## Quick Reference

| Task | Command pattern |
| --- | --- |
| Search notes | `npx siyuan-cli search --content <text> --json` |
| Read a document | `npx siyuan-cli doc get --id <document-id>` |
| Create a document | `npx siyuan-cli doc create --notebook <id> --path <path> --content-file <file>` |
| Update a document | `npx siyuan-cli doc update --id <document-id> --content-file <file>` |
| Append to a document | `npx siyuan-cli doc append --id <document-id> --content <text>` |
| Export Markdown | `npx siyuan-cli export markdown --id <document-id> --json` |
| List notebooks | `npx siyuan-cli notebook list --json` |
| Run SQL | `npx siyuan-cli sql query --statement <sql> --json` |

## Recommended Patterns

- Default to `npx siyuan-cli <commands>` when showing end-user usage because the package is published to npm
- Prefer `--json` when the result will be consumed by another command or parsed by an agent
- Use search first, then feed returned IDs into `doc`, `export`, `block`, or `attr` commands
- Use `--content-file` for larger Markdown updates and `--content` for short inline edits
- Use `npx siyuan-cli <group> --help` when you need the exact subcommand surface

## Chinese Usage Shortcuts

- `搜索思源笔记` / `搜索笔记` -> `npx siyuan-cli search --content <关键词> --json`
- `读取笔记` / `读取文档` -> `npx siyuan-cli doc get --id <document-id>`
- `新建笔记` / `创建文档` -> `npx siyuan-cli doc create --notebook <id> --path <path> --content-file <file>`
- `更新笔记` / `追加内容` -> `npx siyuan-cli doc update ...` or `npx siyuan-cli doc append ...`
- `导出思源笔记` -> `npx siyuan-cli export markdown|html|pdf|docx --id <document-id>`

Examples:

```bash
npx siyuan-cli search --content "roadmap" --json
npx siyuan-cli doc get --id 20260316120000-abc123
npx siyuan-cli doc update --id 20260316120000-abc123 --content-file ./draft.md
npx siyuan-cli export markdown --id 20260316120000-abc123 --json
```

## Safety Notes

- Destructive commands require explicit `--yes`; do not add it unless the task really intends mutation
- Double-check IDs, labels, and file paths before mutation
- If you need stable IDs from search, rerun with `--json`
- `doc create`, `doc update`, and `doc append` can upload and rewrite Markdown image links automatically

## Common Mistakes

| Mistake | Fix |
| --- | --- |
| Guessing HTTP endpoints | Use the real `siyuan-cli` command family first |
| Forgetting env vars | Export `SIYUAN_BASE_URL` and `SIYUAN_TOKEN` before running commands |
| Parsing human text for IDs | Use `--json` |
| Showing global install first | Prefer `npx siyuan-cli <commands>` as the default npm usage |
| Using destructive commands casually | Omit `--yes` until the target is verified |
| Updating large Markdown inline | Prefer `--content-file` |
