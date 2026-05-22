---
name: agent-friendly-tui
description: 10 rules for building agent-friendly terminal UIs and CLIs. Use whenever designing, building, refactoring, or reviewing a command-line tool, terminal UI, TUI, REPL, shell utility, or MCP wrapper that will be invoked by AI agents (in addition to humans). Triggers on requests involving CLI design, command flags, exit codes, output formatting, prompts, JSON output, help text, async jobs, or making a tool "agent-friendly".
license: Complete terms in LICENSE.md
---

# Agent-Friendly Terminal UIs — 10 Rules

When building or reviewing a terminal UI or CLI, apply the 10 rules below. They come from Trevin Chow's "10 Principles for Agent-Native CLIs" (May 2026), informed by Cloudflare's and HeyGen's CLI work.

Design for agents first; humans benefit. The classic Unix CLIs assume a human at a TTY with agents as a tolerated secondary audience. That default is no longer right.

For full prose, rationale, and the original examples, read [references/agent-native-cli-principles.md](references/agent-native-cli-principles.md).

## Tier 1 — Don't break the agent

Get these right or every invocation pays in tokens, retries, and silent failures.

### Rule 1 — Non-interactive by default

Every command must run to completion without an interactive prompt when invoked by an agent. Silent hangs on stdin are the worst failure mode.

- Detect TTY honestly; treat non-TTY as headless.
- Provide `--force` (destructive bypass) and `--yes` (confirmation bypass) consistently. Do not invent `--skip-confirmations`.
- Take structured input via flags or files; never via menu prompts in non-interactive mode.

```bash
# BAD — hangs forever
$ mycli post delete post_8f2a < /dev/null
Are you sure? [y/N]: ^C

# GOOD — explicit bypass
$ mycli post delete post_8f2a --force
{"deleted":"post_8f2a"}
```

### Rule 2 — Structured, parseable output

Tables with ANSI colors are for humans. Agents need JSON.

- Add `--json` to every data-returning command. Use exactly `--json` (not `--format=json`, not `--output json`).
- Data → stdout. Diagnostics → stderr. Never mix them.
- Exit code `0` on success, non-zero on failure with a stable taxonomy.
- Suppress ANSI/colors when stdout is not a terminal.

```bash
$ mycli post list --json | jq '.posts[0].id'
"post_8f2a"

$ mycli post get post_missing --json; echo $?
4   # stderr: "error: post not found: post_missing"
```

### Rule 3 — Errors that teach, and enumerate

Errors are the highest-signal context an agent sees. Make every error self-correcting.

- Validate early, before side effects.
- Name the valid set when rejecting enum input.
- Include a working invocation example, not a stack trace.

```bash
# BAD
error: invalid visibility

# GOOD
error: --visibility must be one of: public, private, unlisted (got: "secret")
```

### Rule 4 — Safe retries and explicit mutation boundaries

Agents retry blindly. Humans notice duplicates; agents don't.

- Make `create` idempotent via natural keys or idempotency tokens. A repeated `create` returns the existing resource with `"existing": true`.
- Require an explicit flag (`--force`) for destructive ops; provide `--dry-run`.
- Return identifiers on every mutation so the agent can reference them next call.
- For async work, idempotency must span the whole submit-poll-collect arc (see Rule 8).

```bash
$ mycli post create --json --content="hello"
{"id":"post_8f2a","existing":false}
$ mycli post create --json --content="hello"
{"id":"post_8f2a","existing":true}

$ mycli post delete post_8f2a --dry-run
{"would_delete":"post_8f2a","status":"dry_run"}
```

### Rule 5 — Bounded responses, at every layer

Tokens cost money and context. Default narrow; let the agent widen.

- Pagination, `--limit`, and `--filter` on every list-style command.
- Truncation messages must teach the agent how to narrow:
  `{"truncated":true,"hint":"add --limit=N or --filter=author:..."}`
- Offer concise vs. detailed modes. Summary before detail.
- For MCP wrappers: budget each tool description (target: fits in a tweet). Audit at build time.

```bash
$ mycli post list --json
{"posts":[...20 items...],"truncated":true,"hint":"add --filter=..."}

$ mycli post list --json --cursor=abc123
{"posts":[...],"next":null}
```

## Tier 2 — Empower the agent

These compound: the CLI gets more useful the more agents use it.

### Rule 6 — Cross-CLI vocabulary consistency

Agents build a generalized model of what CLIs do, drawn from every CLI they've seen. Off-convention names succeed slowly, after wasted `--help` reads.

Use the dominant community vocabulary. Cloudflare's enforced rules:

