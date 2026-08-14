# Agents — Delta Thermal QA Framework

This document describes all Claude Code subagents available in this repository. Subagents are specialized AI assistants that run in their own context windows with defined tool access and system prompts.

Claude Code reads **CLAUDE.md**, not this file. This file documents agents for human contributors and compatible AI tools. See [CLAUDE.md](./CLAUDE.md) for Claude-specific instructions.

---

## How Agents Work

Subagent definitions live in `.claude/agents/*.md`. Each file contains:

- **Frontmatter** — `name`, `description`, optional `model` and `tools`
- **System prompt** — detailed instructions for what the agent does and how

Claude reads each agent's `description` to decide when to delegate a task. You do not invoke agents directly; describe what you want and Claude routes accordingly.

---

## Available Agents

### `site-analyzer`

**File:** `.claude/agents/site-analyzer.md`

**Purpose:** Crawls a live website to discover its structure and produces a fully-populated `site.config.json`.

**Invoke when:**
- Onboarding this repo for the first time (config is empty/incomplete)
- The site has been redesigned and `expectedNavItems` or other fields need updating
- Running `/analyze-site` (the skill calls this agent internally)

**What it does:**
1. Issues a HEAD request to resolve the canonical URL (follows redirects)
2. Navigates to the site with `waitUntil: networkidle`
3. Dismisses cookie/consent banners before inspecting DOM
4. Extracts all `nav a[href]` elements for `expectedNavItems`
5. Detects contact forms (email fields, action URLs)
6. Infers industry from page copy
7. Checks for HTTPS, auth redirects, and animation-heavy pages
8. Outputs a valid `site.config.json` and an issues checklist

**Example prompts:**
```
"Analyze the Delta Thermal site and update site.config.json"
"Re-run the site analysis — I think the nav has changed"
"Check whether deltathermalinc.com is auth-gated"
```

---

### `test-generator`

**File:** `.claude/agents/test-generator.md`

**Purpose:** Generates site-specific Playwright TypeScript test files for features not covered by the shared test suites.

**Invoke when:**
- A site has unique interactive elements (product calculators, video embeds, accordion FAQs)
- A specific page (e.g., `/products`, `/technology`) needs dedicated test coverage
- Writing a regression test for a recently discovered bug
- The shared tests pass but a page-specific flow needs verification

**What it does:**
1. Reads `site.config.json` to understand site structure
2. Identifies gaps: pages in `expectedNavItems` without test coverage
3. Adds locators/methods to page objects in `src/pages/` as needed
4. Generates typed spec files in `tests/custom/<scenario-name>.spec.ts`
5. Tags all tests with `@custom` plus the relevant category tag

**Output:** TypeScript spec files that follow POM conventions, use `@fixtures/site.fixture`, and include a JSDoc header explaining what is tested and why.

**Example prompts:**
```
"Generate tests for the Products page on Delta Thermal"
"Write a regression test for the mobile navigation toggle"
"Add test coverage for the technology showcase section"
```

---

## Adding a New Agent

1. Create `.claude/agents/<agent-name>.md`
2. Add required frontmatter at the top:

```yaml
---
name: <kebab-case-name>
description: >
  Use this agent when... (be specific — Claude reads this to decide when to delegate)
tools:
  - Read
  - Write
  - Edit
  # list only the tools this agent needs
---
```

3. Write the agent's system prompt in the body (markdown)
4. Add an entry to this file documenting when to use it
5. Reference the agent in `CLAUDE.md` under the Slash Commands section if it backs a skill

---

## Agent Tool Access

Each agent is restricted to only the tools it needs:

| Agent | Tools |
|-------|-------|
| `site-analyzer` | `Read`, `Write`, `WebFetch`, `Bash` |
| `test-generator` | `Read`, `Write`, `Edit`, `Glob`, `Grep` |

Tool restrictions are declared in the agent's frontmatter and enforced by Claude Code.

---

## Related

- [Skills.md](./Skills.md) — Slash command skills that invoke agents
- [CLAUDE.md](./CLAUDE.md) — Full Claude Code instructions for this repo
- `.claude/agents/` — Agent definition files
