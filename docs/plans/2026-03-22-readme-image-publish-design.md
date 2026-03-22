# README Image Publish Section Design

**Goal:** Add a clear README section describing how Markdown publishing now auto-uploads images and rewrites image links.

**Scope:** This change only updates `README.md`. It documents the feature already implemented and verified in the live SiYuan environment.

## Recommended Placement
Insert a new section after `Quick Examples` and before `JSON Output` so readers encounter publishing examples early.

## Recommended Section Contents
1. Short explanation of the feature
2. Example using `--content-file`
3. Example using `--content`
4. Supported image source types
5. Behavior notes and current limitations

## Key Points to Document
- `doc create`, `doc update`, and `doc append` scan Markdown image syntax
- Supported sources:
  - relative local paths
  - absolute local paths
  - remote URLs
  - `data:` URIs
- Images are uploaded under `/data/assets/cli-publish/<date>/...`
- Markdown image URLs are rewritten automatically
- Relative paths are resolved relative to `--content-file`
- If one image upload fails, the whole publish command fails

## Non-Goals
- No README overhaul
- No separate docs site page
- No deeper explanation of internal implementation beyond what users need
