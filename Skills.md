# Skills — Delta Thermal QA Framework

This document describes all Claude Code skills (slash commands) available in this repository. Skills are repeatable, documented workflows invoked with `/command-name` in a Claude Code session.

---

## How Skills Work

Skill definitions live in `.claude/commands/*.md`. Each file contains step-by-step instructions that Claude follows when you invoke the command. Skills load **on demand** — they are not in Claude's context every session, only when you invoke them.

To run a skill: type `/skill-name` in the Claude Code prompt, or include it in a session message:
```
/analyze-site
/generate-full-suite https://deltathermalinc.com
/run-smoke
```

---

## Available Skills

### `/analyze-site`

**File:** `.claude/commands/analyze-site.md`

**Purpose:** Crawl the live Delta Thermal website and produce an updated `site.config.json`.

**When to use:**
- First-time setup: `site.config.json` has empty `expectedNavItems` or missing metadata
- After a site redesign: nav structure or pages have changed
- Before generating a test suite: ensures selectors are based on real HTML

**What it does:**
1. Navigates to the URL in `site.config.json` (or a URL you provide)
2. Extracts page title, meta description, nav links, headings, CTAs, and forms
3. Checks `/contact`, `/contact-us`, `/get-in-touch` for contact forms
4. Assesses responsiveness and HTTPS
5. Outputs a completed `site.config.json` block
6. Reports any issues found (missing meta, broken links, no `<h1>`, etc.)

**Usage:**
```
/analyze-site
/analyze-site https://deltathermalinc.com
```

---

### `/generate-full-suite`

**File:** `.claude/commands/generate-full-suite.md`

**Purpose:** Analyze the live site and generate a complete Playwright test suite — page objects and spec files — based on what is discovered.

**When to use:**
- Initial setup of this repo for a new site
- After a major site redesign that invalidates existing selectors
- When adding comprehensive coverage for a previously untested section

**What it does:**
1. Runs `/analyze-site` to get current site structure
2. Identifies all discoverable pages, forms, and interactive elements
3. Creates or updates page object classes in `src/pages/`
4. Generates spec files for each test category that apply to this site
5. Runs `npx tsc --noEmit` to verify TypeScript compiles

**Usage:**
```
/generate-full-suite
```

---

### `/run-smoke`

**File:** `.claude/commands/run-smoke.md`

**Purpose:** Execute the smoke test suite and report results in a human-readable summary.

**When to use:**
- Quick sanity check before a PR review
- Verifying the site is up after a deployment
- First thing to run when investigating a reported issue

**What it does:**
1. Runs `npm run test:smoke`
2. Parses `test-results/results.json`
3. Reports: total tests, passed, failed, skipped, duration
4. Lists any failed tests with error details

**Usage:**
```
/run-smoke
```

---

### `/update-baseline`

**File:** `.claude/commands/update-baseline.md`

**Purpose:** Refresh all visual regression baseline screenshots after an intentional design change.

**When to use:**
- The site's visual design was intentionally updated
- Visual tests are failing because baselines are stale (not because of a bug)
- Adding visual regression coverage for a new page

**What it does:**
1. Runs `npm run baseline` (`playwright test --grep @visual --update-snapshots`)
2. Reports which snapshots were created or updated
3. Reminds you to review the diffs and commit the updated `__snapshots__/` files

**Usage:**
```
/update-baseline
```

> **Warning:** Always review the visual diffs before committing updated baselines. Updated snapshots that hide real regressions defeat the purpose of visual testing.

---

### `/generate-report`

**File:** `.claude/commands/generate-report.md`

**Purpose:** Parse the most recent Playwright test run and output a formatted summary report.

**When to use:**
- After running the full test suite (`npm test`)
- Preparing a status report for stakeholders
- Tracking pass/fail trends over time

**What it does:**
1. Reads `test-results/results.json`
2. Calculates totals: passed, failed, skipped, duration by suite
3. Lists all failures with test name, error message, and file location
4. Outputs a formatted markdown summary

**Usage:**
```
/generate-report
```

---

## Adding a New Skill

1. Create `.claude/commands/<skill-name>.md`
2. Write clear, step-by-step instructions in the body (Claude follows these)
3. Add an entry to this file with the command name, purpose, and usage
4. Reference the skill in `CLAUDE.md` under the Slash Commands table

**Naming conventions:**
- Use kebab-case for the filename: `my-skill.md`
- The command is `/my-skill` (matches filename without extension)
- Keep command names short and action-oriented: `/run-smoke` not `/execute-smoke-tests`

---

## Related

- [AGENTS.md](./AGENTS.md) — Subagents that skills may delegate to
- [CLAUDE.md](./CLAUDE.md) — Full Claude Code instructions for this repo
- `.claude/commands/` — Skill definition files
