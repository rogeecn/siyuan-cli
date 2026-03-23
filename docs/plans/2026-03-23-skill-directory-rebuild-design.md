# Skill Directory Rebuild Design

**Goal:** Rebuild the project skill as a standard directory-based skill at `skills/siyuan-cli/SKILL.md` and update repository docs to point at the new location.

**Scope:** Documentation and skill packaging changes only. This work covers the skill file layout, skill copy refresh, README references, and validation that the new structure is discoverable. No CLI runtime behavior changes are included.

## Current State

- The repository has a single root-level `SKILL.md`.
- `README.md` and `README.zh-CN.md` both point agents to the root-level `SKILL.md`.
- The current skill content already captures the right operational intent: use real `npx siyuan-cli` commands, prefer `--json` for automation, and treat destructive commands carefully.
- The current layout is not a standard skill directory, which makes future supporting files or skill-specific assets awkward.

## Design

### Standardize on a dedicated skill directory

Move the project skill to `skills/siyuan-cli/SKILL.md`. This matches normal skill packaging, gives the project room for future supporting files, and avoids having a one-off root entrypoint.

### Keep one canonical skill entrypoint

Delete the root-level `SKILL.md` after the new file exists. Avoid maintaining both a compatibility copy and a canonical copy because that invites drift.

### Refresh the skill copy while preserving its core purpose

The rebuilt skill should keep the same main contract:

- trigger on SiYuan, thought-note, PKM, and Chinese note-taking requests
- prefer real `npx siyuan-cli` commands over guessed HTTP API calls
- call out environment requirements and repo-local fallback execution
- steer agents toward `--json`, `--content-file`, and explicit `--yes` handling

Required trigger wording must still cover at least these terms or ideas: `siyuan`, `siyuan-cli`, `思源笔记`, `笔记`, note-taking, and PKM. Additional wording is allowed, but the rebuilt version should not narrow the current trigger surface.

The rewritten version may tighten phrasing or reorganize sections, but it should preserve the current operational guidance rather than materially changing the skill's intent.

### Keep frontmatter compatible and minimal

The rebuilt skill should keep valid YAML frontmatter with the same two fields used today:

- `name`
- `description`

The `description` should still describe when to use the skill, not summarize its workflow.

## Validation Strategy

### RED: baseline failure modes on the current state

Capture why the current state is insufficient for the requested outcome:

- the skill is not stored under a standard directory-based path
- repository docs still reference the root file directly
- future supporting files cannot sit beside the skill in an obvious package directory

### GREEN: verify the rebuilt layout

After implementation:

- `skills/siyuan-cli/SKILL.md` exists
- root `SKILL.md` is gone
- `README.md` and `README.zh-CN.md` point to `skills/siyuan-cli/SKILL.md`
- the new skill frontmatter remains valid and still describes when to use the skill

Discovery validation in this pass is limited to repository-local discovery paths: the canonical skill file path and the two README references above.

## Non-Goals

- No multi-skill split in this pass
- No new CLI commands or command behavior changes
- No repo-wide docs restructuring beyond updating skill references
