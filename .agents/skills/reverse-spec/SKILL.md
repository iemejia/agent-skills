---
name: reverse-spec
description: Reverse-engineer an existing codebase into an extremely detailed SPEC.md that is sufficient for another agent to rebuild a closely matching working application. Use when the user asks to generate a full spec, PRD, architecture blueprint, implementation plan, acceptance criteria, edge cases, design/writing style guide, or a reconstruction-ready technical specification from existing code.
license: Complete terms in LICENSE.md
---

# Reverse Spec

Produce a reconstruction-grade `SPEC.md` from an existing codebase.

Primary objective: create a specification detailed enough that another agent can rebuild a functionally equivalent application with minimal guesswork.

## Output Contract

Always create or update a single file named `SPEC.md` at the repository root.

The output must be:

1. Evidence-based: derive claims from source code, tests, config, docs, scripts, and observed runtime behavior.
2. Reconstruction-oriented: specify what to build, how it behaves, and how to verify parity.
3. Testable: include explicit checks and acceptance criteria.
4. Complete: cover product, architecture, data, workflows, edge cases, style, and operations.

If information is unknown, do not invent details. Mark clearly as `Unknown` with a concrete plan to verify.

## Execution Workflow

### 1. Scope and Inventory

Build a complete inventory of the system:

- Entry points and startup flow
- Major modules and boundaries
- User-visible capabilities
- Storage, state, and data flow
- Integrations and external dependencies
- Build/test/release/deploy commands
- Configuration and environment variables

Use code search and tests aggressively. Tests often encode behavior not documented elsewhere.

### 2. Behavioral Extraction

For each feature, document:

- Trigger/input
- Preconditions
- Main flow
- Alternate flows
- Error flows
- Side effects
- Observable outputs

Prefer behavioral statements over implementation trivia.

### 3. Architecture and Contracts

Extract explicit contracts:

- Module responsibilities
- Public interfaces and function contracts
- Message/event schemas
- API request/response shapes
- Persistence schemas and invariants
- Cross-module call flows

### 4. Reconstruction Blueprint

Translate findings into build instructions:

- Ordered implementation phases
- Dependency graph between components
- Minimal viable scaffold then parity increments
- Validation gates per phase

### 5. Completeness Review

Before finalizing `SPEC.md`, run a gap check:

- Can a new agent rebuild without opening the original code?
- Are all critical workflows specified end-to-end?
- Are acceptance checks explicit and executable?
- Are edge cases and failure modes covered?

If not, expand the missing sections.

## Required SPEC.md Structure

Use this exact top-level structure:

1. `# Product Specification`
2. `## 1. Purpose and Scope`
3. `## 2. Product Definition (PRD)`
4. `## 3. Users, Actors, and Use Cases`
5. `## 4. Functional Requirements`
6. `## 5. Non-Functional Requirements`
7. `## 6. System Architecture`
8. `## 7. Data Model and State`
9. `## 8. Interfaces and Integrations`
10. `## 9. Core Workflows`
11. `## 10. Edge Cases and Failure Handling`
12. `## 11. Security, Privacy, and Safety`
13. `## 12. UX, Content, and Writing Style`
14. `## 13. Build, Run, and Operations`
15. `## 14. Testing and Verification`
16. `## 15. Reimplementation Plan`
17. `## 16. Traceability Matrix`
18. `## 17. Open Questions and Unknowns`

Do not omit sections. Use `Unknown` where necessary.

## Section Rules

### 2. Product Definition (PRD)

Include:

- Problem statement
- Goals and non-goals
- Success metrics
- Constraints
- Release boundaries (must-have vs nice-to-have)

### 4. Functional Requirements

List requirements as IDs: `FR-001`, `FR-002`, etc.

Each `FR-*` must include:

- Requirement statement
- Rationale
- Inputs and outputs
- Preconditions
- Postconditions
- Deterministic acceptance checks

### 5. Non-Functional Requirements

List as `NFR-*` with measurable targets where possible:

- Performance
- Reliability
- Maintainability
- Observability
- Accessibility (if UI)
- Portability

### 6. System Architecture

Provide:

- Component map with responsibilities
- Runtime topology
- Startup and shutdown sequences
- Data and control flow
- Key design decisions and trade-offs

### 7. Data Model and State

Document:

- Persistent entities and fields
- Relationships
- Constraints and invariants
- State machines and status transitions
- Migration/versioning concerns

### 8. Interfaces and Integrations

For each interface:

- Protocol/transport
- Request and response schema
- Error schema
- Retry/idempotency behavior
- Authentication/authorization model
- Timeouts and rate limits

### 9. Core Workflows

Describe each workflow as:

- Trigger
- Step-by-step sequence
- Decision points
- Failure branches
- Completion criteria

### 10. Edge Cases and Failure Handling

Catalog failure modes with mitigation:

- Invalid input
- Missing dependencies
- Network or service outages
- Data corruption or partial failure
- Concurrency races
- Recovery behavior

### 12. UX, Content, and Writing Style

If UI exists, define:

- Information architecture
- Navigation and layout behavior
- Visual system tokens (color, typography, spacing)
- Interaction and feedback states
- Empty/loading/error states

If textual outputs exist, define:

- Voice and tone
- Message structure
- Formatting conventions
- Forbidden wording/patterns

### 14. Testing and Verification

Define a parity test plan:

- Unit, integration, and end-to-end checks
- Golden-path scenarios
- Regression suite
- Deterministic pass/fail criteria
- Manual verification checklist for hard-to-automate behavior

### 15. Reimplementation Plan

Provide an ordered build plan with milestones:

- Phase goal
- Deliverables
- Dependencies
- Validation checks
- Exit criteria

### 16. Traceability Matrix

Map each requirement to evidence and tests:

- Requirement ID
- Source evidence (files/tests/docs)
- Verification method
- Risk if incorrect

## Quality Bar

`SPEC.md` must be:

- Specific over generic
- Declarative over ambiguous
- Verifiable over descriptive
- Complete enough to drive implementation without code access

When detail is uncertain, include:

- `Assumption`
- `Risk`
- `How to verify`

## Guardrails

- Do not expose secrets or credentials.
- Do not include irrelevant implementation noise.
- Do not claim parity if key behavior is undocumented.
- Do not stop at architecture summary; include concrete behavior and checks.

## Done Criteria

The skill is complete only when `SPEC.md` enables another agent to:

1. Recreate core architecture and module boundaries.
2. Reproduce all primary workflows and failure behaviors.
3. Implement interfaces and data model with matching constraints.
4. Validate parity through explicit tests/checklists included in the spec.
