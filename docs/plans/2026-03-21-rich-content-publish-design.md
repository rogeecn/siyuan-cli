# Rich Content Publish Test Design

**Goal:** Verify two publication paths for image-containing content using the CLI: inline Markdown content publication and publication from a specified Markdown file.

**Scope:** This design tests the CLI’s ability to publish Markdown documents that include image references. It does not assume the CLI currently uploads or rewrites image assets automatically unless the live behavior proves that capability exists.

**Image Strategy:** Use a locally generated test image so the publication workflow is deterministic and does not depend on external URLs or unavailable repository assets.

## Publication Paths

### 1. Inline rich-content publication
- Create a test image locally.
- Compose a Markdown string containing:
  - title
  - short body text
  - image Markdown reference
- Publish via `doc create --content`.
- Read back the document and confirm the Markdown was stored correctly.

### 2. Markdown-file publication with image reference
- Create a local Markdown file.
- Reference the same local test image from within the Markdown.
- Publish via `doc create --content-file`.
- Read back the document and confirm the Markdown content was stored correctly.

## Verification Focus
- CLI can publish Markdown containing image syntax
- `doc create --content` path works with rich text
- `doc create --content-file` path works with a local file containing image Markdown
- Readback contains the title, body text, and image reference

## Non-Goals
- No assumption that image files are imported into SiYuan assets automatically
- No implementation of asset upload/rewrite logic unless a verified product gap is found during this test
- No code changes unless live publication reveals a concrete CLI bug
