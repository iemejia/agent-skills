# AGENTS.md

Instructions for AI coding agents working in this repository.

## Repository purpose

This repo is a personal collection of [Agent Skills](https://agentskills.io) located under `.agents/skills/`. Each subfolder is a self-contained skill with a `SKILL.md` entry point, an `LICENSE.md`, and optional `references/` and `scripts/` folders.

> [!IMPORTANT]
> For anything related to the skill format itself — frontmatter fields, folder layout, progressive disclosure, naming conventions, etc. — refer to the official spec at **<https://agentskills.io/>**. Fetch <https://agentskills.io/llms.txt> first to discover the full documentation index before diving deeper.

## Rules

### Keep `README.md` in sync with the skills

Whenever a skill is **added**, **renamed**, **removed**, or has its purpose changed, you must update the root `README.md` accordingly:

- Add, remove, or update the row in the **Skills** table (keep entries in alphabetical order by skill name).
- Update the `Skills-N` badge count in the header to reflect the current number of skills.
- If the skill changes what it does, refresh its one-liner description in the table (and any matching example in the **Usage** section if relevant).

### Every skill must have an MIT `LICENSE.md`

When adding or reviewing a skill, ensure that:

- The skill folder contains a `LICENSE.md` file with the **MIT License**, copyright `Yohan Lasorsa`, matching the root `LICENSE.md`.
- If a license file exists under a different name or extension (e.g. `LICENSE`, `LICENSE.txt`), rename it to `LICENSE.md` (use `git mv` to preserve history).
- The skill's `SKILL.md` frontmatter includes the line:
  ```yaml
  license: Complete terms in LICENSE.md
  ```

### Skill structure

A skill folder follows this layout:

```
.agents/skills/<skill-name>/
├── SKILL.md          # required — entry point with YAML frontmatter
├── LICENSE.md        # required — MIT, copyright Yohan Lasorsa
├── scripts/          # optional — executable helpers
├── references/       # optional — additional docs the skill can load
├── assets/           # optional — templates and other resources
└── ...               # any additional files or directories
```

The `SKILL.md` frontmatter must include at least `name` and `description` (per the [agentskills.io spec](https://agentskills.io/)), plus `license: Complete terms in LICENSE.md` for this repo.