- Always `get`, never `info`
- Always `list`, never `ls`
- Always `--force`, never `--skip-confirmations`
- Always `--json`, never `--format=json`
- Verbs: `get`, `list`, `create`, `update`, `delete`
- Flags: `--yes` (skip prompt), `--limit` (pagination), `--profile`, `--dry-run`, `--wait`

Enforce mechanically (codegen, schema, lint in CI). Manual review is Swiss cheese.

### Rule 7 — Three-layer introspection

Each layer answers a different question:

1. **`--help`** — human-shaped text. Top-level lists commands; subcommand shows usage.
2. **`<cli> agent-context`** — versioned, machine-readable JSON describing the full surface (commands, flags, types, enums, profiles). Include `schema_version` so consuming agents can detect breaking changes.
3. **Skill manifest** (e.g. `SKILL.md` shipped alongside the CLI) — long-form prose teaching the agent how to compose operations into workflows.

All three must be generated from one source and stay in sync with the implementation.

```bash
$ mycli agent-context | jq '.schema_version, (.commands | keys)'
"1"
["account","feedback","jobs","post","profile"]
```

### Rule 8 — Async-aware execution

Async APIs that return a job ID and stop force the agent to write a fragile poll loop. The fix is `--wait` plus a persistent job ledger.

- `--wait` on every command that wraps an async API. The CLI runs the poll loop (exponential backoff + jitter) and blocks until completion.
- Persist job state to a local ledger (e.g. `~/.<cli>/jobs.jsonl`).
- Expose the ledger via a `jobs` parent command: `jobs list`, `jobs get <id>`, `jobs prune`.
- If `--wait` is killed mid-poll, the next invocation must find the in-flight job, not start a new one.

```bash
# BAD — agent has to write a poll loop
$ mycli video render --script=story.txt
{"job_id":"job_8f2a","status":"queued"}

# GOOD — one command, no polling logic
$ mycli video render --script=story.txt --wait
{"job_id":"job_8f2a","status":"complete","url":"https://.../out.mp4"}
```

### Rule 9 — Persistent identity through profiles

Agents return tomorrow, next week, in a different shell, with the same intent. Stateless CLIs force re-specifying eight flags every time.

- Provide `profile save|use|list|show|delete` subcommands.
- `--profile <name>` as a persistent root flag.
- Precedence: explicit flag > env var > profile > default.
- Surface available profile names in `agent-context` so agents discover identities without parsing a config file.
- Stable storage: `~/.<cli>/profiles.json`.

```bash
$ mycli profile save my-podcast --voice=warm-en --webhook=https://...
$ mycli video create --profile=my-podcast --script=ep_42.txt
{"job_id":"job_8f2a","using_profile":"my-podcast"}
```

### Rule 10 — Two-way I/O

stdin/stdout pipelining is still required, but add two more channels:

**`--deliver` — route artifacts where the agent needs them:**
- `stdout` (default for small data)
- `file:<path>` (atomic write)
- `webhook:<url>` (POST, surface HTTP status)
- Unknown schemes → structured refusal naming what's supported.

**`feedback` — agent reports friction back:**
- `<cli> feedback "..."` writes to local JSONL by default.
- With `MYCLI_FEEDBACK_ENDPOINT` configured, also POSTs upstream.
- Surface both `--deliver` schemes and the feedback channel in `agent-context`.

```bash
$ mycli video create --script=story.txt --deliver=file:./out.mp4
{"delivered_to":"file:./out.mp4","bytes":4823091}

$ mycli feedback "the --tier flag rejects 'enterprise' but the docs list it as valid"
feedback recorded locally (1 entry)
```

## How to apply this skill

When asked to design, build, refactor, or review a CLI/TUI:

1. **Audit against Tier 1 first.** Any Tier 1 gap is a blocker — fix it before adding features.
2. **Then audit Tier 2.** These are compounding wins, hard to retrofit by hand.
3. **Recommend mechanical enforcement.** Most of Tier 2 (vocabulary, introspection, async, profiles, delivery) drifts when written by hand. Push it into a schema, codegen, or template that emits every command consistently.
4. **For each gap, classify it:**
   - **Blocker** — the agent fails or hangs (e.g. no `--json`, prompt with no bypass).
   - **Friction** — the agent succeeds slowly, after extra retries (e.g. inconsistent flag names).
   - **Optimization target** — what good looks like (the third bullet under each rule in the source).
5. **Cite the rule number** when flagging an issue (e.g. "Rule 2: this command emits JSON to stderr — diagnostics belong on stderr, data on stdout").

When proposing a CLI from scratch, design the schema first (commands, flags, types, enums, profiles, delivery sinks), then generate `--help`, `agent-context`, the SKILL manifest, and the implementation skeleton from it. Don't write the surface by hand.
