# Tool Retrospective Article Design

**Goal:** Write and publish a reflective first-person article about building and hardening this SiYuan CLI tool, focusing on the real experience of turning a working prototype into something production-usable.

**Scope:** This design covers article drafting, title selection, Markdown composition, and publishing the article as a SiYuan document using the CLI itself. It does not involve changing product code unless publishing reveals a verified CLI publishing bug.

**Audience:** Primarily the user themself and technically curious readers who appreciate personal engineering reflections rather than a formal postmortem.

## Style Direction
- First-person voice
- Personal essay / reflective retrospective
- Technical details included, but in service of storytelling and insight
- Honest about confusion, wrong assumptions, repeated verification, and what “可用” really came to mean

## Recommended Structure
1. **Opening motivation**
   - Why this tool seemed small at first
   - Why building a CLI for SiYuan felt attractive
2. **Reality check**
   - The moment mocks and real APIs diverged
   - Empty responses, strings instead of objects, undocumented differences
3. **The turning point**
   - Realization that “能跑” ≠ “可用”
   - Why repeated real-environment verification became the center of the work
4. **What I learned**
   - Respect the transport contract
   - Put compatibility logic in the right layer
   - Let evidence drive fixes
   - Tooling quality is about trust
5. **Closing reflection**
   - What this tool changed in how I think about engineering
   - Why the emotional arc mattered as much as the technical one

## Publishing Plan
- Draft the full article in Markdown first
- Choose a clear title emphasizing reflection over promotion
- Publish via `doc create` using the CLI itself
- Verify publication with `doc get`

## Safety / Publishing Target
- Publish to the test notebook already used in live validation unless the user later specifies another notebook
- Use a distinct article path under a writing/reflection namespace, e.g. `/articles/tool-retrospective-20260321`

## Non-Goals
- No formal changelog style article
- No code tutorial step list unless needed briefly inside the reflection
- No direct README/documentation edits as part of this task
