# README and Skill Docs Design

**Goal:** Upgrade `siyuan-cli` documentation so it has bilingual README files, detailed command usage guidance, and an agent-oriented skill at `skills/siyuan-cli/SKILL.md`.

**Scope:** Update project-level docs in `siyuan-cli/` only. This includes rewriting the English README, adding a Simplified Chinese README, and adding one agent skill document. No CLI behavior changes are included.

## Current State

- `README.md` exists but is brief and mostly example-driven.
- The CLI already exposes a broad command surface through `system`, `attr`, `block`, `search`, `snapshot`, `template`, `notify`, `doc`, `export`, `file`, `sql`, `tag`, and `notebook`.
- There is no Chinese README in `siyuan-cli/`.
- There is no skill package yet at `skills/siyuan-cli/SKILL.md` for agent usage.

## Documentation Strategy

### English README as canonical source

Use `README.md` as the primary public document for GitHub and package consumers. It should explain installation, configuration, output modes, destructive command safety, and all command groups with realistic examples.

### Simplified Chinese README mirrors structure

Add `README.zh-CN.md` with the same section order as `README.md`. Keep meaning aligned while adapting wording for Chinese readers instead of literal translation.

### Agent-focused skill document stays separate

Add `skills/siyuan-cli/SKILL.md` to describe when an AI agent should use `siyuan-cli`, what setup it requires, what task types it covers well, how to prefer `--json` for automation, and where destructive commands need extra care. This document should be organized around agent workflows rather than human CLI discovery.

## Recommended README Structure

1. Project overview
2. Why use `siyuan-cli`
3. Requirements
4. Install and build
5. Configuration with environment variables
6. Quick start commands
7. Global usage patterns
8. Command reference by group
9. Common workflows
10. JSON output and scripting notes
11. Destructive command behavior
12. Development
13. Troubleshooting

## Command Reference Approach

Document commands from the actual source in `src/cli/index.ts` and `src/commands/*.ts`.

For each command group:

- state what the group is for
- list implemented subcommands
- highlight required options
- include one or more concrete examples
- mention output style or `--json` behavior where relevant
- mention confirmation requirements for destructive actions

This keeps the README practical without trying to duplicate raw `--help` output line-for-line.

## `skills/siyuan-cli/SKILL.md` Structure

- Overview
- When to use
- Requirements
- Setup
- Command families mapped to agent tasks
- Recommended invocation patterns
- Safety notes
- Common examples

## Non-Goals

- No CLI refactor
- No command additions
- No docs site or separate command manual directory
- No Traditional Chinese version in this pass
