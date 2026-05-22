<div align="center">

# 🧠 agent-skills

*A curated collection of personal [Agent Skills](https://agentskills.io) I use in my daily workflows.*

[![skills.sh](https://skills.sh/b/sinedied/agent-skills)](https://skills.sh/sinedied/agent-skills)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)](LICENSE.md)
![Skills](https://img.shields.io/badge/Skills-8-blue?style=flat-square)

⭐ If you find these skills useful, star the repo on GitHub — it helps a lot!

[Skills](#skills) • [Installation](#installation) • [Usage](#usage)

</div>

This repository hosts a set of reusable skills for AI coding agents (Claude Code, Codex, GitHub Copilot CLI, Cursor, OpenCode, and many others). Each skill packages procedural knowledge, references, and sometimes scripts to help an agent perform a specific task reliably and consistently.

> [!TIP]
> New to agent skills? Read the [agentskills.io documentation](https://agentskills.io/home) for an overview of what they are and how they plug into your agent of choice.

## Skills

| Skill | Description |
|---|---|
| [`agent-friendly-tui`](.agents/skills/agent-friendly-tui/SKILL.md) | 10 rules for designing terminal UIs and CLIs that are pleasant for AI agents to use. |
| [`copilot-sdk-nodejs`](.agents/skills/copilot-sdk-nodejs/SKILL.md) | Build Node.js/TypeScript apps with the GitHub Copilot SDK (`@github/copilot-sdk`). |
| [`image-gen`](.agents/skills/image-gen/SKILL.md) | Generate and edit images using OpenAI-compatible image APIs (gpt-image family). |
| [`public-tunnel`](.agents/skills/public-tunnel/SKILL.md) | Expose a local port through a temporary public tunnel for demos or sharing. |
| [`readme`](.agents/skills/readme/SKILL.md) | Create or update a polished `README.md` for any project. |
| [`reverse-spec`](.agents/skills/reverse-spec/SKILL.md) | Reverse-engineer an existing codebase into a detailed `SPEC.md` for re-implementation. |
| [`telegram-send`](.agents/skills/telegram-send/SKILL.md) | Send messages (and media) to yourself via a Telegram bot from any agent workflow. |

## Installation

These skills are designed to be installed with the [`skills`](https://github.com/vercel-labs/skills) CLI, which works with [50+ agents](https://github.com/vercel-labs/skills#supported-agents) including Claude Code, Codex, GitHub Copilot CLI, Cursor, and OpenCode.

### Install everything

Install all skills from this repository into the current project:

```bash
npx skills add sinedied/agent-skills
```

Or install them globally (available across all your projects):

```bash
npx skills add sinedied/agent-skills -g
```

### Install a single skill

Pick only the ones you need:

```bash
npx skills add sinedied/agent-skills --skill readme
npx skills add sinedied/agent-skills --skill image-gen --skill telegram-send
```

### Browse before installing

```bash
npx skills add sinedied/agent-skills --list
```

> [!NOTE]
> The `skills` CLI installs skills into the convention expected by each target agent (e.g. `.claude/skills/` for Claude Code, `~/.copilot/skills/` for Copilot CLI). See the [CLI README](https://github.com/vercel-labs/skills#installation-scope) for the full list of locations.

## Usage

Once installed, your agent will automatically discover the skills and trigger them when the conversation matches a skill's `description`. You don't need to invoke them manually — just describe what you want and the agent will pick the right skill.

A few examples:

- *"Write a README for this repo"* → triggers [`readme`](.agents/skills/readme/SKILL.md)
- *"Generate a hero image for the landing page"* → triggers [`image-gen`](.agents/skills/image-gen/SKILL.md)
- *"Expose port 3000 publicly so I can demo this"* → triggers [`public-tunnel`](.agents/skills/public-tunnel/SKILL.md)
- *"Reverse-engineer this project into a spec"* → triggers [`reverse-spec`](.agents/skills/reverse-spec/SKILL.md)

> [!TIP]
> Most coding agents also support invoking skills with slash commands (e.g. `/readme`, `/image-gen`, etc.)

## License

All skills in this repository are licensed under the [MIT License](LICENSE.md).
