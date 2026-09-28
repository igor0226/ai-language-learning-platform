# Project agent skills

**Source of truth** for skills used in this repo. Each skill is a directory with a `SKILL.md` (YAML frontmatter + instructions).

Tool discovery (symlinks, do not edit skill content here):

- `.cursor/skills/<name>` → `.agents/skills/<name>`
- `.claude/skills/<name>` → `.agents/skills/<name>`

When adding a skill, create it under `.agents/skills/<name>/`, then link both tool directories. Document usage in [`docs/README.md`](../../docs/README.md) if it is part of doc maintenance.
