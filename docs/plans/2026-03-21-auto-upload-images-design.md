# Auto Upload Images for Markdown Publish Design

**Goal:** Make `doc create`, `doc update`, and `doc append` capable of publishing Markdown with images that remain visible remotely by automatically uploading referenced images and rewriting Markdown links.

**Scope:** This design covers Markdown image references in both inline content and `--content-file` workflows. It supports local relative paths, local absolute paths, remote URLs, and `data:` URIs.

## Problem Statement
The current CLI can publish Markdown that contains image syntax, but it only sends the Markdown text itself. Referenced images are not uploaded into the SiYuan workspace, so remote readers may see broken images unless the referenced file path is already valid inside that environment.

## Supported Image Sources
1. Local relative paths (relative to the Markdown file when `--content-file` is used)
2. Local absolute file paths
3. Remote URLs (`http://` or `https://`)
4. `data:` URIs

## Recommended Architecture

### 1. Add a dedicated asset upload service
Create a small service that can:
- accept binary image data + filename + mime type
- upload the asset to a deterministic workspace path under `/data/assets/cli-publish/...`
- return the final remote asset path to be referenced from Markdown

This should use the existing file upload infrastructure but expose binary-focused semantics rather than overloading plain text file writes.

### 2. Add a Markdown image processing step
Before `doc create`, `doc update`, or `doc append` sends Markdown to SiYuan:
- parse the Markdown for image references (`![](...)`)
- resolve each source by type
- upload the binary content
- rewrite the Markdown image URL to the returned remote asset path

This should happen after Markdown content is loaded from `--content` or `--content-file`, but before the final document API call.

### 3. Keep behavior strict
If any image fails to resolve or upload:
- fail the whole document publish operation
- show a clear error identifying which image source failed

Do not silently skip failed images.

## Path Strategy
Upload to a predictable asset namespace such as:
- `/data/assets/cli-publish/2026-03-21/<generated-name>.png`

Generated filenames should include enough uniqueness to avoid collisions, such as timestamp + short hash.

## Markdown Rewrite Examples
- `![](./img/demo.png)` → `![](/data/assets/cli-publish/2026-03-21/demo-abc123.png)`
- `![](https://example.com/banner.png)` → `![](/data/assets/cli-publish/2026-03-21/banner-def456.png)`
- `![](data:image/png;base64,...)` → `![](/data/assets/cli-publish/2026-03-21/image-ghi789.png)`

## Validation Strategy
- Unit tests for Markdown rewrite behavior
- Unit tests for each source type: relative, absolute, URL, data URI
- Unit tests for failure paths
- Live verification for:
  - inline Markdown with local image
  - file-based Markdown with local image
  - remote readability through readback of rewritten asset paths

## Non-Goals
- Full Markdown parser with support for every possible extension syntax
- Automatic upload of non-image linked files
- Deduplicating identical images across documents in the first iteration
