---
name: audit-agent-instructions
description: >-
  Audits AGENTS.md indexes and docs/*.md for duplication, drift, structural
  issues, gaps, and clarity against docs/README.md. Use when the user asks to
  audit agent instructions, review AGENTS.md, deduplicate agent docs, or check
  instruction drift.
disable-model-invocation: true
---

# Audit agent instructions

Review how well this repo’s agent instruction docs are written. **Do not implement fixes** unless the user explicitly asks after the audit.

## Policy source

Read [`docs/README.md`](../../../docs/README.md) first. Apply its **Layers**, **Canonical ownership**, and **Authoring rules** as the standard.

## Files to read

**Indexes (Cursor / Claude always-on where configured):**

- [`AGENTS.md`](../../../AGENTS.md)
- [`frontend/AGENTS.md`](../../../frontend/AGENTS.md)
- [`backend/AGENTS.md`](../../../backend/AGENTS.md)

**Catalog:**

- [`docs/README.md`](../../../docs/README.md)

**Topic docs:** every `docs/*.md` except treat `docs/README.md` as catalog (already read). Discover the list from the repo; do not skip files.

**Optional overlap check (human onboarding, not agent indexes):**

- [`README.md`](../../../README.md)
- [`frontend/README.md`](../../../frontend/README.md)
- [`backend/README.md`](../../../backend/README.md)

**Other sources:** search the repo for additional instruction surfaces (e.g. `.cursor/rules`, other `AGENTS.md`, copilot instruction files) and include them if they affect agents.

## Audit tasks

1. **Duplication** — Facts, rules, or procedures stated fully in more than one place. For each, name the canonical owner from `docs/README.md` and recommend a one-sentence pointer + link elsewhere.

2. **Drift** — Contradictions between docs (skill status, Compose services, auth routes, env vars, API behavior). Spot-check the codebase when the mismatch is easy to verify from module names or routes.

3. **Structure** — Thin `AGENTS.md` indexes vs topic docs doing index work; orphan `docs/*.md` missing from root **Read next** or the catalog topic list; indexes over ~80 lines or how-to blocks in indexes.

4. **Gaps** — Important behavior only in code or human READMEs, missing from the agent doc set.

5. **Clarity** — Rules agents could misread or that lack a canonical home in the ownership table.

## Output format

### Summary

2–4 sentences on overall health.

### Findings

For each issue (severity: **high** / **medium** / **low**):

- **Issue:** …
- **Locations:** paths
- **Recommendation:** concrete edit (prefer link + trim over rewrite)

### Suggested plan (optional)

If many issues, up to 5 ordered steps aligned with `docs/README.md` ownership. No implementation unless requested.
